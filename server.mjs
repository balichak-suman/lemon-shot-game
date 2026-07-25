import { createServer } from 'http';
import { parse } from 'url';
import next from 'next';
import { Server as SocketIOServer } from 'socket.io';

const dev = process.env.NODE_ENV !== 'production';
const hostname = process.env.HOST || '0.0.0.0';
const port = parseInt(process.env.PORT || '3000', 10);

const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

// In-Memory Room Data Store
const rooms = new Map();

// Helper questions preset
const REUNION_QUESTIONS = [
  {
    id: 'mlt-1',
    type: 'MOST_LIKELY_TO',
    prompt: 'Who is most likely to get lost on their way to their own reunion?',
    category: 'Spicy Nostalgia',
    timerSeconds: 120,
    penaltyShots: 1,
  },
  {
    id: 'mlt-2',
    type: 'MOST_LIKELY_TO',
    prompt: 'Who has changed the MOST since college / school days?',
    category: 'College Memories',
    timerSeconds: 120,
    penaltyShots: 1,
  },
  {
    id: 'mlt-3',
    type: 'MOST_LIKELY_TO',
    prompt: 'Who is most likely to fall asleep first at tonight’s after-party?',
    category: 'Party Wildcard',
    timerSeconds: 120,
    penaltyShots: 1,
  },
  {
    id: 'hl-1',
    type: 'HOT_LEMON',
    prompt: 'Quick! Name a song that was popular the year you all graduated!',
    category: 'Hot Potato',
    options: ['Song Ready! Pass Lemon!', 'Stumped... Take Shot!'],
    timerSeconds: 15,
    penaltyShots: 1,
  },
  {
    id: 'td-1',
    type: 'TRUTH_DARE',
    prompt: 'DARE: Text your partner or crush right now: "The lemon made me do it 🍋" or take 2 shots!',
    category: 'Party Wildcard',
    timerSeconds: 25,
    penaltyShots: 2,
  },
  {
    id: 'td-2',
    type: 'TRUTH_DARE',
    prompt: 'TRUTH: What was your most awkward or embarrassing moment from back in the day?',
    category: 'Reunion Secret',
    timerSeconds: 25,
    penaltyShots: 1,
  },
];

function generateCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 4; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  if (rooms.has(code)) return generateCode();
  return code;
}

app.prepare().then(() => {
  const httpServer = createServer((req, res) => {
    const parsedUrl = parse(req.url, true);
    handle(req, res, parsedUrl);
  });

  const io = new SocketIOServer(httpServer, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST'],
    },
  });

  // Active timers map: roomCode -> Timeout/Interval
  const roomTimers = new Map();

  function startRoundTimer(roomCode) {
    if (roomTimers.has(roomCode)) {
      clearInterval(roomTimers.get(roomCode));
    }

    const room = rooms.get(roomCode);
    if (!room || !room.activeRound) return;

    let secondsRemaining = room.activeRound.question.timerSeconds;
    
    io.to(roomCode).emit('timer_tick', { secondsRemaining, roundNumber: room.activeRound.roundNumber });

    const interval = setInterval(() => {
      secondsRemaining -= 1;
      io.to(roomCode).emit('timer_tick', { secondsRemaining, roundNumber: room.activeRound.roundNumber });
      io.to(roomCode).emit('timer_update', { secondsRemaining, roundNumber: room.activeRound.roundNumber });

      if (secondsRemaining <= 0) {
        clearInterval(interval);
        roomTimers.delete(roomCode);
        resolveRound(roomCode);
      }
    }, 1000);

    roomTimers.set(roomCode, interval);
  }

  function resolveRound(roomCode) {
    const room = rooms.get(roomCode);
    if (!room || !room.activeRound) return;

    const round = room.activeRound;
    round.phase = 'RESULT';

    if (round.type === 'MOST_LIKELY_TO') {
      const voteCounts = {};
      Object.values(round.votes).forEach((targetIds) => {
        const idList = Array.isArray(targetIds) ? targetIds : [targetIds];
        idList.forEach((id) => {
          voteCounts[id] = (voteCounts[id] || 0) + 1;
        });
      });

      let maxVotes = -1;
      let loserId = '';
      Object.entries(voteCounts).forEach(([playerId, count]) => {
        if (count > maxVotes) {
          maxVotes = count;
          loserId = playerId;
        }
      });

      if (!loserId) {
        const playerIds = Object.keys(room.players);
        loserId = playerIds[Math.floor(Math.random() * playerIds.length)];
      }

      round.loserPlayerId = loserId;
      round.shotsAssigned = round.question.penaltyShots;

      if (room.players[loserId] && !round.skippedBy) {
        room.players[loserId].shotsTaken += round.question.penaltyShots;
      }
    } else if (round.type === 'HOT_LEMON' && round.hotLemon) {
      const loserId = round.hotLemon.currentHolderId;
      round.loserPlayerId = loserId;
      round.shotsAssigned = round.question.penaltyShots;
      if (room.players[loserId] && !round.skippedBy) {
        room.players[loserId].shotsTaken += round.question.penaltyShots;
      }
    } else if (round.type === 'TRUTH_DARE') {
      const playerIds = Object.keys(room.players);
      const loserId = playerIds[Math.floor(Math.random() * playerIds.length)];
      round.loserPlayerId = loserId;
      round.shotsAssigned = round.question.penaltyShots;
      if (room.players[loserId] && !round.skippedBy) {
        room.players[loserId].shotsTaken += round.question.penaltyShots;
      }
    }

    const winnerPlayer = round.loserPlayerId ? room.players[round.loserPlayerId] : null;

    // Emit all requested event aliases
    io.to(roomCode).emit('voting_finished', { room, activeRound: round });
    io.to(roomCode).emit('winner_announced', { winnerPlayer, activeRound: round });
    io.to(roomCode).emit('round_ended', round);
    io.to(roomCode).emit('room_updated', room);
  }

  function startRound(room, roundIndex) {
    const question = room.rounds[roundIndex % room.rounds.length];
    const playerList = Object.values(room.players);
    const initialHolder = playerList.length > 0 ? playerList[Math.floor(Math.random() * playerList.length)].id : room.hostId;

    const activeRound = {
      roundNumber: roundIndex + 1,
      totalRounds: room.rounds.length,
      type: question.type,
      question,
      phase: 'ACTION',
      votes: {},
      hotLemon: question.type === 'HOT_LEMON' ? {
        currentHolderId: initialHolder,
        timerMsRemaining: question.timerSeconds * 1000,
        explodeTime: Date.now() + (question.timerSeconds * 1000),
        passCount: 0,
      } : undefined,
    };

    room.activeRound = activeRound;
    room.phase = 'PLAYING';
    io.to(room.code).emit('round_started', activeRound);
    io.to(room.code).emit('room_updated', room);

    startRoundTimer(room.code);
  }

  io.on('connection', (socket) => {
    // Create Room
    socket.on('create_room', ({ hostName, avatar }) => {
      const code = generateCode();
      const hostPlayer = {
        id: socket.id,
        name: hostName || 'Party Host',
        avatar: avatar || 'lemon-king',
        isHost: true,
        isReady: true,
        shotsTaken: 0,
        skipsRemaining: 3,
        score: 0,
        joinedAt: Date.now(),
      };

      const room = {
        code,
        hostId: socket.id,
        players: { [socket.id]: hostPlayer },
        phase: 'LOBBY',
        currentRoundIndex: 0,
        rounds: [...REUNION_QUESTIONS],
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      rooms.set(code, room);
      socket.join(code);

      socket.emit('room_created', { roomCode: code, room });
      io.to(code).emit('room_updated', room);
    });

    // Join Room
    socket.on('join_room', ({ roomCode, name, avatar }) => {
      const cleanCode = (roomCode || '').trim().toUpperCase();
      const room = rooms.get(cleanCode);

      if (!room) {
        return socket.emit('error_message', 'Room not found! Check the room code.');
      }

      // Check if player with same name already exists (Reconnect handling)
      let existingPlayer = Object.values(room.players).find(
        (p) => p.name.toLowerCase() === (name || '').trim().toLowerCase()
      );

      let player;
      if (existingPlayer) {
        // Re-assign socket ID for reconnected player
        delete room.players[existingPlayer.id];
        existingPlayer.id = socket.id;
        player = existingPlayer;
        room.players[socket.id] = player;
      } else {
        player = {
          id: socket.id,
          name: (name || '').trim() || `Party Lemon ${Object.keys(room.players).length + 1}`,
          avatar: avatar || 'lemon-happy',
          isHost: false,
          isReady: false,
          shotsTaken: 0,
          skipsRemaining: 3,
          score: 0,
          joinedAt: Date.now(),
        };
        room.players[socket.id] = player;
      }

      socket.join(cleanCode);

      socket.emit('room_joined', { player, room });
      io.to(cleanCode).emit('player_joined', { player, room });
      io.to(cleanCode).emit('player_connected', { player, room });
      io.to(cleanCode).emit('room_updated', room);
    });

    // Player Ready toggle
    socket.on('player_ready', ({ roomCode, isReady }) => {
      const room = rooms.get(roomCode);
      if (room && room.players[socket.id]) {
        room.players[socket.id].isReady = isReady;
        io.to(roomCode).emit('room_updated', room);
      }
    });

    // Start Game & Start Voting
    socket.on('start_game', ({ roomCode }) => {
      const room = rooms.get(roomCode);
      if (!room) return;

      room.currentRoundIndex = 0;
      startRound(room, 0);
    });

    socket.on('start_voting', ({ roomCode }) => {
      const room = rooms.get(roomCode);
      if (!room) return;

      room.currentRoundIndex = 0;
      startRound(room, 0);
    });

    // Submit Vote
    socket.on('submit_vote', ({ roomCode, targetPlayerIds }) => {
      const room = rooms.get(roomCode);
      if (!room || !room.activeRound) return;

      const ids = Array.isArray(targetPlayerIds) ? targetPlayerIds : [targetPlayerIds];
      room.activeRound.votes[socket.id] = ids;
      io.to(roomCode).emit('room_updated', room);

      // Check if all players have voted
      const totalPlayers = Object.keys(room.players).length;
      const totalVotes = Object.keys(room.activeRound.votes).length;

      if (totalVotes >= totalPlayers) {
        if (roomTimers.has(roomCode)) {
          clearInterval(roomTimers.get(roomCode));
          roomTimers.delete(roomCode);
        }
        resolveRound(roomCode);
      }
    });

    // Use Skip Token
    socket.on('use_skip', ({ roomCode, targetPlayerId }) => {
      const room = rooms.get(roomCode);
      if (!room || !room.activeRound) return;

      const fromPlayer = room.players[socket.id];
      const toPlayer = room.players[targetPlayerId];

      if (!fromPlayer || !toPlayer) return;
      if (fromPlayer.skipsRemaining <= 0) {
        return socket.emit('error_message', 'No Skip Tokens remaining!');
      }

      fromPlayer.skipsRemaining -= 1;
      room.activeRound.skippedBy = {
        fromPlayerId: fromPlayer.id,
        fromPlayerName: fromPlayer.name,
        toPlayerId: toPlayer.id,
        toPlayerName: toPlayer.name,
      };

      room.activeRound.loserPlayerId = toPlayer.id;
      toPlayer.shotsTaken += (room.activeRound.question.penaltyShots || 1);

      io.to(roomCode).emit('skip_used_notification', {
        fromName: fromPlayer.name,
        toName: toPlayer.name,
      });

      io.to(roomCode).emit('room_updated', room);
    });

    // Pass Hot Lemon
    socket.on('pass_hot_lemon', ({ roomCode }) => {
      const room = rooms.get(roomCode);
      if (!room || !room.activeRound || !room.activeRound.hotLemon) return;

      const players = Object.values(room.players);
      if (players.length <= 1) return;

      const otherPlayers = players.filter(p => p.id !== socket.id);
      const nextHolder = otherPlayers[Math.floor(Math.random() * otherPlayers.length)];

      room.activeRound.hotLemon.currentHolderId = nextHolder.id;
      room.activeRound.hotLemon.passCount += 1;

      io.to(roomCode).emit('room_updated', room);
    });

    // Next Round
    socket.on('next_round', ({ roomCode }) => {
      const room = rooms.get(roomCode);
      if (!room) return;

      room.currentRoundIndex += 1;
      if (room.currentRoundIndex >= room.rounds.length) {
        room.phase = 'GAME_OVER';
        io.to(roomCode).emit('game_over', room);
        io.to(roomCode).emit('room_updated', room);
      } else {
        startRound(room, room.currentRoundIndex);
      }
    });

    // Add Player manually by Admin
    socket.on('add_player', ({ roomCode, name, avatar }) => {
      const room = rooms.get(roomCode);
      if (!room) return;

      const dummyId = `manual_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
      const player = {
        id: dummyId,
        name: (name || '').trim() || `Guest Lemon ${Object.keys(room.players).length + 1}`,
        avatar: avatar || 'lemon-cool',
        isHost: false,
        isReady: true,
        shotsTaken: 0,
        skipsRemaining: 3,
        score: 0,
        joinedAt: Date.now(),
      };

      room.players[dummyId] = player;
      io.to(roomCode).emit('room_updated', room);
    });

    // Edit Player by Admin
    socket.on('edit_player', ({ roomCode, targetPlayerId, name, avatar }) => {
      const room = rooms.get(roomCode);
      if (!room || !room.players[targetPlayerId]) return;

      if (name) room.players[targetPlayerId].name = name.trim();
      if (avatar) room.players[targetPlayerId].avatar = avatar;
      io.to(roomCode).emit('room_updated', room);
    });

    // Kick / Delete Player by Admin
    socket.on('kick_player', ({ roomCode, targetPlayerId }) => {
      const room = rooms.get(roomCode);
      if (!room || !room.players[targetPlayerId]) return;

      delete room.players[targetPlayerId];
      io.to(roomCode).emit('room_updated', room);
    });

    // Restart Current Round by Admin
    socket.on('restart_round', ({ roomCode }) => {
      const room = rooms.get(roomCode);
      if (!room) return;

      startRound(room, room.currentRoundIndex);
    });

    // Restart Game
    socket.on('restart_game', ({ roomCode }) => {
      const room = rooms.get(roomCode);
      if (!room) return;

      room.phase = 'LOBBY';
      room.currentRoundIndex = 0;
      Object.values(room.players).forEach(p => {
        p.shotsTaken = 0;
        p.skipsRemaining = 3;
        p.isReady = false;
      });
      room.activeRound = undefined;
      io.to(roomCode).emit('room_updated', room);
    });

    // Disconnect
    socket.on('disconnect', () => {
      for (const [code, room] of rooms.entries()) {
        if (room.players[socket.id]) {
          const removedPlayer = room.players[socket.id];
          delete room.players[socket.id];

          io.to(code).emit('player_left', { playerId: socket.id, name: removedPlayer.name, room });
          io.to(code).emit('player_disconnected', { playerId: socket.id, name: removedPlayer.name, room });

          if (Object.keys(room.players).length === 0) {
            rooms.delete(code);
            if (roomTimers.has(code)) {
              clearInterval(roomTimers.get(code));
              roomTimers.delete(code);
            }
          } else {
            if (room.hostId === socket.id) {
              const firstId = Object.keys(room.players)[0];
              room.hostId = firstId;
              room.players[firstId].isHost = true;
            }
            io.to(code).emit('room_updated', room);
          }
        }
      }
    });
  });

  httpServer.listen(port, (err) => {
    if (err) throw err;
    console.log(`> Ready on http://${hostname}:${port}`);
  });
});

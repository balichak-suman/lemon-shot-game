import { GameRoom, Player, ActiveRound, RoundType } from './types';
import { REUNION_QUESTIONS } from './questions';

class RoomManager {
  private rooms: Map<string, GameRoom> = new Map();

  private generateCode(): string {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let code = '';
    for (let i = 0; i < 4; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    if (this.rooms.has(code)) return this.generateCode();
    return code;
  }

  public createRoom(hostSocketId: string, hostName: string, avatar: string): GameRoom {
    const code = this.generateCode();
    const hostPlayer: Player = {
      id: hostSocketId,
      name: hostName || 'Suman',
      avatar: avatar || 'lemon-king',
      isHost: true,
      isReady: true,
      shotsTaken: 0,
      skipsRemaining: 99,
      score: 0,
      joinedAt: Date.now(),
    };

    const room: GameRoom = {
      code,
      hostId: hostSocketId,
      players: { [hostSocketId]: hostPlayer },
      phase: 'LOBBY',
      currentRoundIndex: 0,
      rounds: [...REUNION_QUESTIONS],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    this.rooms.set(code, room);
    return room;
  }

  public getRoom(code: string): GameRoom | undefined {
    return this.rooms.get(code.toUpperCase());
  }

  public getRoomBySocketId(socketId: string): GameRoom | undefined {
    for (const room of this.rooms.values()) {
      if (room.players[socketId]) return room;
    }
    return undefined;
  }

  public joinRoom(code: string, socketId: string, name: string, avatar: string): { room?: GameRoom; player?: Player; error?: string } {
    const cleanCode = code.trim().toUpperCase();
    const room = this.rooms.get(cleanCode);

    if (!room) {
      return { error: 'Room not found! Check the room code.' };
    }

    if (room.phase !== 'LOBBY' && room.phase !== 'PLAYING') {
      return { error: 'Room is unavailable!' };
    }

    const player: Player = {
      id: socketId,
      name: name.trim() || `Party Lemon ${Object.keys(room.players).length + 1}`,
      avatar: avatar || 'lemon-happy',
      isHost: false,
      isReady: false,
      shotsTaken: 0,
      skipsRemaining: 99,
      score: 0,
      joinedAt: Date.now(),
    };

    room.players[socketId] = player;
    room.updatedAt = Date.now();
    return { room, player };
  }

  public setPlayerReady(code: string, socketId: string, isReady: boolean): GameRoom | undefined {
    const room = this.getRoom(code);
    if (room && room.players[socketId]) {
      room.players[socketId].isReady = isReady;
      room.updatedAt = Date.now();
    }
    return room;
  }

  public removePlayer(socketId: string): { room?: GameRoom; removedPlayer?: Player } {
    const room = this.getRoomBySocketId(socketId);
    if (!room) return {};

    const removedPlayer = room.players[socketId];
    delete room.players[socketId];

    if (room.hostId === socketId) {
      const remainingIds = Object.keys(room.players);
      if (remainingIds.length > 0) {
        room.hostId = remainingIds[0];
        room.players[remainingIds[0]].isHost = true;
      } else {
        this.rooms.delete(room.code);
        return { removedPlayer };
      }
    }

    room.updatedAt = Date.now();
    return { room, removedPlayer };
  }

  public startGame(code: string): GameRoom | undefined {
    const room = this.getRoom(code);
    if (!room) return undefined;

    room.phase = 'PLAYING';
    room.currentRoundIndex = 0;
    this.startRound(room, 0);
    return room;
  }

  public startRound(room: GameRoom, roundIndex: number): ActiveRound {
    const question = room.rounds[roundIndex % room.rounds.length];
    const playerList = Object.values(room.players);
    const initialHolder = playerList.length > 0 ? playerList[Math.floor(Math.random() * playerList.length)].id : room.hostId;

    const activeRound: ActiveRound = {
      roundNumber: roundIndex + 1,
      totalRounds: 99999,
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
    room.updatedAt = Date.now();
    return activeRound;
  }

  public submitVote(code: string, voterId: string, targetPlayerIds: string[]): GameRoom | undefined {
    const room = this.getRoom(code);
    if (!room || !room.activeRound) return undefined;

    room.activeRound.votes[voterId] = targetPlayerIds;
    room.updatedAt = Date.now();
    return room;
  }

  public useSkipToken(code: string, fromPlayerId: string, toPlayerId: string): { room?: GameRoom; success: boolean; message?: string } {
    const room = this.getRoom(code);
    if (!room || !room.activeRound) return { success: false, message: 'No active game round' };

    const fromPlayer = room.players[fromPlayerId];
    const toPlayer = room.players[toPlayerId];

    if (!fromPlayer || !toPlayer) return { success: false, message: 'Invalid player selection' };

    room.activeRound.skippedBy = {
      fromPlayerId: fromPlayer.id,
      fromPlayerName: fromPlayer.name,
      toPlayerId: toPlayer.id,
      toPlayerName: toPlayer.name,
    };

    room.activeRound.loserPlayerId = toPlayer.id;
    toPlayer.shotsTaken += (room.activeRound.question.penaltyShots || 1);

    room.updatedAt = Date.now();
    return { room, success: true };
  }

  public passHotLemon(code: string, currentHolderId: string): { room?: GameRoom; nextHolderId?: string } {
    const room = this.getRoom(code);
    if (!room || !room.activeRound || !room.activeRound.hotLemon) return {};

    const players = Object.values(room.players);
    if (players.length <= 1) return { room };

    const otherPlayers = players.filter(p => p.id !== currentHolderId);
    const nextHolder = otherPlayers[Math.floor(Math.random() * otherPlayers.length)];

    room.activeRound.hotLemon.currentHolderId = nextHolder.id;
    room.activeRound.hotLemon.passCount += 1;
    room.updatedAt = Date.now();

    return { room, nextHolderId: nextHolder.id };
  }

  public resolveRound(code: string): ActiveRound | undefined {
    const room = this.getRoom(code);
    if (!room || !room.activeRound) return undefined;

    const round = room.activeRound;
    round.phase = 'RESULT';

    if (round.type === 'MOST_LIKELY_TO') {
      const voteCounts: Record<string, number> = {};
      Object.values(round.votes).forEach(targetIds => {
        const idList = Array.isArray(targetIds) ? targetIds : [targetIds];
        idList.forEach(id => {
          voteCounts[id] = (voteCounts[id] || 0) + 1;
        });
      });

      let maxVotes = -1;
      Object.values(voteCounts).forEach(count => {
        if (count > maxVotes) maxVotes = count;
      });

      let tiedPlayerIds: string[] = [];
      if (maxVotes > 0) {
        tiedPlayerIds = Object.keys(voteCounts).filter(id => voteCounts[id] === maxVotes);
      } else {
        tiedPlayerIds = Object.keys(room.players);
      }

      if (tiedPlayerIds.length > 1) {
        round.isTie = true;
        round.tiedPlayerIds = tiedPlayerIds;
      } else {
        round.isTie = false;
        round.tiedPlayerIds = undefined;
      }

      const loserId = tiedPlayerIds[Math.floor(Math.random() * tiedPlayerIds.length)];
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
    }

    room.updatedAt = Date.now();
    return round;
  }

  public nextRound(code: string): GameRoom | undefined {
    const room = this.getRoom(code);
    if (!room) return undefined;

    room.currentRoundIndex += 1;
    this.startRound(room, room.currentRoundIndex);

    room.updatedAt = Date.now();
    return room;
  }
}

export const roomManager = new RoomManager();

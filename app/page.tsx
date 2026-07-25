'use client';

import React, { useState, useEffect } from 'react';
import { io, Socket } from 'socket.io-client';
import { ShieldCheck, UserCheck, LogOut } from 'lucide-react';
import { ActiveRound, GameRoom, Player } from '../lib/game/types';
import { AnimatedBackground } from '../components/ui/animated-background';
import { LandingView } from '../components/game/landing-view';
import { LobbyView } from '../components/game/lobby-view';
import { MostLikelyToView } from '../components/game/most-likely-to-view';
import { HotLemonView } from '../components/game/hot-lemon-view';
import { TruthDareView } from '../components/game/truth-dare-view';
import { LeaderboardView } from '../components/game/leaderboard-view';
import { AdminDashboard } from '../components/game/admin-dashboard';

let socket: Socket;

const SESSION_KEY = 'lemon_party_session';

export default function Home() {
  const [room, setRoom] = useState<GameRoom | null>(null);
  const [currentPlayer, setCurrentPlayer] = useState<Player | null>(null);
  const [secondsRemaining, setSecondsRemaining] = useState<number>(20);
  const [error, setError] = useState<string>('');
  const [showAdminView, setShowAdminView] = useState<boolean>(false);
  const [isClient, setIsClient] = useState<boolean>(false);

  useEffect(() => {
    setIsClient(true);
    socket = io();

    // Auto-reconnect from localStorage session on refresh
    const savedSession = localStorage.getItem(SESSION_KEY);
    let autoReconnecting = false;
    if (savedSession) {
      try {
        const { roomCode, name, avatar } = JSON.parse(savedSession);
        if (roomCode && name) {
          autoReconnecting = true;
          socket.emit('join_room', { roomCode, name, avatar });
        }
      } catch {
        localStorage.removeItem(SESSION_KEY);
      }
    }

    socket.on('room_created', ({ roomCode, room: newRoom }) => {
      setRoom(newRoom);
      if (socket?.id && newRoom.players[socket.id]) {
        const player = newRoom.players[socket.id];
        setCurrentPlayer(player);
        // Persist session to localStorage
        localStorage.setItem(SESSION_KEY, JSON.stringify({ roomCode, name: player.name, avatar: player.avatar }));
      }
      setError('');
    });

    socket.on('room_joined', ({ player, room: joinedRoom }) => {
      setRoom(joinedRoom);
      setCurrentPlayer(player);
      // Persist session to localStorage
      localStorage.setItem(SESSION_KEY, JSON.stringify({ roomCode: joinedRoom.code, name: player.name, avatar: player.avatar }));
      setError('');
    });

    socket.on('room_updated', (updatedRoom: GameRoom) => {
      setRoom(updatedRoom);
      if (socket?.id && updatedRoom.players[socket.id]) {
        setCurrentPlayer(updatedRoom.players[socket.id]);
      }
    });

    socket.on('round_started', (activeRound: ActiveRound) => {
      setSecondsRemaining(activeRound.question.timerSeconds);
    });

    socket.on('timer_tick', ({ secondsRemaining: secs }) => {
      setSecondsRemaining(secs);
    });

    socket.on('timer_update', ({ secondsRemaining: secs }) => {
      setSecondsRemaining(secs);
    });

    socket.on('player_joined', ({ room: joinedRoom }) => {
      setRoom(joinedRoom);
    });

    socket.on('player_connected', ({ room: connectedRoom }) => {
      setRoom(connectedRoom);
    });

    socket.on('player_left', ({ room: leftRoom }) => {
      setRoom(leftRoom);
    });

    socket.on('player_disconnected', ({ room: discRoom }) => {
      setRoom(discRoom);
    });

    socket.on('voting_finished', ({ room: finishedRoom }) => {
      setRoom(finishedRoom);
    });

    socket.on('winner_announced', ({ activeRound }) => {
      setRoom((prev) => (prev ? { ...prev, activeRound } : prev));
    });

    socket.on('error_message', (msg: string) => {
      setError(msg);
      if (msg.toLowerCase().includes('not found') || msg.toLowerCase().includes('closed')) {
        localStorage.removeItem(SESSION_KEY);
        setRoom(null);
        setCurrentPlayer(null);
      }
    });

    return () => {
      if (socket) socket.disconnect();
    };
  }, []);

  // Socket Actions
  const handleCreateRoom = (hostName: string, avatar: string) => {
    if (socket) socket.emit('create_room', { hostName, avatar });
  };

  const handleJoinRoom = (roomCode: string, name: string, avatar: string) => {
    if (socket) socket.emit('join_room', { roomCode, name, avatar });
  };

  const handleToggleReady = (isReady: boolean) => {
    if (socket && room) socket.emit('player_ready', { roomCode: room.code, isReady });
  };

  const handleStartGame = () => {
    setShowAdminView(false);
    if (socket && room) socket.emit('start_game', { roomCode: room.code });
  };

  const handleSubmitVote = (targetPlayerIds: string[]) => {
    if (socket && room) socket.emit('submit_vote', { roomCode: room.code, targetPlayerIds });
  };

  const handleUseSkip = (targetPlayerId: string) => {
    if (socket && room) socket.emit('use_skip', { roomCode: room.code, targetPlayerId });
  };

  const handlePassHotLemon = () => {
    if (socket && room) socket.emit('pass_hot_lemon', { roomCode: room.code });
  };

  const handleNextRound = () => {
    if (socket && room) socket.emit('next_round', { roomCode: room.code });
  };

  const handleRestartGame = () => {
    if (socket && room) socket.emit('restart_game', { roomCode: room.code });
  };

  // Explicit Exit Game Handler
  const handleExitGame = () => {
    localStorage.removeItem(SESSION_KEY);
    setRoom(null);
    setCurrentPlayer(null);
    if (socket) socket.disconnect();
  };

  // Admin Specific Handlers
  const handleAddPlayer = (name: string, avatar: string) => {
    if (socket && room) socket.emit('add_player', { roomCode: room.code, name, avatar });
  };

  const handleEditPlayer = (targetPlayerId: string, name: string, avatar: string) => {
    if (socket && room) socket.emit('edit_player', { roomCode: room.code, targetPlayerId, name, avatar });
  };

  const handleDeletePlayer = (targetPlayerId: string) => {
    if (socket && room) socket.emit('kick_player', { roomCode: room.code, targetPlayerId });
  };

  const handleRestartRound = () => {
    if (socket && room) socket.emit('restart_round', { roomCode: room.code });
  };

  // Render View Selector based on Game Phase
  const renderCurrentView = () => {
    if (!isClient) return null;

    if (!room || !currentPlayer) {
      return <LandingView onCreateRoom={handleCreateRoom} onJoinRoom={handleJoinRoom} error={error} />;
    }

    if (showAdminView && currentPlayer.isHost) {
      return (
        <AdminDashboard
          room={room}
          currentPlayer={currentPlayer}
          onStartVoting={handleStartGame}
          onRestartRound={handleRestartRound}
          onResetGame={handleRestartGame}
          onAddPlayer={handleAddPlayer}
          onEditPlayer={handleEditPlayer}
          onDeletePlayer={handleDeletePlayer}
        />
      );
    }

    if (room.phase === 'LOBBY') {
      return (
        <LobbyView
          room={room}
          currentPlayer={currentPlayer}
          onToggleReady={handleToggleReady}
          onStartGame={handleStartGame}
        />
      );
    }

    if (room.phase === 'GAME_OVER') {
      return (
        <LeaderboardView
          room={room}
          currentPlayer={currentPlayer}
          onRestartGame={handleRestartGame}
        />
      );
    }

    if (room.phase === 'PLAYING' && room.activeRound) {
      const roundType = room.activeRound.type;

      if (roundType === 'MOST_LIKELY_TO') {
        return (
          <MostLikelyToView
            room={room}
            activeRound={room.activeRound}
            currentPlayer={currentPlayer}
            secondsRemaining={secondsRemaining}
            onSubmitVote={handleSubmitVote}
            onUseSkip={handleUseSkip}
            onNextRound={handleNextRound}
          />
        );
      }

      if (roundType === 'HOT_LEMON') {
        return (
          <HotLemonView
            room={room}
            activeRound={room.activeRound}
            currentPlayer={currentPlayer}
            secondsRemaining={secondsRemaining}
            onPassHotLemon={handlePassHotLemon}
            onNextRound={handleNextRound}
          />
        );
      }

      if (roundType === 'TRUTH_DARE') {
        return (
          <TruthDareView
            room={room}
            activeRound={room.activeRound}
            currentPlayer={currentPlayer}
            secondsRemaining={secondsRemaining}
            onUseSkip={handleUseSkip}
            onNextRound={handleNextRound}
          />
        );
      }
    }

    return <LandingView onCreateRoom={handleCreateRoom} onJoinRoom={handleJoinRoom} error={error} />;
  };

  return (
    <AnimatedBackground>
      {/* Top Header Controls Bar when in active Room */}
      {room && currentPlayer && (
        <div className="w-full max-w-4xl flex justify-between items-center px-4 mb-2 z-30">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full bg-black/40 backdrop-blur-md border border-lemon-400/40 text-lemon-300 text-xs font-black tracking-wider shadow-sm">
              ROOM: <span className="text-white font-extrabold">{room.code}</span>
            </span>

            {currentPlayer.isHost && (
              <button
                onClick={() => setShowAdminView(!showAdminView)}
                className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-400 text-forest-950 text-xs font-black shadow-lg hover:bg-amber-300 transition-all cursor-pointer border border-white"
              >
                {showAdminView ? (
                  <>
                    <UserCheck className="h-3.5 w-3.5" /> Game Screen
                  </>
                ) : (
                  <>
                    <ShieldCheck className="h-3.5 w-3.5" /> Admin Control
                  </>
                )}
              </button>
            )}
          </div>

          {/* Exit Game Button */}
          <button
            onClick={handleExitGame}
            className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-500/25 border border-rose-400/50 text-rose-200 text-xs font-extrabold hover:bg-rose-500/40 transition-all cursor-pointer shadow-sm ml-auto"
          >
            <LogOut className="h-3.5 w-3.5" /> Exit Game
          </button>
        </div>
      )}

      {renderCurrentView()}
    </AnimatedBackground>
  );
}

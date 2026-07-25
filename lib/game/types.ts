export type RoundType = 'MOST_LIKELY_TO' | 'HOT_LEMON' | 'TRUTH_DARE';

export type GamePhase = 'LOBBY' | 'ROUND_INTRO' | 'PLAYING' | 'ROUND_RESULT' | 'GAME_OVER';

export interface Player {
  id: string; // Socket ID
  name: string;
  avatar: string; // Lemon avatar icon index/preset
  isHost: boolean;
  isReady: boolean;
  shotsTaken: number;
  skipsRemaining: number;
  score: number;
  joinedAt: number;
}

export interface Question {
  id: string;
  type: RoundType;
  prompt: string;
  category: 'Spicy Nostalgia' | 'Party Wildcard' | 'College Memories' | 'Hot Potato' | 'Reunion Secret';
  options?: string[]; // For specific quiz or choice types
  timerSeconds: number;
  penaltyShots: number;
}

export interface VoteData {
  voterId: string;
  targetPlayerId: string;
}

export interface HotLemonState {
  currentHolderId: string;
  timerMsRemaining: number;
  explodeTime: number;
  passCount: number;
  targetAnswer?: string;
  triviaPrompt?: string;
  options?: string[];
  correctOptionIndex?: number;
}

export interface ActiveRound {
  roundNumber: number;
  totalRounds: number;
  type: RoundType;
  question: Question;
  phase: 'INTRO' | 'ACTION' | 'SKIP_WINDOW' | 'RESULT';
  votes: Record<string, string[]>; // voterId -> array of targeted player IDs [id1, id2]
  skippedBy?: {
    fromPlayerId: string;
    fromPlayerName: string;
    toPlayerId: string;
    toPlayerName: string;
  };
  loserPlayerId?: string;
  shotsAssigned?: number;
  hotLemon?: HotLemonState;
}

export interface GameRoom {
  code: string;
  hostId: string;
  players: Record<string, Player>;
  phase: GamePhase;
  currentRoundIndex: number;
  rounds: Question[];
  activeRound?: ActiveRound;
  createdAt: number;
  updatedAt: number;
}

// Client to Server Events
export interface ClientToServerEvents {
  'create_room': (data: { hostName: string; avatar: string }) => void;
  'join_room': (data: { roomCode: string; name: string; avatar: string }) => void;
  'player_ready': (data: { roomCode: string; isReady: boolean }) => void;
  'start_game': (data: { roomCode: string }) => void;
  'start_voting': (data: { roomCode: string }) => void;
  'submit_vote': (data: { roomCode: string; targetPlayerIds: string[] }) => void;
  'use_skip': (data: { roomCode: string; targetPlayerId: string }) => void;
  'pass_hot_lemon': (data: { roomCode: string; answerIndex?: number }) => void;
  'next_round': (data: { roomCode: string }) => void;
  'restart_game': (data: { roomCode: string }) => void;
  'add_player': (data: { roomCode: string; name: string; avatar: string }) => void;
  'edit_player': (data: { roomCode: string; targetPlayerId: string; name: string; avatar: string }) => void;
  'kick_player': (data: { roomCode: string; targetPlayerId: string }) => void;
  'restart_round': (data: { roomCode: string }) => void;
  'reconnect_player': (data: { roomCode: string; playerId: string }) => void;
}

// Server to Client Events
export interface ServerToClientEvents {
  'room_created': (data: { roomCode: string; room: GameRoom }) => void;
  'room_joined': (data: { player: Player; room: GameRoom }) => void;
  'room_updated': (room: GameRoom) => void;
  'round_started': (activeRound: ActiveRound) => void;
  'timer_tick': (data: { secondsRemaining: number; roundNumber: number }) => void;
  'timer_update': (data: { secondsRemaining: number; roundNumber: number }) => void;
  'skip_used_notification': (data: { fromName: string; toName: string }) => void;
  'round_ended': (activeRound: ActiveRound) => void;
  'voting_finished': (data: { room: GameRoom; activeRound: ActiveRound }) => void;
  'winner_announced': (data: { winnerPlayer: Player | null; activeRound: ActiveRound }) => void;
  'player_joined': (data: { player: Player; room: GameRoom }) => void;
  'player_left': (data: { playerId: string; name: string; room: GameRoom }) => void;
  'player_connected': (data: { player: Player; room: GameRoom }) => void;
  'player_disconnected': (data: { playerId: string; name: string; room: GameRoom }) => void;
  'game_over': (room: GameRoom) => void;
  'error_message': (message: string) => void;
}

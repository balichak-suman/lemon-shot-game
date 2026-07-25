export type RoundType = 'MOST_LIKELY_TO' | 'HOT_LEMON' | 'TRUTH_DARE';

export interface Player {
  id: string;
  name: string;
  avatar: string;
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
  category?: string;
  options?: string[];
  timerSeconds: number;
  penaltyShots: number;
}

export interface ActiveRound {
  roundNumber: number;
  totalRounds: number;
  type: RoundType;
  question: Question;
  phase: 'ACTION' | 'VOTING' | 'RESULT';
  votes: Record<string, string[]>; // voterId -> targetPlayerIds
  loserPlayerId?: string;
  shotsAssigned?: number;
  isTie?: boolean;
  tiedPlayerIds?: string[];
  skippedBy?: {
    fromPlayerId: string;
    fromPlayerName: string;
    toPlayerId: string;
    toPlayerName: string;
  };
  hotLemon?: {
    currentHolderId: string;
    timerMsRemaining: number;
    explodeTime: number;
    passCount: number;
  };
}

export interface GameRoom {
  code: string;
  hostId: string;
  players: Record<string, Player>; // socketId -> Player
  phase: 'LOBBY' | 'PLAYING' | 'GAME_OVER';
  currentRoundIndex: number;
  rounds: Question[];
  activeRound?: ActiveRound;
  createdAt: number;
  updatedAt: number;
}

export interface ServerToClientEvents {
  room_created: (data: { roomCode: string; room: GameRoom }) => void;
  room_joined: (data: { player: Player; room: GameRoom }) => void;
  room_updated: (room: GameRoom) => void;
  round_started: (activeRound: ActiveRound) => void;
  timer_tick: (data: { secondsRemaining: number }) => void;
  timer_update: (data: { secondsRemaining: number }) => void;
  player_joined: (data: { room: GameRoom }) => void;
  player_connected: (data: { room: GameRoom }) => void;
  player_left: (data: { room: GameRoom }) => void;
  player_disconnected: (data: { room: GameRoom }) => void;
  voting_finished: (data: { room: GameRoom }) => void;
  winner_announced: (data: { activeRound: ActiveRound }) => void;
  error_message: (message: string) => void;
}

export interface ClientToServerEvents {
  create_room: (data: { hostName: string; avatar: string }) => void;
  join_room: (data: { roomCode: string; name: string; avatar: string }) => void;
  player_ready: (data: { roomCode: string; isReady: boolean }) => void;
  start_game: (data: { roomCode: string }) => void;
  submit_vote: (data: { roomCode: string; targetPlayerIds: string[] }) => void;
  use_skip: (data: { roomCode: string; targetPlayerId: string }) => void;
  pass_hot_lemon: (data: { roomCode: string }) => void;
  next_round: (data: { roomCode: string }) => void;
  restart_game: (data: { roomCode: string }) => void;
  add_player: (data: { roomCode: string; name: string; avatar: string }) => void;
  edit_player: (data: { roomCode: string; targetPlayerId: string; name: string; avatar: string }) => void;
  kick_player: (data: { roomCode: string; targetPlayerId: string }) => void;
  restart_round: (data: { roomCode: string }) => void;
}

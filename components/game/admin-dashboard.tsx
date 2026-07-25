'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Crown,
  Play,
  RotateCcw,
  RefreshCw,
  UserPlus,
  Search,
  Edit2,
  Trash2,
  CheckCircle,
  Clock,
  Users,
  X,
} from 'lucide-react';
import { GameRoom, Player } from '@/lib/game/types';
import { GlassCard } from '../ui/glass-card';
import { LemonButton } from '../ui/lemon-button';
import { LemonAvatar, LEMON_AVATARS } from '../ui/lemon-avatar';
import { GlassDialog } from '../ui/glass-dialog';
import { audioManager } from '@/lib/game/audio-manager';

export interface AdminDashboardProps {
  room: GameRoom;
  currentPlayer: Player;
  onStartVoting: () => void;
  onRestartRound: () => void;
  onResetGame: () => void;
  onAddPlayer: (name: string, avatar: string) => void;
  onEditPlayer: (targetPlayerId: string, name: string, avatar: string) => void;
  onDeletePlayer: (targetPlayerId: string) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  room,
  currentPlayer,
  onStartVoting,
  onRestartRound,
  onResetGame,
  onAddPlayer,
  onEditPlayer,
  onDeletePlayer,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingPlayer, setEditingPlayer] = useState<Player | null>(null);

  // Form states
  const [newPlayerName, setNewPlayerName] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState('lemon-king');

  const playerList = Object.values(room.players);
  const totalPlayers = playerList.length;

  // Calculate total submitted count (PRIVACY: only count boolean submitted status!)
  const votesMap = room.activeRound?.votes || {};
  const submittedCount = playerList.filter((p) => Boolean(votesMap[p.id])).length;

  // Filtered players for search
  const filteredPlayers = playerList.filter((p) =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase().trim())
  );

  const getInitials = (name: string) => {
    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPlayerName.trim()) return;
    audioManager.playPop();
    onAddPlayer(newPlayerName.trim(), selectedAvatar);
    setNewPlayerName('');
    setShowAddModal(false);
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPlayer || !newPlayerName.trim()) return;
    audioManager.playPop();
    onEditPlayer(editingPlayer.id, newPlayerName.trim(), selectedAvatar);
    setEditingPlayer(null);
  };

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-6 relative z-20">
      {/* Header Banner */}
      <GlassCard variant="glow" hoverEffect={false} className="mb-6 p-6 border-4 border-amber-400">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-center sm:text-left">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-400 text-forest-950 text-xs font-black mb-2 shadow-sm">
              <Crown className="h-4 w-4 fill-current text-forest-950" />
              <span>ADMIN CONTROL DASHBOARD</span>
            </div>
            <h1 className="font-heading text-2xl sm:text-4xl font-black text-forest-950">
              Host: {currentPlayer.name}
            </h1>
            <p className="text-xs sm:text-sm font-bold text-forest-800">
              Room Code: <span className="font-mono font-black text-forest-950 underline">{room.code}</span> • Phase: <span className="uppercase font-black text-forest-950">{room.phase}</span>
            </p>
          </div>

          {/* Submission Counter & Live Player Stats */}
          <div className="flex items-center gap-3 bg-white/80 backdrop-blur-md p-3.5 rounded-2xl border-2 border-amber-300 shadow-sm">
            <div className="text-center px-2 border-r border-forest-900/15">
              <div className="text-[10px] font-black uppercase text-forest-800">Connected</div>
              <div className="font-heading text-2xl font-black text-forest-950 flex items-center justify-center gap-1">
                <Users className="h-4 w-4 text-emerald-600" />
                <span>{totalPlayers}</span>
              </div>
            </div>

            <div className="text-center px-2">
              <div className="text-[10px] font-black uppercase text-forest-800">Submitted</div>
              <div className="font-heading text-2xl font-black text-lime-700">
                {submittedCount} / {totalPlayers}
              </div>
            </div>
          </div>
        </div>
      </GlassCard>

      {/* Admin Action Control Buttons */}
      <GlassCard variant="dark" hoverEffect={false} className="mb-6 p-5 border-2 border-white/20">
        <h2 className="text-xs font-black uppercase tracking-wider text-lemon-300 mb-3">
          ⚡ Game Controls
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <LemonButton
            variant="primary"
            size="md"
            icon={<Play className="h-5 w-5 fill-current" />}
            onClick={() => {
              audioManager.playPop();
              onStartVoting();
            }}
            className="w-full text-sm"
          >
            {room.phase === 'LOBBY' ? 'START GAME' : 'START VOTING'}
          </LemonButton>

          <LemonButton
            variant="outline"
            size="md"
            icon={<RotateCcw className="h-5 w-5" />}
            onClick={() => {
              audioManager.playPop();
              onRestartRound();
            }}
            className="w-full text-sm"
          >
            RESTART ROUND
          </LemonButton>

          <LemonButton
            variant="danger"
            size="md"
            icon={<RefreshCw className="h-5 w-5" />}
            onClick={() => {
              audioManager.playPop();
              onResetGame();
            }}
            className="w-full text-sm"
          >
            RESET GAME
          </LemonButton>
        </div>
      </GlassCard>

      {/* Player Management Section */}
      <GlassCard variant="glow" hoverEffect={false} className="p-6 border-2 border-lemon-400">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-5">
          <div>
            <h2 className="font-heading text-2xl font-extrabold text-forest-950">
              Player Management
            </h2>
            <p className="text-xs font-semibold text-forest-800">
              Add, edit, or remove players from the active room.
            </p>
          </div>

          <LemonButton
            variant="secondary"
            size="sm"
            icon={<UserPlus className="h-4 w-4" />}
            onClick={() => {
              audioManager.playPop();
              setNewPlayerName('');
              setSelectedAvatar('lemon-cool');
              setShowAddModal(true);
            }}
          >
            ADD PLAYER
          </LemonButton>
        </div>

        {/* Search Input */}
        <div className="relative mb-5">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-forest-800/60" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search players by name..."
            className="w-full rounded-xl bg-white/90 border-2 border-lime-400/70 pl-10 pr-4 py-2 text-sm font-bold text-forest-950 placeholder-forest-800/40 focus:outline-none focus:border-lemon-400"
          />
        </div>

        {/* Player Roster Grid / Cards */}
        <div className="space-y-2.5 max-h-96 overflow-y-auto pr-1">
          {filteredPlayers.map((player) => {
            const hasSubmitted = Boolean(votesMap[player.id]);
            return (
              <motion.div
                key={player.id}
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center justify-between p-3.5 rounded-2xl bg-white/80 border border-white/60 shadow-sm hover:bg-white transition-all"
              >
                {/* Left: Avatar + Name + Initials + Host Badge */}
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <LemonAvatar avatarId={player.avatar} size="sm" />
                    {player.isHost && (
                      <div className="absolute -top-1.5 -left-1.5 rounded-full bg-amber-400 p-0.5 text-forest-950">
                        <Crown className="h-3 w-3 fill-current" />
                      </div>
                    )}
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-heading text-base font-bold text-forest-950">
                        {player.name}
                      </span>
                      <span className="text-[10px] font-black text-forest-800/60 uppercase">
                        ({getInitials(player.name)})
                      </span>
                      {player.isHost && (
                        <span className="text-[10px] font-black text-amber-800 bg-amber-300 px-1.5 py-0.5 rounded-full">
                          ADMIN
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="inline-flex items-center gap-1 text-[10px] font-black text-emerald-800">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        🟢 Connected
                      </span>

                      {/* Submission Status Badge (NO VOTE CONTENT REVEALED!) */}
                      {room.phase === 'PLAYING' && (
                        <span
                          className={`inline-flex items-center gap-1 text-[10px] font-black px-2 py-0.5 rounded-full ${
                            hasSubmitted
                              ? 'bg-lime-300 text-forest-950'
                              : 'bg-amber-100 text-amber-900 border border-amber-300'
                          }`}
                        >
                          {hasSubmitted ? (
                            <>
                              <CheckCircle className="h-3 w-3 text-forest-950" /> Submitted
                            </>
                          ) : (
                            <>
                              <Clock className="h-3 w-3 text-amber-800" /> Pending
                            </>
                          )}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right: Actions (Edit & Delete) */}
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => {
                      audioManager.playPop();
                      setEditingPlayer(player);
                      setNewPlayerName(player.name);
                      setSelectedAvatar(player.avatar);
                    }}
                    className="flex h-8 w-8 items-center justify-center rounded-xl bg-forest-900/10 text-forest-900 hover:bg-forest-900/20 transition-all"
                    title="Edit Player"
                  >
                    <Edit2 className="h-4 w-4" />
                  </button>

                  {!player.isHost && (
                    <button
                      onClick={() => {
                        audioManager.playShotBuzzer();
                        onDeletePlayer(player.id);
                      }}
                      className="flex h-8 w-8 items-center justify-center rounded-xl bg-rose-500/15 text-rose-700 hover:bg-rose-500/30 transition-all"
                      title="Kick Player"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </motion.div>
            );
          })}

          {filteredPlayers.length === 0 && (
            <div className="text-center py-6 text-sm font-bold text-forest-800">
              No players found matching &ldquo;{searchQuery}&rdquo;.
            </div>
          )}
        </div>
      </GlassCard>

      {/* Add Player Dialog */}
      <GlassDialog
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="➕ Add Guest Player"
        description="Manually add a player to this game room:"
      >
        <form onSubmit={handleAddSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-forest-900 mb-1">
              Player Name
            </label>
            <input
              type="text"
              value={newPlayerName}
              onChange={(e) => setNewPlayerName(e.target.value)}
              placeholder="e.g. Sam"
              required
              className="w-full rounded-2xl bg-white border-2 border-lime-400 px-4 py-2.5 text-base font-bold text-forest-950 focus:outline-none focus:border-lemon-400"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-forest-900 mb-2">
              Select Avatar
            </label>
            <div className="grid grid-cols-6 gap-2">
              {LEMON_AVATARS.map((av) => (
                <LemonAvatar
                  key={av.id}
                  avatarId={av.id}
                  size="sm"
                  selected={selectedAvatar === av.id}
                  onClick={() => setSelectedAvatar(av.id)}
                />
              ))}
            </div>
          </div>

          <LemonButton variant="primary" size="lg" type="submit" className="w-full mt-2">
            ADD PLAYER TO ROOM
          </LemonButton>
        </form>
      </GlassDialog>

      {/* Edit Player Dialog */}
      <GlassDialog
        isOpen={Boolean(editingPlayer)}
        onClose={() => setEditingPlayer(null)}
        title="✏️ Edit Player Details"
        description={`Modify name or avatar for ${editingPlayer?.name}:`}
      >
        <form onSubmit={handleEditSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-forest-900 mb-1">
              Player Name
            </label>
            <input
              type="text"
              value={newPlayerName}
              onChange={(e) => setNewPlayerName(e.target.value)}
              required
              className="w-full rounded-2xl bg-white border-2 border-lime-400 px-4 py-2.5 text-base font-bold text-forest-950 focus:outline-none focus:border-lemon-400"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-forest-900 mb-2">
              Select Avatar
            </label>
            <div className="grid grid-cols-6 gap-2">
              {LEMON_AVATARS.map((av) => (
                <LemonAvatar
                  key={av.id}
                  avatarId={av.id}
                  size="sm"
                  selected={selectedAvatar === av.id}
                  onClick={() => setSelectedAvatar(av.id)}
                />
              ))}
            </div>
          </div>

          <LemonButton variant="secondary" size="lg" type="submit" className="w-full mt-2">
            SAVE CHANGES
          </LemonButton>
        </form>
      </GlassDialog>
    </div>
  );
};

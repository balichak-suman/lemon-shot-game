'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Crown, Copy, Check, Play, Sparkles, Users } from 'lucide-react';
import { GameRoom, Player } from '@/lib/game/types';
import { GlassCard } from '../ui/glass-card';
import { LemonButton } from '../ui/lemon-button';
import { LemonAvatar } from '../ui/lemon-avatar';
import { audioManager } from '@/lib/game/audio-manager';

export interface LobbyViewProps {
  room: GameRoom;
  currentPlayer: Player;
  onToggleReady: (isReady: boolean) => void;
  onStartGame: () => void;
}

export const LobbyView: React.FC<LobbyViewProps> = ({
  room,
  currentPlayer,
  onStartGame,
}) => {
  const [copied, setCopied] = useState(false);
  const playerList = Object.values(room.players);
  const isHost = currentPlayer.isHost;

  const getInitials = (name: string) => {
    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  const handleCopyCode = () => {
    audioManager.playPop();
    navigator.clipboard.writeText(room.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleStart = () => {
    audioManager.playFanfare();
    onStartGame();
  };

  return (
    <div className="w-full max-w-md mx-auto px-4 py-4 relative z-20 flex flex-col items-center min-h-[90vh] justify-center">
      {/* Top Banner: Greeting Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full text-center mb-3"
      >
        <p className="font-heading text-lg font-bold text-lemon-300 tracking-wide drop-shadow">
          Hello <span className="text-white underline decoration-lemon-400 decoration-2">{currentPlayer.name}</span> 👋
        </p>
      </motion.div>

      {/* Main Glass Waiting Card (Mobile Optimized) */}
      <GlassCard
        variant="glow"
        hoverEffect={false}
        className="w-full p-5 sm:p-7 border-4 border-lemon-400/90 shadow-[0_0_40px_rgba(250,204,21,0.4)] text-center"
      >
        {/* Animated Bobbing Lemon Mascot */}
        <motion.div
          animate={{
            y: [0, -12, 0],
            rotate: [0, 6, -6, 0],
            scale: [1, 1.05, 1],
          }}
          transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut' }}
          className="flex justify-center my-1 text-6xl select-none filter drop-shadow-lg"
        >
          🍋
        </motion.div>

        {/* Large Title */}
        <h1 className="font-heading text-3xl sm:text-4xl font-black text-forest-950 tracking-tight leading-none mt-2">
          Waiting for Host
        </h1>

        {/* ROOM KEY IS EXCLUSIVELY SHOWN TO THE ADMIN HOST! */}
        {isHost && (
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="inline-flex items-center gap-2 mt-3 px-4 py-2 rounded-2xl bg-amber-400/30 border-2 border-amber-500 shadow-sm"
          >
            <span className="text-xs font-black uppercase text-forest-950 tracking-wider">ROOM KEY:</span>
            <span className="font-heading text-2xl font-black tracking-widest text-forest-950">{room.code}</span>
            <button
              onClick={handleCopyCode}
              type="button"
              className="ml-1 flex h-8 w-8 items-center justify-center rounded-xl bg-lemon-400 text-forest-950 hover:bg-lemon-300 transition-all cursor-pointer shadow-sm"
              title="Copy Room Key"
            >
              {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            </button>
          </motion.div>
        )}

        {/* Connected Players Count Header */}
        <div className="mt-5 flex items-center justify-between border-b border-forest-900/15 pb-2.5">
          <h2 className="font-heading text-base font-extrabold text-forest-950 flex items-center gap-1.5">
            <Users className="h-4 w-4 text-forest-800" />
            <span>Connected Players</span>
          </h2>
          <span className="px-2.5 py-0.5 rounded-full bg-forest-900 text-lemon-300 text-xs font-black">
            Total: {playerList.length}
          </span>
        </div>

        {/* Connected Players List Cards */}
        <div className="space-y-2.5 my-4 max-h-56 overflow-y-auto pr-1">
          {playerList.map((player) => (
            <motion.div
              key={player.id}
              initial={{ opacity: 0, scale: 0.92 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ type: 'spring', stiffness: 350, damping: 22 }}
              className={`flex items-center justify-between p-2.5 rounded-2xl border-2 transition-all ${
                player.isHost
                  ? 'bg-gradient-to-r from-amber-200/90 via-yellow-100/95 to-amber-200/90 border-amber-400 shadow-sm'
                  : 'bg-white/85 border-white/70'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <div className="relative">
                  <LemonAvatar avatarId={player.avatar} size="sm" />
                  {player.isHost && (
                    <div className="absolute -top-1.5 -left-1.5 rounded-full bg-amber-400 p-0.5 text-forest-950 shadow-md">
                      <Crown className="h-3 w-3 fill-current text-forest-950" />
                    </div>
                  )}
                </div>

                <div className="text-left">
                  <div className="flex items-center gap-1">
                    <span className="font-heading text-sm font-bold text-forest-950 truncate max-w-[110px]">
                      {player.name}
                    </span>
                    <span className="text-[10px] font-black text-forest-800/70 uppercase">
                      ({getInitials(player.name)})
                    </span>
                  </div>
                  {player.isHost && (
                    <span className="inline-flex items-center gap-1 text-[9px] font-black text-amber-800 uppercase tracking-wider">
                      👑 Admin Host
                    </span>
                  )}
                </div>
              </div>

              {/* Connection Status Indicator */}
              <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-800 text-[10px] font-extrabold">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span>🟢 Connected</span>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Action Controls */}
        {isHost ? (
          <div className="mt-5 pt-3 border-t border-forest-900/15 flex flex-col items-center">
            <LemonButton
              variant="primary"
              size="lg"
              icon={<Play className="h-5 w-5 fill-current" />}
              onClick={handleStart}
              className="w-full text-base py-3 shadow-lemon-glow"
            >
              START THE GAME!
            </LemonButton>
          </div>
        ) : (
          <div className="mt-5 pt-3 border-t border-forest-900/15 text-center">
            <p className="font-heading text-sm sm:text-base font-bold text-forest-900 animate-pulse flex items-center justify-center gap-1.5">
              <Sparkles className="h-4 w-4 text-lemon-600" />
              <span>Waiting for host to start the game...</span>
              <Sparkles className="h-4 w-4 text-lemon-600" />
            </p>
          </div>
        )}
      </GlassCard>
    </div>
  );
};

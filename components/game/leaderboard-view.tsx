'use client';

import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import confetti from 'canvas-confetti';
import { Trophy, RefreshCw, Sparkles, Shield, Beer } from 'lucide-react';
import { GameRoom, Player } from '../../lib/game/types';
import { GlassCard } from '../ui/glass-card';
import { LemonButton } from '../ui/lemon-button';
import { LemonAvatar } from '../ui/lemon-avatar';
import { audioManager } from '../../lib/game/audio-manager';

export interface LeaderboardViewProps {
  room: GameRoom;
  currentPlayer: Player;
  onRestartGame: () => void;
}

export const LeaderboardView: React.FC<LeaderboardViewProps> = ({
  room,
  currentPlayer,
  onRestartGame,
}) => {
  const players = Object.values(room.players).sort((a, b) => b.shotsTaken - a.shotsTaken);
  const shotKing = players[0];
  const dodger = [...players].sort((a, b) => a.shotsTaken - b.shotsTaken)[0];

  useEffect(() => {
    audioManager.playFanfare();
    // Confetti Cannon Trigger
    try {
      confetti({
        particleCount: 120,
        spread: 80,
        origin: { y: 0.6 },
        colors: ['#FACC15', '#84CC16', '#FEFCE8', '#166534'],
      });
    } catch {
      // fallback if canvas-confetti is not loaded
    }
  }, []);

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-6">
      {/* Header */}
      <motion.div initial={{ scale: 0.8 }} animate={{ scale: 1 }} className="text-center mb-8">
        <div className="inline-flex items-center gap-2 px-4 py-1 rounded-full bg-lemon-400 text-forest-950 font-bold text-xs mb-3 shadow-md">
          <Trophy className="h-4 w-4" />
          <span>REUNION GAME OVER</span>
        </div>

        <h1 className="font-heading text-4xl sm:text-6xl font-black text-white">
          THE <span className="text-lemon-gradient">LEMON SHOT</span> PODIUM
        </h1>
        <p className="text-lime-200/90 text-sm font-medium mt-1">
          Final tallies of shots taken vs skip passes saved!
        </p>
      </motion.div>

      {/* Special MVP Badges */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
        {shotKing && (
          <GlassCard variant="glow" className="p-6 text-center border-4 border-amber-400">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-400 text-forest-950 font-black text-xs mb-2">
              <Beer className="h-4 w-4" />
              <span>LEMON SHOT KING 👑</span>
            </div>
            <div className="flex justify-center my-2">
              <LemonAvatar avatarId={shotKing.avatar} size="lg" />
            </div>
            <h3 className="font-heading text-2xl font-black text-forest-950">{shotKing.name}</h3>
            <p className="text-sm font-bold text-rose-700 mt-1">
              Took {shotKing.shotsTaken} Lemon Shots! 🍋 🥃
            </p>
          </GlassCard>
        )}

        {dodger && (
          <GlassCard variant="glow" className="p-6 text-center border-4 border-lime-400">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-lime-400 text-forest-950 font-black text-xs mb-2">
              <Shield className="h-4 w-4" />
              <span>MASTER SHOT DODGER 🛡️</span>
            </div>
            <div className="flex justify-center my-2">
              <LemonAvatar avatarId={dodger.avatar} size="lg" />
            </div>
            <h3 className="font-heading text-2xl font-black text-forest-950">{dodger.name}</h3>
            <p className="text-sm font-bold text-forest-800 mt-1">
              Only {dodger.shotsTaken} shots taken! ({dodger.skipsRemaining} Skips left)
            </p>
          </GlassCard>
        )}
      </div>

      {/* Full Player Leaderboard Table */}
      <GlassCard variant="dark" className="mb-8 p-6">
        <h3 className="font-heading text-xl font-bold text-white mb-4 flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-lemon-400" />
          <span>Full Party Standings</span>
        </h3>

        <div className="space-y-3">
          {players.map((p, idx) => (
            <div
              key={p.id}
              className="flex items-center justify-between p-3.5 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20"
            >
              <div className="flex items-center gap-3">
                <span className="font-heading text-xl font-extrabold text-lemon-300 w-6">
                  #{idx + 1}
                </span>
                <LemonAvatar avatarId={p.avatar} size="sm" />
                <span className="font-heading text-base font-bold text-white truncate max-w-[140px]">
                  {p.name}
                </span>
              </div>

              <div className="flex items-center gap-4 text-xs font-bold">
                <span className="px-3 py-1 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/40">
                  {p.shotsTaken} Shots 🍋
                </span>
                <span className="px-3 py-1 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/40">
                  {p.skipsRemaining} Skips ⚡
                </span>
              </div>
            </div>
          ))}
        </div>
      </GlassCard>

      {/* Host Restart Control */}
      {currentPlayer.isHost && (
        <div className="flex justify-center">
          <LemonButton
            variant="primary"
            size="xl"
            icon={<RefreshCw className="h-6 w-6" />}
            onClick={() => {
              audioManager.playPop();
              onRestartGame();
            }}
            className="px-12"
          >
            PLAY AGAIN (NEW GAME)!
          </LemonButton>
        </div>
      )}
    </div>
  );
};

'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Flame, Send, ArrowRight, Volume2 } from 'lucide-react';
import { ActiveRound, GameRoom, Player } from '@/lib/game/types';
import { GlassCard } from '../ui/glass-card';
import { LemonButton } from '../ui/lemon-button';
import { LemonAvatar } from '../ui/lemon-avatar';
import { CircularCountdown } from '../ui/countdown';
import { audioManager } from '@/lib/game/audio-manager';

export interface HotLemonViewProps {
  room: GameRoom;
  activeRound: ActiveRound;
  currentPlayer: Player;
  secondsRemaining: number;
  onPassHotLemon: () => void;
  onNextRound: () => void;
}

export const HotLemonView: React.FC<HotLemonViewProps> = ({
  room,
  activeRound,
  currentPlayer,
  secondsRemaining,
  onPassHotLemon,
  onNextRound,
}) => {
  const hotLemon = activeRound.hotLemon;
  const currentHolder = hotLemon ? room.players[hotLemon.currentHolderId] : null;
  const isMyTurn = currentHolder?.id === currentPlayer.id;
  const isResultPhase = activeRound.phase === 'RESULT';

  const handlePass = () => {
    if (!isMyTurn || isResultPhase) return;
    audioManager.playPop();
    onPassHotLemon();
  };

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-6 relative z-20">
      {/* Header with Animation Banner (NO QUESTION TEXT DISPLAYED!) */}
      <GlassCard variant="glow" hoverEffect={false} className="mb-6 text-center p-6 border-4 border-lime-400">
        <div className="flex items-center justify-between mb-3">
          <span className="px-3.5 py-1 rounded-full bg-forest-900 text-xs font-bold text-lime-300 flex items-center gap-1.5">
            <Flame className="h-4 w-4 text-amber-400 animate-bounce" />
            ROUND {activeRound.roundNumber} / {activeRound.totalRounds} • HOT LEMON BOMB PASS
          </span>

          {!isResultPhase && (
            <CircularCountdown seconds={secondsRemaining} maxSeconds={activeRound.question.timerSeconds} size={70} strokeWidth={6} />
          )}
        </div>

        {/* Animated Announcement Illustration */}
        <div className="flex flex-col items-center justify-center my-2">
          <motion.div
            animate={{
              scale: [1, 1.12, 1],
              rotate: [0, 6, -6, 0],
            }}
            transition={{ duration: 2.8, repeat: Infinity, ease: 'easeInOut' }}
            className="text-5xl sm:text-6xl mb-2 filter drop-shadow-lg select-none"
          >
            🎙️ 💣 🍋
          </motion.div>

          <h2 className="font-heading text-2xl sm:text-4xl font-black text-forest-950 tracking-tight">
            Listen to the Host!
          </h2>

          <p className="text-xs sm:text-sm font-extrabold text-lime-800 uppercase tracking-wider mt-1">
            Host is reading the challenge aloud...
          </p>
        </div>
      </GlassCard>

      {/* Main Bomb Canvas */}
      {!isResultPhase && (
        <div className="flex flex-col items-center justify-center my-8">
          <motion.div
            animate={{
              scale: secondsRemaining < 5 ? [1, 1.25, 1] : [1, 1.08, 1],
              rotate: [0, -5, 5, 0],
            }}
            transition={{
              duration: secondsRemaining < 5 ? 0.3 : 0.8,
              repeat: Infinity,
            }}
            className="relative flex items-center justify-center h-44 w-44 rounded-full bg-gradient-to-br from-amber-300 via-yellow-400 to-lime-500 shadow-lemon-glow border-4 border-white"
          >
            <span className="text-8xl select-none filter drop-shadow">🍋</span>
            <div className="absolute -top-3 -right-3 rounded-full bg-rose-500 p-2 text-white shadow-md animate-pulse">
              <Flame className="h-7 w-7" />
            </div>
          </motion.div>

          {currentHolder && (
            <motion.div initial={{ scale: 0.8 }} animate={{ scale: 1 }} className="mt-6 text-center">
              <span className="text-xs font-black uppercase tracking-widest text-lime-200">
                CURRENT LEMON HOLDER:
              </span>
              <div className="flex items-center gap-3 mt-2 px-6 py-3 rounded-full bg-white/20 backdrop-blur-md border border-white/40 shadow-lg">
                <LemonAvatar avatarId={currentHolder.avatar} size="sm" />
                <span className="font-heading text-2xl font-black text-white">{currentHolder.name}</span>
              </div>
            </motion.div>
          )}

          {isMyTurn && (
            <motion.div initial={{ y: 20 }} animate={{ y: 0 }} className="mt-8">
              <LemonButton
                variant="primary"
                size="xl"
                icon={<Send className="h-7 w-7" />}
                onClick={handlePass}
                className="px-12 animate-bounce"
              >
                PASS HOT LEMON NOW!
              </LemonButton>
            </motion.div>
          )}

          {!isMyTurn && (
            <p className="mt-6 text-sm font-bold text-lime-200/80 animate-pulse">
              Shout out loud! Waiting for {currentHolder?.name} to pass...
            </p>
          )}
        </div>
      )}

      {/* Explosion Result Phase */}
      {isResultPhase && (
        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
          <GlassCard variant="glow" hoverEffect={false} className="p-8 text-center border-4 border-rose-500">
            <div className="text-6xl mb-2">💥 🍋</div>
            <h3 className="font-heading text-3xl sm:text-5xl font-black text-rose-600">
              BOOM! THE LEMON EXPLODED!
            </h3>
            {currentHolder && (
              <p className="text-lg font-extrabold text-forest-950 mt-3">
                {currentHolder.name} was caught holding the lemon and gets {activeRound.shotsAssigned || 1} Lemon Shot!
              </p>
            )}

            {currentPlayer.isHost && (
              <div className="mt-8">
                <LemonButton
                  variant="primary"
                  size="lg"
                  icon={<ArrowRight className="h-6 w-6" />}
                  onClick={() => {
                    audioManager.playPop();
                    onNextRound();
                  }}
                  className="w-full sm:w-auto px-10"
                >
                  NEXT ROUND →
                </LemonButton>
              </div>
            )}
          </GlassCard>
        </motion.div>
      )}
    </div>
  );
};

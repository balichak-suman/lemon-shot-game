'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Zap, ArrowRight, ShieldCheck, Volume2 } from 'lucide-react';
import { ActiveRound, GameRoom, Player } from '../../lib/game/types';
import { GlassCard } from '../ui/glass-card';
import { LemonButton } from '../ui/lemon-button';
import { LemonAvatar } from '../ui/lemon-avatar';
import { CircularCountdown } from '../ui/countdown';
import { GlassDialog } from '../ui/glass-dialog';
import { audioManager } from '../../lib/game/audio-manager';

export interface TruthDareViewProps {
  room: GameRoom;
  activeRound: ActiveRound;
  currentPlayer: Player;
  secondsRemaining: number;
  onUseSkip: (targetPlayerId: string) => void;
  onNextRound: () => void;
}

export const TruthDareView: React.FC<TruthDareViewProps> = ({
  room,
  activeRound,
  currentPlayer,
  secondsRemaining,
  onUseSkip,
  onNextRound,
}) => {
  const [showSkipModal, setShowSkipModal] = useState(false);
  const [skipTargetId, setSkipTargetId] = useState<string | null>(null);

  const players = Object.values(room.players);
  const isResultPhase = activeRound.phase === 'RESULT';
  const loserPlayer = activeRound.loserPlayerId ? room.players[activeRound.loserPlayerId] : null;

  const handleExecuteSkip = () => {
    if (!skipTargetId) return;
    audioManager.playSkipWhip();
    onUseSkip(skipTargetId);
    setShowSkipModal(false);
  };

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-6 relative z-20">
      {/* Header (NO QUESTION TEXT DISPLAYED!) */}
      <GlassCard variant="glow" hoverEffect={false} className="mb-6 text-center p-6 border-4 border-amber-400">
        <div className="flex items-center justify-between mb-3">
          <span className="px-3.5 py-1 rounded-full bg-forest-900 text-xs font-bold text-amber-300">
            ROUND {activeRound.roundNumber} • REUNION TRUTH OR DARE
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
            🎙️ 🎭 🍋
          </motion.div>

          <h2 className="font-heading text-2xl sm:text-4xl font-black text-forest-950 tracking-tight">
            Listen to the Host!
          </h2>

          <p className="text-xs sm:text-sm font-extrabold text-lime-800 uppercase tracking-wider mt-1">
            Host is reading the truth or dare challenge aloud...
          </p>
        </div>
      </GlassCard>

      {/* Target Action Card */}
      {!isResultPhase && (
        <div className="flex flex-col items-center justify-center space-y-6">
          <GlassCard variant="accent" className="w-full p-8 text-center border-2 border-lime-400">
            <h3 className="font-heading text-xl font-bold text-lime-300">
              COMPLETE THE CHALLENGE OR USE A SKIP TOKEN!
            </h3>
            <p className="text-sm font-medium text-white/80 mt-2">
              If you refuse to do the dare, you must take a Lemon Shot unless you use a Skip Token 🍋⚡!
            </p>

            <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-4">
              <LemonButton
                variant="skip"
                size="lg"
                icon={<Zap className="h-6 w-6" />}
                onClick={() => setShowSkipModal(true)}
              >
                PASS THE CHALLENGE! ⚡
              </LemonButton>
            </div>
          </GlassCard>
        </div>
      )}

      {/* Result Phase */}
      {isResultPhase && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <GlassCard variant="glow" hoverEffect={false} className="p-8 text-center border-4 border-lemon-400">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-forest-900 text-lemon-300 text-xs font-bold mb-3">
              <ShieldCheck className="h-4 w-4 text-lime-400" />
              <span>CHALLENGE COMPLETE</span>
            </div>

            {loserPlayer && (
              <div className="flex flex-col items-center my-4">
                <LemonAvatar avatarId={loserPlayer.avatar} size="xl" />
                <h3 className="font-heading text-3xl font-black text-forest-950 mt-3">
                  {loserPlayer.name}
                </h3>
                <p className="text-base font-bold text-forest-800 mt-1">
                  Takes the penalty shot or completes the dare!
                </p>
              </div>
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

      {/* Skip Token Dialog */}
      <GlassDialog
        isOpen={showSkipModal}
        onClose={() => setShowSkipModal(false)}
        title="⚡ SKIP THE LEMON SHOT!"
        description="Select a friend to pass the dare penalty to:"
      >
        <div className="grid grid-cols-2 gap-3 my-4">
          {players
            .filter((p) => p.id !== currentPlayer.id)
            .map((player) => (
              <div
                key={player.id}
                onClick={() => setSkipTargetId(player.id)}
                className={`flex items-center gap-3 p-3 rounded-2xl border-2 cursor-pointer transition-all ${
                  skipTargetId === player.id ? 'bg-amber-300 border-forest-900 font-bold' : 'bg-white/60 border-white/40'
                }`}
              >
                <LemonAvatar avatarId={player.avatar} size="sm" />
                <span className="font-heading text-sm text-forest-950 truncate">{player.name}</span>
              </div>
            ))}
        </div>

        <LemonButton
          variant="danger"
          size="lg"
          disabled={!skipTargetId}
          onClick={handleExecuteSkip}
          className="w-full"
        >
          CONFIRM SKIP REDIRECT!
        </LemonButton>
      </GlassDialog>
    </div>
  );
};

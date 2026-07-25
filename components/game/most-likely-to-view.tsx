'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, ShieldAlert, Zap, AlertTriangle, ArrowRight, Volume2 } from 'lucide-react';
import { ActiveRound, GameRoom, Player } from '../../lib/game/types';
import { GlassCard } from '../ui/glass-card';
import { LemonButton } from '../ui/lemon-button';
import { LemonAvatar } from '../ui/lemon-avatar';
import { CircularCountdown } from '../ui/countdown';
import { GlassDialog } from '../ui/glass-dialog';
import { CinematicWinnerReveal } from './cinematic-winner-reveal';
import { audioManager } from '../../lib/game/audio-manager';

export interface MostLikelyToViewProps {
  room: GameRoom;
  activeRound: ActiveRound;
  currentPlayer: Player;
  secondsRemaining: number;
  onSubmitVote: (targetPlayerIds: string[]) => void;
  onUseSkip: (targetPlayerId: string) => void;
  onNextRound: () => void;
}

export const MostLikelyToView: React.FC<MostLikelyToViewProps> = ({
  room,
  activeRound,
  currentPlayer,
  secondsRemaining,
  onSubmitVote,
  onUseSkip,
  onNextRound,
}) => {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [hasSubmitted, setHasSubmitted] = useState<boolean>(false);
  const [showSkipModal, setShowSkipModal] = useState(false);
  const [skipTargetId, setSkipTargetId] = useState<string | null>(null);

  const players = Object.values(room.players);
  const isResultPhase = activeRound.phase === 'RESULT';
  const loserPlayer = activeRound.loserPlayerId ? room.players[activeRound.loserPlayerId] : null;
  const isLoser = activeRound.loserPlayerId === currentPlayer.id;

  const handleCardClick = (playerId: string) => {
    if (hasSubmitted || isResultPhase || playerId === currentPlayer.id) {
      if (playerId === currentPlayer.id) audioManager.playShotBuzzer();
      return;
    }

    audioManager.playPop();

    if (selectedIds.includes(playerId)) {
      setSelectedIds(selectedIds.filter((id) => id !== playerId));
    } else {
      if (selectedIds.length < 2) {
        setSelectedIds([...selectedIds, playerId]);
      }
    }
  };

  const handleFormSubmit = () => {
    if (selectedIds.length !== 2 || hasSubmitted) return;
    audioManager.playPop();
    setHasSubmitted(true);
    onSubmitVote(selectedIds);
  };

  const handleExecuteSkip = () => {
    if (!skipTargetId) return;
    audioManager.playSkipWhip();
    onUseSkip(skipTargetId);
    setShowSkipModal(false);
  };

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-6 relative z-20 flex flex-col items-center">
      {/* Top Section: Large Circular Countdown Timer (120s) */}
      {!isResultPhase && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="mb-4 flex flex-col items-center"
        >
          <CircularCountdown
            seconds={secondsRemaining}
            maxSeconds={activeRound.question.timerSeconds || 120}
            size={120}
            strokeWidth={10}
          />
        </motion.div>
      )}

      {/* Main Animated Announcement Card (NO QUESTION TEXT DISPLAYED!) */}
      <GlassCard
        variant="glow"
        hoverEffect={false}
        className="w-full mb-6 text-center p-6 sm:p-8 border-4 border-lemon-400/90 shadow-lemon-glow"
      >
        <span className="px-3.5 py-1 rounded-full bg-forest-900 text-xs font-black text-lemon-300 uppercase tracking-widest inline-flex items-center gap-1.5">
          <Volume2 className="h-4 w-4 text-lemon-400 animate-pulse" />
          <span>ROUND {activeRound.roundNumber} • SUPERLATIVE VOTING</span>
        </span>

        {/* Animated Microphone & Lemon Graphic */}
        <div className="flex flex-col items-center justify-center my-3">
          <motion.div
            animate={{
              scale: [1, 1.12, 1],
              rotate: [0, 6, -6, 0],
            }}
            transition={{ duration: 2.8, repeat: Infinity, ease: 'easeInOut' }}
            className="text-6xl sm:text-7xl mb-2 filter drop-shadow-xl select-none"
          >
            🎙️ 🍋
          </motion.div>

          <h2 className="font-heading text-3xl sm:text-5xl font-black text-forest-950 tracking-tight">
            Listen to the Host!
          </h2>

          <p className="text-sm sm:text-base font-extrabold text-lime-800 uppercase tracking-wider mt-1">
            Host is reading the question aloud...
          </p>
        </div>

        {!isResultPhase && !hasSubmitted && (
          <p className="font-heading text-lg sm:text-xl font-bold text-forest-950 mt-2 bg-lemon-400/40 px-4 py-1.5 rounded-full inline-block">
            Choose TWO people.
          </p>
        )}
      </GlassCard>

      {/* Voting Screen Content */}
      {!isResultPhase && (
        <div className="w-full flex flex-col items-center mb-8">
          {/* Status Indicator / Selection Counter */}
          {!hasSubmitted ? (
            <div className="flex items-center justify-between w-full max-w-md mb-4 px-2">
              <span className="text-xs font-extrabold uppercase tracking-wider text-lime-200">
                Select 2 Distinct Friends:
              </span>
              <span className="font-heading text-lg font-black text-lemon-300 bg-black/30 px-3 py-0.5 rounded-full border border-lemon-400/40">
                Selected {selectedIds.length} / 2
              </span>
            </div>
          ) : (
            /* Post-Submission Banner */
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="w-full max-w-md mb-6 p-5 rounded-3xl bg-emerald-500/20 border-2 border-emerald-400 text-center backdrop-blur-md shadow-lg"
            >
              <CheckCircle2 className="h-10 w-10 text-emerald-400 mx-auto mb-1 animate-bounce" />
              <h2 className="font-heading text-2xl font-black text-white">Vote Submitted</h2>
              <p className="text-sm font-bold text-emerald-200 mt-0.5 animate-pulse">
                Waiting for results...
              </p>
            </motion.div>
          )}

          {/* Animated Player Cards Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 w-full">
            {players.map((player) => {
              const isSelected = selectedIds.includes(player.id);
              const isSelf = player.id === currentPlayer.id;

              return (
                <motion.div
                  key={player.id}
                  whileHover={!hasSubmitted && !isSelf ? { y: -6, scale: 1.03 } : undefined}
                  whileTap={!hasSubmitted && !isSelf ? { scale: 0.95 } : undefined}
                  transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                  className="relative"
                >
                  <GlassCard
                    variant={isSelected ? 'glow' : isSelf ? 'dark' : 'light'}
                    hoverEffect={false}
                    onClick={() => handleCardClick(player.id)}
                    className={`flex flex-col items-center justify-center p-4 border-3 transition-all duration-300 cursor-pointer ${
                      isSelf
                        ? 'opacity-60 cursor-not-allowed border-gray-500/30'
                        : isSelected
                        ? 'border-lemon-400 shadow-lemon-glow ring-4 ring-lemon-300/60 scale-105'
                        : 'border-white/50 hover:border-lime-400'
                    } ${hasSubmitted ? 'pointer-events-none opacity-80' : ''}`}
                  >
                    {/* Juice Splash Effect Overlay 🍋💦 */}
                    <AnimatePresence>
                      {isSelected && (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.5 }}
                          animate={{ opacity: 1, scale: 1.2 }}
                          exit={{ opacity: 0, scale: 0.5 }}
                          className="pointer-events-none absolute inset-0 flex items-center justify-center text-4xl opacity-40 z-0"
                        >
                          💦
                        </motion.div>
                      )}
                    </AnimatePresence>

                    <div className="relative z-10">
                      <LemonAvatar avatarId={player.avatar} size="lg" selected={isSelected} />
                    </div>

                    <span className="relative z-10 font-heading text-base font-bold mt-2 truncate max-w-[120px] text-forest-950">
                      {player.name}
                    </span>

                    {isSelf && (
                      <span className="mt-1 text-[10px] font-black text-rose-300 bg-black/40 px-2 py-0.5 rounded-full">
                        (Cannot vote yourself)
                      </span>
                    )}

                    {isSelected && (
                      <motion.span
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="mt-1 text-xs font-black text-forest-950 bg-lemon-400 px-3 py-0.5 rounded-full shadow-md"
                      >
                        ✓ SELECTED
                      </motion.span>
                    )}
                  </GlassCard>
                </motion.div>
              );
            })}
          </div>

          {/* Primary Submit Button */}
          {!hasSubmitted && (
            <div className="mt-8 w-full flex justify-center">
              <LemonButton
                variant="primary"
                size="xl"
                disabled={selectedIds.length !== 2}
                onClick={handleFormSubmit}
                className="w-full sm:w-auto px-12 text-xl shadow-lemon-glow"
              >
                {selectedIds.length === 2 ? 'SUBMIT VOTES ✓' : `SELECT ${2 - selectedIds.length} MORE`}
              </LemonButton>
            </div>
          )}
        </div>
      )}

      {/* Result Phase Cinematic Winner Reveal */}
      {isResultPhase && (
        <CinematicWinnerReveal
          winnerPlayer={loserPlayer}
          shotsAssigned={activeRound.shotsAssigned || 1}
          skippedBy={activeRound.skippedBy}
          currentPlayer={currentPlayer}
          isHost={currentPlayer.isHost}
          onNextRound={onNextRound}
          onRestartGame={() => {
            if (onNextRound) onNextRound();
          }}
          onUseSkipToken={() => setShowSkipModal(true)}
        />
      )}

      {/* Pass Challenge Redirect Dialog */}
      <GlassDialog
        isOpen={showSkipModal}
        onClose={() => setShowSkipModal(false)}
        title="⚡ PASS THE CHALLENGE!"
        description="Select a friend to redirect the penalty shot to:"
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

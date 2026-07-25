'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import confetti from 'canvas-confetti';
import { ArrowRight, RefreshCw, Zap, Sparkles, Beer, Send } from 'lucide-react';
import { Player } from '../../lib/game/types';
import { GlassCard } from '../ui/glass-card';
import { LemonButton } from '../ui/lemon-button';
import { LemonAvatar } from '../ui/lemon-avatar';
import { audioManager } from '../../lib/game/audio-manager';

export interface CinematicWinnerRevealProps {
  winnerPlayer: Player | null;
  shotsAssigned: number;
  skippedBy?: {
    fromPlayerId: string;
    fromPlayerName: string;
    toPlayerId: string;
    toPlayerName: string;
  };
  currentPlayer: Player;
  isHost: boolean;
  onNextRound: () => void;
  onRestartGame: () => void;
  onUseSkipToken?: () => void;
}

export const CinematicWinnerReveal: React.FC<CinematicWinnerRevealProps> = ({
  winnerPlayer,
  shotsAssigned,
  skippedBy,
  currentPlayer,
  isHost,
  onNextRound,
  onRestartGame,
  onUseSkipToken,
}) => {
  // Sequence steps: 0 = Darken/Spotlight, 1 = Lemon Drop, 2 = Drumroll, 3 = Suspense Pause, 4 = WINNER FINALE EXPLOSION!
  const [step, setStep] = useState<number>(0);
  const [acceptedShot, setAcceptedShot] = useState<boolean>(false);

  useEffect(() => {
    const t1 = setTimeout(() => {
      setStep(1);
      audioManager.playPop();
    }, 400);

    const t2 = setTimeout(() => {
      setStep(2);
      audioManager.playTick();
    }, 1600);

    const t3 = setTimeout(() => {
      setStep(3);
      audioManager.playTick();
    }, 2700);

    const t4 = setTimeout(() => {
      setStep(4);
      audioManager.playFanfare();
      try {
        confetti({
          particleCount: 180,
          spread: 100,
          origin: { y: 0.5 },
          colors: ['#FACC15', '#84CC16', '#FEFCE8', '#EF4444', '#EAB308'],
        });
      } catch {
        // ignore
      }
    }, 3700);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
    };
  }, []);

  const isLoser = winnerPlayer?.id === currentPlayer.id;

  const handleAcceptShot = () => {
    audioManager.playShotBuzzer();
    setAcceptedShot(true);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex flex-col items-center justify-center p-4 bg-black/92 backdrop-blur-2xl overflow-y-auto select-none"
    >
      {/* Game Show Spotlight Light Beam */}
      <div className="pointer-events-none absolute top-0 left-1/2 -translate-x-1/2 w-[30rem] h-[100vh] bg-gradient-to-b from-lemon-300/35 via-lime-400/10 to-transparent blur-3xl" />

      {/* Step 1+: Giant Dropping & Bouncing Lemon 🍋 */}
      {step >= 1 && (
        <motion.div
          initial={{ y: -650, scale: 0.5, rotate: -35 }}
          animate={{
            y: [-650, 0, -75, 0, -25, 0],
            scale: [0.5, 1.45, 1.1, 1.3, 1.15, 1.2],
            rotate: [-35, 10, -10, 5, 0],
          }}
          transition={{ duration: 1.4, ease: 'easeOut' }}
          className="text-7xl sm:text-8xl my-2 filter drop-shadow-[0_0_50px_rgba(250,204,21,0.9)] z-10"
        >
          🍋
        </motion.div>
      )}

      {/* Step 2 & 3: Drum-roll & Suspense Text */}
      {step >= 2 && step < 4 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center my-6 z-10 space-y-3"
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-lemon-400/25 text-lemon-300 text-xs font-black uppercase tracking-widest border border-lemon-400/50 shadow-lg animate-pulse">
            <Sparkles className="h-4 w-4 text-lemon-300" />
            <span>🥁 DRUM-ROLL FINALE...</span>
          </div>

          <h2 className="font-heading text-3xl sm:text-6xl font-black text-white tracking-tight drop-shadow-lg">
            The Lemon Shot Goes To...
          </h2>

          {step === 3 && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-lime-300 font-extrabold text-2xl tracking-wide animate-bounce"
            >
              Get ready... 😂
            </motion.p>
          )}
        </motion.div>
      )}

      {/* Step 4: WINNER ANNOUNCEMENT CARD */}
      {step >= 4 && winnerPlayer && (
        <motion.div
          initial={{ scale: 0, opacity: 0, rotate: -8 }}
          animate={{ scale: [0, 1.25, 1], opacity: 1, rotate: 0 }}
          transition={{ type: 'spring', stiffness: 380, damping: 22 }}
          className="w-full max-w-md z-20 text-center relative my-auto"
        >
          {/* Animated Juice Splash Effect 💦 */}
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: [0, 1, 0], scale: [0.8, 1.6, 2] }}
            transition={{ duration: 1.2, repeat: Infinity, repeatDelay: 1 }}
            className="pointer-events-none absolute -inset-10 flex items-center justify-center text-7xl opacity-35 z-0"
          >
            💦 🍋 💦
          </motion.div>

          <GlassCard
            variant="glow"
            hoverEffect={false}
            className="relative z-10 p-6 sm:p-8 border-4 border-lemon-400 shadow-[0_0_50px_rgba(250,204,21,0.5)] text-center"
          >
            {/* Winner Avatar */}
            <div className="flex justify-center my-2">
              <LemonAvatar avatarId={winnerPlayer.avatar} size="xl" />
            </div>

            {/* Winner Name */}
            <h1 className="font-heading text-3xl sm:text-5xl font-black text-forest-950 tracking-tight leading-none mt-2">
              {winnerPlayer.name}
            </h1>

            {/* Notification / Status Card */}
            {skippedBy ? (
              <div className="mt-3 p-3.5 rounded-2xl bg-amber-400/40 text-sm font-black text-forest-950 border-2 border-amber-500 shadow-sm">
                ⚡ CHALLENGE PASSED! {skippedBy.fromPlayerName} passed the challenge to {skippedBy.toPlayerName}! 🍋
              </div>
            ) : acceptedShot ? (
              <div className="mt-3 p-3.5 rounded-2xl bg-rose-500/25 text-sm font-black text-rose-900 border-2 border-rose-500 shadow-sm">
                🍺 TAKING THE LEMON SHOT! Bottoms up! 🥃 🍋
              </div>
            ) : (
              <div className="mt-3 p-3 rounded-2xl bg-rose-500/15 border-2 border-rose-500/40">
                <p className="font-heading text-base font-extrabold text-rose-900 uppercase tracking-wider">
                  You Have Been Selected!
                </p>
                <p className="font-heading text-xs font-bold text-forest-800">
                  Pass the challenge or take the Lemon Shot!
                </p>
              </div>
            )}

            <div className="text-3xl my-2">😂</div>

            {/* WINNER ACTIONS: PASS CHALLENGE vs HAVE THE SHOT */}
            {isLoser && !skippedBy && !acceptedShot && (
              <div className="mt-4 flex flex-col gap-2.5">
                {currentPlayer.skipsRemaining > 0 && onUseSkipToken && (
                  <LemonButton
                    variant="skip"
                    size="lg"
                    icon={<Send className="h-5 w-5" />}
                    onClick={onUseSkipToken}
                    className="w-full text-base py-3 shadow-md"
                  >
                    PASS CHALLENGE TO ANOTHER PERSON ⚡ ({currentPlayer.skipsRemaining} Left)
                  </LemonButton>
                )}

                <LemonButton
                  variant="danger"
                  size="lg"
                  icon={<Beer className="h-5 w-5" />}
                  onClick={handleAcceptShot}
                  className="w-full text-base py-3 shadow-md"
                >
                  HAVE THE LEMON SHOT 🥃
                </LemonButton>
              </div>
            )}

            {/* Host Controls */}
            <div className="mt-6 pt-4 border-t border-forest-900/15">
              {isHost ? (
                <div className="flex flex-col sm:flex-row items-center justify-center gap-2.5">
                  <LemonButton
                    variant="primary"
                    size="lg"
                    icon={<ArrowRight className="h-5 w-5" />}
                    onClick={() => {
                      audioManager.playPop();
                      onNextRound();
                    }}
                    className="w-full sm:w-auto px-8 text-base shadow-lemon-glow"
                  >
                    START NEXT ROUND →
                  </LemonButton>

                  <button
                    onClick={() => {
                      audioManager.playPop();
                      onRestartGame();
                    }}
                    className="flex items-center gap-1.5 text-xs font-bold text-forest-800 hover:text-forest-950 underline mt-1 sm:mt-0 cursor-pointer"
                  >
                    <RefreshCw className="h-3.5 w-3.5" /> Reset Game
                  </button>
                </div>
              ) : (
                <p className="font-heading text-sm font-bold text-forest-900 animate-pulse">
                  Waiting for next round...
                </p>
              )}
            </div>
          </GlassCard>
        </motion.div>
      )}
    </motion.div>
  );
};

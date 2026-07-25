'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import { ArrowRight, RefreshCw, Sparkles, Beer, Send, Swords, Shuffle } from 'lucide-react';
import { GameRoom, Player } from '../../lib/game/types';
import { GlassCard } from '../ui/glass-card';
import { LemonButton } from '../ui/lemon-button';
import { LemonAvatar } from '../ui/lemon-avatar';
import { audioManager } from '../../lib/game/audio-manager';

export interface CinematicWinnerRevealProps {
  room: GameRoom;
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
  room,
  winnerPlayer,
  shotsAssigned,
  skippedBy,
  currentPlayer,
  isHost,
  onNextRound,
  onRestartGame,
  onUseSkipToken,
}) => {
  const activeRound = room.activeRound;
  const isTie = activeRound?.isTie && (activeRound?.tiedPlayerIds?.length || 0) > 1;
  const tiedPlayerIds = activeRound?.tiedPlayerIds || [];
  const tiedPlayers = tiedPlayerIds.map((id) => room.players[id]).filter(Boolean);

  const [step, setStep] = useState<number>(0);
  const [rouletteIndex, setRouletteIndex] = useState<number>(0);
  const [acceptedShot, setAcceptedShot] = useState<boolean>(false);

  useEffect(() => {
    // If it's a tie, sequence is slightly longer for the roulette spin animation!
    const delayStep1 = 400;
    const delayStep2 = 1600;
    const delayStep3 = isTie ? 5000 : 2700;
    const delayStep4 = isTie ? 6200 : 3700;

    const t1 = setTimeout(() => {
      setStep(1);
      audioManager.playPop();
    }, delayStep1);

    const t2 = setTimeout(() => {
      setStep(2);
      audioManager.playTick();
    }, delayStep2);

    const t3 = setTimeout(() => {
      setStep(3);
      audioManager.playTick();
    }, delayStep3);

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
    }, delayStep4);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
    };
  }, [isTie]);

  // Roulette Shuffle Animation during Step 2 when it's a tie!
  useEffect(() => {
    if (step === 2 && isTie && tiedPlayers.length > 1) {
      let currentIdx = 0;
      const interval = setInterval(() => {
        currentIdx = (currentIdx + 1) % tiedPlayers.length;
        setRouletteIndex(currentIdx);
        audioManager.playTick();
      }, 250);

      return () => clearInterval(interval);
    }
  }, [step, isTie, tiedPlayers.length]);

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

      {/* Step 2: TIE DRAW ANNOUNCEMENT & ROULETTE SHUFFLE ANIMATION */}
      {step >= 2 && step < 4 && isTie && (
        <motion.div
          initial={{ opacity: 0, scale: 0.85 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center my-4 z-20 w-full max-w-md"
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-rose-500/30 text-rose-300 text-xs font-black uppercase tracking-widest border border-rose-400/60 shadow-lg animate-pulse mb-2">
            <Swords className="h-4 w-4 text-rose-400" />
            <span>⚔️ IT'S A TIE! EQUAL VOTES! ⚔️</span>
          </div>

          <h2 className="font-heading text-2xl sm:text-4xl font-black text-white tracking-tight drop-shadow-md">
            Randomly Picking Victim...
          </h2>
          <p className="text-xs sm:text-sm font-extrabold text-amber-300 uppercase tracking-wider mt-1 mb-4 flex items-center justify-center gap-1.5">
            <Shuffle className="h-4 w-4 animate-spin" />
            <span>Picking between tied players:</span>
          </p>

          {/* Tied Players Roulette Cards Row */}
          <div className="flex flex-wrap items-center justify-center gap-3 my-3">
            {tiedPlayers.map((player, idx) => {
              const isHighlighted = idx === rouletteIndex && step === 2;
              return (
                <motion.div
                  key={player.id}
                  animate={isHighlighted ? { scale: 1.18, y: -6 } : { scale: 0.95, y: 0 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                  className={`p-3 rounded-2xl border-3 backdrop-blur-md transition-all ${
                    isHighlighted
                      ? 'bg-lemon-400/90 border-white shadow-[0_0_30px_rgba(250,204,21,0.9)] text-forest-950 font-black'
                      : 'bg-white/10 border-white/20 text-white font-bold opacity-75'
                  }`}
                >
                  <LemonAvatar avatarId={player.avatar} size="sm" />
                  <p className="font-heading text-xs font-black mt-1 truncate max-w-[80px]">
                    {player.name}
                  </p>
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      )}

      {/* Step 2 & 3 Normal Drum-roll for Non-Tie */}
      {step >= 2 && step < 4 && !isTie && (
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
            {isTie && (
              <div className="mt-2 px-3 py-1 rounded-full bg-rose-500/20 text-xs font-black text-rose-900 border border-rose-400/50 inline-block">
                🎲 Picked By Fate in Equal Votes Draw!
              </div>
            )}

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
                {onUseSkipToken && (
                  <LemonButton
                    variant="skip"
                    size="lg"
                    icon={<Send className="h-5 w-5" />}
                    onClick={onUseSkipToken}
                    className="w-full text-base py-3 shadow-md"
                  >
                    PASS CHALLENGE TO ANOTHER PERSON ⚡
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

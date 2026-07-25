'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldCheck, UserCheck, Sparkles, Volume2, VolumeX, AlertCircle, KeyRound, Lock, User } from 'lucide-react';
import { GlassCard } from '../ui/glass-card';
import { LemonButton } from '../ui/lemon-button';
import { LemonAvatar, LEMON_AVATARS } from '../ui/lemon-avatar';
import { audioManager } from '../../lib/game/audio-manager';

export interface LandingViewProps {
  onCreateRoom: (name: string, avatar: string) => void;
  onJoinRoom: (code: string, name: string, avatar: string) => void;
  error?: string;
}

export const LandingView: React.FC<LandingViewProps> = ({
  onCreateRoom,
  onJoinRoom,
  error,
}) => {
  const [isAdminMode, setIsAdminMode] = useState(false);
  const [name, setName] = useState('');
  const [roomCode, setRoomCode] = useState('');
  const [adminUsername, setAdminUsername] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState('lemon-king');
  const [validationError, setValidationError] = useState('');
  const [soundOn, setSoundOn] = useState(audioManager.isEnabled());

  const handleToggleSound = () => {
    const enabled = audioManager.toggleSound();
    setSoundOn(enabled);
    if (enabled) audioManager.playPop();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError('');

    if (isAdminMode) {
      // Fixed Admin Credentials Check: Username "admin" & Password "admin"
      const cleanUser = adminUsername.trim().toLowerCase();
      const cleanPass = adminPassword.trim();

      if (!cleanUser || !cleanPass) {
        audioManager.playShotBuzzer();
        setValidationError('Admin Username and Password are required.');
        return;
      }

      if (cleanUser !== 'admin' || cleanPass !== 'admin') {
        audioManager.playShotBuzzer();
        setValidationError('Invalid Admin Credentials! (Use: admin / admin)');
        return;
      }

      audioManager.playPop();
      // Admin logs in as Host
      onCreateRoom('Admin Host', selectedAvatar);
    } else {
      // Regular Player Join Validation (Name AND Room Key are mandatory!)
      if (!name.trim()) {
        audioManager.playShotBuzzer();
        setValidationError('Name cannot be empty.');
        return;
      }
      if (!roomCode.trim()) {
        audioManager.playShotBuzzer();
        setValidationError('Room Key is mandatory to join.');
        return;
      }

      audioManager.playPop();
      onJoinRoom(roomCode.trim().toUpperCase(), name.trim(), selectedAvatar);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto px-4 py-6 relative z-20 flex flex-col items-center min-h-[90vh] justify-center">
      {/* Top Sound Toggle Pill */}
      <div className="w-full flex justify-end mb-3">
        <button
          onClick={handleToggleSound}
          type="button"
          className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/15 backdrop-blur-md border border-white/25 text-lemon-300 text-xs font-extrabold hover:bg-white/25 transition-all cursor-pointer shadow-sm"
        >
          {soundOn ? <Volume2 className="h-4 w-4 text-lime-400" /> : <VolumeX className="h-4 w-4 text-rose-400" />}
          <span>{soundOn ? 'SFX ON' : 'MUTED'}</span>
        </button>
      </div>

      {/* Main Glass Center Card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.92, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 380, damping: 24 }}
        className="w-full"
      >
        <GlassCard
          variant="glow"
          hoverEffect={false}
          className="relative p-6 sm:p-8 border-4 border-lemon-400/90 shadow-[0_0_40px_rgba(250,204,21,0.4)] text-center overflow-hidden"
        >
          {/* Glass Shine Sweep Overlay */}
          <motion.div
            className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/40 to-transparent"
            animate={{ x: ['100%', '-100%'] }}
            transition={{ duration: 4, repeat: Infinity, ease: 'linear', repeatDelay: 3 }}
          />

          {/* Header */}
          <div className="flex flex-col items-center mb-5">
            <motion.div
              animate={{
                y: [0, -10, 0],
                rotate: [0, 8, -8, 0],
              }}
              transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
              className="text-5xl sm:text-6xl mb-2 filter drop-shadow-lg"
            >
              🍋
            </motion.div>

            <h1 className="font-heading text-3xl sm:text-4xl font-black tracking-tight text-forest-950 leading-none">
              Skip The <span className="text-lemon-gradient">Lemon Shot</span>
            </h1>

            <div className="mt-2 space-y-0.5">
              <p className="font-heading text-sm sm:text-base font-bold text-forest-900">
                {isAdminMode ? '👑 Admin Login' : 'Vote wisely...'}
              </p>
              <p className="text-[11px] sm:text-xs font-extrabold text-rose-700 uppercase tracking-wider">
                {isAdminMode ? 'Login with fixed admin credentials' : 'Someone has to drink the Lemon Shot.'}
              </p>
            </div>
          </div>

          {/* Error Banner */}
          {(error || validationError) && (
            <AnimatePresence>
              <motion.div
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                className="mb-4 flex items-center justify-center gap-2 rounded-2xl bg-rose-500/20 border-2 border-rose-500/60 p-3 text-xs font-black text-rose-900 backdrop-blur-md animate-wiggle"
              >
                <AlertCircle className="h-4 w-4 text-rose-700 flex-shrink-0" />
                <span>{validationError || error}</span>
              </motion.div>
            </AnimatePresence>
          )}

          {/* Avatar Selector */}
          <div className="mb-5">
            <label className="block text-[10px] font-black uppercase tracking-widest text-forest-900 mb-2">
              Choose Avatar
            </label>
            <div className="grid grid-cols-6 gap-1.5 justify-items-center">
              {LEMON_AVATARS.map((av) => (
                <LemonAvatar
                  key={av.id}
                  avatarId={av.id}
                  size="sm"
                  selected={selectedAvatar === av.id}
                  onClick={() => {
                    audioManager.playPop();
                    setSelectedAvatar(av.id);
                  }}
                />
              ))}
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-3.5">
            {/* REGULAR PLAYER FORM */}
            {!isAdminMode && (
              <>
                <div>
                  <label className="block text-[11px] font-black uppercase tracking-widest text-forest-900 mb-1 text-left">
                    Your Name *
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => {
                      setName(e.target.value);
                      if (validationError) setValidationError('');
                    }}
                    placeholder="Enter your name"
                    maxLength={20}
                    required
                    className="w-full text-center font-heading text-lg font-bold rounded-2xl bg-white/95 border-3 border-lime-400/80 px-4 py-3 text-forest-950 placeholder-forest-800/40 shadow-inner focus:outline-none focus:border-lemon-400 focus:ring-4 focus:ring-lemon-300/60 transition-all"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-black uppercase tracking-widest text-forest-900 mb-1 text-left flex items-center gap-1">
                    <KeyRound className="h-3.5 w-3.5 text-lemon-600" />
                    <span>Room Key (Mandatory) *</span>
                  </label>
                  <input
                    type="text"
                    value={roomCode}
                    onChange={(e) => {
                      setRoomCode(e.target.value.toUpperCase());
                      if (validationError) setValidationError('');
                    }}
                    placeholder="Enter 4-letter Room Key"
                    maxLength={4}
                    required
                    className="w-full text-center font-heading text-2xl font-black uppercase tracking-widest rounded-2xl bg-white/95 border-3 border-lemon-400 px-4 py-3 text-forest-950 placeholder-forest-800/40 focus:outline-none focus:ring-4 focus:ring-lemon-300/60 transition-all shadow-inner"
                  />
                </div>
              </>
            )}

            {/* ADMIN LOGIN FORM (Fixed creds: admin / admin) */}
            {isAdminMode && (
              <>
                <div>
                  <label className="block text-[11px] font-black uppercase tracking-widest text-forest-900 mb-1 text-left flex items-center gap-1">
                    <User className="h-3.5 w-3.5 text-amber-700" />
                    <span>Admin Username *</span>
                  </label>
                  <input
                    type="text"
                    value={adminUsername}
                    onChange={(e) => {
                      setAdminUsername(e.target.value);
                      if (validationError) setValidationError('');
                    }}
                    placeholder="Username (admin)"
                    required
                    className="w-full text-center font-heading text-lg font-bold rounded-2xl bg-white/95 border-3 border-amber-400 px-4 py-3 text-forest-950 placeholder-forest-800/40 focus:outline-none focus:ring-4 focus:ring-amber-300/60 transition-all shadow-inner"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-black uppercase tracking-widest text-forest-900 mb-1 text-left flex items-center gap-1">
                    <Lock className="h-3.5 w-3.5 text-amber-700" />
                    <span>Admin Password *</span>
                  </label>
                  <input
                    type="password"
                    value={adminPassword}
                    onChange={(e) => {
                      setAdminPassword(e.target.value);
                      if (validationError) setValidationError('');
                    }}
                    placeholder="Password (admin)"
                    required
                    className="w-full text-center font-heading text-lg font-bold rounded-2xl bg-white/95 border-3 border-amber-400 px-4 py-3 text-forest-950 placeholder-forest-800/40 focus:outline-none focus:ring-4 focus:ring-amber-300/60 transition-all shadow-inner"
                  />
                </div>
              </>
            )}

            {/* Primary Action Button */}
            <LemonButton
              variant={isAdminMode ? 'secondary' : 'primary'}
              size="xl"
              type="submit"
              icon={isAdminMode ? <ShieldCheck className="h-6 w-6" /> : <UserCheck className="h-6 w-6" />}
              className="w-full text-lg sm:text-xl py-3.5 shadow-lemon-glow mt-1"
            >
              {isAdminMode ? 'ADMIN LOGIN' : 'JOIN GAME'}
            </LemonButton>
          </form>

          {/* Divider */}
          <div className="my-5 border-t border-forest-900/15" />

          {/* Admin Login Toggle Button */}
          <div className="flex justify-center">
            <button
              type="button"
              onClick={() => {
                audioManager.playPop();
                setIsAdminMode(!isAdminMode);
                setValidationError('');
                setAdminUsername('');
                setAdminPassword('');
              }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/20 hover:bg-white/40 border border-forest-900/20 text-xs font-extrabold text-forest-900 tracking-wider uppercase transition-all cursor-pointer shadow-sm"
            >
              <Sparkles className="h-3.5 w-3.5 text-lemon-600" />
              <span>{isAdminMode ? '← Back to Player Join' : 'Admin Login'}</span>
            </button>
          </div>
        </GlassCard>
      </motion.div>
    </div>
  );
};

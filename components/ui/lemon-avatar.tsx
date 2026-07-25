'use client';

import React from 'react';
import { motion } from 'framer-motion';

export const LEMON_AVATARS = [
  { id: 'lemon-king', name: 'King Lemon', emoji: '👑🍋', color: 'from-amber-400 to-yellow-500' },
  { id: 'lemon-cool', name: 'Cool Lemon', emoji: '😎🍋', color: 'from-yellow-400 to-lime-500' },
  { id: 'lemon-party', name: 'Party Lemon', emoji: '🥳🍋', color: 'from-lime-400 to-emerald-500' },
  { id: 'lemon-spicy', name: 'Spicy Lemon', emoji: '🌶️🍋', color: 'from-red-400 to-amber-500' },
  { id: 'lemon-ninja', name: 'Ninja Lemon', emoji: '🥷🍋', color: 'from-emerald-600 to-teal-800' },
  { id: 'lemon-wink', name: 'Wink Lemon', emoji: '😉🍋', color: 'from-yellow-300 to-amber-400' },
];

export interface LemonAvatarProps {
  avatarId: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  selected?: boolean;
  onClick?: () => void;
}

export const LemonAvatar: React.FC<LemonAvatarProps> = ({
  avatarId,
  size = 'md',
  selected = false,
  onClick,
}) => {
  const avatar = LEMON_AVATARS.find((a) => a.id === avatarId) || LEMON_AVATARS[0];

  const sizeClasses = {
    sm: 'h-10 w-10 text-xl border',
    md: 'h-14 w-14 text-2xl border-2',
    lg: 'h-20 w-20 text-4xl border-3',
    xl: 'h-28 w-28 text-6xl border-4',
  };

  return (
    <motion.div
      whileHover={onClick ? { scale: 1.1, rotate: 5 } : undefined}
      whileTap={onClick ? { scale: 0.95 } : undefined}
      onClick={onClick}
      className={`relative flex items-center justify-center rounded-full bg-gradient-to-br ${
        avatar.color
      } ${sizeClasses[size]} shadow-md shadow-lemon-500/20 cursor-pointer ${
        selected ? 'ring-4 ring-lemon-400 ring-offset-2 ring-offset-forest-900 scale-105' : ''
      }`}
    >
      <span className="select-none filter drop-shadow">{avatar.emoji}</span>
    </motion.div>
  );
};

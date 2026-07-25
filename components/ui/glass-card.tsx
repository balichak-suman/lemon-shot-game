'use client';

import React from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';
import { cn } from '@/lib/utils';

export interface GlassCardProps extends HTMLMotionProps<'div'> {
  variant?: 'light' | 'dark' | 'glow' | 'accent' | 'linear';
  hoverEffect?: boolean;
  children: React.ReactNode;
}

export const GlassCard: React.FC<GlassCardProps> = ({
  variant = 'light',
  hoverEffect = true,
  children,
  className,
  ...props
}) => {
  const variantStyles = {
    light:
      'bg-white/85 backdrop-blur-2xl border border-white/70 text-forest-950 shadow-[0_8px_32px_rgba(0,0,0,0.12)]',
    dark:
      'bg-forest-950/80 backdrop-blur-2xl border border-lemon-400/25 text-white shadow-[0_12px_40px_rgba(0,0,0,0.35)]',
    glow:
      'bg-gradient-to-b from-white/95 via-lemon-50/90 to-white/90 backdrop-blur-2xl border-2 border-lemon-400/90 shadow-[0_0_35px_rgba(250,204,21,0.35)] text-forest-950',
    accent:
      'bg-gradient-to-br from-forest-900/95 via-forest-950/95 to-lime-950/95 backdrop-blur-2xl border-2 border-lime-400/40 text-white shadow-[0_0_35px_rgba(132,204,22,0.35)]',
    linear:
      'bg-white/10 backdrop-blur-2xl border border-white/20 text-white shadow-[0_8px_32px_rgba(0,0,0,0.2)] hover:border-lemon-400/50',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      whileHover={
        hoverEffect
          ? {
              y: -4,
              scale: 1.01,
              transition: { type: 'spring', stiffness: 400, damping: 25 },
            }
          : undefined
      }
      className={cn(
        'relative rounded-3xl p-6 transition-all duration-300 overflow-hidden',
        variantStyles[variant],
        className
      )}
      {...props}
    >
      {/* Apple-style top specular reflection highlight */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/60 to-transparent" />
      {/* Soft corner glare */}
      <div className="pointer-events-none absolute -top-20 -right-20 h-40 w-40 rounded-full bg-white/15 blur-2xl" />
      {children}
    </motion.div>
  );
};

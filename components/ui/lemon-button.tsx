'use client';

import React from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';
import { cn } from '@/lib/utils';

export interface LemonButtonProps extends HTMLMotionProps<'button'> {
  variant?: 'primary' | 'secondary' | 'danger' | 'outline' | 'skip';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  children: React.ReactNode;
  icon?: React.ReactNode;
  isLoading?: boolean;
}

export const LemonButton: React.FC<LemonButtonProps> = ({
  variant = 'primary',
  size = 'md',
  children,
  icon,
  isLoading = false,
  className,
  disabled,
  ...props
}) => {
  const baseStyles =
    'relative inline-flex items-center justify-center font-heading font-bold rounded-2xl transition-all duration-200 select-none cursor-pointer tracking-wide overflow-hidden shadow-lg focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-lemon-300/80 active:scale-98';

  const variantStyles = {
    primary:
      'bg-gradient-to-r from-lemon-400 via-lemon-300 to-lime-400 text-forest-950 border-2 border-white/90 shadow-lemon-glow hover:shadow-lemon-glow/90',
    secondary:
      'bg-gradient-to-r from-lime-500 via-lime-400 to-emerald-500 text-forest-950 border-2 border-white/90 shadow-lime-glow hover:shadow-lime-glow/90',
    danger:
      'bg-gradient-to-r from-rose-500 via-red-500 to-amber-500 text-white border-2 border-white/90 shadow-rose-500/50 shadow-lg hover:shadow-rose-500/80',
    outline:
      'bg-white/15 backdrop-blur-md text-lemon-200 border-2 border-lemon-400/70 hover:bg-lemon-400/25 hover:border-lemon-300',
    skip:
      'bg-gradient-to-r from-amber-400 via-yellow-400 to-orange-400 text-forest-950 border-2 border-white shadow-amber-400/70 shadow-xl animate-pulse-glow',
  };

  const sizeStyles = {
    sm: 'px-4 py-2.5 text-sm gap-1.5 min-h-[44px]',
    md: 'px-6 py-3.5 text-base gap-2 min-h-[48px]',
    lg: 'px-8 py-4 text-lg gap-2.5 min-h-[56px]',
    xl: 'px-10 py-5 text-xl gap-3 min-h-[64px] rounded-3xl',
  };

  return (
    <motion.button
      whileHover={{ scale: disabled || isLoading ? 1 : 1.03, y: -2 }}
      whileTap={{ scale: disabled || isLoading ? 1 : 0.97, y: 1 }}
      transition={{ type: 'spring', stiffness: 450, damping: 20 }}
      className={cn(
        baseStyles,
        variantStyles[variant],
        sizeStyles[size],
        disabled || isLoading ? 'opacity-50 cursor-not-allowed shadow-none' : '',
        className
      )}
      disabled={disabled || isLoading}
      {...props}
    >
      {/* Dynamic Shine Overlay */}
      <div className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/40 to-transparent transition-transform duration-700 group-hover:translate-x-full" />

      {isLoading ? (
        <div className="flex items-center gap-2">
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-current border-t-transparent" />
          <span>Processing...</span>
        </div>
      ) : (
        <>
          {icon && <span className="text-xl flex-shrink-0">{icon}</span>}
          <span>{children}</span>
        </>
      )}
    </motion.button>
  );
};

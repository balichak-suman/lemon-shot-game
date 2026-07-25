'use client';

import React from 'react';
import { motion } from 'framer-motion';

export interface CountdownProps {
  seconds: number;
  maxSeconds: number;
  size?: number;
  strokeWidth?: number;
}

export const CircularCountdown: React.FC<CountdownProps> = ({
  seconds,
  maxSeconds,
  size = 120,
  strokeWidth = 10,
}) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const percentage = Math.max(0, Math.min(1, seconds / maxSeconds));
  const strokeDashoffset = circumference - percentage * circumference;

  // Dynamic status color
  const getColor = () => {
    if (percentage > 0.5) return '#84CC16'; // Lime Green
    if (percentage > 0.25) return '#FACC15'; // Lemon Yellow
    return '#EF4444'; // Red Alert
  };

  const currentColor = getColor();

  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90 transform">
        {/* Background Track */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="rgba(255, 255, 255, 0.2)"
          strokeWidth={strokeWidth}
          fill="transparent"
        />
        {/* Progress Ring */}
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={currentColor}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          fill="transparent"
          initial={{ strokeDashoffset: 0 }}
          animate={{ strokeDashoffset }}
          transition={{ duration: 0.8, ease: 'linear' }}
          className="filter drop-shadow-[0_0_8px_currentColor]"
        />
      </svg>

      {/* Numerical Timer Text */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <motion.span
          key={seconds}
          initial={{ scale: 1.3, opacity: 0.5 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.2 }}
          className="font-heading text-3xl font-black"
          style={{ color: currentColor }}
        >
          {seconds}
        </motion.span>
        <span className="text-[10px] font-bold tracking-widest text-white/80 uppercase">SEC</span>
      </div>
    </div>
  );
};

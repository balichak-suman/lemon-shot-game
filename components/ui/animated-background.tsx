'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

// SVG Lemon Slice Component
const LemonSliceSVG = ({ className = '', size = 52 }: { className?: string; size?: number }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 100 100"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={`filter drop-shadow-[0_8px_16px_rgba(0,0,0,0.4)] ${className}`}
    aria-hidden="true"
  >
    <circle cx="50" cy="50" r="46" fill="#84CC16" stroke="#FEFCE8" strokeWidth="3.5" />
    <circle cx="50" cy="50" r="40" fill="#FACC15" />
    <circle cx="50" cy="50" r="37" fill="#FDE047" />
    {[0, 45, 90, 135, 180, 225, 270, 315].map((angle, i) => (
      <path
        key={i}
        d="M50 50 L50 14 A36 36 0 0 1 75.45 24.55 Z"
        fill="#FEFCE8"
        stroke="#EAB308"
        strokeWidth="1.5"
        transform={`rotate(${angle} 50 50)`}
      />
    ))}
    <circle cx="50" cy="50" r="7" fill="#FEFCE8" />
  </svg>
);

export const AnimatedBackground: React.FC<{ children?: React.ReactNode }> = ({ children }) => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Deterministic floating lemon slices to prevent SSR hydration mismatch
  const lemons = [
    { id: 1, left: '5%', top: '10%', size: 60, duration: 8, delay: 0 },
    { id: 2, left: '85%', top: '8%', size: 68, duration: 10, delay: 1 },
    { id: 3, left: '8%', top: '65%', size: 50, duration: 7.5, delay: 2 },
    { id: 4, left: '82%', top: '72%', size: 74, duration: 9, delay: 0.5 },
    { id: 5, left: '48%', top: '5%', size: 44, duration: 6.5, delay: 1.5 },
    { id: 6, left: '88%', top: '40%', size: 54, duration: 8.5, delay: 3 },
    { id: 7, left: '4%', top: '42%', size: 62, duration: 9.5, delay: 2.5 },
    { id: 8, left: '50%', top: '84%', size: 46, duration: 7, delay: 1.2 },
  ];

  // Deterministic rising bubbles
  const bubbles = [
    { id: 0, left: '8%', size: 14, duration: 8, delay: 0 },
    { id: 1, left: '18%', size: 22, duration: 6, delay: 1 },
    { id: 2, left: '28%', size: 16, duration: 9, delay: 0.5 },
    { id: 3, left: '38%', size: 24, duration: 7, delay: 2 },
    { id: 4, left: '48%', size: 12, duration: 10, delay: 1.5 },
    { id: 5, left: '58%', size: 20, duration: 8, delay: 2.5 },
    { id: 6, left: '68%', size: 18, duration: 7, delay: 0.8 },
    { id: 7, left: '78%', size: 26, duration: 9, delay: 1.8 },
    { id: 8, left: '88%', size: 15, duration: 6, delay: 3 },
  ];

  return (
    <div
      className="relative min-h-screen w-full overflow-hidden text-white selection:bg-lemon-400 selection:text-forest-950"
      style={{
        backgroundColor: '#06190c',
        backgroundImage: 'radial-gradient(circle at 50% 30%, #14532d 0%, #0d341b 50%, #041209 100%)',
      }}
    >
      {/* Ambient Glowing Orbs */}
      <div className="pointer-events-none absolute -top-40 -left-40 h-96 w-96 rounded-full bg-lemon-400/20 blur-3xl" />
      <div className="pointer-events-none absolute top-1/3 -right-40 h-96 w-96 rounded-full bg-lime-500/20 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-40 left-1/3 h-96 w-96 rounded-full bg-lemon-300/15 blur-3xl" />

      {/* Floating Lemons */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        {lemons.map((lemon) => (
          <motion.div
            key={lemon.id}
            className="absolute opacity-85"
            style={{ left: lemon.left, top: lemon.top }}
            animate={{
              y: [0, -20, 0],
              rotate: [0, 180, 360],
              scale: [1, 1.05, 1],
            }}
            transition={{
              duration: lemon.duration,
              repeat: Infinity,
              ease: 'easeInOut',
              delay: lemon.delay,
            }}
          >
            <LemonSliceSVG size={lemon.size} />
          </motion.div>
        ))}
      </div>

      {/* Rising Bubbles (Only rendered client side after mount to avoid hydration mismatch) */}
      {mounted && (
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          {bubbles.map((b) => (
            <motion.div
              key={b.id}
              className="absolute rounded-full border border-lime-300/40 bg-gradient-to-t from-white/20 to-lemon-300/20 backdrop-blur-xs"
              style={{
                left: b.left,
                width: b.size,
                height: b.size,
                bottom: '-60px',
              }}
              animate={{
                y: ['0vh', '-115vh'],
                x: [0, b.id % 2 === 0 ? 15 : -15, 0],
                opacity: [0, 0.8, 1, 0],
              }}
              transition={{
                duration: b.duration,
                repeat: Infinity,
                ease: 'linear',
                delay: b.delay,
              }}
            />
          ))}
        </div>
      )}

      {/* Main Content Container */}
      <div className="relative z-10 flex min-h-screen w-full flex-col items-center justify-center p-3 sm:p-6 md:p-8">
        {children}
      </div>
    </div>
  );
};

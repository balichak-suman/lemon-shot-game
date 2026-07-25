'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { GlassCard } from './glass-card';

export interface GlassDialogProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: React.ReactNode;
}

export const GlassDialog: React.FC<GlassDialogProps> = ({
  isOpen,
  onClose,
  title,
  description,
  children,
}) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop Blur Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-md"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.85, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.85, y: 20 }}
            transition={{ type: 'spring', stiffness: 350, damping: 25 }}
            className="relative z-10 w-full max-w-lg"
          >
            <GlassCard variant="glow" hoverEffect={false} className="border-4 border-lemon-400 p-6 sm:p-8">
              {/* Close Button */}
              <button
                onClick={onClose}
                className="absolute top-4 right-4 flex h-9 w-9 items-center justify-center rounded-full bg-forest-900/10 text-forest-900 transition-hover hover:bg-forest-900/20"
              >
                <X className="h-5 w-5" />
              </button>

              {/* Title & Description */}
              <div className="mb-6 text-center">
                <h3 className="font-heading text-2xl sm:text-3xl font-extrabold text-forest-950">
                  {title}
                </h3>
                {description && (
                  <p className="mt-2 text-sm sm:text-base font-medium text-forest-800">
                    {description}
                  </p>
                )}
              </div>

              {/* Body */}
              <div className="relative z-10">{children}</div>
            </GlassCard>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

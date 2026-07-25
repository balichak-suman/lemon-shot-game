'use client';

import React from 'react';
import { cn } from '@/lib/utils';

export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'card' | 'avatar' | 'text' | 'button';
}

export const Skeleton: React.FC<SkeletonProps> = ({
  variant = 'text',
  className,
  ...props
}) => {
  const baseStyles = 'animate-pulse bg-white/20 backdrop-blur-md rounded-2xl';

  const variantStyles = {
    text: 'h-4 w-full rounded-lg',
    avatar: 'h-14 w-14 rounded-full',
    card: 'h-32 w-full rounded-3xl border border-white/30',
    button: 'h-12 w-full rounded-2xl',
  };

  return <div className={cn(baseStyles, variantStyles[variant], className)} {...props} />;
};

export const SkeletonCardGrid: React.FC<{ count?: number }> = ({ count = 4 }) => {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 w-full my-4">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="flex flex-col items-center p-4 rounded-3xl bg-white/10 backdrop-blur-md border border-white/20 animate-pulse space-y-3"
        >
          <Skeleton variant="avatar" className="h-16 w-16" />
          <Skeleton variant="text" className="h-4 w-24" />
          <Skeleton variant="text" className="h-3 w-16" />
        </div>
      ))}
    </div>
  );
};

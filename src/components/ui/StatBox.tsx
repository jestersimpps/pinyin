'use client';

import React from 'react';
import { LucideIcon } from 'lucide-react';

interface StatBoxProps {
  icon: LucideIcon;
  label: string;
  value: string | number;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  variant?: 'default' | 'highlight';
}

export const StatBox: React.FC<StatBoxProps> = ({
  icon: Icon,
  label,
  value,
  trend,
  variant = 'default',
}) => {
  return (
    <div className={`
      p-6 rounded-2xl transition-all duration-200
      ${variant === 'highlight' 
        ? 'bg-gradient-to-br from-[var(--midnight-green)] to-[var(--vibrant-orange)] text-white' 
        : 'bg-[var(--secondary-bg)] border border-[var(--border)]'
      }
      card-shadow
    `}>
      <div className="flex items-center justify-between mb-4">
        <div className={`
          p-3 rounded-xl
          ${variant === 'highlight' 
            ? 'bg-white/20' 
            : 'bg-[var(--primary-bg)]'
          }
        `}>
          <Icon size={24} className={variant === 'highlight' ? 'text-white' : 'text-[var(--midnight-green)]'} />
        </div>
        {trend && (
          <span className={`
            text-sm font-semibold
            ${trend.isPositive 
              ? 'text-[var(--success-green)]' 
              : 'text-[var(--error-red)]'
            }
          `}>
            {trend.isPositive ? '+' : ''}{trend.value}%
          </span>
        )}
      </div>
      <h3 className={`
        text-3xl font-bold mb-1
        ${variant === 'highlight' ? 'text-white' : 'text-[var(--primary-text)]'}
      `}>
        {value}
      </h3>
      <p className={`
        text-sm
        ${variant === 'highlight' ? 'text-white/80' : 'text-[var(--secondary-text)]'}
      `}>
        {label}
      </p>
    </div>
  );
};
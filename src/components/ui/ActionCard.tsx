'use client';

import React from 'react';
import { LucideIcon } from 'lucide-react';

interface ActionCardProps {
  icon: LucideIcon;
  title: string;
  subtitle: string;
  badge?: string;
  onClick?: () => void;
  variant?: 'default' | 'gradient';
  disabled?: boolean;
}

export const ActionCard: React.FC<ActionCardProps> = ({
  icon: Icon,
  title,
  subtitle,
  badge,
  onClick,
  variant = 'default',
  disabled = false,
}) => {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`
        w-full p-6 rounded-2xl transition-all duration-200 press-effect
        ${disabled ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer hover:scale-[1.02]'}
        ${variant === 'gradient' 
          ? 'bg-gradient-to-br from-[var(--midnight-green)] to-[var(--vibrant-orange)] text-white' 
          : 'bg-[var(--secondary-bg)] border border-[var(--border)] card-shadow hover:card-shadow-lg'
        }
      `}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-4">
          <div className={`
            p-3 rounded-xl
            ${variant === 'gradient' 
              ? 'bg-white/20' 
              : 'bg-[var(--primary-bg)]'
            }
          `}>
            <Icon size={24} className={variant === 'gradient' ? 'text-white' : 'text-[var(--midnight-green)]'} />
          </div>
          <div className="text-left">
            <h3 className={`
              text-xl font-semibold mb-1
              ${variant === 'gradient' ? 'text-white' : 'text-[var(--primary-text)]'}
            `}>
              {title}
            </h3>
            <p className={`
              text-sm
              ${variant === 'gradient' ? 'text-white/80' : 'text-[var(--secondary-text)]'}
            `}>
              {subtitle}
            </p>
          </div>
        </div>
        {badge && (
          <span className={`
            px-3 py-1 text-xs font-semibold rounded-full
            ${variant === 'gradient' 
              ? 'bg-white/20 text-white' 
              : 'bg-[var(--vibrant-orange)] text-white'
            }
          `}>
            {badge}
          </span>
        )}
      </div>
    </button>
  );
};
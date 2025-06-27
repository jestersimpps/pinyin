'use client';

import React, { forwardRef } from 'react';
import { LucideIcon } from 'lucide-react';

interface MobileInputZoneProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit?: () => void;
  placeholder?: string;
  disabled?: boolean;
  error?: boolean;
  success?: boolean;
  rightButtons?: Array<{
    icon: LucideIcon;
    onClick: () => void;
    label?: string;
    variant?: 'default' | 'primary' | 'success' | 'danger';
  }>;
}

export const MobileInputZone = forwardRef<HTMLInputElement, MobileInputZoneProps>(({
  value,
  onChange,
  onSubmit,
  placeholder = 'Type here...',
  disabled = false,
  error = false,
  success = false,
  rightButtons = [],
}, ref) => {
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && onSubmit) {
      onSubmit();
    }
  };

  const getButtonStyles = (variant?: string) => {
    switch (variant) {
      case 'primary':
        return 'bg-[var(--midnight-green)] text-white';
      case 'success':
        return 'bg-[var(--success-green)] text-white';
      case 'danger':
        return 'bg-[var(--error-red)] text-white';
      default:
        return 'bg-[var(--primary-bg)] text-[var(--primary-text)]';
    }
  };

  return (
    <div className={`
      relative flex items-center gap-2 p-2 rounded-2xl
      bg-[var(--secondary-bg)] border-2 transition-all duration-200
      ${error ? 'border-[var(--error-red)]' : success ? 'border-[var(--success-green)]' : 'border-[var(--border)]'}
      ${!disabled && 'focus-within:border-[var(--midnight-green)]'}
    `}>
      <input
        ref={ref}
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        disabled={disabled}
        className="flex-1 px-4 py-3 bg-transparent text-[var(--primary-text)] 
                   placeholder:text-[var(--secondary-text)] focus:outline-none
                   text-lg font-medium"
      />
      {rightButtons.map((button, index) => {
        const Icon = button.icon;
        return (
          <button
            key={index}
            onClick={button.onClick}
            disabled={disabled}
            className={`
              flex items-center gap-2 px-4 py-3 rounded-xl font-semibold
              transition-all duration-200 press-effect
              ${getButtonStyles(button.variant)}
              ${disabled ? 'opacity-60 cursor-not-allowed' : ''}
            `}
          >
            <Icon size={20} />
            {button.label && <span>{button.label}</span>}
          </button>
        );
      })}
    </div>
  );
});

MobileInputZone.displayName = 'MobileInputZone';
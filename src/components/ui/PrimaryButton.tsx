'use client';

import React from 'react';
import { LucideIcon } from 'lucide-react';

interface PrimaryButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'secondary' | 'success' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  icon?: LucideIcon;
  iconPosition?: 'left' | 'right';
  fullWidth?: boolean;
  disabled?: boolean;
  type?: 'button' | 'submit' | 'reset';
}

export const PrimaryButton: React.FC<PrimaryButtonProps> = ({
  children,
  onClick,
  variant = 'primary',
  size = 'md',
  icon: Icon,
  iconPosition = 'left',
  fullWidth = false,
  disabled = false,
  type = 'button',
}) => {
  const variantStyles = {
    primary: 'bg-[var(--midnight-green)] text-white hover:opacity-90',
    secondary: 'bg-[var(--secondary-bg)] text-[var(--primary-text)] border border-[var(--border)]',
    success: 'bg-[var(--success-green)] text-white',
    danger: 'bg-[var(--error-red)] text-white',
  };

  const sizeStyles = {
    sm: 'px-4 py-2 text-sm gap-2',
    md: 'px-6 py-3 text-base gap-3',
    lg: 'px-8 py-4 text-lg gap-4',
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`
        inline-flex items-center justify-center font-semibold rounded-xl
        transition-all duration-200 press-effect card-shadow
        ${variantStyles[variant]}
        ${sizeStyles[size]}
        ${fullWidth ? 'w-full' : ''}
        ${disabled ? 'opacity-60 cursor-not-allowed' : 'hover:card-shadow-lg'}
      `}
    >
      {Icon && iconPosition === 'left' && <Icon size={size === 'sm' ? 16 : size === 'md' ? 20 : 24} />}
      {children}
      {Icon && iconPosition === 'right' && <Icon size={size === 'sm' ? 16 : size === 'md' ? 20 : 24} />}
    </button>
  );
};
'use client';

import React from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

// ============================================
// Types & Interfaces
// ============================================

type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost';
type ButtonSize = 'sm' | 'md' | 'lg' | 'xl';

interface BaseButtonProps {
  children: React.ReactNode;
  variant?: ButtonVariant;
  size?: ButtonSize;
  className?: string;
  disabled?: boolean;
  isLoading?: boolean;
  glow?: boolean;
}

// Button as button element
interface ButtonAsButton extends BaseButtonProps {
  href?: undefined;
  onClick?: React.MouseEventHandler<HTMLButtonElement>;
  type?: 'button' | 'submit' | 'reset';
}

// Button as Next.js Link
interface ButtonAsLink extends BaseButtonProps {
  href: string;
  onClick?: React.MouseEventHandler<HTMLAnchorElement>;
  type?: undefined;
}

type ButtonProps = ButtonAsButton | ButtonAsLink;

// ============================================
// Style Configurations
// ============================================

const variantStyles: Record<ButtonVariant, string> = {
  primary: `
    bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500
    text-white
    hover:shadow-lg hover:shadow-indigo-500/25
    active:scale-[0.98]
    border-0
  `,
  secondary: `
    bg-surfaceGlass
    backdrop-blur-md
    border border-white/10
    text-text-primary
    hover:bg-white/5
    hover:border-white/20
    active:scale-[0.98]
  `,
  outline: `
    bg-transparent
    border-2 border-indigo-500/50
    text-indigo-400
    hover:border-indigo-500
    hover:text-indigo-300
    hover:bg-indigo-500/10
    active:scale-[0.98]
  `,
  ghost: `
    bg-transparent
    text-text-secondary
    hover:text-text-primary
    hover:bg-white/5
    active:scale-[0.98]
  `,
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: 'px-4 py-2 text-sm rounded-lg',
  md: 'px-6 py-2.5 text-base rounded-xl',
  lg: 'px-8 py-3 text-lg rounded-xl',
  xl: 'px-10 py-4 text-lg rounded-2xl',
};

const glowStyles = `
  animate-pulse-glow
  relative
  after:absolute after:inset-0
  after:rounded-[inherit]
  after:bg-gradient-to-r after:from-indigo-500 after:via-purple-500 after:to-pink-500
  after:blur-xl after:opacity-50
  after:-z-10
  hover:after:opacity-75
  transition-all duration-300
`;

// ============================================
// Component
// ============================================

export function Button({
  children,
  variant = 'primary',
  size = 'md',
  className,
  disabled = false,
  isLoading = false,
  glow = false,
  href,
  onClick,
  type = 'button',
  ...props
}: ButtonProps) {
  // Common classes for all button types
  const baseClasses = cn(
    // Base styles
    'inline-flex items-center justify-center',
    'font-medium',
    'transition-all duration-200 ease-out',
    'focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:ring-offset-2 focus:ring-offset-background',
    'disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none',
    // Variant styles
    variantStyles[variant],
    // Size styles
    sizeStyles[size],
    // Glow effect
    glow && variant === 'primary' && glowStyles,
    // Custom classes
    className
  );

  // Loading spinner
  const LoadingSpinner = (
    <svg
      className="animate-spin -ml-1 mr-2 h-4 w-4"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>
  );

  // Content with loading state
  const content = (
    <>
      {isLoading && LoadingSpinner}
      {children}
    </>
  );

  // Render as Link if href is provided
  if (href) {
    return (
      <Link
        href={href}
        className={baseClasses}
        onClick={onClick as React.MouseEventHandler<HTMLAnchorElement>}
        {...(props as Omit<ButtonAsLink, 'href' | 'onClick' | 'className' | 'children'>)}
      >
        {content}
      </Link>
    );
  }

  // Render as button
  return (
    <button
      type={type}
      className={baseClasses}
      disabled={disabled || isLoading}
      onClick={onClick as React.MouseEventHandler<HTMLButtonElement>}
      {...(props as Omit<ButtonAsButton, 'onClick' | 'type' | 'className' | 'children'>)}
    >
      {content}
    </button>
  );
}

// Export types for external use
export type { ButtonProps, ButtonVariant, ButtonSize };

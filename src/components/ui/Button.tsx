import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { cn } from '@/utils';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  fullWidth?: boolean;
}

const variants = {
  primary:
    'bg-primary-500 text-white hover:bg-primary-600 active:scale-[0.98] shadow-sm hover:shadow-md focus:ring-primary-500 disabled:opacity-50',
  secondary:
    'bg-secondary-500 text-white hover:bg-secondary-600 active:scale-[0.98] shadow-sm hover:shadow-md focus:ring-secondary-500 disabled:opacity-50',
  outline:
    'border border-neutral-300 bg-white text-neutral-700 hover:bg-neutral-50 hover:border-neutral-400 active:scale-[0.98] dark:border-neutral-700 dark:bg-neutral-850 dark:text-neutral-200 dark:hover:bg-neutral-800 dark:hover:border-neutral-600 focus:ring-primary-500 disabled:opacity-50',
  ghost:
    'text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900 active:scale-[0.98] dark:text-neutral-300 dark:hover:bg-neutral-800 dark:hover:text-white focus:ring-neutral-500 disabled:opacity-50',
  danger:
    'bg-red-500 text-white hover:bg-red-600 active:scale-[0.98] shadow-sm hover:shadow-md focus:ring-red-500 disabled:opacity-50',
};

const sizes = {
  sm: 'px-3 py-1.5 text-xs font-semibold rounded-lg',
  md: 'px-4 py-2 text-sm font-semibold rounded-xl',
  lg: 'px-5 py-2.5 text-base font-semibold rounded-xl',
};

export default function Button({
  variant = 'primary',
  size = 'md',
  isLoading = false,
  leftIcon,
  rightIcon,
  fullWidth = false,
  className,
  children,
  disabled,
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        'inline-flex items-center justify-center gap-2 font-medium transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-offset-white dark:focus:ring-offset-neutral-900 disabled:cursor-not-allowed',
        variants[variant],
        sizes[size],
        fullWidth && 'w-full',
        className
      )}
      disabled={disabled || isLoading}
      {...props}
    >

      {isLoading ? (
        <svg
          className="h-4 w-4 animate-spin"
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
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
          />
        </svg>
      ) : (
        leftIcon
      )}
      {children}
      {!isLoading && rightIcon}
    </button>
  );
}


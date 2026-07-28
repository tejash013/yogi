import { Link } from 'react-router-dom';
import { cn } from '@/utils';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
  className?: string;
}

const sizes = {
  sm: { container: 'h-6 w-6', text: 'text-sm', icon: 'text-xs' },
  md: { container: 'h-8 w-8', text: 'text-lg', icon: 'text-sm' },
  lg: { container: 'h-10 w-10', text: 'text-xl', icon: 'text-base' },
};

export default function Logo({ size = 'md', showText = true, className }: LogoProps) {
  const s = sizes[size];

  return (
    <Link to="/" className={cn('flex items-center gap-2', className)}>
      <div
        className={cn(
          'flex items-center justify-center rounded-lg bg-primary-500',
          s.container
        )}
      >
        <span className={cn('font-bold text-white', s.icon)}>R</span>
      </div>
      {showText && (
        <span className={cn('font-bold text-neutral-900 dark:text-white', s.text)}>
          RestaurantOS
        </span>
      )}
    </Link>
  );
}


import { forwardRef, type InputHTMLAttributes } from 'react';
import { cn } from '@/utils';

interface CheckboxProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  ({ label, error, className, id, ...props }, ref) => {
    const checkboxId = id || label?.toLowerCase().replace(/\s+/g, '-');

    return (
      <div className="flex items-start gap-2">
        <input
          ref={ref}
          type="checkbox"
          id={checkboxId}
          className={cn(
            'mt-1 h-4 w-4 rounded border-neutral-300 text-primary-500 focus:ring-primary-500 dark:border-neutral-600 dark:bg-neutral-800',
            className
          )}
          {...props}
        />
        {label && (
          <label
            htmlFor={checkboxId}
            className="text-sm text-neutral-700 dark:text-neutral-300 cursor-pointer select-none"
          >
            {label}
          </label>
        )}
        {error && <p className="text-sm text-error">{error}</p>}
      </div>
    );
  }
);

Checkbox.displayName = 'Checkbox';

export default Checkbox;


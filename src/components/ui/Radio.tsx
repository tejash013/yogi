import { cn } from '@/utils';

interface RadioOption {
  value: string;
  label: string;
}

interface RadioProps {
  name: string;
  options: RadioOption[];
  value?: string;
  onChange?: (value: string) => void;
  label?: string;
  error?: string;
  direction?: 'horizontal' | 'vertical';
}

export default function Radio({
  name,
  options,
  value,
  onChange,
  label,
  error,
  direction = 'vertical',
}: RadioProps) {
  return (
    <div className="w-full">
      {label && (
        <p className="mb-1.5 text-sm font-medium text-neutral-700 dark:text-neutral-300">
          {label}
        </p>
      )}
      <div
        className={cn(
          'flex gap-4',
          direction === 'vertical' ? 'flex-col' : 'flex-row flex-wrap'
        )}
      >
        {options.map((option) => (
          <label
            key={option.value}
            className="flex cursor-pointer items-center gap-2 text-sm text-neutral-700 dark:text-neutral-300"
          >
            <input
              type="radio"
              name={name}
              value={option.value}
              checked={value === option.value}
              onChange={(e) => onChange?.(e.target.value)}
              className="h-4 w-4 border-neutral-300 text-primary-500 focus:ring-primary-500 dark:border-neutral-600 dark:bg-neutral-800"
            />
            {option.label}
          </label>
        ))}
      </div>
      {error && <p className="mt-1 text-sm text-error">{error}</p>}
    </div>
  );
}


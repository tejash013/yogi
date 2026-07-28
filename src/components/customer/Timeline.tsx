import { cn } from '@/utils';

interface TimelineStep {
  label: string;
  time?: string;
  completed: boolean;
  isCurrent?: boolean;
}

interface TimelineProps {
  steps: TimelineStep[];
  className?: string;
}

export default function Timeline({ steps, className }: TimelineProps) {
  return (
    <div className={cn('relative', className)}>
      {steps.map((step, index) => (
        <div key={step.label} className="mb-8 flex items-start last:mb-0">
          {/* Icon column */}
          <div className="flex flex-col items-center">
            <div
              className={cn(
                'flex h-11 w-11 items-center justify-center rounded-full border-2 transition-all duration-500',
                step.completed
                  ? 'border-primary-500 bg-primary-500 text-white'
                  : step.isCurrent
                  ? 'border-primary-500 bg-white text-primary-500 dark:bg-neutral-800'
                  : 'border-neutral-300 bg-white text-neutral-400 dark:border-neutral-600 dark:bg-neutral-800'
              )}
            >
              {step.completed ? (
                <svg className="h-5 w-5 animate-scale-in" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                </svg>
              ) : (
                <span className="text-sm font-semibold">{index + 1}</span>
              )}
            </div>
            {index < steps.length - 1 && (
              <div
                className={cn(
                  'h-12 w-0.5 transition-colors duration-500',
                  step.completed ? 'bg-primary-500' : 'bg-neutral-200 dark:bg-neutral-700'
                )}
              />
            )}
          </div>

          {/* Content */}
          <div className="ml-4">
            <p
              className={cn(
                'font-semibold transition-colors duration-300',
                step.completed
                  ? 'text-neutral-900 dark:text-white'
                  : step.isCurrent
                  ? 'text-primary-500'
                  : 'text-neutral-400'
              )}
            >
              {step.label}
              {step.isCurrent && (
                <span className="ml-2 inline-flex">
                  <span className="flex h-2 w-2">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary-400 opacity-75" />
                    <span className="relative inline-flex h-2 w-2 rounded-full bg-primary-500" />
                  </span>
                </span>
              )}
            </p>
            {step.time && (
              <p className="mt-0.5 text-sm text-neutral-500">{step.time}</p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}


import Logo from './Logo';

interface LoadingScreenProps {
  message?: string;
}

export default function LoadingScreen({
  message = 'Loading...',
}: LoadingScreenProps) {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-white dark:bg-neutral-900">
      <Logo size="lg" />
      <div className="mt-6 flex items-center gap-2">
        <div className="h-2 w-2 animate-bounce rounded-full bg-primary-500" style={{ animationDelay: '0s' }} />
        <div className="h-2 w-2 animate-bounce rounded-full bg-primary-500" style={{ animationDelay: '0.15s' }} />
        <div className="h-2 w-2 animate-bounce rounded-full bg-primary-500" style={{ animationDelay: '0.3s' }} />
      </div>
      <p className="mt-4 text-sm text-neutral-500">{message}</p>
    </div>
  );
}


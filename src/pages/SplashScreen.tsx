import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '@/constants';

export default function SplashScreen() {
  const navigate = useNavigate();
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(timer);
          navigate(ROUTES.WELCOME);
          return 100;
        }
        return prev + 2;
      });
    }, 30);

    return () => clearInterval(timer);
  }, [navigate]);

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-gradient-to-br from-primary-500 via-primary-600 to-primary-700">
      {/* Logo Animation */}
      <div className="animate-fade-in-up mb-8">
        <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-lg">
          <span className="text-5xl font-bold text-white">R</span>
        </div>
      </div>

      <h1 className="animate-fade-in-up text-4xl font-bold text-white" style={{ animationDelay: '0.2s' }}>
        RestaurantOS
      </h1>
      <p className="animate-fade-in-up mt-2 text-lg text-white/70" style={{ animationDelay: '0.4s' }}>
        Delicious food, delivered fast
      </p>

      {/* Loading Bar */}
      <div className="animate-fade-in-up mt-12 w-48" style={{ animationDelay: '0.6s' }}>
        <div className="h-1.5 overflow-hidden rounded-full bg-white/20">
          <div
            className="h-full rounded-full bg-white transition-all duration-300 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
        <p className="mt-2 text-center text-sm text-white/60">Loading...</p>
      </div>
    </div>
  );
}


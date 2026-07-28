import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui';
import { ROUTES } from '@/constants';

export default function OrderSuccess() {
  const navigate = useNavigate();
  const [showContent, setShowContent] = useState(false);
  const orderNumber = 'ORD-' + Math.random().toString(36).substring(2, 8).toUpperCase();
  const estimatedTime = '20-30';

  useEffect(() => {
    const timer = setTimeout(() => setShowContent(true), 600);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="flex min-h-[80vh] flex-col items-center justify-center px-6 py-12">
      {/* Success Animation */}
      <div className={`transition-all duration-700 ${showContent ? 'scale-100 opacity-100' : 'scale-50 opacity-0'}`}>
        <div className="relative mx-auto mb-8">
          {/* Outer ring */}
          <div className="flex h-32 w-32 items-center justify-center rounded-full border-4 border-primary-200 dark:border-primary-800">
            {/* Inner circle */}
            <div className="flex h-24 w-24 items-center justify-center rounded-full bg-primary-50 dark:bg-primary-900/30">
              {/* Checkmark */}
              <svg className="h-12 w-12 text-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2.5}
                  d="M5 13l4 4L19 7"
                  className="animate-draw-check"
                />
              </svg>
            </div>
          </div>
          {/* Sparkles */}
          <div className="absolute -right-2 -top-2 animate-ping text-2xl opacity-70">✨</div>
          <div className="absolute -left-1 -bottom-1 animate-ping text-xl opacity-50" style={{ animationDelay: '0.3s' }}>⭐</div>
        </div>
      </div>

      {/* Content */}
      <div className={`text-center transition-all duration-700 delay-300 ${showContent ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}>
        <h1 className="mb-2 text-3xl font-bold text-neutral-900 dark:text-white">
          Order Placed Successfully! 🎉
        </h1>
        <p className="mb-6 text-neutral-500">
          Thank you for your order. Your delicious food is being prepared.
        </p>

        {/* Order Details Card */}
        <div className="mx-auto mb-8 max-w-sm rounded-2xl border border-neutral-200 bg-neutral-50 p-6 dark:border-neutral-700 dark:bg-neutral-800">
          <div className="mb-4">
            <p className="text-sm text-neutral-500">Order Number</p>
            <p className="text-lg font-bold text-neutral-900 dark:text-white">{orderNumber}</p>
          </div>
          <div className="mb-4">
            <p className="text-sm text-neutral-500">Estimated Time</p>
            <div className="flex items-center gap-2">
              <svg className="h-5 w-5 text-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-lg font-bold text-primary-500">{estimatedTime} minutes</p>
            </div>
          </div>
          <div className="rounded-xl bg-primary-50 p-3 dark:bg-primary-900/20">
            <p className="text-sm text-primary-700 dark:text-primary-300">
              We'll notify you when your order is ready!
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <Button
            size="lg"
            onClick={() => navigate(ROUTES.CUSTOMER.ORDER_TRACKING.replace(':orderId', orderNumber))}
          >
            Track Order
          </Button>
          <Button
            variant="outline"
            size="lg"
            onClick={() => navigate(ROUTES.CUSTOMER.HOME)}
          >
            Back to Home
          </Button>
        </div>
      </div>
    </div>
  );
}


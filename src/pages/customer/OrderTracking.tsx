import { useParams, Link } from 'react-router-dom';
import { Button, Card } from '@/components/ui';
import { Timeline } from '@/components/customer';
import { ROUTES } from '@/constants';

export default function OrderTracking() {
  const { orderId } = useParams();

  const steps = [
    { label: 'Order Received', time: '7:30 PM', completed: true },
    { label: 'Order Confirmed', time: '7:32 PM', completed: true },
    { label: 'Preparing', time: '7:35 PM', completed: true, isCurrent: true },
    { label: 'Ready for Serving', time: '~7:50 PM', completed: false },
    { label: 'Served / Picked Up', time: '~7:55 PM', completed: false },
  ];

  return (
    <div className="space-y-6 pb-8">
      {/* Back button */}
      <Link
        to={ROUTES.CUSTOMER.MY_ORDERS}
        className="inline-flex items-center gap-1.5 text-sm font-medium text-neutral-500 transition-colors hover:text-primary-500"
      >
        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Back to Orders
      </Link>

      {/* Order Info */}
      <Card className="overflow-hidden border-0 bg-gradient-to-br from-primary-500 to-primary-600 text-white">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-white/70">Order #{orderId}</p>
            <h1 className="mt-1 text-2xl font-bold">Tracking Your Order</h1>
            <p className="mt-1 text-sm text-white/70">Estimated: 15-20 minutes</p>
          </div>
          <div className="rounded-xl bg-white/20 p-3 text-center backdrop-blur-sm">
            <p className="text-2xl font-bold">~15</p>
            <p className="text-xs text-white/70">mins</p>
          </div>
        </div>
      </Card>

      {/* Timeline */}
      <Card>
        <h3 className="mb-6 font-semibold text-neutral-900 dark:text-white">Order Progress</h3>
        <Timeline steps={steps} />
      </Card>

      {/* Order Details */}
      <Card>
        <h3 className="mb-3 font-semibold text-neutral-900 dark:text-white">Order Items</h3>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-neutral-600 dark:text-neutral-400">Margherita Pizza x2</span>
            <span className="font-medium">$25.98</span>
          </div>
          <div className="flex justify-between">
            <span className="text-neutral-600 dark:text-neutral-400">Caesar Salad x1</span>
            <span className="font-medium">$9.99</span>
          </div>
          <hr className="border-neutral-100 dark:border-neutral-700" />
          <div className="flex justify-between font-semibold">
            <span>Total</span>
            <span className="text-primary-500">$38.85</span>
          </div>
        </div>
      </Card>

      {/* Actions */}
      <div className="flex gap-3">
        <Link to={ROUTES.CUSTOMER.FEEDBACK} className="flex-1">
          <Button variant="outline" fullWidth>
            <svg className="mr-1.5 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3l14 9-14 9V3z" />
            </svg>
            Give Feedback
          </Button>
        </Link>
        <Link to={ROUTES.CUSTOMER.MENU} className="flex-1">
          <Button fullWidth>
            <svg className="mr-1.5 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Order More
          </Button>
        </Link>
      </div>
    </div>
  );
}


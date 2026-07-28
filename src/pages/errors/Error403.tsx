import { Link } from 'react-router-dom';
import { Button } from '@/components/ui';
import { ROUTES } from '@/constants';

export default function Error403() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-neutral-50 px-4 dark:bg-neutral-900">
      <div className="text-center">
        <h1 className="text-8xl font-bold text-primary-500">403</h1>
        <h2 className="mt-4 text-2xl font-semibold text-neutral-900 dark:text-white">
          Access Denied
        </h2>
        <p className="mt-2 text-neutral-500">
          You don't have permission to access this page.
        </p>
        <div className="mt-8 flex items-center justify-center gap-4">
          <Link to={ROUTES.DEFAULT}>
            <Button>Go Home</Button>
          </Link>
          <Link to={ROUTES.AUTH.LOGIN}>
            <Button variant="outline">Sign In</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}

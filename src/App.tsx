import { Suspense } from 'react';
import { RouterProvider } from 'react-router-dom';
import router from '@/routes';

export default function App() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center text-sm text-neutral-500">Loading page...</div>}>
      <RouterProvider router={router} />
    </Suspense>
  );
}


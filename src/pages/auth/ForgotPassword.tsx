import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button, Input } from '@/components/ui';
import { ROUTES } from '@/constants';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
          <svg className="h-8 w-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
        </div>
        <h2 className="text-xl font-bold text-neutral-900 dark:text-white">Check Your Email</h2>
        <p className="mt-2 text-sm text-neutral-500">
          We've sent a password reset link to {email}
        </p>
        <Link
          to={ROUTES.AUTH.LOGIN}
          className="mt-6 inline-block text-sm font-medium text-primary-500 hover:text-primary-600"
        >
          Back to login
        </Link>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8 text-center">
        <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">
          Forgot Password
        </h1>
        <p className="mt-2 text-sm text-neutral-500">
          Enter your email and we'll send you a reset link
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Email"
          type="email"
          placeholder="john@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <Button type="submit" fullWidth>
          Send Reset Link
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-neutral-500">
        Remember your password?{' '}
        <Link
          to={ROUTES.AUTH.LOGIN}
          className="font-medium text-primary-500 hover:text-primary-600"
        >
          Sign in
        </Link>
      </p>
    </div>
  );
}


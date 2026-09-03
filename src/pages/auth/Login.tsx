import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button, Input } from '@/components/ui';
import { ROUTES } from '@/constants';
import { useAuthStore } from '@/store';
import GoogleAuthButton, { redirectByRole } from '@/components/auth/GoogleAuthButton';

export default function Login() {
  const navigate = useNavigate();
  const isLoading = useAuthStore((state) => state.isLoading);
  const error = useAuthStore((state) => state.error);
  const login = useAuthStore((state) => state.login);
  const clearError = useAuthStore((state) => state.clearError);

  const [loginMethod, setLoginMethod] = useState<'email' | 'mobile'>('email');
  const [email, setEmail] = useState('');
  const [mobile, setMobile] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  const validate = (): boolean => {
    const errors: Record<string, string> = {};

    if (loginMethod === 'email') {
      if (!email.trim()) {
        errors.email = 'Email is required';
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        errors.email = 'Invalid email format';
      }
    } else {
      if (!mobile.trim()) {
        errors.mobile = 'Mobile number is required';
      } else if (!/^\+?[\d\s-]{10,}$/.test(mobile)) {
        errors.mobile = 'Invalid phone number';
      }
    }

    if (!password) {
      errors.password = 'Password is required';
    } else if (password.length < 3) {
      errors.password = 'Password must be at least 3 characters';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const clearFieldError = (field: string) => {
    setValidationErrors((prev) => {
      const next = { ...prev };
      delete next[field];
      return next;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    if (!validate()) return;

    if (loginMethod === 'email') {
      await login({ email, password });
    } else {
      const normalizedMobile = mobile.replace(/\D/g, '');
      await login({ phone: `+${normalizedMobile}`, password });
    }

    const { isAuthenticated } = useAuthStore.getState();
    if (isAuthenticated) {
      const role = useAuthStore.getState().user?.role;
      redirectByRole(navigate, role);
    }
  };

  return (
    <div>
      <div className="mb-8 text-center animate-fade-in-up [animation-delay:80ms]">
        <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">Welcome Back</h1>
        <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">Sign in to continue dining</p>
      </div>

      {error && (
        <div className="mb-5 animate-slideUp rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-800 dark:bg-red-900/30 dark:text-red-300">
          <div className="flex items-center gap-2">
            <svg className="h-5 w-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="flex-1">{error}</span>
            <button onClick={clearError} className="ml-2 font-medium underline hover:no-underline">Dismiss</button>
        </div>
        </div>
      )}

      <div className="mb-6 flex rounded-xl bg-neutral-100 p-1 shadow-inner animate-fade-in-up [animation-delay:160ms] dark:bg-neutral-800">
        <button
          type="button"
          onClick={() => { setLoginMethod('email'); setValidationErrors({}); }}
          className={`flex-1 rounded-lg py-2.5 text-sm font-medium transition-all ${loginMethod === 'email' ? 'bg-white text-primary-600 shadow-sm dark:bg-neutral-700 dark:text-primary-400' : 'text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300'}`}
        >
          <svg className="mx-auto mb-1 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
          Email
        </button>
        <button
          type="button"
          onClick={() => { setLoginMethod('mobile'); setValidationErrors({}); }}
          className={`flex-1 rounded-lg py-2.5 text-sm font-medium transition-all ${loginMethod === 'mobile' ? 'bg-white text-primary-600 shadow-sm dark:bg-neutral-700 dark:text-primary-400' : 'text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300'}`}
        >
          <svg className="mx-auto mb-1 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
          </svg>
          Mobile
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4 animate-fade-in-up [animation-delay:220ms]">
        {loginMethod === 'email' ? (
          <Input
            label="Email Address"
            type="email"
            placeholder="john@example.com"
            value={email}
            onChange={(e) => { setEmail(e.target.value); clearFieldError('email'); }}
            error={validationErrors.email}
            required
          />
        ) : (
          <Input
            label="Mobile Number"
            type="tel"
            placeholder="+1-555-0101"
            value={mobile}
            onChange={(e) => { setMobile(e.target.value); clearFieldError('mobile'); }}
            error={validationErrors.mobile}
            required
          />
        )}

        <div className="relative">
          <Input
            label="Password"
            type={showPassword ? 'text' : 'password'}
            placeholder="Enter your password"
            value={password}
            onChange={(e) => { setPassword(e.target.value); clearFieldError('password'); }}
            error={validationErrors.password}
            required
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-[38px] text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300"
          >
            {showPassword ? (
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
              </svg>
            ) : (
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            )}
          </button>
        </div>

        <div className="flex items-center justify-between">
          <label className="flex cursor-pointer items-center gap-2 text-sm text-neutral-600 dark:text-neutral-400">
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="h-4 w-4 rounded border-neutral-300 text-primary-500 focus:ring-primary-500"
            />
            Remember me
          </label>
          <Link to={ROUTES.AUTH.FORGOT_PASSWORD} className="text-sm font-medium text-primary-500 transition-colors hover:text-primary-600">
            Forgot password?
          </Link>
        </div>

        <Button type="submit" fullWidth size="lg" isLoading={isLoading}>
          {isLoading ? 'Signing In...' : 'Sign In'}
        </Button>
      </form>

      <div className="my-6 flex items-center gap-3">
        <div className="h-px flex-1 bg-neutral-200 dark:bg-neutral-700" />
        <span className="text-xs font-medium text-neutral-400">OR</span>
        <div className="h-px flex-1 bg-neutral-200 dark:bg-neutral-700" />
      </div>

      <GoogleAuthButton mode="signin" />

      <p className="mt-6 text-center text-sm text-neutral-500">
        Don't have an account?{' '}
        <Link to={ROUTES.AUTH.REGISTER} className="font-semibold text-primary-500 transition-colors hover:text-primary-600">
          Create Account
        </Link>
      </p>
    </div>
  );
}

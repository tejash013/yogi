import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button, Input } from '@/components/ui';
import { ROUTES } from '@/constants';
import { useAuthStore } from '@/store';

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
      if (role === 'platformAdmin') {
        navigate(ROUTES.WORKSPACE);
      } else if (role === 'owner') {
        navigate(ROUTES.OWNER.DASHBOARD);
      } else if (role === 'manager') {
        navigate(ROUTES.ADMIN.DASHBOARD);
      } else if (role === 'chef') {
        navigate(ROUTES.KITCHEN.DASHBOARD);
      } else if (role === 'cashier') {
        navigate(ROUTES.CASHIER.DASHBOARD);
      } else {
        navigate(ROUTES.CUSTOMER.HOME);
      }
    }
  };

  return (
    <div>
      <div className="mb-8 text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-primary-500 to-primary-600 shadow-lg shadow-primary-500/30">
          <span className="text-2xl font-bold text-white">R</span>
        </div>
        <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">Welcome Back</h1>
        <p className="mt-1 text-sm text-neutral-500">Sign in to continue dining</p>
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

      <div className="mb-6 flex rounded-xl bg-neutral-100 p-1 dark:bg-neutral-800">
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

      <form onSubmit={handleSubmit} className="space-y-4">
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

      <button
        type="button"
        className="flex w-full items-center justify-center gap-3 rounded-xl border-2 border-neutral-200 bg-white px-4 py-3 text-sm font-medium text-neutral-700 transition-all hover:border-neutral-300 hover:bg-neutral-50 dark:border-neutral-600 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:border-neutral-500"
      >
        <svg className="h-5 w-5" viewBox="0 0 24 24">
          <path fill="#EA4335" d="M5.266 9.765A7.077 7.077 0 0112 4.91c1.665 0 3.158.613 4.303 1.626l3.196-3.196A11.954 11.954 0 0012 0C7.667 0 3.855 2.322 1.8 5.715l3.466 4.05z" />
          <path fill="#34A853" d="M16.693 19.626A7.048 7.048 0 0112 21.09c-3.876 0-7.178-2.623-8.336-6.243l-3.466 4.05A11.96 11.96 0 0012 24c3.27 0 6.286-1.323 8.463-3.596l-3.77-2.778z" />
          <path fill="#FBBC05" d="M5.337 14.268A7.12 7.12 0 014.89 12c0-.723.12-1.44.348-2.118L1.8 5.715A11.89 11.89 0 000 12c0 2.308.653 4.494 1.82 6.45l3.517-4.182z" />
          <path fill="#4285F4" d="M12 21.09c2.427 0 4.636-.98 6.255-2.56l3.77 2.778C20.338 21.183 16.478 24 12 24V21.09z" />
          <path fill="#34A853" d="M22.637 12c0-.789-.07-1.575-.21-2.34H12v4.364h6.016a5.68 5.68 0 01-1.973 2.634l3.77 2.778c2.172-2.052 3.484-5.056 3.484-8.436z" />
        </svg>
        Continue with Google
      </button>

      <p className="mt-6 text-center text-sm text-neutral-500">
        Don't have an account?{' '}
        <Link to={ROUTES.AUTH.REGISTER} className="font-semibold text-primary-500 transition-colors hover:text-primary-600">
          Create Account
        </Link>
      </p>
    </div>
  );
}

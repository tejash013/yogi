import { useState, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui';
import { ROUTES } from '@/constants';
import { authApi } from '@/api';
import { useToastStore } from '@/store';

export default function OTPVerification() {
  const navigate = useNavigate();
  const location = useLocation();
  const showToast = useToastStore((s) => s.showToast);

  const email = (location.state as any)?.email || '';
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const handleChange = (index: number, value: string) => {
    if (value.length > 1) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const otpCode = otp.join('');
    if (otpCode.length < 6) {
      showToast('Please enter the full 6-digit OTP', 'warning');
      return;
    }

    setIsVerifying(true);
    try {
      await authApi.verifyOtp(email, otpCode);
      showToast('Account verified successfully! Please sign in.', 'success');
      navigate(ROUTES.AUTH.LOGIN);
    } catch (err: any) {
      showToast(err?.response?.data?.message || 'Invalid or expired OTP', 'error');
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResend = async () => {
    if (!email) {
      showToast('Email address not found. Please log in again.', 'warning');
      return;
    }
    setIsResending(true);
    try {
      await authApi.forgotPassword(email);
      showToast('New OTP code dispatched to your email', 'success');
    } catch (err: any) {
      showToast(err?.response?.data?.message || 'Failed to resend OTP', 'error');
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div>
      <div className="mb-8 text-center">
        <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">
          Verify OTP
        </h1>
        <p className="mt-2 text-sm text-neutral-500">
          Enter the 6-digit verification code sent to {email ? <span className="font-semibold">{email}</span> : 'your email'}
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="mb-6 flex justify-center gap-2.5 sm:gap-3">
          {otp.map((digit, index) => (
            <input
              key={index}
              ref={(el) => { inputRefs.current[index] = el; }}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onChange={(e) => handleChange(index, e.target.value)}
              onKeyDown={(e) => handleKeyDown(index, e)}
              className="h-12 w-12 rounded-xl border border-neutral-300 text-center text-xl font-bold text-neutral-900 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 dark:border-neutral-600 dark:bg-neutral-800 dark:text-white"
            />
          ))}
        </div>

        <Button type="submit" fullWidth isLoading={isVerifying}>
          Verify OTP
        </Button>
      </form>

      <div className="mt-6 text-center">
        <p className="text-sm text-neutral-500">
          Didn't receive the code?{' '}
          <button
            onClick={handleResend}
            disabled={isResending}
            className="font-medium text-primary-500 hover:text-primary-600 disabled:opacity-50"
          >
            {isResending ? 'Sending...' : 'Resend'}
          </button>
        </p>
        <Link
          to={ROUTES.AUTH.LOGIN}
          className="mt-2 inline-block text-sm text-neutral-500 hover:text-neutral-700 dark:text-neutral-400 dark:hover:text-neutral-200"
        >
          Back to login
        </Link>
      </div>
    </div>
  );
}

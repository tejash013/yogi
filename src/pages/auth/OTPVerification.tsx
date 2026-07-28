import { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui';
import { ROUTES } from '@/constants';

export default function OTPVerification() {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Will verify OTP
  };

  return (
    <div>
      <div className="mb-8 text-center">
        <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">
          Verify OTP
        </h1>
        <p className="mt-2 text-sm text-neutral-500">
          Enter the 6-digit code sent to your email
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="mb-6 flex justify-center gap-3">
          {otp.map((digit, index) => (
            <input
              key={index}
              ref={(el) => { inputRefs.current[index] = el; }}
              type="text"
              maxLength={1}
              value={digit}
              onChange={(e) => handleChange(index, e.target.value)}
              onKeyDown={(e) => handleKeyDown(index, e)}
              className="h-12 w-12 rounded-lg border border-neutral-300 text-center text-lg font-semibold text-neutral-900 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 dark:border-neutral-600 dark:bg-neutral-800 dark:text-white"
            />
          ))}
        </div>

        <Button type="submit" fullWidth>
          Verify OTP
        </Button>
      </form>

      <div className="mt-6 text-center">
        <p className="text-sm text-neutral-500">
          Didn't receive the code?{' '}
          <button className="font-medium text-primary-500 hover:text-primary-600">
            Resend
          </button>
        </p>
        <Link
          to={ROUTES.AUTH.LOGIN}
          className="mt-2 inline-block text-sm text-neutral-500 hover:text-neutral-700"
        >
          Back to login
        </Link>
      </div>
    </div>
  );
}


import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button, Input } from '@/components/ui';
import { ROUTES } from '@/constants';
import { useAuthStore } from '@/store';

type RegisterForm = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
};

type ValidationErrors = Partial<Record<keyof RegisterForm, string>>;

export default function Register() {
  const navigate = useNavigate();
  const register = useAuthStore((state) => state.register);
  const isLoading = useAuthStore((state) => state.isLoading);
  const error = useAuthStore((state) => state.error);
  const clearError = useAuthStore((state) => state.clearError);

  const [formData, setFormData] = useState<RegisterForm>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  });
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({});

  const validate = () => {
    const nextErrors: ValidationErrors = {};

    if (!formData.firstName.trim()) nextErrors.firstName = 'First name is required';
    if (!formData.lastName.trim()) nextErrors.lastName = 'Last name is required';
    if (!formData.email.trim()) {
      nextErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      nextErrors.email = 'Invalid email address';
    }
    if (!formData.phone.trim()) {
      nextErrors.phone = 'Phone number is required';
    } else if (!/^\+?[0-9\s-]{7,}$/.test(formData.phone)) {
      nextErrors.phone = 'Invalid phone number';
    }
    if (!formData.password) nextErrors.password = 'Password is required';
    if (!formData.confirmPassword) nextErrors.confirmPassword = 'Confirm your password';
    if (formData.password && formData.confirmPassword && formData.password !== formData.confirmPassword) {
      nextErrors.confirmPassword = 'Passwords do not match';
    }
    if (formData.password && formData.password.length > 0 && formData.password.length < 6) {
      nextErrors.password = 'Password must be at least 6 characters';
    }

    setValidationErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();

    if (!validate()) return;

    await register(formData);
    const { isAuthenticated, error: currentError } = useAuthStore.getState();

    if (isAuthenticated && !currentError) {
      navigate(ROUTES.CUSTOMER.HOME);
    } else if (!currentError) {
      navigate(ROUTES.AUTH.LOGIN);
    }
  };

  const handleChange = (field: keyof RegisterForm, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setValidationErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  return (
    <div>
      <div className="mb-8 text-center">
        <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">Create Account</h1>
        <p className="mt-2 text-sm text-neutral-500">Join RestaurantOS and streamline your dining experience</p>
      </div>

      {error && (
        <div className="mb-5 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-800 dark:bg-red-900/30 dark:text-red-300">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <Input
            label="First Name"
            placeholder="John"
            value={formData.firstName}
            onChange={(e) => handleChange('firstName', e.target.value)}
            error={validationErrors.firstName}
            required
          />
          <Input
            label="Last Name"
            placeholder="Doe"
            value={formData.lastName}
            onChange={(e) => handleChange('lastName', e.target.value)}
            error={validationErrors.lastName}
            required
          />
        </div>
        <Input
          label="Email"
          type="email"
          placeholder="john@example.com"
          value={formData.email}
          onChange={(e) => handleChange('email', e.target.value)}
          error={validationErrors.email}
          required
        />
        <Input
          label="Phone"
          type="tel"
          placeholder="+1-555-0000"
          value={formData.phone}
          onChange={(e) => handleChange('phone', e.target.value)}
          error={validationErrors.phone}
          required
        />
        <Input
          label="Password"
          type="password"
          placeholder="Create a password"
          value={formData.password}
          onChange={(e) => handleChange('password', e.target.value)}
          error={validationErrors.password}
          required
        />
        <Input
          label="Confirm Password"
          type="password"
          placeholder="Confirm your password"
          value={formData.confirmPassword}
          onChange={(e) => handleChange('confirmPassword', e.target.value)}
          error={validationErrors.confirmPassword}
          required
        />
        <Button type="submit" fullWidth isLoading={isLoading}>
          {isLoading ? 'Creating account...' : 'Create Account'}
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-neutral-500">
        Already have an account?{' '}
        <Link to={ROUTES.AUTH.LOGIN} className="font-medium text-primary-500 hover:text-primary-600">
          Sign in
        </Link>
      </p>
    </div>
  );
}


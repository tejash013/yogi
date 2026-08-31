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

const countries = [
  { code: 'IN', name: 'India', dialCode: '+91', min: 10, max: 10 },
  { code: 'US', name: 'United States', dialCode: '+1', min: 10, max: 10 },
  { code: 'CA', name: 'Canada', dialCode: '+1', min: 10, max: 10 },
  { code: 'GB', name: 'United Kingdom', dialCode: '+44', min: 9, max: 10 },
  { code: 'AU', name: 'Australia', dialCode: '+61', min: 9, max: 9 },
  { code: 'AE', name: 'United Arab Emirates', dialCode: '+971', min: 9, max: 9 },
  { code: 'SG', name: 'Singapore', dialCode: '+65', min: 8, max: 8 },
  { code: 'DE', name: 'Germany', dialCode: '+49', min: 10, max: 11 },
  { code: 'FR', name: 'France', dialCode: '+33', min: 9, max: 9 },
  { code: 'ZA', name: 'South Africa', dialCode: '+27', min: 9, max: 9 },
] as const;

const namePattern = /^[A-Za-z][A-Za-z\s'-]{1,49}$/;
const emailPattern = /^[^\s@]+@[^\s@]+\.[A-Za-z]{2,}$/;
const strongPasswordPattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d]).{8,72}$/;

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
  const [countryCode, setCountryCode] = useState('IN');

  const selectedCountry = countries.find((country) => country.code === countryCode) ?? countries[0];

  const validate = () => {
    const nextErrors: ValidationErrors = {};

    const firstName = formData.firstName.trim();
    const lastName = formData.lastName.trim();
    if (!firstName) nextErrors.firstName = 'First name is required';
    else if (!namePattern.test(firstName)) nextErrors.firstName = 'Use 2-50 letters, spaces, hyphens or apostrophes';
    if (lastName && !namePattern.test(lastName)) nextErrors.lastName = 'Use 2-50 letters, spaces, hyphens or apostrophes';
    if (!formData.email.trim()) {
      nextErrors.email = 'Email is required';
    } else if (!emailPattern.test(formData.email.trim()) || !/[A-Za-z]/.test(formData.email.split('@')[0])) {
      nextErrors.email = 'Enter a valid email address';
    }
    const localPhone = formData.phone.replace(/\D/g, '');
    if (!localPhone) {
      nextErrors.phone = 'Phone number is required';
    } else if (localPhone.length < selectedCountry.min || localPhone.length > selectedCountry.max) {
      nextErrors.phone = `${selectedCountry.name} mobile numbers must have ${selectedCountry.min === selectedCountry.max ? selectedCountry.min : `${selectedCountry.min}-${selectedCountry.max}`} digits`;
    }
    if (!formData.password) nextErrors.password = 'Password is required';
    else if (!strongPasswordPattern.test(formData.password)) nextErrors.password = 'Use 8-72 characters with uppercase, lowercase, number and symbol';
    if (!formData.confirmPassword) nextErrors.confirmPassword = 'Confirm your password';
    if (formData.password && formData.confirmPassword && formData.password !== formData.confirmPassword) {
      nextErrors.confirmPassword = 'Passwords do not match';
    }
    setValidationErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();

    if (!validate()) return;

    const localPhone = formData.phone.replace(/\D/g, '');
    await register({ ...formData, phone: `${selectedCountry.dialCode}${localPhone}` });
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
            placeholder="Doe (optional)"
            value={formData.lastName}
            onChange={(e) => handleChange('lastName', e.target.value)}
            error={validationErrors.lastName}
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
        <div>
          <label className="mb-1.5 block text-sm font-medium text-neutral-700 dark:text-neutral-300">Mobile Number</label>
          <div className="grid grid-cols-[minmax(0,0.9fr)_minmax(0,1.5fr)] gap-2">
            <select
              value={countryCode}
              onChange={(e) => {
                setCountryCode(e.target.value);
                setValidationErrors((prev) => ({ ...prev, phone: undefined }));
              }}
              aria-label="Country code"
              className="min-w-0 rounded-xl border border-neutral-200 bg-white px-2.5 py-2.5 text-sm text-neutral-900 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100"
            >
              {countries.map((country) => (
                <option key={country.code} value={country.code}>{country.name} ({country.dialCode})</option>
              ))}
            </select>
            <input
              type="tel"
              inputMode="numeric"
              autoComplete="tel-national"
              placeholder={selectedCountry.code === 'IN' ? '9876543210' : 'Mobile number'}
              value={formData.phone}
              onChange={(e) => handleChange('phone', e.target.value.replace(/[^\d\s-]/g, ''))}
              className="min-w-0 rounded-xl border border-neutral-200 bg-white px-3 py-2.5 text-sm text-neutral-900 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100"
              required
            />
          </div>
          {validationErrors.phone ? <p className="mt-1 text-xs text-red-500">{validationErrors.phone}</p> : null}
        </div>
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


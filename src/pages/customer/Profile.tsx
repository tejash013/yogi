import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Card } from '@/components/ui';
import { ROUTES } from '@/constants';
import { useAuthStore } from '@/store';

const defaultProfile = {
  firstName: 'John',
  lastName: 'Doe',
  email: 'john.doe@example.com',
  phone: '+1-555-0101',
  birthday: '1990-06-15',
  membership: 'Gold',
  rewardPoints: 1250,
  walletBalance: 25.5,
  totalOrders: 47,
  favoriteCount: 12,
  savedCoupons: 5,
};

export default function CustomerProfile() {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);

  useEffect(() => {
    if (!user) {
      navigate(ROUTES.AUTH.LOGIN);
    }
  }, [user, navigate]);

  const profileData = user
    ? {
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phone: user.phone,
        birthday: user.createdAt ? user.createdAt.slice(0, 10) : 'N/A',
        membership: 'Gold',
        rewardPoints: 1250,
        walletBalance: 25.5,
        totalOrders: 47,
        favoriteCount: 12,
        savedCoupons: 5,
      }
    : defaultProfile;

  const [isEditing, setIsEditing] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [notifications, setNotifications] = useState(true);
  const [language, setLanguage] = useState('en');
  const [form, setForm] = useState({
    firstName: profileData.firstName,
    lastName: profileData.lastName,
    email: profileData.email,
    phone: profileData.phone,
    birthday: profileData.birthday,
  });

  useEffect(() => {
    setForm({
      firstName: profileData.firstName,
      lastName: profileData.lastName,
      email: profileData.email,
      phone: profileData.phone,
      birthday: profileData.birthday,
    });
  }, [profileData.firstName, profileData.lastName, profileData.email, profileData.phone, profileData.birthday]);

  const handleLogout = () => {
    logout();
    navigate(ROUTES.AUTH.LOGIN);
  };

  const statsCards = [
    { label: 'Total Orders', value: profileData.totalOrders, icon: '📋', color: 'bg-blue-50 dark:bg-blue-900/20' },
    { label: 'Favorites', value: profileData.favoriteCount, icon: '❤️', color: 'bg-red-50 dark:bg-red-900/20' },
    { label: 'Reward Points', value: profileData.rewardPoints, icon: '⭐', color: 'bg-amber-50 dark:bg-amber-900/20' },
    { label: 'Coupons', value: profileData.savedCoupons, icon: '🏷️', color: 'bg-green-50 dark:bg-green-900/20' },
  ];

  return (
    <div className="space-y-6 pb-8">
      {/* Profile Header */}
      <Card className="overflow-hidden border-0 bg-gradient-to-br from-primary-500 to-primary-600 text-white">
        <div className="text-center">
          <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full border-4 border-white/30 bg-white/20 text-3xl font-bold">
            {profileData.firstName.charAt(0)}{profileData.lastName.charAt(0)}
          </div>
          <h2 className="text-xl font-bold">{profileData.firstName} {profileData.lastName}</h2>
          <p className="text-sm text-white/70">{profileData.email}</p>
          <div className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-white/20 px-3 py-1 text-xs font-medium backdrop-blur-sm">
            <span className="text-yellow-300">✦</span>
            {profileData.membership} Member
          </div>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-4">
          <div className="rounded-xl bg-white/10 p-3 text-center backdrop-blur-sm">
            <p className="text-2xl font-bold">{profileData.rewardPoints.toLocaleString()}</p>
            <p className="text-xs text-white/70">Reward Points</p>
          </div>
          <div className="rounded-xl bg-white/10 p-3 text-center backdrop-blur-sm">
            <p className="text-2xl font-bold">₹{profileData.walletBalance.toFixed(2)}</p>
            <p className="text-xs text-white/70">Wallet Balance</p>
          </div>
        </div>
      </Card>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-3">
        {statsCards.map((stat) => (
          <div key={stat.label} className={`${stat.color} rounded-xl p-4`}>
            <div className="mb-2 text-2xl">{stat.icon}</div>
            <p className="text-xl font-bold text-neutral-900 dark:text-white">{stat.value}</p>
            <p className="text-xs text-neutral-500">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Edit Profile / Information */}
      <Card>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-neutral-900 dark:text-white">Personal Information</h3>
          {!isEditing && (
            <button
              onClick={() => setIsEditing(true)}
              className="text-sm font-medium text-primary-500 hover:text-primary-600"
            >
              Edit
            </button>
          )}
        </div>

        {isEditing ? (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-neutral-700 dark:text-neutral-300">First Name</label>
                <input
                  value={form.firstName}
                  onChange={(e) => setForm({ ...form, firstName: e.target.value })}
                  className="w-full rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 dark:border-neutral-600 dark:bg-neutral-800"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-neutral-700 dark:text-neutral-300">Last Name</label>
                <input
                  value={form.lastName}
                  onChange={(e) => setForm({ ...form, lastName: e.target.value })}
                  className="w-full rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 dark:border-neutral-600 dark:bg-neutral-800"
                />
              </div>
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-neutral-700 dark:text-neutral-300">Email</label>
              <input
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 dark:border-neutral-600 dark:bg-neutral-800"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-neutral-700 dark:text-neutral-300">Phone</label>
              <input
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                className="w-full rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 dark:border-neutral-600 dark:bg-neutral-800"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-neutral-700 dark:text-neutral-300">Birthday</label>
              <input
                type="date"
                value={form.birthday}
                onChange={(e) => setForm({ ...form, birthday: e.target.value })}
                className="w-full rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 dark:border-neutral-600 dark:bg-neutral-800"
              />
            </div>
            <div className="flex gap-3">
              <Button type="button" onClick={() => setIsEditing(false)}>Save Changes</Button>
              <Button type="button" variant="ghost" onClick={() => setIsEditing(false)}>Cancel</Button>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-sm text-neutral-500">Name</span>
              <span className="text-sm font-medium text-neutral-900 dark:text-white">
                {profileData.firstName} {profileData.lastName}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-neutral-500">Email</span>
              <span className="text-sm font-medium text-neutral-900 dark:text-white">{profileData.email}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-neutral-500">Phone</span>
              <span className="text-sm font-medium text-neutral-900 dark:text-white">{profileData.phone}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-neutral-500">Birthday</span>
              <span className="text-sm font-medium text-neutral-900 dark:text-white">{profileData.birthday}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-neutral-500">Membership</span>
              <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-xs font-medium text-amber-700 dark:bg-amber-900/30 dark:text-amber-300">
                ✦ {profileData.membership}
              </span>
            </div>
          </div>
        )}
      </Card>

      {/* Settings */}
      <Card>
        <h3 className="mb-4 font-semibold text-neutral-900 dark:text-white">Settings</h3>
        <div className="space-y-4">
          {/* Change Password */}
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-neutral-900 dark:text-white">Password</p>
              <p className="text-xs text-neutral-500">Change your password</p>
            </div>
            <Button size="sm" variant="outline">Change</Button>
          </div>

          <hr className="border-neutral-100 dark:border-neutral-700" />

          {/* Notifications */}
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-neutral-900 dark:text-white">Push Notifications</p>
              <p className="text-xs text-neutral-500">Receive order updates</p>
            </div>
            <button
              onClick={() => setNotifications(!notifications)}
              className={`h-6 w-11 rounded-full transition-colors ${
                notifications ? 'bg-primary-500' : 'bg-neutral-300 dark:bg-neutral-600'
              }`}
            >
              <div className={`h-5 w-5 -translate-y-0.5 rounded-full bg-white shadow transition-transform ${
                notifications ? 'translate-x-5' : 'translate-x-0.5'
              }`} />
            </button>
          </div>

          <hr className="border-neutral-100 dark:border-neutral-700" />

          {/* Dark Mode */}
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-neutral-900 dark:text-white">Dark Mode</p>
              <p className="text-xs text-neutral-500">Toggle dark theme</p>
            </div>
            <button
              onClick={() => setDarkMode(!darkMode)}
              className={`h-6 w-11 rounded-full transition-colors ${
                darkMode ? 'bg-primary-500' : 'bg-neutral-300 dark:bg-neutral-600'
              }`}
            >
              <div className={`h-5 w-5 -translate-y-0.5 rounded-full bg-white shadow transition-transform ${
                darkMode ? 'translate-x-5' : 'translate-x-0.5'
              }`} />
            </button>
          </div>

          <hr className="border-neutral-100 dark:border-neutral-700" />

          {/* Language */}
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-neutral-900 dark:text-white">Language</p>
              <p className="text-xs text-neutral-500">App language preference</p>
            </div>
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="rounded-lg border border-neutral-200 bg-white px-3 py-1.5 text-sm focus:border-primary-500 focus:outline-none dark:border-neutral-600 dark:bg-neutral-800"
            >
              <option value="en">English</option>
              <option value="es">Spanish</option>
              <option value="fr">French</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Logout */}
      <Card>
        <div className="flex items-center justify-between">
          <div>
            <p className="font-semibold text-neutral-900 dark:text-white">Account</p>
            <p className="text-xs text-neutral-500">Sign out of your account</p>
          </div>
          <Button variant="danger" onClick={handleLogout}>
            <svg className="mr-1 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            Logout
          </Button>
        </div>
      </Card>
    </div>
  );
}


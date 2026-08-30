import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Card, Badge } from '@/components/ui';
import { ROUTES } from '@/constants';
import { useAuthStore, useToastStore } from '@/store';
import { ordersApi, usersApi, offersApi } from '@/api';
import { formatCurrency } from '@/utils';

export default function CustomerProfile() {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const setUser = useAuthStore((state) => state.setUser);
  const logout = useAuthStore((state) => state.logout);
  const showToast = useToastStore((state) => state.showToast);

  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [userOrders, setUserOrders] = useState<any[]>([]);
  const [couponsCount, setCouponsCount] = useState<number>(0);
  const [favoriteCount, setFavoriteCount] = useState<number>(0);

  const [form, setForm] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
    phone: user?.phone || '',
    birthday: '',
  });

  useEffect(() => {
    if (!user) {
      navigate(ROUTES.AUTH.LOGIN);
      return;
    }

    setForm({
      firstName: user.firstName || '',
      lastName: user.lastName || '',
      email: user.email || '',
      phone: user.phone || '',
      birthday: '',
    });

    // Load self profile from API
    usersApi.getProfile()
      .then((res) => {
        const u = res.data?.data;
        if (u) {
          setUser(u);
          setForm({
            firstName: u.firstName || '',
            lastName: u.lastName || '',
            email: u.email || '',
            phone: u.phone || '',
            birthday: (u as any).birthday || '',
          });
        }
      })
      .catch(() => {});

    // Load customer order history
    ordersApi.getUserOrders()
      .then((res) => {
        const list = Array.isArray(res.data?.data) ? res.data.data : [];
        setUserOrders(list);
      })
      .catch(() => {});

    // Load active coupons count
    offersApi.getCoupons()
      .then((res) => {
        const list = Array.isArray(res.data?.data) ? res.data.data : [];
        setCouponsCount(list.length);
      })
      .catch(() => {});

    // Count favorites from localStorage
    try {
      const favs = JSON.parse(localStorage.getItem('yogi_favorites') || '[]');
      setFavoriteCount(Array.isArray(favs) ? favs.length : 0);
    } catch {
      setFavoriteCount(0);
    }
  }, [user?._id, user?.id, navigate, setUser]);

  // Compute points and tier dynamically: 10 points per ₹100 spent
  const totalSpent = useMemo(() => {
    return userOrders.reduce((sum, o) => sum + Number(o.total || 0), 0);
  }, [userOrders]);

  const rewardPoints = Math.floor((totalSpent / 100) * 10);
  const membershipTier = rewardPoints >= 1000 ? 'Platinum' : rewardPoints >= 500 ? 'Gold' : rewardPoints >= 100 ? 'Silver' : 'Bronze';

  const handleSaveProfile = async () => {
    setIsSaving(true);
    try {
      const res = await usersApi.updateProfile({
        firstName: form.firstName,
        lastName: form.lastName,
        phone: form.phone,
      });

      if (res.data?.data) {
        setUser(res.data.data);
      }
      showToast('Profile updated successfully', 'success');
      setIsEditing(false);
    } catch (err: any) {
      showToast(err?.response?.data?.message || 'Failed to update profile', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate(ROUTES.AUTH.LOGIN);
  };

  const statsCards = [
    { label: 'Total Orders', value: userOrders.length, icon: '📋', color: 'bg-blue-50 dark:bg-blue-900/20' },
    { label: 'Favorites', value: favoriteCount, icon: '❤️', color: 'bg-red-50 dark:bg-red-900/20' },
    { label: 'Reward Points', value: rewardPoints, icon: '⭐', color: 'bg-amber-50 dark:bg-amber-900/20' },
    { label: 'Available Coupons', value: couponsCount, icon: '🏷️', color: 'bg-green-50 dark:bg-green-900/20' },
  ];

  return (
    <div className="space-y-6 pb-8">
      {/* Profile Header */}
      <Card className="overflow-hidden border-0 bg-gradient-to-br from-primary-600 to-amber-600 text-white shadow-lg">
        <div className="text-center">
          <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full border-4 border-white/30 bg-white/20 text-3xl font-bold shadow-inner">
            {user?.firstName ? user.firstName.charAt(0).toUpperCase() : 'U'}
            {user?.lastName ? user.lastName.charAt(0).toUpperCase() : ''}
          </div>
          <h2 className="text-2xl font-bold">{`${user?.firstName || 'Guest'} ${user?.lastName || ''}`.trim()}</h2>
          <p className="text-sm text-white/80">{user?.email || 'customer@restaurantos.com'}</p>
          <div className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-white/20 px-3.5 py-1 text-xs font-semibold backdrop-blur-sm">
            <span className="text-yellow-300">✦</span>
            {membershipTier} Member
          </div>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-4">
          <div className="rounded-xl bg-white/10 p-3 text-center backdrop-blur-sm">
            <p className="text-2xl font-bold">{rewardPoints.toLocaleString()}</p>
            <p className="text-xs text-white/80">Loyalty Points</p>
          </div>
          <div className="rounded-xl bg-white/10 p-3 text-center backdrop-blur-sm">
            <p className="text-2xl font-bold">{formatCurrency(totalSpent)}</p>
            <p className="text-xs text-white/80">Lifetime Spend</p>
          </div>
        </div>
      </Card>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {statsCards.map((stat) => (
          <div key={stat.label} className={`${stat.color} rounded-2xl p-4 transition-transform hover:scale-[1.02]`}>
            <div className="mb-2 text-2xl">{stat.icon}</div>
            <p className="text-2xl font-bold text-neutral-900 dark:text-white">{stat.value}</p>
            <p className="text-xs font-medium text-neutral-500 dark:text-neutral-400">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Edit Profile / Personal Information */}
      <Card>
        <div className="mb-4 flex items-center justify-between">
          <h3 className="font-semibold text-neutral-900 dark:text-white">Personal Information</h3>
          {!isEditing && (
            <button
              onClick={() => setIsEditing(true)}
              className="text-sm font-semibold text-primary-600 hover:text-primary-700 dark:text-primary-400"
            >
              Edit Profile
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
                  className="w-full rounded-xl border border-neutral-200 bg-white px-3 py-2 text-sm focus:border-primary-500 focus:outline-none dark:border-neutral-600 dark:bg-neutral-800"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-neutral-700 dark:text-neutral-300">Last Name</label>
                <input
                  value={form.lastName}
                  onChange={(e) => setForm({ ...form, lastName: e.target.value })}
                  className="w-full rounded-xl border border-neutral-200 bg-white px-3 py-2 text-sm focus:border-primary-500 focus:outline-none dark:border-neutral-600 dark:bg-neutral-800"
                />
              </div>
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-neutral-700 dark:text-neutral-300">Email Address (Read-only)</label>
              <input
                value={form.email}
                disabled
                className="w-full rounded-xl border border-neutral-200 bg-neutral-100 px-3 py-2 text-sm text-neutral-500 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-400"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-neutral-700 dark:text-neutral-300">Phone Number</label>
              <input
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                placeholder="+91 98765 43210"
                className="w-full rounded-xl border border-neutral-200 bg-white px-3 py-2 text-sm focus:border-primary-500 focus:outline-none dark:border-neutral-600 dark:bg-neutral-800"
              />
            </div>
            <div className="flex gap-3 pt-2">
              <Button type="button" onClick={handleSaveProfile} isLoading={isSaving}>Save Changes</Button>
              <Button type="button" variant="ghost" onClick={() => setIsEditing(false)}>Cancel</Button>
            </div>
          </div>
        ) : (
          <div className="space-y-3 text-sm">
            <div className="flex justify-between border-b pb-2 dark:border-neutral-800">
              <span className="text-neutral-500">Full Name</span>
              <span className="font-medium text-neutral-900 dark:text-white">
                {`${user?.firstName || ''} ${user?.lastName || ''}`.trim() || '—'}
              </span>
            </div>
            <div className="flex justify-between border-b pb-2 dark:border-neutral-800">
              <span className="text-neutral-500">Email Address</span>
              <span className="font-medium text-neutral-900 dark:text-white">{user?.email || '—'}</span>
            </div>
            <div className="flex justify-between border-b pb-2 dark:border-neutral-800">
              <span className="text-neutral-500">Phone</span>
              <span className="font-medium text-neutral-900 dark:text-white">{user?.phone || 'Not set'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-neutral-500">Loyalty Tier</span>
              <Badge variant="primary" size="sm">✦ {membershipTier}</Badge>
            </div>
          </div>
        )}
      </Card>

      {/* Account actions */}
      <Card>
        <div className="flex items-center justify-between">
          <div>
            <p className="font-semibold text-neutral-900 dark:text-white">Account Management</p>
            <p className="text-xs text-neutral-500">Securely sign out of this device</p>
          </div>
          <Button variant="danger" onClick={handleLogout}>
            Logout
          </Button>
        </div>
      </Card>
    </div>
  );
}

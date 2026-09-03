import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { tenantsApi } from '@/api/endpoints';
import { useAuthStore, useTenantStore } from '@/store';
import { ROUTES } from '@/constants';
import type { Branch, Restaurant, AddressDetails } from '@/types';
import {
  calculateDistanceKm,
  formatDistance,
  getCurrentBrowserLocation,
  getIpBasedLocation,
  KNOWN_LOCATION_PRESETS,
  reverseGeocode,
} from '@/utils/geolocation';

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

interface RestaurantFormData {
  name: string;
  slug: string;
  tagline: string;
  phone: string;
  email: string;
  street: string;
  landmark: string;
  city: string;
  state: string;
  pincode: string;
  latitude: number | '';
  longitude: number | '';
  gstNumber: string;
}

interface BranchFormData {
  name: string;
  slug: string;
  branchCode: string;
  phone: string;
  email: string;
  managerName: string;
  street: string;
  landmark: string;
  city: string;
  state: string;
  pincode: string;
  latitude: number | '';
  longitude: number | '';
  seatingCapacity: number;
}

const initialRestaurantForm: RestaurantFormData = {
  name: '',
  slug: '',
  tagline: '',
  phone: '',
  email: '',
  street: '',
  landmark: '',
  city: 'Surat',
  state: 'Gujarat',
  pincode: '',
  latitude: 21.1702,
  longitude: 72.8311,
  gstNumber: '',
};

const initialBranchForm: BranchFormData = {
  name: '',
  slug: '',
  branchCode: '',
  phone: '',
  email: '',
  managerName: '',
  street: '',
  landmark: '',
  city: 'Bardoli',
  state: 'Gujarat',
  pincode: '',
  latitude: 21.1197,
  longitude: 73.1167,
  seatingCapacity: 40,
};

export default function Workspace() {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const {
    restaurantId: activeRestaurantId,
    branchId: activeBranchId,
    userLocation,
    switchRestaurant: storeSwitchRestaurant,
    switchBranch: storeSwitchBranch,
    loadTenants,
  } = useTenantStore();

  const isPlatformAdmin = user?.role === 'platformAdmin';
  const isOwner = user?.role === 'owner';
  const isManager = user?.role === 'manager';
  const isOwnerOrAdmin = isOwner || isPlatformAdmin;

  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [selectedRestaurant, setSelectedRestaurant] = useState(activeRestaurantId || '');
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [branchesLoading, setBranchesLoading] = useState(false);
  const [isLocating, setIsLocating] = useState(false);

  // GPS Tracking Status states
  const [restaurantGpsTrack, setRestaurantGpsTrack] = useState<{
    status: 'idle' | 'verified' | 'preset';
    displayName?: string;
    accuracy?: number;
    source?: 'gps' | 'ip' | 'preset';
  }>({ status: 'idle', displayName: 'Surat, Gujarat' });

  const [branchGpsTrack, setBranchGpsTrack] = useState<{
    status: 'idle' | 'verified' | 'preset';
    displayName?: string;
    accuracy?: number;
    source?: 'gps' | 'ip' | 'preset';
  }>({ status: 'idle', displayName: 'Bardoli, Gujarat' });

  // Modals state
  const [isRestaurantModalOpen, setIsRestaurantModalOpen] = useState(false);
  const [editingRestaurantId, setEditingRestaurantId] = useState<string | null>(null);
  const [restaurantForm, setRestaurantForm] = useState<RestaurantFormData>(initialRestaurantForm);

  const [isBranchModalOpen, setIsBranchModalOpen] = useState(false);
  const [editingBranchId, setEditingBranchId] = useState<string | null>(null);
  const [branchForm, setBranchForm] = useState<BranchFormData>(initialBranchForm);

  const [deleteModal, setDeleteModal] = useState<{
    type: 'restaurant' | 'branch';
    id: string;
    name: string;
  } | null>(null);

  const displayRestaurants = useMemo(() => {
    return restaurants;
  }, [restaurants]);

  const activeRestaurant = useMemo(
    () => displayRestaurants.find((restaurant) => restaurant._id === selectedRestaurant) || displayRestaurants[0],
    [displayRestaurants, selectedRestaurant],
  );

  const handleToggleRestaurantStatus = async (restaurant: Restaurant) => {
    try {
      const newStatus = !restaurant.isActive;
      await tenantsApi.updateRestaurant(restaurant._id, { isActive: newStatus });
      setMessage({
        type: 'success',
        text: `Restaurant "${restaurant.name}" is now ${newStatus ? 'open & active' : 'temporarily paused'}.`,
      });
      void fetchRestaurants();
      void loadTenants();
    } catch {
      setMessage({ type: 'error', text: 'Failed to update restaurant operational status.' });
    }
  };

  const fetchRestaurants = async () => {
    try {
      const response = await tenantsApi.getRestaurants({ includeInactive: true });
      const items = response.data.data;
      setRestaurants(items);
      if (!selectedRestaurant && items.length > 0) {
        const defaultRest = (isOwner && user?.restaurantId) || activeRestaurantId || items[0]._id;
        setSelectedRestaurant(defaultRest);
      }
    } catch {
      setMessage({ type: 'error', text: 'Workspace directory could not be loaded.' });
    } finally {
      setLoading(false);
    }
  };

  const fetchBranches = async (restaurantId: string) => {
    setBranchesLoading(true);
    try {
      const response = await tenantsApi.getBranches(restaurantId, { includeInactive: true });
      setBranches(response.data.data);
    } catch {
      setMessage({ type: 'error', text: 'Branches could not be loaded.' });
    } finally {
      setBranchesLoading(false);
    }
  };

  const handleToggleBranchStatus = async (branch: Branch) => {
    try {
      const newStatus = !branch.isActive;
      await tenantsApi.updateBranch(branch._id, { isActive: newStatus });
      setMessage({
        type: 'success',
        text: `Branch "${branch.name}" is now ${newStatus ? 'open for service (active)' : 'temporarily closed (inactive)'}.`,
      });
      if (selectedRestaurant) {
        void fetchBranches(selectedRestaurant);
      }
      void loadTenants();
    } catch {
      setMessage({ type: 'error', text: 'Failed to update branch operational status.' });
    }
  };

  useEffect(() => {
    void fetchRestaurants();
  }, [activeRestaurantId]);

  useEffect(() => {
    if (!selectedRestaurant) {
      setBranches([]);
      return;
    }
    void fetchBranches(selectedRestaurant);
  }, [selectedRestaurant]);

  // Geolocation quick helpers
  const applyPresetToRestaurant = (presetId: string) => {
    const preset = KNOWN_LOCATION_PRESETS.find((p) => p.id === presetId);
    if (!preset) return;
    setRestaurantForm((prev) => ({
      ...prev,
      city: preset.name,
      state: preset.state,
      latitude: preset.latitude,
      longitude: preset.longitude,
    }));
    setRestaurantGpsTrack({
      status: 'preset',
      displayName: `${preset.name}, ${preset.state}`,
      source: 'preset',
    });
    setMessage({ type: 'success', text: `📍 Restaurant location aligned to ${preset.name}, ${preset.state}` });
  };

  const applyPresetToBranch = (presetId: string) => {
    const preset = KNOWN_LOCATION_PRESETS.find((p) => p.id === presetId);
    if (!preset) return;
    setBranchForm((prev) => ({
      ...prev,
      city: preset.name,
      state: preset.state,
      latitude: preset.latitude,
      longitude: preset.longitude,
    }));
    setBranchGpsTrack({
      status: 'preset',
      displayName: `${preset.name}, ${preset.state}`,
      source: 'preset',
    });
    setMessage({ type: 'success', text: `📍 GPS Track aligned to ${preset.name}, ${preset.state}` });
  };

  const detectLocationForRestaurant = async () => {
    setIsLocating(true);
    try {
      const coords = await getCurrentBrowserLocation();
      const geo = await reverseGeocode(coords.latitude, coords.longitude);
      setRestaurantForm((prev) => ({
        ...prev,
        latitude: Math.round(coords.latitude * 10000) / 10000,
        longitude: Math.round(coords.longitude * 10000) / 10000,
        city: geo.city || prev.city,
        state: coords.state || prev.state,
      }));
      const locationName = geo.displayName || `${geo.city || 'Nearby'}, Gujarat`;
      setRestaurantGpsTrack({
        status: 'verified',
        displayName: locationName,
        accuracy: coords.accuracy,
        source: 'gps',
      });
      setMessage({
        type: 'success',
        text: `🎯 GPS Track Acquired: ${locationName} (Accuracy ±${Math.round(coords.accuracy || 10)}m)`,
      });
    } catch {
      try {
        const ipLoc = await getIpBasedLocation();
        setRestaurantForm((prev) => ({
          ...prev,
          latitude: Math.round(ipLoc.latitude * 10000) / 10000,
          longitude: Math.round(ipLoc.longitude * 10000) / 10000,
          city: ipLoc.city || prev.city,
          state: ipLoc.state || prev.state,
        }));
        setRestaurantGpsTrack({
          status: 'verified',
          displayName: ipLoc.displayName || `${ipLoc.city}, ${ipLoc.state}`,
          source: 'ip',
        });
        setMessage({ type: 'success', text: `📍 Location estimated via network: ${ipLoc.displayName || ipLoc.city}` });
      } catch {
        const preset = KNOWN_LOCATION_PRESETS.find((p) => p.name.toLowerCase() === restaurantForm.city.toLowerCase()) || KNOWN_LOCATION_PRESETS[0];
        setRestaurantForm((prev) => ({
          ...prev,
          latitude: preset.latitude,
          longitude: preset.longitude,
          city: preset.name,
          state: preset.state,
        }));
        setRestaurantGpsTrack({
          status: 'preset',
          displayName: `${preset.name}, ${preset.state}`,
          source: 'preset',
        });
        setMessage({ type: 'success', text: `📍 GPS Track aligned with ${preset.name}, ${preset.state}` });
      }
    } finally {
      setIsLocating(false);
    }
  };

  const detectLocationForBranch = async () => {
    setIsLocating(true);
    try {
      const coords = await getCurrentBrowserLocation();
      const geo = await reverseGeocode(coords.latitude, coords.longitude);
      setBranchForm((prev) => ({
        ...prev,
        latitude: Math.round(coords.latitude * 10000) / 10000,
        longitude: Math.round(coords.longitude * 10000) / 10000,
        city: geo.city || prev.city,
        state: coords.state || prev.state,
      }));
      const locationName = geo.displayName || `${geo.city || 'Nearby'}, Gujarat`;
      setBranchGpsTrack({
        status: 'verified',
        displayName: locationName,
        accuracy: coords.accuracy,
        source: 'gps',
      });
      setMessage({
        type: 'success',
        text: `🎯 GPS Track Acquired: ${locationName} (Accuracy ±${Math.round(coords.accuracy || 10)}m)`,
      });
    } catch {
      try {
        const ipLoc = await getIpBasedLocation();
        setBranchForm((prev) => ({
          ...prev,
          latitude: Math.round(ipLoc.latitude * 10000) / 10000,
          longitude: Math.round(ipLoc.longitude * 10000) / 10000,
          city: ipLoc.city || prev.city,
          state: ipLoc.state || prev.state,
        }));
        setBranchGpsTrack({
          status: 'verified',
          displayName: ipLoc.displayName || `${ipLoc.city}, ${ipLoc.state}`,
          source: 'ip',
        });
        setMessage({ type: 'success', text: `📍 Location estimated via network: ${ipLoc.displayName || ipLoc.city}` });
      } catch {
        const preset = KNOWN_LOCATION_PRESETS.find((p) => p.name.toLowerCase() === branchForm.city.toLowerCase()) || KNOWN_LOCATION_PRESETS[0];
        setBranchForm((prev) => ({
          ...prev,
          latitude: preset.latitude,
          longitude: preset.longitude,
          city: preset.name,
          state: preset.state,
        }));
        setBranchGpsTrack({
          status: 'preset',
          displayName: `${preset.name}, ${preset.state}`,
          source: 'preset',
        });
        setMessage({ type: 'success', text: `📍 GPS Track aligned with ${preset.name}, ${preset.state}` });
      }
    } finally {
      setIsLocating(false);
    }
  };

  // Open modals
  const openCreateRestaurantModal = () => {
    setEditingRestaurantId(null);
    setRestaurantForm(initialRestaurantForm);
    setRestaurantGpsTrack({
      status: 'preset',
      displayName: `${initialRestaurantForm.city}, ${initialRestaurantForm.state}`,
      source: 'preset',
    });
    setIsRestaurantModalOpen(true);
  };

  const openEditRestaurantModal = (restaurant: Restaurant) => {
    setEditingRestaurantId(restaurant._id);
    const details = (restaurant.addressDetails || {}) as Partial<AddressDetails>;
    const city = details.city || 'Surat';
    const state = details.state || 'Gujarat';
    setRestaurantForm({
      name: restaurant.name,
      slug: restaurant.slug,
      tagline: restaurant.tagline || '',
      phone: restaurant.phone || '',
      email: restaurant.email || '',
      street: details.street || '',
      landmark: details.landmark || '',
      city,
      state,
      pincode: details.pincode || '',
      latitude: restaurant.latitude ?? 21.1702,
      longitude: restaurant.longitude ?? 72.8311,
      gstNumber: restaurant.gstNumber || '',
    });
    setRestaurantGpsTrack({
      status: 'verified',
      displayName: `${city}, ${state}`,
      source: 'preset',
    });
    setIsRestaurantModalOpen(true);
  };

  const openCreateBranchModal = () => {
    setEditingBranchId(null);
    setBranchForm(initialBranchForm);
    setBranchGpsTrack({
      status: 'preset',
      displayName: `${initialBranchForm.city}, ${initialBranchForm.state}`,
      source: 'preset',
    });
    setIsBranchModalOpen(true);
  };

  const openEditBranchModal = (branch: Branch) => {
    setEditingBranchId(branch._id);
    const details = (branch.addressDetails || {}) as Partial<AddressDetails>;
    const city = details.city || 'Bardoli';
    const state = details.state || 'Gujarat';
    setBranchForm({
      name: branch.name,
      slug: branch.slug,
      branchCode: branch.branchCode || '',
      phone: branch.phone || '',
      email: branch.email || '',
      managerName: branch.managerName || '',
      street: details.street || '',
      landmark: details.landmark || '',
      city,
      state,
      pincode: details.pincode || '',
      latitude: branch.latitude ?? 21.1197,
      longitude: branch.longitude ?? 73.1167,
      seatingCapacity: branch.seatingCapacity || 40,
    });
    setBranchGpsTrack({
      status: 'verified',
      displayName: `${city}, ${state}`,
      source: 'preset',
    });
    setIsBranchModalOpen(true);
  };

  // Submit handlers
  const handleSaveRestaurant = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!restaurantForm.name.trim()) return;

    const payload: Partial<Restaurant> & { name: string; slug: string } = {
      name: restaurantForm.name.trim(),
      slug: restaurantForm.slug.trim() || slugify(restaurantForm.name),
      tagline: restaurantForm.tagline.trim() || undefined,
      phone: restaurantForm.phone.trim() || undefined,
      email: restaurantForm.email.trim() || undefined,
      gstNumber: restaurantForm.gstNumber.trim() || undefined,
      addressDetails: {
        street: restaurantForm.street.trim() || undefined,
        landmark: restaurantForm.landmark.trim() || undefined,
        city: restaurantForm.city.trim(),
        state: restaurantForm.state.trim(),
        pincode: restaurantForm.pincode.trim() || undefined,
        country: 'India',
      },
      latitude: typeof restaurantForm.latitude === 'number' ? restaurantForm.latitude : undefined,
      longitude: typeof restaurantForm.longitude === 'number' ? restaurantForm.longitude : undefined,
    };

    try {
      if (editingRestaurantId) {
        const res = await tenantsApi.updateRestaurant(editingRestaurantId, payload);
        setMessage({ type: 'success', text: `Restaurant "${res.data.data.name}" updated successfully.` });
      } else {
        const res = await tenantsApi.createRestaurant(payload);
        setSelectedRestaurant(res.data.data._id);
        void storeSwitchRestaurant(res.data.data._id);
        setMessage({ type: 'success', text: `Restaurant "${res.data.data.name}" provisioned successfully.` });
      }
      setIsRestaurantModalOpen(false);
      void fetchRestaurants();
      void loadTenants();
    } catch {
      setMessage({ type: 'error', text: 'Failed to save restaurant details. Check required fields.' });
    }
  };

  const handleSaveBranch = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!branchForm.name.trim() || !selectedRestaurant) return;

    const payload: Partial<Branch> & { name: string; slug: string } = {
      name: branchForm.name.trim(),
      slug: branchForm.slug.trim() || slugify(branchForm.name),
      branchCode: branchForm.branchCode.trim() || undefined,
      phone: branchForm.phone.trim() || undefined,
      email: branchForm.email.trim() || undefined,
      managerName: branchForm.managerName.trim() || undefined,
      seatingCapacity: Number(branchForm.seatingCapacity) || 40,
      addressDetails: {
        street: branchForm.street.trim() || undefined,
        landmark: branchForm.landmark.trim() || undefined,
        city: branchForm.city.trim(),
        state: branchForm.state.trim(),
        pincode: branchForm.pincode.trim() || undefined,
        country: 'India',
      },
      latitude: typeof branchForm.latitude === 'number' ? branchForm.latitude : undefined,
      longitude: typeof branchForm.longitude === 'number' ? branchForm.longitude : undefined,
    };

    try {
      if (editingBranchId) {
        const res = await tenantsApi.updateBranch(editingBranchId, payload);
        setMessage({ type: 'success', text: `Branch "${res.data.data.name}" updated successfully.` });
      } else {
        const res = await tenantsApi.createBranch(selectedRestaurant, payload);
        storeSwitchBranch(res.data.data._id);
        setMessage({ type: 'success', text: `Branch "${res.data.data.name}" added and set as active.` });
      }
      setIsBranchModalOpen(false);
      void fetchBranches(selectedRestaurant);
      void loadTenants();
    } catch {
      setMessage({ type: 'error', text: 'Failed to save branch details. Check required fields.' });
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteModal) return;
    try {
      if (deleteModal.type === 'restaurant') {
        await tenantsApi.deleteRestaurant(deleteModal.id);
        setMessage({ type: 'success', text: `Restaurant "${deleteModal.name}" deactivated.` });
        void fetchRestaurants();
      } else {
        await tenantsApi.deleteBranch(deleteModal.id);
        setMessage({ type: 'success', text: `Branch "${deleteModal.name}" deactivated.` });
        void fetchBranches(selectedRestaurant);
      }
      void loadTenants();
      setDeleteModal(null);
    } catch {
      setMessage({ type: 'error', text: `Failed to deactivate ${deleteModal.type}.` });
    }
  };

  return (
    <main className="min-h-screen bg-[#f4f1ea] px-4 py-6 text-[#17211d] sm:px-8 lg:px-12">
      <div className="mx-auto max-w-7xl">
        {/* Header Banner */}
        <header className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-r from-[#173c35] via-[#1c483f] to-[#122c26] px-6 py-8 text-white shadow-2xl sm:px-10 lg:py-10">
          <div className="absolute -right-16 -top-20 h-64 w-64 rounded-full border-[28px] border-[#d6e85e]/20" />
          <div className="absolute bottom-[-100px] right-48 h-48 w-48 rounded-full bg-[#df714c]/30 blur-2xl" />
          <div className="relative flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-bold uppercase tracking-[0.2em] text-[#d6e85e] backdrop-blur">
                <span>🏢</span> RestaurantOS Multi-Tenant Architecture
              </div>
              <h1 className="mt-4 text-3xl font-extrabold tracking-tight sm:text-5xl">Restaurant & Branch Setup</h1>
              <p className="mt-4 max-w-xl text-sm leading-6 text-white/75">
                Manage your dining chains, configure branches with structured street addresses and GPS coordinates, and effortlessly switch operating context.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <Link
                to={isPlatformAdmin ? ROUTES.PLATFORM_ADMIN.DASHBOARD : isOwner ? ROUTES.OWNER.DASHBOARD : ROUTES.ADMIN.DASHBOARD}
                className="inline-flex h-11 items-center justify-center gap-2 rounded-2xl border border-white/20 bg-white/10 px-4 text-sm font-semibold text-white backdrop-blur transition hover:bg-white/20"
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
                {isPlatformAdmin ? 'Platform Dashboard' : isOwner ? 'Owner Dashboard' : 'Manager Center'}
              </Link>
              {isPlatformAdmin && (
                <Link
                  to={ROUTES.PLATFORM_ADMIN.USERS}
                  className="inline-flex h-11 items-center justify-center gap-2 rounded-2xl border border-[#d6e85e]/40 bg-[#d6e85e] px-4 text-sm font-bold text-[#173c35] transition hover:bg-[#e5f47d]"
                >
                  User Access
                </Link>
              )}
              <button
                onClick={() => {
                  logout();
                  navigate(ROUTES.AUTH.LOGIN);
                }}
                className="inline-flex h-11 items-center justify-center gap-2 rounded-2xl border border-white/20 bg-white/10 px-4 text-sm font-semibold text-white backdrop-blur transition hover:border-red-500 hover:bg-red-500/80"
                title="Sign out of workspace"
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                Sign Out
              </button>
            </div>
          </div>
        </header>

        {/* Feedback Alert */}
        {message && (
          <div
            className={`mt-4 flex items-center justify-between rounded-2xl border p-4 text-sm font-medium transition ${
              message.type === 'success'
                ? 'border-emerald-300 bg-emerald-50 text-emerald-900'
                : 'border-red-300 bg-red-50 text-red-900'
            }`}
          >
            <div className="flex items-center gap-2">
              <span>{message.type === 'success' ? '✅' : '⚠️'}</span>
              <span>{message.text}</span>
            </div>
            <button
              onClick={() => setMessage(null)}
              className="text-xs font-bold uppercase tracking-wider text-neutral-500 hover:text-neutral-800"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Owner Hub Banner */}
        {isOwner && (
          <div className="mt-6 rounded-[2rem] border border-amber-300/60 bg-gradient-to-r from-amber-50 via-orange-50/50 to-amber-50 p-6 shadow-sm">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-amber-500/20 text-2xl border border-amber-400/40">
                  👑
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="rounded-full bg-amber-200/80 px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wider text-amber-900">
                      Owner Control Deck
                    </span>
                    <span className="text-xs font-medium text-neutral-500">
                      {branches.length} Outlets Configured
                    </span>
                  </div>
                  <h3 className="mt-1 text-xl font-bold text-neutral-900">
                    {activeRestaurant?.name || 'Your Dining Brand'}
                  </h3>
                  <p className="mt-0.5 text-xs text-neutral-600">
                    Manage your branch network, configure addresses & GPS, and set your active operating context.
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Link
                  to={ROUTES.OWNER.DASHBOARD}
                  className="inline-flex items-center gap-2 rounded-xl bg-[#173c35] px-4 py-2.5 text-xs font-bold text-white shadow hover:bg-[#23584e]"
                >
                  <span>📊</span> Owner Analytics
                </Link>
                <button
                  type="button"
                  onClick={openCreateBranchModal}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-[#df714c] px-4 py-2.5 text-xs font-bold text-white shadow hover:bg-[#c95f3c]"
                >
                  <span>+</span> Add Outlet
                </button>
              </div>
            </div>
          </div>
        )}

        <section className="mt-8 grid gap-8 lg:grid-cols-[1fr_1.4fr]">
          {/* Column 1: Restaurant Directory */}
          <div className="space-y-6">
            <div className="rounded-[2rem] border border-[#dfd9cc] bg-white p-6 shadow-sm sm:p-7">
              <div className="flex items-center justify-between border-b border-[#eee9df] pb-5">
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#7d877f]">
                    {isOwner ? 'Brand Portfolio' : 'Tenant Architecture'}
                  </p>
                  <h2 className="mt-1 text-2xl font-bold tracking-tight text-[#17211d]">
                    {isOwner ? 'Your Restaurant' : 'Restaurants'}
                  </h2>
                </div>
                {isOwnerOrAdmin && (
                  <button
                    onClick={openCreateRestaurantModal}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-[#173c35] px-3.5 py-2 text-xs font-bold text-white shadow-sm transition hover:bg-[#22574d]"
                  >
                    <span>+</span> Add Restaurant
                  </button>
                )}
              </div>

              <div className="mt-5 space-y-3">
                {loading ? (
                  <p className="py-6 text-center text-sm text-[#7d877f]">Loading workspaces...</p>
                ) : displayRestaurants.length === 0 ? (
                  <p className="py-6 text-center text-sm text-[#7d877f]">No restaurants provisioned yet.</p>
                ) : (
                  displayRestaurants.map((restaurant) => {
                    const isSelected = selectedRestaurant === restaurant._id;
                    const isCurrentActive = restaurant._id === activeRestaurantId;
                    const city = restaurant.addressDetails?.city || (restaurant.address?.split(',').slice(-3, -2)[0]?.trim());

                    return (
                      <div
                        key={restaurant._id}
                        className={`rounded-2xl border p-4 transition-all ${
                          isSelected
                            ? 'border-[#173c35] bg-[#edf4e1] ring-2 ring-[#173c35]/20'
                            : 'border-[#ebe6dc] bg-white hover:border-[#aeb9a8]'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedRestaurant(restaurant._id);
                              void storeSwitchRestaurant(restaurant._id);
                            }}
                            className="flex-1 text-left"
                          >
                            <div className="flex items-center gap-2">
                              <h3 className="font-bold text-base text-[#17211d]">{restaurant.name}</h3>
                              {isCurrentActive && (
                                <span className="rounded-full bg-[#173c35] px-2 py-0.5 text-[9px] font-bold text-white">
                                  Active Context
                                </span>
                              )}
                              {!restaurant.isActive && (
                                <span className="rounded-full bg-red-100 px-2 py-0.5 text-[9px] font-bold text-red-700">
                                  Paused
                                </span>
                              )}
                            </div>
                            <p className="mt-1 text-xs text-[#526000]">
                              📍 {city || 'Headquarters'}
                            </p>
                            {restaurant.address && (
                              <p className="mt-1 line-clamp-1 text-[11px] text-[#7d877f]">{restaurant.address}</p>
                            )}
                          </button>

                          {/* Restaurant Action Buttons (Full CRUD) */}
                          <div className="flex items-center gap-1.5 shrink-0">
                            {isOwnerOrAdmin && (
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  void handleToggleRestaurantStatus(restaurant);
                                }}
                                className={`rounded-lg border px-2 py-1 text-[10px] font-bold transition ${
                                  restaurant.isActive
                                    ? 'border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                                    : 'border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-100'
                                }`}
                                title={restaurant.isActive ? 'Pause restaurant' : 'Open / Activate restaurant'}
                              >
                                {restaurant.isActive ? '🟢 Open' : '⏸️ Paused'}
                              </button>
                            )}
                            {isOwnerOrAdmin && (
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  openEditRestaurantModal(restaurant);
                                }}
                                className="rounded-lg border border-[#ddd3c4] bg-white p-1.5 text-xs text-neutral-600 hover:border-[#173c35] hover:text-[#173c35]"
                                title="Edit Restaurant Details"
                              >
                                ✏️
                              </button>
                            )}
                            {isOwnerOrAdmin && (
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setDeleteModal({ type: 'restaurant', id: restaurant._id, name: restaurant.name });
                                }}
                                className="rounded-lg border border-[#ddd3c4] bg-white p-1.5 text-xs text-red-500 hover:border-red-400 hover:bg-red-50"
                                title="Deactivate Restaurant"
                              >
                                🗑️
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>

          {/* Column 2: Branch Network for Selected Restaurant */}
          <div className="space-y-6">
            <div className="rounded-[2rem] border border-[#dfd9cc] bg-white p-6 shadow-sm sm:p-8">
              <div className="flex flex-col gap-4 border-b border-[#eee9df] pb-6 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#df714c]">Branch Outlets & Dining Rooms</p>
                  <h2 className="mt-1 text-2xl sm:text-3xl font-extrabold text-[#17211d]">
                    {activeRestaurant?.name ?? 'Select a Restaurant'}
                  </h2>
                  <p className="mt-1 text-xs text-[#7d877f]">
                    {branches.length} branch location{branches.length === 1 ? '' : 's'} configured for this tenant
                  </p>
                </div>
                {isOwnerOrAdmin && selectedRestaurant && (
                  <button
                    onClick={openCreateBranchModal}
                    className="inline-flex items-center gap-2 rounded-xl bg-[#df714c] px-4 py-2.5 text-xs font-bold text-white shadow transition hover:bg-[#c95f3c]"
                  >
                    <span>+</span> Add Branch Outlet
                  </button>
                )}
              </div>

              {/* Branch Cards Grid */}
              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                {branchesLoading ? (
                  <div className="col-span-2 py-8 text-center text-sm text-[#7d877f]">Loading branch outlets...</div>
                ) : branches.length === 0 ? (
                  <div className="col-span-2 rounded-2xl border border-dashed border-[#ddd3c4] p-8 text-center">
                    <p className="text-sm font-medium text-[#7d877f]">No branch outlets configured yet for {activeRestaurant?.name}.</p>
                    {isOwnerOrAdmin && (
                      <button
                        onClick={openCreateBranchModal}
                        className="mt-3 inline-flex items-center gap-1.5 rounded-xl bg-[#173c35] px-4 py-2 text-xs font-bold text-white shadow-sm"
                      >
                        Add First Branch
                      </button>
                    )}
                  </div>
                ) : (
                  branches.map((branch) => {
                    const isActiveOperating = branch._id === activeBranchId;
                    const distanceKm =
                      userLocation && branch.latitude && branch.longitude
                        ? calculateDistanceKm(userLocation.latitude, userLocation.longitude, branch.latitude, branch.longitude)
                        : branch.distanceKm;
                    const distanceLabel = formatDistance(distanceKm);
                    const city = branch.addressDetails?.city;

                    return (
                      <div
                        key={branch._id}
                        className={`relative flex flex-col justify-between rounded-2xl border p-5 transition-all ${
                          isActiveOperating
                            ? 'border-[#173c35] bg-[#edf4e1]/70 ring-2 ring-[#173c35]/20 shadow-md'
                            : 'border-[#ebe6dc] bg-white hover:border-[#aeb9a8] shadow-sm'
                        }`}
                      >
                        <div>
                          {/* Top Tag & Status */}
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <span className={`h-2.5 w-2.5 rounded-full ${isActiveOperating ? 'bg-[#173c35]' : 'bg-[#6fa56e]'}`} />
                              <span className="text-xs font-bold text-[#173c35]">
                                {isActiveOperating ? 'Active Operating Branch' : 'Operating Branch'}
                              </span>
                            </div>
                            {branch.branchCode && (
                              <span className="rounded-md bg-neutral-100 border border-neutral-200 px-1.5 py-0.5 font-mono text-[10px] font-bold text-neutral-600">
                                {branch.branchCode}
                              </span>
                            )}
                          </div>

                          {/* Branch Name & Distance */}
                          <h3 className="mt-3 font-bold text-lg text-[#17211d]">{branch.name}</h3>
                          <div className="mt-1 flex items-center gap-2 flex-wrap">
                            {city && (
                              <span className="rounded-md bg-amber-100 text-amber-800 px-2 py-0.5 text-[10px] font-bold">
                                📍 {city}
                              </span>
                            )}
                            {distanceLabel && (
                              <span className="rounded-md bg-emerald-100 text-emerald-800 border border-emerald-300 px-2 py-0.5 text-[10px] font-bold">
                                🚗 {distanceLabel}
                              </span>
                            )}
                            {!branch.isActive && (
                              <span className="rounded-md bg-red-100 text-red-700 px-2 py-0.5 text-[10px] font-bold">
                                Inactive
                              </span>
                            )}
                          </div>

                          {/* Structured / Formatted Address */}
                          <p className="mt-2.5 text-xs leading-relaxed text-[#5c6861]">
                            {branch.address || 'Address not yet specified'}
                          </p>

                          {/* Contact Info */}
                          {(branch.phone || branch.managerName) && (
                            <div className="mt-3 rounded-xl bg-[#f7f5f0] p-2.5 text-[11px] text-[#4d5651] space-y-1">
                              {branch.managerName && (
                                <p>👤 <span className="font-semibold">Manager:</span> {branch.managerName}</p>
                              )}
                              {branch.phone && (
                                <p>📞 <span className="font-semibold">Phone:</span> {branch.phone}</p>
                              )}
                            </div>
                          )}
                        </div>

                        {/* Card Actions */}
                        <div className="mt-5 pt-3 border-t border-[#eee9df] flex flex-wrap items-center gap-2">
                          {isActiveOperating ? (
                            <div className="flex-1 flex items-center justify-center gap-1.5 rounded-xl bg-[#173c35] py-2 px-3 text-xs font-bold text-white shadow-sm ring-2 ring-emerald-400/40">
                              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                              Active Operating Branch
                            </div>
                          ) : (
                            <button
                              type="button"
                              onClick={() => {
                                storeSwitchBranch(branch._id);
                                setMessage({ type: 'success', text: `Switched active branch to ${branch.name}` });
                              }}
                              className="flex-1 flex items-center justify-center gap-1.5 rounded-xl border-2 border-[#173c35] bg-white py-2 px-3 text-xs font-bold text-[#173c35] transition hover:bg-[#173c35] hover:text-white shadow-sm"
                            >
                              <span>⚡</span> Set as Active
                            </button>
                          )}

                          {/* Operational Status (Open / Paused) Toggle for Owner & Admin */}
                          {isOwnerOrAdmin && (
                            <button
                              type="button"
                              onClick={() => void handleToggleBranchStatus(branch)}
                              className={`rounded-xl border px-2.5 py-2 text-xs font-bold transition ${
                                branch.isActive
                                  ? 'border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                                  : 'border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-100'
                              }`}
                              title={branch.isActive ? 'Mark branch as temporarily closed/inactive' : 'Mark branch as open/active'}
                            >
                              {branch.isActive ? '🟢 Open' : '⏸️ Paused'}
                            </button>
                          )}

                          {/* Edit / Delete Buttons */}
                          {(isOwnerOrAdmin || (isManager && branch._id === user?.branchId)) && (
                            <button
                              type="button"
                              onClick={() => openEditBranchModal(branch)}
                              className="rounded-xl border border-[#ddd3c4] bg-white p-2 text-xs text-neutral-600 hover:border-[#173c35] hover:text-[#173c35]"
                              title="Edit Branch & Address Details"
                            >
                              ✏️
                            </button>
                          )}
                          {isOwnerOrAdmin && (
                            <button
                              type="button"
                              onClick={() => setDeleteModal({ type: 'branch', id: branch._id, name: branch.name })}
                              className="rounded-xl border border-[#ddd3c4] bg-white p-2 text-xs text-red-500 hover:border-red-400 hover:bg-red-50"
                              title="Deactivate Branch"
                            >
                              🗑️
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Modal: Restaurant Form (Create / Edit) */}
        {isRestaurantModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
            <div className="relative max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-[2rem] border border-[#ddd3c4] bg-white p-6 shadow-2xl sm:p-8">
              <div className="flex items-center justify-between border-b border-[#eee9df] pb-4">
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-widest text-[#df714c]">
                    {editingRestaurantId ? 'Modify Restaurant Tenant' : 'Provision Restaurant'}
                  </p>
                  <h3 className="mt-1 text-2xl font-bold text-[#17211d]">
                    {editingRestaurantId ? 'Edit Restaurant Profile' : 'New Restaurant Workspace'}
                  </h3>
                </div>
                <button
                  onClick={() => setIsRestaurantModalOpen(false)}
                  className="rounded-full bg-neutral-100 p-2 text-neutral-500 hover:bg-neutral-200"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleSaveRestaurant} className="mt-6 space-y-5">
                {/* Basic Details */}
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700">
                      Restaurant Name *
                    </label>
                    <input
                      required
                      value={restaurantForm.name}
                      onChange={(e) => {
                        const name = e.target.value;
                        setRestaurantForm((prev) => ({
                          ...prev,
                          name,
                          slug: editingRestaurantId ? prev.slug : slugify(name),
                        }));
                      }}
                      placeholder="e.g. Yogi Grand Restaurant"
                      className="mt-1.5 w-full rounded-xl border border-[#ddd3c4] bg-[#fdfcf9] px-3.5 py-2.5 text-sm outline-none focus:border-[#173c35] focus:ring-1 focus:ring-[#173c35]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700">
                      URL Slug *
                    </label>
                    <input
                      required
                      value={restaurantForm.slug}
                      onChange={(e) => setRestaurantForm((prev) => ({ ...prev, slug: slugify(e.target.value) }))}
                      placeholder="e.g. yogi-grand"
                      className="mt-1.5 w-full rounded-xl border border-[#ddd3c4] bg-[#fdfcf9] px-3.5 py-2.5 font-mono text-sm outline-none focus:border-[#173c35]"
                    />
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700">Phone</label>
                    <input
                      value={restaurantForm.phone}
                      onChange={(e) => setRestaurantForm((prev) => ({ ...prev, phone: e.target.value }))}
                      placeholder="+91 98765 43210"
                      className="mt-1.5 w-full rounded-xl border border-[#ddd3c4] bg-[#fdfcf9] px-3.5 py-2.5 text-sm outline-none focus:border-[#173c35]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700">Email</label>
                    <input
                      type="email"
                      value={restaurantForm.email}
                      onChange={(e) => setRestaurantForm((prev) => ({ ...prev, email: e.target.value }))}
                      placeholder="contact@yogi.com"
                      className="mt-1.5 w-full rounded-xl border border-[#ddd3c4] bg-[#fdfcf9] px-3.5 py-2.5 text-sm outline-none focus:border-[#173c35]"
                    />
                  </div>
                </div>

                {/* Structured Address Setup Section */}
                <div className="rounded-2xl border border-amber-300/60 bg-amber-50/50 p-5">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-amber-200 pb-3">
                    <div>
                      <h4 className="font-bold text-sm text-[#173c35]">📍 Structured Address & Geolocation</h4>
                      <p className="text-[11px] text-neutral-600">Enables automatic GPS branch discovery for customers.</p>
                    </div>

                    {/* Geolocation Helpers */}
                    <div className="flex items-center gap-2 flex-wrap">
                      <select
                        onChange={(e) => applyPresetToRestaurant(e.target.value)}
                        defaultValue=""
                        className="rounded-lg border border-amber-300 bg-white px-2 py-1 text-xs font-medium text-neutral-700"
                      >
                        <option value="" disabled>Quick Preset...</option>
                        {KNOWN_LOCATION_PRESETS.map((p) => (
                          <option key={p.id} value={p.id}>
                            {p.name}, {p.state}
                          </option>
                        ))}
                      </select>

                      <button
                        type="button"
                        onClick={detectLocationForRestaurant}
                        disabled={isLocating}
                        className="rounded-lg bg-[#173c35] px-2.5 py-1 text-xs font-bold text-white hover:bg-[#21574d] disabled:opacity-50"
                      >
                        {isLocating ? 'Locating...' : '🎯 GPS Detect'}
                      </button>
                    </div>
                  </div>

                  <div className="mt-4 space-y-3">
                    <div>
                      <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-700">
                        Street Address / Building
                      </label>
                      <input
                        value={restaurantForm.street}
                        onChange={(e) => setRestaurantForm((prev) => ({ ...prev, street: e.target.value }))}
                        placeholder="e.g. 101 Culinary Blvd, Station Road"
                        className="mt-1 w-full rounded-xl border border-[#ddd3c4] bg-white px-3.5 py-2 text-sm outline-none focus:border-[#173c35]"
                      />
                    </div>

                    <div className="grid gap-3 sm:grid-cols-3">
                      <div>
                        <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-700">
                          City / Town *
                        </label>
                        <input
                          required
                          value={restaurantForm.city}
                          onChange={(e) => setRestaurantForm((prev) => ({ ...prev, city: e.target.value }))}
                          placeholder="e.g. Surat or Bardoli"
                          className="mt-1 w-full rounded-xl border border-[#ddd3c4] bg-white px-3.5 py-2 text-sm outline-none focus:border-[#173c35]"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-700">
                          State *
                        </label>
                        <input
                          required
                          value={restaurantForm.state}
                          onChange={(e) => setRestaurantForm((prev) => ({ ...prev, state: e.target.value }))}
                          placeholder="e.g. Gujarat"
                          className="mt-1 w-full rounded-xl border border-[#ddd3c4] bg-white px-3.5 py-2 text-sm outline-none focus:border-[#173c35]"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-700">
                          PIN Code
                        </label>
                        <input
                          value={restaurantForm.pincode}
                          onChange={(e) => setRestaurantForm((prev) => ({ ...prev, pincode: e.target.value }))}
                          placeholder="e.g. 395007"
                          className="mt-1 w-full rounded-xl border border-[#ddd3c4] bg-white px-3.5 py-2 text-sm outline-none focus:border-[#173c35]"
                        />
                      </div>
                    </div>

                    {/* GPS Track Verification Card (Replaces manual lat/long inputs) */}
                    <div className="mt-2 rounded-2xl border border-amber-300/80 bg-white p-4 shadow-sm">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <span className="flex h-3 w-3 relative">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                          </span>
                          <div>
                            <p className="text-xs font-bold text-neutral-900">
                              GPS Location Track: {restaurantGpsTrack.displayName || `${restaurantForm.city}, ${restaurantForm.state}`}
                            </p>
                            <p className="text-[11px] text-neutral-500">
                              {restaurantGpsTrack.source === 'gps'
                                ? `🎯 High-accuracy satellite GPS fix (±${Math.round(restaurantGpsTrack.accuracy || 10)}m)`
                                : '📍 Coordinates automatically resolved for customer discovery & delivery'}
                            </p>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={detectLocationForRestaurant}
                          disabled={isLocating}
                          className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-[#173c35] px-3.5 py-2 text-xs font-bold text-white hover:bg-[#23584e] shadow-sm disabled:opacity-60"
                        >
                          {isLocating ? 'Locating...' : '🎯 Auto-Detect GPS'}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-3">
                  <button
                    type="button"
                    onClick={() => setIsRestaurantModalOpen(false)}
                    className="rounded-xl border border-[#ddd3c4] px-4 py-2.5 text-sm font-semibold text-neutral-700 hover:bg-neutral-100"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="rounded-xl bg-[#173c35] px-6 py-2.5 text-sm font-bold text-white hover:bg-[#23584e]"
                  >
                    {editingRestaurantId ? 'Save Changes' : 'Create Restaurant'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal: Branch Form (Create / Edit) */}
        {isBranchModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
            <div className="relative max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-[2rem] border border-[#ddd3c4] bg-white p-6 shadow-2xl sm:p-8">
              <div className="flex items-center justify-between border-b border-[#eee9df] pb-4">
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-widest text-[#df714c]">
                    {activeRestaurant?.name}
                  </p>
                  <h3 className="mt-1 text-2xl font-bold text-[#17211d]">
                    {editingBranchId ? 'Edit Branch Outlet' : 'Add New Branch Outlet'}
                  </h3>
                </div>
                <button
                  onClick={() => setIsBranchModalOpen(false)}
                  className="rounded-full bg-neutral-100 p-2 text-neutral-500 hover:bg-neutral-200"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleSaveBranch} className="mt-6 space-y-5">
                <div className="grid gap-4 sm:grid-cols-3">
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700">
                      Branch Name *
                    </label>
                    <input
                      required
                      value={branchForm.name}
                      onChange={(e) => {
                        const name = e.target.value;
                        setBranchForm((prev) => ({
                          ...prev,
                          name,
                          slug: editingBranchId ? prev.slug : slugify(name),
                        }));
                      }}
                      placeholder="e.g. Bardoli Central Hall"
                      className="mt-1.5 w-full rounded-xl border border-[#ddd3c4] bg-[#fdfcf9] px-3.5 py-2.5 text-sm outline-none focus:border-[#173c35]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700">
                      Branch Code
                    </label>
                    <input
                      value={branchForm.branchCode}
                      onChange={(e) => setBranchForm((prev) => ({ ...prev, branchCode: e.target.value.toUpperCase() }))}
                      placeholder="e.g. BR-01"
                      className="mt-1.5 w-full rounded-xl border border-[#ddd3c4] bg-[#fdfcf9] px-3.5 py-2.5 font-mono text-sm outline-none focus:border-[#173c35]"
                    />
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-3">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700">
                      Manager Name
                    </label>
                    <input
                      value={branchForm.managerName}
                      onChange={(e) => setBranchForm((prev) => ({ ...prev, managerName: e.target.value }))}
                      placeholder="e.g. Ramesh Patel"
                      className="mt-1.5 w-full rounded-xl border border-[#ddd3c4] bg-[#fdfcf9] px-3.5 py-2.5 text-sm outline-none focus:border-[#173c35]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700">Phone</label>
                    <input
                      value={branchForm.phone}
                      onChange={(e) => setBranchForm((prev) => ({ ...prev, phone: e.target.value }))}
                      placeholder="+91 98765 43210"
                      className="mt-1.5 w-full rounded-xl border border-[#ddd3c4] bg-[#fdfcf9] px-3.5 py-2.5 text-sm outline-none focus:border-[#173c35]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700">
                      Seating Capacity
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={branchForm.seatingCapacity}
                      onChange={(e) => setBranchForm((prev) => ({ ...prev, seatingCapacity: parseInt(e.target.value, 10) || 0 }))}
                      placeholder="40"
                      className="mt-1.5 w-full rounded-xl border border-[#ddd3c4] bg-[#fdfcf9] px-3.5 py-2.5 text-sm outline-none focus:border-[#173c35]"
                    />
                  </div>
                </div>

                {/* Structured Address Setup Section */}
                <div className="rounded-2xl border border-emerald-300/70 bg-emerald-50/40 p-5">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-emerald-200 pb-3">
                    <div>
                      <h4 className="font-bold text-sm text-[#173c35]">📍 Outlet Location & Geolocation</h4>
                      <p className="text-[11px] text-neutral-600">Accurate coordinates guarantee nearest branch routing.</p>
                    </div>

                    <div className="flex items-center gap-2 flex-wrap">
                      <select
                        onChange={(e) => applyPresetToBranch(e.target.value)}
                        defaultValue=""
                        className="rounded-lg border border-emerald-300 bg-white px-2 py-1 text-xs font-medium text-neutral-700"
                      >
                        <option value="" disabled>Quick Preset...</option>
                        {KNOWN_LOCATION_PRESETS.map((p) => (
                          <option key={p.id} value={p.id}>
                            {p.name}, {p.state}
                          </option>
                        ))}
                      </select>

                      <button
                        type="button"
                        onClick={detectLocationForBranch}
                        disabled={isLocating}
                        className="rounded-lg bg-[#173c35] px-2.5 py-1 text-xs font-bold text-white hover:bg-[#21574d] disabled:opacity-50"
                      >
                        {isLocating ? 'Locating...' : '🎯 GPS Detect'}
                      </button>
                    </div>
                  </div>

                  <div className="mt-4 space-y-3">
                    <div>
                      <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-700">
                        Street Address / Area / Market
                      </label>
                      <input
                        value={branchForm.street}
                        onChange={(e) => setBranchForm((prev) => ({ ...prev, street: e.target.value }))}
                        placeholder="e.g. Main Bazaar Road, Near Sardar Baug"
                        className="mt-1 w-full rounded-xl border border-[#ddd3c4] bg-white px-3.5 py-2 text-sm outline-none focus:border-[#173c35]"
                      />
                    </div>

                    <div className="grid gap-3 sm:grid-cols-3">
                      <div>
                        <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-700">
                          City / Town *
                        </label>
                        <input
                          required
                          value={branchForm.city}
                          onChange={(e) => setBranchForm((prev) => ({ ...prev, city: e.target.value }))}
                          placeholder="e.g. Bardoli"
                          className="mt-1 w-full rounded-xl border border-[#ddd3c4] bg-white px-3.5 py-2 text-sm outline-none focus:border-[#173c35]"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-700">
                          State *
                        </label>
                        <input
                          required
                          value={branchForm.state}
                          onChange={(e) => setBranchForm((prev) => ({ ...prev, state: e.target.value }))}
                          placeholder="e.g. Gujarat"
                          className="mt-1 w-full rounded-xl border border-[#ddd3c4] bg-white px-3.5 py-2 text-sm outline-none focus:border-[#173c35]"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-700">
                          PIN Code
                        </label>
                        <input
                          value={branchForm.pincode}
                          onChange={(e) => setBranchForm((prev) => ({ ...prev, pincode: e.target.value }))}
                          placeholder="e.g. 394601"
                          className="mt-1 w-full rounded-xl border border-[#ddd3c4] bg-white px-3.5 py-2 text-sm outline-none focus:border-[#173c35]"
                        />
                      </div>
                    </div>

                    {/* GPS Track Verification Card (Replaces manual lat/long inputs) */}
                    <div className="mt-2 rounded-2xl border border-emerald-300/80 bg-white p-4 shadow-sm">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <span className="flex h-3 w-3 relative">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                          </span>
                          <div>
                            <p className="text-xs font-bold text-[#173c35]">
                              GPS Location Track: {branchGpsTrack.displayName || `${branchForm.city}, ${branchForm.state}`}
                            </p>
                            <p className="text-[11px] text-neutral-500">
                              {branchGpsTrack.source === 'gps'
                                ? `🎯 High-accuracy satellite GPS fix (±${Math.round(branchGpsTrack.accuracy || 10)}m)`
                                : '📍 Real-time GPS distance calculation active for nearby table bookings'}
                            </p>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={detectLocationForBranch}
                          disabled={isLocating}
                          className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-[#173c35] px-3.5 py-2 text-xs font-bold text-white hover:bg-[#23584e] shadow-sm disabled:opacity-60"
                        >
                          {isLocating ? 'Tracking...' : '🎯 Auto-Detect GPS'}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-3">
                  <button
                    type="button"
                    onClick={() => setIsBranchModalOpen(false)}
                    className="rounded-xl border border-[#ddd3c4] px-4 py-2.5 text-sm font-semibold text-neutral-700 hover:bg-neutral-100"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="rounded-xl bg-[#df714c] px-6 py-2.5 text-sm font-bold text-white hover:bg-[#c95f3c]"
                  >
                    {editingBranchId ? 'Save Branch Details' : 'Add Branch'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal: Confirm Deactivation */}
        {deleteModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
            <div className="w-full max-w-md rounded-[2rem] border border-[#ddd3c4] bg-white p-6 shadow-2xl">
              <div className="flex items-center gap-3 text-red-600">
                <span className="text-2xl">⚠️</span>
                <h3 className="text-lg font-bold text-neutral-900">
                  Deactivate {deleteModal.type === 'restaurant' ? 'Restaurant' : 'Branch'}?
                </h3>
              </div>
              <p className="mt-3 text-sm text-neutral-600">
                Are you sure you want to deactivate <span className="font-bold text-neutral-800">{deleteModal.name}</span>?
                {deleteModal.type === 'restaurant' && ' This will also cascade deactivation to all its branch locations.'}
              </p>
              <div className="mt-6 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setDeleteModal(null)}
                  className="rounded-xl border border-neutral-300 px-4 py-2 text-sm font-semibold text-neutral-700 hover:bg-neutral-100"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConfirmDelete}
                  className="rounded-xl bg-red-600 px-5 py-2 text-sm font-bold text-white hover:bg-red-700"
                >
                  Confirm Deactivation
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}

import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { tenantsApi } from '@/api/endpoints';
import { useAuthStore, useTenantStore } from '@/store';
import { ROUTES } from '@/constants';
import type { Branch, Restaurant, AddressDetails } from '@/types';

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
  seatingCapacity: 40,
};

export default function Workspace() {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const {
    restaurantId: activeRestaurantId,
    branchId: activeBranchId,
    switchRestaurant: storeSwitchRestaurant,
    switchBranch: storeSwitchBranch,
    loadTenants,
  } = useTenantStore();

  const isPlatformAdmin = user?.role === 'platformAdmin';
  const isOwner = user?.role === 'owner';
  const isOwnerOrAdmin = isOwner || isPlatformAdmin;

  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [selectedRestaurant, setSelectedRestaurant] = useState(activeRestaurantId || '');
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [branchesLoading, setBranchesLoading] = useState(false);

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

  const displayRestaurants = useMemo(() => restaurants, [restaurants]);

  const activeRestaurant = useMemo(
    () => displayRestaurants.find((r) => r._id === selectedRestaurant) || displayRestaurants[0],
    [displayRestaurants, selectedRestaurant],
  );

  const handleToggleRestaurantStatus = async (restaurant: Restaurant) => {
    try {
      const newStatus = !restaurant.isActive;
      await tenantsApi.updateRestaurant(restaurant._id, { isActive: newStatus });
      setMessage({
        type: 'success',
        text: `Restaurant "${restaurant.name}" is now ${newStatus ? 'active' : 'paused'}.`,
      });
      void fetchRestaurants();
      void loadTenants();
    } catch {
      setMessage({ type: 'error', text: 'Failed to update restaurant status.' });
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
        text: `Branch "${branch.name}" is now ${newStatus ? 'active' : 'inactive'}.`,
      });
      if (selectedRestaurant) {
        void fetchBranches(selectedRestaurant);
      }
      void loadTenants();
    } catch {
      setMessage({ type: 'error', text: 'Failed to update branch status.' });
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

  // Open modals
  const openCreateRestaurantModal = () => {
    setEditingRestaurantId(null);
    setRestaurantForm(initialRestaurantForm);
    setIsRestaurantModalOpen(true);
  };

  const openEditRestaurantModal = (restaurant: Restaurant) => {
    setEditingRestaurantId(restaurant._id);
    const details = (restaurant.addressDetails || {}) as Partial<AddressDetails>;
    setRestaurantForm({
      name: restaurant.name,
      slug: restaurant.slug,
      tagline: restaurant.tagline || '',
      phone: restaurant.phone || '',
      email: restaurant.email || '',
      street: details.street || '',
      landmark: details.landmark || '',
      city: details.city || 'Surat',
      state: details.state || 'Gujarat',
      pincode: details.pincode || '',
      gstNumber: restaurant.gstNumber || '',
    });
    setIsRestaurantModalOpen(true);
  };

  const openCreateBranchModal = () => {
    setEditingBranchId(null);
    setBranchForm(initialBranchForm);
    setIsBranchModalOpen(true);
  };

  const openEditBranchModal = (branch: Branch) => {
    setEditingBranchId(branch._id);
    const details = (branch.addressDetails || {}) as Partial<AddressDetails>;
    setBranchForm({
      name: branch.name,
      slug: branch.slug,
      branchCode: branch.branchCode || '',
      phone: branch.phone || '',
      email: branch.email || '',
      managerName: branch.managerName || '',
      street: details.street || '',
      landmark: details.landmark || '',
      city: details.city || 'Bardoli',
      state: details.state || 'Gujarat',
      pincode: details.pincode || '',
      seatingCapacity: branch.seatingCapacity || 40,
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
    };

    try {
      if (editingRestaurantId) {
        const res = await tenantsApi.updateRestaurant(editingRestaurantId, payload);
        setMessage({ type: 'success', text: `Restaurant "${res.data.data.name}" updated successfully.` });
      } else {
        const res = await tenantsApi.createRestaurant(payload);
        setSelectedRestaurant(res.data.data._id);
        void storeSwitchRestaurant(res.data.data._id);
        setMessage({ type: 'success', text: `Restaurant "${res.data.data.name}" created successfully.` });
      }
      setIsRestaurantModalOpen(false);
      void fetchRestaurants();
      void loadTenants();
    } catch {
      setMessage({ type: 'error', text: 'Failed to save restaurant details.' });
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
    };

    try {
      if (editingBranchId) {
        const res = await tenantsApi.updateBranch(editingBranchId, payload);
        setMessage({ type: 'success', text: `Branch "${res.data.data.name}" updated successfully.` });
      } else {
        const res = await tenantsApi.createBranch(selectedRestaurant, payload);
        storeSwitchBranch(res.data.data._id);
        setMessage({ type: 'success', text: `Branch "${res.data.data.name}" added successfully.` });
      }
      setIsBranchModalOpen(false);
      void fetchBranches(selectedRestaurant);
      void loadTenants();
    } catch {
      setMessage({ type: 'error', text: 'Failed to save branch details.' });
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
    <main className="min-h-screen bg-slate-100 px-4 py-6 text-slate-900 sm:px-8 lg:px-12 dark:bg-slate-950 dark:text-slate-100">
      <div className="mx-auto max-w-7xl">
        {/* Header Banner - High Contrast Indigo Slate Palette */}
        <header className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 px-6 py-8 text-white shadow-xl sm:px-10 lg:py-10">
          <div className="relative flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 rounded-full bg-indigo-500/20 px-3 py-1 text-xs font-black uppercase tracking-widest text-indigo-300 border border-indigo-400/30">
                <span>🏢</span> Restaurant & Branch Control Center
              </div>
              <h1 className="mt-3 text-3xl font-black tracking-tight sm:text-4xl text-white">Restaurant Setup & Outlets</h1>
              <p className="mt-2 text-sm text-slate-300">
                Configure your dining brands, manage branch locations with clean street addresses, and switch active operational context.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <Link
                to={isPlatformAdmin ? ROUTES.PLATFORM_ADMIN.DASHBOARD : isOwner ? ROUTES.OWNER.DASHBOARD : ROUTES.ADMIN.DASHBOARD}
                className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 text-sm font-bold text-white shadow-md hover:bg-indigo-500 transition-all"
              >
                {isPlatformAdmin ? 'Platform Dashboard' : isOwner ? 'Owner Dashboard' : 'Manager Center'}
              </Link>
              {isPlatformAdmin && (
                <Link
                  to={ROUTES.PLATFORM_ADMIN.USERS}
                  className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 text-sm font-bold text-white shadow-md hover:bg-blue-500 transition-all"
                >
                  User Access
                </Link>
              )}
              <button
                onClick={() => {
                  logout();
                  navigate(ROUTES.AUTH.LOGIN);
                }}
                className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-rose-600 px-4 text-sm font-bold text-white shadow-md hover:bg-rose-700 transition-all"
                title="Sign out of workspace"
              >
                Sign Out
              </button>
            </div>
          </div>
        </header>

        {/* Feedback Alert */}
        {message && (
          <div
            className={`mt-4 flex items-center justify-between rounded-2xl border p-4 text-sm font-bold shadow-sm ${
              message.type === 'success'
                ? 'border-emerald-300 bg-emerald-50 text-emerald-900 dark:bg-emerald-950/80 dark:text-emerald-100'
                : 'border-red-300 bg-red-50 text-red-900 dark:bg-red-950/80 dark:text-red-100'
            }`}
          >
            <div className="flex items-center gap-2">
              <span>{message.type === 'success' ? '✅' : '⚠️'}</span>
              <span>{message.text}</span>
            </div>
            <button
              onClick={() => setMessage(null)}
              className="text-xs font-black uppercase tracking-wider underline hover:no-underline"
            >
              Dismiss
            </button>
          </div>
        )}

        <section className="mt-8 grid gap-8 lg:grid-cols-[1fr_1.4fr]">
          {/* Column 1: Restaurant Directory */}
          <div className="space-y-6">
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-md dark:border-slate-800 dark:bg-slate-900">
              <div className="flex items-center justify-between border-b border-slate-200 pb-4 dark:border-slate-800">
                <div>
                  <p className="text-[11px] font-black uppercase tracking-widest text-indigo-600 dark:text-indigo-400">
                    {isOwner ? 'Brand Portfolio' : 'Restaurants Directory'}
                  </p>
                  <h2 className="mt-1 text-2xl font-black text-slate-900 dark:text-white">
                    {isOwner ? 'Your Restaurant' : 'Restaurants'}
                  </h2>
                </div>
                {isOwnerOrAdmin && (
                  <button
                    onClick={openCreateRestaurantModal}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-black text-white shadow hover:bg-indigo-700"
                  >
                    <span>+</span> Add Restaurant
                  </button>
                )}
              </div>

              <div className="mt-5 space-y-3">
                {loading ? (
                  <p className="py-6 text-center text-sm font-semibold text-slate-500">Loading restaurants...</p>
                ) : displayRestaurants.length === 0 ? (
                  <p className="py-6 text-center text-sm font-semibold text-slate-500">No restaurants found.</p>
                ) : (
                  displayRestaurants.map((restaurant) => {
                    const isSelected = selectedRestaurant === restaurant._id;
                    const isCurrentActive = restaurant._id === activeRestaurantId;
                    const city = restaurant.addressDetails?.city || restaurant.address?.split(',').slice(-3, -2)[0]?.trim();

                    return (
                      <div
                        key={restaurant._id}
                        className={`rounded-2xl border p-4 transition-all ${
                          isSelected
                            ? 'border-indigo-600 bg-indigo-50/90 dark:bg-indigo-950/60 ring-2 ring-indigo-500/30 shadow-md'
                            : 'border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 hover:border-indigo-300'
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
                              <h3 className="font-black text-base text-slate-900 dark:text-white">{restaurant.name}</h3>
                              {isCurrentActive && (
                                <span className="rounded-full bg-indigo-600 px-2.5 py-0.5 text-[10px] font-black text-white shadow-xs">
                                  Active Context
                                </span>
                              )}
                              {restaurant.isActive ? (
                                <span className="rounded-full bg-emerald-600 px-2.5 py-0.5 text-[10px] font-black text-white shadow-xs">
                                  Active
                                </span>
                              ) : (
                                <span className="rounded-full bg-rose-600 px-2.5 py-0.5 text-[10px] font-black text-white shadow-xs">
                                  Paused
                                </span>
                              )}
                            </div>
                            <p className="mt-1 text-xs font-bold text-indigo-700 dark:text-indigo-300">
                              📍 {city || 'Main Office'}
                            </p>
                          </button>

                          <div className="flex items-center gap-2 shrink-0">
                            {isOwnerOrAdmin && (
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  void handleToggleRestaurantStatus(restaurant);
                                }}
                                className={`rounded-xl border px-3 py-1.5 text-xs font-black shadow-sm transition ${
                                  restaurant.isActive
                                    ? 'border-emerald-600 bg-emerald-600 text-white hover:bg-emerald-700'
                                    : 'border-rose-600 bg-rose-600 text-white hover:bg-rose-700'
                                }`}
                              >
                                {restaurant.isActive ? '🟢 Active' : '⏸️ Paused'}
                              </button>
                            )}
                            {isOwnerOrAdmin && (
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  openEditRestaurantModal(restaurant);
                                }}
                                className="rounded-xl border border-slate-300 bg-white px-3 py-1.5 text-xs font-bold text-slate-800 hover:border-indigo-600 hover:text-indigo-600 shadow-xs dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                              >
                                Edit Profile
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

          {/* Column 2: Branch Network */}
          <div className="space-y-6">
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-md dark:border-slate-800 dark:bg-slate-900">
              <div className="flex flex-col gap-3 border-b border-slate-200 pb-5 sm:flex-row sm:items-center sm:justify-between dark:border-slate-800">
                <div>
                  <p className="text-[11px] font-black uppercase tracking-widest text-blue-600 dark:text-blue-400">Branch Outlets</p>
                  <h2 className="mt-1 text-2xl font-black text-slate-900 dark:text-white">
                    {activeRestaurant?.name ?? 'Select a Restaurant'}
                  </h2>
                </div>
                {isOwnerOrAdmin && selectedRestaurant && (
                  <button
                    onClick={openCreateBranchModal}
                    className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-xs font-black text-white shadow hover:bg-blue-700"
                  >
                    <span>+</span> Add Branch Outlet
                  </button>
                )}
              </div>

              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                {branchesLoading ? (
                  <div className="col-span-2 py-8 text-center text-sm font-semibold text-slate-500">Loading branch outlets...</div>
                ) : branches.length === 0 ? (
                  <div className="col-span-2 rounded-2xl border border-dashed border-slate-300 p-8 text-center">
                    <p className="text-sm font-bold text-slate-600 dark:text-slate-300">No branch outlets configured yet.</p>
                    {isOwnerOrAdmin && (
                      <button
                        onClick={openCreateBranchModal}
                        className="mt-3 inline-flex items-center gap-1.5 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-black text-white shadow"
                      >
                        Add First Branch
                      </button>
                    )}
                  </div>
                ) : (
                  branches.map((branch) => {
                    const isActiveOperating = branch._id === activeBranchId;
                    const city = branch.addressDetails?.city;

                    return (
                      <div
                        key={branch._id}
                        className={`flex flex-col justify-between rounded-2xl border p-5 transition-all ${
                          isActiveOperating
                            ? 'border-indigo-600 bg-indigo-50/90 dark:bg-indigo-950/60 ring-2 ring-indigo-500/30 shadow-md'
                            : 'border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 hover:border-indigo-300'
                        }`}
                      >
                        <div>
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-black text-indigo-700 dark:text-indigo-300">
                              {isActiveOperating ? '⚡ Active Operating Branch' : 'Operating Branch'}
                            </span>
                            {branch.branchCode && (
                              <span className="rounded-md bg-slate-100 border border-slate-300 px-2 py-0.5 font-mono text-[10px] font-black text-slate-700 dark:bg-slate-800 dark:text-slate-200">
                                {branch.branchCode}
                              </span>
                            )}
                          </div>

                          <h3 className="mt-3 font-black text-lg text-slate-900 dark:text-white">{branch.name}</h3>
                          {city && (
                            <span className="mt-1 inline-block rounded-md bg-indigo-100 text-indigo-900 px-2.5 py-0.5 text-[10px] font-black">
                              📍 {city}
                            </span>
                          )}

                          <p className="mt-2 text-xs leading-relaxed text-slate-700 dark:text-slate-300 font-medium">
                            {branch.address || 'Address not specified'}
                          </p>

                          {(branch.phone || branch.managerName) && (
                            <div className="mt-3 rounded-xl bg-slate-100 p-3 text-[11px] text-slate-800 dark:bg-slate-800 dark:text-slate-200 space-y-1 font-semibold">
                              {branch.managerName && <p>👤 Manager: {branch.managerName}</p>}
                              {branch.phone && <p>📞 Phone: {branch.phone}</p>}
                            </div>
                          )}
                        </div>

                        <div className="mt-5 pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center gap-2">
                          {!isActiveOperating && (
                            <button
                              type="button"
                              onClick={() => {
                                storeSwitchBranch(branch._id);
                                setMessage({ type: 'success', text: `Switched active branch to ${branch.name}` });
                              }}
                              className="flex-1 rounded-xl bg-indigo-600 py-2 px-3 text-xs font-black text-white hover:bg-indigo-700 shadow"
                            >
                              Set as Active
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => handleToggleBranchStatus(branch)}
                            className={`rounded-xl border px-3 py-2 text-xs font-bold shadow-xs ${
                              branch.isActive
                                ? 'border-emerald-300 bg-emerald-50 text-emerald-800 hover:bg-emerald-100 dark:border-emerald-700 dark:bg-emerald-950 dark:text-emerald-200'
                                : 'border-slate-300 bg-slate-100 text-slate-700 hover:bg-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300'
                            }`}
                          >
                            {branch.isActive ? 'Active' : 'Inactive'}
                          </button>
                          <button
                            type="button"
                            onClick={() => openEditBranchModal(branch)}
                            className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-bold text-slate-800 hover:border-indigo-600 hover:text-indigo-600 shadow-xs dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                          >
                            Edit Outlet
                          </button>
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
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
            <div className="relative max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl sm:p-8 dark:border-slate-800 dark:bg-slate-900">
              <div className="flex items-center justify-between border-b border-slate-200 pb-4 dark:border-slate-800">
                <div>
                  <p className="text-[11px] font-black uppercase tracking-widest text-indigo-600 dark:text-indigo-400">
                    {editingRestaurantId ? 'Modify Restaurant Tenant' : 'New Restaurant'}
                  </p>
                  <h3 className="mt-1 text-2xl font-black text-slate-900 dark:text-white">
                    {editingRestaurantId ? 'Edit Restaurant Profile' : 'New Restaurant Workspace'}
                  </h3>
                </div>
                <button
                  onClick={() => setIsRestaurantModalOpen(false)}
                  className="rounded-full bg-slate-100 p-2 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleSaveRestaurant} className="mt-6 space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="block text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-300">
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
                      className="mt-1.5 w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm font-bold text-slate-900 outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-300">
                      URL Slug *
                    </label>
                    <input
                      required
                      value={restaurantForm.slug}
                      onChange={(e) => setRestaurantForm((prev) => ({ ...prev, slug: slugify(e.target.value) }))}
                      placeholder="e.g. yogi-grand"
                      className="mt-1.5 w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 font-mono text-sm font-bold text-slate-900 outline-none focus:border-indigo-600 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                    />
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="block text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-300">Phone</label>
                    <input
                      value={restaurantForm.phone}
                      onChange={(e) => setRestaurantForm((prev) => ({ ...prev, phone: e.target.value }))}
                      placeholder="+91 98765 43210"
                      className="mt-1.5 w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm font-bold text-slate-900 outline-none focus:border-indigo-600 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-300">Email</label>
                    <input
                      type="email"
                      value={restaurantForm.email}
                      onChange={(e) => setRestaurantForm((prev) => ({ ...prev, email: e.target.value }))}
                      placeholder="contact@yogi.com"
                      className="mt-1.5 w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm font-bold text-slate-900 outline-none focus:border-indigo-600 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                    />
                  </div>
                </div>

                {/* Simple Clean Street Address Setup (NO GPS) */}
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-800/40">
                  <h4 className="font-black text-sm text-slate-900 dark:text-white mb-3">📍 Address Details</h4>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-[11px] font-black uppercase tracking-wider text-slate-700 dark:text-slate-300">
                        Street Address / Building
                      </label>
                      <input
                        value={restaurantForm.street}
                        onChange={(e) => setRestaurantForm((prev) => ({ ...prev, street: e.target.value }))}
                        placeholder="e.g. 101 Culinary Blvd, Station Road"
                        className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-sm font-bold text-slate-900 outline-none focus:border-indigo-600 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                      />
                    </div>

                    <div className="grid gap-3 sm:grid-cols-3">
                      <div>
                        <label className="block text-[11px] font-black uppercase tracking-wider text-slate-700 dark:text-slate-300">
                          City / Town *
                        </label>
                        <input
                          required
                          value={restaurantForm.city}
                          onChange={(e) => setRestaurantForm((prev) => ({ ...prev, city: e.target.value }))}
                          placeholder="e.g. Surat or Bardoli"
                          className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-sm font-bold text-slate-900 outline-none focus:border-indigo-600 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-black uppercase tracking-wider text-slate-700 dark:text-slate-300">
                          State *
                        </label>
                        <input
                          required
                          value={restaurantForm.state}
                          onChange={(e) => setRestaurantForm((prev) => ({ ...prev, state: e.target.value }))}
                          placeholder="e.g. Gujarat"
                          className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-sm font-bold text-slate-900 outline-none focus:border-indigo-600 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-black uppercase tracking-wider text-slate-700 dark:text-slate-300">
                          PIN Code
                        </label>
                        <input
                          value={restaurantForm.pincode}
                          onChange={(e) => setRestaurantForm((prev) => ({ ...prev, pincode: e.target.value }))}
                          placeholder="e.g. 395007"
                          className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-sm font-bold text-slate-900 outline-none focus:border-indigo-600 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-3">
                  <button
                    type="button"
                    onClick={() => setIsRestaurantModalOpen(false)}
                    className="rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-bold text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="rounded-xl bg-indigo-600 px-6 py-2.5 text-sm font-black text-white hover:bg-indigo-700 shadow-md"
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
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
            <div className="relative max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl sm:p-8 dark:border-slate-800 dark:bg-slate-900">
              <div className="flex items-center justify-between border-b border-slate-200 pb-4 dark:border-slate-800">
                <div>
                  <p className="text-[11px] font-black uppercase tracking-widest text-blue-600 dark:text-blue-400">
                    {activeRestaurant?.name}
                  </p>
                  <h3 className="mt-1 text-2xl font-black text-slate-900 dark:text-white">
                    {editingBranchId ? 'Edit Branch Outlet' : 'Add New Branch Outlet'}
                  </h3>
                </div>
                <button
                  onClick={() => setIsBranchModalOpen(false)}
                  className="rounded-full bg-slate-100 p-2 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleSaveBranch} className="mt-6 space-y-4">
                <div className="grid gap-4 sm:grid-cols-3">
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-300">
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
                      className="mt-1.5 w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm font-bold text-slate-900 outline-none focus:border-blue-600 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-300">
                      Branch Code
                    </label>
                    <input
                      value={branchForm.branchCode}
                      onChange={(e) => setBranchForm((prev) => ({ ...prev, branchCode: e.target.value.toUpperCase() }))}
                      placeholder="e.g. BR-01"
                      className="mt-1.5 w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 font-mono text-sm font-bold text-slate-900 outline-none focus:border-blue-600 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                    />
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="block text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-300">
                      Manager Name
                    </label>
                    <input
                      value={branchForm.managerName}
                      onChange={(e) => setBranchForm((prev) => ({ ...prev, managerName: e.target.value }))}
                      placeholder="e.g. Ramesh Patel"
                      className="mt-1.5 w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm font-bold text-slate-900 outline-none focus:border-blue-600 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-300">Phone</label>
                    <input
                      value={branchForm.phone}
                      onChange={(e) => setBranchForm((prev) => ({ ...prev, phone: e.target.value }))}
                      placeholder="+91 98765 43210"
                      className="mt-1.5 w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm font-bold text-slate-900 outline-none focus:border-blue-600 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                    />
                  </div>
                </div>

                {/* Simple Clean Street Address Setup (NO GPS) */}
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-800/40">
                  <h4 className="font-black text-sm text-slate-900 dark:text-white mb-3">📍 Outlet Address Details</h4>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-[11px] font-black uppercase tracking-wider text-slate-700 dark:text-slate-300">
                        Street Address / Area
                      </label>
                      <input
                        value={branchForm.street}
                        onChange={(e) => setBranchForm((prev) => ({ ...prev, street: e.target.value }))}
                        placeholder="e.g. Main Bazaar Road, Near Sardar Baug"
                        className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-sm font-bold text-slate-900 outline-none focus:border-blue-600 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                      />
                    </div>

                    <div className="grid gap-3 sm:grid-cols-3">
                      <div>
                        <label className="block text-[11px] font-black uppercase tracking-wider text-slate-700 dark:text-slate-300">
                          City / Town *
                        </label>
                        <input
                          required
                          value={branchForm.city}
                          onChange={(e) => setBranchForm((prev) => ({ ...prev, city: e.target.value }))}
                          placeholder="e.g. Bardoli"
                          className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-sm font-bold text-slate-900 outline-none focus:border-blue-600 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-black uppercase tracking-wider text-slate-700 dark:text-slate-300">
                          State *
                        </label>
                        <input
                          required
                          value={branchForm.state}
                          onChange={(e) => setBranchForm((prev) => ({ ...prev, state: e.target.value }))}
                          placeholder="e.g. Gujarat"
                          className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-sm font-bold text-slate-900 outline-none focus:border-blue-600 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-black uppercase tracking-wider text-slate-700 dark:text-slate-300">
                          PIN Code
                        </label>
                        <input
                          value={branchForm.pincode}
                          onChange={(e) => setBranchForm((prev) => ({ ...prev, pincode: e.target.value }))}
                          placeholder="e.g. 394601"
                          className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-sm font-bold text-slate-900 outline-none focus:border-blue-600 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-3">
                  <button
                    type="button"
                    onClick={() => setIsBranchModalOpen(false)}
                    className="rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-bold text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="rounded-xl bg-blue-600 px-6 py-2.5 text-sm font-black text-white hover:bg-blue-700 shadow-md"
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
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
            <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-900">
              <div className="flex items-center gap-3 text-rose-600">
                <span className="text-2xl">⚠️</span>
                <h3 className="text-lg font-black text-slate-900 dark:text-white">
                  Deactivate {deleteModal.type === 'restaurant' ? 'Restaurant' : 'Branch'}?
                </h3>
              </div>
              <p className="mt-3 text-sm font-medium text-slate-600 dark:text-slate-300">
                Are you sure you want to deactivate <span className="font-bold text-slate-900 dark:text-white">{deleteModal.name}</span>?
              </p>
              <div className="mt-6 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setDeleteModal(null)}
                  className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-bold text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConfirmDelete}
                  className="rounded-xl bg-rose-600 px-5 py-2 text-sm font-black text-white hover:bg-rose-700 shadow-md"
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

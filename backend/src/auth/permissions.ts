export const permissions = {
  menuRead: 'menu:read',
  menuCreate: 'menu:create',
  menuUpdate: 'menu:update',
  menuDelete: 'menu:delete',
  orderRead: 'orders:read',
  orderCreate: 'orders:create',
  orderStatus: 'orders:update_status',
  kitchenRead: 'kitchen:read',
  kitchenStatus: 'kitchen:update_status',
  inventoryRead: 'inventory:read',
  inventoryCreate: 'inventory:create',
  inventoryUpdate: 'inventory:update',
  inventoryDelete: 'inventory:delete',
  employeesRead: 'employees:read',
  employeesManage: 'employees:manage',
  invoicesRead: 'invoices:read',
  invoicesCreate: 'invoices:create',
  invoicesUpdate: 'invoices:update',
  offersRead: 'offers:read',
  offersManage: 'offers:manage',
  reportsRead: 'reports:read',
  tablesRead: 'tables:read',
  tablesManage: 'tables:manage',
  settingsRead: 'settings:read',
  settingsManage: 'settings:manage',
  reviewsRead: 'reviews:read',
  reviewsCreate: 'reviews:create',
} as const;

export type Permission = (typeof permissions)[keyof typeof permissions];

type Role = 'customer' | 'cashier' | 'chef' | 'manager' | 'owner' | 'platformAdmin';

export function isSupportedRole(role: string): role is Role {
  return role in rolePermissions;
}

const rolePermissions: Record<Role, readonly Permission[]> = {
  customer: [
    permissions.menuRead,
    permissions.orderRead,
    permissions.orderCreate,
    permissions.invoicesRead,
    permissions.offersRead,
    permissions.settingsRead,
    permissions.reviewsRead,
    permissions.reviewsCreate,
  ],
  cashier: [
    permissions.menuRead,
    permissions.orderRead,
    permissions.orderCreate,
    permissions.orderStatus,
    permissions.invoicesRead,
    permissions.invoicesCreate,
    permissions.invoicesUpdate,
    permissions.offersRead,
    permissions.settingsRead,
    permissions.tablesRead,
    permissions.kitchenRead,
  ],
  chef: [
    permissions.menuRead,
    permissions.orderRead,
    permissions.orderStatus,
    permissions.kitchenRead,
    permissions.kitchenStatus,
    permissions.invoicesRead,
    permissions.settingsRead,
    permissions.tablesRead,
  ],
  manager: Object.values(permissions) as Permission[],
  owner: Object.values(permissions) as Permission[],
  platformAdmin: Object.values(permissions) as Permission[],
};

export function hasPermission(role: string, permission: Permission) {
  return rolePermissions[role as Role]?.includes(permission) ?? false;
}

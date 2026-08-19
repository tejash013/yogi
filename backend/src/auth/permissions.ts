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
} as const;

export type Permission = (typeof permissions)[keyof typeof permissions];

type Role = 'customer' | 'cashier' | 'chef' | 'manager' | 'owner' | 'admin';

const rolePermissions: Record<Role, readonly Permission[]> = {
  customer: [permissions.menuRead, permissions.orderRead, permissions.orderCreate, permissions.offersRead],
  cashier: [permissions.menuRead, permissions.orderRead, permissions.orderCreate, permissions.invoicesRead, permissions.invoicesCreate, permissions.invoicesUpdate, permissions.offersRead],
  chef: [permissions.menuRead, permissions.orderRead, permissions.kitchenRead, permissions.kitchenStatus],
  manager: Object.values(permissions) as Permission[],
  owner: Object.values(permissions) as Permission[],
  admin: Object.values(permissions) as Permission[],
};

export function hasPermission(role: string, permission: Permission) {
  return rolePermissions[role as Role]?.includes(permission) ?? false;
}

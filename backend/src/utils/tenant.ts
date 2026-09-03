import { Types } from 'mongoose';

export const DEFAULT_RESTAURANT_ID = new Types.ObjectId('000000000000000000000001');
export const DEFAULT_BRANCH_ID = new Types.ObjectId('000000000000000000000002');

export function tenantIdsFromRequest(req: any) {
  let restaurantId: any;
  let branchId: any;

  if (req.user?.role === 'platformAdmin') {
    restaurantId = req.headers['x-restaurant-id'] ?? req.user?.restaurantId ?? DEFAULT_RESTAURANT_ID;
    branchId = req.headers['x-branch-id'] ?? req.user?.branchId ?? DEFAULT_BRANCH_ID;
  } else if (req.user?.role === 'owner') {
    restaurantId = req.user?.restaurantId ?? DEFAULT_RESTAURANT_ID;
    branchId = req.headers['x-branch-id'] ?? req.user?.branchId ?? DEFAULT_BRANCH_ID;
  } else if (req.user?.role === 'customer' || !req.user) {
    restaurantId = req.headers['x-restaurant-id'] ?? req.user?.restaurantId ?? DEFAULT_RESTAURANT_ID;
    branchId = req.headers['x-branch-id'] ?? req.user?.branchId ?? DEFAULT_BRANCH_ID;
  } else {
    // Fixed terminal staff (cashier, chef)
    restaurantId = req.user?.restaurantId ?? DEFAULT_RESTAURANT_ID;
    branchId = req.user?.branchId ?? DEFAULT_BRANCH_ID;
  }

  if (!Types.ObjectId.isValid(String(restaurantId)) || !Types.ObjectId.isValid(String(branchId))) {
    const error: any = new Error('Invalid restaurant or branch context');
    error.status = 400;
    throw error;
  }
  return { restaurantId: String(restaurantId), branchId: String(branchId) };
}

export function tenantFilter(req: any) {
  return tenantIdsFromRequest(req);
}

export function assertTenantMatch(document: any, tenant: { restaurantId: string; branchId: string }) {
  return String(document?.restaurantId) === tenant.restaurantId && String(document?.branchId) === tenant.branchId;
}

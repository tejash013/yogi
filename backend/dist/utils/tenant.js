import { Types } from 'mongoose';
export const DEFAULT_RESTAURANT_ID = new Types.ObjectId('000000000000000000000001');
export const DEFAULT_BRANCH_ID = new Types.ObjectId('000000000000000000000002');
export function tenantIdsFromRequest(req) {
    let restaurantId = req.query?.restaurantId ?? req.headers['x-restaurant-id'] ?? req.user?.restaurantId ?? DEFAULT_RESTAURANT_ID;
    let branchId = req.query?.branchId ?? req.headers['x-branch-id'] ?? req.user?.branchId ?? DEFAULT_BRANCH_ID;
    if (!Types.ObjectId.isValid(String(restaurantId))) {
        restaurantId = DEFAULT_RESTAURANT_ID;
    }
    if (!Types.ObjectId.isValid(String(branchId))) {
        branchId = DEFAULT_BRANCH_ID;
    }
    return { restaurantId: String(restaurantId), branchId: String(branchId) };
}
export function tenantFilter(req) {
    return tenantIdsFromRequest(req);
}
export function assertTenantMatch(document, tenant) {
    return String(document?.restaurantId) === tenant.restaurantId && String(document?.branchId) === tenant.branchId;
}

import { Types } from 'mongoose';
export const DEFAULT_RESTAURANT_ID = new Types.ObjectId('000000000000000000000001');
export const DEFAULT_BRANCH_ID = new Types.ObjectId('000000000000000000000002');
export function tenantIdsFromRequest(req) {
    const queryRest = req.query?.restaurantId;
    const headerRest = req.headers?.['x-restaurant-id'];
    const userRest = req.user?.restaurantId;
    const queryBranch = req.query?.branchId;
    const headerBranch = req.headers?.['x-branch-id'];
    const userBranch = req.user?.branchId;
    const restaurantId = (queryRest && Types.ObjectId.isValid(String(queryRest)) ? String(queryRest) : null) ||
        (headerRest && Types.ObjectId.isValid(String(headerRest)) ? String(headerRest) : null) ||
        (userRest && Types.ObjectId.isValid(String(userRest)) ? String(userRest) : null) ||
        String(DEFAULT_RESTAURANT_ID);
    const branchId = (queryBranch && Types.ObjectId.isValid(String(queryBranch)) ? String(queryBranch) : null) ||
        (headerBranch && Types.ObjectId.isValid(String(headerBranch)) ? String(headerBranch) : null) ||
        (userBranch && Types.ObjectId.isValid(String(userBranch)) ? String(userBranch) : null) ||
        String(DEFAULT_BRANCH_ID);
    return { restaurantId, branchId };
}
export function tenantFilter(req) {
    return tenantIdsFromRequest(req);
}
export function assertTenantMatch(document, tenant) {
    return String(document?.restaurantId) === tenant.restaurantId && String(document?.branchId) === tenant.branchId;
}

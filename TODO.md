# Error Fix Checklist

## TypeScript Build Errors (`npm run build`)

1. [x] `src/api/endpoints.ts`: Remove unused `User` import
2. [x] `src/components/customer/OrderCard.tsx`: Restore `isCurrent` prop and use it with "Current" badge
3. [x] `src/pages/admin/Employees.tsx`: Remove unused `CardHeader` import
4. [x] `src/pages/admin/Inventory.tsx`: Remove unused `CardHeader` import
5. [x] `src/pages/admin/MenuManagement.tsx`: Add missing `useMemo` import
6. [x] `src/pages/customer/Cart.tsx`: Remove unused `tax` and `total` from store destructure
7. [x] `src/pages/customer/Home.tsx`: Remove unused `Button` import
8. [x] `src/pages/customer/Rewards.tsx`: Remove unused `Badge` and `Button` imports

## Verification
- [x] Run `npm run build` to confirm all type errors are fixed (PASSED ✓)
- [x] Run `npm run lint` to confirm no lint errors (0 errors, warnings only)


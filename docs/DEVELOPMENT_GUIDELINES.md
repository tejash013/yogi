# RestaurantOS - Engineering & Development Guidelines

This document establishes the code quality standards, conventions, and engineering workflows for contributors to **RestaurantOS (Yogi)**.

---

## 1. Codebase Organization

```
yogi/
├── backend/                  # Node.js Express backend (ESM)
│   ├── src/
│   │   ├── auth/            # RBAC permissions and role matrices
│   │   ├── config/          # Third-party service configurations (Cloudinary, etc.)
│   │   ├── controllers/     # Route business logic handlers
│   │   ├── data/            # Initial database seed scripts
│   │   ├── middleware/      # Auth, tenant resolver, rate limiter, error handler
│   │   ├── models/          # Mongoose ODM schema definitions
│   │   ├── repos/           # Database access layer / repository pattern
│   │   ├── routes/          # Express route definitions
│   │   ├── socket/          # Socket.IO handlers and server instance
│   │   ├── utils/           # JWT, password hashing, logger, email, response helpers
│   │   └── validation/      # Zod validation schemas
│   └── test/                # Mocha + Supertest integration tests
├── src/                     # React 19 Frontend application
│   ├── api/                 # Axios HTTP client & API endpoint wrappers
│   ├── assets/              # Static SVG icons and images
│   ├── components/          # Reusable UI component library & domain widgets
│   │   ├── common/          # Layout components, headers, protected routes
│   │   ├── kitchen/         # KDS tickets, order cards, prep timers
│   │   └── ui/              # Buttons, inputs, modals, cards, badges, tables
│   ├── config/              # Frontend runtime configuration
│   ├── constants/           # Route paths, storage keys, default values
│   ├── layouts/             # Auth, Customer, Admin, Kitchen, Cashier, Owner layouts
│   ├── pages/               # Routed page views categorized by persona
│   ├── routes/              # React Router 7 route declarations
│   ├── services/            # Client-side Socket.IO real-time client
│   ├── store/               # Zustand global state stores
│   ├── theme/               # Theme definitions and color palette
│   └── types/               # Frontend TypeScript interfaces & schemas
├── shared/                  # Common TypeScript interfaces shared across layers
└── docs/                    # Architectural and developer documentation
```

---

## 2. Frontend Development Standards

### 2.1 React 19 & TypeScript
- Use functional components with standard React 19 hooks (`useState`, `useEffect`, `useMemo`, `useCallback`, `useRef`).
- Avoid `any` types; import strict models from `@/types` or `@/shared/types`.
- Use `safeLazy` from `src/routes/index.tsx` for route-level code splitting with automatic chunk retry logic.

### 2.2 Styling with Tailwind CSS v4
- Use semantic utility classes following the project's color palette:
  - **Primary:** `primary-500` (#f97316 orange)
  - **Secondary:** `secondary-500` (#10b981 emerald green)
  - **Neutral:** `neutral-50` to `neutral-900`
- Always support dark mode variants (`dark:bg-neutral-900`, `dark:text-white`, `dark:border-neutral-800`).
- Ensure all interactive elements have responsive touch targets (minimum `44x44px` on mobile viewports).

### 2.3 Form Validation Pattern
Forms should utilize **React Hook Form** with **Zod** schema resolvers:

```typescript
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const itemSchema = z.object({
  title: z.string().min(2, 'Title must be at least 2 characters'),
  price: z.number().positive('Price must be greater than 0'),
});

type ItemFormData = z.infer<typeof itemSchema>;

export function MenuItemForm() {
  const { register, handleSubmit, formState: { errors } } = useForm<ItemFormData>({
    resolver: zodResolver(itemSchema),
  });

  const onSubmit = (data: ItemFormData) => {
    // Process validated data
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input {...register('title')} />
      {errors.title && <span className="text-red-500">{errors.title.message}</span>}
    </form>
  );
}
```

### 2.4 State Management with Zustand
- Keep stores focused by domain (`authStore`, `cartStore`, `kitchenStore`, `cashierStore`).
- Always export custom hooks (e.g., `useAuthStore((state) => state.user)`).
- Use shallow selector subscriptions to prevent unnecessary component re-renders.

---

## 3. Backend Development Standards

### 3.1 Route & Middleware Pipeline
Backend routes must follow this structured pipeline:

```
Request ➔ RateLimiter ➔ JWT Auth Guard ➔ RBAC Permission Check ➔ Tenant Resolver ➔ Zod Validation ➔ Handler Controller ➔ Central Error Handler
```

Example endpoint declaration:
```typescript
router.post(
  '/',
  requireAuth,
  requirePermission('menu:create'),
  validateBody(createMenuItemSchema),
  async (req, res) => {
    const tenant = tenantIdsFromRequest(req);
    const item = await MenuItem.create({ ...tenant, ...req.body });
    return res.status(201).json(success(item, 'Menu item created'));
  }
);
```

### 3.2 Multi-Tenant Data Enforcement Rule
> [!CRITICAL]
> **Every database query that accesses tenant-scoped models MUST include `{ ...tenant }` in the query filter.**
> Never write un-scoped operations like `MenuItem.find({ isAvailable: true })`.
> Always write: `MenuItem.find({ ...tenant, isAvailable: true })`.

### 3.3 Structured Logging
Use Pino structured logging instead of `console.log`:
```typescript
import { logger } from '../utils/logger.js';

logger.info({ orderId: order._id, amount: order.total }, 'Order created successfully');
logger.error({ err: error, userId: req.user?.id }, 'Failed to process payment');
```

---

## 4. Testing & Quality Assurance

### 4.1 Running Backend Tests
Backend tests use Mocha and `mongodb-memory-server` to run hermetically without needing an external database:

```bash
cd backend
npm test
```

### 4.2 Writing New Tests
Place test suites under `backend/test/` with the `.test.mjs` extension:
```javascript
import { expect } from 'expect';
import request from 'supertest';
import { app } from '../dist/app.js';

describe('POST /api/menu', () => {
  it('rejects unauthorized creation', async () => {
    const res = await request(app)
      .post('/api/menu')
      .send({ title: 'Unauthorized Dish', price: 10 });
    expect(res.status).toBe(401);
  });
});
```

### 4.3 Static Analysis & Linting
Run Oxlint prior to committing code:
```bash
npm run lint
```

---

## 5. Git & Contribution Workflow

1. **Branch Naming:**
   - Features: `feat/feature-name` (e.g., `feat/split-payment-pos`)
   - Bugfixes: `fix/bug-description` (e.g., `fix/socket-origin-match`)
   - Documentation: `docs/guide-name`
2. **Commit Convention:**
   Follow Conventional Commits:
   - `feat: add table reservation timeline view`
   - `fix: resolve race condition in kitchen queue`
   - `docs: update API documentation for invoices`
3. **Pull Request Checklist:**
   - [ ] `npm run build` succeeds without compiler errors.
   - [ ] `npm run build:backend` succeeds.
   - [ ] `npm run lint` reports 0 errors.
   - [ ] All backend tests pass (`npm test`).
   - [ ] Tested on both desktop and mobile viewports.

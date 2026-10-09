# RestaurantOS - REST API & WebSocket Reference

This document provides a comprehensive reference for all REST endpoints and WebSocket events supported by the **RestaurantOS Backend API**.

---

## 1. General Conventions & Protocol Standards

### Base URL
- **Local Development:** `http://localhost:3000`
- **Production:** `https://your-backend-service.onrender.com`

### Common HTTP Headers

| Header | Required | Description |
| :--- | :---: | :--- |
| `Authorization` | Conditional | `Bearer <ACCESS_TOKEN>` for protected routes |
| `x-restaurant-id` | Optional | Scope requests to specific restaurant entity |
| `x-branch-id` | Optional | Scope requests to specific branch location |
| `Content-Type` | Yes (on POST/PUT/PATCH) | `application/json` |
| `Idempotency-Key` | Optional (POST /api/invoices) | Unique string to prevent duplicate payments |

### Standard Response Envelopes

All REST responses adhere to a consistent JSON structure:

#### Success Response
```json
{
  "success": true,
  "data": { ... },
  "message": "Operation completed successfully"
}
```

#### Paginated Response
```json
{
  "success": true,
  "data": [ ... ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 142,
    "totalPages": 8
  }
}
```

#### Error Response
```json
{
  "success": false,
  "data": null,
  "message": "Human-readable explanation of error",
  "errors": [
    { "field": "email", "message": "Invalid email address" }
  ]
}
```

---

## 2. Authentication Endpoints (`/api/auth`)

### 2.1 Register
- **`POST /api/auth/register`**
- **Public access**
- **Request Body:**
  ```json
  {
    "email": "customer@example.com",
    "password": "SecurePassword123",
    "confirmPassword": "SecurePassword123",
    "firstName": "John",
    "lastName": "Doe",
    "phone": "+919876543210"
  }
  ```
- **Response `201 Created`:** Sets `restaurantos_refresh` cookie, returns `{ user, token }`.

### 2.2 Login
- **`POST /api/auth/login`**
- **Public access**
- **Request Body (Email or Phone):**
  ```json
  {
    "email": "customer@example.com",
    "password": "SecurePassword123"
  }
  ```
- **Response `200 OK`:** Sets `restaurantos_refresh` cookie, returns `{ user, token }`.

### 2.3 Google OAuth 2.0 Login
- **`POST /api/auth/google`**
- **Public access**
- **Request Body:**
  ```json
  {
    "credential": "<GOOGLE_ID_TOKEN>"
  }
  ```
- **Response `200 OK`:** Verifies ID token with Google servers, creates account if needed, sets refresh cookie, returns `{ user, token }`.

### 2.4 Token Refresh
- **`POST /api/auth/refresh`**
- **Requires Cookie:** `restaurantos_refresh`
- **Response `200 OK`:**
  ```json
  {
    "success": true,
    "data": {
      "token": "<NEW_15_MINUTE_ACCESS_TOKEN>"
    }
  }
  ```

### 2.5 Logout
- **`POST /api/auth/logout`**
- **Response `200 OK`:** Clears `restaurantos_refresh` cookie and invalidates token in database.

### 2.6 Password Recovery
- **`POST /api/auth/forgot-password`** - Body: `{ "email": "user@example.com" }`
- **`POST /api/auth/verify-otp`** - Body: `{ "email": "user@example.com", "otp": "123456" }`
- **`POST /api/auth/reset-password`** - Body: `{ "email": "user@example.com", "token": "hash", "password": "newPassword" }`

---

## 3. Multi-Tenant SaaS Endpoints (`/api/tenants`)

### 3.1 Get Current Tenant Context
- **`GET /api/tenants/current`**
- Returns currently resolved restaurant and branch details.

### 3.2 Restaurants Management
- **`GET /api/tenants/restaurants`** - List all restaurants (Supports `?includeInactive=true`).
- **`GET /api/tenants/restaurants/:id`** - Get single restaurant with branch count.
- **`POST /api/tenants/restaurants`** *(Platform Admin)* - Create new restaurant.
  ```json
  {
    "name": "Bistro Deluxe",
    "slug": "bistro-deluxe",
    "address": "42 Ocean Way",
    "currency": "INR",
    "isActive": true
  }
  ```
- **`PUT /api/tenants/restaurants/:id`** *(Platform Admin / Owner)* - Update restaurant details.
- **`DELETE /api/tenants/restaurants/:id`** *(Platform Admin)* - Deactivate or permanently delete.

### 3.3 Branches Management
- **`GET /api/tenants/branches`** - List all branches across system.
- **`GET /api/tenants/restaurants/:restaurantId/branches`** - List branches for a specific restaurant.
- **`POST /api/tenants/restaurants/:restaurantId/branches`** *(Platform Admin / Owner)* - Add branch to restaurant.
- **`PUT /api/tenants/branches/:id`** *(Platform Admin / Owner / Manager)* - Update branch details.
- **`DELETE /api/tenants/branches/:id`** *(Platform Admin)* - Deactivate or remove branch.

---

## 4. Menu & Categories Endpoints

### 4.1 Menu Items (`/api/menu`)
- **`GET /api/menu`** - List menu items. Query params: `page`, `limit`, `category`, `search`, `isPopular`, `isRecommended`.
- **`GET /api/menu/:id`** - Get single item with category details.
- **`POST /api/menu`** *(Manager, Owner, Platform Admin)* - Create menu item:
  ```json
  {
    "title": "Truffle Mushroom Risotto",
    "description": "Creamy arborio rice with black truffle oil and wild forest mushrooms",
    "price": 18.99,
    "discountPrice": 15.99,
    "category": "668fa910e5b7c89f3a123456",
    "image": "https://res.cloudinary.com/...",
    "isAvailable": true,
    "isPopular": true,
    "tags": ["italian", "vegetarian", "gourmet"],
    "preparationTime": 25,
    "calories": 480
  }
  ```
- **`PATCH /api/menu/:id`** *(Manager, Owner, Platform Admin)* - Update item fields.
- **`DELETE /api/menu/:id`** *(Manager, Owner, Platform Admin)* - Delete menu item.

### 4.2 Categories (`/api/categories`)
- **`GET /api/categories`** - List all categories with sort order.
- **`GET /api/categories/:id`** - Get category by ID.
- **`POST /api/categories`** *(Manager, Owner, Platform Admin)* - Create new category.

### 4.3 Reviews (`/api/reviews`)
- **`GET /api/reviews/menu/:menuItemId`** - Get all reviews and ratings for a dish.
- **`POST /api/reviews`** *(Customer)* - Submit rating (1-5 stars) and comment.

---

## 5. Orders Endpoints (`/api/orders`)

- **`GET /api/orders`** *(Staff)* - List orders with status filters (`pending`, `confirmed`, `preparing`, `ready`, `completed`, `cancelled`).
- **`GET /api/orders/my-orders`** *(Customer)* - Get authenticated user's order history.
- **`GET /api/orders/:id`** - Get full order breakdown including item details, table number, pricing, tax, and invoice status.
- **`POST /api/orders`** - Create new order:
  ```json
  {
    "tableId": "668fa910e5b7c89f3a654321",
    "orderType": "dine-in",
    "items": [
      { "menuItem": "668fa910e5b7c89f3a123456", "quantity": 2, "specialInstructions": "No garlic" }
    ],
    "notes": "Please serve with extra napkins"
  }
  ```
- **`PATCH /api/orders/:id/status`** *(Chef, Cashier, Manager)* - Update order lifecycle status:
  ```json
  {
    "status": "preparing"
  }
  ```
- **`GET /api/orders/:id/track`** - Lightweight tracking endpoint for order live progress.

---

## 6. Dining Tables & QR Ordering (`/api/tables`)

- **`GET /api/tables`** - List all tables with live status (`available`, `occupied`, `reserved`, `cleaning`).
- **`POST /api/tables`** *(Manager, Owner)* - Add dining table (label, capacity, location, notes).
- **`PATCH /api/tables/:id`** - Update table properties.
- **`PATCH /api/tables/:id/status`** - Change occupancy status.
- **`POST /api/tables/:id/qr-token`** *(Manager, Owner)* - Generate secure signed QR token for table self-ordering.
- **`DELETE /api/tables/:id/qr-token`** - Revoke active QR code.
- **`GET /api/tables/qr/:token`** *(Public QR scan)* - Resolve table details from scanned QR link.

---

## 7. Cashier & Invoicing Endpoints (`/api/invoices`)

- **`GET /api/invoices`** *(Cashier, Manager)* - List invoices with pagination, date filtering, and status.
- **`GET /api/invoices/:id`** - Retrieve full printable invoice.
- **`POST /api/invoices`** *(Cashier, Manager)* - Create invoice for order:
  - Header: `Idempotency-Key: idemp-1727334400-abcde`
  ```json
  {
    "orderId": "668fa910e5b7c89f3a987654",
    "paymentMethod": "cash"
  }
  ```
- **`PATCH /api/invoices/:id/status`** *(Cashier, Manager)* - Update payment status (`paid`, `unpaid`, `refunded`, `partially_paid`).

### Payment Webhook Endpoint (`POST /api/payments/webhook`)
External payment gateways (Stripe, Razorpay, etc.) notify payment completion through this webhook.
- Requires headers:
  - `x-payment-signature`: HMAC-SHA256 signature generated with `PAYMENT_WEBHOOK_SECRET`
  - `x-payment-event-id`: Unique idempotent event identifier
- Body: Raw JSON payload with `invoiceId`, `status: "paid"`, `amount`, `transactionId`.

---

## 8. Inventory Management (`/api/inventory`)

- **`GET /api/inventory`** - List stock items (quantity, unit, reorder threshold, supplier).
- **`POST /api/inventory`** *(Manager, Owner)* - Add new stock item.
- **`PATCH /api/inventory/:id`** *(Manager, Owner)* - Update stock count or restock levels.
- **`DELETE /api/inventory/:id`** *(Manager, Owner)* - Deactivate inventory item.

---

## 9. Staff & User Access (`/api/employees` & `/api/users`)

- **`GET /api/employees`** - View employees list with shift details and salary info.
- **`POST /api/employees`** *(Manager, Owner)* - Register employee profile.
- **`GET /api/users`** *(Platform Admin, Owner, Manager)* - View system users.
- **`POST /api/users`** *(Platform Admin, Owner)* - Create user with specific role and branch affiliation.
- **`PATCH /api/users/:id/access`** *(Platform Admin, Owner)* - Change user role, activation status, or branch assignment.

---

## 10. SaaS Subscriptions (`/api/subscriptions`)

- **`GET /api/subscriptions/plans`** - List public SaaS subscription tiers.
- **`GET /api/subscriptions/current`** *(Owner)* - View active subscription status, billing cycle, and trial period.
- **`GET /api/subscriptions/restaurants`** *(Platform Admin)* - View subscription statuses across all registered restaurants.
- **`PATCH /api/subscriptions/restaurants/:restaurantId`** *(Platform Admin)* - Upgrade/downgrade subscription plan or modify expiration dates.
- **`POST /api/subscriptions/plans`** *(Platform Admin)* - Create new subscription tier.

---

## 11. Reports & Analytics (`/api/reports`)

*(Accessible by Owner and Manager)*
- **`GET /api/reports/sales?startDate=2026-09-01&endDate=2026-09-26`** - Sales performance by category and dish.
- **`GET /api/reports/revenue?startDate=2026-09-01&endDate=2026-09-26`** - Daily and monthly revenue aggregations.
- **`GET /api/reports/expenses?startDate=2026-09-01&endDate=2026-09-26`** - Operating expenses and cost breakdowns.

---

## 12. WebSocket Events Reference

### Connection Handshake
```javascript
const socket = io('http://localhost:3000', {
  auth: { token: '<JWT_ACCESS_TOKEN>' },
  withCredentials: true
});
```

### Server-to-Client Events

| Event Name | Recipient | Payload | Trigger |
| :--- | :--- | :--- | :--- |
| `connected` | Client | `{ ok: true }` | Successful socket handshake |
| `order:created` | Order Owner & Staff | Order Object | New order placed |
| `order:status:update` | Order Owner & Staff | `{ id, status }` | Order status changes (e.g., to `preparing`) |
| `table:status:update` | Staff | `{ tableId, status }` | Table occupancy or cleaning status changes |

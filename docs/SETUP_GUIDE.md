# RestaurantOS - Comprehensive Setup & Installation Guide

This guide walks you through setting up and running **RestaurantOS (Yogi)** locally for development, configuring environment variables, seeding sample data, running in Docker, and troubleshooting common issues.

---

## 1. System Requirements & Prerequisites

Ensure the following tools are installed on your workstation before starting:

| Tool | Minimum Version | Recommended Version | Verification Command |
| :--- | :--- | :--- | :--- |
| **Node.js** | `v20.x` | `v22.x` or higher | `node -v` |
| **npm** | `v10.x` | `v10.8+` | `npm -v` |
| **MongoDB** | `v6.0` (or Atlas cloud) | MongoDB Atlas Free M0 | `mongosh --version` |
| **Docker** *(Optional)* | `v24.0` | Latest Desktop | `docker --version` |
| **Git** | `v2.40+` | Latest | `git --version` |

---

## 2. Repository Architecture & Quick Overview

The repository is structured as a monorepo-style workspace:
- **`./` (Root)**: React 19 + TypeScript + Vite 8 frontend application with Tailwind CSS v4.
- **`./backend`**: Node.js ESM Express server with Mongoose ODM, Socket.IO, Zod validation, and Pino logging.
- **`./shared`**: Shared TypeScript types across frontend and backend.

---

## 3. Step-by-Step Local Setup

### Step 3.1: Clone the Repository

```bash
git clone https://github.com/tejash013/yogi.git
cd yogi
```

### Step 3.2: Install Dependencies

Install dependencies for both the frontend and backend:

```bash
# 1. Install frontend root dependencies
npm install

# 2. Install backend dependencies
cd backend
npm install
cd ..
```

---

## 4. Environment Variables Configuration

The system requires environment configuration files in two places:
1. Root `.env` (Frontend)
2. `backend/.env` (Backend Server)

### 4.1 Frontend Environment (`.env`)

Create a `.env` file in the root directory:

```bash
# In the root directory: f:\tejash\yogi\.env
VITE_API_URL=http://localhost:3000

# Optional: Google OAuth 2.0 Web Client ID (from Google Cloud Console)
VITE_GOOGLE_CLIENT_ID=your_google_client_id.apps.googleusercontent.com
```

| Variable | Required | Description | Example / Default |
| :--- | :---: | :--- | :--- |
| `VITE_API_URL` | **Yes** | Base URL pointing to the backend API | `http://localhost:3000` |
| `VITE_GOOGLE_CLIENT_ID` | No | Client ID for Google One-Tap & OAuth button | `xxxx.apps.googleusercontent.com` |

---

### 4.2 Backend Environment (`backend/.env`)

Create a `.env` file inside the `backend/` directory:

```bash
# In backend directory: f:\tejash\yogi\backend\.env

# Server & Runtime
PORT=3000
NODE_ENV=development

# Database (Local MongoDB or MongoDB Atlas)
MONGODB_URI=mongodb://localhost:27017/restaurantos
# Or MongoDB Atlas:
# MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/restaurantos?retryWrites=true&w=majority
MONGODB_DATABASE=restaurantos

# JWT Authentication Secrets (Must be at least 32 characters in production)
ACCESS_TOKEN_SECRET=dev_jwt_access_secret_super_secure_key_12345
REFRESH_TOKEN_SECRET=dev_jwt_refresh_secret_super_secure_key_67890
ACCESS_TOKEN_EXPIRES=15m
REFRESH_TOKEN_EXPIRES=7d

# Allowed Frontend Origins (Comma-separated)
FRONTEND_URL=http://localhost:5173,http://127.0.0.1:5173

# Optional: Google OAuth 2.0 Server Validation
GOOGLE_CLIENT_ID=your_google_client_id.apps.googleusercontent.com

# Optional: Cloudinary (Image Uploads for Menu & Reviews)
# CLOUDINARY_URL=cloudinary://api_key:api_secret@cloud_name
# CLOUDINARY_CLOUD_NAME=your_cloud_name
# CLOUDINARY_API_KEY=your_api_key
# CLOUDINARY_API_SECRET=your_api_secret

# Optional: SMTP Server (Transactional Emails / OTP / Password Reset)
# SMTP_HOST=smtp.gmail.com
# SMTP_PORT=587
# SMTP_SECURE=false
# SMTP_USER=your_email@gmail.com
# SMTP_PASS=your_email_app_password
# SMTP_FROM="RestaurantOS <no-reply@restaurantos.com>"

# Optional: Payment Webhook Secret (HMAC SHA-256 Signature Verification)
# PAYMENT_WEBHOOK_SECRET=your_payment_webhook_secret_key
```

> [!TIP]
> **Generating Secure JWT Secrets:**
> On Linux / macOS / Git Bash, you can generate cryptographic 64-byte random secrets by running:
> ```bash
> node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
> ```

---

## 5. Running the Application

You can run both frontend and backend concurrently or in separate terminal windows.

### Option A: Run Both Concurrently (Recommended)

From the project root:

```bash
npm run dev:all
```

This starts:
- Frontend at: `http://localhost:5173`
- Backend at: `http://localhost:3000`

---

### Option B: Run in Separate Terminals

**Terminal 1 (Backend):**
```bash
npm run dev:backend
# Or: cd backend && npm run dev
```

**Terminal 2 (Frontend):**
```bash
npm run dev
```

---

## 6. Database Seeding & Verification

When the backend starts for the first time, it automatically executes `seedDatabase()` from `backend/src/data/seed.ts`:
- Generates default multi-tenant entities:
  - **Restaurant:** `Yogi Grand Restaurant & Lounge` (ID: `000000000000000000000001`)
  - **Branch 1:** `Main Dining Hall (Downtown)` (ID: `000000000000000000000002`)
  - **Branch 2:** `Express Food Court (Uptown)`
  - **Branch 3 & 4:** Additional branches with geocoded coordinates
- Seeds standard menu categories (Pizza, Main Course, Salads, Desserts, Appetizers, Beverages).
- Populates popular menu items with pricing, tags, and preparation info.
- Creates initial dining tables (Tables 1 through 6) with locations and QR readiness.
- Sets up default active discounts and coupons (`SAVE10`, `Weekend Special`, `Lunch Combo`).

### Health Checks

Verify your backend is operating normally:

1. **Service Ping:**
   ```bash
   curl http://localhost:3000/health
   # Expected response: {"status":"ok","service":"restaurantos-backend"}
   ```

2. **Database Readiness Check:**
   ```bash
   curl http://localhost:3000/ready
   # Expected response: {"status":"ready","database":"ok"}
   ```

---

## 7. Pre-Configured Test Accounts

The following demo accounts exist for evaluating each role:

| Role | Email | Password | Access Scope |
| :--- | :--- | :--- | :--- |
| **Platform Admin** | `abc@gmail.com` | `password123` | Multi-Tenant SaaS Workspace, Subscriptions, All Outlets |
| **Owner** | `owner@example.com` *(or create via Register)* | `password123` | Executive Analytics, Revenue, Expense Tracking, Plan Details |
| **Manager** | `rajesh@gmail.com` | `password123` | Menu CRUD, Table Management, Employees, Inventory, Daily Orders |
| **Cashier** | `asd@gmail.com` | `password123` | POS Billing, Invoices, Cash/Card/UPI Payment Processing |
| **Chef / Kitchen** | `mahesh@gmail.com` | `password123` | Kitchen Display System (KDS), Live Order Status, Preparation Timers |
| **Customer** | `tejash@gmail.co` | `password123` | Menu Browsing, Table QR Ordering, Cart, Coupons, Order Tracking |

> [!NOTE]
> If creating a new user through the `/auth/register` interface, users default to the `customer` role. A **Platform Admin** or **Manager** can promote user roles or assign outlet affiliations from `/admin/users` or `/workspace/users`.

---

## 8. Running with Docker Compose

For a zero-dependency setup where MongoDB and the backend are containerized:

```bash
# 1. Set required secrets in environment
export ACCESS_TOKEN_SECRET="your_32_char_access_secret_here"
export REFRESH_TOKEN_SECRET="your_32_char_refresh_secret_here"

# On Windows PowerShell:
# $env:ACCESS_TOKEN_SECRET="your_32_char_access_secret_here"
# $env:REFRESH_TOKEN_SECRET="your_32_char_refresh_secret_here"

# 2. Build and launch containers
npm run docker:up
```

This starts:
- MongoDB 6.0 container listening on `27017` with persistent volume `mongo-data`
- RestaurantOS Backend container on `3000`

---

## 9. Running Tests & Quality Checks

### 9.1 Backend Test Suite (Mocha + In-Memory MongoDB)

The backend features hermetic unit & integration tests covering tenant isolation, RBAC, payment security, order flow, and Google Auth:

```bash
cd backend
npm test
```

### 9.2 TypeScript Compilation Checks

Validate that there are zero TypeScript compiler errors across all modules:

```bash
# Frontend type check
npm run build

# Backend type check
npm run build:backend
```

### 9.3 Code Quality & Linter (Oxlint)

The project uses high-performance Oxlint:

```bash
npm run lint
```

---

## 10. Troubleshooting & FAQ

### Issue: "MONGODB_URI is not defined"
- **Cause:** Backend cannot locate `backend/.env`.
- **Solution:** Verify `backend/.env` exists and contains a valid connection string. If using MongoDB Atlas, ensure your cluster IP whitelist includes your current IP (`0.0.0.0/0` for development).

### Issue: CORS error in browser ("Origin is not allowed")
- **Cause:** The frontend origin is not present in `FRONTEND_URL`.
- **Solution:** Add your frontend URL (e.g., `http://localhost:5173` or `https://your-app.vercel.app`) to `FRONTEND_URL` in `backend/.env`. In development, standard localhost ports (`5173`-`5176`) are whitelisted automatically.

### Issue: Port 3000 or 5173 already in use
- **Cause:** Another process is occupying the port.
- **Solution:**
  - On Windows: `netstat -ano | findstr :3000` followed by `taskkill /PID <PID> /F`
  - On Linux/macOS: `lsof -i :3000` followed by `kill -9 <PID>`
  - Or configure a different port in `PORT=<new_port>` in `.env`.

### Issue: Authentication Refresh Loop or 401 Unauthorized
- **Cause:** Expired session tokens or mismatched refresh cookie settings.
- **Solution:** In local development without HTTPS, cookies require `SameSite=Lax` and `Secure=false`. In production, HTTPS is required for `SameSite=None; Secure`. If stuck, clear localStorage via browser DevTools: `localStorage.clear()` and reload.

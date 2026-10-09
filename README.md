# 🍽️ QuickTable (by tsubasa digital)
### Modern Multi-Tenant Restaurant Management System & Point-of-Sale (POS)

[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9%20%2F%206.0-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-8-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-v4-06B6D4?logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![Node.js](https://img.shields.io/badge/Node.js-Express%20(ESM)-339933?logo=nodedotjs&logoColor=white)](https://nodejs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Mongoose%20ODM-47A248?logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![Socket.IO](https://img.shields.io/badge/Socket.IO-Real--Time-010101?logo=socketdotio&logoColor=white)](https://socket.io/)
[![Linter](https://img.shields.io/badge/Linter-Oxlint-F5A623)](https://oxc.rs/)

QuickTable (by tsubasa digital) is a full-stack, enterprise-grade, multi-tenant restaurant operating system and SaaS platform designed to streamline dining operations, kitchen workflows, POS cashier billing, multi-outlet management, and customer self-ordering via QR codes.

---

## 📑 Documentation Index

Deep-dive documentation is available in the [`docs/`](file:///f:/tejash/yogi/docs) directory:

- 📖 [**"How to Use It" Practical Walkthrough & User Manual**](file:///f:/tejash/yogi/HOW_TO_USE.md) - **Start here!** Hands-on step-by-step instructions for placing an order, kitchen KDS cooking, cashier POS billing, and manager operations.
- ✅ [**Final Test Checks & Verification Report**](file:///f:/tejash/yogi/FINAL_CHECKS.md) - Automated verification audit, 53/53 test suite breakdown, and pre-release smoke checklist (`npm run check:final`).
- 🚀 [**Setup & Installation Guide**](file:///f:/tejash/yogi/docs/SETUP_GUIDE.md) - Step-by-step local development setup, environment variables, database seeding, and Docker container instructions.
- 🏛️ [**System Architecture & Design**](file:///f:/tejash/yogi/docs/ARCHITECTURE.md) - Multi-tenant isolation model, WebSocket real-time event pipeline, security architecture, and database ERD.
- 🔌 [**REST API & WebSocket Reference**](file:///f:/tejash/yogi/docs/API_DOCUMENTATION.md) - Complete endpoint schemas, request/response formats, authentication headers, and socket event catalog.
- 👥 [**User Roles & Operational Workflows**](file:///f:/tejash/yogi/docs/USER_ROLES_AND_WORKFLOWS.md) - Detailed role permission matrix and end-to-end operational workflows for all 6 personas.
- 🚢 [**Production Deployment Playbook**](file:///f:/tejash/yogi/docs/DEPLOYMENT_GUIDE.md) - Deploying the frontend to Vercel Edge CDN, backend to Render.com / Railway, and MongoDB Atlas configuration.
- 🛠️ [**Engineering & Development Guidelines**](file:///f:/tejash/yogi/docs/DEVELOPMENT_GUIDELINES.md) - Coding standards, state management best practices, form validation, testing, and PR conventions.

---

## 🌟 Key Capabilities by Role

### 1. 📱 Customer Portal & QR Table Ordering
- **Table QR Self-Ordering:** Scan table QR codes to automatically connect to the branch and table.
- **Visual Digital Menu:** Filter dishes by category, spicy level, vegetarian status, allergens, and preparation time.
- **Cart & Customization:** Add items with special kitchen preparation instructions.
- **Coupons & Rewards:** Apply promotional discount codes and earn loyalty points.
- **Live Order Tracking:** Real-time visual progress from kitchen preparation to food readiness.
- **Reviews & Ratings:** Submit ratings and reviews for consumed dishes.

### 2. 👨‍🍳 Kitchen Display System (KDS)
- **Live Order Feed:** Real-time incoming tickets with instant audio chimes.
- **Ticket Lifecycle:** Move orders seamlessly: `Pending` ➔ `Preparing` (with live timer) ➔ `Ready` ➔ `Completed`.
- **Special Cooking Notes:** Prominently highlights custom requests (e.g., *"No onions, extra spicy"*).

### 3. 💰 Cashier & POS Module
- **Rapid POS Billing:** Quick itemized bill generation for dine-in, takeaway, and delivery orders.
- **Multiple Payment Modes:** Accept cash, credit/debit card, UPI, and split payments.
- **Invoices & Receipts:** Generate professional printable receipts and export PDF records.
- **Auto Table Release:** Automatically marks tables for cleaning upon bill settlement.

### 4. 🛠️ Restaurant Manager / Admin
- **Menu Management:** Full CRUD operations on menu items, categories, pricing, and stock availability toggles.
- **Table Layout & QR Generation:** Visual table mapping, capacity tracking, and one-click printable QR code generation.
- **Inventory Control:** Track ingredient levels, minimum restock thresholds, suppliers, and expiry alerts.
- **Staff Directory:** Manage employee shifts (Morning, Afternoon, Evening, Night) and role assignments.
- **Sales Analytics:** Daily sales reports by dish, category, and payment method.

### 5. 🏢 Restaurant Owner Dashboard
- **Executive Business Intelligence:** Real-time revenue charts, operating expenses, and net profit margins.
- **Comparative Trend Reports:** Compare performance across custom date ranges and dayparts.
- **Subscription Management:** View active SaaS plan tier, billing cycle, and feature upgrades.

### 6. 🌐 SaaS Platform Superadmin
- **Multi-Tenant Management:** Provision new restaurants, cloud kitchens, and branch outlets.
- **Global User Oversight:** Manage administrative accounts across all tenant organizations.
- **SaaS Subscription Engine:** Configure pricing tiers, trial periods, and feature limits.

---

## 🛠️ Technology Stack

| Layer | Technology | Key Libraries & Specifications |
| :--- | :--- | :--- |
| **Frontend Framework** | React 19 + TypeScript | Functional components, hooks, React Router 7 (`createBrowserRouter`) |
| **Build & Tooling** | Vite 8 + Oxlint | Ultra-fast HMR build, strict type checks (`tsc -b`), code linting |
| **Styling & UI** | Tailwind CSS v4 | Utility-first, responsive dark/light mode, custom design system |
| **State Management** | Zustand 5 | Modular domain stores (`authStore`, `tenantStore`, `cartStore`, etc.) |
| **Form Handling** | React Hook Form + Zod | Strict schema validation, error mapping, safe parsing |
| **Networking & Real-Time** | Axios 1.18 + Socket.IO Client | Interceptors for JWT rotation & tenant headers, live WebSocket updates |
| **Backend Runtime** | Node.js (ESM) + Express 4.18 | Clean controller-repo structure, async handlers, structured routing |
| **Database & ODM** | MongoDB 7.5 + Mongoose 7.8 | Compound tenant indexing, schema validation, atomic transactions |
| **Security & Utilities** | Helmet, Rate Limit, Crypto, JWT | Timing-safe auth, HttpOnly refresh cookies, SHA-256 token hashing |
| **Logging** | Pino 10 + Pino-HTTP 11 | Structured JSON logs with auto request-id (`x-request-id`) tracking |
| **Testing** | Mocha + Supertest | In-memory MongoDB testing with 48 passing unit/integration suites |

---

## ⚡ Quick Start (Local Development)

### 1. Prerequisites
- **Node.js:** `v20.x` or higher
- **npm:** `v10.x` or higher
- **MongoDB:** Local instance on `mongodb://localhost:27017` or MongoDB Atlas URI

### 2. Clone & Install
```bash
git clone https://github.com/tejash013/yogi.git
cd yogi

# Install frontend dependencies
npm install

# Install backend dependencies
cd backend
npm install
cd ..
```

### 3. Configure Environment Variables
Create `.env` in the root folder:
```ini
VITE_API_URL=http://localhost:3000
VITE_GOOGLE_CLIENT_ID=your_google_client_id.apps.googleusercontent.com
```

Create `backend/.env` in the `backend/` folder:
```ini
PORT=3000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/restaurantos
MONGODB_DATABASE=restaurantos
ACCESS_TOKEN_SECRET=development_access_token_secret_32_characters_long
REFRESH_TOKEN_SECRET=development_refresh_token_secret_32_characters_long
FRONTEND_URL=http://localhost:5173,http://127.0.0.1:5173
```

### 4. Run Frontend & Backend Concurrently
```bash
npm run dev:all
```
- **Frontend App:** [http://localhost:5173](http://localhost:5173)
- **Backend API:** [http://localhost:3000](http://localhost:3000)
- **Health Check:** [http://localhost:3000/health](http://localhost:3000/health)
- **Database Readiness:** [http://localhost:3000/ready](http://localhost:3000/ready)

*(On first startup, the backend automatically seeds restaurants, branches, categories, food items, tables, and demo coupons!)*

---

## 🔑 Pre-Configured Test Accounts

| Role | Email | Password | Primary Portal Route |
| :--- | :--- | :--- | :--- |
| **Platform Admin** | `abc@gmail.com` | `password123` | `/workspace` |
| **Manager** | `rajesh@gmail.com` | `password123` | `/admin/dashboard` |
| **Cashier** | `asd@gmail.com` | `password123` | `/cashier/dashboard` |
| **Chef (Kitchen)** | `mahesh@gmail.com` | `password123` | `/kitchen/dashboard` |
| **Customer** | `tejash@gmail.co` | `password123` | `/customer/home` |

---

## 📦 Project Scripts

| Command | Action |
| :--- | :--- |
| `npm run dev:all` | Runs both frontend and backend concurrently in one terminal |
| `npm run dev` | Starts Vite frontend development server (`http://localhost:5173`) |
| `npm run dev:backend` | Starts backend in watch mode using `tsx` (`http://localhost:3000`) |
| `npm run build` | Compiles frontend TypeScript and creates optimized Vite bundle in `dist/` |
| `npm run build:backend` | Compiles backend TypeScript to production ESM JavaScript in `backend/dist/` |
| `npm run start` | Starts compiled backend production server (`node dist/server.js`) |
| `npm run lint` | Runs Oxlint across all JavaScript and TypeScript source files |
| `npm run docker:up` | Builds and starts MongoDB and backend via Docker Compose |
| `cd backend && npm test` | Runs the full 48-case backend test suite with in-memory MongoDB |

---

## 🚢 Production Deployment

For step-by-step instructions on deploying the frontend to **Vercel** and backend to **Render.com** or **Docker**, consult the [**Production Deployment Playbook**](file:///f:/tejash/yogi/docs/DEPLOYMENT_GUIDE.md).

---

## 📄 License
This project is private and proprietary. All rights reserved.

# RestaurantOS - Production Deployment Playbook

This guide describes how to deploy **RestaurantOS (Yogi)** to production on free-tier or enterprise cloud platforms.

---

## 1. Production Architecture Overview

The recommended production configuration uses modern cloud-native edge and container hosting:

```
[ Frontend: Vercel Edge CDN ] 
           │
           ▼ (HTTPS / WSS)
[ Backend: Render.com / Railway Web Service (Node.js ESM) ]
           │
           ▼ (TLS Mongoose Driver)
[ Database: MongoDB Atlas (M0 Free Tier or Dedicated M10+) ]
```

---

## 2. Pre-Deployment Verification Checklist

Before pushing to production, execute these commands locally to guarantee code stability:

```bash
# 1. Frontend TypeScript Compilation
npm run build
# Must complete with 0 errors and output to dist/

# 2. Backend TypeScript Compilation
npm run build:backend
# Must output compiled ESM files to backend/dist/

# 3. Backend Test Suite
cd backend
npm test
# Verify that all 48 test suites pass
cd ..

# 4. Code Linter Check
npm run lint
# Verify 0 lint errors
```

---

## 3. Database Setup: MongoDB Atlas

1. Log in to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas).
2. Create a free shared cluster (e.g., `M0 Sandbox` in AWS/GCP).
3. **Database Access:** Create a database user (e.g., `restaurantos_admin`) with read/write privileges to database `restaurantos`.
4. **Network Access:** In **Network Access**, add IP address `0.0.0.0/0` (Allow access from anywhere) so serverless and cloud hosting providers (Render/Railway/Vercel) can reach the database securely with credentials.
5. **Get Connection String:**
   ```text
   mongodb+srv://<username>:<password>@<cluster-address>.mongodb.net/restaurantos?retryWrites=true&w=majority
   ```

---

## 4. Backend Deployment: Render.com (Free Tier)

### Step 4.1: Create Web Service
1. Open [Render Dashboard](https://dashboard.render.com/) and click **New +** ➔ **Web Service**.
2. Connect your GitHub repository (`tejash013/yogi`).
3. Configure the following parameters:

| Field | Configuration Value |
| :--- | :--- |
| **Name** | `restaurantos-backend` |
| **Region** | Singapore, Frankfurt, or Oregon (closest to your audience) |
| **Branch** | `master` (or `main`) |
| **Root Directory** | `backend` |
| **Runtime** | `Node` |
| **Build Command** | `npm install && npm run build` |
| **Start Command** | `npm start` |
| **Instance Type** | `Free` |
| **Health Check Path** | `/health` |

---

### Step 4.2: Configure Environment Variables

Under **Environment Variables**, add:

| Key | Value | Notes |
| :--- | :--- | :--- |
| `NODE_ENV` | `production` | Enforces production security and cookie rules |
| `PORT` | `3000` | Port listened by the server |
| `MONGODB_URI` | `mongodb+srv://user:pass@cluster.mongodb.net/restaurantos?retryWrites=true&w=majority` | From MongoDB Atlas |
| `MONGODB_DATABASE` | `restaurantos` | Target database name |
| `ACCESS_TOKEN_SECRET` | *(64-character random string)* | Used to sign 15-minute access JWTs |
| `REFRESH_TOKEN_SECRET` | *(Different 64-character random string)* | Used to sign 7-day refresh JWTs |
| `FRONTEND_URL` | `https://your-frontend-app.vercel.app` | Comma-separated allowed frontend origins |
| `GOOGLE_CLIENT_ID` | `your_google_client_id.apps.googleusercontent.com` | Optional: Google Auth |
| `CLOUDINARY_URL` | `cloudinary://api_key:api_secret@cloud_name` | Optional: Image uploads |

4. Click **Deploy Web Service**.
5. Once deployment completes, copy your live backend URL (e.g., `https://restaurantos-backend.onrender.com`).

---

## 5. Frontend Deployment: Vercel (Edge CDN)

### Step 5.1: Import Project to Vercel
1. Go to [Vercel Dashboard](https://vercel.com/) and click **Add New...** ➔ **Project**.
2. Select your repository (`tejash013/yogi`).
3. Set the project configurations:
   - **Framework Preset:** `Vite`
   - **Root Directory:** `./` (Project root)
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`

---

### Step 5.2: Configure Environment Variables in Vercel

Add the following environment variables:

| Variable Name | Value | Description |
| :--- | :--- | :--- |
| `VITE_API_URL` | `https://restaurantos-backend.onrender.com` | Live backend URL from Render |
| `VITE_GOOGLE_CLIENT_ID` | `your_client_id.apps.googleusercontent.com` | Optional: Google OAuth |

---

### Step 5.3: Verify Single Page App Routing

The project includes `vercel.json` in the root directory:
```json
{
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```
This ensures direct URLs (e.g., `/customer/menu`, `/admin/tables`, `/kitchen/live-orders`) route properly to the SPA without 404 errors.

Click **Deploy**.

---

## 6. Aligning Cross-Origin Cookies & CORS

In production with separate frontend (`vercel.app`) and backend (`onrender.com`) domains:
1. Refresh tokens are transmitted in `restaurantos_refresh` cookies.
2. The backend configures:
   ```typescript
   SameSite=None; Secure; HttpOnly; Path=/
   ```
3. The frontend Axios client includes:
   ```typescript
   withCredentials: true
   ```
4. **Mandatory:** Ensure the exact deployed Vercel domain (e.g., `https://restaurantos.vercel.app`) is added to `FRONTEND_URL` in your Render backend settings so CORS and credentials authorization pass smoothly.

---

## 7. Post-Deployment Smoke Test

Perform the following smoke tests on the live deployment:

1. **API Ping:**
   ```bash
   curl -I https://restaurantos-backend.onrender.com/health
   # Expected: HTTP 200 OK
   ```

2. **Database Readiness:**
   ```bash
   curl https://restaurantos-backend.onrender.com/ready
   # Expected: {"status":"ready","database":"ok"}
   ```

3. **Login Smoke Test:**
   - Open your live Vercel app.
   - Navigate to `/auth/login`.
   - Log in with `abc@gmail.com` / `password123`.
   - Verify redirection to `/workspace` or `/admin/dashboard`.

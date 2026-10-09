# 📖 QuickTable (by tsubasa digital) - User Manual & Practical Guide
### "How to Use It & What to Do" Step-by-Step Walkthrough

Welcome to **QuickTable**! This hands-on guide explains exactly what to do from the moment you open the application, how to test the complete restaurant lifecycle, and how to operate each feature across all user roles.

---

## 🚀 Quick Start: Your First 60 Seconds

### 1. Launch the Application
Open your terminal in the project directory and run:
```bash
npm run dev:all
```
Then open your web browser to:
👉 **[http://localhost:5173](http://localhost:5173)**

---

### 2. The Demo Accounts (Login Cheat Sheet)

All demo accounts use the same simple password: **`password123`**

| Persona | Email | What This User Does | Where They Land |
| :--- | :--- | :--- | :--- |
| **Customer** | `tejash@gmail.co` | Browse menu, order food, scan table QR, track orders | `/customer/home` |
| **Kitchen Chef** | `mahesh@gmail.com` | View live orders, cook food, start prep timers | `/kitchen/dashboard` |
| **Cashier** | `asd@gmail.com` | POS desk, collect cash/card/UPI, print invoices | `/cashier/dashboard` |
| **Manager** | `rajesh@gmail.com` | Edit menu, generate table QRs, manage staff & stock | `/admin/dashboard` |
| **Owner** | `owner@example.com` *(or create)* | Revenue charts, expense tracking, net profit | `/owner/dashboard` |
| **Platform Admin** | `abc@gmail.com` | Onboard restaurants, manage SaaS branches & plans | `/workspace` |

> [!TIP]
> **Switching Users Easily:** Click the profile icon in the top-right corner ➔ **Logout** ➔ sign in with any of the accounts above!

---

## 🎯 Tutorial 1: The Complete End-to-End Order Flow

Follow these 4 steps to experience the complete real-time lifecycle of an order:

```
[ Step 1: Customer Orders ] ➔ [ Step 2: Chef Cooks ] ➔ [ Step 3: Cashier Bills ] ➔ [ Step 4: Tracking & Review ]
```

### Step 1: Place an Order as a Customer
1. Log in with **`tejash@gmail.co`** / **`password123`** (or browse as a guest).
2. Go to **Explore Menu** (`/customer/menu`).
3. Click on **Margherita Pizza** or **Classic Burger**.
4. In the Food Details page:
   - Select quantity: `2`.
   - Add special cooking instructions: *"Extra crispy crust, please."*
   - Click **Add to Cart**.
5. Click the **Cart** icon in the navbar (`/customer/cart`).
6. Apply coupon code: **`SAVE10`** (gives a flat discount!).
7. Click **Proceed to Checkout** (`/customer/checkout`).
8. Select **Dine-In** and pick **Table 1** (or choose Takeaway).
9. Click **Place Order**.
10. **Result:** You will be redirected to the **Live Order Tracking** screen (`/customer/order-tracking/:orderId`). Keep this browser tab open!

---

### Step 2: Cook the Food in the Kitchen (KDS)
1. Open a **new browser window** (or incognito tab) at [http://localhost:5173/auth/login](http://localhost:5173/auth/login).
2. Log in as the Kitchen Chef: **`mahesh@gmail.com`** / **`password123`**.
3. You will land on the **Kitchen Display System** (`/kitchen/live-orders`).
4. Notice your customer's order is sitting in the **Pending Orders** queue with table number and instructions!
5. Click **Accept & Start Preparing**:
   - A live cooking timer starts ticking.
   - The ticket moves to the **Preparing** column.
   - Look back at your customer tab: the status badge automatically changed to **"Preparing in Kitchen"** in real time without refreshing!
6. When done cooking, click **Mark Ready**:
   - The ticket moves to **Ready for Pickup / Serving**.
   - Customer screen updates to **"Food is Ready"**!

---

### Step 3: Settle the Bill at the Cashier POS
1. Log in as the Cashier: **`asd@gmail.com`** / **`password123`**.
2. Go to **Billing** (`/cashier/billing`).
3. You will see Table 1 listed with the active order. Click on it.
4. Review the itemized charges, applied discount (`SAVE10`), and tax.
5. Select the payment method:
   - **Cash:** Enter amount given (e.g. ₹500); the system displays exact change to return.
   - **Card / UPI:** Enter the payment reference ID.
6. Click **Generate Invoice / Settle Bill**:
   - The invoice is created (`/cashier/invoices`).
   - You can click **Print Receipt** for a thermal printer layout or export a clean PDF.
   - Table 1 status automatically updates to **Cleaning / Available**.

---

### Step 4: Customer Review & Feedback
1. Back on the customer tab, the order shows **Completed**.
2. Go to **Feedback** (`/customer/feedback`) or click on the menu item.
3. Give it **5 Stars** ⭐⭐⭐⭐⭐ and leave a review: *"Best pizza in town!"*.
4. Click **Submit Review** — the rating is instantly aggregated into the dish's score!

---

## 🛠️ Tutorial 2: What to Do as a Restaurant Manager

Log in with: **`rajesh@gmail.com`** / **`password123`**

### 1. How to Add a New Dish to the Menu
1. Go to **Admin Panel** ➔ **Menu Management** (`/admin/menu`).
2. Click **+ Add Menu Item** in the top right.
3. Fill in:
   - **Title:** e.g., *"Paneer Tikka Sizzler"*
   - **Category:** Pick *"Appetizers"* or *"Main Course"*
   - **Price:** e.g., `299` (and optional discount price `249`)
   - **Preparation Time:** e.g., `20 mins`
   - **Image:** Paste any image URL or leave default.
   - **Tags:** e.g., `vegetarian, spicy, popular`
4. Click **Save Item**. It is now immediately live on the customer menu!

### 2. How to Mark an Item "Out of Stock"
1. In `/admin/menu`, locate the dish (e.g., *Grilled Salmon*).
2. Toggle the **Available** switch to `OFF`.
3. Customers can no longer add that item to their cart until toggled back on.

### 3. How to Generate & Print Table QR Codes
1. Go to **Tables Management** (`/admin/tables`).
2. You will see a grid of all restaurant tables and their current status (Available, Occupied, Reserved).
3. Click on any table (e.g. **Table 3**) ➔ click **Generate QR Code**.
4. The system produces a scannable QR code linking to `/scan/table/:token`.
5. Click **Download QR** or **Print Standee** to place on physical restaurant tables!

### 4. How to Manage Inventory & Stock
1. Go to **Inventory** (`/admin/inventory`).
2. Review stock items (Flour, Cheese, Tomato Sauce, Olive Oil, Coffee Beans).
3. Items below their minimum threshold are highlighted with an orange/red alert badge.
4. Click **Restock** ➔ enter received quantity from supplier ➔ **Save**.

### 5. How to Manage Staff & Shifts
1. Go to **Employees** (`/admin/employees`).
2. View active staff, their designated roles, and scheduled shifts:
   - Morning (8:00 AM - 4:00 PM)
   - Afternoon (12:00 PM - 8:00 PM)
   - Evening (4:00 PM - 12:00 AM)
3. Click **+ Add Employee** to register new team members.

---

## 💼 Tutorial 3: What to Do as a Restaurant Owner

Log in with: **`owner@example.com`** (or create an Owner account)

### 1. View Revenue & Net Profits
1. Go to **Owner Dashboard** (`/owner/dashboard`).
2. View high-level executive cards:
   - **Total Net Revenue**
   - **Operating Expenses**
   - **Net Profit Margin**
   - **Average Order Value (AOV)**
3. Navigate to **Revenue Analytics** (`/owner/revenue`) to view daily/weekly bar charts and identify peak revenue hours (Lunch rush vs. Dinner rush).

### 2. Log Operating Expenses
1. Go to **Expenses** (`/owner/expenses`).
2. Click **+ Add Expense**.
3. Enter category (Raw Ingredients, Utilities, Staff Wages, Equipment Maintenance) and amount.
4. Profit margin charts update automatically to show true EBITDA.

### 3. View & Manage SaaS Subscription
1. Go to **Subscription** (`/owner/subscription`).
2. Check your restaurant's current plan (e.g., *Pro Plan*), active period, and renewal date.
3. Compare features across Basic, Pro, and Enterprise tiers.

---

## 🌐 Tutorial 4: What to Do as Platform Superadmin (SaaS)

Log in with: **`abc@gmail.com`** / **`password123`**

### 1. Onboard a New Restaurant
1. Navigate to **SaaS Workspace** (`/workspace`).
2. Click **+ Add Restaurant**.
3. Enter the restaurant name (e.g., *"Spice Symphony"*), slug, and address.
4. Click **Create Restaurant**.

### 2. Add Branches / Outlets
1. Select a restaurant from your workspace.
2. Under **Branches**, click **+ Add Branch**.
3. Enter Branch Name (e.g., *"Express Counter - Mall L2"*), street address, and contact info.
4. The system geocodes the address for delivery radius mapping.

### 3. Manage Subscription Plans
1. Go to `/workspace/subscriptions`.
2. Define pricing, billing cycles (Monthly / Annual), and feature entitlements.
3. Activate, suspend, or extend subscriptions for any tenant restaurant.

---

## 🎨 Personalization: Dark Mode & Branch Switching

### How to Toggle Dark / Light Mode
- Look at the top navigation bar.
- Click the **Sun / Moon icon** ☀️ / 🌙.
- The interface immediately switches themes with smooth contrast adjustments. Your choice is saved in your browser.

### How to Switch Branches / Outlets
- Click the **Branch Selector** in the navbar (e.g. *"Yogi Res (Bardoli)"* or *"Downtown Main"*).
- A modal opens showing all available locations with distances.
- Click **Select Branch** — the menu, tables, and orders instantly switch to that physical outlet!

---

## ❓ Frequently Asked Questions (FAQ)

### Q: How do I test table QR scanning on my mobile phone?
1. Find your computer's local Wi-Fi IP address (e.g. `192.168.1.15`).
2. In `backend/.env`, ensure `FRONTEND_URL` includes your mobile IP.
3. Open `http://<your-ip>:5173` on your smartphone browser.
4. Scan the table QR displayed on your computer screen!

### Q: Why do I see a 403 Forbidden page?
- You are trying to access a page that your current role does not have permission to view (e.g., a Customer trying to open `/kitchen/live-orders`).
- **Solution:** Click **Go Back** or log out and log in with an authorized account (Chef, Cashier, Manager, or Admin).

### Q: What if an order is placed but doesn't appear in the kitchen?
- Check that your Kitchen tab is set to the same branch as the order.
- Verify WebSocket connectivity by checking if the green status indicator in the app header is active.
- Refreshing the `/kitchen/live-orders` page will also pull all active orders via REST fallback.

### Q: How do I reset all data to a clean initial state?
- In your terminal:
  ```bash
  # Delete or drop the database in mongosh:
  mongosh restaurantos --eval "db.dropDatabase()"
  
  # Restart the backend:
  npm run dev:backend
  ```
- The backend will automatically re-seed fresh demo data upon startup!

---

## 📞 Need Help?
- Refer to [**docs/API_DOCUMENTATION.md**](file:///f:/tejash/yogi/docs/API_DOCUMENTATION.md) for endpoint details.
- Refer to [**docs/SETUP_GUIDE.md**](file:///f:/tejash/yogi/docs/SETUP_GUIDE.md) for environment issues.
- Refer to [**docs/ARCHITECTURE.md**](file:///f:/tejash/yogi/docs/ARCHITECTURE.md) for system design.

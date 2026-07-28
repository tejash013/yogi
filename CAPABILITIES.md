# RestaurantOS - What You Can Do

## 👤 Customer Portal

### Browse & Order
- **Explore Menu** - Browse categorized food items with images, prices, and descriptions
- **Food Details** - View detailed info including ingredients, allergens, nutritional facts, and prep time
- **Search & Filter** - Search for dishes and filter by category
- **Favorites** - Save your favorite dishes for quick ordering
- **Cart Management** - Add/remove items, update quantities, add special instructions

### Place Orders
- **Checkout** - Choose delivery type (dine-in, takeaway, delivery)
- **Apply Coupons** - Use discount codes at checkout
- **Order Tracking** - Track your order status in real-time (pending → confirmed → preparing → ready → completed)
- **My Orders** - View your complete order history

### Account & Rewards
- **Profile Management** - Update personal details and preferences
- **Rewards Program** - Earn and redeem reward points
- **Coupons & Offers** - Browse available deals and discounts
- **Feedback** - Rate dishes and leave reviews

---

## 🔧 Admin Panel

### Dashboard & Analytics
- **Dashboard Overview** - View key metrics (total orders, revenue, customers, active tables)
- **Real-time Stats** - See order counts, revenue trends, and customer activity

### Menu Management
- **CRUD Operations** - Create, read, update, and delete menu items
- **Category Management** - Organize items into categories with sort ordering
- **Availability Control** - Toggle item availability (in stock / out of stock)
- **Popular & Recommended** - Mark items as popular or recommended
- **Media Management** - Upload and manage item images

### Order Management
- **View All Orders** - See all orders with status, payment info, and customer details
- **Update Status** - Change order status (confirm, mark as preparing, ready, completed)
- **Filter & Search** - Find orders by status, date, customer, or order number
- **Order Details** - View complete order breakdown with items, quantities, and pricing

### Customer Management
- **Customer List** - View all registered customers
- **Order History** - See individual customer order history
- **Contact Info** - Access customer contact details

### Employee Management
- **Staff Directory** - View all employees with roles and shifts
- **Role Assignment** - Assign roles (admin, kitchen, cashier, etc.)
- **Shift Management** - Manage work shifts (morning, afternoon, evening, night)
- **Salary Tracking** - Track employee salaries and joining dates

### Table Management
- **Table Grid** - Visual layout of all restaurant tables
- **Status Tracking** - Monitor table status (available, occupied, reserved, maintenance)
- **Capacity Management** - View and manage table capacities
- **QR Code** - Generate QR codes for tables

### Inventory Management
- **Stock Tracking** - Monitor ingredient and supply stock levels
- **Min/Max Levels** - Set minimum and maximum stock thresholds
- **Supplier Management** - Track supplier information
- **Expiry Tracking** - Monitor expiry dates for perishable items
- **Restock Alerts** - Get notifications when stock runs low

### Reports & Analytics
- **Sales Reports** - Generate sales reports with date ranges
- **Top Selling Items** - View most popular dishes
- **Revenue Analytics** - Track revenue over time
- **Expense Reports** - Monitor restaurant expenses

### Settings
- **General Settings** - Configure restaurant name, currency, tax rates
- **User Management** - Manage admin users and permissions
- **System Configuration** - Configure app-wide settings

---

## 👨‍🍳 Kitchen Dashboard

### Live Order Feed
- **Real-time Updates** - See new orders as they come in
- **Order Queue** - View pending orders sorted by time
- **Order Prioritization** - See which orders need immediate attention

### Order Preparation
- **Preparing View** - Orders currently being prepared with timer
- **Ready View** - Completed items waiting for pickup
- **Completed View** - Orders that have been served

### Status Management
- **Accept Orders** - Move orders from confirmed to preparing
- **Mark Ready** - Notify when food is ready for serving
- **Complete Orders** - Mark orders as completed

---

## 💰 Cashier Module

### Billing
- **Create Bills** - Generate bills for dine-in and takeaway orders
- **Itemized Billing** - Add items with quantities and special instructions
- **Discount Application** - Apply coupons and discounts
- **Tax Calculation** - Automatic tax calculation

### Payment Processing
- **Multiple Payment Methods** - Accept cash, card, UPI, wallet, and online payments
- **Payment Tracking** - Track payment status (paid, unpaid, refunded, partially paid)
- **Split Payments** - Support for split payment scenarios

### Invoice Management
- **Generate Invoices** - Create professional invoices for orders
- **Invoice History** - View and search past invoices
- **Print/Export** - Print invoices or export as PDF

---

## 🏢 Owner Dashboard

### Business Analytics
- **Revenue Dashboard** - Total revenue with visual charts
- **Expense Tracking** - Monitor all business expenses
- **Profit Analysis** - View profit margins and trends
- **Sales Analytics** - Deep dive into sales performance

### Advanced Reports
- **Custom Date Ranges** - Generate reports for any time period
- **Comparative Analysis** - Compare performance across periods
- **Export Reports** - Download reports for external analysis

---

## 🎨 UI/UX Features

### Design System
- **Responsive Design** - Works on desktop, tablet, and mobile
- **Dark/Light Mode** - Toggle between dark and light themes
- **Tailwind CSS** - Modern utility-first styling
- **Custom Theme** - Orange primary + green secondary color scheme

### UI Components
- **Buttons** - Multiple variants (primary, secondary, outline, ghost, danger) and sizes
- **Forms** - Input, Textarea, Select, Checkbox, Radio with validation
- **Cards** - Flexible card layouts with optional hover effects
- **Modals** - Accessible modal dialogs with keyboard support
- **Tables** - Sortable, customizable data tables
- **Badges** - Status indicators with color variants
- **Avatars** - Image or initial-based user avatars
- **Pagination** - Page navigation for large datasets
- **Search** - Search inputs with clear buttons
- **Breadcrumbs** - Navigation breadcrumb trails
- **Loading States** - Spinners, dots, and pulse loaders
- **Toasts** - Non-intrusive notification popups
- **Empty States** - Friendly empty state placeholders

### Navigation
- **Navbar** - Sticky top navigation with mobile hamburger menu
- **Sidebar** - Collapsible sidebar with nested menu items
- **Protected Routes** - Role-based access control
- **Auth Pages** - Login, Register, Forgot Password, OTP Verification

---

## 🔐 Security & Authentication

- **JWT Authentication** - Token-based auth with refresh tokens
- **Role-Based Access** - 5 roles: Customer, Admin, Kitchen, Cashier, Owner
- **Protected Routes** - Unauthorized users redirected to login
- **403 Forbidden** - Users without proper role see access denied page

---

## 🛠 Technical Stack

- **Frontend:** React 19 + TypeScript
- **Build Tool:** Vite 8
- **Styling:** Tailwind CSS 4
- **Routing:** React Router 7
- **State Management:** Zustand
- **HTTP Client:** Axios
- **Forms:** React Hook Form + Zod
- **Icons:** React Icons

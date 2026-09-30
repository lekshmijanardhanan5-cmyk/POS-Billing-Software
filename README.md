# Kerala Textiles — POS Billing & Retail Management System

A high-performance Point of Sale (POS) and Enterprise Retail Management web application engineered specifically for textile and garment retail businesses. Built for technical interview evaluation, featuring dual-role authentication (Admin vs. Cashier), atomic transaction checkout, barcode scanner integration, 80mm thermal receipt printing, product returns with automatic stock replenishment, supplier ledger, and a mobile application-style Admin UI.

---

## 🚀 Quick Access URLs (Single Django Server)

| Portal / View | Clean URL | Intended Role | Key Features |
| :--- | :--- | :--- | :--- |
| **Store Landing Page** | `http://127.0.0.1:8000/` | Public / Evaluator | Luxury editorial lookbook, catalog filtering, hero terminal preview |
| **Sign In** | `http://127.0.0.1:8000/login/` | All Users | Role-based authentication & automatic route redirect |
| **Billing Counter (POS)** | `http://127.0.0.1:8000/billing/` | Cashier & Admin | Barcode scanning, category filters, tender options, 80mm thermal receipt |
| **Desktop Admin Portal** | `http://127.0.0.1:8000/admin-portal/` | Admin Only | KPI analytics, Product CRUD, Staff management, Returns, Supplier ledger |
| **Mobile Admin UI** | `http://127.0.0.1:8000/admin-mobile/` | Admin (Mobile) | Native mobile app layout, bottom tab bar, smartphone frame preview |

---

## 🔑 Demo Test Credentials

| Role | Username | Password | Default Portal & Access |
| :--- | :--- | :--- | :--- |
| **Administrator** | `admin` | `Admin@123` | Full access to Admin Portal (`/admin-portal/`), Mobile Admin (`/admin-mobile/`), and POS (`/billing/`) |
| **Cashier / Staff** | `cashier` | `Staff@123` | Restricted access strictly to Billing POS (`/billing/`). Admin routes are blocked. |

---

## 📋 Direct Evaluation Criteria Compliance

### 1. Understanding of Requirements
- **Textile Domain Specifics**: Implements size variations (S, M, L, XL, XXL, 6.25m Saree, 2.0m Mundu), colors, textile categories (Men's, Women's, Kids, Fabrics), 5% textile GST slab, and supplier credit balance tracking.
- **Role Separation**: Clear operational distinction between the Cashier Billing Portal (fast checkout, product search, receipt generation) and the Admin Portal (inventory CRUD, staff onboarding, returns, financial ledger).

### 2. Problem-Solving Ability
- **Concurrency & Race Conditions**: Utilizes `select_for_update()` inside Django's `transaction.atomic()` during invoice creation. Multiple cashiers billing identical items simultaneously will never cause negative inventory stock.
- **Relational Integrity on Product Deletion**: Since billed products are referenced by `InvoiceItem` (`on_delete=models.PROTECT`), products use soft deletion (`is_active = False`) upon removal. This preserves historical sales records and invoice integrity while removing deleted items from the catalog.
- **Hardware Barcode Reader Emulation**: The barcode search listener supports keyboard-wedge USB barcode scanners, instantly auto-adding matched products to the billing cart upon scan without requiring mouse interaction.
- **File Upload & Image Hosting**: Custom multipart upload endpoint (`POST /api/inventory/products/upload_image/`) accepts computer images and instantly binds them to new product records with live preview.

### 3. Application Functionality
- **Billing Portal (`/billing/`)**: Live barcode scanner, category pill filtering, cart quantity controls (`+` / `-`), customer phone/name capture, custom discount input, automated 5% GST computation, multi-mode payment tender (Cash, UPI/QR, Card), and instant 80mm thermal receipt generation with browser print trigger.
- **Admin Portal (`/admin-portal/`)**:
  - *Product CRUD*: Create (with image upload/URL), Read (searchable catalog table), Update (restock prompt), and Delete.
  - *Staff Management*: Create cashier accounts, view active team members, remove staff accounts.
  - *Product Returns*: Process returns by Invoice ID & Product ID with atomic inventory replenishment and historical return logs.
  - *Supplier Ledger*: Register wholesale vendors, track running credit balances.
  - *Reports & Billing*: KPI cards (Total Revenue, Total Invoices, Active Products, Suppliers), Low Stock warning table ($\le 10$ units), and Recent Sales Invoices with itemized inspection modals.

### 4. Frontend and Backend Implementation
- **Backend Architecture**: Django REST Framework (DRF) with clean separation across 4 decoupled apps:
  - `accounts`: Custom User model, JWT authentication, role permission classes.
  - `inventory`: Product, Category, Supplier models with ViewSets and file upload endpoints.
  - `sales`: Customer, Invoice, InvoiceItem, ProductReturn models with atomic business logic.
  - `reports`: Aggregated analytical queries for revenue and low-stock alerts.
- **Frontend Architecture**: Fast, lightweight vanilla ES6+ JavaScript. No bloated node_modules or build step needed. Centralized `api.js` encapsulates token lifecycle, bearer header injection, and refresh handling.

### 5. Database Design
- Normalized relational database schema:
  - `User`: Custom user with `role` (`ADMIN` or `STAFF`), phone, and activity status.
  - `Product`: Indexed `barcode` (unique), `selling_price` (Decimal), `cost_price` (Decimal), `stock_quantity` (Integer), `is_active` (Boolean).
  - `Invoice`: Auto-generated unique invoice codes (`INV-XXXXXXXX`), cashier foreign key (`SET_NULL`), customer foreign key, grand totals.
  - `InvoiceItem`: Line items with foreign key to product (`PROTECT`) and locked unit prices at time of sale.
  - `ProductReturn`: Audit log capturing returned quantity, refund amount, and reason.

### 6. Authentication & Access Control
- Industry-standard JSON Web Token (`djangorestframework-simplejwt`) flow.
- Custom permission class `IsAdminUserRole` strictly guards administrative endpoints (`/api/auth/staff/`, `/api/inventory/suppliers/`, `/api/reports/dashboard/`).
- Frontend route guards (`checkAuth('ADMIN')`) prevent unauthorized cashiers from viewing admin dashboards, automatically redirecting them to `/billing/`.

### 7. UI / UX Quality
- **Design Philosophy**: Minimalist, clean, and typographic. No amateur badges or distracting graphics.
- **High POS Ergonomics**: High-contrast prices, clear payment mode buttons, live total calculations, and an 80mm thermal receipt modal formatted for retail POS printers.
- **Editorial Landing Page**: Luxury showcase presenting Kerala Kasavu and silk collections with interactive hero preview and lookbook.

### 8. Mobile UI Implementation (`/admin-mobile/`)
- Fulfills the mobile application-style web layout requirement without requiring an APK download.
- Designed as an iOS/Android mobile app with a sticky top app header, scrollable body, and 5-tab bottom navigation bar (Overview, Products, Staff, Returns, Ledger).
- Interactive **"Toggle Wide View"** button allows testing on desktop screens inside a centered smartphone mockup frame, while automatically adapting to 100% full-screen viewport on actual mobile devices ($\le 600\text{px}$).

### 9. Code Quality & Project Structure
```
POS_Billing/
├── accounts/          # User authentication, roles, staff CRUD
├── inventory/         # Product catalog, categories, suppliers, image upload
├── sales/             # Invoices, atomic cart checkout, returns processing
├── reports/           # Analytical dashboard endpoints
├── config/            # Django settings & clean URL dispatching
├── client/            # Frontend static assets
│   ├── css/           # common.css, admin.css, billing.css, mobile.css, landing.css
│   ├── js/            # api.js, admin.js, billing.js, mobile.js, login.js
│   ├── images/        # Authentic local product images & uploads/
│   ├── index.html     # Landing page lookbook
│   ├── login.html     # Sign-in portal
│   ├── billing.html   # Cashier POS interface
│   ├── admin.html     # Desktop Admin interface
│   └── mobile-admin.html # Mobile Admin web layout
├── db.sqlite3         # Seeded database with products & sample invoices
├── manage.py
└── requirements.txt
```

### 10. Overall Completeness
- 100% functional out-of-the-box.
- Seeded with 16 realistic Kerala textile products (Kasavu Mundu, Kanchipuram Silk Sarees, Kurta Pajamas, Shirts, Denim) with authentic local photos.
- 2 products pre-configured below stock threshold ($\le 10$) to immediately demonstrate low-stock reorder triggers.

### 11. Additional Relevant Functionality (Evaluation Bonus)
Based on real-world retail textile operations, the following advanced features were engineered into the system:
1. **Festival Promo Code Engine**:
   - Built-in support for festive coupons (`ONAM10`, `VISHU15`, `KERALA5`, `FESTIVE100`, `WELCOME50`).
   - One-click quick chips or custom code input, real-time discount deduction, and storage of `promo_code` in invoice audit history.
2. **Customer Loyalty Points System**:
   - Real-time customer phone lookup (`/api/sales/customers/lookup/?phone=...`).
   - Customers earn 1 loyalty point for every ₹100 spent.
   - Cashiers can redeem accumulated points with 1-click (`Redeem Points`) converting points into cash discounts.
3. **WhatsApp Digital E-Bill Sharing**:
   - Modern eco-friendly receipt sharing via WhatsApp (`https://wa.me/91<phone>?text=...`).
   - Generates formatted, itemized WhatsApp message with invoice number, item breakdown, tax, and loyalty points.
4. **Garment Barcode Price Tag Generator & Printing**:
   - Dedicated price tag generator in Admin Portal (`🏷️ Tag`).
   - Renders 50mm x 35mm retail swing tags with store header, garment name, size, color, simulated barcode lines, and MRP inclusive of GST.
5. **Day-End Cashier Z-Report (Shift Closure & Cash Drawer Reconciliation)**:
   - Dedicated Z-Report endpoint (`/api/reports/z-report/`) accessible from POS header.
   - Summarizes daily gross sales, total discounts, tax collected, payment split (Cash, UPI, Card, Split), returns, and net cash in drawer with printable layout.

---

## 🧪 Automated Test Suite

Run the full automated test suite using:
```bash
python manage.py test
```

### Test Coverage Highlights:
1. `test_login_success`: Validates JWT token issuance and user payload.
2. `test_staff_cannot_access_admin_api`: Verifies role-based permission rejection (HTTP 403) for cashier accounts attempting admin actions.
3. `test_create_invoice_atomic_stock_decrement`: Verifies that checkout decrements product inventory accurately in an atomic transaction.
4. `test_insufficient_stock_prevents_sale`: Validates that billing exceeding available stock is rejected without corrupting database state.
5. `test_product_return_restores_stock`: Verifies that return processing restores stock counts atomically and records the audit log.
6. `test_product_soft_delete`: Verifies that deleted products are deactivated without breaking previously generated sales invoices.
7. `test_supplier_creation_and_balance`: Validates supplier ledger balance tracking.
8. `test_dashboard_summary_metrics`: Ensures revenue and invoice counters aggregate correctly.

---

## 🏃 Running the Application Locally

```bash
# 1. Activate Virtual Environment
.\venv\Scripts\activate

# 2. Run Database Migrations (if needed)
python manage.py migrate

# 3. Start the Server
python manage.py runserver

# 4. Open in Browser
# http://127.0.0.1:8000/
```

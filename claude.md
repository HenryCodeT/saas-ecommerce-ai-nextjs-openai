# 📘 SaaS E-commerce AI – Full Functionality, Flow & Technology

---

## 1️⃣ Actors and Roles

| Role               | Access / Main Functionality                                                                                                   |
| ------------------ | ----------------------------------------------------------------------------------------------------------------------------- |
| **Admin**          | Global dashboard: metrics, token usage, list of stores and users, plan status. Read-only access to stores/users.              |
| **Client / Store** | Own dashboard: CRUD products, list of end users and their purchases, update store info.                                       |
| **End User**       | Public store page: view products, AI chat about products and store, cart, simulate purchase. Registration only via store URL. |

> Registration is only possible via the store URL.

---

## 2️⃣ General System Flow

```
Start → Login/Register
       │
       ├── Admin → /admin-dashboard
       │     ├── View metrics (Tokens, Users, Plans)
       │     └── Read-only / Simulation of management
       │
       ├── Client → /store-dashboard/{store-name}
       │     ├── CRUD Products
       │     ├── View End Users and Purchase History
       │     ├── Update Store Info
       │     └── Log activity in ActivityLogs (only purchases)
       │
       └── End User → /store/{store-name}
             ├── View Products
             ├── Add Products to Cart
             ├── Simulate Purchase → This is not a real transaction; the purchase is only a simulation.
             ├── AI Chat about Products and Store → Each user can see only the products and store information of the store where they are registered.
             └── Registration only via URL
```

---

## 3️⃣ Feature Flows and Components

### 🔹 Phase 1: Authentication

**Flow:**

1. User accesses `/login` or `/register`.
2. Form sends data to `useAuth()` hook.
3. Hook calls `authService`:

   * `login(email, password)` → Supabase Auth + Prisma
   * `register(userData)` → Supabase Auth + Prisma create User + Store
4. Redirection according to role:

   * Admin → `/admin-dashboard`
   * Client → `/store-dashboard/{store-name}`
   * User → `/store/{store-name}`

**Components involved:**

* `LoginForm`, `RegisterForm`, `AuthLayout`
* Hook: `useAuth()`
* Service: `authService.ts`

---

### 🔹 Phase 2: Admin Dashboard

**Flow:**

1. Admin opens `/admin-dashboard`.
2. `AdminLayout` displays sidebar + header + content.
3. `MetricsCards` and `TokenUsageTable` use `adminService` to fetch:

   * Token usage per store
   * Number of users
   * Plan status
4. Everything is read-only. Only **purchases are logged** in `ActivityLogs`.

**Components involved:**

* `AdminLayout`, `MetricsCards`, `TokenUsageTable`
* Optional hook: `useAdmin()`
* Service: `adminService.ts`

---

### 🔹 Phase 3: Store Dashboard (Client)

**Flow:**

1. Client opens `/store-dashboard/{store-name}`.
2. `StoreDashboardLayout` with sidebar and content area.
3. CRUD Products:

   * Create, edit, delete products (`storeService`)
   * Product list (`ProductTable` + `ProductCard`)
4. End Users:

   * `storeService.getStoreUsers()` → list users + purchases
5. Store Info:

   * `StoreForm` to update logo, description, hours, category
6. Log all relevant actions in `ActivityLogs` (only purchases).

**Components involved:**

* Layout: `StoreDashboardLayout`
* Organisms: `ProductTable`
* Molecules: `ProductCard`, `StoreForm`
* Hooks: `useProducts()`, `useStore()`
* Service: `storeService.ts`

---

### 🔹 Phase 4: Store Page (End User)

**Flow:**

1. User accesses `/store/{store-name}`.
2. Layout: `StorePageLayout`
3. Product display:

   * `ProductList` → list of `ProductCard`
4. Shopping Cart:

   * `CartList` + `CartItem`
   * Hook `useCart()` → add/remove products, calculate total
5. Purchase simulation:

   * `PurchaseSummary` → confirm purchase
   * Service `purchaseService.ts` → log in `BillingHistory` + `ActivityLogs`
   * **No real charge occurs; all transactions are fictitious.**
6. AI Chat:

   * `ChatBox` → list `ChatMessage` + `ChatInput`
   * Hook `useChat()` → calls `chatService.ts` (OpenAI)
   * **Each user can see only the products and store information of the store where they are registered.**

**Components involved:**

* Templates: `StorePageLayout`
* Organisms: `ProductList`, `CartList`, `ChatBox`
* Molecules: `ProductCard`, `CartItem`, `PurchaseSummary`
* Atoms: `ChatInput`, `ChatMessage`
* Hooks: `useProducts()`, `useCart()`, `useChat()`
* Services: `userService.ts`, `chatService.ts`, `purchaseService.ts`

---

## 4️⃣ Database and Information Flow

| Table             | Role in Flow                                         |
| ----------------- | ---------------------------------------------------- |
| Users             | Authentication, roles, relation to store, AI queries |
| Stores            | Store info, products, end users                      |
| Products          | CRUD products, queries for AI chat                   |
| TokenUsage        | Metrics per store and user                           |
| AIQueries         | Records AI chat Q&A                                  |
| BillingHistory    | Simulated end-user purchases                         |
| ActivityLogs      | Audit of purchases and critical actions              |
| SubscriptionPlans | Client plans (simulated)                             |
| RolesPermissions  | Permissions per module and role                      |

**Summary of data flow:**

1. User/Client/Admin performs action → Hook → Service → Prisma → Supabase DB
2. Result → Hook → Component → UI
3. Purchases → ActivityLogs

---

## 5️⃣ General Integration Flow

```
User/Admin/Client
      │
      ├─> UI Interaction (Button, FormField, ProductCard)
      │
      ├─> Hook (useAuth, useProducts, useCart, useChat)
      │
      ├─> Service (authService, storeService, userService, chatService, purchaseService)
      │
      ├─> Prisma/Supabase → DB (Users, Stores, Products, AIQueries, BillingHistory, TokenUsage, ActivityLogs)
      │
      └─> Return to Hook → Update Components → UI
```

---

# 📘 Technology Scheme – SaaS E-commerce AI (Prisma + Supabase)

---

## 1️⃣ Technology Stack

| Layer                    | Technology / Tool                                         | Justification                                                                          |
| ------------------------ | --------------------------------------------------------- | -------------------------------------------------------------------------------------- |
| Frontend                 | Next.js + TypeScript                                      | SSR/SSG for SEO, dynamic routes per store, strong typing for security and scalability. |
| UI / Styling             | Tailwind CSS + shadcn/ui                                  | Reusable components, clean and fast design.                                            |
| Backend / API            | Next.js API Routes or Next.js App Router (Server Actions) | Business logic and endpoints for CRUD, AI, purchase simulation.                        |
| ORM / DB Access          | Prisma                                                    | Typed, secure access to Supabase PostgreSQL database.                                  |
| Authentication           | Supabase Auth (email/password)                            | User, role, and session management, secure and scalable.                               |
| Database                 | Supabase PostgreSQL                                       | Relational DB for products, stores, users, purchase history, tokens, and activity.     |
| AI / NLP                 | OpenAI SDK (GPT-4/5)                                      | Generate AI chat responses.                                                            |
| Storage                  | Supabase Storage                                          | Product images, store logos.                                                           |
| Payments / Subscriptions | Internal Simulation                                       | Shows a simple purchase flow; no real payment gateway integration.                     |

---

## 2️⃣ General Architecture

```
[Frontend: Next.js + shadcn/ui + Tailwind]
       |
       | --- API Requests (Next.js API Routes)
       |
[Backend: Next.js Server + Prisma]
   |-- Authentication → Supabase Auth
   |-- Relational DB → Supabase PostgreSQL (Prisma ORM)
       |-- Tables: Users, Stores, Products, TokenUsage, AIQueries, BillingHistory, ActivityLogs, SubscriptionPlans, RolesPermissions
   |-- Storage → Supabase Storage (images, logos)
   |-- AI Chat → OpenAI SDK
   |-- Purchase Simulation → internal logic without gateway
   |-- Auditing → ActivityLogs in PostgreSQL
```

---

## 3️⃣ AI Chat Flow (End Users)

1. User sends a message from `/store/{store-name}`.
2. Backend checks permissions and token limits.
3. Backend fetches product data from Supabase PostgreSQL using Prisma.
4. Calls OpenAI SDK to generate the final response.
5. Response sent to frontend and logged in `AIQueries`.
   **Note:** Users can only see products and store info of the store where they are registered.

---

## 4️⃣ Purchase Simulation

* Users can add products to the cart and confirm purchase.
* Backend logs purchase in `BillingHistory` (simulation).
* **No real charge occurs; all transactions are fictitious.**
* All relevant actions are logged in `ActivityLogs`.

---

## 5️⃣ Routes and Dashboards

| Role   | URL / Dashboard               | Main Functionality                                    |
| ------ | ----------------------------- | ----------------------------------------------------- |
| Admin  | /admin-dashboard              | Metrics, token usage, plans, users/stores (read-only) |
| Client | /store-dashboard/{store-name} | CRUD products, list users, store info                 |
| User   | /store/{store-name}           | View products, AI chat, cart, purchase simulation     |

---

## 6️⃣ Database Tables (Supabase PostgreSQL + Prisma)

* **Users:** id, name, email, password_hash, role, status, store_id
* **Stores:** id, client_user_id, store_name, url, logo_url, city, description, status
* **Products:** id, store_id, name, description, price, stock, sku, images (JSON), tags (JSON)
* **TokenUsage:** id, store_id, user_id, tokens_used, created_at
* **AIQueries:** id, user_id, product_id, question, answer, created_at
* **SubscriptionPlans:** id, client_user_id, plan_name, monthly_limit, status, start_date, end_date
* **BillingHistory:** id, client_user_id, invoice_number, amount, status, created_at, due_date (simulation)
* **RolesPermissions:** id, role, module_name, can_create, can_read, can_update, can_delete
* **ActivityLogs:** id, user_id, action_type, target_id, timestamp (all purchases and critical actions logged)

---

## 7️⃣ Technical Considerations

* **Prisma** → typed ORM for secure and efficient DB access.
* **Next.js + TypeScript** → dynamic routes `/store/{store-name}`, SSR/SSG.
* **shadcn/ui + Tailwind** → UI consistency and reusable components.
* **OpenAI SDK** → GPT-4/5, contextual product responses.
* **Supabase Auth** → role support and automatic redirection by role.
* **Supabase Storage** → product images and logos.
* **Purchase Simulation** → cart flow and history logging without real gateway; no real payment.
* **ActivityLogs** → log purchases and all critical actions in DB for auditing.


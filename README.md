# SaaS E-commerce AI Platform

A complete multi-tenant SaaS e-commerce platform with AI-powered product chat, built with Next.js 14, TypeScript, Prisma, and Supabase.

## 🎯 Project Status: All Phases Complete

This implementation covers **all 4 phases** of the project as described in the CLAUDE.md specification:

### ✅ Phase 1: Authentication System

1. **Complete Authentication Flow**
   - Email/password login with NextAuth.js
   - User registration with role selection
   - Secure password hashing with bcryptjs
   - Session management with JWT tokens

2. **Role-Based Access Control**
   - **ADMIN**: Global dashboard access
   - **CLIENT**: Store owner with management capabilities
   - **END_USER**: Customer registered at a specific store via store URL

3. **Automatic Role-Based Redirection**
   - ADMIN → `/admin-dashboard`
   - CLIENT → `/store-dashboard/{store-name}`
   - END_USER → `/store/{store-name}`

### ✅ Phase 2: Admin Dashboard

1. **Global Metrics & Monitoring**
   - System-wide metrics cards (users, stores, plans)
   - Token usage tracking per store
   - User activity monitoring
   - Subscription plan status overview

2. **Administrative Features**
   - Read-only access to all stores and users
   - Token usage analytics and tables
   - Activity logs viewer
   - System health overview

### ✅ Phase 3: Store Dashboard (Client)

1. **Product Management (CRUD)**
   - Create, edit, and delete products
   - Product images and categorization
   - Stock and SKU management
   - Price and availability controls

2. **Store Configuration**
   - Update store information (name, description, hours)
   - Store logo management
   - Category and location settings
   - Store status controls

3. **Customer Management**
   - View all registered end users
   - Track customer purchase history
   - Monitor customer activity

### ✅ Phase 4: Store Page (End User)

1. **Product Browsing**
   - Public store page with product catalog
   - Product details and images
   - Search and filter capabilities
   - Real-time stock visibility

2. **Shopping Cart & Checkout**
   - Add/remove products from cart
   - Cart total calculation
   - Purchase simulation (no real payments)
   - Order history tracking

3. **AI-Powered Shopping Assistant**
   - **Vercel AI SDK** with structured tool calling (MCP)
   - Natural language product search and filtering
   - Interactive product recommendations with emojis
   - Context-aware responses about products and store
   - **Smart UI Filtering**: When AI searches products, the product grid below automatically filters to show matching items
   - Token usage tracking per query
   - Conversation history
   - **Scope**: Users can only see products and information from their registered store

   **AI Capabilities (via Tools)**:
   - `filterProducts` - Search products by name, brand, category, price range
   - `showProductDetails` - Get detailed product information
   - `addToCart` - Add items to cart via conversation
   - `removeFromCart` - Remove items from cart
   - `getCartSummary` - View cart contents

4. **Registration via Store URL**
   - End users can only register through `/store/{store-name}`
   - Automatic store association
   - Email-based authentication

## 🏗️ Technology Stack

- **Frontend**: Next.js 14 (App Router), TypeScript, React 18
- **Styling**: Tailwind CSS, shadcn/ui components
- **Authentication**: NextAuth.js v4
- **Database**: Supabase PostgreSQL
- **ORM**: Prisma
- **AI Integration**: Vercel AI SDK v5 + OpenAI (GPT-4o-mini)
- **AI Tools**: Model Context Protocol (MCP) for structured tool calling
- **Storage**: Supabase Storage (images, logos)
- **Password Security**: bcryptjs
- **Form Validation**: Zod
- **Date Handling**: date-fns

## 📁 Project Structure

```
saas-ecommerce-ai/
├── prisma/
│   └── schema.prisma          # Database schema
├── src/
│   ├── app/
│   │   ├── (auth)/
│   │   │   ├── login/         # Login page
│   │   │   └── register/      # Registration page
│   │   ├── admin-dashboard/   # Admin dashboard
│   │   ├── store-dashboard/   # Client dashboard
│   │   ├── store/             # End user store view
│   │   └── api/
│   │       ├── auth/          # Auth API routes
│   │       └── stores/        # Store API routes
│   ├── components/
│   │   ├── auth/              # Auth components
│   │   └── ui/                # shadcn/ui components
│   ├── hooks/
│   │   └── useAuth.ts         # Authentication hook
│   ├── services/
│   │   └── authService.ts     # Auth business logic
│   ├── lib/
│   │   ├── auth.ts            # NextAuth configuration
│   │   ├── prisma.ts          # Prisma client
│   │   └── supabase.ts        # Supabase client
│   └── types/
│       └── index.ts           # TypeScript types
├── .env.example               # Environment variables template
└── package.json
```

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ and npm/yarn
- A Supabase account (free tier works)
- Git

### Step 1: Clone and Install

```bash
# Clone the repository (or extract the files)
cd saas-ecommerce-ai

# Install dependencies
npm install
```

### Step 2: Set Up Supabase

1. Create a new project at [supabase.com](https://supabase.com)
2. Get your project credentials:
   - Go to Project Settings → API
   - Copy the Project URL and anon/public key
   - Copy the Service Role key (keep this secret!)
   - Copy the Database URL from Project Settings → Database

### Step 3: Configure Environment Variables

```bash
# Copy the example file
cp .env.example .env.local

# Edit .env.local with your actual values
```

Fill in the following values in `.env.local`:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your-supabase-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Database URL (from Supabase Database settings)
DATABASE_URL=postgresql://postgres:[PASSWORD]@[HOST]:[PORT]/postgres

# NextAuth Configuration
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=generate-this-with-openssl-rand-base64-32

# OpenAI Configuration (for AI Chat)
OPENAI_API_KEY=your-openai-api-key

# Node Environment
NODE_ENV=development
```

**Generate NEXTAUTH_SECRET:**
```bash
openssl rand -base64 32
```

**Get OpenAI API Key:**
1. Go to [platform.openai.com](https://platform.openai.com)
2. Create an account or sign in
3. Navigate to API Keys section
4. Create a new secret key

### Step 4: Set Up the Database

```bash
# Generate Prisma client
npm run prisma:generate

# Run database migrations
npm run prisma:migrate

# (Optional) Open Prisma Studio to view your database
npm run prisma:studio
```

### Step 5: Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 🧪 Testing the Application

### Quick Start: Use the Seed Data

```bash
# Seed the database with demo data
npm run prisma:seed
```

This creates:
- **Admin**: admin@example.com / password123
- **Store Owner**: john@techshop.com / password123
  - Store: "Tech Shop" at `/store/tech-shop`
- **End User**: user@example.com / password123
  - Registered at Tech Shop

### Manual Account Creation

1. **Register as Admin**:
   - Go to `/register`
   - Fill in details
   - Select "Administrator" as account type
   - Submit

2. **Register as Store Owner (CLIENT)**:
   - Go to `/register`
   - Fill in details
   - Select "Store Owner (CLIENT)"
   - Enter store name and URL (e.g., "My Store" and "my-store")
   - Submit

3. **Register as End User**:
   - Go to `/store/{store-url}` (must use store URL)
   - Click "Register" from the store page
   - Fill in details (automatically associated with the store)
   - Submit

4. **Login**:
   - Go to `/login`
   - Enter your credentials
   - You'll be redirected based on your role

### Testing Each Role

**As ADMIN** (admin@example.com):
- View system metrics and token usage
- Monitor all stores and users
- Check activity logs
- View subscription plans

**As CLIENT** (john@techshop.com):
- Manage products (create, edit, delete)
- Upload product images
- View customer list and purchase history
- Update store information
- Monitor store activity

**As END_USER** (user@example.com):
- Browse products at your store
- Add products to cart
- Chat with AI: "Show me shoes", "Add Brown Shoes to cart", "What products do you have under $100?"
- Watch the product grid auto-filter when AI searches
- Simulate purchases (checkout flow)
- View your order history

**Testing AI Features**:
```
User: "Show me shoes"
→ AI uses filterProducts tool
→ Product grid filters to show only shoes
→ Blue "AI Filter Active" banner appears

User: "Show me products under $50"
→ AI filters by price
→ Grid updates automatically

User: "Add Brown Shoes to my cart"
→ AI uses addToCart tool
→ Cart updates in sidebar
```

## 📋 Database Schema

### Core Tables

**Users**
- Authentication and user management
- Roles: ADMIN, CLIENT, END_USER
- Status: ACTIVE, INACTIVE, SUSPENDED
- Relationship to stores

**Stores**
- Store information and configuration
- Owned by CLIENT users
- URL-based routing for public access
- Logo, description, hours, category
- Status management

**Products**
- Product catalog per store
- Images (JSON array), tags, SKU
- Price, stock, and availability
- Soft delete support

**TokenUsage**
- Track AI API usage per user/store
- Monitor costs and limits
- Timestamp-based tracking

**AIQueries**
- Store conversation history
- Question-answer pairs
- Link to user and product context

**BillingHistory**
- Simulated purchase records
- Invoice tracking
- Amount and status per transaction

**SubscriptionPlans**
- Client subscription management
- Token limits per plan
- Start/end dates, status

**ActivityLogs**
- Comprehensive audit trail
- Purchase tracking (required)
- User action history

**RolesPermissions**
- Fine-grained access control
- CRUD permissions per role/module

## 🤖 AI Architecture (Vercel AI SDK + MCP)

### Why Vercel AI SDK?

We migrated from direct OpenAI SDK to **Vercel AI SDK v5** for better developer experience and capabilities:

1. **Structured Tool Calling (MCP)** - Define tools with Zod schemas for type safety
2. **Automatic Type Inference** - No manual type annotations needed
3. **Callback System** - `onStepFinish` for real-time tool execution monitoring
4. **Better Error Handling** - Built-in retry and error management
5. **Multi-model Support** - Easy to switch between OpenAI, Anthropic, etc.

### AI Tool Architecture

```typescript
// Example: filterProducts tool
filterProducts: tool({
  description: 'Search and filter products...',
  inputSchema: z.object({
    search: z.string().optional(),
    price_max: z.number().optional(),
    brand: z.string().optional()
  }),
  execute: async ({ search, price_max, brand }) => {
    // Query database
    const products = await prisma.product.findMany({...});

    // Return structured data + productIds for UI filtering
    return {
      success: true,
      products: [...],
      productIds: products.map(p => p.id), // ← Key for UI sync
      filterApplied: { search, price_max, brand }
    };
  }
})
```

### AI → UI Synchronization Flow

When a user asks "Show me shoes under $50":

1. **AI calls `filterProducts` tool** with `{ search: "shoes", price_max: 50 }`
2. **Tool returns matching products + productIds**
3. **chatService captures productIds** via `onStepFinish` callback
4. **API returns** `{ message: "...", productIds: [...] }`
5. **useChat hook** sets `productFilter` state
6. **ChatBox component** emits filter via `onProductFilter` callback
7. **StorePageClient** filters product grid to show only matching IDs
8. **User sees filtered products** with blue "AI Filter Active" banner

This creates a seamless experience where the AI assistant and product grid are synchronized.

### Available AI Tools

| Tool | Purpose | Parameters |
|------|---------|------------|
| `filterProducts` | Search/filter products | search, brand, category, price_min/max, color |
| `showProductDetails` | Get product info | product_id |
| `addToCart` | Add item to cart | product_id, quantity |
| `removeFromCart` | Remove from cart | product_id |
| `getCartSummary` | View cart contents | none |

### AI Personality

The assistant is configured with:
- 🎨 **Friendly tone** with emojis (👋 🏃‍♀️ 👕 ✅)
- 💬 **Conversational style** - not robotic
- 🎯 **Helpful follow-ups** - guides shopping journey
- ✅ **Tool-first approach** - always uses tools for real data

## 🔐 Security Features

1. **Password Security**
   - Bcrypt hashing with salt rounds
   - Minimum 8 characters required
   - Never stored in plain text

2. **Session Management**
   - JWT tokens with 30-day expiration
   - Server-side session validation
   - Automatic logout on token expiration

3. **Role-Based Access Control**
   - Middleware protection for routes
   - Server-side role verification
   - Automatic redirection for unauthorized access

4. **Database Security**
   - Prepared statements via Prisma
   - SQL injection prevention
   - Row-level security (via Supabase)

## 🎨 UI Components

Built with shadcn/ui following Atomic Design principles:

**Atoms** (Basic building blocks)
- Button, Input, Label, Badge
- Card components
- Typography elements

**Molecules** (Component combinations)
- ProductCard, CartItem, ChatMessage
- StoreForm, ProductForm
- MetricsCard, StatCard

**Organisms** (Complex components)
- ProductList, ProductTable
- CartList, ChatBox
- TokenUsageTable
- StoreHeader, Sidebar

**Templates** (Page layouts)
- AuthLayout
- AdminLayout
- StoreDashboardLayout
- StorePageLayout

## 📱 Responsive Design

- Mobile-first approach
- Breakpoints for tablet and desktop
- Touch-friendly UI elements
- Accessible components

## 🚀 Key Features Highlights

### Multi-Tenancy
- Each store operates independently
- Isolated data per store
- Custom branding per store (logo, colors)
- Unique URLs for each store

### AI Integration (Vercel AI SDK)
- **Model Context Protocol (MCP)** for structured tool calling
- **Automatic UI Synchronization**: AI product searches trigger real-time grid filtering
- Context-aware product recommendations with personality
- Natural language product search ("Show me shoes under $100")
- Interactive shopping assistance with emojis and friendly tone
- Store-specific information responses
- Token usage tracking and limits (gpt-4o-mini for cost efficiency)
- Tool-based architecture for extensibility

### Purchase Simulation
- Complete checkout flow
- Cart management
- Order history tracking
- **Note**: No real payments - all transactions are simulated for demonstration

### Admin Controls
- System-wide monitoring
- Token usage analytics
- User and store management (read-only)
- Activity audit trail

## 🐛 Troubleshooting

### Purchase 403 Error

If you get a 403 Forbidden error when trying to make a purchase:

1. **Check Console Logs** - Look for `[Purchase] Session check:` and `[Purchase] Request data:` in the server terminal
2. **Verify Store Match** - Make sure `userStoreId` matches `requestStoreId`
3. **Common Causes**:
   - User registered at Store A but trying to buy from Store B (working as designed - users can only buy from their registered store)
   - Session expired - log out and log back in
   - Wrong role - only END_USER can make purchases

**Debug Steps**:
```bash
# 1. Check server console output
# You should see detailed logs like:
[Purchase] Session check: { hasSession: true, userId: '...', userRole: 'END_USER', userStoreId: '...' }
[Purchase] Request data: { storeId: '...', userStoreId: '...', itemCount: 2, totalAmount: 100 }

# 2. If userStoreId !== storeId, you're at the wrong store
# Solution: Navigate to your registered store URL

# 3. If userRole !== 'END_USER', log in as an end user
```

### AI Chat Not Filtering Products

If AI responds but products don't filter:

1. **Check Browser Console** - Look for `[AI SDK]` logs
2. **Verify Tool Calls** - Should see `toolNames: ['filterProducts']`
3. **Check Product IDs** - Should see `productIds: [...]` in response

### Database Connection Issues
```bash
# Test your database connection
npm run prisma:studio

# Reset database if needed
npm run prisma:migrate reset
```

### Authentication Issues
```bash
# Clear your browser cookies
# Regenerate NEXTAUTH_SECRET
# Restart the dev server
```

### Build Errors
```bash
# Clear Next.js cache
rm -rf .next

# Reinstall dependencies
rm -rf node_modules
npm install
```

## 📚 Key Files to Understand

### Authentication & Core
1. **[src/lib/auth.ts](src/lib/auth.ts)** - NextAuth configuration and role-based redirect logic
2. **[src/services/authService.ts](src/services/authService.ts)** - Authentication business logic
3. **[src/hooks/useAuth.ts](src/hooks/useAuth.ts)** - Client-side authentication hook
4. **[prisma/schema.prisma](prisma/schema.prisma)** - Complete database schema

### Services Layer
5. **[src/services/adminService.ts](src/services/adminService.ts)** - Admin dashboard data
6. **[src/services/storeService.ts](src/services/storeService.ts)** - Store and product management
7. **[src/services/userService.ts](src/services/userService.ts)** - End user operations
8. **[src/services/chatService.ts](src/services/chatService.ts)** - Vercel AI SDK integration with tool calling
9. **[src/services/mcpService.ts](src/services/mcpService.ts)** - Model Context Protocol tools implementation
10. **[src/services/purchaseService.ts](src/services/purchaseService.ts)** - Purchase simulation

### Main Routes
11. **[src/app/admin-dashboard/page.tsx](src/app/admin-dashboard/page.tsx)** - Admin dashboard
12. **[src/app/store-dashboard/[storeName]/page.tsx](src/app/store-dashboard/[storeName]/page.tsx)** - Client dashboard
13. **[src/app/store/[storeName]/page.tsx](src/app/store/[storeName]/page.tsx)** - Public store page with AI chat

## 🎓 Learning Resources

This project demonstrates:
- **Next.js 14 App Router** - Modern React framework with server components
- **TypeScript** - Type-safe development
- **Prisma ORM** - Type-safe database access
- **NextAuth.js** - Production-ready authentication
- **Vercel AI SDK** - Modern AI integration with tool calling (MCP)
- **OpenAI GPT-4o-mini** - Cost-effective AI model for production
- **Multi-tenant architecture** - Isolated data per tenant
- **Role-based access control** - Granular permissions
- **Atomic Design** - Component organization pattern
- **Real-time UI synchronization** - AI actions trigger UI updates

## 📄 License

This project is part of a SaaS e-commerce platform demonstration.

## 📞 Support

For issues or questions:
1. Check the troubleshooting section above
2. Review the Prisma logs: `npm run prisma:studio`
3. Check browser console for frontend errors
4. Review Next.js server logs in terminal
5. Verify environment variables are correctly set
6. Ensure OpenAI API key has sufficient credits

## 🔮 Future Enhancements

Potential improvements for production:
- Real payment gateway integration (Stripe, PayPal)
- Email notifications (SendGrid, AWS SES)
- Advanced analytics dashboard
- Product reviews and ratings
- Inventory management alerts
- Multi-language support
- Real-time chat notifications
- Export data features (CSV, PDF)
- Advanced search with filters
- Mobile apps (React Native)

---

**Project Status**: ✅ All 4 Phases Complete

This is a fully functional SaaS e-commerce platform with AI capabilities, ready for demonstration and further customization!

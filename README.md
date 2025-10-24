# SaaS E-commerce AI - Phase 1: Authentication

A modern SaaS e-commerce platform with AI-powered features, built with Next.js 14, TypeScript, Prisma, and Supabase.

## 🎯 Phase 1 Completion

This implementation covers **Phase 1 - Authentication** as described in the project document:

### ✅ Implemented Features

1. **Authentication System**
   - Email/password login with NextAuth.js
   - User registration with role selection
   - Secure password hashing with bcryptjs
   - Session management with JWT tokens

2. **Role-Based Access Control**
   - **ADMIN**: Access to admin dashboard
   - **CLIENT**: Store owner with store management access
   - **END_USER**: Customer registered at a specific store

3. **Role-Based Redirection**
   - ADMIN → `/admin-dashboard`
   - CLIENT → `/store-dashboard/{store-name}`
   - END_USER → `/store/{store-name}`

4. **Database Integration**
   - Supabase PostgreSQL with Prisma ORM
   - Type-safe database operations
   - Complete schema with Users, Stores, and activity logging

5. **UI Components**
   - Modern, responsive design with Tailwind CSS
   - Reusable shadcn/ui components
   - Clean authentication layouts

## 🏗️ Technology Stack

- **Frontend**: Next.js 14 (App Router), TypeScript, React 18
- **Styling**: Tailwind CSS, shadcn/ui components
- **Authentication**: NextAuth.js v4
- **Database**: Supabase PostgreSQL
- **ORM**: Prisma
- **Password Security**: bcryptjs

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

# Node Environment
NODE_ENV=development
```

**Generate NEXTAUTH_SECRET:**
```bash
openssl rand -base64 32
```

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

### Create Test Accounts

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

3. **Login**:
   - Go to `/login`
   - Enter your credentials
   - You'll be redirected based on your role

### Testing Role-Based Redirection

- **ADMIN** users → redirected to `/admin-dashboard`
- **CLIENT** users → redirected to `/store-dashboard/{store-url}`
- **END_USER** users → redirected to `/store/{store-url}` (Phase 4)

## 📋 Database Schema

### Users Table
- Authentication and user management
- Roles: ADMIN, CLIENT, END_USER
- Status: ACTIVE, INACTIVE, SUSPENDED
- Relationship to stores

### Stores Table
- Store information and configuration
- Owned by CLIENT users
- URL-based routing
- Status management

### Other Tables
- Products (for Phase 3)
- TokenUsage (for Phase 2)
- AIQueries (for Phase 4)
- ActivityLogs (for auditing)

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

Built with shadcn/ui for consistency:

- `Button` - Multiple variants and sizes
- `Input` - Form inputs with validation states
- `Label` - Accessible form labels
- `Card` - Content containers
- `AuthLayout` - Authentication page wrapper

## 📱 Responsive Design

- Mobile-first approach
- Breakpoints for tablet and desktop
- Touch-friendly UI elements
- Accessible components

## 🔄 Next Steps: Phase 2-4

### Phase 2: Admin Dashboard
- Global metrics display
- Token usage monitoring
- User and store management
- Activity logs viewer

### Phase 3: Store Dashboard (CLIENT)
- Product CRUD operations
- Customer management
- Store information editor
- Sales tracking

### Phase 4: Store Page (END_USER)
- Product catalog browsing
- Shopping cart
- AI-powered chat
- Purchase simulation
- Customer registration via store URL

## 🐛 Troubleshooting

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

1. **`src/lib/auth.ts`** - NextAuth configuration and role-based redirect logic
2. **`src/services/authService.ts`** - Authentication business logic
3. **`src/hooks/useAuth.ts`** - Client-side authentication hook
4. **`prisma/schema.prisma`** - Database schema definition
5. **`src/app/api/auth/[...nextauth]/route.ts`** - NextAuth API handler

## 🤝 Contributing

This is a Phase 1 implementation. Future phases will add:
- Admin dashboard functionality
- Store management features
- Product catalog and cart
- AI chat integration
- Payment simulation

## 📄 License

This project is part of a SaaS e-commerce platform demonstration.

## 📞 Support

For issues or questions:
1. Check the troubleshooting section
2. Review the Prisma logs: `npm run prisma:studio`
3. Check browser console for frontend errors
4. Review Next.js server logs in terminal

---

**Phase 1 Status**: ✅ Complete and Tested

The authentication system is fully functional and ready for Phase 2 development!

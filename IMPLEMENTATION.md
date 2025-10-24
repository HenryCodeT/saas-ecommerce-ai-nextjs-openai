# Phase 1 Implementation Guide

## 📋 Overview

This document explains how the Phase 1 authentication system is implemented according to the project specification.

## 🏗️ Architecture Flow

### 1. Authentication Flow (As Per Document)

```
User → Login/Register Form → useAuth Hook → API Route → authService → Prisma → Supabase PostgreSQL
                                                                          ↓
User ← Role-based Redirect ← NextAuth Session ← JWT Token ← Database Response
```

### 2. Component Hierarchy

```
Root Layout (app/layout.tsx)
  └── Providers (SessionProvider from NextAuth)
       └── Page Components
            ├── Login Page (auth)/login/page.tsx)
            │    └── AuthLayout
            │         └── LoginForm (uses useAuth hook)
            │
            ├── Register Page ((auth)/register/page.tsx)
            │    └── AuthLayout
            │         └── RegisterForm (uses useAuth hook)
            │
            └── Dashboard Pages
                 ├── Admin Dashboard (admin-dashboard/page.tsx)
                 ├── Store Dashboard (store-dashboard/[storeName]/page.tsx)
                 └── Store Page (store/[storeName]/page.tsx)
```

## 🔐 Authentication Implementation

### Step-by-Step: User Registration

#### 1. User Fills Registration Form
**File**: `src/components/auth/RegisterForm.tsx`

```typescript
// User enters:
// - Name, Email, Password
// - Role selection (ADMIN or CLIENT)
// - For CLIENT: Store Name and URL
```

#### 2. Form Submits to useAuth Hook
**File**: `src/hooks/useAuth.ts`

```typescript
const register = async (data: RegisterData) => {
  // 1. Call registration API
  const response = await fetch("/api/auth/register", {
    method: "POST",
    body: JSON.stringify(data),
  });
  
  // 2. On success, auto-login
  await login({ email: data.email, password: data.password });
};
```

#### 3. API Route Processes Request
**File**: `src/app/api/auth/register/route.ts`

```typescript
export async function POST(request: NextRequest) {
  // 1. Validate input
  // 2. Call authService.register()
  // 3. Return success/error response
}
```

#### 4. authService Creates User
**File**: `src/services/authService.ts`

```typescript
async register(data: RegisterData) {
  // 1. Validate data
  // 2. Check if email exists
  // 3. Hash password with bcrypt
  // 4. Create user in database
  // 5. For CLIENT role, create store
  // 6. Log activity
  // 7. Return user data with redirect URL
}
```

#### 5. Database Transaction (Prisma)
**File**: `src/services/authService.ts`

```typescript
await prisma.$transaction(async (tx) => {
  // 1. Create user
  const user = await tx.user.create({ ... });
  
  // 2. If CLIENT, create store
  if (role === "CLIENT") {
    const store = await tx.store.create({ ... });
    await tx.user.update({ data: { storeId: store.id } });
  }
  
  // 3. Log activity
  await tx.activityLog.create({ ... });
});
```

### Step-by-Step: User Login

#### 1. User Fills Login Form
**File**: `src/components/auth/LoginForm.tsx`

```typescript
// User enters email and password
// Form submits to useAuth().login()
```

#### 2. useAuth Calls NextAuth
**File**: `src/hooks/useAuth.ts`

```typescript
const login = async (credentials: LoginCredentials) => {
  // 1. Call NextAuth signIn
  const result = await signIn("credentials", {
    email: credentials.email,
    password: credentials.password,
    redirect: false,
  });
  
  // 2. Get updated session
  // 3. Determine redirect URL based on role
  // 4. Navigate to appropriate dashboard
};
```

#### 3. NextAuth Validates Credentials
**File**: `src/lib/auth.ts` (authOptions)

```typescript
CredentialsProvider({
  async authorize(credentials) {
    // 1. Find user by email
    const user = await prisma.user.findUnique({ ... });
    
    // 2. Check account status
    if (user.status !== "ACTIVE") throw new Error();
    
    // 3. Verify password with bcrypt
    const isValid = await bcrypt.compare(password, user.passwordHash);
    
    // 4. Log activity
    await prisma.activityLog.create({ ... });
    
    // 5. Return user object for session
    return user;
  }
})
```

#### 4. JWT Token Created
**File**: `src/lib/auth.ts` (callbacks.jwt)

```typescript
async jwt({ token, user }) {
  if (user) {
    // Add user data to JWT token
    token.id = user.id;
    token.role = user.role;
    token.storeId = user.storeId;
  }
  return token;
}
```

#### 5. Session Object Created
**File**: `src/lib/auth.ts` (callbacks.session)

```typescript
async session({ session, token }) {
  // Add user data to session from JWT
  session.user.id = token.id;
  session.user.role = token.role;
  session.user.storeId = token.storeId;
  return session;
}
```

#### 6. Role-Based Redirection
**File**: `src/hooks/useAuth.ts`

```typescript
// After login, get user role and storeId
const { role, storeId } = session.user;

// Redirect based on role (as per Phase 1 document):
if (role === "ADMIN") {
  router.push("/admin-dashboard");
} else if (role === "CLIENT") {
  const store = await getStore(storeId);
  router.push(`/store-dashboard/${store.url}`);
} else if (role === "END_USER") {
  const store = await getStore(storeId);
  router.push(`/store/${store.url}`);
}
```

## 🗄️ Database Schema Explanation

### Users Table
```typescript
model User {
  id            String      // Unique identifier
  name          String      // Full name
  email         String      // Unique email (login credential)
  passwordHash  String      // Hashed password (bcrypt)
  role          UserRole    // ADMIN | CLIENT | END_USER
  status        UserStatus  // ACTIVE | INACTIVE | SUSPENDED
  storeId       String?     // Reference to store (for CLIENT/END_USER)
  
  // Relations
  store         Store?      // Store where user is registered
  ownedStores   Store[]     // Stores owned by CLIENT
  
  // Timestamps
  createdAt     DateTime
  updatedAt     DateTime
}
```

**Why this structure?**
- `passwordHash`: Security - never store plain text passwords
- `role`: Role-based access control as per document
- `storeId`: Links END_USERS to stores, CLIENTs to their managed store
- `ownedStores`: One CLIENT can own multiple stores (future-proofing)

### Stores Table
```typescript
model Store {
  id            String      // Unique identifier
  storeName     String      // Display name
  url           String      // URL slug (unique, for routing)
  clientUserId  String      // Owner (CLIENT user)
  
  // Store info
  logoUrl       String?
  city          String?
  description   String?
  category      String?
  businessHours String?
  
  status        StoreStatus // ACTIVE | INACTIVE | SUSPENDED
  
  // Relations
  clientUser    User        // Store owner
  users         User[]      // Customers (END_USERS)
  products      Product[]   // Store products (Phase 3)
}
```

**Why this structure?**
- `url`: Unique slug for clean URLs (`/store/my-store`)
- `clientUserId`: Each store has one owner (CLIENT)
- `users`: Multiple END_USERS can register at one store

## 🔒 Security Implementation

### 1. Password Security
```typescript
// Registration
const passwordHash = await bcrypt.hash(password, 10);
// 10 = salt rounds, industry standard

// Login
const isValid = await bcrypt.compare(plainPassword, passwordHash);
```

### 2. Session Security
- JWT tokens with 30-day expiration
- HttpOnly cookies (not accessible to JavaScript)
- CSRF protection built into NextAuth
- Secure flag in production (HTTPS only)

### 3. Role-Based Access Control

**Server-Side Protection** (all dashboard pages):
```typescript
// Check authentication
const session = await getServerSession(authOptions);
if (!session) redirect("/login");

// Check role
if (session.user.role !== "ADMIN") redirect("/");
```

**Client-Side Protection** (useAuth hook):
```typescript
// Components can check authentication state
const { user, isAuthenticated } = useAuth();

if (!isAuthenticated) {
  // Show login prompt
}
```

## 🛣️ Routing Structure

### Public Routes
- `/login` - Login page
- `/register` - Registration page
- `/store/[storeName]` - Public store view (Phase 4)

### Protected Routes (require authentication)
- `/` - Home (redirects to role-specific dashboard)
- `/admin-dashboard` - Admin only
- `/store-dashboard/[storeName]` - CLIENT only (must own store)
- `/store/[storeName]` - END_USER only (must be registered at store)

### Dynamic Routing
```
/store-dashboard/[storeName]
                 ↑
                 URL slug from Store.url field

Example:
Store with url="my-awesome-store"
→ /store-dashboard/my-awesome-store
```

## 🔄 Data Flow Diagrams

### Registration Flow
```
RegisterForm
    ↓ (submit)
useAuth.register()
    ↓ (POST /api/auth/register)
Registration API
    ↓ (authService.register())
Database Transaction:
    1. Create User
    2. Create Store (if CLIENT)
    3. Link User ↔ Store
    4. Log Activity
    ↓ (return user data)
Auto-Login via NextAuth
    ↓
Role-Based Redirect
    ↓
Dashboard Page
```

### Login Flow
```
LoginForm
    ↓ (submit)
useAuth.login()
    ↓ (signIn via NextAuth)
NextAuth Credentials Provider
    ↓ (authorize function)
Validate Credentials:
    1. Find user
    2. Check status
    3. Verify password
    4. Log activity
    ↓
Create JWT Token (with role, storeId)
    ↓
Create Session Object
    ↓
Return to useAuth
    ↓
Determine Redirect URL
    ↓
Navigate to Dashboard
```

### Session Management
```
Client Request
    ↓
NextAuth Middleware
    ↓
Verify JWT Token
    ↓ (valid)
Decode User Data (id, role, storeId)
    ↓
Inject into Server Components via getServerSession()
    ↓
Inject into Client Components via useSession()
    ↓
Component Renders with User Context
```

## 📁 Key Files Reference

### Core Configuration
- `src/lib/auth.ts` - NextAuth configuration
- `src/lib/prisma.ts` - Prisma client singleton
- `src/lib/supabase.ts` - Supabase client
- `prisma/schema.prisma` - Database schema

### Services & Hooks
- `src/services/authService.ts` - Authentication business logic
- `src/hooks/useAuth.ts` - Client-side auth hook

### Components
- `src/components/auth/LoginForm.tsx` - Login form
- `src/components/auth/RegisterForm.tsx` - Registration form
- `src/components/auth/AuthLayout.tsx` - Auth page wrapper

### API Routes
- `src/app/api/auth/[...nextauth]/route.ts` - NextAuth handler
- `src/app/api/auth/register/route.ts` - Registration endpoint
- `src/app/api/stores/[storeId]/route.ts` - Store info endpoint

### Pages
- `src/app/page.tsx` - Home with redirect logic
- `src/app/(auth)/login/page.tsx` - Login page
- `src/app/(auth)/register/page.tsx` - Registration page
- `src/app/admin-dashboard/page.tsx` - Admin dashboard
- `src/app/store-dashboard/[storeName]/page.tsx` - Store dashboard
- `src/app/store/[storeName]/page.tsx` - Store page

## ✅ Phase 1 Completion Checklist

- [x] User registration with role selection
- [x] Email/password authentication
- [x] Password hashing with bcrypt
- [x] Session management with NextAuth
- [x] JWT tokens with user role
- [x] Role-based access control (ADMIN, CLIENT, END_USER)
- [x] Role-based redirection after login
- [x] Store creation for CLIENT users
- [x] Database schema with Users and Stores
- [x] Activity logging
- [x] Protected routes
- [x] TypeScript type safety
- [x] Responsive UI with Tailwind CSS
- [x] Error handling
- [x] Form validation

## 🚀 Next Steps

### Phase 2: Admin Dashboard
- Implement metrics display
- Token usage monitoring
- User/store management UI
- Activity logs viewer

### Phase 3: Store Dashboard
- Product CRUD operations
- Customer list and purchases
- Store info editor
- Sales tracking

### Phase 4: Store Page
- Product catalog display
- Shopping cart
- AI chat integration
- Purchase simulation
- END_USER registration via store URL

---

**Phase 1 Status**: ✅ Complete and Production-Ready

All authentication requirements from the project document have been implemented and tested!

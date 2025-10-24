# Quick Setup Guide - Phase 1 Authentication

## 🚀 5-Minute Setup

### 1. Install Dependencies (1 min)
```bash
cd saas-ecommerce-ai
npm install
```

### 2. Set Up Supabase (2 min)
1. Go to [supabase.com](https://supabase.com) and create a free account
2. Create a new project (choose any name, password, and region)
3. Wait for project to be ready (~1 minute)
4. Go to **Project Settings** → **API**:
   - Copy **Project URL**
   - Copy **anon public** key
   - Copy **service_role** key (⚠️ keep secret!)
5. Go to **Project Settings** → **Database**:
   - Copy **Connection string** (Transaction pooling or Session pooling)

### 3. Configure Environment (1 min)
```bash
cp .env.example .env.local
```

Edit `.env.local`:
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here

DATABASE_URL=postgresql://postgres:[YOUR-PASSWORD]@db.your-project.supabase.co:5432/postgres

NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=run-openssl-rand-base64-32-to-generate-this

NODE_ENV=development
```

Generate NEXTAUTH_SECRET:
```bash
openssl rand -base64 32
```
Copy the output and paste it into your `.env.local`

### 4. Set Up Database (1 min)
```bash
npm run prisma:generate
npm run prisma:migrate
```

When prompted for migration name, enter: `init`

### 5. Run the App! (instant)
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## ✅ Test It Out

### Register Your First User

1. Go to [http://localhost:3000/register](http://localhost:3000/register)

2. **For Store Owner (CLIENT)**:
   - Name: Your Name
   - Email: your@email.com
   - Password: yourpassword123 (min 8 chars)
   - Account Type: Store Owner (CLIENT)
   - Store Name: My Test Store
   - Store URL: my-test-store

3. Click "Create Account"

4. You'll be automatically logged in and redirected to:
   `/store-dashboard/my-test-store`

### Test Role-Based Redirection

1. Logout (you'll need to add a logout button or clear cookies)

2. Register another user as **Administrator**:
   - Follow same steps but select "Administrator"
   - You'll be redirected to `/admin-dashboard`

3. Each role goes to its specific dashboard! ✨

## 🎯 What's Working?

✅ User registration (CLIENT and ADMIN roles)  
✅ Login with email/password  
✅ Role-based redirection  
✅ Session management  
✅ Store creation for CLIENT users  
✅ Activity logging  
✅ Password hashing  
✅ Protected routes  

## 📊 View Your Database

```bash
npm run prisma:studio
```

This opens a GUI at [http://localhost:5555](http://localhost:5555) where you can:
- View all users
- See created stores
- Check activity logs
- Edit data manually

## 🐛 Common Issues

### "Can't connect to database"
- Check your DATABASE_URL is correct
- Make sure Supabase project is active
- Verify password in connection string has no special characters (or URL encode them)

### "NextAuth error"
- Make sure you generated NEXTAUTH_SECRET with openssl
- Verify NEXTAUTH_URL is set to http://localhost:3000
- Clear browser cookies and try again

### "Migration failed"
- Delete the `prisma/migrations` folder
- Run `npm run prisma:migrate` again

### Port 3000 already in use
```bash
# Kill the process on port 3000
lsof -ti:3000 | xargs kill -9

# Or use a different port
npm run dev -- -p 3001
```

## 🎉 You're Ready!

Phase 1 is complete! The authentication system is working.

Next steps:
- Implement Phase 2: Admin Dashboard
- Implement Phase 3: Store Management
- Implement Phase 4: Customer Features

## 📁 Important Files

- **`README.md`** - Full documentation
- **`.env.local`** - Your configuration (NEVER commit this!)
- **`prisma/schema.prisma`** - Database structure
- **`src/lib/auth.ts`** - Authentication logic
- **`src/hooks/useAuth.ts`** - Client-side auth hook

## 🔗 Useful Commands

```bash
# Start development server
npm run dev

# View database
npm run prisma:studio

# Reset database (⚠️ deletes all data)
npm run prisma:migrate reset

# Generate Prisma client after schema changes
npm run prisma:generate

# Create new migration
npm run prisma:migrate

# Build for production
npm run build

# Start production server
npm start
```

Happy coding! 🚀

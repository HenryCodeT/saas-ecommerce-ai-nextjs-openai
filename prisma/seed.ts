// Database Seed Script
// Creates demo users for testing
// Run with: npx tsx prisma/seed.ts

import { PrismaClient, UserRole, UserStatus, StoreStatus } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  // Create Admin user
  const adminPassword = await bcrypt.hash("admin123", 10);
  const admin = await prisma.user.upsert({
    where: { email: "admin@example.com" },
    update: {},
    create: {
      name: "Admin User",
      email: "admin@example.com",
      passwordHash: adminPassword,
      role: UserRole.ADMIN,
      status: UserStatus.ACTIVE,
    },
  });
  console.log("✅ Created admin user:", admin.email);

  // Create CLIENT user with store
  const clientPassword = await bcrypt.hash("client123", 10);
  const client = await prisma.user.create({
    data: {
      name: "Store Owner",
      email: "client@example.com",
      passwordHash: clientPassword,
      role: UserRole.CLIENT,
      status: UserStatus.ACTIVE,
    },
  });

  const store = await prisma.store.create({
    data: {
      storeName: "Demo Store",
      url: "demo-store",
      clientUserId: client.id,
      description: "A demo store for testing",
      city: "San Francisco",
      category: "Electronics",
      status: StoreStatus.ACTIVE,
    },
  });

  // Update client with storeId
  await prisma.user.update({
    where: { id: client.id },
    data: { storeId: store.id },
  });

  console.log("✅ Created client user:", client.email);
  console.log("✅ Created store:", store.storeName, `(${store.url})`);

  // Create END_USER
  const userPassword = await bcrypt.hash("user123", 10);
  const endUser = await prisma.user.create({
    data: {
      name: "John Customer",
      email: "user@example.com",
      passwordHash: userPassword,
      role: UserRole.END_USER,
      status: UserStatus.ACTIVE,
      storeId: store.id,
    },
  });
  console.log("✅ Created end user:", endUser.email);

  // Log demo credentials
  console.log("\n🎉 Seeding complete! Demo credentials:\n");
  console.log("Admin:");
  console.log("  Email: admin@example.com");
  console.log("  Password: admin123");
  console.log("  Dashboard: /admin-dashboard\n");

  console.log("Store Owner:");
  console.log("  Email: client@example.com");
  console.log("  Password: client123");
  console.log("  Dashboard: /store-dashboard/demo-store\n");

  console.log("Customer:");
  console.log("  Email: user@example.com");
  console.log("  Password: user123");
  console.log("  Store: /store/demo-store\n");
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error("❌ Seeding error:", e);
    await prisma.$disconnect();
    process.exit(1);
  });

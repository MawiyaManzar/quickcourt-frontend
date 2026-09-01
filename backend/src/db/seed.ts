import { db } from "../config/db.js";
import { users } from "./schema/index.js";
import { hashPassword } from "../lib/password.js";
import { eq } from "drizzle-orm";

/**
 * Seeds the database with initial data for development/testing.
 * Usage: bun src/db/seed.ts
 *
 * Idempotent — safe to run multiple times.
 */
async function main() {
  console.log("🌱 Seeding database...");

  // ── Admin user ─────────────────────────────────────────
  const adminEmail = "admin@hackathon.com";
  const existingAdmin = await db
    .select()
    .from(users)
    .where(eq(users.email, adminEmail))
    .limit(1);

  if (existingAdmin.length === 0) {
    await db.insert(users).values({
      email: adminEmail,
      password: await hashPassword("admin123"),
      name: "Admin User",
      role: "admin",
      emailVerified: true,
    });
    console.log("  ✅ Admin user created (admin@hackathon.com / admin123)");
  } else {
    console.log("  ⏭️  Admin user already exists, skipping");
  }

  // ── Test user ──────────────────────────────────────────
  const testEmail = "user@hackathon.com";
  const existingUser = await db
    .select()
    .from(users)
    .where(eq(users.email, testEmail))
    .limit(1);

  if (existingUser.length === 0) {
    await db.insert(users).values({
      email: testEmail,
      password: await hashPassword("user123"),
      name: "Test User",
      role: "user",
      emailVerified: true,
    });
    console.log("  ✅ Test user created (user@hackathon.com / user123)");
  } else {
    console.log("  ⏭️  Test user already exists, skipping");
  }

  console.log("🌱 Seeding complete!");
  process.exit(0);
}

main().catch((err) => {
  console.error("❌ Seed failed:", err);
  process.exit(1);
});

import prisma from "./prisma.js";

console.log("Testing Prisma connection...");

async function testConnection() {
  try {
    const users = await prisma.user.findMany();
    console.log("✓ Database connection successful!");
    console.log(`Found ${users.length} users:`, users);
    process.exit(0);
  } catch (error) {
    console.error("✗ Database connection failed:");
    console.error(error);
    process.exit(1);
  }
}

testConnection();

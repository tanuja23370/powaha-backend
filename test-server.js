import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function test() {
  try {
    console.log("Testing database connection...");
    const users = await prisma.user.findMany();
    console.log("Users found:", users.length);
    
    const notifications = await prisma.notification.findMany({ where: { userId: 1 } });
    console.log("Notifications for user 1:", notifications.length);
    console.log("Notifications:", JSON.stringify(notifications, null, 2));
  } catch (error) {
    console.error("Error:", error);
  } finally {
    await prisma.$disconnect();
  }
}

test();

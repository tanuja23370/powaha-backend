import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import prisma from "./prisma.js";

import authRoutes from "./routes/authRoutes.js";
import notificationRoutes from "./routes/notificationRoutes.js";

dotenv.config();

const app = express();

/* =========================
   MIDDLEWARES
========================= */
app.use(cors());
app.use(express.json());

/* =========================
   API ROUTES
========================= */
app.use("/api/auth", authRoutes);
app.use("/api/notifications", notificationRoutes);

/* =========================
   HEALTH CHECK
========================= */
app.get("/", (req, res) => {
  res.send("Backend is running 🚀");
});

/* =========================
   TEST DB CONNECTION
========================= */
app.get("/test-db", async (req, res) => {
  try {
    const users = await prisma.user.findMany();
    res.status(200).json({
      success: true,
      users,
    });
  } catch (error) {
    console.error("❌ DB Test Error:", error);
    res.status(500).json({
      success: false,
      message: "DB connection failed",
    });
  }
});

/* =========================
   GET ALL NOTIFICATIONS
   (TEST / ADMIN USE)
========================= */
app.get("/notifications", async (req, res) => {
  try {
    const notifications = await prisma.notification.findMany({
      orderBy: {
        createdAt: "desc",
      },
    });

    res.status(200).json({
      success: true,
      notifications,
    });
  } catch (error) {
    console.error("❌ Fetch Notifications Error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch notifications",
    });
  }
});

/* =========================
   SERVER START
========================= */
const PORT = process.env.PORT || 10000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});

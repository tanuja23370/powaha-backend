import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";

import prisma from "./config/prisma.js";

import authRoutes from "./routes/auth/auth.routes.js";
import notificationRoutes from "./routes/notification/notification.routes.js";
import profileRoutes from "./routes/profile/profile.routes.js";
import cpRoutes from "./routes/cp/cp.routes.js";
import adminRoutes from "./routes/admin/admin.routes.js";

const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "../public")));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/admin", adminRoutes);

app.use("/api/cp", cpRoutes);
app.get("/cp/register", (req, res) => {
  res.sendFile(path.join(__dirname, "../public/cp-register.html"));
});

// Health check
app.get("/health", async (req, res) => {
  try {
    await prisma.$queryRawUnsafe("SELECT 1");
    res.json({
      status: "healthy",
      database: "connected",
      time: new Date().toISOString()
    });
  } catch (err) {
    res.status(503).json({
      status: "unhealthy",
      database: "disconnected"
    });
  }
});

// Test route
app.get("/", (req, res) => {
  res.send("Backend is running 🚀");
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

import express from "express";
import {
  createNotification,
  getUserNotifications,
} from "../controllers/notificationController.js";

const router = express.Router();

/**
 * CREATE notification (Admin)
 * POST /api/notifications
 */
router.post("/", createNotification);

/**
 * GET notifications for a user (Mobile App)
 * GET /api/notifications/:userId
 */
router.get("/:userId", getUserNotifications);

export default router;

import express from "express";
import {
  createNotification,
  getAllNotifications,
  getUserNotifications,
} from "../controllers/notificationController.js";

const router = express.Router();

/**
 * CREATE notification
 * POST /api/notifications
 */
router.post("/", createNotification);

/**
 * GET ALL notifications
 * GET /api/notifications
 */
router.get("/", getAllNotifications);

/**
 * GET notifications for a user
 * GET /api/notifications/:userId
 */
router.get("/:userId", getUserNotifications);

export default router;

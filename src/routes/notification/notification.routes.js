import express from "express";
import verifyToken from "../../middleware/auth.middleware.js";

import {
  getAllNotifications,
  getUnreadCount,
  getLatestNotifications,
  markAsRead,
  markAllAsRead
} from "../../controllers/notification/notification.controller.js";

const router = express.Router();

router.get("/", verifyToken, getAllNotifications);
router.get("/unread-count", verifyToken, getUnreadCount);
router.get("/latest", verifyToken, getLatestNotifications);
router.patch("/:id/read", verifyToken, markAsRead);
router.patch("/mark-all-read", verifyToken, markAllAsRead);

export default router;

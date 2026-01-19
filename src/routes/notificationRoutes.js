import express from "express";
import {
  createNotification,
  getAllNotifications,
  getUserNotifications,
} from "../controllers/notificationController.js";

const router = express.Router();

router.post("/", createNotification);
router.get("/", getAllNotifications);
router.get("/:userId", getUserNotifications);

export default router;

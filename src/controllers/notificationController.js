import prisma from "../prisma.js";

/**
 * CREATE NOTIFICATION
 * POST /api/notifications
 */
export const createNotification = async (req, res) => {
  try {
    const { title, message, userId } = req.body;

    if (!title || !message || !userId) {
      return res.status(400).json({
        success: false,
        message: "title, message and userId are required",
      });
    }

    const parsedUserId = Number(userId);
    if (isNaN(parsedUserId)) {
      return res.status(400).json({
        success: false,
        message: "userId must be a number",
      });
    }

    const notification = await prisma.notification.create({
      data: {
        title,
        message,
        userId: parsedUserId,
      },
    });

    return res.status(201).json({
      success: true,
      notification,
    });
  } catch (error) {
    console.error("❌ Create Notification Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to create notification",
    });
  }
};

/**
 * GET ALL NOTIFICATIONS
 * GET /api/notifications
 */
export const getAllNotifications = async (req, res) => {
  try {
    const notifications = await prisma.notification.findMany({
      orderBy: { createdAt: "desc" },
    });

    return res.status(200).json({
      success: true,
      notifications,
    });
  } catch (error) {
    console.error("❌ Get All Notifications Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch notifications",
    });
  }
};

/**
 * GET USER NOTIFICATIONS
 * GET /api/notifications/:userId
 */
export const getUserNotifications = async (req, res) => {
  try {
    const userId = Number(req.params.userId);

    if (isNaN(userId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid userId",
      });
    }

    const notifications = await prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });

    return res.status(200).json({
      success: true,
      notifications,
    });
  } catch (error) {
    console.error("❌ Get User Notifications Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch notifications",
    });
  }
};

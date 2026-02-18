import prisma from "../../config/prisma.js";
/**
 * CREATE NOTIFICATION
 * Admin / Church sends notification to a follower
 */



/**
 * GET ALL NOTIFICATIONS FOR LOGGED-IN FOLLOWER
 */

export const getAllNotifications = async (req, res) => {
  try {
    const userId = req.user.id;

    const notifications = await prisma.notification.findMany({
      where: { userid: userId },
      orderBy: { createdat: "desc" }
    });

    return res.status(200).json({
      success: true,
      data: notifications
    });
  } catch (error) {
    console.error("Get notifications error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};


/**
 * MARK NOTIFICATION AS READ
 */
export const markAsRead = async (req, res) => {
  try {
    const userId = req.user.id;
    const notificationId = req.params.id;

    const notification = await prisma.notification.findFirst({
      where: {
        nid: notificationId,
        userid: userId
      }
    });

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: "Notification not found"
      });
    }

    await prisma.notification.update({
      where: { nid: notificationId },
      data: { isread: true }
    });

    return res.status(200).json({
      success: true,
      message: "Notification marked as read"
    });
  } catch (error) {
    console.error("Mark read error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

/**
 * GET UNREAD COUNT
 */
export const getUnreadCount = async (req, res) => {
  try {
    const userId = req.user.id;

    const count = await prisma.notification.count({
      where: {
        userid: userId,
        isread: false
      }
    });

    return res.status(200).json({
      success: true,
      unreadCount: count
    });
  } catch (error) {
    console.error("Unread count error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

/**
 * GET LATEST NOTIFICATION (for banner)
 * GET /api/notifications/latest
 */
export const getLatestNotifications = async (req, res) => {
  try {
    const userId = req.user.id;

    const notifications = await prisma.notification.findMany({
      where: { userid: userId },
      orderBy: { createdat: "desc" },
      take: 5
    });

    return res.status(200).json({
      success: true,
      data: notifications
    });
  } catch (error) {
    console.error("Latest notifications error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

/**
 * MARK ALL NOTIFICATIONS AS READ
 * PATCH /api/notifications/mark-all-read
 */
export const markAllAsRead = async (req, res) => {
  try {
    const userId = req.user.id;

    await prisma.notification.updateMany({
      where: {
        userid: userId,
        isread: false
      },
      data: { isread: true }
    });

    return res.status(200).json({
      success: true,
      message: "All notifications marked as read"
    });
  } catch (error) {
    console.error("Mark all read error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

import prisma from "../../config/prisma.js";

/**
 * GET FOLLOWER PROFILE
 * GET /api/profile
 */
export const getProfile = async (req, res) => {
  try {

    const user = await prisma.user.findUnique({
  where: { uid: req.user.id },
  include: { profile: true }
});


    console.log("HARDCODE USER:", user);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found (hardcode)"
      });
    }

    return res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error" });
  }
};

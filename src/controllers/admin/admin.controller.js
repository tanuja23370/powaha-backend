import prisma from "../../config/prisma.js";
import bcrypt from "bcryptjs";

// ✅ APPROVE CP
export const approveCp = async (req, res) => {
  try {
    const { cp_id } = req.params;
    const { plan_id, approved_aoo } = req.body;
    const defaultPassword = process.env.CP_DEFAULT_PASSWORD || "Cp@12345";

    const cp = await prisma.cp.findUnique({
      where: { cp_id }
    });

    if (!cp) {
      return res.status(404).json({ message: "CP not found" });
    }

    if (cp.cp_status !== "SUBMITTED") {
      return res.status(400).json({
        message: "CP is not in SUBMITTED state"
      });
    }

    const passwordHash = await bcrypt.hash(defaultPassword, 10);

    await prisma.cp.update({
      where: { cp_id },
      data: {
        cp_status: "APPROVED",
        password_hash: passwordHash,
        is_password_set: true,
        cp_plan_id: plan_id || null,
        cp_aoo_json: approved_aoo || null,
        cp_reviewed_by_uid: null,
        cp_reviewed_at: new Date(),
        cp_activated_at: new Date()
      }
    });

    return res.status(200).json({
      message: "CP approved successfully"
    });

  } catch (error) {
    console.error("Approve CP Error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// ✅ REJECT CP
export const rejectCp = async (req, res) => {
  try {
    const { cp_id } = req.params;

    const cp = await prisma.cp.findUnique({
      where: { cp_id }
    });

    if (!cp) {
      return res.status(404).json({ message: "CP not found" });
    }

    if (cp.cp_status !== "SUBMITTED") {
      return res.status(400).json({
        message: "Only SUBMITTED CPs can be rejected"
      });
    }

    await prisma.cp.update({
      where: { cp_id },
      data: {
        cp_status: "REJECTED",
        cp_reviewed_by_uid: null,
        cp_reviewed_at: new Date()
      }
    });

    return res.status(200).json({
      message: "CP rejected successfully"
    });

  } catch (error) {
    console.error("Reject CP Error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

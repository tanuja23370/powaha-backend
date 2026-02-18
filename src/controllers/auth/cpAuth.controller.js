import prisma from "../../config/prisma.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export const cpLogin = async (req, res) => {
  try {
    const identifier = req.body.identifier?.trim();
    const password = req.body.password;

    if (!identifier || !password) {
      return res.status(400).json({
        message: "Mobile/email and password are required",
      });
    }

    const cp = await prisma.cp.findFirst({
      where: {
        OR: [
          { cp_mobile: identifier },
          { cp_email: identifier },
        ],
      },
    });

    if (!cp) {
      return res.status(401).json({
        message: "Invalid credentials",
      });
    }

    if (!["APPROVED", "ACTIVE"].includes(cp.cp_status)) {
      return res.status(403).json({
        message: "Your account is not active yet",
      });
    }

    if (!cp.is_password_set || !cp.password_hash) {
      return res.status(403).json({
        message: "Account setup required",
      });
    }

    const isMatch = await bcrypt.compare(password, cp.password_hash);

    if (!isMatch) {
      return res.status(401).json({
        message: "Invalid credentials",
      });
    }

    const token = jwt.sign(
      {
        cp_id: cp.cp_id,
        role: "CP",
      },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    return res.status(200).json({
      message: "Login successful",
      token,
      cp: {
        cp_id: cp.cp_id,
        full_name: cp.cp_full_name,
        mobile: cp.cp_mobile,
        email: cp.cp_email,
      },
    });

  } catch (error) {
    console.error("CP Login Error:", error);
    return res.status(500).json({
      message: "Login failed. Please try again later.",
    });
  }
};

//validate pin//
/********************/

export const validatePin = async (req, res) => {
  try {
    const { cp_id, pin } = req.body;

    if (!cp_id || !pin) {
      return res.status(400).json({
        message: "cp_id and pin are required",
      });
    }

    const cp = await prisma.cp.findUnique({
      where: { cp_id },
    });

    if (!cp || !cp.pin_hash) {
      return res.status(401).json({
        message: "Invalid PIN",
      });
    }

    const isMatch = await bcrypt.compare(pin, cp.pin_hash);

    if (!isMatch) {
      return res.status(401).json({
        message: "Invalid PIN",
      });
    }

    return res.status(200).json({
      message: "PIN verified successfully",
    });

  } catch (error) {
    console.error("Validate PIN Error:", error);
    return res.status(500).json({
      message: "PIN validation failed",
    });
  }
};

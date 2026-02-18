import jwt from "jsonwebtoken";

export const cpAuthMiddleware = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({
        message: "Authorization token missing",
      });
    }

    // Expecting: Bearer <token>
    const token = authHeader.split(" ")[1];

    if (!token) {
      return res.status(401).json({
        message: "Invalid authorization format",
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Attach CP info to request
    req.cp = {
      cp_id: decoded.cp_id,
      role: decoded.role,
    };

    next();
  } catch (error) {
    console.error("CP Auth Middleware Error:", error);
    return res.status(401).json({
      message: "Invalid or expired token",
    });
  }
};

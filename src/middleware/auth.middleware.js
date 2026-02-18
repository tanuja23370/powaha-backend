import jwt from "jsonwebtoken";

const verifyToken = (req, res, next) => {
  console.log("AUTH HEADER:", req.headers.authorization);

  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ message: "No token" });
  }

  const token = authHeader.split(" ")[1];

  const decoded = jwt.verify(token, process.env.JWT_SECRET);

  console.log("DECODED TOKEN:", decoded);

  req.user = decoded;
  next();
};


export default verifyToken;

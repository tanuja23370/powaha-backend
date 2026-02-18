import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

const token = jwt.sign(
  { id: "913e05a4-6b5b-4aa3-91d3-ca43e28e1051" },
  process.env.JWT_SECRET,
  { expiresIn: "1h" }
);

console.log("TOKEN:");
console.log(token);

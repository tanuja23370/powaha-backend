import express from "express";
import verifyToken from "../../middleware/auth.middleware.js";
import { getProfile } from "../../controllers/profile/profile.controller.js";

const router = express.Router();

router.get("/", verifyToken, getProfile);

export default router;

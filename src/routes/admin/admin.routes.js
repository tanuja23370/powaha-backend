import express from "express";
import { approveCp, rejectCp } from "../../controllers/admin/admin.controller.js";

const router = express.Router();

router.post("/cp/:cp_id/approve", approveCp);
router.post("/cp/:cp_id/reject", rejectCp);

export default router;

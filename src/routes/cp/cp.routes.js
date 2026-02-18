import express from "express";

import {
  registerCp,
  getCpLeads,
  createCpLead,
  updateLeadStage,
  setupAccount,
} from "../../controllers/cp/cp.controller.js";

import { cpLogin } from "../../controllers/auth/cpAuth.controller.js";


import { cpAuthMiddleware } from "../../middleware/cpAuth.middleware.js";

import { validatePin } from "../../controllers/auth/cpAuth.controller.js";

const router = express.Router();

/**
 * ===============================
 * PUBLIC ROUTES
 * ===============================
 */

// Website registration
router.post("/register", registerCp);

// Mobile login
router.post("/login", cpLogin);

/**
 * ===============================
 * PROTECTED ROUTES (CP AUTH)
 * ===============================
 */

// Get all leads of logged-in CP
router.get("/leads", cpAuthMiddleware, getCpLeads);
router.get("/:cp_id/leads", getCpLeads);

// Create new lead
router.post("/leads", cpAuthMiddleware, createCpLead);
router.post("/:cp_id/leads", createCpLead);

// Update lead stage
router.patch(
  "/leads/:lead_id/stage",
  cpAuthMiddleware,
  updateLeadStage
);

//SET UP ACCOUNT
router.post("/setup-account", setupAccount);

//VALIDATE PIN
router.post("/validate-pin", validatePin);

router.patch("/:cp_id/leads/:lead_id/stage", updateLeadStage);

/**
 * ===============================
 * TEST ROUTE
 * ===============================
 */
router.get("/me-test", cpAuthMiddleware, (req, res) => {
  res.json({
    message: "CP authenticated",
    cp: req.cp,
  });
});

export default router;

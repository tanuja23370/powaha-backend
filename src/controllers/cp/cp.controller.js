import { PrismaClient } from "@prisma/client";
import { randomUUID } from "crypto";
import jwt from "jsonwebtoken";

const prisma = new PrismaClient();

/**
 * ===============================
 * CP REGISTRATION (Website)
 * ===============================
 */
export const registerCp = async (req, res) => {
  try {
    const {
      full_name,
      mobile,
      email,
      city,
      state,
      country,
      experience,
      preferred_aoo,
    } = req.body;

    if (!full_name || !mobile || !email) {
      return res.status(400).json({
        message: "full_name, mobile, and email are required",
      });
    }

    const trimmedMobile = mobile.trim();
    const trimmedEmail = email.trim();

    const existingCp = await prisma.cp.findFirst({
      where: {
        OR: [
          { cp_mobile: trimmedMobile },
          { cp_email: trimmedEmail },
        ],
      },
    });

    if (existingCp) {
      return res.status(409).json({
        message: "CP already registered with this mobile or email",
      });
    }

    const cpId = randomUUID();

    const newCp = await prisma.cp.create({
      data: {
        cp_id: cpId,
        cp_full_name: full_name.trim(),
        cp_mobile: trimmedMobile,
        cp_email: trimmedEmail,
        cp_city: city,
        cp_state: state,
        cp_country: country,
        cp_experience: experience,
        cp_pref_aoo_json: preferred_aoo,
        cp_status: "SUBMITTED",
        cp_submitted_at: new Date(),
      },
    });

    return res.status(201).json({
      message: "CP registration submitted successfully",
      cp_id: newCp.cp_id,
    });

  } catch (error) {
    console.error("CP Register Error:", error);
    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

/**
 * ===============================
 * CP LOGIN (Mobile App)
 * ===============================
 */
export const cpLogin = async (req, res) => {
  try {
    const identifier = req.body.identifier?.trim();

    if (!identifier) {
      return res.status(400).json({
        message: "Mobile number or email is required",
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

   if (cp.cp_status !== "APPROVED") {
      return res.status(403).json({
        message: "Your account is not approved yet",
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

/**
 * ===============================
 * GET CP LEADS
 * ===============================
 */
export const getCpLeads = async (req, res) => {
  try {
    const cp_id = req.cp?.cp_id || req.params.cp_id;

    if (!cp_id) {
      return res.status(401).json({
        message: "Unauthorized",
      });
    }

    // Fetch leads
    const leads = await prisma.cpLead.findMany({
      where: { cp_id },
      orderBy: { lead_created_at: "desc" },
    });

    // Fetch all stages
    const stages = await prisma.leadStage.findMany();

    // Map stage_id → stage_code
    const stageMap = {};
    stages.forEach(stage => {
      stageMap[stage.lead_stage_id] = stage.lead_stage_code;
    });

    // Format response
    const formattedLeads = leads.map(lead => ({
      cp_lead_id: lead.cp_lead_id,
      lead_church_name: lead.lead_church_name,
      lead_church_city: lead.lead_church_city,
      lead_church_state: lead.lead_church_state,
      lead_contact_name: lead.lead_contact_name,
      lead_contact_mobile: lead.lead_contact_mobile,
      lead_notes: lead.lead_notes,
      lead_created_at: lead.lead_created_at,
      lead_stage: stageMap[lead.lead_stage_id] || "UNKNOWN",
    }));

    return res.status(200).json({
      message: "Leads fetched successfully",
      count: formattedLeads.length,
      leads: formattedLeads,
    });

  } catch (error) {
    console.error("Get CP Leads Error:", error);
    return res.status(500).json({
      message: "Failed to fetch leads",
    });
  }
};

/**
 * ===============================
 * CREATE CP LEAD
 * ===============================
 */
export const createCpLead = async (req, res) => {
  try {
    const cp_id = req.cp?.cp_id || req.params.cp_id;

    if (!cp_id) {
      return res.status(401).json({
        message: "Unauthorized",
      });
    }

    const {
      lead_church_name,
      lead_church_addr_line1,
      lead_church_addr_line2,
      lead_church_city,
      lead_church_state,
      lead_church_type,
      lead_contact_name,
      lead_contact_mobile,
      lead_notes,
    } = req.body;

    if (!lead_church_name || !lead_contact_name || !lead_contact_mobile) {
      return res.status(400).json({
        message: "Required fields missing",
      });
    }

    const cpExists = await prisma.cp.findUnique({
      where: { cp_id },
      select: { cp_id: true },
    });

    if (!cpExists) {
      return res.status(404).json({
        message: "CP not found",
      });
    }

    // Get first stage (NEW)
    const firstStage = await prisma.leadStage.findFirst({
      orderBy: {
        lead_stage_seq_no: "asc",
      },
    });

    if (!firstStage) {
      return res.status(500).json({
        message: "Lead stages not configured",
      });
    }

    const newLead = await prisma.cpLead.create({
      data: {
        cp_lead_id: randomUUID(),
        cp_id,
        lead_church_name: lead_church_name.trim(),
        lead_church_addr_line1,
        lead_church_addr_line2,
        lead_church_city,
        lead_church_state,
        lead_church_type,
        lead_contact_name,
        lead_contact_mobile,
        lead_notes,
        lead_stage_id: firstStage.lead_stage_id,
        lead_created_at: new Date(),
      },
    });

    return res.status(201).json({
      message: "Lead created successfully",
      lead: newLead,
    });

  } catch (error) {
    console.error("Create Lead Error:", error);
    return res.status(500).json({
      message: "Failed to create lead",
    });
  }
};

/**
 * ===============================
 * UPDATE LEAD STAGE
 * ===============================
 */
export const updateLeadStage = async (req, res) => {
  try {
    const cp_id = req.cp?.cp_id || req.params.cp_id;
    const { lead_id } = req.params;
    const { lead_stage_code } = req.body;

    if (!cp_id) {
      return res.status(401).json({
        message: "Unauthorized",
      });
    }

    if (!lead_stage_code) {
      return res.status(400).json({
        message: "lead_stage_code is required",
      });
    }

    // Get new stage
    const newStage = await prisma.leadStage.findFirst({
      where: {
        lead_stage_code: lead_stage_code,
      },
    });

    if (!newStage) {
      return res.status(404).json({
        message: "Invalid lead stage",
      });
    }

    // Get current lead
    const lead = await prisma.cpLead.findFirst({
      where: {
        cp_lead_id: lead_id,
        cp_id,
      },
    });

    if (!lead) {
      return res.status(404).json({
        message: "Lead not found",
      });
    }

    // Get current stage
    const currentStage = await prisma.leadStage.findUnique({
      where: {
        lead_stage_id: lead.lead_stage_id,
      },
    });

    // Prevent backward movement
    if (
      newStage.lead_stage_seq_no <= currentStage.lead_stage_seq_no
    ) {
      return res.status(400).json({
        message: "Cannot move lead backward",
      });
    }

    await prisma.cpLead.update({
      where: {
        cp_lead_id: lead_id,
      },
      data: {
        lead_stage_id: newStage.lead_stage_id,
      },
    });

    return res.status(200).json({
      message: "Lead stage updated successfully",
    });

  } catch (error) {
    console.error("Update Lead Stage Error:", error);
    return res.status(500).json({
      message: "Failed to update lead stage",
    });
  }
};

// setup account
//*******************/

import bcrypt from "bcryptjs";

export const setupAccount = async (req, res) => {
  try {
    const { email, password, pin } = req.body;

    if (!email || !password || !pin) {
      return res.status(400).json({ message: "All fields are required" });
    }

    if (pin.length !== 4) {
      return res.status(400).json({ message: "PIN must be 4 digits" });
    }

    const cp = await prisma.cp.findFirst({
      where: { cp_email: email },
    });

    if (!cp) {
      return res.status(404).json({ message: "CP not found" });
    }

    if (cp.cp_status !== "APPROVED") {
      return res.status(403).json({ message: "Account not approved yet" });
    }

    if (cp.is_password_set) {
      return res.status(400).json({ message: "Account already setup" });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const pinHash = await bcrypt.hash(pin, 10);

    await prisma.cp.update({
      where: { cp_id: cp.cp_id },
      data: {
        password_hash: passwordHash,
        pin_hash: pinHash,
        is_password_set: true,
        is_pin_set: true,
        cp_status: "APPROVED",
        cp_activated_at: new Date(),
      },
    });

    return res.status(200).json({
      message: "Account setup successful. You can now login.",
    });

  } catch (error) {
    console.error("Setup Account Error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

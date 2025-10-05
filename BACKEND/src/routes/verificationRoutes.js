import express from "express";
import { authenticate } from "../middleware/authMiddleware.js";
import { completeVerification, getStatus, livenessStep } from "./verificationController.js";

const router = express.Router();

// Liveness step check
router.post("/liveness", authenticate, livenessStep);

// Complete verification
router.post("/complete", authenticate, completeVerification);

// Get verification status
router.get("/status", authenticate, getStatus);

export default router;

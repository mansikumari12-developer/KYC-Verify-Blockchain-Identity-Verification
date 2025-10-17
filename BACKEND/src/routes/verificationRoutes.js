// backend/src/routes/verificationRoutes.js
import express from "express";
import multer from "multer";
import {
  livenessStep,
  getVerificationStatus,
} from "../controllers/verificationController.js";
import { authenticate } from "../middleware/authMiddleware.js";

// Use memory storage for IPFS uploads
const upload = multer({ storage: multer.memoryStorage() });
const router = express.Router();

// ✅ Liveness step upload
router.post("/liveness", authenticate, upload.single("file"), livenessStep);

// ✅ Get verification status
router.get("/status", authenticate, getVerificationStatus);

export default router;

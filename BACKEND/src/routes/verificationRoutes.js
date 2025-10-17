// backend/src/routes/verificationRoutes.js

import express from "express";
import multer from "multer";
import { livenessStep } from "../controllers/verificationController.js";
import { authenticate } from "../middleware/authMiddleware.js"; // ✅ fixed import

// ✅ Use memory storage for IPFS uploads
const upload = multer({ storage: multer.memoryStorage() });

const router = express.Router();

// ✅ Liveness step upload route
// Frontend sends FormData: { step, file }
router.post("/liveness", authenticate, upload.single("file"), livenessStep);

export default router;

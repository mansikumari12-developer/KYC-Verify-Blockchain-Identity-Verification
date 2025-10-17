import express from "express";
import { authenticate } from "../middleware/authMiddleware.js";
import { uploadMiddleware, uploadDocument } from "../controllers/uploadController.js";

const router = express.Router();

router.post("/", authenticate, uploadMiddleware, uploadDocument);

export default router;

// backend/src/routes/uploadRoutes.js
import express from 'express';
import { authenticate } from '../middleware/authMiddleware.js';
import { uploadMiddleware, uploadDocument } from '../controllers/uploadController.js';

const router = express.Router();
router.use(authenticate);

// ✅ POST multiple documents
router.post('/', uploadMiddleware, uploadDocument);

export default router;

import express from 'express';
import { authenticate } from '../middleware/authMiddleware.js';
import { uploadMiddleware, uploadDocument, getDocument } from '../controllers/uploadController.js';

const router = express.Router();

router.use(authenticate);

router.post('/', uploadMiddleware, uploadDocument);
router.get('/:cid', getDocument);

export default router;
import express from 'express';
import { authenticate } from '../middleware/authMiddleware.js';
import { submitIdentity, getIdentity, updateIdentity } from '../controllers/identityController.js';

const router = express.Router();
router.use(authenticate);

router.post("/submit", submitIdentity);
router.get("/:userId", getIdentity);
router.put("/update", updateIdentity);

export default router;

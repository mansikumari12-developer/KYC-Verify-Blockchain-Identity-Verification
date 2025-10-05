import express from 'express';
import { authenticate } from '../middleware/authMiddleware.js';
import {
  grantAccess,
  revokeAccess,
  getAccessList,
  checkAccess
} from '../controllers/accessController.js';

const router = express.Router();

router.use(authenticate);

router.post('/grant', grantAccess);
router.post('/revoke', revokeAccess);
router.get('/:userId', getAccessList);
router.get('/check/:targetUserId', checkAccess);

export default router;
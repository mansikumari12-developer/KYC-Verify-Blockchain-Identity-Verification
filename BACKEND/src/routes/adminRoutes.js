import express from 'express';
import { authenticate, authorize, logRequest } from '../middleware/authMiddleware.js';
import {
  getAllUsers,
  updateUserRole,
  getLogs,
  getSystemStats
} from '../controllers/adminController.js';

const router = express.Router();

router.use(authenticate);
router.use(authorize('admin'));
router.use(logRequest);

router.get('/users', getAllUsers);
router.post('/role/:userId', updateUserRole);
router.get('/logs', getLogs);
router.get('/stats', getSystemStats);

export default router;
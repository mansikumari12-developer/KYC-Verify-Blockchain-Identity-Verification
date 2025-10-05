import express from 'express';
import { authenticate } from '../middleware/authMiddleware.js';  // ✅ CORRECT PATH
import History from '../models/History.js';

const router = express.Router();

router.use(authenticate);

router.get('/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const { page = 1, limit = 20, action } = req.query;

    // Users can only see their own history unless they're admin/org
    if (req.user.role === 'user' && req.user._id.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    const query = { userId };
    if (action) query.action = action;

    const history = await History.find(query)
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await History.countDocuments(query);

    res.json({
      success: true,
      data: {
        history,
        pagination: {
          current: parseInt(page),
          pages: Math.ceil(total / limit),
          total
        }
      }
    });
  } catch (error) {
    console.error('Get history error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get history',
      error: error.message
    });
  }
});

export default router;
import express from 'express';
import multer from 'multer';
import { authenticate } from '../middleware/authMiddleware.js'
import {
  submitIdentity,
  getIdentity,
  updateIdentity
} from '../controllers/identityController.js';

// Initialize router
const router = express.Router();

// 🧩 Configure Multer storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, './dataToSave/uploads'); // create this folder in your backend root if it doesn’t exist
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

// Middleware for single file upload
const upload = multer({ storage });

// Protect routes
router.use(authenticate);

// 🧾 Routes
router.post('/submit', upload.single('file'), submitIdentity);
router.get('/:userId', getIdentity);
router.put('/update', upload.single('file'), updateIdentity);

export default router;

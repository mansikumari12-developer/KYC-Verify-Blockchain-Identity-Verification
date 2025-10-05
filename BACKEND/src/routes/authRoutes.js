import express from 'express';
import { register, login, walletLogin, googleLogin, githubLogin } from '../controllers/authController.js';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.post('/wallet', walletLogin);
router.post('/google', googleLogin);
router.post('/github', githubLogin);

export default router;
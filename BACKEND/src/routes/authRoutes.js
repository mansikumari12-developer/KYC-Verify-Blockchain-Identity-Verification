import express from "express";
import {
  register,
  login,
  walletLogin,
} from "../controllers/authController.js";

const router = express.Router();

// 🔹 Auth Routes
router.post("/register", register);
router.post("/login", login);
router.post("/wallet", walletLogin); // ✅ frontend calls /api/auth/wallet

export default router;

import User from "../models/User.js";
import { generateToken } from "../utils/generateToken.js";

// 🟢 REGISTER (Email + Password)
export const register = async (req, res) => {
  try {
    const { email, password, name } = req.body;

    if (!email || !password || !name) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "User already exists",
      });
    }

    const user = await User.create({
      email: email.toLowerCase(),
      password,
      name,
    });

    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      message: "User registered successfully",
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          walletAddress: user.walletAddress || null,
        },
        token,
      },
    });
  } catch (error) {
    console.error("❌ Registration error:", error);
    res.status(500).json({
      success: false,
      message: "Registration failed",
      error: error.message,
    });
  }
};

// 🟡 LOGIN (Email + Password)
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    const token = generateToken(user._id);

    res.status(200).json({
      success: true,
      message: "Login successful",
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          walletAddress: user.walletAddress || null,
        },
        token,
      },
    });
  } catch (error) {
    console.error("❌ Login error:", error);
    res.status(500).json({
      success: false,
      message: "Login failed",
      error: error.message,
    });
  }
};

// 🟣 WALLET LOGIN (MetaMask)
export const walletLogin = async (req, res) => {
  try {
    const { walletAddress } = req.body;

    if (!walletAddress) {
      return res.status(400).json({
        success: false,
        message: "Wallet address is required",
      });
    }

    // Check if wallet already exists
    let user = await User.findOne({
      walletAddress: walletAddress.toLowerCase(),
    });

    if (!user) {
      // Create new user with wallet only
      user = await User.create({
        name: "Wallet User",
        email: `${walletAddress.toLowerCase()}@walletuser.io`,
        password: walletAddress, // dummy password (hash saved)
        walletAddress: walletAddress.toLowerCase(),
      });
    }

    const token = generateToken(user._id);

    res.status(200).json({
      success: true,
      message: "Wallet login successful",
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          walletAddress: user.walletAddress,
        },
        token,
      },
    });
  } catch (error) {
    console.error("❌ Wallet login error:", error);
    res.status(500).json({
      success: false,
      message: "Wallet login failed",
      error: error.message,
    });
  }
};

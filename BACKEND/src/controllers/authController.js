import User from '../models/User.js';
import { generateToken } from '../utils/generateToken.js';

export const register = async (req, res) => {
  try {
    const { email, password, name, walletAddress } = req.body;

    console.log('Register request:', { email, name });

    // Check if user exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User already exists'
      });
    }

    // Create user
    const user = await User.create({
      email: email.toLowerCase(),
      password,
      name,
      walletAddress: walletAddress?.toLowerCase()
    });

    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email
        },
        token
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Registration failed',
      error: error.message
    });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    console.log('Login request:', { email });

    // Find user
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Check password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    const token = generateToken(user._id);

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email
        },
        token
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Login failed',
      error: error.message
    });
  }
};

// Simple versions for other methods
export const walletLogin = async (req, res) => {
  res.json({
    success: true,
    message: 'Wallet login successful (demo)',
    data: {
      user: { id: 1, name: 'Wallet User', email: 'wallet@test.com' },
      token: 'wallet_jwt_token'
    }
  });
};

export const googleLogin = async (req, res) => {
  res.json({
    success: true,
    message: 'Google login successful (demo)',
    data: {
      user: { id: 1, name: 'Google User', email: 'google@test.com' },
      token: 'google_jwt_token'
    }
  });
};

export const githubLogin = async (req, res) => {
  res.json({
    success: true,
    message: 'GitHub login successful (demo)',
    data: {
      user: { id: 1, name: 'GitHub User', email: 'github@test.com' },
      token: 'github_jwt_token'
    }
  });
};
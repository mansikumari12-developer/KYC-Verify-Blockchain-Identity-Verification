import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import Log from '../models/Log.js';

export const authenticate = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ 
        success: false, 
        message: 'Access denied. No token provided.' 
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId);
    
    if (!user) {
      return res.status(401).json({ 
        success: false, 
        message: 'Token is valid but user not found.' 
      });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(401).json({ 
      success: false, 
      message: 'Invalid token.' 
    });
  }
};

export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ 
        success: false, 
        message: 'Access denied. Insufficient permissions.' 
      });
    }
    next();
  };
};

// Logging middleware
export const logRequest = async (req, res, next) => {
  const start = Date.now();
  
  res.on('finish', async () => {
    try {
      await Log.create({
        userId: req.user?._id,
        userEmail: req.user?.email,
        action: `${req.method} ${req.route?.path || req.path}`,
        endpoint: req.originalUrl,
        ipAddress: req.ip || req.connection.remoteAddress,
        userAgent: req.get('User-Agent'),
        requestBody: req.method !== 'GET' ? req.body : undefined,
        responseStatus: res.statusCode,
        error: res.statusCode >= 400 ? res.statusMessage : undefined
      });
    } catch (error) {
      console.error('Logging error:', error);
    }
  });

  next();
};
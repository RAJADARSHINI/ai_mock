import jwt from 'jsonwebtoken';
import User from '../models/User.js';

/**
 * Middleware to protect routes
 */
export const protect = async (req, res, next) => {
  try {
    let token;
    
    // Get token from header
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }
    
    if (!token) {
      return res.status(401).json({
        success: false,
        error: 'Not authorized to access this route'
      });
    }
    
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    
    // Get user from token
    let user;
    try {
      user = await User.findById(decoded.id).select('-password');
    } catch (dbError) {
      // Database not available, create demo user
      user = {
        _id: decoded.id,
        username: 'demo-user',
        email: 'demo@example.com',
        statistics: {
          totalInterviews: 0,
          averageScore: 0,
          totalTimeSpent: 0
        },
        save: async () => {} // Mock save function
      };
    }
    
    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'User not found'
      });
    }
    
    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      error: 'Not authorized to access this route'
    });
  }
};

/**
 * Middleware to check admin role
 */
export const admin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({
      success: false,
      error: 'Not authorized as admin'
    });
  }
};

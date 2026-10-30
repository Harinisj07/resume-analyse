import authService from '../services/auth.service.js';
import User from '../models/user.model.js';

/**
 * Protect routes: requires a valid Bearer JWT token
 */
export const protect = async (req, res, next) => {
  try {
    let token = null;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. No authentication token provided.',
      });
    }

    const decoded = authService.verifyToken(token);
    const user = await User.findById(decoded.id).select('-password');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid session. User no longer exists.',
      });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: error.message || 'Unauthorized: Token is invalid or expired.',
    });
  }
};

/**
 * Optional authentication: attaches user if token is valid, otherwise sets req.user = null
 */
export const optionalAuth = async (req, res, next) => {
  try {
    let token = null;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (token) {
      try {
        const decoded = authService.verifyToken(token);
        const user = await User.findById(decoded.id).select('-password');
        req.user = user || null;
      } catch {
        req.user = null;
      }
    } else {
      req.user = null;
    }

    next();
  } catch {
    req.user = null;
    next();
  }
};

export default { protect, optionalAuth };

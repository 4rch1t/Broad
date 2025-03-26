const jwt = require('jsonwebtoken');
const User = require('../models/user.model');
const logger = require('../utils/logger');

/**
 * Authenticate user middleware
 */
exports.authenticate = async (req, res, next) => {
  try {
    // Get token from header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        status: 'error',
        message: 'Authentication required. Please log in.'
      });
    }

    const token = authHeader.split(' ')[1];

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Check if user exists
    const user = await User.findById(decoded.id).select('-password');
    if (!user) {
      return res.status(401).json({
        status: 'error',
        message: 'The user belonging to this token no longer exists'
      });
    }

    // Check if user is active
    if (!user.isActive) {
      return res.status(401).json({
        status: 'error',
        message: 'Your account has been deactivated. Please contact support.'
      });
    }

    // Set user in request
    req.user = user;
    next();
  } catch (error) {
    logger.error('Authentication error:', error);
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        status: 'error',
        message: 'Invalid token. Please log in again.'
      });
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        status: 'error',
        message: 'Your token has expired. Please log in again.'
      });
    }
    
    res.status(500).json({
      status: 'error',
      message: 'An error occurred during authentication'
    });
  }
};

/**
 * Authorize roles middleware
 * @param {Array} roles - Array of allowed roles
 */
exports.authorize = (roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        status: 'error',
        message: 'You do not have permission to perform this action'
      });
    }
    next();
  };
};

/**
 * Check if user is the owner or has admin/coach role
 * @param {String} paramName - Name of the parameter containing the resource ID
 * @param {Function} getOwnerId - Function to get the owner ID from the resource
 */
exports.checkOwnership = (paramName, getOwnerId) => {
  return async (req, res, next) => {
    try {
      const resourceId = req.params[paramName];
      
      // Admin and coaches can access all resources
      if (['admin', 'coach'].includes(req.user.role)) {
        return next();
      }
      
      // Get the owner ID of the resource
      const ownerId = await getOwnerId(resourceId);
      
      // Check if the user is the owner
      if (ownerId && ownerId.toString() === req.user._id.toString()) {
        return next();
      }
      
      res.status(403).json({
        status: 'error',
        message: 'You do not have permission to access this resource'
      });
    } catch (error) {
      logger.error('Ownership check error:', error);
      res.status(500).json({
        status: 'error',
        message: 'An error occurred while checking permissions'
      });
    }
  };
};
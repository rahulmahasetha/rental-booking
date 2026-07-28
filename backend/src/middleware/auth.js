const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'supersecretcarrentaljwttokenkey2026');
      
      req.user = await User.findById(decoded.id);
      if (!req.user) {
        return res.status(401).json({ success: false, message: 'User associated with token no longer exists.' });
      }
      
      next();
    } catch (error) {
      console.error('[Auth Layer Error]: Token verification failed', error.message);
      return res.status(401).json({ success: false, message: 'Not authorized, invalid token.' });
    }
  }

  if (!token) {
    return res.status(401).json({ success: false, message: 'Not authorized, token missing.' });
  }
};

module.exports = { protect };

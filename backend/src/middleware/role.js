const authorizeAdmin = (req, res, next) => {
  if (req.user && req.user.role === 'Admin') {
    next();
  } else {
    res.status(403).json({ 
      success: false, 
      message: 'Access denied. Requires Admin access privileges.' 
    });
  }
};

module.exports = { authorizeAdmin };

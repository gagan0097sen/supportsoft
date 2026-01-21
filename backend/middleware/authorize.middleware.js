/**
 * Authorization Middleware - Check user role
 */
export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }
    console.log('Authorizing user with role:', req.user.role, 'for roles:', roles);
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ 
        success: false, 
        message: `Access denied. Required role(s): ${roles.join(', ')}` 
      });
    }

    next();
  };
};

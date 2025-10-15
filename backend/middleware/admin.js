const admin = async (req, res, next) => {
  console.log('🔍 Admin middleware - User:', req.user?.username, 'isAdmin:', req.user?.isAdmin, 'isSuperAdmin:', req.user?.isSuperAdmin);
  try {
    if (!req.user) {
      console.log('❌ Admin middleware - No user found');
      return res.status(401).json({ message: 'Authentication required' });
    }

    // Check if user is admin or super admin
    if (!req.user.isAdmin && !req.user.isSuperAdmin) {
      console.log('❌ Admin middleware - User is not admin or super admin');
      return res.status(403).json({ message: 'Admin access required' });
    }

    console.log('✅ Admin middleware - Access granted for:', req.user.username);
    next();
  } catch (error) {
    console.error('Admin middleware error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = admin; 
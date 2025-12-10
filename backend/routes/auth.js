const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Application = require('../models/Application');
const router = express.Router();

// Middleware to verify JWT token
const auth = async (req, res, next) => {
  console.log('🔍 AUTH ROUTES MIDDLEWARE - This is the auth middleware from auth routes file');
  try {
    console.log('🔍 Auth middleware - Headers received:', Object.keys(req.headers));
    console.log('🔍 Auth middleware - Authorization header:', req.header('Authorization'));
    
    const token = req.header('Authorization')?.replace('Bearer ', '');
    console.log('🔍 Auth middleware - Token extracted:', token ? token.substring(0, 20) + '...' : 'null');
    
    if (!token) return res.status(401).json({ error: 'Access denied' });
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    console.log('🔍 Auth middleware - Token decoded, user ID:', decoded.id);
    
    const user = await User.findById(decoded.id);
    if (!user) return res.status(401).json({ error: 'Invalid token' });
    
    console.log('👤 Auth middleware - User loaded:', {
      id: user._id,
      username: user.username,
      email: user.email,
      isSuperAdmin: user.isSuperAdmin,
      isAdmin: user.isAdmin
    });
    
    req.user = user;
    next();
  } catch (error) {
    console.error('❌ Auth middleware error:', error);
    res.status(401).json({ error: 'Invalid token' });
  }
};

// Middleware to check if user is super admin
const superAdminAuth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    console.log('SuperAdminAuth - Token received:', !!token);
    
    if (!token) {
      console.log('SuperAdminAuth - No token provided');
      return res.status(401).json({ error: 'Access denied' });
    }
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    console.log('SuperAdminAuth - Token decoded, user ID:', decoded.id);
    
    const user = await User.findById(decoded.id);
    if (!user) {
      console.log('SuperAdminAuth - User not found');
      return res.status(401).json({ error: 'Invalid token' });
    }
    
    console.log('SuperAdminAuth - User found:', user.username, 'isSuperAdmin:', user.isSuperAdmin);
    
    if (!user.isSuperAdmin) {
      console.log('SuperAdminAuth - User is not super admin');
      return res.status(403).json({ error: 'Super admin access required' });
    }
    
    console.log('SuperAdminAuth - Access granted for super admin:', user.username);
    req.user = user;
    next();
  } catch (error) {
    console.error('SuperAdminAuth - Error:', error);
    res.status(401).json({ error: 'Invalid token' });
  }
};

// POST /api/auth/register
router.post('/register', async (req, res) => {
  try {
    const { username, name, email, password, phone } = req.body;
    
    // Validate required fields
    if (!username || !name || !email || !password || !phone) {
      return res.status(400).json({ 
        error: 'All fields are required: username, name, email, password, phone' 
      });
    }
    
    // Check if username already exists
    const existingUsername = await User.findOne({ username });
    if (existingUsername) {
      return res.status(400).json({ error: 'Username already exists' });
    }
    
    // Check if email already exists
    const existingEmail = await User.findOne({ email });
    if (existingEmail) {
      return res.status(400).json({ error: 'Email already exists' });
    }
    
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Create new user
    const user = new User({
      username,
      name,
      email,
      password: hashedPassword,
      phone
    });
    
    await user.save();
    
    // Create a free basic membership for new user
    try {
      const { Membership, MembershipTier } = require('../models/Membership');
      
      // Find or create Basic tier
      let basicTier = await MembershipTier.findOne({ name: 'Basic' });
      
      if (!basicTier) {
        // Create default Basic tier if it doesn't exist
        basicTier = new MembershipTier({
          name: 'Basic',
          slug: 'basic',
          description: 'Free basic membership for all registered users',
          price: 0,
          duration: 12, // 12 months
          features: [
            { name: 'Access to public events', included: true },
            { name: 'Newsletter subscription', included: true },
            { name: 'Member directory listing', included: true }
          ],
          benefits: [
            { title: 'Public Events', description: 'Access to all public club events' },
            { title: 'Newsletter', description: 'Monthly newsletter subscription' },
            { title: 'Directory', description: 'Listed in member directory' }
          ],
          isActive: true,
          createdBy: user._id
        });
        await basicTier.save();
        console.log('✅ Created Basic membership tier');
      }
      
      // Create membership for the new user
      const startDate = new Date();
      const endDate = new Date();
      endDate.setMonth(endDate.getMonth() + basicTier.duration);
      
      const membership = new Membership({
        user: user._id,
        tier: basicTier._id,
        status: 'active',
        startDate,
        endDate,
        amount: basicTier.price,
        totalAmount: basicTier.price,
        paymentMethod: 'free',
        paymentStatus: 'paid',
        autoRenew: true,
        createdBy: user._id
      });
      
      await membership.save();
      console.log('✅ Basic membership created for new user:', user.email);
    } catch (membershipError) {
      console.error('❌ Failed to create membership:', membershipError);
      // Don't fail registration if membership creation fails
    }
    
    // Send welcome email automatically
    try {
      const emailService = require('../services/emailService');
      await emailService.sendWelcomeEmail(user);
      console.log('✅ Welcome email sent to new user:', user.email);
    } catch (emailError) {
      console.error('❌ Failed to send welcome email:', emailError);
      // Don't fail registration if email fails
    }
    
    // Set registration fee from settings and create payment notification
    try {
      const Settings = require('../models/Settings');
      const Notification = require('../models/Notification');
      
      const settings = await Settings.findOne();
      const registrationFee = settings?.fees?.registration?.baseAmount || settings?.registrationFee || 50;
      
      // Update user with registration payment info
      user.registrationPaymentStatus = 'pending';
      user.registrationPaymentAmount = registrationFee;
      await user.save();
      
      // Create payment required notification
      await Notification.createNotification(
        user._id,
        user._id, // Self-notification
        'payment_required',
        '⚠️ Registration Payment Required',
        `Welcome to Seattle Leopards FC! To complete your registration and be assigned to a team, please pay the registration fee of $${registrationFee.toFixed(2)}. Go to your Account page to make a payment.`,
        null,
        null,
        { amount: registrationFee, type: 'registration' }
      );
      
      console.log('✅ Registration payment notification created for:', user.email);
    } catch (notifError) {
      console.error('❌ Failed to create payment notification:', notifError);
    }
    
    // Generate JWT token
    const token = jwt.sign(
      { 
        id: user._id,
        isSuperAdmin: user.isSuperAdmin,
        username: user.username,
        email: user.email
      }, 
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '7d' }
    );
    
    res.status(201).json({
      token,
      user: {
        id: user._id,
        username: user.username,
        name: user.name,
        email: user.email,
        phone: user.phone
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Registration failed' });
  }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { usernameOrEmail, password } = req.body;
    
    if (!usernameOrEmail || !password) {
      return res.status(400).json({ error: 'Username/Email and password are required' });
    }
    
    // Find user by username or email
    const user = await User.findOne({
      $or: [
        { username: usernameOrEmail },
        { email: usernameOrEmail.toLowerCase() }
      ]
    });
    
    if (!user) {
      return res.status(400).json({ error: 'Invalid username/email or password' });
    }
    
    // Check password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(400).json({ error: 'Invalid username/email or password' });
    }
    
    // Generate JWT token
    const token = jwt.sign(
      { 
        id: user._id,
        isSuperAdmin: user.isSuperAdmin,
        username: user.username,
        email: user.email
      }, 
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '7d' }
    );
    
    res.json({
      token,
      user: {
        id: user._id,
        username: user.username,
        name: user.name,
        email: user.email,
        phone: user.phone,
        isSuperAdmin: user.isSuperAdmin,
        team: user.team,
        coach: user.coach,
        program: user.program,
        createdAt: user.createdAt
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

// GET /api/auth/me (get current user)
router.get('/me', auth, async (req, res) => {
  try {
    console.log('🔍 /me endpoint called for user:', req.user.username);
    console.log('👑 User isSuperAdmin:', req.user.isSuperAdmin);
    console.log('👑 User isAdmin:', req.user.isAdmin);
    
    const response = {
      id: req.user._id,
      simpleId: req.user.simpleId,
      username: req.user.username,
      name: req.user.name,
      email: req.user.email,
      phone: req.user.phone,
      isSuperAdmin: req.user.isSuperAdmin,
      isAdmin: req.user.isAdmin,
      team: req.user.team,
      coach: req.user.coach,
      program: req.user.program,
      createdAt: req.user.createdAt
    };
    
    console.log('📡 Sending response:', JSON.stringify(response, null, 2));
    
    res.json(response);
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ error: 'Failed to get user data' });
  }
});

// PUT /api/auth/me (update profile)
router.put('/me', auth, async (req, res) => {
  try {
    const { name, password, phone, username } = req.body;
    const user = await User.findById(req.user.id);
  if (!user) return res.status(404).json({ error: 'User not found' });
    
    // Check if username is being changed and if it's already taken
    if (username && username !== user.username) {
      const existingUsername = await User.findOne({ username });
      if (existingUsername) {
        return res.status(400).json({ error: 'Username already exists' });
      }
      user.username = username;
    }
    
    if (name !== undefined) user.name = name;
    if (phone !== undefined) user.phone = phone;
    if (password) {
      user.password = await bcrypt.hash(password, 10);
    }
    
    await user.save();
    res.json({
      id: user._id,
      username: user.username,
      name: user.name,
      email: user.email,
      phone: user.phone,
      isSuperAdmin: user.isSuperAdmin,
      team: user.team,
      coach: user.coach,
      program: user.program,
      createdAt: user.createdAt
    });
  } catch (error) {
    console.error('Profile update error:', error);
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

// GET /api/auth/users (super admin only - get all users)
router.get('/users', superAdminAuth, async (req, res) => {
  try {
    const users = await User.find({}).select('-password').sort({ createdAt: -1 });
    res.json(users);
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ error: 'Failed to get users' });
  }
});

// GET /api/auth/user/:id (get specific user - for messaging)
router.get('/user/:id', auth, async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('username firstName lastName avatar');
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ error: 'Failed to get user' });
  }
});

// GET /api/auth/users/:id (super admin only - get specific user)
router.get('/users/:id', superAdminAuth, async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
  res.json(user);
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ error: 'Failed to get user' });
  }
});

// DELETE /api/auth/users/:id (super admin only - delete user)
router.delete('/users/:id', superAdminAuth, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Check if user has submitted any applications
    const applications = await Application.find({ email: user.email });
    if (applications.length > 0) {
      return res.status(400).json({ 
        error: 'Cannot delete user. User has submitted applications.' 
      });
    }

    // Delete the user
    await User.findByIdAndDelete(req.params.id);
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ error: 'Failed to delete user' });
  }
});

// GET /api/auth/privacy-settings (get user's privacy settings)
router.get('/privacy-settings', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json({ 
      privacySettings: user.privacySettings || {
        showEmail: true,
        showPhone: true,
        showContactInMarketplace: true,
        showContactInMessages: true,
        showContactInProfile: true
      }
    });
  } catch (error) {
    console.error('Get privacy settings error:', error);
    res.status(500).json({ error: 'Failed to get privacy settings' });
  }
});

// PUT /api/auth/privacy-settings (update user's privacy settings)
router.put('/privacy-settings', auth, async (req, res) => {
  try {
    const { privacySettings } = req.body;
    const user = await User.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Update privacy settings
    user.privacySettings = {
      ...user.privacySettings,
      ...privacySettings
    };
    
    await user.save();
    
    res.json({ 
      message: 'Privacy settings updated successfully',
      privacySettings: user.privacySettings
    });
  } catch (error) {
    console.error('Update privacy settings error:', error);
    res.status(500).json({ error: 'Failed to update privacy settings' });
  }
});

// Search users for messaging
router.get('/search', auth, async (req, res) => {
  try {
    const { q } = req.query;
    
    if (!q || q.trim().length < 2) {
      return res.json([]);
    }

    const users = await User.find({
      $or: [
        { username: { $regex: q, $options: 'i' } },
        { firstName: { $regex: q, $options: 'i' } },
        { lastName: { $regex: q, $options: 'i' } }
      ],
      _id: { $ne: req.user.id } // Exclude current user
    })
    .select('username firstName lastName avatar')
    .limit(10);

    res.json(users);
  } catch (error) {
    console.error('Error searching users:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// PUT /api/auth/admin/reset-password (super admin only - reset user password)
router.put('/admin/reset-password', superAdminAuth, async (req, res) => {
  try {
    const { userId, newPassword, reason } = req.body;
    
    // Validate required fields
    if (!userId || !newPassword || !reason) {
      return res.status(400).json({ 
        error: 'All fields are required: userId, newPassword, reason' 
      });
    }
    
    // Validate password strength
    if (newPassword.length < 6) {
      return res.status(400).json({ 
        error: 'Password must be at least 6 characters long' 
      });
    }
    
    // Find the user to reset password for
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    
    // Update the user's password
    user.password = hashedPassword;
    
    // Add password reset record
    if (!user.passwordResets) {
      user.passwordResets = [];
    }
    
    user.passwordResets.push({
      resetBy: req.user._id,
      resetByUsername: req.user.username,
      resetAt: new Date(),
      reason: reason,
      newPasswordLength: newPassword.length
    });
    
    await user.save();
    
    console.log(`🔐 Password reset for user ${user.username} by admin ${req.user.username}. Reason: ${reason}`);
    
    res.json({ 
      message: `Password successfully reset for user ${user.username}`,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        name: user.name
      }
    });
    
  } catch (error) {
    console.error('Password reset error:', error);
    res.status(500).json({ error: 'Failed to reset password' });
  }
});

// GET /api/auth/admin/password-resets (super admin only - get password reset history)
router.get('/admin/password-resets', superAdminAuth, async (req, res) => {
  try {
    const { userId, limit = 50, page = 1 } = req.query;
    
    let query = {};
    if (userId) {
      query['passwordResets.userId'] = userId;
    }
    
    const users = await User.find({
      'passwordResets.0': { $exists: true }
    })
    .select('username email name passwordResets')
    .sort({ 'passwordResets.resetAt': -1 })
    .limit(parseInt(limit))
    .skip((parseInt(page) - 1) * parseInt(limit));
    
    const totalUsers = await User.countDocuments({
      'passwordResets.0': { $exists: true }
    });
    
    res.json({
      users,
      totalUsers,
      currentPage: parseInt(page),
      totalPages: Math.ceil(totalUsers / parseInt(limit))
    });
    
  } catch (error) {
    console.error('Get password resets error:', error);
    res.status(500).json({ error: 'Failed to get password reset history' });
  }
});

// POST /api/auth/forgot-password
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }
    
    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      // Don't reveal if email exists or not for security
      return res.json({ message: 'If an account with this email exists, password reset instructions have been sent.' });
    }
    
    // Generate a temporary reset token (valid for 1 hour)
    const resetToken = jwt.sign(
      { userId: user._id, type: 'password-reset' },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '1h' }
    );
    
    // Store reset token in user document
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = new Date(Date.now() + 3600000); // 1 hour
    await user.save();
    
    // Send password reset email
    try {
      const emailService = require('../services/emailService');
      await emailService.sendPasswordResetEmail(user, resetToken);
      console.log('✅ Password reset email sent to:', user.email);
    } catch (emailError) {
      console.error('❌ Failed to send password reset email:', emailError);
      // Don't fail the request if email fails, but log it
    }
    
    console.log(`🔐 Password reset requested for user ${user.username} (${email})`);
    
    res.json({ 
      message: 'If an account with this email exists, password reset instructions have been sent.'
    });
    
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ message: 'An error occurred. Please try again.' });
  }
});

// POST /api/auth/forgot-username
router.post('/forgot-username', async (req, res) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }
    
    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      // Don't reveal if email exists or not for security
      return res.json({ message: 'If an account with this email exists, your username has been sent.' });
    }
    
    // Send username recovery email
    try {
      const emailService = require('../services/emailService');
      await emailService.sendUsernameRecoveryEmail(user);
      console.log('✅ Username recovery email sent to:', user.email);
    } catch (emailError) {
      console.error('❌ Failed to send username recovery email:', emailError);
      // Don't fail the request if email fails, but log it
    }
    
    console.log(`👤 Username recovery requested for email ${email}`);
    
    res.json({ 
      message: 'If an account with this email exists, your username has been sent.'
    });
    
  } catch (error) {
    console.error('Forgot username error:', error);
    res.status(500).json({ message: 'An error occurred. Please try again.' });
  }
});

// POST /api/auth/reset-password (with token)
router.post('/reset-password', async (req, res) => {
  try {
    const { token, newPassword } = req.body;
    
    if (!token || !newPassword) {
      return res.status(400).json({ message: 'Token and new password are required' });
    }
    
    // Verify the token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    
    if (decoded.type !== 'password-reset') {
      return res.status(400).json({ message: 'Invalid reset token' });
    }
    
    // Find user and check if token is still valid
    const user = await User.findById(decoded.userId);
    if (!user || user.resetPasswordToken !== token || user.resetPasswordExpires < new Date()) {
      return res.status(400).json({ message: 'Invalid or expired reset token' });
    }
    
    // Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    
    // Update password and clear reset token
    user.password = hashedPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();
    
    console.log(`🔐 Password successfully reset for user ${user.username}`);
    
    res.json({ message: 'Password has been successfully reset. You can now log in with your new password.' });
    
  } catch (error) {
    console.error('Reset password error:', error);
    if (error.name === 'JsonWebTokenError') {
      return res.status(400).json({ message: 'Invalid reset token' });
    }
    res.status(500).json({ message: 'An error occurred. Please try again.' });
  }
});


// Change password route
router.put('/change-password', auth, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: 'Current password and new password are required' });
    }
    
    if (newPassword.length < 6) {
      return res.status(400).json({ message: 'New password must be at least 6 characters long' });
    }
    
    // Verify current password
    const isCurrentPasswordValid = await bcrypt.compare(currentPassword, req.user.password);
    if (!isCurrentPasswordValid) {
      return res.status(400).json({ message: 'Current password is incorrect' });
    }
    
    // Hash new password
    const saltRounds = 10;
    const hashedNewPassword = await bcrypt.hash(newPassword, saltRounds);
    
    // Update user password
    await User.findByIdAndUpdate(req.user._id, { password: hashedNewPassword });
    
    console.log(`🔐 Password changed for user: ${req.user.email}`);
    
    res.json({ message: 'Password changed successfully' });
    
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({ message: 'An error occurred while changing password' });
  }
});

module.exports = { router, auth, superAdminAuth }; 
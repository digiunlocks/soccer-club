const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { auth, superAdminAuth } = require('./auth');
const emailService = require('../services/emailService');



// Get all users (super admin only)
router.get('/', superAdminAuth, async (req, res) => {
  try {
    const { search, role, team, program } = req.query;
    let filter = {};
    
    // Search by username, name, or email
    if (search) {
      filter.$or = [
        { username: { $regex: search, $options: 'i' } },
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }
    
    // Filter by role (admin status)
    if (role === 'admin') {
      filter.isSuperAdmin = true;
    } else if (role === 'user') {
      filter.isSuperAdmin = false;
    }
    
    // Filter by team
    if (team) {
      filter.team = { $regex: team, $options: 'i' };
    }
    
    // Filter by program
    if (program) {
      filter.program = { $regex: program, $options: 'i' };
    }
    
    const users = await User.find(filter)
      .select('-password -resetPasswordToken -resetPasswordExpires')
      .sort({ createdAt: -1 });
    
    res.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// Get user by ID (super admin only)
router.get('/:id', superAdminAuth, async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .select('-password -resetPasswordToken -resetPasswordExpires');
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json(user);
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ error: 'Failed to fetch user' });
  }
});

// Update user (super admin only)
router.put('/:id', superAdminAuth, async (req, res) => {
  try {
    const { name, email, phone, team, coach, program, isSuperAdmin } = req.body;
    
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Update fields
    if (name) user.name = name;
    if (email) user.email = email;
    if (phone) user.phone = phone;
    if (team !== undefined) user.team = team;
    if (coach !== undefined) user.coach = coach;
    if (program !== undefined) user.program = program;
    if (isSuperAdmin !== undefined) user.isSuperAdmin = isSuperAdmin;
    
    await user.save();
    
    const updatedUser = await User.findById(req.params.id)
      .select('-password -resetPasswordToken -resetPasswordExpires');
    
    res.json(updatedUser);
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({ error: 'Failed to update user' });
  }
});

// Delete user (super admin only)
router.delete('/:id', superAdminAuth, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Prevent deleting the last super admin
    if (user.isSuperAdmin) {
      const superAdminCount = await User.countDocuments({ isSuperAdmin: true });
      if (superAdminCount <= 1) {
        return res.status(400).json({ error: 'Cannot delete the last super admin' });
      }
    }
    
    await User.findByIdAndDelete(req.params.id);
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ error: 'Failed to delete user' });
  }
});

// Get user statistics (super admin only)
router.get('/stats/overview', superAdminAuth, async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const superAdmins = await User.countDocuments({ isSuperAdmin: true });
    const regularUsers = totalUsers - superAdmins;
    
    // Get users by team
    const teamStats = await User.aggregate([
      { $group: { _id: '$team', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);
    
    // Get users by program
    const programStats = await User.aggregate([
      { $group: { _id: '$program', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);
    
    // Get recent registrations (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const recentRegistrations = await User.countDocuments({
      createdAt: { $gte: thirtyDaysAgo }
    });
    
    res.json({
      totalUsers,
      superAdmins,
      regularUsers,
      teamStats,
      programStats,
      recentRegistrations
    });
  } catch (error) {
    console.error('Error fetching user stats:', error);
    res.status(500).json({ error: 'Failed to fetch user statistics' });
  }
});

// POST /api/users/send-welcome-emails - Send welcome emails to selected users
router.post('/send-welcome-emails', superAdminAuth, async (req, res) => {
  try {
    const { userIds } = req.body;
    
    if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
      return res.status(400).json({ error: 'User IDs array is required' });
    }
    
    // Find users by IDs
    const users = await User.find({ _id: { $in: userIds } })
      .select('_id name email username phone');
    
    if (users.length === 0) {
      return res.status(404).json({ error: 'No users found' });
    }
    
    // Send welcome emails
    const results = await emailService.sendBulkWelcomeEmails(users);
    
    const successCount = results.filter(r => r.success).length;
    const failureCount = results.filter(r => !r.success).length;
    
    res.json({
      success: true,
      message: `Welcome emails sent to ${successCount} users`,
      results: {
        total: results.length,
        successful: successCount,
        failed: failureCount,
        details: results
      }
    });
  } catch (error) {
    console.error('Error sending welcome emails:', error);
    res.status(500).json({ error: 'Failed to send welcome emails' });
  }
});

// POST /api/users/bulk-approve - Bulk approve users
router.post('/bulk-approve', superAdminAuth, async (req, res) => {
  try {
    const { userIds } = req.body;
    
    if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
      return res.status(400).json({ error: 'User IDs array is required' });
    }
    
    // Update users to active status
    const result = await User.updateMany(
      { _id: { $in: userIds } },
      { 
        $set: { 
          status: 'active',
          approvedAt: new Date(),
          approvedBy: req.user._id
        }
      }
    );
    
    // Get updated users for welcome emails
    const approvedUsers = await User.find({ _id: { $in: userIds } })
      .select('_id name email username phone');
    
    // Send welcome emails to approved users
    const emailResults = await emailService.sendBulkWelcomeEmails(approvedUsers);
    
    res.json({
      success: true,
      message: `${result.modifiedCount} users approved successfully`,
      approvedCount: result.modifiedCount,
      welcomeEmailsSent: emailResults.filter(r => r.success).length
    });
  } catch (error) {
    console.error('Error bulk approving users:', error);
    res.status(500).json({ error: 'Failed to bulk approve users' });
  }
});

// POST /api/users/export-new-users - Export new users data
router.post('/export-new-users', superAdminAuth, async (req, res) => {
  try {
    const { days = 30 } = req.body;
    
    // Calculate date range
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    
    // Find new users
    const newUsers = await User.find({
      createdAt: { $gte: startDate }
    }).select('name email phone role status createdAt lastActive team program');
    
    // Convert to CSV format
    const csvHeader = 'Name,Email,Phone,Role,Status,Registration Date,Last Login,Team,Program\n';
    const csvRows = newUsers.map(user => {
      const registrationDate = user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A';
      const lastLogin = user.lastActive || 'Never';
      const team = user.team || 'N/A';
      const program = user.program || 'N/A';
      
      return `"${user.name || 'N/A'}","${user.email || 'N/A'}","${user.phone || 'N/A'}","${user.role || 'N/A'}","${user.status || 'N/A'}","${registrationDate}","${lastLogin}","${team}","${program}"`;
    }).join('\n');
    
    const csvContent = csvHeader + csvRows;
    
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="new-users-${new Date().toISOString().split('T')[0]}.csv"`);
    res.send(csvContent);
  } catch (error) {
    console.error('Error exporting new users:', error);
    res.status(500).json({ error: 'Failed to export new users' });
  }
});

module.exports = router;

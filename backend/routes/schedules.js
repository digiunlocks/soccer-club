const express = require('express');
const router = express.Router();
const Schedule = require('../models/Schedule');
const { auth, superAdminAuth } = require('./auth');

// GET /api/schedules - Get all schedules (with filtering)
router.get('/', async (req, res) => {
  try {
    const {
      team,
      eventType,
      dateFrom,
      dateTo,
      location,
      status,
      isPublic,
      limit = 50,
      page = 1
    } = req.query;

    const query = {};

    // Apply filters
    if (team) query.team = team;
    if (eventType) query.eventType = eventType;
    if (location) query.location = location;
    if (status) query.status = status;
    if (isPublic !== undefined) query.isPublic = isPublic === 'true';

    // Date range filter
    if (dateFrom || dateTo) {
      query.startDate = {};
      if (dateFrom) query.startDate.$gte = new Date(dateFrom);
      if (dateTo) query.startDate.$lte = new Date(dateTo);
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const schedules = await Schedule.find(query)
      .sort({ startDate: 1, startTime: 1 })
      .skip(skip)
      .limit(parseInt(limit))
      .populate('createdBy', 'name username')
      .populate('updatedBy', 'name username');

    const total = await Schedule.countDocuments(query);

    res.json({
      schedules,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Error fetching schedules:', error);
    res.status(500).json({ error: 'Failed to fetch schedules' });
  }
});

// GET /api/schedules/public - Get public schedules
router.get('/public', async (req, res) => {
  try {
    const { team, eventType, dateFrom, dateTo, limit = 20 } = req.query;

    const query = { isPublic: true, status: 'scheduled' };

    if (team) query.team = team;
    if (eventType) query.eventType = eventType;

    if (dateFrom || dateTo) {
      query.startDate = {};
      if (dateFrom) query.startDate.$gte = new Date(dateFrom);
      if (dateTo) query.startDate.$lte = new Date(dateTo);
    }

    const schedules = await Schedule.find(query)
      .sort({ startDate: 1, startTime: 1 })
      .limit(parseInt(limit))
      .select('-participants -attendance -notes -createdBy -updatedBy');

    res.json(schedules);
  } catch (error) {
    console.error('Error fetching public schedules:', error);
    res.status(500).json({ error: 'Failed to fetch public schedules' });
  }
});

// GET /api/schedules/upcoming - Get upcoming events
router.get('/upcoming', async (req, res) => {
  try {
    const { limit = 10, team } = req.query;
    const query = {
      startDate: { $gte: new Date() },
      status: 'scheduled'
    };

    if (team) query.team = team;

    const schedules = await Schedule.find(query)
      .sort({ startDate: 1, startTime: 1 })
      .limit(parseInt(limit))
      .populate('createdBy', 'name username');

    res.json(schedules);
  } catch (error) {
    console.error('Error fetching upcoming schedules:', error);
    res.status(500).json({ error: 'Failed to fetch upcoming schedules' });
  }
});

// GET /api/schedules/team/:team - Get schedules for specific team
router.get('/team/:team', async (req, res) => {
  try {
    const { team } = req.params;
    const { status, dateFrom, dateTo } = req.query;

    const schedules = await Schedule.getByTeam(team, { status, dateFrom, dateTo });
    res.json(schedules);
  } catch (error) {
    console.error('Error fetching team schedules:', error);
    res.status(500).json({ error: 'Failed to fetch team schedules' });
  }
});

// GET /api/schedules/:id - Get specific schedule
router.get('/:id', async (req, res) => {
  try {
    const schedule = await Schedule.findById(req.params.id)
      .populate('createdBy', 'name username')
      .populate('updatedBy', 'name username')
      .populate('participants.userId', 'name username email')
      .populate('attendance.userId', 'name username');

    if (!schedule) {
      return res.status(404).json({ error: 'Schedule not found' });
    }

    res.json(schedule);
  } catch (error) {
    console.error('Error fetching schedule:', error);
    res.status(500).json({ error: 'Failed to fetch schedule' });
  }
});

// POST /api/schedules - Create new schedule (Super Admin only)
router.post('/', superAdminAuth, async (req, res) => {
  try {
    const scheduleData = {
      ...req.body,
      createdBy: req.user._id
    };

    const schedule = new Schedule(scheduleData);
    await schedule.save();

    const populatedSchedule = await Schedule.findById(schedule._id)
      .populate('createdBy', 'name username');

    res.status(201).json(populatedSchedule);
  } catch (error) {
    console.error('Error creating schedule:', error);
    if (error.name === 'ValidationError') {
      return res.status(400).json({ error: error.message });
    }
    res.status(500).json({ error: 'Failed to create schedule' });
  }
});

// PUT /api/schedules/:id - Update schedule (Super Admin only)
router.put('/:id', superAdminAuth, async (req, res) => {
  try {
    const scheduleData = {
      ...req.body,
      updatedBy: req.user._id
    };

    const schedule = await Schedule.findByIdAndUpdate(
      req.params.id,
      scheduleData,
      { new: true, runValidators: true }
    ).populate('createdBy', 'name username')
     .populate('updatedBy', 'name username');

    if (!schedule) {
      return res.status(404).json({ error: 'Schedule not found' });
    }

    res.json(schedule);
  } catch (error) {
    console.error('Error updating schedule:', error);
    if (error.name === 'ValidationError') {
      return res.status(400).json({ error: error.message });
    }
    res.status(500).json({ error: 'Failed to update schedule' });
  }
});

// DELETE /api/schedules/:id - Delete schedule (Super Admin only)
router.delete('/:id', superAdminAuth, async (req, res) => {
  try {
    const schedule = await Schedule.findByIdAndDelete(req.params.id);
    
    if (!schedule) {
      return res.status(404).json({ error: 'Schedule not found' });
    }

    res.json({ message: 'Schedule deleted successfully' });
  } catch (error) {
    console.error('Error deleting schedule:', error);
    res.status(500).json({ error: 'Failed to delete schedule' });
  }
});

// PUT /api/schedules/bulk - Bulk actions (Super Admin only)
router.put('/bulk', superAdminAuth, async (req, res) => {
  try {
    const { ids, action } = req.body;

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ error: 'No schedules selected' });
    }

    let updateData = {};
    let message = '';

    switch (action) {
      case 'delete':
        await Schedule.deleteMany({ _id: { $in: ids } });
        message = 'Schedules deleted successfully';
        break;
      case 'makePublic':
        updateData = { isPublic: true };
        message = 'Schedules made public successfully';
        break;
      case 'makePrivate':
        updateData = { isPublic: false };
        message = 'Schedules made private successfully';
        break;
      case 'cancel':
        updateData = { status: 'cancelled' };
        message = 'Schedules cancelled successfully';
        break;
      case 'complete':
        updateData = { status: 'completed' };
        message = 'Schedules marked as completed successfully';
        break;
      default:
        return res.status(400).json({ error: 'Invalid action' });
    }

    if (Object.keys(updateData).length > 0) {
      await Schedule.updateMany(
        { _id: { $in: ids } },
        { ...updateData, updatedBy: req.user._id }
      );
    }

    res.json({ message });
  } catch (error) {
    console.error('Error performing bulk action:', error);
    res.status(500).json({ error: 'Failed to perform bulk action' });
  }
});

// POST /api/schedules/:id/register - Register for event (Authenticated users)
router.post('/:id/register', auth, async (req, res) => {
  try {
    const schedule = await Schedule.findById(req.params.id);
    
    if (!schedule) {
      return res.status(404).json({ error: 'Schedule not found' });
    }

    if (!schedule.requiresRegistration) {
      return res.status(400).json({ error: 'This event does not require registration' });
    }

    if (schedule.maxParticipants && schedule.participants.length >= schedule.maxParticipants) {
      return res.status(400).json({ error: 'Event is full' });
    }

    // Check if user is already registered
    const alreadyRegistered = schedule.participants.some(
      p => p.userId.toString() === req.user._id.toString()
    );

    if (alreadyRegistered) {
      return res.status(400).json({ error: 'Already registered for this event' });
    }

    schedule.participants.push({
      userId: req.user._id,
      name: req.user.name,
      email: req.user.email
    });

    await schedule.save();
    res.json({ message: 'Successfully registered for event' });
  } catch (error) {
    console.error('Error registering for event:', error);
    res.status(500).json({ error: 'Failed to register for event' });
  }
});

// DELETE /api/schedules/:id/register - Unregister from event (Authenticated users)
router.delete('/:id/register', auth, async (req, res) => {
  try {
    const schedule = await Schedule.findById(req.params.id);
    
    if (!schedule) {
      return res.status(404).json({ error: 'Schedule not found' });
    }

    schedule.participants = schedule.participants.filter(
      p => p.userId.toString() !== req.user._id.toString()
    );

    await schedule.save();
    res.json({ message: 'Successfully unregistered from event' });
  } catch (error) {
    console.error('Error unregistering from event:', error);
    res.status(500).json({ error: 'Failed to unregister from event' });
  }
});

// POST /api/schedules/:id/attendance - Record attendance (Super Admin only)
router.post('/:id/attendance', superAdminAuth, async (req, res) => {
  try {
    const { userId, status, notes } = req.body;
    
    const schedule = await Schedule.findById(req.params.id);
    
    if (!schedule) {
      return res.status(404).json({ error: 'Schedule not found' });
    }

    // Remove existing attendance record for this user
    schedule.attendance = schedule.attendance.filter(
      a => a.userId.toString() !== userId
    );

    // Add new attendance record
    schedule.attendance.push({
      userId,
      status: status || 'present',
      notes
    });

    await schedule.save();
    res.json({ message: 'Attendance recorded successfully' });
  } catch (error) {
    console.error('Error recording attendance:', error);
    res.status(500).json({ error: 'Failed to record attendance' });
  }
});

// GET /api/schedules/stats - Get schedule statistics (Super Admin only)
router.get('/stats/overview', superAdminAuth, async (req, res) => {
  try {
    const now = new Date();
    const thisWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    const thisMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    const [total, thisWeekCount, thisMonthCount, upcoming] = await Promise.all([
      Schedule.countDocuments(),
      Schedule.countDocuments({ startDate: { $lte: thisWeek } }),
      Schedule.countDocuments({ startDate: { $lte: thisMonth } }),
      Schedule.countDocuments({ startDate: { $gt: now } })
    ]);

    res.json({
      total,
      thisWeek: thisWeekCount,
      thisMonth: thisMonthCount,
      upcoming
    });
  } catch (error) {
    console.error('Error fetching schedule stats:', error);
    res.status(500).json({ error: 'Failed to fetch schedule statistics' });
  }
});

module.exports = router; 
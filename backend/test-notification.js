const mongoose = require('mongoose');
const Notification = require('./models/Notification');
const User = require('./models/User');

const MONGODB_URI = 'mongodb://localhost:27017/soccer-club';

async function testNotifications() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Get a test user
    const testUser = await User.findOne();
    if (!testUser) {
      console.log('❌ No users found in database');
      return;
    }

    console.log('👤 Test user:', testUser.username);

    // Create a test notification
    const testNotification = await Notification.createNotification(
      testUser._id,
      testUser._id,
      'negotiation_offer',
      'Test Offer',
      'This is a test notification for offers',
      null,
      null,
      { test: true }
    );

    console.log('✅ Test notification created:', testNotification._id);

    // Fetch notifications for the user
    const notifications = await Notification.find({ recipient: testUser._id })
      .populate('sender', 'username')
      .sort({ createdAt: -1 });

    console.log('📬 User notifications:', notifications.length);
    notifications.forEach(notif => {
      console.log(`- ${notif.title}: ${notif.message} (${notif.type})`);
    });

    // Get unread count
    const unreadCount = await Notification.getUnreadCount(testUser._id);
    console.log('📊 Unread count:', unreadCount);

    // Clean up test notification
    await Notification.findByIdAndDelete(testNotification._id);
    console.log('🧹 Test notification cleaned up');

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
}

testNotifications();

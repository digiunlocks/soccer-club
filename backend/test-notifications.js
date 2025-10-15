const mongoose = require('mongoose');
const Notification = require('./models/Notification');
const User = require('./models/User');

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/soccer-club', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

async function testNotifications() {
  try {
    console.log('🧪 Testing notification system...');
    
    // Find a user to test with
    const user = await User.findOne();
    if (!user) {
      console.log('❌ No users found in database');
      return;
    }
    
    console.log('👤 Testing with user:', user.username);
    
    // Test creating a notification
    const testNotification = await Notification.createNotification(
      user._id,
      user._id, // Sending to self for testing
      'negotiation_offer',
      'Test Notification',
      'This is a test notification',
      null,
      null,
      { test: true }
    );
    
    console.log('✅ Test notification created:', testNotification._id);
    
    // Test getting unread count
    const unreadCount = await Notification.getUnreadCount(user._id);
    console.log('📊 Unread count:', unreadCount);
    
    // Test fetching notifications
    const notifications = await Notification.find({ recipient: user._id });
    console.log('📋 Total notifications for user:', notifications.length);
    
    // Clean up test notification
    await Notification.findByIdAndDelete(testNotification._id);
    console.log('🧹 Test notification cleaned up');
    
    console.log('✅ Notification system test completed successfully!');
    
  } catch (error) {
    console.error('❌ Error testing notifications:', error);
  } finally {
    mongoose.connection.close();
  }
}

testNotifications();

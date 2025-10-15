const mongoose = require('mongoose');
const Notification = require('./models/Notification');
const User = require('./models/User');
const MarketplaceItem = require('./models/MarketplaceItem');

const MONGODB_URI = 'mongodb://localhost:27017/soccer-club';

async function testNotificationsAPI() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Test 1: Check if Notification model works
    console.log('\n🧪 Test 1: Notification model');
    const notifications = await Notification.find({}).populate('recipient', 'username').populate('sender', 'username');
    console.log(`Found ${notifications.length} notifications in database`);

    // Test 2: Check if getUnreadCount method works
    console.log('\n🧪 Test 2: getUnreadCount method');
    if (notifications.length > 0) {
      const recipientId = notifications[0].recipient._id;
      const unreadCount = await Notification.getUnreadCount(recipientId);
      console.log(`Unread count for user ${recipientId}: ${unreadCount}`);
    }

    // Test 3: Check if populate works
    console.log('\n🧪 Test 3: Populate test');
    const testNotification = await Notification.findOne({})
      .populate('sender', 'username name')
      .populate('relatedItem', 'title images');
    
    if (testNotification) {
      console.log('✅ Populate works correctly');
      console.log('Sender:', testNotification.sender?.username);
      console.log('Related item:', testNotification.relatedItem?.title);
    } else {
      console.log('❌ No notifications found for populate test');
    }

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
}

testNotificationsAPI();

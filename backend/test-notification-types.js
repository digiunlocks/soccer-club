const mongoose = require('mongoose');
const Notification = require('./models/Notification');
const User = require('./models/User');

const MONGODB_URI = 'mongodb://localhost:27017/soccer-club';

async function testNotificationTypes() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Get all notifications
    const notifications = await Notification.find({}).populate('recipient', 'username').populate('sender', 'username');
    
    console.log(`📬 Found ${notifications.length} notifications:`);
    
    notifications.forEach((notif, index) => {
      console.log(`\n${index + 1}. Notification:`);
      console.log(`   Type: "${notif.type}"`);
      console.log(`   Title: "${notif.title}"`);
      console.log(`   Message: "${notif.message}"`);
      console.log(`   Recipient: ${notif.recipient?.username || 'Unknown'}`);
      console.log(`   Sender: ${notif.sender?.username || 'Unknown'}`);
      console.log(`   Read: ${notif.read}`);
      console.log(`   Created: ${notif.createdAt}`);
      
      // Test the categorization logic
      const category = notif.type.includes('negotiation') ? 'offers' : 'messages';
      console.log(`   Category: "${category}" (based on type.includes('negotiation'))`);
    });

    // Test the specific logic
    console.log('\n🧪 Testing categorization logic:');
    const testTypes = ['negotiation_offer', 'negotiation_response', 'message', 'other'];
    
    testTypes.forEach(type => {
      const category = type.includes('negotiation') ? 'offers' : 'messages';
      console.log(`   "${type}" -> "${category}"`);
    });

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
}

testNotificationTypes();

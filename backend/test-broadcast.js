const mongoose = require('mongoose');
const User = require('./models/User');
const Broadcast = require('./models/Broadcast');
const BroadcastDelivery = require('./models/BroadcastDelivery');

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/soccer-club', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

async function testBroadcastSystem() {
  try {
    console.log('🔍 Testing broadcast system...');
    
    // Check users
    const allUsers = await User.find({});
    console.log('📊 Total users in database:', allUsers.length);
    
    if (allUsers.length > 0) {
      console.log('👥 Sample users:');
      allUsers.slice(0, 3).forEach(user => {
        console.log(`  - ${user.username} (${user.email}) - SuperAdmin: ${user.isSuperAdmin}, Admin: ${user.isAdmin}`);
      });
    }
    
    // Check broadcasts
    const broadcasts = await Broadcast.find({});
    console.log('📢 Total broadcasts:', broadcasts.length);
    
    if (broadcasts.length > 0) {
      console.log('📋 Sample broadcasts:');
      broadcasts.slice(0, 3).forEach(broadcast => {
        console.log(`  - ${broadcast.title} (${broadcast.status}) - Target: ${broadcast.targetAudience}`);
      });
    }
    
    // Check delivery records
    const deliveries = await BroadcastDelivery.find({});
    console.log('📨 Total delivery records:', deliveries.length);
    
    if (deliveries.length > 0) {
      console.log('📬 Sample deliveries:');
      deliveries.slice(0, 3).forEach(delivery => {
        console.log(`  - Broadcast: ${delivery.broadcast}, User: ${delivery.user}, Status: ${delivery.status}`);
      });
    }
    
    // Test user filtering
    console.log('\n🔍 Testing user filtering...');
    
    const adminUsers = await User.find({ $or: [{ isSuperAdmin: true }, { isAdmin: true }] });
    console.log('👑 Admin users:', adminUsers.length);
    
    const playerUsers = await User.find({ team: { $exists: true, $ne: '' } });
    console.log('⚽ Player users:', playerUsers.length);
    
    const coachUsers = await User.find({ coach: { $exists: true, $ne: '' } });
    console.log('🏆 Coach users:', coachUsers.length);
    
    console.log('\n✅ Test completed!');
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    mongoose.connection.close();
  }
}

testBroadcastSystem();

const mongoose = require('mongoose');
const User = require('./models/User');
const MarketplaceItem = require('./models/MarketplaceItem');
const Notification = require('./models/Notification');

const MONGODB_URI = 'mongodb://localhost:27017/soccer-club';

async function testDirectMessage() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Get test users
    const buyer = await User.findOne({ username: { $ne: 'admin' } });
    const seller = await User.findOne({ username: { $ne: buyer?.username } });
    
    if (!buyer || !seller) {
      console.log('❌ Need at least 2 users for testing');
      return;
    }

    console.log('👤 Buyer:', buyer.username);
    console.log('👤 Seller:', seller.username);

    // Get a marketplace item by the seller
    const item = await MarketplaceItem.findOne({ author: seller._id });
    if (!item) {
      console.log('❌ No marketplace items found for seller');
      return;
    }

    console.log('📦 Item:', item.title, 'Price:', item.price);

    // Test direct message without offer
    console.log('\n📧 Testing direct message without offer...');
    await item.createNegotiation(buyer._id, 0, 'Hi, I am interested in this item!', 7);
    
    // Check if notification was created
    const notification1 = await Notification.findOne({
      recipient: seller._id,
      type: 'negotiation_offer'
    });

    if (notification1) {
      console.log('✅ Notification created for seller:', notification1.title);
      console.log('📧 Message:', notification1.message);
    } else {
      console.log('❌ No notification found for seller');
    }

    // Test direct message with offer
    console.log('\n💰 Testing direct message with offer...');
    const offerAmount = Math.floor(item.price * 0.8);
    await item.createNegotiation(buyer._id, offerAmount, `I can offer $${offerAmount} for this item.`, 7);
    
    // Check if notification was created
    const notification2 = await Notification.findOne({
      recipient: seller._id,
      type: 'negotiation_offer',
      'data.offerAmount': offerAmount
    });

    if (notification2) {
      console.log('✅ Notification created for seller:', notification2.title);
      console.log('📧 Message:', notification2.message);
    } else {
      console.log('❌ No notification found for seller');
    }

    // Check all notifications for seller
    const allNotifications = await Notification.find({ recipient: seller._id });
    console.log('\n📬 All notifications for seller:', allNotifications.length);
    allNotifications.forEach(notif => {
      console.log(`- ${notif.type}: ${notif.title} - ${notif.message}`);
    });

    console.log('\n🎉 Direct messaging test completed!');

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
}

testDirectMessage();

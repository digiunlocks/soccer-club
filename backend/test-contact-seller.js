const mongoose = require('mongoose');
const User = require('./models/User');
const MarketplaceItem = require('./models/MarketplaceItem');
const Notification = require('./models/Notification');

const MONGODB_URI = 'mongodb://localhost:27017/soccer-club';

async function testContactSeller() {
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

    // Test 1: Simple message without offer
    console.log('\n📧 Test 1: Simple message without offer...');
    await Notification.createNotification(
      item.author,
      buyer._id,
      'negotiation_offer',
      'New Message from Buyer',
      `${buyer.username} sent you a message about "${item.title}"`,
      item._id,
      null,
      { 
        offerAmount: 0, 
        buyerName: buyer.username,
        message: 'Hi, I am interested in this item!',
        itemTitle: item.title
      }
    );
    
    // Test 2: Message with offer
    console.log('\n💰 Test 2: Message with offer...');
    const offerAmount = Math.floor(item.price * 0.8);
    await Notification.createNotification(
      item.author,
      buyer._id,
      'negotiation_offer',
      'New Offer Received',
      `${buyer.username} made an offer of $${offerAmount} on your item "${item.title}"`,
      item._id,
      null,
      { 
        offerAmount: offerAmount, 
        buyerName: buyer.username,
        message: `I can offer $${offerAmount} for this item.`,
        itemTitle: item.title
      }
    );

    // Check all notifications for seller
    const allNotifications = await Notification.find({ recipient: seller._id });
    console.log('\n📬 All notifications for seller:', allNotifications.length);
    allNotifications.forEach(notif => {
      console.log(`- ${notif.type}: ${notif.title}`);
      console.log(`  Message: ${notif.message}`);
      console.log(`  Data:`, notif.data);
    });

    console.log('\n🎉 Contact seller test completed!');

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
}

testContactSeller();

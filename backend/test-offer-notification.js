const mongoose = require('mongoose');
const Notification = require('./models/Notification');
const User = require('./models/User');
const MarketplaceItem = require('./models/MarketplaceItem');

const MONGODB_URI = 'mongodb://localhost:27017/soccer-club';

async function testOfferNotification() {
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

    // Simulate creating a negotiation
    const initialOffer = Math.floor(item.price * 0.8);
    console.log('💰 Initial offer:', initialOffer);

    await item.createNegotiation(buyer._id, initialOffer, 'Test offer message', 7);
    console.log('✅ Negotiation created');

    // Check if notification was created
    const notification = await Notification.findOne({
      recipient: seller._id,
      type: 'negotiation_offer',
      'data.offerAmount': initialOffer
    });

    if (notification) {
      console.log('✅ Notification found for seller:', notification.title);
      console.log('📧 Message:', notification.message);
    } else {
      console.log('❌ No notification found for seller');
      
      // Check all notifications for seller
      const allNotifications = await Notification.find({ recipient: seller._id });
      console.log('📬 All notifications for seller:', allNotifications.length);
      allNotifications.forEach(notif => {
        console.log(`- ${notif.type}: ${notif.title}`);
      });
    }

    // Clean up
    await Notification.deleteMany({ 'data.test': true });
    console.log('🧹 Test notifications cleaned up');

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
}

testOfferNotification();

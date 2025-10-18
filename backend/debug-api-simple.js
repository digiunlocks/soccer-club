const mongoose = require('mongoose');
const MarketplaceItem = require('./models/MarketplaceItem');

const MONGODB_URI = 'mongodb://localhost:27017/soccer-club';

async function debugAPISimple() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Test the exact query from the API without populate
    const query = { status: 'approved' };
    console.log('🔍 Query:', query);

    const items = await MarketplaceItem.find(query)
      .sort({ createdAt: -1 })
      .limit(12);

    console.log(`📦 Found ${items.length} items with approved status`);
    
    if (items.length > 0) {
      console.log('\n=== Approved Items ===');
      items.forEach((item, index) => {
        console.log(`${index + 1}. ${item.title} - $${item.price} (${item.status})`);
        console.log(`   Seller ID: ${item.seller}`);
      });
    } else {
      console.log('❌ No approved items found');
    }

    // Test total count
    const total = await MarketplaceItem.countDocuments(query);
    console.log(`📊 Total approved items: ${total}`);

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
}

debugAPISimple();
































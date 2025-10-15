const mongoose = require('mongoose');
const MarketplaceItem = require('./models/MarketplaceItem');

const MONGODB_URI = 'mongodb://localhost:27017/soccer-club';

async function checkStatuses() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    const items = await MarketplaceItem.find({});
    console.log('\n=== Item Statuses ===');
    items.forEach(item => {
      console.log(`- ${item.title}: ${item.status || 'no status'}`);
    });

    // Check how many have 'approved' status
    const approvedCount = await MarketplaceItem.countDocuments({ status: 'approved' });
    console.log(`\n📊 Items with 'approved' status: ${approvedCount}`);
    
    const totalCount = await MarketplaceItem.countDocuments();
    console.log(`📊 Total items: ${totalCount}`);

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
}

checkStatuses();



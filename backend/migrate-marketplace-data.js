const mongoose = require('mongoose');
const MarketplaceItem = require('./models/MarketplaceItem');
const User = require('./models/User');

mongoose.connect('mongodb://localhost:27017/soccer-club', {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(async () => {
  console.log('Connected to MongoDB');
  
  try {
    // Get super admin user
    const superAdmin = await User.findOne({ isSuperAdmin: true });
    if (!superAdmin) {
      console.log('No super admin found');
      process.exit(1);
    }
    
    console.log('Super admin ID:', superAdmin._id);
    
    // Get all marketplace items
    const items = await MarketplaceItem.find({});
    console.log(`Found ${items.length} marketplace items to migrate`);
    
    for (const item of items) {
      console.log(`Migrating item: ${item.title}`);
      
      // Create update object with new schema
      const updateData = {
        seller: superAdmin._id,
        location: item.location || 'Seattle, WA',
        images: item.images && item.images.length > 0 ? item.images : ['/placeholder-item.jpg'],
        tags: item.tags || [],
        // Ensure required fields exist
        condition: item.condition || 'good',
        isNegotiable: item.isNegotiable || false
      };
      
      // Remove old fields that don't exist in new schema
      const fieldsToRemove = [
        'author', 'authorName', 'authorRating', 'authorReviewCount', 
        'contactInfo', 'privacySettings', 'flagCount', 'averageRating', 
        'reviewCount', 'featured', 'shipping', 'availability', 
        'negotiations', 'reviews', 'approvedAt', 'approvedBy'
      ];
      
      const unsetFields = {};
      for (const field of fieldsToRemove) {
        if (item[field] !== undefined) {
          unsetFields[field] = 1;
        }
      }
      
      if (Object.keys(unsetFields).length > 0) {
        updateData.$unset = unsetFields;
      }
      
      await MarketplaceItem.findByIdAndUpdate(item._id, updateData);
      console.log(`✅ Migrated: ${item.title}`);
    }
    
    console.log('🎉 Data migration completed!');
    
    // Test the API query
    const query = { status: 'approved' };
    const testItems = await MarketplaceItem.find(query)
      .populate('seller', 'name username email')
      .sort({ createdAt: -1 })
      .skip(0)
      .limit(12);
      
    console.log(`\n📊 API query now returns ${testItems.length} items`);
    
    if (testItems.length > 0) {
      console.log('\n📋 Sample migrated item:');
      console.log({
        id: testItems[0]._id,
        title: testItems[0].title,
        price: testItems[0].price,
        status: testItems[0].status,
        seller: testItems[0].seller,
        category: testItems[0].category,
        condition: testItems[0].condition,
        location: testItems[0].location
      });
    }
    
  } catch (error) {
    console.error('❌ Error during migration:', error);
  }
  
  process.exit(0);
}).catch(err => {
  console.error('❌ Connection error:', err);
  process.exit(1);
});


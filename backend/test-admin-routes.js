const mongoose = require('mongoose');
const User = require('./models/User');
const MarketplaceItem = require('./models/MarketplaceItem');

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/soccer-club', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

async function testAdminRoutes() {
  try {
    console.log('Testing admin routes...');
    
    // Check if we have a super admin user
    const adminUser = await User.findOne({ isSuperAdmin: true });
    if (!adminUser) {
      console.log('❌ No super admin user found');
      console.log('Creating super admin user...');
      
      const newAdmin = new User({
        username: 'admin',
        email: 'admin@soccerclub.com',
        password: 'admin123',
        isSuperAdmin: true,
        isAdmin: true
      });
      
      await newAdmin.save();
      console.log('✅ Super admin user created');
    } else {
      console.log('✅ Super admin user found:', adminUser.email);
    }
    
    // Check if we have marketplace items
    const itemCount = await MarketplaceItem.countDocuments();
    console.log(`📦 Total marketplace items: ${itemCount}`);
    
    if (itemCount === 0) {
      console.log('Creating sample marketplace items...');
      
      const sampleItems = [
        {
          title: 'Sample Soccer Ball',
          description: 'A high-quality soccer ball for practice',
          price: 25,
          category: 'equipment',
          condition: 'new',
          author: adminUser._id,
          authorName: 'admin',
          status: 'pending'
        },
        {
          title: 'Used Soccer Cleats',
          description: 'Size 10 soccer cleats in good condition',
          price: 15,
          category: 'footwear',
          condition: 'used',
          author: adminUser._id,
          authorName: 'admin',
          status: 'approved'
        }
      ];
      
      await MarketplaceItem.insertMany(sampleItems);
      console.log('✅ Sample items created');
    }
    
    console.log('✅ Admin routes test completed');
    
  } catch (error) {
    console.error('❌ Error testing admin routes:', error);
  } finally {
    mongoose.connection.close();
  }
}

testAdminRoutes();

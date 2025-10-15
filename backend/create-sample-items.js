const mongoose = require('mongoose');
const User = require('./models/User');
const MarketplaceItem = require('./models/MarketplaceItem');

const MONGODB_URI = 'mongodb://localhost:27017/soccer-club';

async function createSampleItems() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Get a user to be the seller
    const seller = await User.findOne();
    if (!seller) {
      console.log('❌ No users found');
      return;
    }

    console.log('👤 Seller:', seller.username);

    // Create sample items
    const sampleItems = [
      {
        title: 'Soccer Ball - Professional Grade',
        description: 'High-quality professional soccer ball, barely used. Perfect condition.',
        price: 45,
        category: 'equipment',
        subcategory: 'balls',
        condition: 'like-new',
        availability: 'available',
        author: seller._id,
        authorName: seller.username,
        images: [],
        location: {
          city: 'Seattle',
          state: 'WA',
          zipCode: '98101'
        },
        contactInfo: {
          phone: '555-1234',
          email: seller.email
        },
        privacySettings: {
          showContactInfo: true,
          showPhone: true,
          showEmail: true
        }
      },
      {
        title: 'Soccer Cleats - Size 9',
        description: 'Nike Mercurial cleats, excellent condition. Great for competitive play.',
        price: 75,
        category: 'apparel',
        subcategory: 'footwear',
        condition: 'good',
        availability: 'available',
        author: seller._id,
        authorName: seller.username,
        images: [],
        location: {
          city: 'Seattle',
          state: 'WA',
          zipCode: '98101'
        },
        contactInfo: {
          phone: '555-1234',
          email: seller.email
        },
        privacySettings: {
          showContactInfo: true,
          showPhone: true,
          showEmail: true
        }
      },
      {
        title: 'Goalkeeper Gloves',
        description: 'Professional goalkeeper gloves, size L. Perfect for serious goalkeepers.',
        price: 35,
        category: 'equipment',
        subcategory: 'gloves',
        condition: 'new',
        availability: 'available',
        author: seller._id,
        authorName: seller.username,
        images: [],
        location: {
          city: 'Seattle',
          state: 'WA',
          zipCode: '98101'
        },
        contactInfo: {
          phone: '555-1234',
          email: seller.email
        },
        privacySettings: {
          showContactInfo: true,
          showPhone: true,
          showEmail: true
        }
      }
    ];

    for (const itemData of sampleItems) {
      const item = new MarketplaceItem(itemData);
      await item.save();
      console.log(`✅ Created item: ${item.title} - $${item.price}`);
    }

    console.log('🎉 Sample items created successfully!');

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
}

createSampleItems();

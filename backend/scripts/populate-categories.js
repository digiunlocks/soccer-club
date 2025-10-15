const mongoose = require('mongoose');
const Category = require('../models/Category');
const User = require('../models/User');

// Default categories with subcategories
const defaultCategories = [
  {
    name: 'Soccer Equipment',
    description: 'All soccer-related equipment and gear',
    color: '#10B981',
    icon: '⚽',
    subcategories: [
      { name: 'Soccer Balls', description: 'Official and training soccer balls' },
      { name: 'Cleats', description: 'Soccer shoes and boots' },
      { name: 'Jerseys', description: 'Team and player jerseys' },
      { name: 'Shorts', description: 'Soccer shorts and pants' },
      { name: 'Socks', description: 'Soccer socks and shin guard socks' },
      { name: 'Gloves', description: 'Goalkeeper gloves' },
      { name: 'Shin Guards', description: 'Protective shin guards' }
    ]
  },
  {
    name: 'Training Equipment',
    description: 'Training aids and practice equipment',
    color: '#3B82F6',
    icon: '🏃',
    subcategories: [
      { name: 'Cones', description: 'Training cones and markers' },
      { name: 'Agility Ladders', description: 'Speed and agility training ladders' },
      { name: 'Resistance Bands', description: 'Training resistance bands' },
      { name: 'Training Vests', description: 'Practice bibs and vests' },
      { name: 'Goals', description: 'Portable and training goals' }
    ]
  },
  {
    name: 'Accessories',
    description: 'Soccer accessories and gear',
    color: '#8B5CF6',
    icon: '🎒',
    subcategories: [
      { name: 'Bags', description: 'Soccer bags and backpacks' },
      { name: 'Water Bottles', description: 'Sports water bottles' },
      { name: 'Towels', description: 'Sports towels' },
      { name: 'Headbands', description: 'Sweat bands and headbands' },
      { name: 'Wristbands', description: 'Sweat wristbands' }
    ]
  },
  {
    name: 'Books & Media',
    description: 'Soccer books, magazines, and media',
    color: '#F59E0B',
    icon: '📚',
    subcategories: [
      { name: 'Books', description: 'Soccer coaching and strategy books' },
      { name: 'Magazines', description: 'Soccer magazines and publications' },
      { name: 'DVDs', description: 'Training and match DVDs' },
      { name: 'Posters', description: 'Soccer posters and memorabilia' }
    ]
  },
  {
    name: 'Other',
    description: 'Miscellaneous soccer items',
    color: '#6B7280',
    icon: '📦',
    subcategories: [
      { name: 'Memorabilia', description: 'Soccer memorabilia and collectibles' },
      { name: 'Gift Items', description: 'Soccer-themed gifts' },
      { name: 'Miscellaneous', description: 'Other soccer-related items' }
    ]
  }
];

async function populateCategories() {
  try {
    console.log('🌱 Starting category population...');
    
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/soccer-club');
    console.log('✅ Connected to MongoDB');
    
    // Find an admin user to use as creator
    const adminUser = await User.findOne({ 
      $or: [{ isAdmin: true }, { isSuperAdmin: true }] 
    });
    
    if (!adminUser) {
      console.log('⚠️  No admin user found. Creating categories without creator...');
    }
    
    // Clear existing categories
    await Category.deleteMany({});
    console.log('🗑️  Cleared existing categories');
    
    // Create categories
    for (let i = 0; i < defaultCategories.length; i++) {
      const categoryData = defaultCategories[i];
      
      const category = new Category({
        ...categoryData,
        sortOrder: i,
        createdBy: adminUser ? adminUser._id : new mongoose.Types.ObjectId(),
        subcategories: categoryData.subcategories.map((sub, index) => ({
          ...sub,
          sortOrder: index
        }))
      });
      
      await category.save();
      console.log(`✅ Created category: ${category.name} with ${category.subcategories.length} subcategories`);
    }
    
    // Update item counts
    await Category.updateAllItemCounts();
    console.log('📊 Updated item counts for all categories');
    
    console.log('🎉 Category population completed successfully!');
    
  } catch (error) {
    console.error('❌ Error populating categories:', error);
  } finally {
    await mongoose.disconnect();
    console.log('👋 Disconnected from MongoDB');
  }
}

// Run if called directly
if (require.main === module) {
  require('dotenv').config();
  populateCategories()
    .then(() => process.exit(0))
    .catch(error => {
      console.error('Fatal error:', error);
      process.exit(1);
    });
}

module.exports = populateCategories;

const mongoose = require('mongoose');
const { MembershipTier } = require('../models/Membership');

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/soccer-club', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const sampleTiers = [
  {
    name: 'Basic Member',
    description: 'Essential membership with basic benefits and marketplace access',
    price: 25,
    duration: 12, // 12 months
    features: [
      { name: 'Marketplace Access', description: 'List up to 5 items per month', included: true },
      { name: 'Event Notifications', description: 'Receive notifications about club events', included: true },
      { name: 'Basic Support', description: 'Email support within 48 hours', included: true }
    ],
    benefits: [
      { title: 'Marketplace Access', description: 'Buy and sell items in the club marketplace', icon: 'FaShoppingCart' },
      { title: 'Event Updates', description: 'Stay informed about club activities', icon: 'FaCalendar' }
    ],
    maxMarketplaceListings: 5,
    prioritySupport: false,
    discountPercentage: 0,
    color: '#3B82F6',
    sortOrder: 1
  },
  {
    name: 'Premium Member',
    description: 'Enhanced membership with priority features and increased marketplace access',
    price: 50,
    duration: 12,
    features: [
      { name: 'Marketplace Access', description: 'List up to 15 items per month', included: true },
      { name: 'Priority Support', description: '24-hour response time', included: true },
      { name: 'Event Notifications', description: 'Receive notifications about club events', included: true },
      { name: 'Advanced Analytics', description: 'Access to detailed marketplace analytics', included: true }
    ],
    benefits: [
      { title: 'Enhanced Marketplace', description: 'More listings and priority placement', icon: 'FaStar' },
      { title: 'Priority Support', description: 'Faster response times for assistance', icon: 'FaHeadset' },
      { title: 'Analytics Dashboard', description: 'Detailed insights into your marketplace activity', icon: 'FaChartLine' }
    ],
    maxMarketplaceListings: 15,
    prioritySupport: true,
    discountPercentage: 10,
    color: '#10B981',
    sortOrder: 2
  },
  {
    name: 'VIP Member',
    description: 'Ultimate membership with all features and exclusive benefits',
    price: 100,
    duration: 12,
    features: [
      { name: 'Unlimited Marketplace', description: 'Unlimited marketplace listings', included: true },
      { name: 'VIP Support', description: 'Same-day response time', included: true },
      { name: 'Event Notifications', description: 'Receive notifications about club events', included: true },
      { name: 'Advanced Analytics', description: 'Access to detailed marketplace analytics', included: true },
      { name: 'Exclusive Events', description: 'Access to VIP-only events and activities', included: true },
      { name: 'Custom Branding', description: 'Custom profile branding and badges', included: true }
    ],
    benefits: [
      { title: 'Unlimited Access', description: 'No limits on marketplace listings', icon: 'FaInfinity' },
      { title: 'VIP Support', description: 'Same-day response and priority assistance', icon: 'FaCrown' },
      { title: 'Exclusive Events', description: 'Access to special VIP events and activities', icon: 'FaTicketAlt' },
      { title: 'Custom Branding', description: 'Personalized profile and exclusive badges', icon: 'FaPalette' }
    ],
    maxMarketplaceListings: -1, // Unlimited
    prioritySupport: true,
    discountPercentage: 20,
    color: '#F59E0B',
    sortOrder: 3
  },
  {
    name: 'Student Member',
    description: 'Discounted membership for students with essential benefits',
    price: 15,
    duration: 12,
    features: [
      { name: 'Marketplace Access', description: 'List up to 3 items per month', included: true },
      { name: 'Event Notifications', description: 'Receive notifications about club events', included: true },
      { name: 'Basic Support', description: 'Email support within 48 hours', included: true }
    ],
    benefits: [
      { title: 'Student Discount', description: 'Special pricing for students', icon: 'FaGraduationCap' },
      { title: 'Marketplace Access', description: 'Basic marketplace functionality', icon: 'FaShoppingCart' }
    ],
    maxMarketplaceListings: 3,
    prioritySupport: false,
    discountPercentage: 0,
    color: '#8B5CF6',
    sortOrder: 4
  }
];

async function populateTiers() {
  try {
    console.log('🗑️ Clearing existing membership tiers...');
    await MembershipTier.deleteMany({});
    
    console.log('📝 Creating sample membership tiers...');
    
    // Create a dummy user ID for createdBy field
    const dummyUserId = new mongoose.Types.ObjectId();
    
    for (const tierData of sampleTiers) {
      const tier = new MembershipTier({
        ...tierData,
        createdBy: dummyUserId
      });
      await tier.save();
      console.log(`✅ Created tier: ${tier.name}`);
    }
    
    console.log('🎉 Successfully populated membership tiers!');
    console.log(`📊 Created ${sampleTiers.length} membership tiers`);
    
    // Display summary
    const createdTiers = await MembershipTier.find().sort({ sortOrder: 1 });
    console.log('\n📋 Created Tiers:');
    createdTiers.forEach((tier, index) => {
      console.log(`${index + 1}. ${tier.name} - $${tier.price} (${tier.duration} months)`);
    });
    
  } catch (error) {
    console.error('❌ Error populating membership tiers:', error);
  } finally {
    mongoose.connection.close();
  }
}

populateTiers();

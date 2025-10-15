const mongoose = require('mongoose');
const MarketplaceItem = require('./models/MarketplaceItem');
const User = require('./models/User');

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/soccer_club', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

const sampleItems = [
  {
    title: "Nike Mercurial Vapor 14 Elite Cleats",
    description: "Professional grade soccer cleats in excellent condition. Size 10, barely used. Perfect for competitive play.",
    price: 85.00,
    category: "Cleats",
    subcategory: "Professional",
    brand: "Nike",
    size: "10",
    color: "White/Black",
    condition: "excellent",
    location: "Seattle, WA",
    isNegotiable: true,
    tags: ["nike", "mercurial", "cleats", "professional", "size-10"],
    images: ["/uploads/marketplace/images-1755062516212-776149232.png"],
    status: "approved",
    views: 24,
    rating: 4.5,
    ratingCount: 3,
    isFeatured: true
  },
  {
    title: "Adidas Predator Edge Soccer Ball",
    description: "Official match ball, size 5. Used for one season but still in great condition. Perfect for training or matches.",
    price: 45.00,
    category: "Soccer Balls",
    subcategory: "Match Balls",
    brand: "Adidas",
    size: "5",
    color: "White/Black",
    condition: "good",
    location: "Bellevue, WA",
    isNegotiable: false,
    tags: ["adidas", "predator", "soccer-ball", "match-ball", "size-5"],
    images: ["/uploads/marketplace/images-1755139261704-925908337.png"],
    status: "approved",
    views: 18,
    rating: 4.2,
    ratingCount: 2,
    isFeatured: false
  },
  {
    title: "Seattle Leopards Home Jersey 2024",
    description: "Official team jersey from last season. Size Large, green with white trim. Great condition, no stains or tears.",
    price: 35.00,
    category: "Jerseys",
    subcategory: "Team Jerseys",
    brand: "Nike",
    size: "L",
    color: "Green",
    condition: "like-new",
    location: "Seattle, WA",
    isNegotiable: true,
    tags: ["seattle-leopards", "jersey", "home", "team", "large"],
    images: ["/uploads/marketplace/images-1755142222818-752674466.png"],
    status: "approved",
    views: 32,
    rating: 4.8,
    ratingCount: 4,
    isFeatured: true
  },
  {
    title: "Goalkeeper Gloves - Professional Grade",
    description: "Professional goalkeeper gloves, size 9. Used for half a season. Excellent grip and protection.",
    price: 25.00,
    category: "Goalkeeper Gear",
    subcategory: "Gloves",
    brand: "Uhlsport",
    size: "9",
    color: "Black",
    condition: "good",
    location: "Redmond, WA",
    isNegotiable: false,
    tags: ["goalkeeper", "gloves", "uhlsport", "professional", "size-9"],
    images: ["/uploads/marketplace/images-1755293700654-870938692.png"],
    status: "approved",
    views: 12,
    rating: 4.0,
    ratingCount: 1,
    isFeatured: false
  },
  {
    title: "Shin Guards - Youth Size",
    description: "Youth shin guards, size Small. Barely used, perfect for young players. Includes ankle protection.",
    price: 15.00,
    category: "Shin Guards",
    subcategory: "Youth",
    brand: "Under Armour",
    size: "S",
    color: "Black",
    condition: "like-new",
    location: "Kirkland, WA",
    isNegotiable: true,
    tags: ["shin-guards", "youth", "under-armour", "small", "ankle-protection"],
    images: ["/uploads/marketplace/shinguards-1.jpg"],
    status: "approved",
    views: 8,
    rating: 4.5,
    ratingCount: 2,
    isFeatured: false
  },
  {
    title: "Soccer Training Cones Set",
    description: "Set of 20 training cones, perfect for drills and practice. Bright orange, easy to see. Like new condition.",
    price: 20.00,
    category: "Training Equipment",
    subcategory: "Cones",
    brand: "Generic",
    size: "Standard",
    color: "Orange",
    condition: "like-new",
    location: "Seattle, WA",
    isNegotiable: false,
    tags: ["training", "cones", "drills", "practice", "orange"],
    images: ["/uploads/marketplace/cones-1.jpg"],
    status: "approved",
    views: 15,
    rating: 4.3,
    ratingCount: 3,
    isFeatured: false
  },
  {
    title: "Adidas Tiro 19 Training Pants",
    description: "Professional training pants, size Medium. Comfortable and durable. Used for one season.",
    price: 30.00,
    category: "Shorts",
    subcategory: "Training",
    brand: "Adidas",
    size: "M",
    color: "Black",
    condition: "good",
    location: "Bellevue, WA",
    isNegotiable: true,
    tags: ["adidas", "tiro", "training-pants", "medium", "black"],
    images: ["/uploads/marketplace/pants-1.jpg"],
    status: "approved",
    views: 22,
    rating: 4.1,
    ratingCount: 2,
    isFeatured: false
  },
  {
    title: "Nike Soccer Backpack",
    description: "Large soccer backpack with ball compartment. Perfect for carrying gear to practice and games.",
    price: 40.00,
    category: "Bags",
    subcategory: "Backpacks",
    brand: "Nike",
    size: "Large",
    color: "Blue",
    condition: "excellent",
    location: "Seattle, WA",
    isNegotiable: false,
    tags: ["nike", "backpack", "soccer-bag", "large", "blue"],
    images: ["/uploads/marketplace/backpack-1.jpg"],
    status: "approved",
    views: 19,
    rating: 4.6,
    ratingCount: 3,
    isFeatured: false
  },
  {
    title: "Puma King Classic Cleats",
    description: "Classic leather cleats, size 8.5. Traditional design with modern comfort. Good condition.",
    price: 55.00,
    category: "Cleats",
    subcategory: "Classic",
    brand: "Puma",
    size: "8.5",
    color: "Black",
    condition: "good",
    location: "Redmond, WA",
    isNegotiable: true,
    tags: ["puma", "king", "classic", "leather", "size-8.5"],
    images: ["/uploads/marketplace/cleats-2.jpg"],
    status: "approved",
    views: 16,
    rating: 4.4,
    ratingCount: 2,
    isFeatured: false
  },
  {
    title: "Seattle Leopards Away Jersey 2023",
    description: "Previous season away jersey, size Medium. White with green accents. Good condition.",
    price: 25.00,
    category: "Jerseys",
    subcategory: "Team Jerseys",
    brand: "Nike",
    size: "M",
    color: "White",
    condition: "good",
    location: "Kirkland, WA",
    isNegotiable: true,
    tags: ["seattle-leopards", "jersey", "away", "team", "medium"],
    images: ["/uploads/marketplace/jersey-2.jpg"],
    status: "approved",
    views: 28,
    rating: 4.2,
    ratingCount: 3,
    isFeatured: false
  },
  {
    title: "Goalkeeper Jersey - Professional",
    description: "Professional goalkeeper jersey, size Large. Bright colors for visibility. Excellent condition.",
    price: 50.00,
    category: "Goalkeeper Gear",
    subcategory: "Jerseys",
    brand: "Uhlsport",
    size: "L",
    color: "Yellow",
    condition: "excellent",
    location: "Seattle, WA",
    isNegotiable: false,
    tags: ["goalkeeper", "jersey", "uhlsport", "professional", "yellow"],
    images: ["/uploads/marketplace/gk-jersey-1.jpg"],
    status: "approved",
    views: 14,
    rating: 4.7,
    ratingCount: 2,
    isFeatured: false
  },
  {
    title: "Soccer Socks - Team Pack",
    description: "Pack of 3 pairs of soccer socks, size Large. Team colors - green and white. New condition.",
    price: 12.00,
    category: "Socks",
    subcategory: "Team",
    brand: "Nike",
    size: "L",
    color: "Green/White",
    condition: "new",
    location: "Bellevue, WA",
    isNegotiable: false,
    tags: ["socks", "team", "nike", "large", "green-white"],
    images: ["/uploads/marketplace/socks-1.jpg"],
    status: "approved",
    views: 11,
    rating: 4.0,
    ratingCount: 1,
    isFeatured: false
  }
];

async function addSampleItems() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connection.asPromise();
    console.log('Connected to MongoDB successfully!');

    // Find a user to use as seller (or create one if needed)
    let seller = await User.findOne({});
    if (!seller) {
      console.log('No users found. Creating a test user...');
      seller = new User({
        name: 'Test Seller',
        username: 'testseller',
        email: 'seller@test.com',
        password: 'password123',
        role: 'user'
      });
      await seller.save();
      console.log('Test user created successfully!');
    }

    console.log(`Using seller: ${seller.name} (${seller._id})`);

    // Clear existing sample items
    console.log('Clearing existing sample items...');
    await MarketplaceItem.deleteMany({ 
      title: { $in: sampleItems.map(item => item.title) }
    });

    // Add sample items
    console.log('Adding sample marketplace items...');
    const itemsWithSeller = sampleItems.map(item => ({
      ...item,
      seller: seller._id
    }));

    const createdItems = await MarketplaceItem.insertMany(itemsWithSeller);
    console.log(`Successfully added ${createdItems.length} sample items!`);

    // Display summary
    console.log('\n=== Sample Items Added ===');
    createdItems.forEach((item, index) => {
      console.log(`${index + 1}. ${item.title} - $${item.price} (${item.condition})`);
    });

    console.log('\n=== Categories Available ===');
    const categories = [...new Set(createdItems.map(item => item.category))];
    categories.forEach(category => {
      const count = createdItems.filter(item => item.category === category).length;
      console.log(`${category}: ${count} items`);
    });

    console.log('\n=== Brands Available ===');
    const brands = [...new Set(createdItems.filter(item => item.brand).map(item => item.brand))];
    brands.forEach(brand => {
      const count = createdItems.filter(item => item.brand === brand).length;
      console.log(`${brand}: ${count} items`);
    });

    console.log('\n✅ Sample marketplace items added successfully!');
    console.log('You can now test the marketplace with real data.');

  } catch (error) {
    console.error('Error adding sample items:', error);
  } finally {
    await mongoose.connection.close();
    console.log('Database connection closed.');
  }
}

// Run the script
addSampleItems();

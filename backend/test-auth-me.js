const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const User = require('./models/User');

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/soccer-club', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

async function testAuthMe() {
  try {
    console.log('🔍 Testing /api/auth/me endpoint...');
    
    // Find the admin user
    const adminUser = await User.findOne({ email: 'admin@soccerclub.com' });
    
    if (!adminUser) {
      console.log('❌ Admin user not found');
      return;
    }
    
    console.log('👤 Admin user found:');
    console.log('   ID:', adminUser._id);
    console.log('   Username:', adminUser.username);
    console.log('   Email:', adminUser.email);
    console.log('   isSuperAdmin:', adminUser.isSuperAdmin);
    console.log('   isAdmin:', adminUser.isAdmin);
    
    // Create a JWT token for this user
    const token = jwt.sign(
      { id: adminUser._id },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '24h' }
    );
    
    console.log('🔑 Generated token:', token.substring(0, 50) + '...');
    
    // Simulate the /api/auth/me response
    const response = {
      id: adminUser._id,
      username: adminUser.username,
      name: adminUser.name,
      email: adminUser.email,
      phone: adminUser.phone,
      isSuperAdmin: adminUser.isSuperAdmin,
      team: adminUser.team,
      coach: adminUser.coach,
      program: adminUser.program,
      createdAt: adminUser.createdAt
    };
    
    console.log('📡 Simulated /api/auth/me response:');
    console.log(JSON.stringify(response, null, 2));
    
    // Test JWT verification
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
      console.log('✅ JWT verification successful:');
      console.log('   Decoded ID:', decoded.id);
      console.log('   Matches user ID:', decoded.id === adminUser._id.toString());
    } catch (error) {
      console.log('❌ JWT verification failed:', error.message);
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    mongoose.connection.close();
  }
}

testAuthMe();

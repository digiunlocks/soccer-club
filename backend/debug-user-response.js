const mongoose = require('mongoose');
const User = require('./models/User');

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/soccer-club', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

async function debugUserResponse() {
  try {
    console.log('🔍 Debugging user response...');
    
    // Find the admin user
    const adminUser = await User.findOne({ email: 'admin@soccerclub.com' });
    
    if (!adminUser) {
      console.log('❌ Admin user not found');
      return;
    }
    
    console.log('👤 Raw admin user from database:');
    console.log('   _id:', adminUser._id);
    console.log('   username:', adminUser.username);
    console.log('   email:', adminUser.email);
    console.log('   isSuperAdmin:', adminUser.isSuperAdmin);
    console.log('   isAdmin:', adminUser.isAdmin);
    console.log('   hasOwnProperty isSuperAdmin:', adminUser.hasOwnProperty('isSuperAdmin'));
    console.log('   typeof isSuperAdmin:', typeof adminUser.isSuperAdmin);
    
    // Test JSON serialization
    const userObj = adminUser.toObject();
    console.log('\n📦 User object after toObject():');
    console.log('   isSuperAdmin:', userObj.isSuperAdmin);
    console.log('   isAdmin:', userObj.isAdmin);
    
    // Test direct property access
    console.log('\n🔍 Direct property access:');
    console.log('   adminUser.isSuperAdmin:', adminUser.isSuperAdmin);
    console.log('   adminUser["isSuperAdmin"]:', adminUser["isSuperAdmin"]);
    console.log('   adminUser.get("isSuperAdmin"):', adminUser.get ? adminUser.get('isSuperAdmin') : 'get method not available');
    
    // Test schema fields
    console.log('\n📋 Schema fields:');
    const schemaFields = Object.keys(adminUser.schema.paths);
    console.log('   All schema fields:', schemaFields);
    console.log('   Has isSuperAdmin in schema:', schemaFields.includes('isSuperAdmin'));
    
    // Simulate the exact response from /api/auth/me
    const response = {
      id: adminUser._id,
      username: adminUser.username,
      name: adminUser.name,
      email: adminUser.email,
      phone: adminUser.phone,
      isSuperAdmin: adminUser.isSuperAdmin,
      isAdmin: adminUser.isAdmin,
      team: adminUser.team,
      coach: adminUser.coach,
      program: adminUser.program,
      createdAt: adminUser.createdAt
    };
    
    console.log('\n📡 Simulated /api/auth/me response:');
    console.log(JSON.stringify(response, null, 2));
    
    // Test if the field exists in the response
    console.log('\n✅ Response field check:');
    console.log('   response.isSuperAdmin:', response.isSuperAdmin);
    console.log('   response.hasOwnProperty("isSuperAdmin"):', response.hasOwnProperty('isSuperAdmin'));
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    mongoose.connection.close();
  }
}

debugUserResponse();

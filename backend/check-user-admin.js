const mongoose = require('mongoose');
const User = require('./models/User');

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/soccer-club', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

async function checkAndFixAdmin() {
  try {
    console.log('🔍 Checking admin user...');
    
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
    
    // Check if isSuperAdmin is missing or false
    if (!adminUser.isSuperAdmin) {
      console.log('🔧 Fixing admin user...');
      
      adminUser.isSuperAdmin = true;
      adminUser.isAdmin = true;
      
      await adminUser.save();
      
      console.log('✅ Admin user updated successfully');
      console.log('   isSuperAdmin:', adminUser.isSuperAdmin);
      console.log('   isAdmin:', adminUser.isAdmin);
    } else {
      console.log('✅ Admin user already has super admin privileges');
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    mongoose.connection.close();
  }
}

checkAndFixAdmin();

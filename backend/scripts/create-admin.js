#!/usr/bin/env node

/**
 * Script to create or update a super admin account
 * Usage: node scripts/create-admin.js [email] [password] [username]
 * 
 * Example:
 *   node scripts/create-admin.js admin@example.com mypassword123 admin
 */

require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');

const MONGODB_URI = process.env.NODE_ENV === 'production' 
  ? process.env.MONGO_URI_PROD 
  : process.env.MONGO_URI || 'mongodb://localhost:27017/soccer-club';

async function createAdmin() {
  try {
    // Connect to database
    await mongoose.connect(MONGODB_URI, {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });
    console.log('✅ Connected to MongoDB');

    // Get admin credentials from command line arguments or environment variables
    const adminEmail = process.argv[2] || process.env.ADMIN_EMAIL || 'admin@soccerclub.com';
    const adminPassword = process.argv[3] || process.env.ADMIN_PASSWORD || 'admin123';
    const adminUsername = process.argv[4] || process.env.ADMIN_USERNAME || 'admin';
    const adminName = process.argv[5] || process.env.ADMIN_NAME || 'Super Admin';
    const adminPhone = process.argv[6] || process.env.ADMIN_PHONE || '555-0000';

    // Validate inputs
    if (!adminEmail || !adminPassword || !adminUsername) {
      console.error('❌ Error: Email, password, and username are required');
      console.log('\nUsage: node scripts/create-admin.js [email] [password] [username] [name] [phone]');
      console.log('Example: node scripts/create-admin.js admin@example.com mypassword123 admin "Super Admin" "555-0000"');
      process.exit(1);
    }

    // Check if admin already exists
    const existingAdmin = await User.findOne({
      $or: [
        { email: adminEmail },
        { username: adminUsername }
      ]
    });

    if (existingAdmin) {
      // Update existing admin
      const hashedPassword = await bcrypt.hash(adminPassword, 10);
      existingAdmin.password = hashedPassword;
      existingAdmin.isSuperAdmin = true;
      if (adminName) existingAdmin.name = adminName;
      if (adminPhone) existingAdmin.phone = adminPhone;
      await existingAdmin.save();
      console.log(`✅ Super admin updated successfully!`);
      console.log(`   Email: ${adminEmail}`);
      console.log(`   Username: ${adminUsername}`);
      console.log(`   Password: ${adminPassword}`);
    } else {
      // Create new admin
      const hashedPassword = await bcrypt.hash(adminPassword, 10);
      const newAdmin = new User({
        username: adminUsername,
        name: adminName,
        email: adminEmail,
        password: hashedPassword,
        phone: adminPhone,
        isSuperAdmin: true
      });
      await newAdmin.save();
      console.log(`✅ Super admin created successfully!`);
      console.log(`   Email: ${adminEmail}`);
      console.log(`   Username: ${adminUsername}`);
      console.log(`   Password: ${adminPassword}`);
    }

    console.log('\n📝 Login Credentials:');
    console.log(`   Email/Username: ${adminEmail} or ${adminUsername}`);
    console.log(`   Password: ${adminPassword}`);
    console.log('\n🔐 You can now log in to the admin dashboard!');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

createAdmin();


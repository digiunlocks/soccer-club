#!/usr/bin/env node

/**
 * Script to check and reset admin account
 * This script will:
 * 1. Check if admin account exists
 * 2. Reset password to default (admin123) or provided password
 * 3. Ensure isSuperAdmin is set to true
 * 4. Display login credentials
 * 
 * Usage: node scripts/reset-admin.js [new-password]
 * 
 * Example:
 *   node scripts/reset-admin.js
 *   node scripts/reset-admin.js mynewpassword123
 */

require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');

const MONGODB_URI = process.env.NODE_ENV === 'production' 
  ? process.env.MONGO_URI_PROD 
  : process.env.MONGO_URI || 'mongodb://localhost:27017/soccer-club';

async function resetAdmin() {
  try {
    // Connect to database
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI, {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });
    console.log('✅ Connected to MongoDB\n');

    // Get admin credentials
    const adminEmail = process.argv[2] || process.env.ADMIN_EMAIL || 'admin@soccerclub.com';
    const adminPassword = process.argv[3] || process.env.ADMIN_PASSWORD || 'admin123';
    const adminUsername = process.env.ADMIN_USERNAME || 'admin';
    const adminName = process.env.ADMIN_NAME || 'Super Admin';
    const adminPhone = process.env.ADMIN_PHONE || '555-0000';

    console.log('🔍 Checking for admin account...');
    console.log(`   Looking for: ${adminEmail} or ${adminUsername}\n`);

    // Find admin by email or username
    const existingAdmin = await User.findOne({
      $or: [
        { email: adminEmail },
        { username: adminUsername }
      ]
    });

    if (existingAdmin) {
      console.log('✅ Admin account found!');
      console.log(`   Email: ${existingAdmin.email}`);
      console.log(`   Username: ${existingAdmin.username}`);
      console.log(`   Name: ${existingAdmin.name}`);
      console.log(`   isSuperAdmin: ${existingAdmin.isSuperAdmin}`);
      console.log(`   Created: ${existingAdmin.createdAt}\n`);

      // Reset password and update all fields
      console.log('🔐 Resetting password and updating account...');
      const hashedPassword = await bcrypt.hash(adminPassword, 10);
      
      // Check if username needs to change (and if it's available)
      if (existingAdmin.username !== adminUsername) {
        const usernameTaken = await User.findOne({ 
          username: adminUsername,
          _id: { $ne: existingAdmin._id }
        });
        if (usernameTaken) {
          console.log(`⚠️  Username "${adminUsername}" is already taken. Keeping current username: ${existingAdmin.username}`);
        } else {
          existingAdmin.username = adminUsername;
          console.log(`✅ Username updated to: ${adminUsername}`);
        }
      }
      
      existingAdmin.password = hashedPassword;
      existingAdmin.isSuperAdmin = true; // Ensure admin status
      existingAdmin.email = adminEmail; // Ensure email is correct
      existingAdmin.name = adminName; // Update name
      existingAdmin.phone = adminPhone; // Update phone
      await existingAdmin.save();
      
      console.log('✅ Password reset successfully!\n');
    } else {
      console.log('❌ Admin account not found. Creating new admin account...\n');
      
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
      console.log('✅ Admin account created successfully!\n');
    }

    // Verify the account works by testing login
    console.log('🧪 Testing login credentials...');
    const testAdmin = await User.findOne({
      $or: [
        { email: adminEmail },
        { username: adminUsername }
      ]
    });

    if (testAdmin) {
      const passwordMatch = await bcrypt.compare(adminPassword, testAdmin.password);
      if (passwordMatch) {
        console.log('✅ Login test passed!\n');
      } else {
        console.log('❌ Login test failed - password mismatch!\n');
      }
    }

    // Display final credentials
    console.log('═══════════════════════════════════════════════════════');
    console.log('📝 ADMIN LOGIN CREDENTIALS');
    console.log('═══════════════════════════════════════════════════════');
    console.log(`   Email:    ${adminEmail}`);
    console.log(`   Username: ${adminUsername}`);
    console.log(`   Password: ${adminPassword}`);
    console.log('═══════════════════════════════════════════════════════\n');
    console.log('🔐 You can now log in using either:');
    console.log(`   - Email: ${adminEmail}`);
    console.log(`   - Username: ${adminUsername}`);
    console.log(`   - Password: ${adminPassword}\n`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

resetAdmin();


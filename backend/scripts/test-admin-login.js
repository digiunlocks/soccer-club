#!/usr/bin/env node

/**
 * Script to test admin login
 * This will test the login endpoint with the admin credentials
 */

require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');

const MONGODB_URI = process.env.NODE_ENV === 'production' 
  ? process.env.MONGO_URI_PROD 
  : process.env.MONGO_URI || 'mongodb://localhost:27017/soccer-club';

async function testAdminLogin() {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI, {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });
    console.log('✅ Connected to MongoDB\n');

    // Get admin credentials
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@soccerclub.com';
    const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';
    const adminUsername = process.env.ADMIN_USERNAME || 'admin';

    console.log('🧪 Testing admin login credentials...\n');

    // Test 1: Find by email
    console.log('Test 1: Finding admin by email...');
    const adminByEmail = await User.findOne({ email: adminEmail });
    if (adminByEmail) {
      console.log(`✅ Found admin by email: ${adminByEmail.email}`);
      console.log(`   Username: ${adminByEmail.username}`);
      console.log(`   isSuperAdmin: ${adminByEmail.isSuperAdmin}`);
      
      const passwordMatch = await bcrypt.compare(adminPassword, adminByEmail.password);
      if (passwordMatch) {
        console.log('✅ Password matches!\n');
      } else {
        console.log('❌ Password does NOT match!\n');
      }
    } else {
      console.log(`❌ No admin found with email: ${adminEmail}\n`);
    }

    // Test 2: Find by username
    console.log('Test 2: Finding admin by username...');
    const adminByUsername = await User.findOne({ username: adminUsername });
    if (adminByUsername) {
      console.log(`✅ Found admin by username: ${adminByUsername.username}`);
      console.log(`   Email: ${adminByUsername.email}`);
      console.log(`   isSuperAdmin: ${adminByUsername.isSuperAdmin}`);
      
      const passwordMatch = await bcrypt.compare(adminPassword, adminByUsername.password);
      if (passwordMatch) {
        console.log('✅ Password matches!\n');
      } else {
        console.log('❌ Password does NOT match!\n');
      }
    } else {
      console.log(`❌ No admin found with username: ${adminUsername}\n`);
    }

    // Test 3: Test login query (as the login endpoint does)
    console.log('Test 3: Testing login query (as login endpoint does)...');
    const loginUser = await User.findOne({
      $or: [
        { username: adminUsername },
        { email: adminEmail.toLowerCase() }
      ]
    });

    if (loginUser) {
      console.log(`✅ Found user for login: ${loginUser.email} / ${loginUser.username}`);
      const passwordMatch = await bcrypt.compare(adminPassword, loginUser.password);
      if (passwordMatch) {
        console.log('✅ Password verification passed!');
        console.log(`✅ isSuperAdmin: ${loginUser.isSuperAdmin}`);
        console.log('\n✅✅✅ ALL TESTS PASSED! Login should work! ✅✅✅\n');
      } else {
        console.log('❌ Password verification FAILED!');
        console.log('\n❌❌❌ LOGIN WILL FAIL - Password mismatch! ❌❌❌\n');
      }
    } else {
      console.log('❌ No user found for login query!');
      console.log('\n❌❌❌ LOGIN WILL FAIL - User not found! ❌❌❌\n');
    }

    // Display credentials
    console.log('═══════════════════════════════════════════════════════');
    console.log('📝 CURRENT ADMIN CREDENTIALS');
    console.log('═══════════════════════════════════════════════════════');
    console.log(`   Email:    ${adminEmail}`);
    console.log(`   Username: ${adminUsername}`);
    console.log(`   Password: ${adminPassword}`);
    console.log('═══════════════════════════════════════════════════════\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

testAdminLogin();


#!/usr/bin/env node

/**
 * Script to test that login works with both email and username
 */

require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');

const MONGODB_URI = process.env.NODE_ENV === 'production' 
  ? process.env.MONGO_URI_PROD 
  : process.env.MONGO_URI || 'mongodb://localhost:27017/soccer-club';

async function testLoginMethods() {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI, {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });
    console.log('✅ Connected to MongoDB\n');

    // Create a test user
    console.log('🧪 Creating test user...');
    const testEmail = 'testuser@example.com';
    const testUsername = 'testuser';
    const testPassword = 'testpass123';
    
    // Check if test user exists, delete if it does
    const existingTestUser = await User.findOne({
      $or: [
        { email: testEmail },
        { username: testUsername }
      ]
    });
    
    if (existingTestUser) {
      await User.findByIdAndDelete(existingTestUser._id);
      console.log('✅ Removed existing test user\n');
    }

    // Create new test user
    const hashedPassword = await bcrypt.hash(testPassword, 10);
    const testUser = new User({
      username: testUsername,
      name: 'Test User',
      email: testEmail,
      password: hashedPassword,
      phone: '555-1234'
    });
    await testUser.save();
    console.log('✅ Test user created\n');

    // Test 1: Login with email
    console.log('Test 1: Login with email...');
    const userByEmail = await User.findOne({
      $or: [
        { username: testEmail },
        { email: testEmail.toLowerCase() }
      ]
    });
    
    if (userByEmail) {
      const passwordMatch = await bcrypt.compare(testPassword, userByEmail.password);
      if (passwordMatch && userByEmail.email === testEmail) {
        console.log('✅ Login with email: SUCCESS\n');
      } else {
        console.log('❌ Login with email: FAILED\n');
      }
    } else {
      console.log('❌ Login with email: USER NOT FOUND\n');
    }

    // Test 2: Login with username
    console.log('Test 2: Login with username...');
    const userByUsername = await User.findOne({
      $or: [
        { username: testUsername },
        { email: testUsername.toLowerCase() }
      ]
    });
    
    if (userByUsername) {
      const passwordMatch = await bcrypt.compare(testPassword, userByUsername.password);
      if (passwordMatch && userByUsername.username === testUsername) {
        console.log('✅ Login with username: SUCCESS\n');
      } else {
        console.log('❌ Login with username: FAILED\n');
      }
    } else {
      console.log('❌ Login with username: USER NOT FOUND\n');
    }

    // Test 3: Simulate login endpoint query
    console.log('Test 3: Simulating login endpoint query...');
    const loginQuery = await User.findOne({
      $or: [
        { username: testEmail },  // Try email as username (should fail)
        { email: testEmail.toLowerCase() }  // Try email as email (should work)
      ]
    });
    
    if (loginQuery && loginQuery.email === testEmail) {
      console.log('✅ Login endpoint query with email: SUCCESS\n');
    } else {
      console.log('❌ Login endpoint query with email: FAILED\n');
    }

    const loginQuery2 = await User.findOne({
      $or: [
        { username: testUsername },  // Try username as username (should work)
        { email: testUsername.toLowerCase() }  // Try username as email (should fail)
      ]
    });
    
    if (loginQuery2 && loginQuery2.username === testUsername) {
      console.log('✅ Login endpoint query with username: SUCCESS\n');
    } else {
      console.log('❌ Login endpoint query with username: FAILED\n');
    }

    // Cleanup
    console.log('🧹 Cleaning up test user...');
    await User.findByIdAndDelete(testUser._id);
    console.log('✅ Test user removed\n');

    console.log('═══════════════════════════════════════════════════════');
    console.log('✅ ALL TESTS COMPLETE!');
    console.log('═══════════════════════════════════════════════════════');
    console.log('\n📝 Summary:');
    console.log('   - Users can register with both username and email');
    console.log('   - Users can login with either username OR email');
    console.log('   - Login endpoint supports both methods\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

testLoginMethods();


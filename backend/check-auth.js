const jwt = require('jsonwebtoken');
const User = require('./models/User');

// This is a simple test to check if JWT tokens are working
function testAuth() {
  console.log('Testing authentication...');
  
  // Test with a sample token (this won't work, but shows the structure)
  const sampleToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2ODljMjBiNmU5NzRiMmFkYzExYzc4M2QiLCJpYXQiOjE3MzQ1MTc2MDgsImV4cCI6MTczNDYwNDAwOH0.example';
  
  try {
    const decoded = jwt.verify(sampleToken, process.env.JWT_SECRET || 'your-secret-key');
    console.log('Token decoded:', decoded);
  } catch (error) {
    console.log('Token verification failed (expected):', error.message);
  }
  
  console.log('Auth test completed');
}

testAuth();

const fetch = require('node-fetch');

async function testRoutes() {
  const baseUrl = 'http://localhost:5000/api/marketplace';
  
  console.log('Testing marketplace routes...\n');
  
  const routes = [
    '/public',
    '/admin/all-items',
    '/admin/moderation-queue',
    '/admin/statistics'
  ];
  
  for (const route of routes) {
    try {
      console.log(`Testing: ${route}`);
      const response = await fetch(`${baseUrl}${route}`);
      console.log(`Status: ${response.status}`);
      
      if (response.ok) {
        const data = await response.json();
        console.log(`Data: ${JSON.stringify(data).substring(0, 100)}...`);
      } else {
        console.log(`Error: ${response.statusText}`);
      }
      console.log('---');
    } catch (error) {
      console.log(`Error: ${error.message}`);
      console.log('---');
    }
  }
}

testRoutes();

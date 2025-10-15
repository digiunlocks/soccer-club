const fetch = require('node-fetch');

async function testCookieEndpoint() {
  try {
    console.log('🧪 Testing cookie endpoint...');
    
    const response = await fetch('http://localhost:5000/api/settings/cookie');
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ Cookie endpoint is working!');
      console.log('📄 Title:', data.cookiePageTitle);
      console.log('📝 Content length:', data.cookiePageContent.length, 'characters');
      console.log('🕒 Last updated:', data.lastUpdated);
      
      // Check if content contains expected sections
      const content = data.cookiePageContent.toLowerCase();
      const hasWhatAreCookies = content.includes('what are cookies');
      const hasHowWeUse = content.includes('how we use cookies');
      const hasManaging = content.includes('managing your cookie preferences');
      
      console.log('\n📋 Content sections found:');
      console.log('  - What Are Cookies:', hasWhatAreCookies ? '✅' : '❌');
      console.log('  - How We Use Cookies:', hasHowWeUse ? '✅' : '❌');
      console.log('  - Managing Preferences:', hasManaging ? '✅' : '❌');
      
    } else {
      console.log('❌ Cookie endpoint failed:', response.status, response.statusText);
    }
    
  } catch (error) {
    console.log('❌ Error testing cookie endpoint:', error.message);
  }
}

testCookieEndpoint();

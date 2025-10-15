const mongoose = require('mongoose');
const Advertisement = require('./models/Advertisement');

async function checkAdvertisements() {
  try {
    // Connect to MongoDB
    await mongoose.connect('mongodb://localhost:27017/soccer-club');
    
    console.log('Connected to MongoDB');
    
    // Check what's in the database
    const ads = await Advertisement.find({});
    console.log(`\nFound ${ads.length} advertisements in database:`);
    
    if (ads.length === 0) {
      console.log('❌ No advertisements found in database');
    } else {
      ads.forEach((ad, index) => {
        console.log(`${index + 1}. "${ad.title}" - Type: ${ad.type} - Visible: ${ad.visible} - Featured: ${ad.featured}`);
      });
    }
    
    // Check visible advertisements
    const visibleAds = await Advertisement.find({ visible: true });
    console.log(`\nVisible advertisements: ${visibleAds.length}`);
    
    // Test the getActive method
    const activeAds = await Advertisement.getActive();
    console.log(`\ngetActive() returns: ${activeAds.length} advertisements`);
    
    mongoose.connection.close();
    console.log('\nDatabase connection closed');
    
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

checkAdvertisements(); 
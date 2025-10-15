const mongoose = require('mongoose');
const HeroTextSettings = require('./models/HeroTextSettings');

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/soccer-club', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

async function testHeroTextSettings() {
  try {
    console.log('Testing Hero Text Settings...');
    
    // Create default settings
    const defaultSettings = new HeroTextSettings({
      caption: "Welcome to Seattle Leopards FC",
      subtitle: "Building Champions, Creating Memories",
      buttonText: "Join Now",
      buttonLink: "/join",
      enabled: true,
      textPosition: "center",
      textColor: "white",
      backgroundColor: "rgba(0,0,0,0.4)",
      fontSize: {
        caption: "clamp(2rem, 5vw, 4rem)",
        subtitle: "clamp(1rem, 2.5vw, 1.5rem)"
      }
    });
    
    await defaultSettings.save();
    console.log('✅ Default hero text settings created successfully!');
    console.log('Settings:', defaultSettings);
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    mongoose.connection.close();
  }
}

testHeroTextSettings();


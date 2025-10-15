const mongoose = require('mongoose');
const Team = require('./models/Team');

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/soccer-club', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const sampleTeam = {
  name: "U18 Thunder Hawks",
  ageGroup: "Under 18",
  level: "Competitive",
  status: "Active",
  coach: "Coach Mike Rodriguez",
  assistantCoach: "Assistant Coach Sarah Chen",
  maxPlayers: 22,
  currentPlayers: 18,
  practiceDays: "Monday, Wednesday, Friday",
  practiceTime: "4:00 PM - 6:00 PM",
  gameDay: "Saturday",
  gameTime: "2:00 PM",
  location: "Seattle Soccer Complex - Field 3",
  fees: 450,
  season: "Fall 2024",
  description: "Elite U18 competitive team focused on skill development and tournament success. Open tryouts in August.",
  visible: true,
  players: [
    { name: "Alex Thompson", position: "Goalkeeper", jersey: 1 },
    { name: "Jordan Martinez", position: "Defender", jersey: 2 },
    { name: "Tyler Williams", position: "Defender", jersey: 3 },
    { name: "Ryan Chen", position: "Defender", jersey: 4 },
    { name: "Marcus Johnson", position: "Defender", jersey: 5 },
    { name: "David Kim", position: "Midfielder", jersey: 6 },
    { name: "Ethan Davis", position: "Midfielder", jersey: 7 },
    { name: "Lucas Rodriguez", position: "Midfielder", jersey: 8 },
    { name: "Brandon Lee", position: "Midfielder", jersey: 9 },
    { name: "Chris Wilson", position: "Forward", jersey: 10 },
    { name: "Kevin O'Connor", position: "Forward", jersey: 11 },
    { name: "Derek Brown", position: "Forward", jersey: 12 },
    { name: "Sean Murphy", position: "Midfielder", jersey: 13 },
    { name: "Jake Anderson", position: "Defender", jersey: 14 },
    { name: "Nick Garcia", position: "Forward", jersey: 15 },
    { name: "Mike Taylor", position: "Midfielder", jersey: 16 },
    { name: "Robbie Clark", position: "Goalkeeper", jersey: 17 },
    { name: "Zach Foster", position: "Defender", jersey: 18 }
  ]
};

async function createSampleTeam() {
  try {
    // Check if team already exists
    const existingTeam = await Team.findOne({ name: sampleTeam.name });
    if (existingTeam) {
      console.log('Team already exists:', existingTeam.name);
      return;
    }

    // Create the team
    const team = new Team(sampleTeam);
    await team.save();
    
    console.log('✅ Sample U18 team created successfully!');
    console.log('Team Name:', team.name);
    console.log('Age Group:', team.ageGroup);
    console.log('Level:', team.level);
    console.log('Current Players:', team.currentPlayers);
    console.log('Available Jersey Numbers:', team.players.map(p => p.jersey).sort((a, b) => a - b));
    console.log('Available Positions:', [...new Set(team.players.map(p => p.position))]);
    
    // Show available jersey numbers for new players
    const usedJerseys = team.players.map(p => p.jersey);
    const availableJerseys = [];
    for (let i = 1; i <= 99; i++) {
      if (!usedJerseys.includes(i)) {
        availableJerseys.push(i);
      }
    }
    console.log('Available Jersey Numbers for New Players:', availableJerseys.slice(0, 20).join(', '), '...');
    
  } catch (error) {
    console.error('❌ Error creating sample team:', error.message);
  } finally {
    mongoose.connection.close();
  }
}

createSampleTeam();

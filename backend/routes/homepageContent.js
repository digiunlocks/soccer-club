const express = require('express');
const router = express.Router();
const HomepageContent = require('../models/HomepageContent');
const superAdminAuth = require('../middleware/auth');

// Get homepage content
router.get('/', async (req, res) => {
  try {
    let content = await HomepageContent.findOne();
    
    // If no content exists, create default content
    if (!content) {
      content = new HomepageContent({
        // Welcome Section
        welcomeTitle: "Welcome to Seattle Leopards FC",
        welcomeSubtitle: "Building champions on and off the field. We're more than just a soccer club - we're a community dedicated to developing young athletes, fostering sportsmanship, and creating lasting friendships through the beautiful game.",
        
        // Values
        values: [
          {
            icon: "community",
            title: "Community Focus",
            description: "Building strong community bonds through soccer, bringing families together and creating lasting friendships."
          },
          {
            icon: "excellence", 
            title: "Excellence",
            description: "Committed to excellence in coaching, player development, and creating opportunities for success both on and off the field."
          },
          {
            icon: "inclusive",
            title: "Inclusive", 
            description: "Welcoming players of all skill levels and backgrounds, ensuring everyone has the opportunity to participate and grow."
          }
        ],
        
        // Programs
        programsTitle: "Our Programs",
        programsSubtitle: "From youth development to competitive leagues, we offer programs for every age and skill level.",
        programs: [
          {
            icon: "youth",
            title: "Youth Development",
            description: "Building the next generation of soccer stars with age-appropriate training and development.",
            features: ["Ages 5-12", "Professional coaching", "Skill development", "Fun and engaging sessions"],
            price: "$150/month",
            link: "/programs/youth"
          },
          {
            icon: "competitive",
            title: "Competitive Teams", 
            description: "Compete at the highest levels with our premier competitive teams and leagues.",
            features: ["Tournament play", "League competitions", "Advanced training", "Performance analytics"],
            price: "$200/month",
            link: "/programs/competitive"
          },
          {
            icon: "adult",
            title: "Adult Leagues",
            description: "Stay active and competitive in our adult recreational and competitive leagues.",
            features: ["Multiple divisions", "Regular games", "Social events", "Flexible scheduling"],
            price: "$100/month",
            link: "/programs/adult"
          }
        ],
        
        // Events
        eventsTitle: "Upcoming Events",
        eventsSubtitle: "Don't miss out on our exciting upcoming events and activities.",
        events: [
          {
            date: "2024-03-15",
            title: "Spring Tournament",
            time: "9:00 AM",
            location: "Main Field",
            description: "Annual spring championship tournament featuring teams from across the region.",
            color: "green"
          },
          {
            date: "2024-03-22", 
            title: "Youth Training Camp",
            time: "10:00 AM",
            location: "Training Grounds",
            description: "Intensive skill development camp for youth players ages 8-16.",
            color: "blue"
          },
          {
            date: "2024-03-29",
            title: "Club Social Night", 
            time: "7:00 PM",
            location: "Clubhouse",
            description: "Meet and greet with players, coaches, and fellow club members.",
            color: "purple"
          }
        ],
        
        // Teams
        teamsTitle: "Our Teams",
        teamsSubtitle: "Meet our competitive teams competing across different leagues and age groups.",
        teams: [
          {
            name: "Thunder FC",
            division: "Premier League",
            coach: "John Smith",
            record: "12-3-2",
            color: "yellow",
            link: "/teams/thunder"
          },
          {
            name: "Lightning United",
            division: "Championship", 
            coach: "Sarah Johnson",
            record: "8-5-4",
            color: "blue",
            link: "/teams/lightning"
          },
          {
            name: "Storm Academy",
            division: "Development",
            coach: "Mike Davis", 
            record: "15-1-1",
            color: "purple",
            link: "/teams/storm"
          }
        ],
        
        // Stats
        stats: [
          { number: "500+", label: "Active Players" },
          { number: "25+", label: "Years Experience" },
          { number: "15", label: "Competitive Teams" },
          { number: "50+", label: "Championships Won" }
        ],
        
        // Call to Action
        ctaTitle: "Ready to Join the Pride?",
        ctaSubtitle: "Whether you're a player, parent, or supporter, there's a place for everyone in the Seattle Leopards FC family.",
        ctaButtons: [
          { text: "Register Now", link: "/register", primary: true },
          { text: "Contact Us", link: "/contact", primary: false }
        ]
      });
      
      await content.save();
    }
    
    res.json(content);
  } catch (error) {
    console.error('Error fetching homepage content:', error);
    res.status(500).json({ error: 'Failed to fetch homepage content' });
  }
});

// Update homepage content (admin only)
router.put('/', superAdminAuth, async (req, res) => {
  try {
    let content = await HomepageContent.findOne();
    
    if (!content) {
      content = new HomepageContent(req.body);
    } else {
      Object.assign(content, req.body);
    }
    
    await content.save();
    res.json(content);
  } catch (error) {
    console.error('Error updating homepage content:', error);
    res.status(500).json({ error: 'Failed to update homepage content' });
  }
});

// Reset to default content (admin only)
router.post('/reset', superAdminAuth, async (req, res) => {
  try {
    await HomepageContent.deleteMany({});
    res.json({ message: 'Homepage content reset to defaults' });
  } catch (error) {
    console.error('Error resetting homepage content:', error);
    res.status(500).json({ error: 'Failed to reset homepage content' });
  }
});

module.exports = router;

import { useState, useEffect } from "react";
import { toast } from 'react-toastify';
import { API_BASE_URL } from '../config/api';

export default function HomepageContentManager() {
  const [homepageContent, setHomepageContent] = useState({
    // Hero Section
    heroTitle: "Seattle Leopards FC",
    heroSubtitle: "Building champions on and off the field. Youth & Adult soccer, community, and opportunity for all. Join the pride today!",
    heroButtonText: "Join the Club",
    
    // About Us Section
    aboutUsTitle: "About Seattle Leopards FC",
    aboutUsSubtitle: "We are more than just a soccer club. We're a community dedicated to developing young athletes, fostering sportsmanship, and building lasting friendships through the beautiful game.",
    aboutUsFeatures: [
      {
        title: "Community Focus",
        description: "Building strong community bonds through soccer, bringing families together and creating lasting friendships.",
        icon: "users"
      },
      {
        title: "Excellence",
        description: "Committed to excellence in coaching, player development, and creating opportunities for success both on and off the field.",
        icon: "check-circle"
      },
      {
        title: "Inclusive",
        description: "Welcoming players of all skill levels and backgrounds, ensuring everyone has the opportunity to participate and grow.",
        icon: "user-group"
      }
    ],
    showAboutUsSection: true,
    
    // Programs Overview Section
    programsTitle: "Our Programs",
    programsSubtitle: "From youth development to competitive leagues, we offer programs for every age and skill level.",
    programsOverview: [
      {
        ageGroup: "U6-U12",
        title: "Youth Development",
        description: "Building fundamental skills and love for the game in our youngest players.",
        linkText: "Learn More →"
      },
      {
        ageGroup: "U13-U18",
        title: "Competitive",
        description: "Advanced training and competitive play for developing athletes.",
        linkText: "Learn More →"
      },
      {
        ageGroup: "18+",
        title: "Adult Leagues",
        description: "Recreational and competitive leagues for adult players of all levels.",
        linkText: "Learn More →"
      },
      {
        ageGroup: "All",
        title: "Special Programs",
        description: "Camps, clinics, and special events throughout the year.",
        linkText: "Learn More →"
      }
    ],
    showProgramsSection: true,
    
    // Why Choose Us Section
    whyChooseUsTitle: "Why Choose Seattle Leopards FC?",
    whyChooseUsSubtitle: "Discover what makes us the premier soccer club in the Seattle area.",
    whyChooseUsFeatures: [
      {
        title: "Professional Coaching Staff",
        description: "Our certified coaches bring years of experience and a passion for developing young athletes."
      },
      {
        title: "State-of-the-Art Facilities",
        description: "Access to premium fields, training equipment, and modern facilities for optimal development."
      },
      {
        title: "Comprehensive Development",
        description: "Focus on technical skills, tactical understanding, physical fitness, and mental toughness."
      },
      {
        title: "Strong Community",
        description: "Join a supportive network of families, players, and coaches who share your passion for soccer."
      },
      {
        title: "College Pathways",
        description: "Guidance and support for players interested in pursuing soccer at the collegiate level."
      },
      {
        title: "Affordable Excellence",
        description: "High-quality programs at competitive prices, with scholarship opportunities available."
      }
    ],
    showWhyChooseUsSection: true,
    
    // Latest News Section
    latestNewsTitle: "Latest News & Updates",
    latestNewsSubtitle: "Stay connected with the latest happenings at Seattle Leopards FC.",
    latestNewsItems: [
      {
        date: "January 15, 2025",
        title: "Spring Registration Now Open",
        description: "Secure your spot for our spring programs. Early registration discounts available until February 1st.",
        linkText: "Read More →",
        linkUrl: "/programs",
        color: "green"
      },
      {
        date: "January 10, 2025",
        title: "Championship Success",
        description: "Congratulations to our U16 team for winning the regional championship! Amazing teamwork and dedication.",
        linkText: "Read More →",
        linkUrl: "/teams",
        color: "yellow"
      },
      {
        date: "January 5, 2025",
        title: "New Coach Joins Staff",
        description: "Welcome Coach Sarah Martinez to our coaching staff! Sarah brings 10+ years of experience in youth development.",
        linkText: "Read More →",
        linkUrl: "/teams",
        color: "blue"
      }
    ],
    showLatestNewsSection: true,
    
    // Contact & CTA Section
    ctaTitle: "Ready to Join the Pride?",
    ctaSubtitle: "Whether you're a player, coach, referee, or volunteer, there's a place for you at Seattle Leopards FC.",
    ctaStats: [
      { number: "500+", label: "Active Players" },
      { number: "25+", label: "Qualified Coaches" },
      { number: "15+", label: "Years Experience" }
    ],
    ctaPrimaryButtonText: "Apply Now",
    ctaSecondaryButtonText: "Contact Us",
    ctaContactInfo: {
      email: "info@seattleleopardsfc.com",
      phone: "(206) 555-0123",
      location: "Seattle, WA",
      locationDetails: "Multiple field locations",
      officeHours: "Mon-Fri: 9AM-6PM",
      weekendHours: "Sat: 9AM-3PM"
    },
    showCTASection: true,
    showStats: true,
    showContactInfo: true
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('hero');

  useEffect(() => {
    fetchHomepageContent();
  }, []);

  const fetchHomepageContent = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/settings/homepage`);
      if (response.ok) {
        const data = await response.json();
        setHomepageContent(data);
      }
    } catch (error) {
      console.error('Error fetching homepage content:', error);
      toast.error('Failed to load homepage content');
    } finally {
      setLoading(false);
    }
  };

  const saveHomepageContent = async () => {
    setSaving(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/settings`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(homepageContent)
      });

      if (response.ok) {
        toast.success('Homepage content updated successfully!');
      } else {
        throw new Error('Failed to update homepage content');
      }
    } catch (error) {
      console.error('Error saving homepage content:', error);
      toast.error('Failed to save homepage content');
    } finally {
      setSaving(false);
    }
  };

  const updateField = (field, value) => {
    setHomepageContent(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const updateArrayField = (section, index, field, value) => {
    setHomepageContent(prev => ({
      ...prev,
      [section]: prev[section].map((item, i) => 
        i === index ? { ...item, [field]: value } : item
      )
    }));
  };

  const addArrayItem = (section, newItem) => {
    setHomepageContent(prev => ({
      ...prev,
      [section]: [...prev[section], newItem]
    }));
  };

  const removeArrayItem = (section, index) => {
    setHomepageContent(prev => ({
      ...prev,
      [section]: prev[section].filter((_, i) => i !== index)
    }));
  };

  const renderHeroSection = () => (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-gray-900">Hero Section</h3>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Hero Title</label>
        <input
          type="text"
          value={homepageContent.heroTitle}
          onChange={(e) => updateField('heroTitle', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Hero Subtitle</label>
        <textarea
          value={homepageContent.heroSubtitle}
          onChange={(e) => updateField('heroSubtitle', e.target.value)}
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Hero Button Text</label>
        <input
          type="text"
          value={homepageContent.heroButtonText}
          onChange={(e) => updateField('heroButtonText', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
        />
      </div>
    </div>
  );

  const renderAboutUsSection = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">About Us Section</h3>
        <label className="flex items-center">
          <input
            type="checkbox"
            checked={homepageContent.showAboutUsSection}
            onChange={(e) => updateField('showAboutUsSection', e.target.checked)}
            className="mr-2"
          />
          Show Section
        </label>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Section Title</label>
        <input
          type="text"
          value={homepageContent.aboutUsTitle}
          onChange={(e) => updateField('aboutUsTitle', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Section Subtitle</label>
        <textarea
          value={homepageContent.aboutUsSubtitle}
          onChange={(e) => updateField('aboutUsSubtitle', e.target.value)}
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Features</label>
        {homepageContent.aboutUsFeatures.map((feature, index) => (
          <div key={index} className="border border-gray-200 rounded-md p-4 mb-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-gray-700">Feature {index + 1}</span>
              <button
                onClick={() => removeArrayItem('aboutUsFeatures', index)}
                className="text-red-600 hover:text-red-800 text-sm"
              >
                Remove
              </button>
            </div>
            <input
              type="text"
              placeholder="Title"
              value={feature.title}
              onChange={(e) => updateArrayField('aboutUsFeatures', index, 'title', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md mb-2 focus:outline-none focus:ring-2 focus:ring-green-500"
            />
            <textarea
              placeholder="Description"
              value={feature.description}
              onChange={(e) => updateArrayField('aboutUsFeatures', index, 'description', e.target.value)}
              rows={2}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>
        ))}
        <button
          onClick={() => addArrayItem('aboutUsFeatures', { title: '', description: '', icon: 'check' })}
          className="w-full py-2 px-4 border-2 border-dashed border-gray-300 rounded-md text-gray-600 hover:border-gray-400 hover:text-gray-800"
        >
          + Add Feature
        </button>
      </div>
    </div>
  );

  const renderProgramsSection = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Programs Overview Section</h3>
        <label className="flex items-center">
          <input
            type="checkbox"
            checked={homepageContent.showProgramsSection}
            onChange={(e) => updateField('showProgramsSection', e.target.checked)}
            className="mr-2"
          />
          Show Section
        </label>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Section Title</label>
        <input
          type="text"
          value={homepageContent.programsTitle}
          onChange={(e) => updateField('programsTitle', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Section Subtitle</label>
        <textarea
          value={homepageContent.programsSubtitle}
          onChange={(e) => updateField('programsSubtitle', e.target.value)}
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Program Cards</label>
        {homepageContent.programsOverview.map((program, index) => (
          <div key={index} className="border border-gray-200 rounded-md p-4 mb-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-gray-700">Program {index + 1}</span>
              <button
                onClick={() => removeArrayItem('programsOverview', index)}
                className="text-red-600 hover:text-red-800 text-sm"
              >
                Remove
              </button>
            </div>
            <input
              type="text"
              placeholder="Age Group"
              value={program.ageGroup}
              onChange={(e) => updateArrayField('programsOverview', index, 'ageGroup', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md mb-2 focus:outline-none focus:ring-2 focus:ring-green-500"
            />
            <input
              type="text"
              placeholder="Title"
              value={program.title}
              onChange={(e) => updateArrayField('programsOverview', index, 'title', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md mb-2 focus:outline-none focus:ring-2 focus:ring-green-500"
            />
            <textarea
              placeholder="Description"
              value={program.description}
              onChange={(e) => updateArrayField('programsOverview', index, 'description', e.target.value)}
              rows={2}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>
        ))}
        <button
          onClick={() => addArrayItem('programsOverview', { ageGroup: '', title: '', description: '', linkText: 'Learn More →' })}
          className="w-full py-2 px-4 border-2 border-dashed border-gray-300 rounded-md text-gray-600 hover:border-gray-400 hover:text-gray-800"
        >
          + Add Program
        </button>
      </div>
    </div>
  );

  const renderWhyChooseUsSection = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Why Choose Us Section</h3>
        <label className="flex items-center">
          <input
            type="checkbox"
            checked={homepageContent.showWhyChooseUsSection}
            onChange={(e) => updateField('showWhyChooseUsSection', e.target.checked)}
            className="mr-2"
          />
          Show Section
        </label>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Section Title</label>
        <input
          type="text"
          value={homepageContent.whyChooseUsTitle}
          onChange={(e) => updateField('whyChooseUsTitle', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Section Subtitle</label>
        <textarea
          value={homepageContent.whyChooseUsSubtitle}
          onChange={(e) => updateField('whyChooseUsSubtitle', e.target.value)}
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Features</label>
        {homepageContent.whyChooseUsFeatures.map((feature, index) => (
          <div key={index} className="border border-gray-200 rounded-md p-4 mb-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-gray-700">Feature {index + 1}</span>
              <button
                onClick={() => removeArrayItem('whyChooseUsFeatures', index)}
                className="text-red-600 hover:text-red-800 text-sm"
              >
                Remove
              </button>
            </div>
            <input
              type="text"
              placeholder="Title"
              value={feature.title}
              onChange={(e) => updateArrayField('whyChooseUsFeatures', index, 'title', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md mb-2 focus:outline-none focus:ring-2 focus:ring-green-500"
            />
            <textarea
              placeholder="Description"
              value={feature.description}
              onChange={(e) => updateArrayField('whyChooseUsFeatures', index, 'description', e.target.value)}
              rows={2}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>
        ))}
        <button
          onClick={() => addArrayItem('whyChooseUsFeatures', { title: '', description: '' })}
          className="w-full py-2 px-4 border-2 border-dashed border-gray-300 rounded-md text-gray-600 hover:border-gray-400 hover:text-gray-800"
        >
          + Add Feature
        </button>
      </div>
    </div>
  );

  const renderLatestNewsSection = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Latest News Section</h3>
        <label className="flex items-center">
          <input
            type="checkbox"
            checked={homepageContent.showLatestNewsSection}
            onChange={(e) => updateField('showLatestNewsSection', e.target.checked)}
            className="mr-2"
          />
          Show Section
        </label>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Section Title</label>
        <input
          type="text"
          value={homepageContent.latestNewsTitle}
          onChange={(e) => updateField('latestNewsTitle', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Section Subtitle</label>
        <textarea
          value={homepageContent.latestNewsSubtitle}
          onChange={(e) => updateField('latestNewsSubtitle', e.target.value)}
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">News Items</label>
        {homepageContent.latestNewsItems.map((item, index) => (
          <div key={index} className="border border-gray-200 rounded-md p-4 mb-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-gray-700">News Item {index + 1}</span>
              <button
                onClick={() => removeArrayItem('latestNewsItems', index)}
                className="text-red-600 hover:text-red-800 text-sm"
              >
                Remove
              </button>
            </div>
            <input
              type="text"
              placeholder="Date"
              value={item.date}
              onChange={(e) => updateArrayField('latestNewsItems', index, 'date', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md mb-2 focus:outline-none focus:ring-2 focus:ring-green-500"
            />
            <input
              type="text"
              placeholder="Title"
              value={item.title}
              onChange={(e) => updateArrayField('latestNewsItems', index, 'title', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md mb-2 focus:outline-none focus:ring-2 focus:ring-green-500"
            />
            <textarea
              placeholder="Description"
              value={item.description}
              onChange={(e) => updateArrayField('latestNewsItems', index, 'description', e.target.value)}
              rows={2}
              className="w-full px-3 py-2 border border-gray-300 rounded-md mb-2 focus:outline-none focus:ring-2 focus:ring-green-500"
            />
            <input
              type="text"
              placeholder="Link URL"
              value={item.linkUrl}
              onChange={(e) => updateArrayField('latestNewsItems', index, 'linkUrl', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>
        ))}
        <button
          onClick={() => addArrayItem('latestNewsItems', { date: '', title: '', description: '', linkText: 'Read More →', linkUrl: '', color: 'green' })}
          className="w-full py-2 px-4 border-2 border-dashed border-gray-300 rounded-md text-gray-600 hover:border-gray-400 hover:text-gray-800"
        >
          + Add News Item
        </button>
      </div>
    </div>
  );

  const renderCTASection = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Contact & CTA Section</h3>
        <label className="flex items-center">
          <input
            type="checkbox"
            checked={homepageContent.showCTASection}
            onChange={(e) => updateField('showCTASection', e.target.checked)}
            className="mr-2"
          />
          Show Section
        </label>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Section Title</label>
        <input
          type="text"
          value={homepageContent.ctaTitle}
          onChange={(e) => updateField('ctaTitle', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Section Subtitle</label>
        <textarea
          value={homepageContent.ctaSubtitle}
          onChange={(e) => updateField('ctaSubtitle', e.target.value)}
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Primary Button Text</label>
        <input
          type="text"
          value={homepageContent.ctaPrimaryButtonText}
          onChange={(e) => updateField('ctaPrimaryButtonText', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Secondary Button Text</label>
        <input
          type="text"
          value={homepageContent.ctaSecondaryButtonText}
          onChange={(e) => updateField('ctaSecondaryButtonText', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Stats</label>
        {homepageContent.ctaStats.map((stat, index) => (
          <div key={index} className="border border-gray-200 rounded-md p-4 mb-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-gray-700">Stat {index + 1}</span>
              <button
                onClick={() => removeArrayItem('ctaStats', index)}
                className="text-red-600 hover:text-red-800 text-sm"
              >
                Remove
              </button>
            </div>
            <input
              type="text"
              placeholder="Number"
              value={stat.number}
              onChange={(e) => updateArrayField('ctaStats', index, 'number', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md mb-2 focus:outline-none focus:ring-2 focus:ring-green-500"
            />
            <input
              type="text"
              placeholder="Label"
              value={stat.label}
              onChange={(e) => updateArrayField('ctaStats', index, 'label', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>
        ))}
        <button
          onClick={() => addArrayItem('ctaStats', { number: '', label: '' })}
          className="w-full py-2 px-4 border-2 border-dashed border-gray-300 rounded-md text-gray-600 hover:border-gray-400 hover:text-gray-800"
        >
          + Add Stat
        </button>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Contact Information</label>
        <div className="grid grid-cols-2 gap-4">
          <input
            type="email"
            placeholder="Email"
            value={homepageContent.ctaContactInfo.email}
            onChange={(e) => updateField('ctaContactInfo', { ...homepageContent.ctaContactInfo, email: e.target.value })}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
          />
          <input
            type="text"
            placeholder="Phone"
            value={homepageContent.ctaContactInfo.phone}
            onChange={(e) => updateField('ctaContactInfo', { ...homepageContent.ctaContactInfo, phone: e.target.value })}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
          />
          <input
            type="text"
            placeholder="Location"
            value={homepageContent.ctaContactInfo.location}
            onChange={(e) => updateField('ctaContactInfo', { ...homepageContent.ctaContactInfo, location: e.target.value })}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
          />
          <input
            type="text"
            placeholder="Location Details"
            value={homepageContent.ctaContactInfo.locationDetails}
            onChange={(e) => updateField('ctaContactInfo', { ...homepageContent.ctaContactInfo, locationDetails: e.target.value })}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
          />
          <input
            type="text"
            placeholder="Office Hours"
            value={homepageContent.ctaContactInfo.officeHours}
            onChange={(e) => updateField('ctaContactInfo', { ...homepageContent.ctaContactInfo, officeHours: e.target.value })}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
          />
          <input
            type="text"
            placeholder="Weekend Hours"
            value={homepageContent.ctaContactInfo.weekendHours}
            onChange={(e) => updateField('ctaContactInfo', { ...homepageContent.ctaContactInfo, weekendHours: e.target.value })}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
          />
        </div>
      </div>
    </div>
  );

  if (loading) {
    return <div className="text-center py-8">Loading homepage content...</div>;
  }

  const tabs = [
    { id: 'hero', label: 'Hero Section' },
    { id: 'aboutUs', label: 'About Us' },
    { id: 'programs', label: 'Programs' },
    { id: 'whyChooseUs', label: 'Why Choose Us' },
    { id: 'latestNews', label: 'Latest News' },
    { id: 'cta', label: 'Contact & CTA' }
  ];

  const renderActiveTab = () => {
    switch (activeTab) {
      case 'hero':
        return renderHeroSection();
      case 'aboutUs':
        return renderAboutUsSection();
      case 'programs':
        return renderProgramsSection();
      case 'whyChooseUs':
        return renderWhyChooseUsSection();
      case 'latestNews':
        return renderLatestNewsSection();
      case 'cta':
        return renderCTASection();
      default:
        return renderHeroSection();
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Homepage Content Manager</h2>
        <button
          onClick={saveHomepageContent}
          disabled={saving}
          className="bg-green-600 text-white px-6 py-2 rounded-md hover:bg-green-700 disabled:opacity-50"
        >
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>

      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.id
                  ? 'border-green-500 text-green-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      <div className="max-h-96 overflow-y-auto">
        {renderActiveTab()}
      </div>
    </div>
  );
} 
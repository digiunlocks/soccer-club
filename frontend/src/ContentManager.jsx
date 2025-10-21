import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from 'react-toastify';

const API_URL = "http://localhost:5000/api/homepage-content";

export default function ContentManager() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [content, setContent] = useState(null);
  const [activeTab, setActiveTab] = useState('welcome');

  // Fetch homepage content
  useEffect(() => {
    fetchContent();
  }, []);

  const fetchContent = async () => {
    try {
      setFetching(true);
      const response = await fetch(API_URL);
      if (response.ok) {
        const data = await response.json();
        setContent(data);
      } else {
        throw new Error('Failed to fetch content');
      }
    } catch (error) {
      console.error('Error fetching content:', error);
      toast.error('Failed to fetch homepage content');
    } finally {
      setFetching(false);
    }
  };

  const handleChange = (section, field, value, index = null) => {
    setContent(prev => {
      const newContent = { ...prev };
      
      if (index !== null) {
        // Handle array fields (values, programs, events, teams, stats, buttons)
        newContent[section] = [...prev[section]];
        newContent[section][index] = { ...prev[section][index], [field]: value };
      } else if (section === 'ctaButtons') {
        // Special handling for CTA buttons
        newContent[section] = [...prev[section]];
        newContent[section][index] = { ...prev[section][index], [field]: value };
      } else {
        // Handle simple fields
        newContent[section] = value;
      }
      
      return newContent;
    });
  };

  const addArrayItem = (section, defaultItem) => {
    setContent(prev => ({
      ...prev,
      [section]: [...prev[section], defaultItem]
    }));
  };

  const removeArrayItem = (section, index) => {
    setContent(prev => ({
      ...prev,
      [section]: prev[section].filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(API_URL, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(content)
      });

      if (response.ok) {
        toast.success("Homepage content updated successfully!");
      } else {
        throw new Error('Failed to update content');
      }
    } catch (error) {
      console.error('Error updating content:', error);
      toast.error("Failed to update homepage content");
    } finally {
      setLoading(false);
    }
  };

  const resetToDefaults = async () => {
    if (!window.confirm('Are you sure you want to reset all homepage content to defaults? This cannot be undone.')) {
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_URL}/reset`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        toast.success("Homepage content reset to defaults!");
        fetchContent();
      } else {
        throw new Error('Failed to reset content');
      }
    } catch (error) {
      console.error('Error resetting content:', error);
      toast.error("Failed to reset homepage content");
    }
  };

  if (fetching) {
    return (
      <div className="max-w-7xl mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
        </div>
      </div>
    );
  }

  if (!content) {
    return (
      <div className="max-w-7xl mx-auto p-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">No Content Found</h2>
          <p className="text-gray-600 mb-4">Unable to load homepage content.</p>
          <button
            onClick={fetchContent}
            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: 'welcome', name: 'Welcome Section', icon: '🏠' },
    { id: 'programs', name: 'Programs', icon: '⚽' },
    { id: 'events', name: 'Events', icon: '📅' },
    { id: 'teams', name: 'Teams', icon: '👥' },
    { id: 'stats', name: 'Statistics', icon: '📊' },
    { id: 'cta', name: 'Call to Action', icon: '📢' },
    { id: 'about', name: 'About Page', icon: 'ℹ️' }
  ];

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-green-900 mb-2">Homepage Content Management</h1>
          <p className="text-gray-600">Edit and manage all homepage content sections</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => window.open('/', '_blank')}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
          >
            Preview Homepage
          </button>
          <button
            onClick={() => navigate(-1)}
            className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 transition-colors"
          >
            Back
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="mb-6">
        <div className="border-b border-gray-200">
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
                <span className="mr-2">{tab.icon}</span>
                {tab.name}
              </button>
            ))}
          </nav>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        {/* Welcome Section */}
        {activeTab === 'welcome' && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Welcome Section</h2>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Welcome Title</label>
                <input
                  type="text"
                  value={content.welcomeTitle}
                  onChange={(e) => handleChange('welcomeTitle', null, e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Welcome Subtitle</label>
                <textarea
                  value={content.welcomeSubtitle}
                  onChange={(e) => handleChange('welcomeSubtitle', null, e.target.value)}
                  rows="3"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
            </div>

            <div className="mt-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Values</h3>
              {content.values.map((value, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4 mb-4">
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Icon</label>
                      <select
                        value={value.icon}
                        onChange={(e) => handleChange('values', 'icon', e.target.value, index)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                      >
                        <option value="community">Community</option>
                        <option value="excellence">Excellence</option>
                        <option value="inclusive">Inclusive</option>
                        <option value="sportsmanship">Sportsmanship</option>
                        <option value="development">Development</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                      <input
                        type="text"
                        value={value.title}
                        onChange={(e) => handleChange('values', 'title', e.target.value, index)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                      />
                    </div>
                    <div className="flex items-end">
                      <button
                        type="button"
                        onClick={() => removeArrayItem('values', index)}
                        className="bg-red-600 text-white px-3 py-2 rounded hover:bg-red-700"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                  <div className="mt-3">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                    <textarea
                      value={value.description}
                      onChange={(e) => handleChange('values', 'description', e.target.value, index)}
                      rows="2"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                  </div>
                </div>
              ))}
              <button
                type="button"
                onClick={() => addArrayItem('values', { icon: 'community', title: 'New Value', description: 'Description of the value' })}
                className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
              >
                Add Value
              </button>
            </div>
          </div>
        )}

        {/* Programs Section */}
        {activeTab === 'programs' && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Programs Section</h2>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Programs Title</label>
                <input
                  type="text"
                  value={content.programsTitle}
                  onChange={(e) => handleChange('programsTitle', null, e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Programs Subtitle</label>
                <input
                  type="text"
                  value={content.programsSubtitle}
                  onChange={(e) => handleChange('programsSubtitle', null, e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
            </div>

            <div className="mt-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Programs</h3>
              {content.programs.map((program, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4 mb-4">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Icon</label>
                      <select
                        value={program.icon}
                        onChange={(e) => handleChange('programs', 'icon', e.target.value, index)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                      >
                        <option value="youth">Youth</option>
                        <option value="competitive">Competitive</option>
                        <option value="adult">Adult</option>
                        <option value="training">Training</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                      <input
                        type="text"
                        value={program.title}
                        onChange={(e) => handleChange('programs', 'title', e.target.value, index)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                      />
                    </div>
                  </div>
                  <div className="mt-3">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                    <textarea
                      value={program.description}
                      onChange={(e) => handleChange('programs', 'description', e.target.value, index)}
                      rows="2"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                  </div>
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mt-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Price</label>
                      <input
                        type="text"
                        value={program.price}
                        onChange={(e) => handleChange('programs', 'price', e.target.value, index)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Link</label>
                      <input
                        type="text"
                        value={program.link}
                        onChange={(e) => handleChange('programs', 'link', e.target.value, index)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                      />
                    </div>
                    <div className="flex items-end">
                      <button
                        type="button"
                        onClick={() => removeArrayItem('programs', index)}
                        className="bg-red-600 text-white px-3 py-2 rounded hover:bg-red-700"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </div>
              ))}
              <button
                type="button"
                onClick={() => addArrayItem('programs', { icon: 'youth', title: 'New Program', description: 'Program description', features: [], price: '$100/month', link: '/programs/new' })}
                className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
              >
                Add Program
              </button>
            </div>
          </div>
        )}

        {/* Events Section */}
        {activeTab === 'events' && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Events Section</h2>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Events Title</label>
                <input
                  type="text"
                  value={content.eventsTitle}
                  onChange={(e) => handleChange('eventsTitle', null, e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Events Subtitle</label>
                <input
                  type="text"
                  value={content.eventsSubtitle}
                  onChange={(e) => handleChange('eventsSubtitle', null, e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
            </div>

            <div className="mt-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Events</h3>
              {content.events.map((event, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4 mb-4">
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                      <input
                        type="date"
                        value={event.date}
                        onChange={(e) => handleChange('events', 'date', e.target.value, index)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                      <input
                        type="text"
                        value={event.title}
                        onChange={(e) => handleChange('events', 'title', e.target.value, index)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Color</label>
                      <select
                        value={event.color}
                        onChange={(e) => handleChange('events', 'color', e.target.value, index)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                      >
                        <option value="green">Green</option>
                        <option value="blue">Blue</option>
                        <option value="purple">Purple</option>
                        <option value="red">Red</option>
                        <option value="yellow">Yellow</option>
                      </select>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Time</label>
                      <input
                        type="text"
                        value={event.time}
                        onChange={(e) => handleChange('events', 'time', e.target.value, index)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                      <input
                        type="text"
                        value={event.location}
                        onChange={(e) => handleChange('events', 'location', e.target.value, index)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                      />
                    </div>
                  </div>
                  <div className="mt-3">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                    <textarea
                      value={event.description}
                      onChange={(e) => handleChange('events', 'description', e.target.value, index)}
                      rows="2"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                  </div>
                  <div className="mt-3 flex justify-end">
                    <button
                      type="button"
                      onClick={() => removeArrayItem('events', index)}
                      className="bg-red-600 text-white px-3 py-2 rounded hover:bg-red-700"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))}
              <button
                type="button"
                onClick={() => addArrayItem('events', { date: '2024-01-01', title: 'New Event', time: '10:00 AM', location: 'Main Field', description: 'Event description', color: 'green' })}
                className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
              >
                Add Event
              </button>
            </div>
          </div>
        )}

        {/* Teams Section */}
        {activeTab === 'teams' && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Teams Section</h2>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Teams Title</label>
                <input
                  type="text"
                  value={content.teamsTitle}
                  onChange={(e) => handleChange('teamsTitle', null, e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Teams Subtitle</label>
                <input
                  type="text"
                  value={content.teamsSubtitle}
                  onChange={(e) => handleChange('teamsSubtitle', null, e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
            </div>

            <div className="mt-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Teams</h3>
              {content.teams.map((team, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4 mb-4">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Team Name</label>
                      <input
                        type="text"
                        value={team.name}
                        onChange={(e) => handleChange('teams', 'name', e.target.value, index)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Division</label>
                      <input
                        type="text"
                        value={team.division}
                        onChange={(e) => handleChange('teams', 'division', e.target.value, index)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mt-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Coach</label>
                      <input
                        type="text"
                        value={team.coach}
                        onChange={(e) => handleChange('teams', 'coach', e.target.value, index)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Record</label>
                      <input
                        type="text"
                        value={team.record}
                        onChange={(e) => handleChange('teams', 'record', e.target.value, index)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Color</label>
                      <select
                        value={team.color}
                        onChange={(e) => handleChange('teams', 'color', e.target.value, index)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                      >
                        <option value="yellow">Yellow</option>
                        <option value="blue">Blue</option>
                        <option value="purple">Purple</option>
                        <option value="green">Green</option>
                        <option value="red">Red</option>
                      </select>
                    </div>
                  </div>
                  <div className="mt-3">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Link</label>
                    <input
                      type="text"
                      value={team.link}
                      onChange={(e) => handleChange('teams', 'link', e.target.value, index)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                  </div>
                  <div className="mt-3 flex justify-end">
                    <button
                      type="button"
                      onClick={() => removeArrayItem('teams', index)}
                      className="bg-red-600 text-white px-3 py-2 rounded hover:bg-red-700"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))}
              <button
                type="button"
                onClick={() => addArrayItem('teams', { name: 'New Team', division: 'Division', coach: 'Coach Name', record: '0-0-0', color: 'green', link: '/teams/new' })}
                className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
              >
                Add Team
              </button>
            </div>
          </div>
        )}

        {/* Stats Section */}
        {activeTab === 'stats' && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Statistics Section</h2>
            
            <div className="mt-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Statistics</h3>
              {content.stats.map((stat, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4 mb-4">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Number</label>
                      <input
                        type="text"
                        value={stat.number}
                        onChange={(e) => handleChange('stats', 'number', e.target.value, index)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Label</label>
                      <input
                        type="text"
                        value={stat.label}
                        onChange={(e) => handleChange('stats', 'label', e.target.value, index)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                      />
                    </div>
                  </div>
                  <div className="mt-3 flex justify-end">
                    <button
                      type="button"
                      onClick={() => removeArrayItem('stats', index)}
                      className="bg-red-600 text-white px-3 py-2 rounded hover:bg-red-700"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))}
              <button
                type="button"
                onClick={() => addArrayItem('stats', { number: '100+', label: 'New Statistic' })}
                className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
              >
                Add Statistic
              </button>
            </div>
          </div>
        )}

        {/* Call to Action Section */}
        {activeTab === 'cta' && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Call to Action Section</h2>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">CTA Title</label>
                <input
                  type="text"
                  value={content.ctaTitle}
                  onChange={(e) => handleChange('ctaTitle', null, e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">CTA Subtitle</label>
                <textarea
                  value={content.ctaSubtitle}
                  onChange={(e) => handleChange('ctaSubtitle', null, e.target.value)}
                  rows="3"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
            </div>

            <div className="mt-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">CTA Buttons</h3>
              {content.ctaButtons.map((button, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4 mb-4">
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Button Text</label>
                      <input
                        type="text"
                        value={button.text}
                        onChange={(e) => handleChange('ctaButtons', 'text', e.target.value, index)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Link</label>
                      <input
                        type="text"
                        value={button.link}
                        onChange={(e) => handleChange('ctaButtons', 'link', e.target.value, index)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                      />
                    </div>
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        checked={button.primary}
                        onChange={(e) => handleChange('ctaButtons', 'primary', e.target.checked, index)}
                        className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                      />
                      <label className="ml-2 block text-sm text-gray-900">Primary Button</label>
                    </div>
                  </div>
                  <div className="mt-3 flex justify-end">
                    <button
                      type="button"
                      onClick={() => removeArrayItem('ctaButtons', index)}
                      className="bg-red-600 text-white px-3 py-2 rounded hover:bg-red-700"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))}
              <button
                type="button"
                onClick={() => addArrayItem('ctaButtons', { text: 'New Button', link: '/new', primary: false })}
                className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
              >
                Add Button
              </button>
            </div>
          </div>
        )}

        {/* About Page Section */}
        {activeTab === 'about' && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">About Page Management</h2>
            
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mr-4">
                  <span className="text-2xl">ℹ️</span>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-blue-900">About Page Manager</h3>
                  <p className="text-blue-700">Manage your About page content and gallery</p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-white rounded-lg p-4 border border-blue-200">
                  <h4 className="font-semibold text-gray-900 mb-2">📝 Content Management</h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Edit page title and description</li>
                    <li>• Manage club highlights</li>
                    <li>• Update additional information</li>
                  </ul>
                </div>
                
                <div className="bg-white rounded-lg p-4 border border-blue-200">
                  <h4 className="font-semibold text-gray-900 mb-2">🖼️ Gallery Management</h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Upload multiple images (up to 10)</li>
                    <li>• Add captions and alt text</li>
                    <li>• Drag & drop reordering</li>
                    <li>• Bulk delete operations</li>
                  </ul>
                </div>
              </div>
              
              <div className="mt-6 flex gap-3">
                <button
                  onClick={() => window.open('/admin/about', '_blank')}
                  className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
                >
                  🚀 Open About Page Manager
                </button>
                <button
                  onClick={() => window.open('/about', '_blank')}
                  className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors font-medium"
                >
                  👁️ Preview About Page
                </button>
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="font-semibold text-gray-900 mb-3">Quick Actions</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-3 bg-white rounded border">
                  <div className="text-2xl mb-2">📝</div>
                  <h5 className="font-medium text-gray-900">Edit Content</h5>
                  <p className="text-sm text-gray-600">Update page text and highlights</p>
                </div>
                <div className="text-center p-3 bg-white rounded border">
                  <div className="text-2xl mb-2">🖼️</div>
                  <h5 className="font-medium text-gray-900">Manage Gallery</h5>
                  <p className="text-sm text-gray-600">Upload and organize images</p>
                </div>
                <div className="text-center p-3 bg-white rounded border">
                  <div className="text-2xl mb-2">👁️</div>
                  <h5 className="font-medium text-gray-900">Preview</h5>
                  <p className="text-sm text-gray-600">See how it looks to visitors</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="mt-8 flex justify-between">
          <button
            type="button"
            onClick={resetToDefaults}
            className="bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 transition-colors"
          >
            Reset to Defaults
          </button>
          
          <button
            type="submit"
            disabled={loading}
            className={`px-6 py-3 rounded-lg font-semibold text-white transition-colors ${
              loading 
                ? 'bg-gray-400 cursor-not-allowed' 
                : 'bg-green-600 hover:bg-green-700'
            }`}
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Saving...
              </span>
            ) : (
              'Save Homepage Content'
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
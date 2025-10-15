import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';

const API_URL = "http://localhost:5000/api/hero-text-settings";

export default function HeroTextSettingsManager() {
  const [settings, setSettings] = useState({
    caption: "Welcome to Our Soccer Club",
    subtitle: "Building Champions, Creating Memories",
    buttonText: "",
    buttonLink: "",
    enabled: false,
    textPosition: "center",
    textColor: "white",
    backgroundColor: "rgba(0,0,0,0.4)",
    fontSize: {
      caption: "clamp(1.5rem, 3vw, 2.5rem)",
      subtitle: "clamp(0.9rem, 2vw, 1.2rem)"
    }
  });
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(API_URL, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      if (!response.ok) throw new Error('Failed to fetch settings');
      const data = await response.json();
      setSettings(data);
    } catch (error) {
      toast.error('Failed to load hero text settings');
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setSettings(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleFontSizeChange = (field, value) => {
    setSettings(prev => ({
      ...prev,
      fontSize: {
        ...prev.fontSize,
        [field]: value
      }
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(API_URL, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(settings)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update settings');
      }

      toast.success('Hero text settings updated successfully!');
    } catch (error) {
      toast.error(error.message);
      console.error('Error:', error);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-gray-600">Loading settings...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-2 flex items-center">
          <svg className="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
          </svg>
          Global Hero Text Settings
        </h2>
        <p className="text-gray-600">
          Configure the text overlay that appears on ALL hero images. This creates consistent branding across your entire slideshow.
        </p>
      </div>

      {/* Settings Form */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Enable/Disable Toggle */}
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <h3 className="text-lg font-medium text-gray-900">Enable Hero Text Overlay</h3>
              <p className="text-sm text-gray-600">Turn the text overlay on or off for all hero images</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                name="enabled"
                checked={settings.enabled}
                onChange={handleChange}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>

          {/* Text Content */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900">Text Content</h3>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Main Caption/Title *
              </label>
              
              {/* Preset Captions Dropdown */}
              <div className="mb-2">
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Choose a preset caption:
                </label>
                <select
                  onChange={(e) => {
                    if (e.target.value !== '') {
                      setSettings(prev => ({ ...prev, caption: e.target.value }));
                    }
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                >
                  <option value="">Select a preset caption...</option>
                  
                  <optgroup label="🏆 Professional & Impactful">
                    <option value="Seattle Leopards FC">Seattle Leopards FC</option>
                    <option value="Building Champions, Creating Legends">Building Champions, Creating Legends</option>
                    <option value="Where Champions Are Made">Where Champions Are Made</option>
                    <option value="Excellence in Every Play">Excellence in Every Play</option>
                  </optgroup>
                  
                  <optgroup label="⚽ Soccer-Focused">
                    <option value="Your Journey to Greatness Starts Here">Your Journey to Greatness Starts Here</option>
                    <option value="More Than a Club, It's a Family">More Than a Club, It's a Family</option>
                    <option value="Developing Tomorrow's Soccer Stars">Developing Tomorrow's Soccer Stars</option>
                    <option value="Passion. Dedication. Victory.">Passion. Dedication. Victory.</option>
                  </optgroup>
                  
                  <optgroup label="🌟 Community & Growth">
                    <option value="Growing Champions, One Player at a Time">Growing Champions, One Player at a Time</option>
                    <option value="Where Dreams Meet Dedication">Where Dreams Meet Dedication</option>
                    <option value="Seattle's Premier Youth Soccer Experience">Seattle's Premier Youth Soccer Experience</option>
                    <option value="Unleash Your Potential">Unleash Your Potential</option>
                    <option value="Building Stronger Communities Through Soccer">Building Stronger Communities Through Soccer</option>
                    <option value="Where Every Player Belongs">Where Every Player Belongs</option>
                    <option value="Connecting Families, Building Futures">Connecting Families, Building Futures</option>
                    <option value="Your Neighborhood Soccer Family">Your Neighborhood Soccer Family</option>
                    <option value="Together We Rise, Together We Play">Together We Rise, Together We Play</option>
                    <option value="Community First, Victory Second">Community First, Victory Second</option>
                    <option value="Where Friends Become Teammates">Where Friends Become Teammates</option>
                    <option value="Building Bonds Beyond the Field">Building Bonds Beyond the Field</option>
                    <option value="One Community, One Passion, One Goal">One Community, One Passion, One Goal</option>
                    <option value="Growing Together, Playing Together">Growing Together, Playing Together</option>
                    <option value="Where Every Family Has a Home">Where Every Family Has a Home</option>
                    <option value="Community Pride, Soccer Pride">Community Pride, Soccer Pride</option>
                    <option value="Supporting Our Youth, Supporting Our Future">Supporting Our Youth, Supporting Our Future</option>
                    <option value="Where Community Meets Competition">Where Community Meets Competition</option>
                    <option value="Building Tomorrow's Leaders Today">Building Tomorrow's Leaders Today</option>
                    <option value="Your Community, Your Club, Your Family">Your Community, Your Club, Your Family</option>
                  </optgroup>
                  
                  <optgroup label="💪 Inspirational">
                    <option value="Rise Above. Play Beyond.">Rise Above. Play Beyond.</option>
                    <option value="Every Player. Every Dream. Every Victory.">Every Player. Every Dream. Every Victory.</option>
                    <option value="From Grassroots to Greatness">From Grassroots to Greatness</option>
                    <option value="Champions Start Here">Champions Start Here</option>
                  </optgroup>
                </select>
              </div>
              
              {/* Custom Caption Input */}
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Or write your own custom caption:
                </label>
                <input
                  type="text"
                  name="caption"
                  value={settings.caption}
                  onChange={handleChange}
                  placeholder="Enter your custom caption here..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              
              <p className="text-xs text-gray-500 mt-1">This will appear as the main headline over ALL hero images</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Subtitle (Optional)
              </label>
              
              {/* Preset Subtitles Dropdown */}
              <div className="mb-2">
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Choose a preset subtitle:
                </label>
                <select
                  onChange={(e) => {
                    if (e.target.value !== '') {
                      setSettings(prev => ({ ...prev, subtitle: e.target.value }));
                    }
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                >
                  <option value="">Select a preset subtitle...</option>
                  
                  <optgroup label="🏆 Professional & Impactful">
                    <option value="Building Champions, Creating Memories">Building Champions, Creating Memories</option>
                    <option value="Excellence in Every Play, Pride in Every Moment">Excellence in Every Play, Pride in Every Moment</option>
                    <option value="Where Champions Are Born and Legends Are Made">Where Champions Are Born and Legends Are Made</option>
                    <option value="Developing Tomorrow's Soccer Stars Today">Developing Tomorrow's Soccer Stars Today</option>
                  </optgroup>
                  
                  <optgroup label="⚽ Soccer-Focused">
                    <option value="Join the Best Youth Soccer Club in Seattle">Join the Best Youth Soccer Club in Seattle</option>
                    <option value="More Than a Game, It's a Way of Life">More Than a Game, It's a Way of Life</option>
                    <option value="Where Passion Meets Performance">Where Passion Meets Performance</option>
                    <option value="Training Champions, Building Character">Training Champions, Building Character</option>
                    <option value="Your Journey to Soccer Excellence Starts Here">Your Journey to Soccer Excellence Starts Here</option>
                  </optgroup>
                  
                  <optgroup label="🌟 Community & Growth">
                    <option value="Growing Champions, One Player at a Time">Growing Champions, One Player at a Time</option>
                    <option value="Where Every Player Belongs and Every Family Matters">Where Every Player Belongs and Every Family Matters</option>
                    <option value="Building Stronger Communities Through Soccer">Building Stronger Communities Through Soccer</option>
                    <option value="Connecting Families, Building Futures">Connecting Families, Building Futures</option>
                    <option value="Your Neighborhood Soccer Family Awaits">Your Neighborhood Soccer Family Awaits</option>
                    <option value="Together We Rise, Together We Play">Together We Rise, Together We Play</option>
                    <option value="Community First, Victory Second">Community First, Victory Second</option>
                    <option value="Where Friends Become Teammates for Life">Where Friends Become Teammates for Life</option>
                    <option value="Building Bonds Beyond the Field">Building Bonds Beyond the Field</option>
                    <option value="One Community, One Passion, One Goal">One Community, One Passion, One Goal</option>
                  </optgroup>
                  
                  <optgroup label="💪 Inspirational">
                    <option value="Rise Above. Play Beyond. Achieve More.">Rise Above. Play Beyond. Achieve More.</option>
                    <option value="Every Player. Every Dream. Every Victory.">Every Player. Every Dream. Every Victory.</option>
                    <option value="From Grassroots to Greatness">From Grassroots to Greatness</option>
                    <option value="Champions Start Here, Legends Are Born Here">Champions Start Here, Legends Are Born Here</option>
                    <option value="Unleash Your Potential, Embrace Your Passion">Unleash Your Potential, Embrace Your Passion</option>
                    <option value="Where Dreams Take Flight and Goals Come True">Where Dreams Take Flight and Goals Come True</option>
                  </optgroup>
                  
                  <optgroup label="🎯 Action-Oriented">
                    <option value="Join Us Today, Lead Tomorrow">Join Us Today, Lead Tomorrow</option>
                    <option value="Start Your Soccer Journey With Us">Start Your Soccer Journey With Us</option>
                    <option value="Be Part of Something Greater">Be Part of Something Greater</option>
                    <option value="Experience the Difference">Experience the Difference</option>
                    <option value="Your Success Story Starts Here">Your Success Story Starts Here</option>
                  </optgroup>
                </select>
              </div>
              
              {/* Custom Subtitle Input */}
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Or write your own custom subtitle:
                </label>
                <input
                  type="text"
                  name="subtitle"
                  value={settings.subtitle}
                  onChange={handleChange}
                  placeholder="Enter your custom subtitle here..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <p className="text-xs text-gray-500 mt-1">Additional text that appears below the main caption</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Button Text (Optional)
                </label>
                <input
                  type="text"
                  name="buttonText"
                  value={settings.buttonText}
                  onChange={handleChange}
                  placeholder="e.g., Join Now"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Button Link (Optional)
                </label>
                <input
                  type="text"
                  name="buttonLink"
                  value={settings.buttonLink}
                  onChange={handleChange}
                  placeholder="e.g., /join/player"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Appearance Settings */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900">Appearance Settings</h3>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Text Position
              </label>
              <select
                name="textPosition"
                value={settings.textPosition}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="center">Center</option>
                <option value="left">Left</option>
                <option value="right">Right</option>
              </select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Text Color
                </label>
                <div className="flex items-center space-x-3">
                  <input
                    type="color"
                    value={settings.textColor === 'white' ? '#ffffff' : settings.textColor}
                    onChange={(e) => setSettings(prev => ({ ...prev, textColor: e.target.value }))}
                    className="w-12 h-10 border border-gray-300 rounded cursor-pointer"
                  />
                  <input
                    type="text"
                    value={settings.textColor}
                    onChange={handleChange}
                    name="textColor"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="#ffffff or white"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Background Color (Disabled)
                </label>
                <input
                  type="text"
                  name="backgroundColor"
                  value="transparent"
                  disabled
                  placeholder="Background removed for cleaner look"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 text-gray-500"
                />
                <p className="text-xs text-gray-500 mt-1">Background has been removed for a cleaner appearance</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Caption Font Size
                </label>
                <input
                  type="text"
                  value={settings.fontSize.caption}
                  onChange={(e) => handleFontSizeChange('caption', e.target.value)}
                  placeholder="clamp(1.5rem, 3vw, 2.5rem)"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Subtitle Font Size
                </label>
                <input
                  type="text"
                  value={settings.fontSize.subtitle}
                  onChange={(e) => handleFontSizeChange('subtitle', e.target.value)}
                  placeholder="clamp(0.9rem, 2vw, 1.2rem)"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Preview */}
          <div className="p-4 bg-gray-50 rounded-lg">
            <h4 className="text-sm font-medium text-gray-700 mb-3">Preview:</h4>
            <div 
              className="p-4 rounded-lg"
              style={{
                backgroundColor: 'transparent',
                color: settings.textColor,
                textAlign: settings.textPosition
              }}
            >
              <div 
                style={{ fontSize: settings.fontSize.caption }}
                className="font-bold mb-2"
              >
                {settings.caption}
              </div>
              {settings.subtitle && (
                <div 
                  style={{ fontSize: settings.fontSize.subtitle }}
                  className="mb-3"
                >
                  {settings.subtitle}
                </div>
              )}
              {settings.buttonText && (
                <div className="pt-2">
                  <span className="inline-block bg-green-600 text-white px-4 py-2 rounded-md text-sm">
                    {settings.buttonText}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {submitting ? (
              <span className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Updating Settings...
              </span>
            ) : (
              'Update Hero Text Settings'
            )}
          </button>
        </form>
      </div>
    </div>
  );
}


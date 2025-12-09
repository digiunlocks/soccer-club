import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from 'react-toastify';
import { API_BASE_URL } from './config/api';

export default function ClubInfoManager() {
  const navigate = useNavigate();
  
  // Check if user is authenticated (admin)
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate('/signin');
      return;
    }
  }, [navigate]);
  
  const [loading, setLoading] = useState(false);
  const [clubInfo, setClubInfo] = useState({
    // Basic Information
    name: "",
    shortName: "",
    founded: "",
    location: "",
    address: "",
    city: "",
    state: "",
    zipCode: "",
    country: "",
    phone: "",
    email: "",
    website: "",
    
    // Club Details
    description: "",
    mission: "",
    vision: "",
    values: [],
    
    // Contact Information
    president: "",
    vicePresident: "",
    secretary: "",
    treasurer: "",
    technicalDirector: "",
    headCoach: "",
    
    // Social Media
    facebook: "",
    twitter: "",
    instagram: "",
    linkedin: "",
    youtube: "",
    
    // Club Colors & Branding
    primaryColor: "#1e40af",
    secondaryColor: "#f59e0b",
    logo: "",
    motto: "",
    
    // Facilities
    homeField: "",
    trainingFacilities: [],
    officeLocation: "",
    
    // Registration & Legal
    registrationNumber: "",
    taxId: "",
    nonProfit: false,
    insuranceProvider: "",
    insuranceNumber: "",
    
    // Club Statistics
    totalMembers: 0,
    activePlayers: 0,
    coaches: 0,
    volunteers: 0,
    teams: 0,
    
    // Awards & Achievements
    awards: [],
    championships: [],
    recognitions: []
  });

  const [activeTab, setActiveTab] = useState('basic');
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingField, setEditingField] = useState(null);

  // Update page title
  useEffect(() => {
    document.title = "Club Information Management - Seattle Leopards FC Admin";
  }, []);

  // Fetch club information
  useEffect(() => {
    fetchClubInfo();
  }, []);

  const fetchClubInfo = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_BASE_URL}/club-info`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setClubInfo(data);
      } else {
        // If no club info exists, use default values
        console.log('No club info found, using defaults');
      }
    } catch (error) {
      console.error('Error fetching club info:', error);
      toast.error('Failed to fetch club information');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_BASE_URL}/club-info`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(clubInfo)
      });

      if (response.ok) {
        toast.success('Club information updated successfully!');
      } else {
        const error = await response.json();
        toast.error(error.message || 'Failed to update club information');
      }
    } catch (error) {
      console.error('Error updating club info:', error);
      toast.error('Failed to update club information');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field, value) => {
    setClubInfo(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleArrayChange = (field, index, value) => {
    setClubInfo(prev => ({
      ...prev,
      [field]: prev[field].map((item, i) => i === index ? value : item)
    }));
  };

  const addArrayItem = (field, newItem) => {
    setClubInfo(prev => ({
      ...prev,
      [field]: [...prev[field], newItem]
    }));
  };

  const removeArrayItem = (field, index) => {
    setClubInfo(prev => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index)
    }));
  };

  const tabs = [
    { id: 'basic', name: 'Basic Information', icon: '🏢' },
    { id: 'contact', name: 'Contact Details', icon: '📞' },
    { id: 'branding', name: 'Branding & Colors', icon: '🎨' },
    { id: 'facilities', name: 'Facilities', icon: '🏟️' },
    { id: 'legal', name: 'Legal & Registration', icon: '📋' },
    { id: 'social', name: 'Social Media', icon: '📱' },
    { id: 'achievements', name: 'Achievements', icon: '🏆' }
  ];

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto p-6 bg-gray-50 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading club information...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate('/admin')}
            className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Dashboard
          </button>
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <span>Admin</span>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
            </svg>
            <span className="text-gray-700 font-medium">Club Information Management</span>
          </div>
          <h2 className="text-2xl font-bold text-blue-900">Club Information Management</h2>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleSave}
            disabled={loading}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
            </svg>
            {loading ? 'Saving...' : 'Save Changes'}
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
                    ? 'border-blue-500 text-blue-600'
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

      {/* Basic Information Tab */}
      {activeTab === 'basic' && (
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Basic Club Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Club Name</label>
              <input
                type="text"
                value={clubInfo.name}
                onChange={(e) => handleChange('name', e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2"
                placeholder="Seattle Leopards FC"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Short Name</label>
              <input
                type="text"
                value={clubInfo.shortName}
                onChange={(e) => handleChange('shortName', e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2"
                placeholder="SLFC"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Founded</label>
              <input
                type="text"
                value={clubInfo.founded}
                onChange={(e) => handleChange('founded', e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2"
                placeholder="2020"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
              <input
                type="text"
                value={clubInfo.location}
                onChange={(e) => handleChange('location', e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2"
                placeholder="Seattle, WA"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
              <textarea
                value={clubInfo.description}
                onChange={(e) => handleChange('description', e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2"
                rows="3"
                placeholder="Brief description of the club..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Mission</label>
              <textarea
                value={clubInfo.mission}
                onChange={(e) => handleChange('mission', e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2"
                rows="3"
                placeholder="Club mission statement..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Vision</label>
              <textarea
                value={clubInfo.vision}
                onChange={(e) => handleChange('vision', e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2"
                rows="3"
                placeholder="Club vision statement..."
              />
            </div>
          </div>
        </div>
      )}

      {/* Contact Details Tab */}
      {activeTab === 'contact' && (
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Contact Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
              <input
                type="tel"
                value={clubInfo.phone}
                onChange={(e) => handleChange('phone', e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2"
                placeholder="(206) 555-0123"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
              <input
                type="email"
                value={clubInfo.email}
                onChange={(e) => handleChange('email', e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2"
                placeholder="info@seattleleopards.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Website</label>
              <input
                type="url"
                value={clubInfo.website}
                onChange={(e) => handleChange('website', e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2"
                placeholder="https://seattleleopards.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Address</label>
              <input
                type="text"
                value={clubInfo.address}
                onChange={(e) => handleChange('address', e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2"
                placeholder="123 Main Street"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">City</label>
              <input
                type="text"
                value={clubInfo.city}
                onChange={(e) => handleChange('city', e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2"
                placeholder="Seattle"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">State</label>
              <input
                type="text"
                value={clubInfo.state}
                onChange={(e) => handleChange('state', e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2"
                placeholder="WA"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">ZIP Code</label>
              <input
                type="text"
                value={clubInfo.zipCode}
                onChange={(e) => handleChange('zipCode', e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2"
                placeholder="98101"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Country</label>
              <input
                type="text"
                value={clubInfo.country}
                onChange={(e) => handleChange('country', e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2"
                placeholder="United States"
              />
            </div>
          </div>
        </div>
      )}

      {/* Branding & Colors Tab */}
      {activeTab === 'branding' && (
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Branding & Colors</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Primary Color</label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={clubInfo.primaryColor}
                  onChange={(e) => handleChange('primaryColor', e.target.value)}
                  className="w-12 h-10 border border-gray-300 rounded"
                />
                <input
                  type="text"
                  value={clubInfo.primaryColor}
                  onChange={(e) => handleChange('primaryColor', e.target.value)}
                  className="flex-1 border border-gray-300 rounded-md px-3 py-2"
                  placeholder="#1e40af"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Secondary Color</label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={clubInfo.secondaryColor}
                  onChange={(e) => handleChange('secondaryColor', e.target.value)}
                  className="w-12 h-10 border border-gray-300 rounded"
                />
                <input
                  type="text"
                  value={clubInfo.secondaryColor}
                  onChange={(e) => handleChange('secondaryColor', e.target.value)}
                  className="flex-1 border border-gray-300 rounded-md px-3 py-2"
                  placeholder="#f59e0b"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Motto</label>
              <input
                type="text"
                value={clubInfo.motto}
                onChange={(e) => handleChange('motto', e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2"
                placeholder="Excellence Through Unity"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Logo URL</label>
              <input
                type="url"
                value={clubInfo.logo}
                onChange={(e) => handleChange('logo', e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2"
                placeholder="https://example.com/logo.png"
              />
            </div>
          </div>
        </div>
      )}

      {/* Facilities Tab */}
      {activeTab === 'facilities' && (
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Facilities</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Home Field</label>
              <input
                type="text"
                value={clubInfo.homeField}
                onChange={(e) => handleChange('homeField', e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2"
                placeholder="Seattle Sports Complex"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Office Location</label>
              <input
                type="text"
                value={clubInfo.officeLocation}
                onChange={(e) => handleChange('officeLocation', e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2"
                placeholder="123 Club Street, Seattle, WA"
              />
            </div>
          </div>
        </div>
      )}

      {/* Legal & Registration Tab */}
      {activeTab === 'legal' && (
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Legal & Registration</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Registration Number</label>
              <input
                type="text"
                value={clubInfo.registrationNumber}
                onChange={(e) => handleChange('registrationNumber', e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2"
                placeholder="REG-2024-001"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Tax ID</label>
              <input
                type="text"
                value={clubInfo.taxId}
                onChange={(e) => handleChange('taxId', e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2"
                placeholder="12-3456789"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Insurance Provider</label>
              <input
                type="text"
                value={clubInfo.insuranceProvider}
                onChange={(e) => handleChange('insuranceProvider', e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2"
                placeholder="Sports Insurance Co."
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Insurance Number</label>
              <input
                type="text"
                value={clubInfo.insuranceNumber}
                onChange={(e) => handleChange('insuranceNumber', e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2"
                placeholder="INS-2024-001"
              />
            </div>
            <div className="md:col-span-2">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={clubInfo.nonProfit}
                  onChange={(e) => handleChange('nonProfit', e.target.checked)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="ml-2 text-sm text-gray-700">Non-Profit Organization</span>
              </label>
            </div>
          </div>
        </div>
      )}

      {/* Social Media Tab */}
      {activeTab === 'social' && (
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Social Media</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Facebook</label>
              <input
                type="url"
                value={clubInfo.facebook}
                onChange={(e) => handleChange('facebook', e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2"
                placeholder="https://facebook.com/seattleleopards"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Twitter</label>
              <input
                type="url"
                value={clubInfo.twitter}
                onChange={(e) => handleChange('twitter', e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2"
                placeholder="https://twitter.com/seattleleopards"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Instagram</label>
              <input
                type="url"
                value={clubInfo.instagram}
                onChange={(e) => handleChange('instagram', e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2"
                placeholder="https://instagram.com/seattleleopards"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">LinkedIn</label>
              <input
                type="url"
                value={clubInfo.linkedin}
                onChange={(e) => handleChange('linkedin', e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2"
                placeholder="https://linkedin.com/company/seattleleopards"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">YouTube</label>
              <input
                type="url"
                value={clubInfo.youtube}
                onChange={(e) => handleChange('youtube', e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2"
                placeholder="https://youtube.com/seattleleopards"
              />
            </div>
          </div>
        </div>
      )}

      {/* Achievements Tab */}
      {activeTab === 'achievements' && (
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Achievements & Awards</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Awards</label>
              <div className="space-y-2">
                {clubInfo.awards.map((award, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <input
                      type="text"
                      value={award}
                      onChange={(e) => handleArrayChange('awards', index, e.target.value)}
                      className="flex-1 border border-gray-300 rounded-md px-3 py-2"
                      placeholder="Award name"
                    />
                    <button
                      onClick={() => removeArrayItem('awards', index)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                ))}
                <button
                  onClick={() => addArrayItem('awards', '')}
                  className="text-blue-600 hover:text-blue-800 text-sm"
                >
                  + Add Award
                </button>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Championships</label>
              <div className="space-y-2">
                {clubInfo.championships.map((championship, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <input
                      type="text"
                      value={championship}
                      onChange={(e) => handleArrayChange('championships', index, e.target.value)}
                      className="flex-1 border border-gray-300 rounded-md px-3 py-2"
                      placeholder="Championship name"
                    />
                    <button
                      onClick={() => removeArrayItem('championships', index)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                ))}
                <button
                  onClick={() => addArrayItem('championships', '')}
                  className="text-blue-600 hover:text-blue-800 text-sm"
                >
                  + Add Championship
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

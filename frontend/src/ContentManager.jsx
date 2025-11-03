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
  
  // About Page states
  const [aboutData, setAboutData] = useState({
    title: '',
    description: '',
    additionalInfo: '',
    highlights: []
  });
  const [currentGallery, setCurrentGallery] = useState([]);
  const [aboutLoading, setAboutLoading] = useState(false);
  const [aboutSaving, setAboutSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [newHighlight, setNewHighlight] = useState('');
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [imageCaptions, setImageCaptions] = useState([]);
  const [imageAlts, setImageAlts] = useState([]);
  const [aboutActiveSection, setAboutActiveSection] = useState('content'); // 'content' or 'gallery'
  const [editingImage, setEditingImage] = useState(null);
  const [selectedImages, setSelectedImages] = useState([]);
  const [galleryView, setGalleryView] = useState('grid'); // 'grid', 'list'
  const [searchTerm, setSearchTerm] = useState('');
  const [dragIndex, setDragIndex] = useState(null);
  const [hoverIndex, setHoverIndex] = useState(null);

  // Fetch homepage content
  useEffect(() => {
    fetchContent();
  }, []);

  // Fetch about page data when tab is active
  useEffect(() => {
    if (activeTab === 'about') {
      fetchAboutData();
    }
  }, [activeTab]);

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

  // Fetch about page data
  const fetchAboutData = async () => {
    try {
      setAboutLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/about/admin', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch about page data');
      }
      
      const data = await response.json();
      setAboutData({
        title: data.title || '',
        description: data.description || '',
        additionalInfo: data.additionalInfo || '',
        highlights: data.highlights || []
      });
      
      setCurrentGallery(data.gallery || []);
    } catch (error) {
      console.error('Error fetching about data:', error);
      toast.error('Failed to load about page data');
    } finally {
      setAboutLoading(false);
    }
  };

  // About page handlers
  const handleAboutSave = async () => {
    setAboutSaving(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/about', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(aboutData)
      });

      if (!response.ok) {
        throw new Error('Failed to update about page');
      }

      toast.success('About page updated successfully!');
    } catch (error) {
      console.error('Error updating about page:', error);
      toast.error('Failed to update about page');
    } finally {
      setAboutSaving(false);
    }
  };

  const handleAddHighlight = () => {
    if (newHighlight.trim()) {
      setAboutData(prev => ({
        ...prev,
        highlights: [...prev.highlights, newHighlight.trim()]
      }));
      setNewHighlight('');
    }
  };

  const handleRemoveHighlight = (index) => {
    setAboutData(prev => ({
      ...prev,
      highlights: prev.highlights.filter((_, i) => i !== index)
    }));
  };

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    setSelectedFiles(files);
    setImageCaptions(new Array(files.length).fill(''));
    setImageAlts(new Array(files.length).fill(''));
  };

  const handleUploadImages = async () => {
    if (selectedFiles.length === 0) {
      toast.error('Please select at least one image');
      return;
    }

    setUploading(true);
    try {
      const token = localStorage.getItem('token');
      const formData = new FormData();
      
      selectedFiles.forEach(file => {
        formData.append('images', file);
      });
      
      formData.append('captions', JSON.stringify(imageCaptions));
      formData.append('alts', JSON.stringify(imageAlts));

      const response = await fetch('http://localhost:5000/api/about/gallery', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to upload images');
      }

      toast.success('Images uploaded successfully!');
      setSelectedFiles([]);
      setImageCaptions([]);
      setImageAlts([]);
      
      await fetchAboutData();
    } catch (error) {
      console.error('Error uploading images:', error);
      toast.error(error.message || 'Failed to upload images');
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteImage = async (imageId) => {
    if (!window.confirm('Are you sure you want to delete this image?')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/about/gallery/${imageId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to delete image');
      }

      toast.success('Image deleted successfully!');
      await fetchAboutData();
    } catch (error) {
      console.error('Error deleting image:', error);
      toast.error('Failed to delete image');
    }
  };

  const handleBulkDelete = async () => {
    if (selectedImages.length === 0) {
      toast.error('Please select images to delete');
      return;
    }

    if (!window.confirm(`Are you sure you want to delete ${selectedImages.length} image(s)?`)) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const deletePromises = selectedImages.map(imageId =>
        fetch(`http://localhost:5000/api/about/gallery/${imageId}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        })
      );

      await Promise.all(deletePromises);
      toast.success(`${selectedImages.length} image(s) deleted successfully!`);
      setSelectedImages([]);
      await fetchAboutData();
    } catch (error) {
      console.error('Error bulk deleting images:', error);
      toast.error('Failed to delete some images');
    }
  };

  const handleUpdateImage = async (imageId, updates) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/about/gallery/${imageId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(updates)
      });

      if (!response.ok) {
        throw new Error('Failed to update image');
      }

      toast.success('Image updated successfully!');
      setEditingImage(null);
      await fetchAboutData();
    } catch (error) {
      console.error('Error updating image:', error);
      toast.error('Failed to update image');
    }
  };

  const handleReorderGallery = async (newOrder) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/about/gallery/reorder', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ imageIds: newOrder })
      });

      if (!response.ok) {
        throw new Error('Failed to reorder gallery');
      }

      toast.success('Gallery reordered successfully!');
      await fetchAboutData();
    } catch (error) {
      console.error('Error reordering gallery:', error);
      toast.error('Failed to reorder gallery');
    }
  };

  const handleDragStart = (e, index) => {
    setDragIndex(index);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e, index) => {
    e.preventDefault();
    setHoverIndex(index);
  };

  const handleDrop = (e, index) => {
    e.preventDefault();
    if (dragIndex !== null && dragIndex !== index) {
      const newOrder = [...currentGallery];
      const draggedItem = newOrder[dragIndex];
      newOrder.splice(dragIndex, 1);
      newOrder.splice(index, 0, draggedItem);
      
      setCurrentGallery(newOrder);
      handleReorderGallery(newOrder.map(img => img._id));
    }
    setDragIndex(null);
    setHoverIndex(null);
  };

  const handleDragEnd = () => {
    setDragIndex(null);
    setHoverIndex(null);
  };

  const filteredGallery = currentGallery.filter(image =>
    image.caption?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    image.alt?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const toggleImageSelection = (imageId) => {
    setSelectedImages(prev =>
      prev.includes(imageId)
        ? prev.filter(id => id !== imageId)
        : [...prev, imageId]
    );
  };

  const selectAllImages = () => {
    setSelectedImages(filteredGallery.map(img => img._id));
  };

  const clearSelection = () => {
    setSelectedImages([]);
  };

  // Homepage content handlers
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
            {aboutLoading ? (
              <div className="flex items-center justify-center h-64">
                <div className="flex items-center space-x-3">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
                  <span className="text-lg text-gray-600">Loading...</span>
                </div>
              </div>
            ) : (
              <>
                {/* Header with Preview Button */}
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                      <span className="text-2xl">ℹ️</span>
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900">About Page Manager</h2>
                      <p className="text-gray-600">Manage your about page content and gallery</p>
                    </div>
                  </div>
                  <button
                    onClick={() => window.open('/about', '_blank')}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    👁️ Preview About Page
                  </button>
                </div>

                {/* Navigation Tabs */}
                <div className="flex space-x-1 mb-8 bg-gray-100 p-1 rounded-lg">
                  <button
                    onClick={() => setAboutActiveSection('content')}
                    className={`flex-1 py-3 px-4 rounded-md font-medium transition-colors ${
                      aboutActiveSection === 'content'
                        ? 'bg-white text-green-600 shadow-sm'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    📝 Content
                  </button>
                  <button
                    onClick={() => setAboutActiveSection('gallery')}
                    className={`flex-1 py-3 px-4 rounded-md font-medium transition-colors ${
                      aboutActiveSection === 'gallery'
                        ? 'bg-white text-green-600 shadow-sm'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    🖼️ Gallery ({currentGallery.length})
                  </button>
                </div>

                {/* Content Section */}
                {aboutActiveSection === 'content' && (
                  <div className="space-y-8">
                    {/* Basic Content */}
                    <div className="space-y-6">
                      <h3 className="text-2xl font-bold text-gray-900">Page Content</h3>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Page Title
                        </label>
                        <input
                          type="text"
                          value={aboutData.title}
                          onChange={(e) => setAboutData(prev => ({ ...prev, title: e.target.value }))}
                          className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-lg"
                          placeholder="About Seattle Leopards FC"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Main Description
                        </label>
                        <textarea
                          value={aboutData.description}
                          onChange={(e) => setAboutData(prev => ({ ...prev, description: e.target.value }))}
                          rows={6}
                          className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-lg"
                          placeholder="Enter the main description..."
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Additional Information
                        </label>
                        <textarea
                          value={aboutData.additionalInfo}
                          onChange={(e) => setAboutData(prev => ({ ...prev, additionalInfo: e.target.value }))}
                          rows={4}
                          className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-lg"
                          placeholder="Enter additional information..."
                        />
                      </div>
                    </div>

                    {/* Club Highlights */}
                    <div className="space-y-6">
                      <h3 className="text-2xl font-bold text-gray-900">Club Highlights</h3>
                      
                      <div className="space-y-3">
                        {aboutData.highlights.map((highlight, index) => (
                          <div key={index} className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                            <span className="text-gray-500 text-lg">•</span>
                            <span className="flex-1 text-lg">{highlight}</span>
                            <button
                              type="button"
                              onClick={() => handleRemoveHighlight(index)}
                              className="text-red-600 hover:text-red-800 text-sm font-medium px-3 py-1 rounded-md hover:bg-red-50 transition-colors"
                            >
                              Remove
                            </button>
                          </div>
                        ))}
                      </div>

                      <div className="flex gap-3">
                        <input
                          type="text"
                          value={newHighlight}
                          onChange={(e) => setNewHighlight(e.target.value)}
                          className="flex-1 p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-lg"
                          placeholder="Add a new highlight..."
                          onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddHighlight())}
                        />
                        <button
                          type="button"
                          onClick={handleAddHighlight}
                          className="px-6 py-4 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
                        >
                          Add
                        </button>
                      </div>
                    </div>

                    {/* Save Button */}
                    <div className="pt-6">
                      <button
                        type="button"
                        onClick={handleAboutSave}
                        disabled={aboutSaving}
                        className="w-full bg-green-600 text-white py-4 px-6 rounded-lg font-semibold hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-lg"
                      >
                        {aboutSaving ? '💾 Saving...' : '💾 Save About Page Content'}
                      </button>
                    </div>
                  </div>
                )}

                {/* Gallery Section */}
                {aboutActiveSection === 'gallery' && (
                  <div className="space-y-8">
                    <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
                      <h3 className="text-2xl font-bold text-gray-900">Gallery Management</h3>
                      
                      {/* Gallery Controls */}
                      <div className="flex items-center gap-3">
                        <div className="flex bg-gray-100 rounded-lg p-1">
                          <button
                            onClick={() => setGalleryView('grid')}
                            className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                              galleryView === 'grid' 
                                ? 'bg-white text-green-600 shadow-sm' 
                                : 'text-gray-600 hover:text-gray-900'
                            }`}
                          >
                            Grid
                          </button>
                          <button
                            onClick={() => setGalleryView('list')}
                            className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                              galleryView === 'list' 
                                ? 'bg-white text-green-600 shadow-sm' 
                                : 'text-gray-600 hover:text-gray-900'
                            }`}
                          >
                            List
                          </button>
                        </div>
                        
                        {selectedImages.length > 0 && (
                          <button
                            onClick={handleBulkDelete}
                            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium"
                          >
                            🗑️ Delete Selected ({selectedImages.length})
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Search and Selection Controls */}
                    <div className="flex flex-col sm:flex-row gap-4">
                      <div className="flex-1">
                        <input
                          type="text"
                          placeholder="Search images by caption or alt text..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        />
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={selectAllImages}
                          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                        >
                          Select All
                        </button>
                        <button
                          onClick={clearSelection}
                          className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors text-sm font-medium"
                        >
                          Clear
                        </button>
                      </div>
                    </div>
                    
                    {/* Upload New Images */}
                    <div className="bg-gradient-to-r from-blue-50 to-green-50 p-6 rounded-xl border-2 border-dashed border-blue-200">
                      <h4 className="text-xl font-semibold text-gray-900 mb-4">📤 Upload New Images</h4>
                      
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Select Images (Max 10, 20MB each)
                          </label>
                          <input
                            type="file"
                            multiple
                            accept="image/*"
                            onChange={handleFileSelect}
                            className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                          />
                        </div>

                        {selectedFiles.length > 0 && (
                          <div className="space-y-4">
                            <h5 className="font-semibold text-gray-900">Image Details:</h5>
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                              {selectedFiles.map((file, index) => (
                                <div key={index} className="bg-white p-4 rounded-lg border">
                                  <div className="text-sm text-gray-600 mb-3 font-medium">
                                    {file.name}
                                  </div>
                                  <div className="space-y-2">
                                    <input
                                      type="text"
                                      placeholder="Caption (optional)"
                                      value={imageCaptions[index] || ''}
                                      onChange={(e) => {
                                        const newCaptions = [...imageCaptions];
                                        newCaptions[index] = e.target.value;
                                        setImageCaptions(newCaptions);
                                      }}
                                      className="w-full p-2 border border-gray-300 rounded text-sm"
                                    />
                                    <input
                                      type="text"
                                      placeholder="Alt text (optional)"
                                      value={imageAlts[index] || ''}
                                      onChange={(e) => {
                                        const newAlts = [...imageAlts];
                                        newAlts[index] = e.target.value;
                                        setImageAlts(newAlts);
                                      }}
                                      className="w-full p-2 border border-gray-300 rounded text-sm"
                                    />
                                  </div>
                                </div>
                              ))}
                            </div>
                            
                            <button
                              type="button"
                              onClick={handleUploadImages}
                              disabled={uploading}
                              className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              {uploading ? '📤 Uploading...' : '📤 Upload Images'}
                            </button>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Current Gallery */}
                    <div>
                      <h4 className="text-xl font-semibold text-gray-900 mb-4">
                        Current Gallery ({filteredGallery.length} images)
                      </h4>
                      
                      {filteredGallery.length > 0 ? (
                        <div className={galleryView === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6' : 'space-y-4'}>
                          {filteredGallery.map((image, index) => (
                            <div 
                              key={image._id || index} 
                              className={`relative group ${
                                galleryView === 'grid' 
                                  ? 'bg-white rounded-xl shadow-lg overflow-hidden border-2 border-transparent hover:border-green-300 transition-all duration-200' 
                                  : 'bg-white rounded-lg shadow-md p-4 flex items-center gap-4'
                              } ${
                                dragIndex === index ? 'opacity-50' : ''
                              } ${
                                hoverIndex === index ? 'border-green-500' : ''
                              }`}
                              draggable
                              onDragStart={(e) => handleDragStart(e, index)}
                              onDragOver={(e) => handleDragOver(e, index)}
                              onDrop={(e) => handleDrop(e, index)}
                              onDragEnd={handleDragEnd}
                            >
                              {/* Selection Checkbox */}
                              <input
                                type="checkbox"
                                checked={selectedImages.includes(image._id)}
                                onChange={() => toggleImageSelection(image._id)}
                                className="absolute top-2 left-2 z-10 w-5 h-5 text-green-600 bg-white rounded border-gray-300 focus:ring-green-500"
                              />
                              
                              {galleryView === 'grid' ? (
                                <>
                                  <div className="relative">
                                    <img
                                      src={`http://localhost:5000${image.url}`}
                                      alt={image.alt || 'Gallery image'}
                                      className="w-full h-48 object-cover"
                                    />
                                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all duration-200 flex items-center justify-center">
                                      <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                                        <button
                                          onClick={() => setEditingImage(image)}
                                          className="bg-blue-600 text-white px-3 py-1 rounded text-sm font-medium hover:bg-blue-700 transition-colors"
                                        >
                                          Edit
                                        </button>
                                        <button
                                          onClick={() => handleDeleteImage(image._id)}
                                          className="bg-red-600 text-white px-3 py-1 rounded text-sm font-medium hover:bg-red-700 transition-colors"
                                        >
                                          Delete
                                        </button>
                                      </div>
                                    </div>
                                  </div>
                                  <div className="p-4">
                                    <p className="text-sm text-gray-600 mb-1">Order: {image.order}</p>
                                    {image.caption && (
                                      <p className="text-sm font-medium text-gray-900 mb-1">{image.caption}</p>
                                    )}
                                    <p className="text-xs text-gray-500">{image.alt}</p>
                                  </div>
                                </>
                              ) : (
                                <>
                                  <img
                                    src={`http://localhost:5000${image.url}`}
                                    alt={image.alt || 'Gallery image'}
                                    className="w-20 h-20 object-cover rounded-lg"
                                  />
                                  <div className="flex-1">
                                    <div className="flex items-center gap-4 mb-2">
                                      <span className="text-sm text-gray-500">Order: {image.order}</span>
                                      {image.caption && (
                                        <span className="text-sm font-medium text-gray-900">{image.caption}</span>
                                      )}
                                    </div>
                                    <p className="text-sm text-gray-600">{image.alt}</p>
                                  </div>
                                  <div className="flex gap-2">
                                    <button
                                      onClick={() => setEditingImage(image)}
                                      className="bg-blue-600 text-white px-3 py-1 rounded text-sm font-medium hover:bg-blue-700 transition-colors"
                                    >
                                      Edit
                                    </button>
                                    <button
                                      onClick={() => handleDeleteImage(image._id)}
                                      className="bg-red-600 text-white px-3 py-1 rounded text-sm font-medium hover:bg-red-700 transition-colors"
                                    >
                                      Delete
                                    </button>
                                  </div>
                                </>
                              )}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-12 text-gray-500 bg-gray-50 rounded-xl">
                          <div className="text-6xl mb-4">📷</div>
                          <h3 className="text-xl font-semibold mb-2">No Gallery Images</h3>
                          <p className="text-sm">Upload images to see them here</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {/* Action Buttons */}
        {activeTab !== 'about' && (
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
        )}
      </form>

      {/* Image Edit Modal */}
      {editingImage && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl p-6 max-w-md w-full">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Edit Image</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Caption</label>
                <input
                  type="text"
                  value={editingImage.caption || ''}
                  onChange={(e) => setEditingImage(prev => ({ ...prev, caption: e.target.value }))}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Alt Text</label>
                <input
                  type="text"
                  value={editingImage.alt || ''}
                  onChange={(e) => setEditingImage(prev => ({ ...prev, alt: e.target.value }))}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Order</label>
                <input
                  type="number"
                  value={editingImage.order || 0}
                  onChange={(e) => setEditingImage(prev => ({ ...prev, order: parseInt(e.target.value) || 0 }))}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>
            </div>
            
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => handleUpdateImage(editingImage._id, {
                  caption: editingImage.caption,
                  alt: editingImage.alt,
                  order: editingImage.order
                })}
                className="flex-1 bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors font-medium"
              >
                Save Changes
              </button>
              <button
                onClick={() => setEditingImage(null)}
                className="flex-1 bg-gray-600 text-white py-2 px-4 rounded-lg hover:bg-gray-700 transition-colors font-medium"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
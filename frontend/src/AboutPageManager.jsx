import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'react-toastify';
import { API_BASE_URL } from './config/api';

// Server base URL for images (without /api)
const SERVER_URL = API_BASE_URL.replace('/api', '');

export default function AboutPageManager() {
  const navigate = useNavigate();
  const location = useLocation();
  const [aboutData, setAboutData] = useState({
    title: '',
    description: '',
    additionalInfo: '',
    highlights: []
  });
  const [currentGallery, setCurrentGallery] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [newHighlight, setNewHighlight] = useState('');
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [imageCaptions, setImageCaptions] = useState([]);
  const [imageAlts, setImageAlts] = useState([]);
  const [activeSection, setActiveSection] = useState('content'); // 'content' or 'gallery'
  const [editingImage, setEditingImage] = useState(null);
  const [selectedImages, setSelectedImages] = useState([]);
  const [galleryView, setGalleryView] = useState('grid'); // 'grid', 'list'
  const [searchTerm, setSearchTerm] = useState('');
  const [dragIndex, setDragIndex] = useState(null);
  const [hoverIndex, setHoverIndex] = useState(null);
  const [unauthorized, setUnauthorized] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/signin');
      return;
    }
    fetchAboutData();
  }, [navigate]);

  const handleBack = () => {
    if (location.state?.from) {
      navigate('/admin', { state: { section: location.state.from } });
    } else {
      navigate('/admin');
    }
  };

  const fetchAboutData = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/about/admin`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.status === 401 || response.status === 403) {
        setUnauthorized(true);
        toast.error('You do not have permission to access this page');
        return;
      }
      
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
      
      // Set gallery images
      setCurrentGallery(data.gallery || []);
    } catch (error) {
      console.error('Error fetching about data:', error);
      toast.error('Failed to load about page data');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/about`, {
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
      setSaving(false);
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

      const response = await fetch(`${API_BASE_URL}/about/gallery`, {
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
      
      // Refresh gallery data
      await fetchAboutData();
      
      // Refresh frontend about page
      if (window.refreshAboutPage) {
        window.refreshAboutPage();
      }
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
      const response = await fetch(`${API_BASE_URL}/about/gallery/${imageId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to delete image');
      }

      toast.success('Image deleted successfully!');
      
      // Refresh gallery data
      await fetchAboutData();
      
      // Refresh frontend about page
      if (window.refreshAboutPage) {
        window.refreshAboutPage();
      }
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
        fetch(`${API_BASE_URL}/about/gallery/${imageId}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        })
      );

      await Promise.all(deletePromises);
      toast.success(`${selectedImages.length} image(s) deleted successfully!`);
      setSelectedImages([]);
      
      // Refresh gallery data
      await fetchAboutData();
      
      // Refresh frontend about page
      if (window.refreshAboutPage) {
        window.refreshAboutPage();
      }
    } catch (error) {
      console.error('Error bulk deleting images:', error);
      toast.error('Failed to delete some images');
    }
  };

  const handleUpdateImage = async (imageId, updates) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/about/gallery/${imageId}`, {
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
      
      // Refresh gallery data
      await fetchAboutData();
      
      // Refresh frontend about page
      if (window.refreshAboutPage) {
        window.refreshAboutPage();
      }
    } catch (error) {
      console.error('Error updating image:', error);
      toast.error('Failed to update image');
    }
  };

  const handleReorderGallery = async (newOrder) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/about/gallery/reorder`, {
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
      
      // Refresh gallery data
      await fetchAboutData();
      
      // Refresh frontend about page
      if (window.refreshAboutPage) {
        window.refreshAboutPage();
      }
    } catch (error) {
      console.error('Error reordering gallery:', error);
      toast.error('Failed to reorder gallery');
    }
  };

  // Drag and drop functionality
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
      
      // Update local state immediately for better UX
      setCurrentGallery(newOrder);
      
      // Send to backend
      handleReorderGallery(newOrder.map(img => img._id));
    }
    setDragIndex(null);
    setHoverIndex(null);
  };

  const handleDragEnd = () => {
    setDragIndex(null);
    setHoverIndex(null);
  };

  // Filter gallery based on search term
  const filteredGallery = currentGallery.filter(image =>
    image.caption?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    image.alt?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Toggle image selection
  const toggleImageSelection = (imageId) => {
    setSelectedImages(prev =>
      prev.includes(imageId)
        ? prev.filter(id => id !== imageId)
        : [...prev, imageId]
    );
  };

  // Select all images
  const selectAllImages = () => {
    setSelectedImages(filteredGallery.map(img => img._id));
  };

  // Clear selection
  const clearSelection = () => {
    setSelectedImages([]);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex items-center space-x-3">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
          <span className="text-lg text-gray-600">Loading...</span>
        </div>
      </div>
    );
  }

  if (unauthorized) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-xl shadow-lg p-8 max-w-md text-center">
          <div className="text-6xl mb-4">🔒</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h2>
          <p className="text-gray-600 mb-6">You do not have permission to access the About Page Manager. This feature requires super admin privileges.</p>
          <button
            onClick={handleBack}
            className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="bg-white rounded-xl shadow-lg p-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
              <span className="text-2xl">ℹ️</span>
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">About Page Manager</h1>
              <p className="text-gray-600">Manage your about page content and gallery</p>
            </div>
          </div>
          <button
            onClick={handleBack}
            className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex space-x-1 mb-8 bg-gray-100 p-1 rounded-lg">
          <button
            onClick={() => setActiveSection('content')}
            className={`flex-1 py-3 px-4 rounded-md font-medium transition-colors ${
              activeSection === 'content'
                ? 'bg-white text-green-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            📝 Content
          </button>
          <button
            onClick={() => setActiveSection('gallery')}
            className={`flex-1 py-3 px-4 rounded-md font-medium transition-colors ${
              activeSection === 'gallery'
                ? 'bg-white text-green-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            🖼️ Gallery ({currentGallery.length})
          </button>
        </div>

        {/* Content Section */}
        {activeSection === 'content' && (
          <form onSubmit={(e) => { e.preventDefault(); handleSave(); }} className="space-y-8">
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
                type="submit"
                disabled={saving}
                className="w-full bg-green-600 text-white py-4 px-6 rounded-lg font-semibold hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-lg"
              >
                {saving ? '💾 Saving...' : '💾 Save Changes'}
              </button>
            </div>
          </form>
        )}

        {/* Gallery Section */}
        {activeSection === 'gallery' && (
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
                    Select Images (Max 10, 20MB each, supports JPEG, JPG, PNG, WebP, GIF, BMP, TIFF, SVG)
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
                              src={`${SERVER_URL}${image.url}`}
                              alt={image.alt || 'Gallery image'}
                              className="w-full h-48 object-cover"
                              onError={(e) => {
                                e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjE5MiIgdmlld0JveD0iMCAwIDMwMCAxOTIiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIzMDAiIGhlaWdodD0iMTkyIiBmaWxsPSIjRjNGNEY2Ii8+Cjx0ZXh0IHg9IjE1MCIgeT0iOTYiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzlCOUJCQTAiIHRleHQtYW5jaG9yPSJtaWRkbGUiPkltYWdlIE5vdCBBdmFpbGFibGU8L3RleHQ+Cjwvc3ZnPgo=';
                              }}
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
                            src={`${SERVER_URL}${image.url}`}
                            alt={image.alt || 'Gallery image'}
                            className="w-20 h-20 object-cover rounded-lg"
                            onError={(e) => {
                              e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAiIGhlaWdodD0iODAiIHZpZXdCb3g9IjAgMCA4MCA4MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjgwIiBoZWlnaHQ9IjgwIiBmaWxsPSIjRjNGNEY2Ii8+Cjx0ZXh0IHg9IjQwIiB5PSI0MCIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjEwIiBmaWxsPSIjOUI5QkJBQCIgdGV4dC1hbmNob3I9Im1pZGRsZSI+SW1hZ2U8L3RleHQ+Cjwvc3ZnPgo=';
                            }}
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
    </div>
  );
}

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const MediaLibraryManager = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [mediaItems, setMediaItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [selectedMedia, setSelectedMedia] = useState(null);
  const [showPreview, setShowPreview] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [filter, setFilter] = useState({
    search: '',
    type: 'all',
    category: 'all',
    visibility: 'all',
    tag: 'all'
  });
  const [viewMode, setViewMode] = useState('grid');
  const [sortBy, setSortBy] = useState('date');

  const [uploadData, setUploadData] = useState({
    files: [],
    category: 'general',
    visibility: 'public',
    tags: [],
    description: '',
    credit: '',
    allowDownload: true
  });

  const mediaTypes = [
    { id: 'image', name: 'Images', icon: '🖼️', color: 'blue', extensions: ['.jpg', '.jpeg', '.png', '.gif', '.webp'] },
    { id: 'video', name: 'Videos', icon: '🎥', color: 'red', extensions: ['.mp4', '.mov', '.avi', '.webm'] },
    { id: 'audio', name: 'Audio', icon: '🎵', color: 'purple', extensions: ['.mp3', '.wav', '.ogg'] },
    { id: 'document', name: 'Documents', icon: '📄', color: 'green', extensions: ['.pdf', '.doc', '.docx', '.txt'] }
  ];

  const mediaCategories = [
    { id: 'general', name: 'General', icon: '📁', color: 'gray', description: 'General media files' },
    { id: 'matches', name: 'Match Photos/Videos', icon: '⚽', color: 'blue', description: 'Game day media' },
    { id: 'training', name: 'Training Media', icon: '🎯', color: 'green', description: 'Practice sessions' },
    { id: 'events', name: 'Events', icon: '🎉', color: 'purple', description: 'Tournament and event media' },
    { id: 'players', name: 'Player Photos', icon: '👤', color: 'teal', description: 'Player portraits and action shots' },
    { id: 'teams', name: 'Team Photos', icon: '👥', color: 'indigo', description: 'Team photos and group shots' },
    { id: 'facilities', name: 'Facilities', icon: '🏟️', color: 'orange', description: 'Fields and venues' },
    { id: 'sponsors', name: 'Sponsor Assets', icon: '🤝', color: 'yellow', description: 'Sponsor logos and materials' },
    { id: 'marketing', name: 'Marketing', icon: '📢', color: 'pink', description: 'Promotional materials' },
    { id: 'social', name: 'Social Media', icon: '📱', color: 'cyan', description: 'Social media content' },
    { id: 'awards', name: 'Awards & Trophies', icon: '🏆', color: 'lime', description: 'Achievement photos' },
    { id: 'other', name: 'Other', icon: '📦', color: 'gray', description: 'Miscellaneous media' }
  ];

  const visibilityOptions = [
    { id: 'public', name: 'Public', icon: '🌐', description: 'Visible on website and galleries' },
    { id: 'members', name: 'Members Only', icon: '🔐', description: 'Only members can access' },
    { id: 'internal', name: 'Internal', icon: '🏢', description: 'Staff and coaches only' },
    { id: 'private', name: 'Private', icon: '🔒', description: 'Admin only' }
  ];

  const tabs = [
    { id: 'overview', name: 'Overview', icon: '📊' },
    { id: 'images', name: 'Images', icon: '🖼️' },
    { id: 'videos', name: 'Videos', icon: '🎥' },
    { id: 'all', name: 'All Media', icon: '📁' },
    { id: 'upload', name: 'Upload', icon: '⬆️' }
  ];

  useEffect(() => {
    document.title = 'Media Library - Seattle Leopards FC Admin';
    loadMedia();
  }, []);

  const loadMedia = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/media');
      if (response.ok) {
        const data = await response.json();
        setMediaItems(Array.isArray(data) ? data : []);
      }
    } catch (error) {
      console.error('Error loading media:', error);
      setMediaItems([]);
    } finally {
      setLoading(false);
    }
  };

  const uploadMedia = async () => {
    if (!uploadData.files || uploadData.files.length === 0) {
      setMessage('Please select files to upload');
      setTimeout(() => setMessage(''), 3000);
      return;
    }

    try {
      setLoading(true);
      const formData = new FormData();
      
      Array.from(uploadData.files).forEach(file => {
        formData.append('files', file);
      });
      formData.append('category', uploadData.category);
      formData.append('visibility', uploadData.visibility);
      formData.append('tags', JSON.stringify(uploadData.tags));
      formData.append('description', uploadData.description);
      formData.append('credit', uploadData.credit);
      formData.append('allowDownload', uploadData.allowDownload);

      const response = await fetch('/api/media/upload', {
        method: 'POST',
        body: formData,
        // Note: Progress tracking would require XMLHttpRequest
      });

      if (response.ok) {
        setMessage(`${uploadData.files.length} file(s) uploaded successfully!`);
        loadMedia();
        setShowUploadModal(false);
        setUploadData({
          files: [],
          category: 'general',
          visibility: 'public',
          tags: [],
          description: '',
          credit: '',
          allowDownload: true
        });
      } else {
        setMessage('Error uploading files');
      }
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      console.error('Error uploading:', error);
      setMessage('Error uploading files');
      setTimeout(() => setMessage(''), 3000);
    } finally {
      setLoading(false);
      setUploadProgress(0);
    }
  };

  const deleteMedia = async (id) => {
    if (!confirm('Are you sure you want to delete this media file?')) return;

    try {
      setLoading(true);
      const response = await fetch(`/api/media/${id}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        setMessage('Media deleted successfully!');
        loadMedia();
      }
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      console.error('Error deleting media:', error);
    } finally {
      setLoading(false);
    }
  };

  const getFilteredMedia = () => {
    let filtered = Array.isArray(mediaItems) ? mediaItems : [];

    // Tab filtering
    if (activeTab === 'images') {
      filtered = filtered.filter(m => m.type === 'image');
    } else if (activeTab === 'videos') {
      filtered = filtered.filter(m => m.type === 'video');
    }

    // Additional filters
    if (filter.search) {
      filtered = filtered.filter(m =>
        m.title?.toLowerCase().includes(filter.search.toLowerCase()) ||
        m.description?.toLowerCase().includes(filter.search.toLowerCase()) ||
        m.tags?.some(tag => tag.toLowerCase().includes(filter.search.toLowerCase()))
      );
    }
    if (filter.type !== 'all') filtered = filtered.filter(m => m.type === filter.type);
    if (filter.category !== 'all') filtered = filtered.filter(m => m.category === filter.category);
    if (filter.visibility !== 'all') filtered = filtered.filter(m => m.visibility === filter.visibility);
    if (filter.tag !== 'all') filtered = filtered.filter(m => m.tags?.includes(filter.tag));

    // Sorting
    filtered.sort((a, b) => {
      if (sortBy === 'date') return new Date(b.uploadedDate) - new Date(a.uploadedDate);
      if (sortBy === 'name') return (a.title || '').localeCompare(b.title || '');
      if (sortBy === 'size') return (b.size || 0) - (a.size || 0);
      return 0;
    });

    return filtered;
  };

  const filteredMedia = getFilteredMedia();

  const stats = {
    total: Array.isArray(mediaItems) ? mediaItems.length : 0,
    images: Array.isArray(mediaItems) ? mediaItems.filter(m => m.type === 'image').length : 0,
    videos: Array.isArray(mediaItems) ? mediaItems.filter(m => m.type === 'video').length : 0,
    audio: Array.isArray(mediaItems) ? mediaItems.filter(m => m.type === 'audio').length : 0,
    documents: Array.isArray(mediaItems) ? mediaItems.filter(m => m.type === 'document').length : 0,
    public: Array.isArray(mediaItems) ? mediaItems.filter(m => m.visibility === 'public').length : 0,
    private: Array.isArray(mediaItems) ? mediaItems.filter(m => m.visibility === 'internal' || m.visibility === 'private').length : 0,
    totalSize: Array.isArray(mediaItems) ? mediaItems.reduce((sum, m) => sum + (m.size || 0), 0) : 0,
    byCategory: mediaCategories.map(cat => ({
      ...cat,
      count: Array.isArray(mediaItems) ? mediaItems.filter(m => m.category === cat.id).length : 0
    }))
  };

  const formatBytes = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Media Library</h1>
              <p className="mt-1 text-sm text-gray-500">
                Manage photos, videos, and documents for website and internal use
              </p>
            </div>
            <div className="flex space-x-3">
              <Link
                to="/admin"
                className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors"
              >
                ← Back to Admin
              </Link>
              <button
                onClick={() => setShowUploadModal(true)}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                <i className="bi bi-upload me-2"></i>Upload Media
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Message */}
      {message && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-4">
          <div className={`p-4 rounded-lg ${message.includes('success') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
            {message}
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-sm border mb-6">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6" aria-label="Tabs">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <span className="mr-2">{tab.icon}</span>
                  {tab.name}
                  {tab.id === 'images' && stats.images > 0 && (
                    <span className="ml-2 bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full text-xs">
                      {stats.images}
                    </span>
                  )}
                  {tab.id === 'videos' && stats.videos > 0 && (
                    <span className="ml-2 bg-red-100 text-red-800 px-2 py-0.5 rounded-full text-xs">
                      {stats.videos}
                    </span>
                  )}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Statistics Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white p-6 rounded-lg shadow-sm border">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-3xl font-bold text-blue-900">{stats.total}</div>
                    <div className="text-sm text-blue-700 mt-1">Total Files</div>
                  </div>
                  <div className="text-4xl">📁</div>
                </div>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-sm border">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-3xl font-bold text-green-900">{stats.images}</div>
                    <div className="text-sm text-green-700 mt-1">Images</div>
                  </div>
                  <div className="text-4xl">🖼️</div>
                </div>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-sm border">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-3xl font-bold text-red-900">{stats.videos}</div>
                    <div className="text-sm text-red-700 mt-1">Videos</div>
                  </div>
                  <div className="text-4xl">🎥</div>
                </div>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-sm border">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-2xl font-bold text-purple-900">{formatBytes(stats.totalSize)}</div>
                    <div className="text-sm text-purple-700 mt-1">Total Storage</div>
                  </div>
                  <div className="text-4xl">💾</div>
                </div>
              </div>
            </div>

            {/* Public vs Private */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-lg border border-blue-200">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-3xl font-bold text-blue-900">{stats.public}</div>
                    <div className="text-sm text-blue-700 mt-1">Public Media</div>
                  </div>
                  <div className="text-4xl">🌐</div>
                </div>
                <p className="text-xs text-blue-600 mt-2">Used on website, galleries, social media</p>
              </div>
              <div className="bg-gradient-to-br from-gray-50 to-gray-100 p-6 rounded-lg border border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-3xl font-bold text-gray-900">{stats.private}</div>
                    <div className="text-sm text-gray-700 mt-1">Private Media</div>
                  </div>
                  <div className="text-4xl">🔒</div>
                </div>
                <p className="text-xs text-gray-600 mt-2">Internal use only, not publicly accessible</p>
              </div>
            </div>

            {/* Media Categories Grid */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Media by Category</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {stats.byCategory.map((cat) => (
                  <div
                    key={cat.id}
                    className="bg-gradient-to-br from-gray-50 to-white p-4 rounded-lg border hover:shadow-lg transition-all cursor-pointer"
                    onClick={() => {
                      setFilter(f => ({ ...f, category: cat.id }));
                      setActiveTab('all');
                    }}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-2xl">{cat.icon}</span>
                      <div className="text-2xl font-bold text-gray-800">{cat.count}</div>
                    </div>
                    <h3 className="font-semibold text-gray-900 text-xs mb-1">{cat.name}</h3>
                    <p className="text-xs text-gray-600">{cat.description}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* What is Media Library */}
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">📸 What is Media Library?</h2>
              <p className="text-gray-700 mb-4">
                Media Library is your centralized digital asset management system for storing, organizing, and distributing 
                photos, videos, and documents. It serves **both public and internal purposes** - providing media for your 
                website while managing private staff resources.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-white p-4 rounded-lg border">
                  <h3 className="font-semibold text-gray-900 mb-2">🌐 Public Media</h3>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Website photo galleries</li>
                    <li>• Match action shots for fans</li>
                    <li>• Event photos and videos</li>
                    <li>• Social media content</li>
                    <li>• Team and player photos</li>
                    <li>• Marketing materials</li>
                  </ul>
                </div>
                <div className="bg-white p-4 rounded-lg border">
                  <h3 className="font-semibold text-gray-900 mb-2">🔒 Internal Media</h3>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Training video analysis</li>
                    <li>• Tactical diagrams</li>
                    <li>• Internal documents</li>
                    <li>• Staff resources</li>
                    <li>• Confidential materials</li>
                    <li>• Coach development videos</li>
                  </ul>
                </div>
                <div className="bg-white p-4 rounded-lg border">
                  <h3 className="font-semibold text-gray-900 mb-2">🗂️ Organization</h3>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• 12 category system</li>
                    <li>• Tagging and metadata</li>
                    <li>• Advanced search</li>
                    <li>• Bulk operations</li>
                  </ul>
                </div>
                <div className="bg-white p-4 rounded-lg border">
                  <h3 className="font-semibold text-gray-900 mb-2">⚙️ Management</h3>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Upload multiple files</li>
                    <li>• Automatic optimization</li>
                    <li>• Permission control</li>
                    <li>• Download management</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Images/Videos/All Media Tabs */}
        {(activeTab === 'images' || activeTab === 'videos' || activeTab === 'all') && (
          <div className="space-y-6">
            {/* Filters & Controls */}
            <div className="bg-white rounded-lg shadow-sm border p-4">
              <div className="grid grid-cols-1 md:grid-cols-6 gap-4 mb-4">
                <input
                  type="text"
                  placeholder="Search media..."
                  value={filter.search}
                  onChange={(e) => setFilter(f => ({ ...f, search: e.target.value }))}
                  className="border rounded px-3 py-2"
                />
                {activeTab === 'all' && (
                  <select
                    value={filter.type}
                    onChange={(e) => setFilter(f => ({ ...f, type: e.target.value }))}
                    className="border rounded px-3 py-2"
                  >
                    <option value="all">All Types</option>
                    {mediaTypes.map(type => (
                      <option key={type.id} value={type.id}>{type.icon} {type.name}</option>
                    ))}
                  </select>
                )}
                <select
                  value={filter.category}
                  onChange={(e) => setFilter(f => ({ ...f, category: e.target.value }))}
                  className="border rounded px-3 py-2"
                >
                  <option value="all">All Categories</option>
                  {mediaCategories.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.icon} {cat.name}</option>
                  ))}
                </select>
                <select
                  value={filter.visibility}
                  onChange={(e) => setFilter(f => ({ ...f, visibility: e.target.value }))}
                  className="border rounded px-3 py-2"
                >
                  <option value="all">All Visibility</option>
                  {visibilityOptions.map(vis => (
                    <option key={vis.id} value={vis.id}>{vis.icon} {vis.name}</option>
                  ))}
                </select>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="border rounded px-3 py-2"
                >
                  <option value="date">Sort by Date</option>
                  <option value="name">Sort by Name</option>
                  <option value="size">Sort by Size</option>
                </select>
                <div className="flex gap-2">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`flex-1 px-3 py-2 rounded ${viewMode === 'grid' ? 'bg-blue-600 text-white' : 'bg-gray-100'}`}
                  >
                    <i className="bi bi-grid-3x3"></i>
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`flex-1 px-3 py-2 rounded ${viewMode === 'list' ? 'bg-blue-600 text-white' : 'bg-gray-100'}`}
                  >
                    <i className="bi bi-list"></i>
                  </button>
                </div>
              </div>

              <div className="flex justify-between items-center">
                <p className="text-sm text-gray-600">
                  Showing {filteredMedia.length} of {stats.total} files
                </p>
                <button
                  onClick={() => setFilter({
                    search: '',
                    type: 'all',
                    category: 'all',
                    visibility: 'all',
                    tag: 'all'
                  })}
                  className="text-sm text-blue-600 hover:text-blue-800"
                >
                  Clear Filters
                </button>
              </div>
            </div>

            {/* Media Grid/List */}
            {viewMode === 'grid' ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {filteredMedia.length === 0 ? (
                  <div className="col-span-full bg-white rounded-lg shadow-sm border p-12 text-center">
                    <div className="text-6xl mb-4">📁</div>
                    <p className="text-lg font-semibold mb-2 text-gray-900">No media files found</p>
                    <p className="text-sm text-gray-600 mb-4">Upload your first media file to get started</p>
                    <button
                      onClick={() => setShowUploadModal(true)}
                      className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
                    >
                      Upload Media
                    </button>
                  </div>
                ) : (
                  filteredMedia.map((media) => {
                    const category = mediaCategories.find(c => c.id === media.category);
                    return (
                      <div key={media._id} className="bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow overflow-hidden">
                        {/* Preview */}
                        <div className="relative aspect-video bg-gray-200">
                          {media.type === 'image' ? (
                            <img 
                              src={media.url} 
                              alt={media.title} 
                              className="w-full h-full object-cover cursor-pointer"
                              onClick={() => {
                                setSelectedMedia(media);
                                setShowPreview(true);
                              }}
                            />
                          ) : media.type === 'video' ? (
                            <div className="w-full h-full flex items-center justify-center bg-gray-800">
                              <i className="bi bi-play-circle text-white text-6xl"></i>
                            </div>
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <i className={`bi bi-file-earmark text-6xl text-${category?.color}-500`}></i>
                            </div>
                          )}
                          <div className="absolute top-2 right-2">
                            <span className={`px-2 py-1 text-xs rounded-full ${
                              media.visibility === 'public' ? 'bg-blue-500 text-white' : 'bg-gray-700 text-white'
                            }`}>
                              {visibilityOptions.find(v => v.id === media.visibility)?.icon}
                            </span>
                          </div>
                        </div>

                        {/* Info */}
                        <div className="p-4">
                          <h3 className="font-semibold text-gray-900 text-sm mb-2 truncate">
                            {media.title || media.filename}
                          </h3>
                          <div className="flex items-center justify-between text-xs text-gray-600 mb-2">
                            <span className={`px-2 py-1 rounded-full bg-${category?.color}-100 text-${category?.color}-800`}>
                              {category?.icon} {category?.name}
                            </span>
                            <span>{formatBytes(media.size || 0)}</span>
                          </div>
                          
                          {/* Actions */}
                          <div className="flex gap-1 mt-3">
                            <button
                              onClick={() => {
                                setSelectedMedia(media);
                                setShowPreview(true);
                              }}
                              className="flex-1 bg-blue-50 text-blue-600 px-2 py-1 rounded hover:bg-blue-100 text-xs"
                            >
                              <i className="bi bi-eye"></i> View
                            </button>
                            <button
                              onClick={() => window.open(media.url, '_blank')}
                              className="flex-1 bg-green-50 text-green-600 px-2 py-1 rounded hover:bg-green-100 text-xs"
                            >
                              <i className="bi bi-download"></i>
                            </button>
                            <button
                              onClick={() => deleteMedia(media._id)}
                              className="bg-red-50 text-red-600 px-2 py-1 rounded hover:bg-red-100 text-xs"
                            >
                              <i className="bi bi-trash"></i>
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            ) : (
              // List View
              <div className="bg-white rounded-lg shadow-sm border">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Preview</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Size</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Visibility</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Uploaded</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {filteredMedia.length === 0 ? (
                        <tr>
                          <td colSpan="8" className="px-6 py-12 text-center text-gray-500">
                            No media files found
                          </td>
                        </tr>
                      ) : (
                        filteredMedia.map((media) => {
                          const category = mediaCategories.find(c => c.id === media.category);
                          return (
                            <tr key={media._id} className="hover:bg-gray-50">
                              <td className="px-6 py-4">
                                <div className="w-16 h-16 bg-gray-200 rounded overflow-hidden">
                                  {media.type === 'image' && media.thumbnailUrl && (
                                    <img src={media.thumbnailUrl} alt="" className="w-full h-full object-cover" />
                                  )}
                                  {media.type === 'video' && (
                                    <div className="w-full h-full flex items-center justify-center bg-gray-800">
                                      <i className="bi bi-play-circle text-white text-2xl"></i>
                                    </div>
                                  )}
                                </div>
                              </td>
                              <td className="px-6 py-4 text-sm font-medium text-gray-900">
                                {media.title || media.filename}
                              </td>
                              <td className="px-6 py-4 text-sm text-gray-600">
                                {mediaTypes.find(t => t.id === media.type)?.icon} {media.type}
                              </td>
                              <td className="px-6 py-4">
                                <span className={`px-2 py-1 text-xs rounded-full bg-${category?.color}-100 text-${category?.color}-800`}>
                                  {category?.name}
                                </span>
                              </td>
                              <td className="px-6 py-4 text-sm text-gray-600">
                                {formatBytes(media.size || 0)}
                              </td>
                              <td className="px-6 py-4">
                                <span className={`px-2 py-1 text-xs rounded-full ${
                                  media.visibility === 'public' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'
                                }`}>
                                  {visibilityOptions.find(v => v.id === media.visibility)?.icon} {visibilityOptions.find(v => v.id === media.visibility)?.name}
                                </span>
                              </td>
                              <td className="px-6 py-4 text-sm text-gray-600">
                                {media.uploadedDate ? new Date(media.uploadedDate).toLocaleDateString() : 'N/A'}
                              </td>
                              <td className="px-6 py-4">
                                <div className="flex gap-2">
                                  <button
                                    onClick={() => {
                                      setSelectedMedia(media);
                                      setShowPreview(true);
                                    }}
                                    className="text-blue-600 hover:text-blue-800"
                                    title="View"
                                  >
                                    <i className="bi bi-eye"></i>
                                  </button>
                                  <button
                                    onClick={() => window.open(media.url, '_blank')}
                                    className="text-green-600 hover:text-green-800"
                                    title="Download"
                                  >
                                    <i className="bi bi-download"></i>
                                  </button>
                                  <button
                                    onClick={() => deleteMedia(media._id)}
                                    className="text-red-600 hover:text-red-800"
                                    title="Delete"
                                  >
                                    <i className="bi bi-trash"></i>
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Upload Tab */}
        {activeTab === 'upload' && (
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Upload Media Files</h2>
            
            <div className="space-y-6">
              {/* File Upload Area */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Select Files</label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center hover:border-blue-400 transition-colors">
                  <input
                    type="file"
                    multiple
                    accept="image/*,video/*,.pdf,.doc,.docx"
                    onChange={(e) => setUploadData(prev => ({ ...prev, files: e.target.files }))}
                    className="hidden"
                    id="file-upload"
                  />
                  <label htmlFor="file-upload" className="cursor-pointer">
                    <div className="text-6xl mb-4">📤</div>
                    <p className="text-lg font-semibold text-gray-900 mb-2">Drop files here or click to browse</p>
                    <p className="text-sm text-gray-600">
                      Supports: Images (JPG, PNG, GIF), Videos (MP4, MOV), Documents (PDF, DOC)
                    </p>
                    {uploadData.files && uploadData.files.length > 0 && (
                      <p className="text-sm text-green-600 font-semibold mt-3">
                        ✓ {uploadData.files.length} file(s) selected
                      </p>
                    )}
                  </label>
                </div>
              </div>

              {/* Upload Settings */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                  <select
                    value={uploadData.category}
                    onChange={(e) => setUploadData(prev => ({ ...prev, category: e.target.value }))}
                    className="w-full border rounded-lg px-3 py-2"
                  >
                    {mediaCategories.map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.icon} {cat.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Visibility</label>
                  <select
                    value={uploadData.visibility}
                    onChange={(e) => setUploadData(prev => ({ ...prev, visibility: e.target.value }))}
                    className="w-full border rounded-lg px-3 py-2"
                  >
                    {visibilityOptions.map(vis => (
                      <option key={vis.id} value={vis.id}>{vis.icon} {vis.name}</option>
                    ))}
                  </select>
                  <p className="text-xs text-gray-500 mt-1">
                    {visibilityOptions.find(v => v.id === uploadData.visibility)?.description}
                  </p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description (Optional)</label>
                <textarea
                  rows={3}
                  value={uploadData.description}
                  onChange={(e) => setUploadData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Add a description for these files..."
                  className="w-full border rounded-lg px-3 py-2"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Photo Credit (Optional)</label>
                <input
                  type="text"
                  value={uploadData.credit}
                  onChange={(e) => setUploadData(prev => ({ ...prev, credit: e.target.value }))}
                  placeholder="Photographer/videographer name"
                  className="w-full border rounded-lg px-3 py-2"
                />
              </div>

              <div>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={uploadData.allowDownload}
                    onChange={(e) => setUploadData(prev => ({ ...prev, allowDownload: e.target.checked }))}
                    className="rounded"
                  />
                  <span className="text-sm text-gray-700">Allow public download</span>
                </label>
              </div>

              {uploadProgress > 0 && (
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span>Uploading...</span>
                    <span>{uploadProgress}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full transition-all"
                      style={{ width: `${uploadProgress}%` }}
                    ></div>
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => {
                    setUploadData({
                      files: [],
                      category: 'general',
                      visibility: 'public',
                      tags: [],
                      description: '',
                      credit: '',
                      allowDownload: true
                    });
                    setActiveTab('overview');
                  }}
                  className="bg-gray-100 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-200"
                >
                  Cancel
                </button>
                <button
                  onClick={uploadMedia}
                  disabled={loading || !uploadData.files || uploadData.files.length === 0}
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  {loading ? 'Uploading...' : `Upload ${uploadData.files?.length || 0} File(s)`}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Preview Modal */}
        {showPreview && selectedMedia && (
          <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50 p-4">
            <div className="max-w-6xl w-full">
              <div className="flex justify-between items-start mb-4">
                <div className="text-white">
                  <h2 className="text-2xl font-bold">{selectedMedia.title || selectedMedia.filename}</h2>
                  {selectedMedia.description && (
                    <p className="text-gray-300 mt-1">{selectedMedia.description}</p>
                  )}
                </div>
                <button
                  onClick={() => setShowPreview(false)}
                  className="text-white text-3xl hover:text-gray-300"
                >
                  ×
                </button>
              </div>

              <div className="bg-white rounded-lg p-2">
                {selectedMedia.type === 'image' && (
                  <img 
                    src={selectedMedia.url} 
                    alt={selectedMedia.title} 
                    className="w-full h-auto max-h-[70vh] object-contain"
                  />
                )}
                {selectedMedia.type === 'video' && (
                  <video 
                    src={selectedMedia.url} 
                    controls 
                    className="w-full h-auto max-h-[70vh]"
                  />
                )}
              </div>

              <div className="mt-4 bg-white rounded-lg p-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Category:</span>
                    <span className="ml-2 font-semibold">
                      {mediaCategories.find(c => c.id === selectedMedia.category)?.name}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-600">Size:</span>
                    <span className="ml-2 font-semibold">{formatBytes(selectedMedia.size || 0)}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Visibility:</span>
                    <span className="ml-2 font-semibold">
                      {visibilityOptions.find(v => v.id === selectedMedia.visibility)?.name}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-600">Uploaded:</span>
                    <span className="ml-2 font-semibold">
                      {selectedMedia.uploadedDate ? new Date(selectedMedia.uploadedDate).toLocaleDateString() : 'N/A'}
                    </span>
                  </div>
                </div>
                {selectedMedia.credit && (
                  <div className="mt-3 text-sm">
                    <span className="text-gray-600">Credit:</span>
                    <span className="ml-2 font-semibold">{selectedMedia.credit}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MediaLibraryManager;


import { useState, useEffect, useRef } from "react";
import { useNavigate } from 'react-router-dom';
import { API_BASE_URL } from './config/api';

const API_URL = `${API_BASE_URL}/gallery`;
const SERVER_URL = API_BASE_URL.replace('/api', '');

export default function Gallery() {
  const navigate = useNavigate();
  const [media, setMedia] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [uploading, setUploading] = useState(false);
  const [filter, setFilter] = useState("all"); // all, photos, videos, slides
  const [selectedMedia, setSelectedMedia] = useState(null);
  const fileInputRef = useRef();

  const fetchMedia = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      console.log('Token exists:', !!token);
      console.log('Token value:', token ? token.substring(0, 20) + '...' : 'No token');
      
      if (!token) {
        setError("No authentication token found. Please log in as super admin.");
        return;
      }

      const res = await fetch(API_URL, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      console.log('Response status:', res.status);
      
      if (!res.ok) {
        if (res.status === 401) {
          throw new Error("Unauthorized. Please log in as super admin.");
        } else if (res.status === 403) {
          throw new Error("Access denied. Super admin privileges required.");
        } else {
          throw new Error(`Failed to fetch media: ${res.status}`);
        }
      }
      
      const data = await res.json();
      setMedia(data);
    } catch (err) {
      console.error('Fetch media error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMedia();
  }, [filter]);

  const handleFileUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    console.log('Files selected:', files.length);
    files.forEach((file, index) => {
      console.log(`File ${index + 1}:`, file.name, file.type, file.size);
    });

    setUploading(true);
    setError("");

    const formData = new FormData();
    files.forEach(file => {
      formData.append('media', file);
    });

    try {
      const token = localStorage.getItem('token');
      console.log('Uploading with token:', token ? 'Present' : 'Missing');
      
      const res = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData,
      });

      console.log('Upload response status:', res.status);
      
      if (!res.ok) {
        const errorData = await res.json();
        console.error('Upload error response:', errorData);
        throw new Error(errorData.error || `Upload failed with status ${res.status}`);
      }
      
      const result = await res.json();
      console.log('Upload successful:', result);
      
      await fetchMedia();
      e.target.value = "";
    } catch (err) {
      console.error('Upload error:', err);
      setError(err.message);
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this media item?")) return;
    
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_URL}/${id}`, { 
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (!res.ok) throw new Error("Failed to delete media");
      await fetchMedia();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleToggleVisibility = async (item) => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_URL}/${item._id}`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ visible: !item.visible }),
      });
      if (!res.ok) throw new Error("Failed to update media");
      await fetchMedia();
    } catch (err) {
      setError(err.message);
    }
  };

  const filteredMedia = media.filter(item => {
    if (filter === "all") return true;
    return item.type === filter;
  });

  const getFileType = (filename) => {
    const ext = filename.split('.').pop().toLowerCase();
    if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext)) return 'photos';
    if (['mp4', 'avi', 'mov', 'wmv', 'flv', 'webm', 'm4v', '3gp'].includes(ext)) return 'videos';
    if (['pdf', 'ppt', 'pptx'].includes(ext)) return 'slides';
    return 'other';
  };

  const getMediaPreview = (item) => {
    // Construct full URL for backend files
    const fullUrl = item.url.startsWith('http') ? item.url : `${SERVER_URL}${item.url}`;
    
    if (item.type === 'photos') {
      return (
        <div className="relative w-full h-32">
          <img 
            src={fullUrl} 
            alt={item.title || item.originalName || 'Gallery image'} 
            className="w-full h-32 object-cover rounded"
            onError={(e) => {
              console.error('Image failed to load:', fullUrl);
              e.target.style.display = 'none';
              e.target.nextSibling.style.display = 'flex';
            }}
          />
          <div className="hidden w-full h-32 bg-gray-200 rounded flex items-center justify-center">
            <div className="text-center">
              <svg className="w-8 h-8 mx-auto text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span className="text-xs text-gray-500">Image</span>
            </div>
          </div>
        </div>
      );
    } else if (item.type === 'videos') {
      return (
        <video 
          src={fullUrl} 
          className="w-full h-32 object-cover rounded"
          controls
        />
      );
    } else {
      return (
        <div className="w-full h-32 bg-gray-200 rounded flex items-center justify-center">
          <div className="text-center">
            <svg className="w-8 h-8 mx-auto text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <span className="text-xs text-gray-500">{item.type}</span>
          </div>
        </div>
      );
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === null || bytes === undefined) return 'Unknown';
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const renderMediaItem = (item) => {
    const isVideo = item.type === 'videos';
    const isPhoto = item.type === 'photos';
    const isSlide = item.type === 'slides';
    
    return (
      <div key={item._id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
        <div className="relative">
          {/* Thumbnail */}
          <div className="aspect-video bg-gray-100 flex items-center justify-center">
            {isVideo ? (
              <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                <div className="text-center">
                  <div className="w-16 h-16 bg-purple-500 rounded-full flex items-center justify-center mx-auto mb-2">
                    <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <span className="text-sm text-gray-600">Video</span>
                </div>
              </div>
            ) : isPhoto ? (
              <img
                src={item.url.startsWith('http') ? item.url : `${SERVER_URL}${item.url}`}
                alt="Gallery image"
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDIwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iMjAwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik02MCAxMjBMMTAwIDgwTDE0MCAxMjBIMTYwVjE0MEg0MFYxMjBINjBaIiBmaWxsPSIjOUI5QkEwIi8+CjxjaXJjbGUgY3g9IjEwMCIgY3k9IjEwMCIgcj0iMjAiIGZpbGw9IiM5QjlCQTAiLz4KPC9zdmc+';
                }}
              />
            ) : (
              <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                <div className="text-center">
                  <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-2">
                    <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M4 4a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2H4zm0 2h12v8H4V6z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <span className="text-sm text-gray-600">Document</span>
                </div>
              </div>
            )}
          </div>

          {/* Type badge */}
          <div className="absolute top-2 right-2">
            {isPhoto && (
              <span className="bg-green-500 text-white text-xs px-2 py-1 rounded-full">photos</span>
            )}
            {isVideo && (
              <span className="bg-purple-500 text-white text-xs px-2 py-1 rounded-full">videos</span>
            )}
            {isSlide && (
              <span className="bg-blue-500 text-white text-xs px-2 py-1 rounded-full">slides</span>
            )}
          </div>

          {/* Visibility toggle */}
          <div className="absolute top-2 left-2">
            <button
              onClick={() => handleToggleVisibility(item)}
              className={`text-xs px-2 py-1 rounded-full ${
                item.visible 
                  ? 'bg-green-500 text-white' 
                  : 'bg-gray-500 text-white'
              }`}
            >
              {item.visible ? 'Public' : 'Private'}
            </button>
          </div>
        </div>

        {/* Info - Simplified */}
        <div className="p-4">
          <div className="text-sm text-gray-500 space-y-1">
            <p>{new Date(item.createdAt).toLocaleDateString()}</p>
            <p>{formatFileSize(item.size)}</p>
          </div>
        </div>

        {/* Actions */}
        <div className="px-4 pb-4 space-y-2">
          <button
            onClick={() => setSelectedMedia(item)}
            className="w-full bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 transition-colors text-sm"
          >
            View Details
          </button>
          <button
            onClick={() => handleDelete(item._id)}
            className="w-full bg-red-500 text-white py-2 px-4 rounded hover:bg-red-600 transition-colors text-sm"
          >
            Delete
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-7xl mx-auto p-6 bg-white rounded shadow mt-8">
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
          <h2 className="text-2xl font-bold text-green-900">Gallery Manager</h2>
        </div>
        <div className="flex gap-4">
          <label className="bg-green-700 text-white px-4 py-2 rounded font-bold hover:bg-green-800 transition cursor-pointer">
            {uploading ? "Uploading..." : "Upload Media"}
            <input 
              type="file" 
              multiple 
              accept="image/*,video/*,.pdf,.ppt,.pptx" 
              onChange={handleFileUpload} 
              ref={fileInputRef} 
              className="hidden" 
              disabled={uploading}
            />
          </label>
        </div>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {/* Filter Tabs */}
      <div className="flex gap-2 mb-6">
        <button 
          onClick={() => setFilter("all")}
          className={`px-4 py-2 rounded font-semibold transition ${
            filter === "all" ? "bg-green-700 text-white" : "bg-gray-200 text-gray-700 hover:bg-gray-300"
          }`}
        >
          All Media
        </button>
        <button 
          onClick={() => setFilter("photos")}
          className={`px-4 py-2 rounded font-semibold transition ${
            filter === "photos" ? "bg-green-700 text-white" : "bg-gray-200 text-gray-700 hover:bg-gray-300"
          }`}
        >
          Photos
        </button>
        <button 
          onClick={() => setFilter("videos")}
          className={`px-4 py-2 rounded font-semibold transition ${
            filter === "videos" ? "bg-green-700 text-white" : "bg-gray-200 text-gray-700 hover:bg-gray-300"
          }`}
        >
          Videos
        </button>
        <button 
          onClick={() => setFilter("slides")}
          className={`px-4 py-2 rounded font-semibold transition ${
            filter === "slides" ? "bg-green-700 text-white" : "bg-gray-200 text-gray-700 hover:bg-gray-300"
          }`}
        >
          Slides
        </button>
      </div>

      {/* Media Grid */}
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="loader"></div>
          <span className="ml-3">Loading gallery...</span>
        </div>
      ) : filteredMedia.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <svg className="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <p className="text-lg font-semibold">No media found</p>
          <p className="text-sm">Upload some photos, videos, or slides to get started</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredMedia.map(item => renderMediaItem(item))}
        </div>
      )}

      {/* Modal */}
      {selectedMedia && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <h2 className="text-2xl font-bold text-gray-800">
                  Media Details
                </h2>
                <button
                  onClick={() => setSelectedMedia(null)}
                  className="text-gray-500 hover:text-gray-700 text-2xl"
                >
                  ×
                </button>
              </div>

              {/* Media Display */}
              <div className="mb-6">
                {selectedMedia.type === 'photos' ? (
                  <img
                    src={selectedMedia.url.startsWith('http') ? selectedMedia.url : `${SERVER_URL}${selectedMedia.url}`}
                    alt="Gallery image"
                    className="w-full max-h-96 object-contain rounded-lg"
                    onError={(e) => {
                      e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDIwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iMjAwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik02MCAxMjBMMTAwIDgwTDE0MCAxMjBIMTYwVjE0MEg0MFYxMjBINjBaIiBmaWxsPSIjOUI5QkEwIi8+CjxjaXJjbGUgY3g9IjEwMCIgY3k9IjEwMCIgcj0iMjAiIGZpbGw9IiM5QjlCQTAiLz4KPC9zdmc+';
                    }}
                  />
                ) : selectedMedia.type === 'videos' ? (
                  <video
                    src={selectedMedia.url.startsWith('http') ? selectedMedia.url : `${SERVER_URL}${selectedMedia.url}`}
                    controls
                    className="w-full max-h-96 rounded-lg"
                  />
                ) : (
                  <div className="w-full h-64 bg-gray-100 rounded-lg flex items-center justify-center">
                    <div className="text-center">
                      <svg className="w-16 h-16 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      <p className="text-gray-500">Document Preview</p>
                      <a
                        href={selectedMedia.url.startsWith('http') ? selectedMedia.url : `${SERVER_URL}${selectedMedia.url}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-2 inline-block bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors"
                      >
                        Open File
                      </a>
                    </div>
                  </div>
                )}
              </div>

              {/* Media Info - Technical Details Only */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <h3 className="font-semibold text-gray-800 mb-2">Technical Details</h3>
                  <div className="space-y-1 text-gray-600">
                    <p><span className="font-medium">Type:</span> {selectedMedia.type}</p>
                    <p><span className="font-medium">Size:</span> {formatFileSize(selectedMedia.size)}</p>
                    <p><span className="font-medium">Uploaded:</span> {new Date(selectedMedia.createdAt).toLocaleDateString()}</p>
                    <p><span className="font-medium">Status:</span> 
                      <span className={`ml-2 px-2 py-1 rounded text-xs ${
                        selectedMedia.visible ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                      }`}>
                        {selectedMedia.visible ? 'Public' : 'Private'}
                      </span>
                    </p>
                  </div>
                </div>
                
                {selectedMedia.description && (
                  <div>
                    <h3 className="font-semibold text-gray-800 mb-2">Description</h3>
                    <p className="text-gray-600">{selectedMedia.description}</p>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="mt-6 flex gap-3">
                <button
                  onClick={() => handleToggleVisibility(selectedMedia)}
                  className={`px-4 py-2 rounded text-sm font-medium ${
                    selectedMedia.visible 
                      ? 'bg-gray-500 text-white hover:bg-gray-600' 
                      : 'bg-green-500 text-white hover:bg-green-600'
                  }`}
                >
                  {selectedMedia.visible ? 'Make Private' : 'Make Public'}
                </button>
                <button
                  onClick={() => handleDelete(selectedMedia._id)}
                  className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 text-sm font-medium"
                >
                  Delete Media
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 
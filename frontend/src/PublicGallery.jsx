import { useState, useEffect, useCallback } from "react";

const API_URL = "http://localhost:5000/api/gallery";

export default function PublicGallery() {
  const [media, setMedia] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("all"); // all, photos, videos, slides
  const [selectedMedia, setSelectedMedia] = useState(null);

  // Format file size for display
  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const fetchMedia = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${API_URL}/public?type=${filter}`);
      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(`Failed to fetch gallery: ${res.status} - ${errorText}`);
      }
      const data = await res.json();
      setMedia(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    fetchMedia();
  }, [fetchMedia]);

  const renderMediaItem = (item) => {
    const isVideo = item.type === 'videos';
    const isPhoto = item.type === 'photos';
    const isSlide = item.type === 'slides';
    
    return (
      <div key={item._id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow cursor-pointer" onClick={() => setSelectedMedia(item)}>
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
                src={item.url.startsWith('http') ? item.url : `http://localhost:5000${item.url}`}
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
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-green-900 mb-4">Club Gallery</h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Explore photos, videos, and presentations from our club activities, matches, and events.
        </p>
      </div>

      {/* Filter Tabs */}
      <div className="flex justify-center gap-2 mb-8">
        <button 
          onClick={() => setFilter("all")}
          className={`px-6 py-3 rounded-lg font-semibold transition ${
            filter === "all" ? "bg-green-700 text-white" : "bg-gray-200 text-gray-700 hover:bg-gray-300"
          }`}
        >
          All Media
        </button>
        <button 
          onClick={() => setFilter("photos")}
          className={`px-6 py-3 rounded-lg font-semibold transition ${
            filter === "photos" ? "bg-green-700 text-white" : "bg-gray-200 text-gray-700 hover:bg-gray-300"
          }`}
        >
          Photos
        </button>
        <button 
          onClick={() => setFilter("videos")}
          className={`px-6 py-3 rounded-lg font-semibold transition ${
            filter === "videos" ? "bg-green-700 text-white" : "bg-gray-200 text-gray-700 hover:bg-gray-300"
          }`}
        >
          Videos
        </button>
        <button 
          onClick={() => setFilter("slides")}
          className={`px-6 py-3 rounded-lg font-semibold transition ${
            filter === "slides" ? "bg-green-700 text-white" : "bg-gray-200 text-gray-700 hover:bg-gray-300"
          }`}
        >
          Slides
        </button>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6 text-center">
          {error}
        </div>
      )}

      {/* Media Grid */}
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="loader"></div>
          <span className="ml-3">Loading gallery...</span>
        </div>
      ) : media.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <svg className="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <p className="text-lg font-semibold">No media available</p>
          <p className="text-sm">Check back later for new content</p>
          <p className="text-xs text-gray-400 mt-2">Debug: media.length = {media.length}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {media.map(item => renderMediaItem(item))}
        </div>
      )}

      {/* Modal */}
      {selectedMedia && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <h2 className="text-2xl font-bold text-gray-800">
                  Gallery Media
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
                    src={selectedMedia.url.startsWith('http') ? selectedMedia.url : `http://localhost:5000${selectedMedia.url}`}
                    alt="Gallery image"
                    className="w-full max-h-96 object-contain rounded-lg"
                    onError={(e) => {
                      e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDIwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iMjAwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik02MCAxMjBMMTAwIDgwTDE0MCAxMjBIMTYwVjE0MEg0MFYxMjBINjBaIiBmaWxsPSIjOUI5QkEwIi8+CjxjaXJjbGUgY3g9IjEwMCIgY3k9IjEwMCIgcj0iMjAiIGZpbGw9IiM5QjlCQTAiLz4KPC9zdmc+';
                    }}
                  />
                ) : selectedMedia.type === 'videos' ? (
                  <video
                    src={selectedMedia.url.startsWith('http') ? selectedMedia.url : `http://localhost:5000${selectedMedia.url}`}
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
                        href={selectedMedia.url.startsWith('http') ? selectedMedia.url : `http://localhost:5000${selectedMedia.url}`}
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

              {/* Close button */}
              <div className="text-center">
                <button
                  onClick={() => setSelectedMedia(null)}
                  className="bg-gray-500 text-white px-6 py-2 rounded hover:bg-gray-600 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 
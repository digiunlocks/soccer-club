import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { API_BASE_URL } from './config/api';

const SERVER_URL = API_BASE_URL.replace('/api', '');

export default function FansGallery() {
  const [activeTab, setActiveTab] = useState('gallery');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const [galleryItems, setGalleryItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [minLoadingTime, setMinLoadingTime] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showFlagModal, setShowFlagModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [flagReason, setFlagReason] = useState('');
  const [flagDescription, setFlagDescription] = useState('');
  const [newComment, setNewComment] = useState('');
  const [showCommentModal, setShowCommentModal] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    setIsLoggedIn(!!token);
    
    if (token) {
      // Fetch user info if logged in
      fetch(`${API_BASE_URL}/auth/me`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      .then(res => res.json())
      .then(data => {
        if (data.user) {
          setUser(data.user);
        }
      })
      .catch(err => console.error('Error fetching user:', err));
    }
  }, []);

  useEffect(() => {
    if (activeTab === 'gallery') {
      fetchGalleryItems();
    }
  }, [activeTab]); // Only fetch when tab changes, not category

  // Prevent unnecessary re-renders by memoizing the filtered items
  const filteredGalleryItems = useMemo(() => {
    if (selectedCategory === 'all') {
      return galleryItems;
    }
    return galleryItems.filter(item => item.category === selectedCategory);
  }, [galleryItems, selectedCategory]);

  const fetchGalleryItems = async () => {
    setLoading(true);
    setMinLoadingTime(true);
    
    // Set a minimum loading time to prevent flickering
    const minLoadTime = setTimeout(() => {
      setMinLoadingTime(false);
    }, 500);

    try {
      // Always fetch all items, filter client-side to prevent flickering
      const response = await fetch(`${API_BASE_URL}/gallery/public`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch gallery items');
      }
      
      const data = await response.json();
      setGalleryItems(data);
    } catch (error) {
      console.error('Error fetching gallery items:', error);
    } finally {
      clearTimeout(minLoadTime);
      setLoading(false);
      setMinLoadingTime(false);
    }
  };

  const handleFlagItem = async () => {
    if (!flagReason) {
      alert('Please select a reason for flagging');
      return;
    }

    if (!flagDescription.trim()) {
      alert('Please provide a description for flagging this content');
      return;
    }

    if (flagDescription.trim().length < 10) {
      alert('Description must be at least 10 characters long');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const headers = {
        'Content-Type': 'application/json'
      };
      
      // Add authorization header only if user is logged in
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      // For non-registered users, we'll use a different endpoint or add a guest flag
      const endpoint = token 
        ? `${API_BASE_URL}/gallery/${selectedItem._id}/flag`
        : `${API_BASE_URL}/gallery/${selectedItem._id}/flag-guest`;

      const response = await fetch(endpoint, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          reason: flagReason,
          description: flagDescription,
          isGuest: !token
        })
      });

      if (!response.ok) {
        throw new Error('Failed to flag item');
      }

      const result = await response.json();
      alert(result.message);
      setShowFlagModal(false);
      setFlagReason('');
      setFlagDescription('');
      setSelectedItem(null);
    } catch (error) {
      console.error('Error flagging item:', error);
      alert('Failed to flag item');
    }
  };

  const handleAddComment = async () => {
    if (!newComment.trim()) {
      alert('Please enter a comment');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/gallery/${selectedItem._id}/comments`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          content: newComment
        })
      });

      if (!response.ok) {
        throw new Error('Failed to add comment');
      }

      alert('Comment added successfully');
      setShowCommentModal(false);
      setNewComment('');
      setSelectedItem(null);
      fetchGalleryItems();
    } catch (error) {
      console.error('Error adding comment:', error);
      alert('Failed to add comment');
    }
  };

  const handleLike = async (itemId) => {
    if (!isLoggedIn) {
      alert('Please log in to like items');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/gallery/${itemId}/like`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to like item');
      }

      fetchGalleryItems();
    } catch (error) {
      console.error('Error liking item:', error);
      alert('Failed to like item');
    }
  };

  const sampleGalleryItems = [
    {
      id: 1,
      type: 'game',
      title: 'Championship Victory!',
      description: 'U16 Boys celebrating their state championship win',
      image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&h=600&fit=crop',
      date: '2024-03-15',
      author: 'Coach Smith',
      likes: 24,
      comments: 8
    },
    {
      id: 2,
      type: 'community',
      title: 'Spring Picnic',
      description: 'Amazing day at the annual club picnic with families',
      image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop',
      date: '2024-03-10',
      author: 'Sarah Johnson',
      likes: 18,
      comments: 12
    },
    {
      id: 3,
      type: 'practice',
      title: 'Training Session',
      description: 'U12 girls working on their skills',
      image: 'https://images.unsplash.com/photo-1517466787929-bc90951d0974?w=800&h=600&fit=crop',
      date: '2024-03-08',
      author: 'Coach Patel',
      likes: 15,
      comments: 5
    },
    {
      id: 4,
      type: 'fan',
      title: 'Game Day Spirit',
      description: 'Our amazing fans showing their support!',
      image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&h=600&fit=crop',
      date: '2024-03-05',
      author: 'Mike Wilson',
      likes: 32,
      comments: 15
    }
  ];

  const sampleChatMessages = [
    {
      id: 1,
      user: 'Coach Smith',
      message: 'Great game today everyone! Proud of how the team played.',
      time: '2 hours ago',
      avatar: '👨‍💼'
    },
    {
      id: 2,
      user: 'Sarah Johnson',
      message: 'The picnic was so much fun! Can\'t wait for the next one.',
      time: '1 hour ago',
      avatar: '👩‍👧‍👦'
    },
    {
      id: 3,
      user: 'David Lee',
      message: 'Anyone know when the next practice is?',
      time: '30 min ago',
      avatar: '⚽'
    }
  ];

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-green-900 mb-4">Fans & Gallery</h1>
        <p className="text-lg text-gray-600 max-w-3xl mx-auto">
          Share your memories, connect with the community, and celebrate the beautiful game together. 
          From game day photos to community events, this is where our Seattle Leopards FC family comes together.
        </p>
      </div>

      {/* Tab Navigation */}
      <div className="flex justify-center mb-8">
        <div className="bg-gray-100 rounded-lg p-1 flex">
          <button
            onClick={() => setActiveTab('gallery')}
            className={`px-6 py-2 rounded-md font-medium transition-colors ${
              activeTab === 'gallery'
                ? 'bg-green-600 text-white'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            📸 Gallery
          </button>
          <button
            onClick={() => setActiveTab('community')}
            className={`px-6 py-2 rounded-md font-medium transition-colors ${
              activeTab === 'community'
                ? 'bg-green-600 text-white'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            💬 Community Chat
          </button>
          {isLoggedIn && (
            <button
              onClick={() => setActiveTab('upload')}
              className={`px-6 py-2 rounded-md font-medium transition-colors ${
                activeTab === 'upload'
                  ? 'bg-green-600 text-white'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              📤 Share Photos
            </button>
          )}
        </div>
      </div>

      {/* Gallery Tab */}
      {activeTab === 'gallery' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-green-900">Photo Gallery</h2>
            <div className="flex gap-2">
              <button 
                onClick={() => setSelectedCategory('all')}
                className={`px-4 py-2 rounded transition-colors ${
                  selectedCategory === 'all' 
                    ? 'bg-green-600 text-white' 
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                All Photos
              </button>
              <button 
                onClick={() => setSelectedCategory('game')}
                className={`px-4 py-2 rounded transition-colors ${
                  selectedCategory === 'game' 
                    ? 'bg-green-600 text-white' 
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                Game Day
              </button>
              <button 
                onClick={() => setSelectedCategory('community')}
                className={`px-4 py-2 rounded transition-colors ${
                  selectedCategory === 'community' 
                    ? 'bg-green-600 text-white' 
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                Community
              </button>
            </div>
          </div>

          {loading || minLoadingTime ? (
            <div className="flex justify-center items-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
            </div>
          ) : filteredGalleryItems.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">
                {galleryItems.length === 0 
                  ? "No approved photos found. Check back later!" 
                  : `No ${selectedCategory} photos found. Try another category.`
                }
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredGalleryItems.map((item) => (
                <div key={item._id} className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
                  <div className="relative">
                    <img
                      src={`${SERVER_URL}${item.imageUrl}`}
                      alt={item.title}
                      className="w-full h-48 object-cover"
                      onError={(e) => {
                        e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgdmlld0JveD0iMCAwIDQwMCAzMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSI0MDAiIGhlaWdodD0iMzAwIiBmaWxsPSIjRjNGNEY2Ii8+Cjx0ZXh0IHg9IjIwMCIgeT0iMTUwIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTYiIGZpbGw9IiM5QjlCQTAiIHRleHQtYW5jaG9yPSJtaWRkbGUiPkltYWdlIEVycm9yPC90ZXh0Pgo8L3N2Zz4K';
                      }}
                    />
                    <div className="absolute top-2 right-2 bg-green-600 text-white px-2 py-1 rounded text-xs font-medium">
                      {item.category.toUpperCase()}
                    </div>
                    <button
                      onClick={() => {
                        setSelectedItem(item);
                        setShowFlagModal(true);
                      }}
                      className="absolute top-2 left-2 bg-red-600 text-white px-2 py-1 rounded text-xs font-medium hover:bg-red-700 transition-colors shadow-lg"
                      title="Flag inappropriate content"
                    >
                      ⚠️ Report
                    </button>
                  </div>
                  <div className="p-4">
                    <h3 className="font-bold text-lg text-green-900 mb-2">{item.title}</h3>
                    <p className="text-gray-600 text-sm mb-3">{item.description}</p>
                    <div className="flex justify-between items-center text-sm text-gray-500">
                      <span>By {item.authorName}</span>
                      <span>{new Date(item.createdAt).toLocaleDateString()}</span>
                    </div>
                    <div className="flex justify-between items-center mt-3 pt-3 border-t border-gray-100">
                      <div className="flex items-center gap-4">
                        <button 
                          onClick={() => handleLike(item._id)}
                          className={`flex items-center gap-1 transition-colors ${
                            item.likes?.includes(user?._id) 
                              ? 'text-red-500' 
                              : 'text-gray-500 hover:text-green-600'
                          }`}
                        >
                          <span>❤️</span>
                          <span>{item.likes?.length || 0}</span>
                        </button>
                        <button 
                          onClick={() => {
                            setSelectedItem(item);
                            setShowCommentModal(true);
                          }}
                          className="flex items-center gap-1 text-gray-500 hover:text-green-600 transition-colors"
                        >
                          <span>💬</span>
                          <span>{item.comments?.filter(c => c.status === 'active').length || 0}</span>
                        </button>
                      </div>
                      <button 
                        onClick={() => {
                          setSelectedItem(item);
                          setShowCommentModal(true);
                        }}
                        className="text-green-600 hover:text-green-700 font-medium"
                      >
                        View Details
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Community Chat Tab */}
      {activeTab === 'community' && (
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-lg shadow-lg">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-green-900 mb-2">Community Chat</h2>
              <p className="text-gray-600">Connect with other parents, players, and fans!</p>
              <div className="mt-2 text-sm text-gray-500">
                💡 <strong>Tip:</strong> Click the "⚠️ Flag" button next to any message to report inappropriate content
                {!isLoggedIn && (
                  <span className="block mt-1 text-xs text-gray-400">
                    (Non-registered users can flag content to help keep our community safe)
                  </span>
                )}
              </div>
            </div>

            {!isLoggedIn ? (
              <div className="p-8 text-center">
                <div className="text-6xl mb-4">🔒</div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Join the Conversation</h3>
                <p className="text-gray-600 mb-6">
                  Sign in to participate in the community chat and connect with other Seattle Leopards FC members.
                </p>
                <div className="flex gap-4 justify-center">
                  <Link
                    to="/signin"
                    className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
                  >
                    Sign In
                  </Link>
                  <Link
                    to="/register"
                    className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium"
                  >
                    Register
                  </Link>
                </div>
              </div>
            ) : (
              <div className="h-96 flex flex-col">
                {/* Chat Messages */}
                <div className="flex-1 p-6 overflow-y-auto space-y-4">
                  {sampleChatMessages.map((message) => (
                    <div key={message.id} className="flex items-start gap-3">
                      <div className="text-2xl">{message.avatar}</div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-green-900">{message.user}</span>
                            <span className="text-xs text-gray-500">{message.time}</span>
                          </div>
                          <button
                            onClick={() => {
                              setSelectedItem({ id: message.id, type: 'chat', user: message.user, message: message.message });
                              setShowFlagModal(true);
                            }}
                            className="text-xs text-red-600 hover:text-red-700 font-medium"
                          >
                            ⚠️ Flag
                          </button>
                        </div>
                        <p className="text-gray-700 bg-gray-50 rounded-lg p-3">{message.message}</p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Message Input */}
                <div className="p-4 border-t border-gray-200">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Type your message..."
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                    <button className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
                      Send
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Upload Tab */}
      {activeTab === 'upload' && isLoggedIn && (
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-bold text-green-900 mb-6">Share Your Photos</h2>
            
            <form className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Photo Title
                </label>
                <input
                  type="text"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="Enter a title for your photo"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  rows="3"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="Tell us about this photo..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category
                </label>
                <select className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500">
                  <option value="">Select a category</option>
                  <option value="game">Game Day</option>
                  <option value="practice">Practice</option>
                  <option value="community">Community Event</option>
                  <option value="fan">Fan Photos</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Upload Photo
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  <div className="text-4xl mb-2">📸</div>
                  <p className="text-gray-600 mb-2">Click to upload or drag and drop</p>
                  <p className="text-sm text-gray-500">PNG, JPG, GIF up to 10MB</p>
                  <input type="file" className="hidden" accept="image/*" />
                </div>
              </div>

              <button
                type="submit"
                className="w-full px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
              >
                Share Photo
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Flag Modal */}
      {showFlagModal && selectedItem && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4 text-red-700">
              🚩 Flag Inappropriate Content
              {selectedItem.type === 'chat' && <span className="text-sm text-gray-500 block">(Chat Message)</span>}
            </h3>
            <p className="text-gray-600 mb-4">
              Help us keep the community safe by reporting inappropriate content.
              {!isLoggedIn && (
                <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded text-sm">
                  <strong>Note:</strong> You're reporting as a guest. For better tracking and to prevent abuse, consider registering for an account.
                </div>
              )}
              {selectedItem.type === 'chat' && (
                <div className="mt-2 p-2 bg-gray-50 rounded text-sm">
                  <strong>Chat Message:</strong> "{selectedItem.message}"
                </div>
              )}
              {selectedItem.type === 'comment' && (
                <div className="mt-2 p-2 bg-gray-50 rounded text-sm">
                  <strong>Comment:</strong> "{selectedItem.message}"
                </div>
              )}
            </p>
            
            <form onSubmit={(e) => { e.preventDefault(); handleFlagItem(); }}>
              <div className="mb-4">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  🎯 Flag Reason <span className="text-red-500">*</span>
                </label>
                <select
                  value={flagReason}
                  onChange={(e) => setFlagReason(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                  required
                >
                  <option value="">Select a reason...</option>
                  <option value="inappropriate">Inappropriate Content</option>
                  <option value="spam">Spam</option>
                  <option value="offensive">Offensive</option>
                  <option value="copyright">Copyright Violation</option>
                  <option value="other">Other</option>
                </select>
                {!flagReason && (
                  <p className="text-red-500 text-xs mt-1">Please select a reason</p>
                )}
              </div>

              <div className="mb-4">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  📝 Detailed Description <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={flagDescription}
                  onChange={(e) => setFlagDescription(e.target.value)}
                  placeholder="Please provide specific details about why you're flagging this content..."
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 resize-none"
                  rows="3"
                  required
                />
                <div className="flex justify-between items-center mt-1">
                  <p className="text-xs text-gray-500">
                    Minimum 10 characters required
                  </p>
                  <p className={`text-xs ${flagDescription.length >= 10 ? 'text-green-600' : 'text-red-500'}`}>
                    {flagDescription.length}/10
                  </p>
                </div>
                {flagDescription.length > 0 && flagDescription.length < 10 && (
                  <p className="text-red-500 text-xs mt-1">
                    Description must be at least 10 characters long
                  </p>
                )}
              </div>

              <div className="flex gap-2 justify-end">
                <button
                  type="button"
                  onClick={() => {
                    setShowFlagModal(false);
                    setFlagReason('');
                    setFlagDescription('');
                    setSelectedItem(null);
                  }}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!flagReason || flagDescription.length < 10}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  🚩 Flag Content
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Comment Modal */}
      {showCommentModal && selectedItem && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-lg font-semibold">{selectedItem.title}</h3>
              <button
                onClick={() => {
                  setShowCommentModal(false);
                  setNewComment('');
                  setSelectedItem(null);
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <img
                  src={`${SERVER_URL}${selectedItem.imageUrl}`}
                  alt={selectedItem.title}
                  className="w-full rounded-lg"
                              onError={(e) => {
              e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgdmlld0JveD0iMCAwIDQwMCAzMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSI0MDAiIGhlaWdodD0iMzAwIiBmaWxsPSIjRjNGNEY2Ii8+Cjx0ZXh0IHg9IjIwMCIgeT0iMTUwIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTYiIGZpbGw9IiM5QjlCQTAiIHRleHQtYW5jaG9yPSJtaWRkbGUiPkltYWdlIEVycm9yPC90ZXh0Pgo8L3N2Zz4K';
            }}
                />
              </div>
              
              <div>
                <h4 className="font-semibold mb-2">Details</h4>
                <p className="text-gray-600 mb-2">{selectedItem.description}</p>
                <p className="text-sm text-gray-500">
                  By: {selectedItem.authorName} | Views: {selectedItem.viewCount} | 
                  Likes: {selectedItem.likes?.length || 0}
                </p>
              </div>
            </div>

            {isLoggedIn ? (
              <div className="mb-6">
                <h4 className="font-semibold mb-2">Add a Comment</h4>
                <textarea
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Share your thoughts..."
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 resize-none"
                  rows="3"
                />
                <button
                  onClick={handleAddComment}
                  className="mt-2 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
                >
                  Post Comment
                </button>
              </div>
            ) : (
              <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-yellow-800">
                  Please <Link to="/signin" className="text-green-600 hover:text-green-700 font-medium">sign in</Link> to add comments.
                </p>
              </div>
            )}

            {selectedItem.comments && selectedItem.comments.length > 0 && (
              <div>
                <h4 className="font-semibold mb-2">Comments ({selectedItem.comments.filter(c => c.status === 'active').length})</h4>
                <div className="space-y-3 max-h-60 overflow-y-auto">
                  {selectedItem.comments
                    .filter(comment => comment.status === 'active')
                    .map((comment, index) => (
                      <div key={index} className="bg-gray-50 rounded-lg p-3">
                        <div className="flex justify-between items-start mb-1">
                          <p className="text-sm font-medium text-green-900">{comment.userName}</p>
                          <span className="text-xs text-gray-500">
                            {new Date(comment.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-sm text-gray-700">{comment.content}</p>
                        <button
                          onClick={() => {
                            setSelectedItem({ 
                              id: comment._id || index, 
                              type: 'comment', 
                              user: comment.userName, 
                              message: comment.content,
                              parentItem: selectedItem._id
                            });
                            setShowFlagModal(true);
                          }}
                          className="text-xs text-red-600 hover:text-red-700 mt-1"
                        >
                          ⚠️ Flag Comment
                        </button>
                      </div>
                    ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
} 
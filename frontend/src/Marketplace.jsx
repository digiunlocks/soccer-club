import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  FaSearch, FaFilter, FaMapMarkerAlt, FaTh, FaList, FaHeart, 
  FaShare, FaEye, FaClock, FaTag, FaStar, FaFire, FaArrowUp,
  FaChevronDown, FaChevronUp, FaSort, FaLocationArrow, FaPhone,
  FaEnvelope, FaCheckCircle, FaShieldAlt, FaTruck, FaCreditCard,
  FaGift, FaBell, FaBookmark, FaHistory, FaUser, FaShoppingCart, FaPlus, FaDollarSign, FaBox
} from 'react-icons/fa';
import { API_BASE_URL } from './config/api';

const SERVER_URL = API_BASE_URL.replace('/api', '');

export default function Marketplace() {
  console.log('Marketplace component rendering...');
  const navigate = useNavigate();
  const searchTimeoutRef = useRef(null);
  const isInitialMount = useRef(true);
  
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedCondition, setSelectedCondition] = useState('');
  const [priceRange, setPriceRange] = useState({ min: '', max: '' });
  const [sortBy, setSortBy] = useState('newest');
  const [viewMode, setViewMode] = useState('grid');
  const [showFilters, setShowFilters] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [categories, setCategories] = useState([]);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showMyItems, setShowMyItems] = useState(false);
  const [myItems, setMyItems] = useState([]);
  const [myItemsLoading, setMyItemsLoading] = useState(false);
  const [myItemsStats, setMyItemsStats] = useState({});
  const [savedItems, setSavedItems] = useState([]);
  const [recentSearches, setRecentSearches] = useState([]);
  const [trendingItems, setTrendingItems] = useState([]);
  const [recommendedItems, setRecommendedItems] = useState([]);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [location, setLocation] = useState('');
  const [radius, setRadius] = useState(25);
  const [showSavedSearches, setShowSavedSearches] = useState(false);
  const [savedSearches, setSavedSearches] = useState([]);

  // Initialize only once
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      initializeMarketplace();
    }
  }, []);

  // Debounce search query
  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    
    searchTimeoutRef.current = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 500);
    
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [searchQuery]);

  // Fetch items when filters change (but not on initial mount)
  useEffect(() => {
    if (!isInitialMount.current) {
      fetchItems();
    }
  }, [currentPage, selectedCategory, selectedCondition, priceRange.min, priceRange.max, sortBy, debouncedSearchQuery]);

  // Close filters panel on Escape key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && showFilters) {
        setShowFilters(false);
      }
    };
    
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [showFilters]);

  const initializeMarketplace = async () => {
    console.log('Initializing marketplace...');
    try {
      const token = localStorage.getItem('token');
      setIsLoggedIn(!!token);
      
      await fetchCategories();
      await fetchItems();
      await fetchTrendingItems();
      await fetchRecommendedItems();
      loadSavedData();
      console.log('Marketplace initialization complete');
    } catch (error) {
      console.error('Error initializing marketplace:', error);
    }
  };

  const loadSavedData = () => {
    const saved = localStorage.getItem('savedItems');
    const recent = localStorage.getItem('recentSearches');
    const searches = localStorage.getItem('savedSearches');
    
    if (saved) setSavedItems(JSON.parse(saved));
    if (recent) setRecentSearches(JSON.parse(recent));
    if (searches) setSavedSearches(JSON.parse(searches));
  };

  const saveToRecentSearches = (query) => {
    if (!query.trim()) return;
    
    const updated = [query, ...recentSearches.filter(s => s !== query)].slice(0, 10);
    setRecentSearches(updated);
    localStorage.setItem('recentSearches', JSON.stringify(updated));
  };

  const fetchTrendingItems = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/marketplace/public/trending`);
      if (response.ok) {
        const data = await response.json();
        setTrendingItems(data.items || []);
      }
    } catch (error) {
      console.error('Error fetching trending items:', error);
    }
  };

  const fetchRecommendedItems = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;
      
      const response = await fetch(`${API_BASE_URL}/marketplace/recommended`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setRecommendedItems(data.items || []);
      }
    } catch (error) {
      console.error('Error fetching recommended items:', error);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/marketplace/public/categories`);
      if (response.ok) {
        const data = await response.json();
        setCategories(data.categories || []);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const fetchItems = async () => {
    console.log('Fetching items...');
    setLoading(true);
    
    try {
      const params = new URLSearchParams({
        page: currentPage,
        limit: 24,
        sort: sortBy
      });

      if (selectedCategory) params.append('category', selectedCategory);
      if (selectedCondition) params.append('condition', selectedCondition);
      if (priceRange.min) params.append('minPrice', priceRange.min);
      if (priceRange.max) params.append('maxPrice', priceRange.max);
      if (debouncedSearchQuery) params.append('search', debouncedSearchQuery);

      const url = `${API_BASE_URL}/marketplace/public?${params}`;
      console.log('Fetching from URL:', url);
      
      const response = await fetch(url);
      console.log('Response status:', response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log('Items data:', data);
        setItems(data.items || []);
        setTotalPages(data.pagination?.totalPages || 1);
        setTotalItems(data.pagination?.total || 0);
      } else {
        console.log('Response not ok, setting empty items');
        setItems([]);
        setTotalPages(1);
        setTotalItems(0);
      }
    } catch (error) {
      console.error('Error fetching items:', error);
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  const handleItemClick = (itemId) => {
    navigate(`/marketplace/item/${itemId}`);
  };

  const toggleSavedItem = (itemId) => {
    const updated = savedItems.includes(itemId) 
      ? savedItems.filter(id => id !== itemId)
      : [...savedItems, itemId];
    
    setSavedItems(updated);
    localStorage.setItem('savedItems', JSON.stringify(updated));
  };

  const saveSearch = () => {
    const searchData = {
      id: Date.now(),
      query: searchQuery,
      category: selectedCategory,
      condition: selectedCondition,
      priceRange,
      location,
      radius,
      createdAt: new Date().toISOString()
    };
    
    const updated = [searchData, ...savedSearches].slice(0, 20);
    setSavedSearches(updated);
    localStorage.setItem('savedSearches', JSON.stringify(updated));
  };

  const loadSavedSearch = (search) => {
    setSearchQuery(search.query);
    setSelectedCategory(search.category);
    setSelectedCondition(search.condition);
    setPriceRange(search.priceRange);
    setLocation(search.location);
    setRadius(search.radius);
    setCurrentPage(1);
  };

  const handleSearch = () => {
    saveToRecentSearches(searchQuery);
    setCurrentPage(1);
    fetchItems();
  };

  const fetchMyItems = async () => {
    try {
      setMyItemsLoading(true);
      const token = localStorage.getItem('token');
      if (!token) {
        setMyItems([]);
        return;
      }

      const response = await fetch(`${API_BASE_URL}/marketplace/my-items`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        console.log('📦 My Items API Response:', data);
        setMyItems(data.items || []);
      } else {
        const errorData = await response.json();
        console.error('❌ My Items API Error:', errorData);
        setMyItems([]);
      }
    } catch (error) {
      console.error('Error fetching my items:', error);
      setMyItems([]);
    } finally {
      setMyItemsLoading(false);
    }
  };

  const fetchMyItemsStats = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await fetch(`${API_BASE_URL}/marketplace/my-items/stats`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        console.log('📊 My Items Stats Response:', data);
        setMyItemsStats(data);
      } else {
        const errorData = await response.json();
        console.error('❌ My Items Stats Error:', errorData);
      }
    } catch (error) {
      console.error('Error fetching my items stats:', error);
    }
  };

  const toggleMyItems = () => {
    if (!showMyItems) {
      fetchMyItems();
      fetchMyItemsStats();
    }
    setShowMyItems(!showMyItems);
  };

  const clearFilters = () => {
    setSelectedCategory('');
    setSelectedCondition('');
    setPriceRange({ min: '', max: '' });
    setSearchQuery('');
    setCurrentPage(1);
    setShowFilters(false);
  };

  const getConditionColor = (condition) => {
    const colors = {
      'new': 'bg-green-100 text-green-800',
      'like-new': 'bg-blue-100 text-blue-800',
      'excellent': 'bg-emerald-100 text-emerald-800',
      'good': 'bg-yellow-100 text-yellow-800',
      'fair': 'bg-orange-100 text-orange-800',
      'poor': 'bg-red-100 text-red-800'
    };
    return colors[condition] || 'bg-gray-100 text-gray-800';
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(price || 0);
  };

  const formatDate = (date) => {
    const now = new Date();
    const itemDate = new Date(date || now);
    const diffTime = Math.abs(now - itemDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return 'Today';
    if (diffDays === 2) return 'Yesterday';
    if (diffDays <= 7) return `${diffDays - 1} days ago`;
    return itemDate.toLocaleDateString();
  };

  const renderItemCard = (item, isCompact = false) => (
    <div
      key={item._id}
      className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
      onClick={() => handleItemClick(item._id)}
    >
      <div className="relative aspect-square bg-gray-100 overflow-hidden">
        <img
          src={item.images && item.images[0] ? 
            (item.images[0].startsWith('http') ? 
              item.images[0] : 
              `${SERVER_URL}${item.images[0]}`) : 
            'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjMwMCIgdmlld0JveD0iMCAwIDMwMCAzMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIzMDAiIGhlaWdodD0iMzAwIiBmaWxsPSIjRjNGNEY2Ii8+Cjx0ZXh0IHg9IjE1MCIgeT0iMTUwIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTQiIGZpbGw9IiM5QjlCQjAwIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj5JbWFnZSBOb3QgQXZhaWxhYmxlPC90ZXh0Pgo8L3N2Zz4K'}
          alt={item.title || 'Item image'}
          className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
          onError={(e) => {
            e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjMwMCIgdmlld0JveD0iMCAwIDMwMCAzMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIzMDAiIGhlaWdodD0iMzAwIiBmaWxsPSIjRjNGNEY2Ii8+Cjx0ZXh0IHg9IjE1MCIgeT0iMTUwIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTQiIGZpbGw9IiM5QjlCQjAwIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj5JbWFnZSBOb3QgQXZhaWxhYmxlPC90ZXh0Pgo8L3N2Zz4K';
          }}
        />

        {/* Promoted Badge */}
        {item.isPromoted && (
          <div className="absolute top-2 left-2 bg-gray-800 text-white text-xs font-semibold px-2 py-1 rounded-full">
            Promoted
          </div>
        )}

        {/* Shipping Icon */}
        {item.shipping && (
          <div className="absolute bottom-2 left-2 bg-white rounded-full p-1 shadow-md">
            <FaTruck className="w-3 h-3 text-blue-600" />
          </div>
        )}
      </div>

      <div className="p-3 flex flex-col">
        <h3 className="font-semibold text-gray-800 text-sm leading-tight line-clamp-2 mb-1">
          {item.title || 'Untitled Item'}
        </h3>
        <p className="text-gray-900 font-bold text-base mb-1">
          {item.price === 0 ? 'FREE' : formatPrice(item.price)}
        </p>
        <div className="flex items-center text-xs text-gray-500 mt-auto">
          <FaMapMarkerAlt className="w-3 h-3 text-gray-400 mr-1" />
          <span>{item.location || 'Unknown'}</span>
        </div>
      </div>
    </div>
  );

  if (loading && items.length === 0) {
    console.log('Marketplace loading state...');
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading marketplace...</p>
        </div>
      </div>
    );
  }

  console.log('Marketplace rendering main content...', { items: items.length, loading, showMyItems });

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Modern Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <FaShoppingCart className="text-blue-600" />
                Marketplace
              </h1>
            </div>
            
            <div className="flex items-center gap-3">
              <Link 
                to="/account?tab=marketplace"
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors font-semibold flex items-center gap-2"
              >
                <FaUser className="w-4 h-4" />
                My Dashboard
              </Link>
              <button 
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors font-semibold flex items-center gap-2"
                onClick={() => {
                  const token = localStorage.getItem('token');
                  if (!token) {
                    alert('Please log in to post items');
                    navigate('/signin');
                  } else {
                    navigate('/marketplace/post');
                  }
                }}
              >
                <FaPlus className="w-4 h-4" />
                Post Item
              </button>
            </div>
          </div>
          
          {/* Unified Search Bar with Integrated Filters */}
          <div className="relative">
            <div className="flex items-center gap-2">
              {/* Main Search Input */}
              <div className="flex-1 relative">
                <input
                  type="text"
                  placeholder="Search for items, brands, or categories..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  className="w-full px-4 py-3 pl-12 pr-4 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    ×
                  </button>
                )}
              </div>

              {/* Refine Search Button */}
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`px-4 py-3 rounded-xl transition-colors font-medium flex items-center gap-2 ${
                  showFilters 
                    ? 'bg-blue-600 text-white hover:bg-blue-700' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <FaFilter className="w-4 h-4" />
                Refine
                {(selectedCategory || selectedCondition || priceRange.min || priceRange.max) && (
                  <span className="ml-1 bg-white text-blue-600 rounded-full px-2 py-0.5 text-xs font-bold">
                    {[selectedCategory, selectedCondition, priceRange.min, priceRange.max].filter(Boolean).length}
                  </span>
                )}
              </button>
            </div>

            {/* Recent Searches Dropdown */}
            {recentSearches.length > 0 && searchQuery && !showFilters && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
                <div className="p-2">
                  <div className="text-xs text-gray-500 mb-2 px-2">Recent searches</div>
                  {recentSearches.slice(0, 5).map((search, index) => (
                    <button
                      key={index}
                      onClick={() => {
                        setSearchQuery(search);
                        handleSearch();
                      }}
                      className="w-full text-left px-2 py-2 hover:bg-gray-50 rounded text-sm"
                    >
                      {search}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Advanced Filters Panel */}
            {showFilters && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-xl shadow-xl z-50 p-4">
                <div className="mb-3">
                  <h3 className="text-sm font-semibold text-gray-900 mb-3">Refine Your Search</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Category */}
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">Category</label>
                      <select
                        value={selectedCategory}
                        onChange={(e) => setSelectedCategory(e.target.value)}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">All Categories</option>
                        {categories.map(category => (
                          <option key={category} value={category}>{category}</option>
                        ))}
                      </select>
                    </div>

                    {/* Condition */}
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">Condition</label>
                      <select
                        value={selectedCondition}
                        onChange={(e) => setSelectedCondition(e.target.value)}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">All Conditions</option>
                        <option value="new">New</option>
                        <option value="like-new">Like New</option>
                        <option value="excellent">Excellent</option>
                        <option value="good">Good</option>
                        <option value="fair">Fair</option>
                        <option value="poor">Poor</option>
                      </select>
                    </div>

                    {/* Price Range */}
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">Price Range</label>
                      <div className="flex gap-2">
                        <input
                          type="number"
                          placeholder="Min"
                          value={priceRange.min}
                          onChange={(e) => setPriceRange({ ...priceRange, min: e.target.value })}
                          className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <input
                          type="number"
                          placeholder="Max"
                          value={priceRange.max}
                          onChange={(e) => setPriceRange({ ...priceRange, max: e.target.value })}
                          className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-between pt-3 border-t border-gray-200">
                  <button
                    onClick={clearFilters}
                    className="text-sm text-gray-600 hover:text-gray-900 font-medium"
                  >
                    Clear All
                  </button>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setShowFilters(false)}
                      className="px-4 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => {
                        handleSearch();
                        setShowFilters(false);
                      }}
                      className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                    >
                      Apply Filters
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Active Filters Chips */}
          {(selectedCategory || selectedCondition || priceRange.min || priceRange.max || searchQuery) && (
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <span className="text-xs text-gray-600 font-medium">Active filters:</span>
              
              {searchQuery && (
                <div className="inline-flex items-center gap-1 bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-xs font-medium">
                  <FaSearch className="w-3 h-3" />
                  "{searchQuery}"
                  <button
                    onClick={() => setSearchQuery('')}
                    className="ml-1 hover:text-blue-900"
                  >
                    ×
                  </button>
                </div>
              )}
              
              {selectedCategory && (
                <div className="inline-flex items-center gap-1 bg-green-100 text-green-800 px-3 py-1 rounded-full text-xs font-medium">
                  <FaTag className="w-3 h-3" />
                  {selectedCategory}
                  <button
                    onClick={() => setSelectedCategory('')}
                    className="ml-1 hover:text-green-900"
                  >
                    ×
                  </button>
                </div>
              )}
              
              {selectedCondition && (
                <div className="inline-flex items-center gap-1 bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-xs font-medium">
                  <FaCheckCircle className="w-3 h-3" />
                  {selectedCondition}
                  <button
                    onClick={() => setSelectedCondition('')}
                    className="ml-1 hover:text-purple-900"
                  >
                    ×
                  </button>
                </div>
              )}
              
              {(priceRange.min || priceRange.max) && (
                <div className="inline-flex items-center gap-1 bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-xs font-medium">
                  <FaCreditCard className="w-3 h-3" />
                  {priceRange.min && priceRange.max 
                    ? `$${priceRange.min} - $${priceRange.max}`
                    : priceRange.min 
                    ? `From $${priceRange.min}`
                    : `Up to $${priceRange.max}`
                  }
                  <button
                    onClick={() => setPriceRange({ min: '', max: '' })}
                    className="ml-1 hover:text-yellow-900"
                  >
                    ×
                  </button>
                </div>
              )}
              
              <button
                onClick={clearFilters}
                className="text-xs text-gray-600 hover:text-gray-900 font-medium underline"
              >
                Clear all
              </button>
            </div>
          )}

        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Toolbar */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-gray-900">
                {totalItems} {totalItems === 1 ? 'item' : 'items'}
              </span>
              {(selectedCategory || selectedCondition || priceRange.min || priceRange.max || searchQuery) && (
                <span className="text-sm text-gray-500">
                  • Filtered
                </span>
              )}
            </div>

            <div className="flex items-center gap-4">
              {/* View Mode Toggle */}
              <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded transition-colors ${viewMode === 'grid' ? 'bg-white shadow-sm text-blue-600' : 'text-gray-600 hover:text-gray-900'}`}
                  title="Grid View"
                >
                  <FaTh className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded transition-colors ${viewMode === 'list' ? 'bg-white shadow-sm text-blue-600' : 'text-gray-600 hover:text-gray-900'}`}
                  title="List View"
                >
                  <FaList className="w-4 h-4" />
                </button>
              </div>

              {/* Sort */}
              <div className="flex items-center gap-2">
                <FaSort className="w-4 h-4 text-gray-400" />
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                >
                  <option value="newest">Newest First</option>
                  <option value="oldest">Oldest First</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                  <option value="popular">Most Popular</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Trending Items Section */}
        {!showMyItems && trendingItems.length > 0 && (
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <FaFire className="text-orange-500" />
                Trending Now
              </h2>
              <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                View All
              </button>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
              {trendingItems.slice(0, 8).map(item => renderItemCard(item, true))}
            </div>
          </div>
        )}

        {/* Recommended Items Section */}
        {!showMyItems && recommendedItems.length > 0 && isLoggedIn && (
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <FaStar className="text-yellow-500" />
                Recommended for You
              </h2>
              <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                View All
              </button>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
              {recommendedItems.slice(0, 8).map(item => renderItemCard(item, true))}
            </div>
          </div>
        )}

        {/* Enhanced Items Grid */}
        {showMyItems ? (
          // Show user's items
          myItemsLoading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
              {[...Array(12)].map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                    {/* Image skeleton */}
                    <div className="w-full aspect-square bg-gray-200"></div>
                    {/* Content skeleton */}
                    <div className="p-3 flex flex-col">
                      <div className="h-4 bg-gray-200 rounded mb-1"></div>
                      <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                      <div className="h-5 bg-gray-200 rounded w-1/3 mb-2"></div>
                      <div className="h-3 bg-gray-200 rounded w-20"></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : myItems && myItems.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
              {myItems.filter(item => item && item._id).map(renderItemCard)}
            </div>
          ) : (
            <div className="text-center py-16">
              <div className="max-w-md mx-auto">
                <div className="text-6xl mb-6">📦</div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3">No items found</h3>
                <p className="text-gray-600 mb-8 text-lg">
                  You haven't posted any items yet. Use the 'Post Item' button above to get started!
                </p>
              </div>
            </div>
          )
        ) : (
          // Show all marketplace items
          loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
              {[...Array(12)].map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                    {/* Image skeleton */}
                    <div className="w-full aspect-square bg-gray-200"></div>
                    {/* Content skeleton */}
                    <div className="p-3 flex flex-col">
                      <div className="h-4 bg-gray-200 rounded mb-1"></div>
                      <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                      <div className="h-5 bg-gray-200 rounded w-1/3 mb-2"></div>
                      <div className="h-3 bg-gray-200 rounded w-20"></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : items && items.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
              {items.filter(item => item && item._id).map(renderItemCard)}
            </div>
          ) : (
            <div className="text-center py-16">
              <div className="max-w-md mx-auto">
                <div className="text-6xl mb-6">🛒</div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3">No items found</h3>
                <p className="text-gray-600 mb-8 text-lg">
                  {searchQuery || selectedCategory || selectedCondition || priceRange.min || priceRange.max 
                    ? "Try adjusting your search or filters to find what you're looking for."
                    : "Be the first to list an item in our marketplace!"
                  }
                </p>
                {(searchQuery || selectedCategory || selectedCondition || priceRange.min || priceRange.max) && (
                  <button
                    onClick={clearFilters}
                    className="bg-gray-600 text-white px-6 py-3 rounded-lg hover:bg-gray-700 transition-colors font-semibold"
                  >
                    Clear Filters
                  </button>
                )}
              </div>
            </div>
          )
        )}

        {/* Enhanced Pagination */}
        {totalPages > 1 && (
          <div className="mt-8 flex items-center justify-center">
            <nav className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage(currentPage - 1)}
                disabled={currentPage === 1}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                Previous
              </button>
              
              {[...Array(totalPages)].map((_, i) => {
                const page = i + 1;
                if (page === 1 || page === totalPages || (page >= currentPage - 2 && page <= currentPage + 2)) {
                  return (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`px-3 py-2 border rounded-lg text-sm ${
                        page === currentPage
                          ? 'bg-green-600 text-white border-green-600'
                          : 'border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      {page}
                    </button>
                  );
                } else if (page === currentPage - 3 || page === currentPage + 3) {
                  return <span key={page} className="px-2 text-gray-500">...</span>;
                }
                return null;
              })}
              
              <button
                onClick={() => setCurrentPage(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                Next
              </button>
            </nav>
          </div>
        )}
      </div>
    </div>
  );
}
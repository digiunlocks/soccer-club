import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { FaEdit, FaTrash, FaCheck, FaTimes, FaEye, FaHeart, FaDollarSign } from 'react-icons/fa';
import { API_BASE_URL } from './config/api';

const SERVER_URL = API_BASE_URL.replace('/api', '');

const MyMarketplaceItems = () => {
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({});
  const [activeTab, setActiveTab] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showSoldModal, setShowSoldModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [soldPrice, setSoldPrice] = useState('');
  const [showAllItems, setShowAllItems] = useState(false);
  const [allItems, setAllItems] = useState([]);
  const [allItemsLoading, setAllItemsLoading] = useState(false);

  useEffect(() => {
    fetchItems();
    fetchStats();
  }, [activeTab, currentPage]);

  const fetchItems = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/signin');
        return;
      }

      const status = activeTab === 'all' ? '' : activeTab;
      const response = await fetch(`${API_BASE_URL}/marketplace/my-items?status=${status}&page=${currentPage}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        console.log('📦 My Items API Response:', data);
        setItems(data.items || []);
        setTotalPages(data.pagination?.totalPages || 1);
      } else {
        const errorData = await response.json();
        console.error('❌ My Items API Error:', errorData);
        toast.error('Failed to fetch your items');
      }
    } catch (error) {
      console.error('Error fetching items:', error);
      toast.error('Failed to fetch your items');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/marketplace/my-items/stats`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        console.log('📊 My Items Stats Response:', data);
        setStats(data);
      } else {
        const errorData = await response.json();
        console.error('❌ My Items Stats Error:', errorData);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const fetchAllItems = async () => {
    try {
      setAllItemsLoading(true);
      const response = await fetch(`${API_BASE_URL}/marketplace/public?page=1&limit=12`);
      
      if (response.ok) {
        const data = await response.json();
        console.log('🛒 All Items API Response:', data);
        setAllItems(data.items || []);
      } else {
        console.error('❌ All Items API Error:', response.status);
        setAllItems([]);
      }
    } catch (error) {
      console.error('Error fetching all items:', error);
      setAllItems([]);
    } finally {
      setAllItemsLoading(false);
    }
  };

  const toggleView = () => {
    if (!showAllItems) {
      fetchAllItems();
    }
    setShowAllItems(!showAllItems);
  };

  const handleDeleteItem = async () => {
    if (!selectedItem) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/marketplace/my-items/${selectedItem._id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        toast.success('Item deleted successfully');
        setShowDeleteModal(false);
        setSelectedItem(null);
        fetchItems();
        fetchStats();
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to delete item');
      }
    } catch (error) {
      console.error('Error deleting item:', error);
      toast.error('Failed to delete item');
    }
  };

  const handleMarkAsSold = async () => {
    if (!selectedItem) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/marketplace/my-items/${selectedItem._id}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          status: 'sold',
          soldPrice: soldPrice ? parseFloat(soldPrice) : selectedItem.price
        })
      });

      if (response.ok) {
        toast.success('Item marked as sold successfully');
        setShowSoldModal(false);
        setSelectedItem(null);
        setSoldPrice('');
        fetchItems();
        fetchStats();
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to mark item as sold');
      }
    } catch (error) {
      console.error('Error marking item as sold:', error);
      toast.error('Failed to mark item as sold');
    }
  };

  const handleStatusChange = async (item, newStatus) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/marketplace/my-items/${item._id}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus })
      });

      if (response.ok) {
        toast.success(`Item status updated to ${newStatus}`);
        fetchItems();
        fetchStats();
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to update item status');
      }
    } catch (error) {
      console.error('Error updating item status:', error);
      toast.error('Failed to update item status');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'approved': return 'bg-green-100 text-green-800';
      case 'sold': return 'bg-blue-100 text-blue-800';
      case 'expired': return 'bg-gray-100 text-gray-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending': return '⏳';
      case 'approved': return '✅';
      case 'sold': return '💰';
      case 'expired': return '⏰';
      case 'rejected': return '❌';
      default: return '❓';
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(price || 0);
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your items...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {showAllItems ? 'Marketplace' : 'My Marketplace'}
            </h1>
            <p className="text-gray-600">
              {showAllItems ? 'Browse all marketplace items' : 'Manage your marketplace listings'}
            </p>
          </div>
          <div className="flex space-x-3">
            <button
              onClick={toggleView}
              className={`px-4 py-2 rounded-lg transition-colors font-semibold ${
                showAllItems 
                  ? 'bg-blue-700 text-white' 
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
            >
              {showAllItems ? 'My Items' : 'All Items'}
            </button>
            <Link
              to="/marketplace/post"
              className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors font-semibold"
            >
              Post New Item
            </Link>
          </div>
        </div>
      </div>

      {/* Stats Cards - Only show when viewing user's items */}
      {!showAllItems && (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-8">
          <div className="bg-white p-4 rounded-lg shadow-sm border">
            <div className="text-2xl font-bold text-gray-900">{stats.totalItems || 0}</div>
            <div className="text-sm text-gray-600">Total Items</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm border">
            <div className="text-2xl font-bold text-yellow-600">{stats.pendingItems || 0}</div>
            <div className="text-sm text-gray-600">Pending</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm border">
            <div className="text-2xl font-bold text-green-600">{stats.approvedItems || 0}</div>
            <div className="text-sm text-gray-600">Active</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm border">
            <div className="text-2xl font-bold text-blue-600">{stats.soldItems || 0}</div>
            <div className="text-sm text-gray-600">Sold</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm border">
            <div className="text-2xl font-bold text-gray-600">{stats.totalViews || 0}</div>
            <div className="text-sm text-gray-600">Total Views</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm border">
            <div className="text-2xl font-bold text-green-600">{formatPrice(stats.totalRevenue || 0)}</div>
            <div className="text-sm text-gray-600">Revenue</div>
          </div>
        </div>
      )}

      {/* Tab Navigation - Only show when viewing user's items */}
      {!showAllItems && (
        <div className="flex space-x-1 mb-6 bg-gray-100 p-1 rounded-lg">
          <button
            onClick={() => setActiveTab('all')}
            className={`flex-1 py-2 px-4 rounded-md font-medium transition-colors ${
              activeTab === 'all'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            All ({stats.totalItems || 0})
          </button>
          <button
            onClick={() => setActiveTab('pending')}
            className={`flex-1 py-2 px-4 rounded-md font-medium transition-colors ${
              activeTab === 'pending'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            Pending ({stats.pendingItems || 0})
          </button>
          <button
            onClick={() => setActiveTab('approved')}
            className={`flex-1 py-2 px-4 rounded-md font-medium transition-colors ${
              activeTab === 'approved'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            Active ({stats.approvedItems || 0})
          </button>
          <button
            onClick={() => setActiveTab('sold')}
            className={`flex-1 py-2 px-4 rounded-md font-medium transition-colors ${
              activeTab === 'sold'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            Sold ({stats.soldItems || 0})
          </button>
        </div>
      )}

      {/* Items Grid */}
      {showAllItems ? (
        // Show all marketplace items
        allItemsLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white rounded-lg shadow-sm border overflow-hidden animate-pulse">
                <div className="h-48 bg-gray-200"></div>
                <div className="p-4">
                  <div className="h-4 bg-gray-200 rounded mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-2/3 mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                </div>
              </div>
            ))}
          </div>
        ) : allItems.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">🛒</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No items found</h3>
            <p className="text-gray-600 mb-8">No marketplace items are available at the moment.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {allItems.map((item) => (
              <div key={item._id} className="bg-white rounded-lg shadow-sm border overflow-hidden">
                {/* Image */}
                <div className="relative h-48 bg-gray-200">
                  {item.images && item.images.length > 0 ? (
                    <img
                      src={`${SERVER_URL}/${item.images[0]}`}
                      alt={item.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                      <span className="text-4xl">📦</span>
                    </div>
                  )}
                </div>
                
                {/* Content */}
                <div className="p-4">
                  <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">{item.title}</h3>
                  <p className="text-gray-600 text-sm mb-3 line-clamp-2">{item.description}</p>
                  
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-lg font-bold text-green-600">{formatPrice(item.price)}</span>
                    <span className="text-sm text-gray-500">{item.category}</span>
                  </div>
                  
                  <div className="flex items-center justify-between text-sm text-gray-500 mb-3">
                    <span>By {item.seller?.name || 'Unknown'}</span>
                    <span>{formatDate(item.createdAt)}</span>
                  </div>
                  
                  <Link
                    to={`/marketplace/item/${item._id}`}
                    className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors text-center block"
                  >
                    View Details
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )
      ) : items.length === 0 ? (
        <div className="text-center py-16">
          <div className="text-6xl mb-4">📦</div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No items found</h3>
          <p className="text-gray-600 mb-8">
            {activeTab === 'all' 
              ? "You haven't posted any items yet. Use the 'Post New Item' button above to get started!"
              : `You don't have any ${activeTab} items.`
            }
          </p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {items.map((item) => (
              <div key={item._id} className="bg-white rounded-lg shadow-sm border overflow-hidden">
                {/* Image */}
                <div className="relative h-48 bg-gray-200">
                  {item.images && item.images[0] ? (
                    <img
                      src={item.images[0].startsWith('http') ? 
                        item.images[0] : 
                        `${SERVER_URL}${item.images[0]}`}
                      alt={item.title}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.src = '/placeholder-item.jpg';
                      }}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                      <span className="text-4xl">📦</span>
                    </div>
                  )}
                  
                  {/* Status Badge */}
                  <div className="absolute top-2 left-2">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(item.status)}`}>
                      {getStatusIcon(item.status)} {item.status}
                    </span>
                  </div>
                </div>

                {/* Content */}
                <div className="p-4">
                  <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">{item.title}</h3>
                  <p className="text-sm text-gray-600 mb-2 line-clamp-2">{item.description}</p>
                  
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-lg font-bold text-green-600">{formatPrice(item.price)}</span>
                    <div className="flex items-center space-x-2 text-sm text-gray-500">
                      <span className="flex items-center">
                        <FaEye className="mr-1" />
                        {item.views || 0}
                      </span>
                      <span className="flex items-center">
                        <FaHeart className="mr-1" />
                        {item.favorites?.length || 0}
                      </span>
                    </div>
                  </div>

                  <div className="text-xs text-gray-500 mb-4">
                    Posted: {formatDate(item.createdAt)}
                    {item.soldAt && (
                      <span className="block">Sold: {formatDate(item.soldAt)}</span>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex space-x-2">
                    <Link
                      to={`/marketplace/item/${item._id}`}
                      className="flex-1 bg-blue-600 text-white py-2 px-3 rounded text-sm hover:bg-blue-700 transition-colors text-center"
                    >
                      View
                    </Link>
                    
                    {item.status === 'approved' && (
                      <button
                        onClick={() => {
                          setSelectedItem(item);
                          setSoldPrice(item.price.toString());
                          setShowSoldModal(true);
                        }}
                        className="bg-green-600 text-white py-2 px-3 rounded text-sm hover:bg-green-700 transition-colors"
                        title="Mark as Sold"
                      >
                        <FaCheck />
                      </button>
                    )}
                    
                    <button
                      onClick={() => {
                        setSelectedItem(item);
                        setShowDeleteModal(true);
                      }}
                      className="bg-red-600 text-white py-2 px-3 rounded text-sm hover:bg-red-700 transition-colors"
                      title="Delete Item"
                    >
                      <FaTrash />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
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
        </>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && selectedItem && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Delete Item</h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete "{selectedItem.title}"? This action cannot be undone.
            </p>
            <div className="flex space-x-3">
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setSelectedItem(null);
                }}
                className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded hover:bg-gray-400 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteItem}
                className="flex-1 bg-red-600 text-white py-2 px-4 rounded hover:bg-red-700 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Mark as Sold Modal */}
      {showSoldModal && selectedItem && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Mark as Sold</h3>
            <p className="text-gray-600 mb-4">
              Mark "{selectedItem.title}" as sold?
            </p>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Sold Price (optional)
              </label>
              <input
                type="number"
                value={soldPrice}
                onChange={(e) => setSoldPrice(e.target.value)}
                placeholder={`Default: ${formatPrice(selectedItem.price)}`}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>
            
            <div className="flex space-x-3">
              <button
                onClick={() => {
                  setShowSoldModal(false);
                  setSelectedItem(null);
                  setSoldPrice('');
                }}
                className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded hover:bg-gray-400 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleMarkAsSold}
                className="flex-1 bg-green-600 text-white py-2 px-4 rounded hover:bg-green-700 transition-colors"
              >
                Mark as Sold
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyMarketplaceItems;

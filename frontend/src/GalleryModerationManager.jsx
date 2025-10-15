import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';

export default function GalleryModerationManager() {
  const [activeTab, setActiveTab] = useState('pending');
  const [pendingItems, setPendingItems] = useState([]);
  const [flaggedItems, setFlaggedItems] = useState([]);
  const [allItems, setAllItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      let endpoint = '';
      
      switch (activeTab) {
        case 'pending':
          endpoint = '/api/gallery/admin/pending';
          break;
        case 'flagged':
          endpoint = '/api/gallery/admin/flagged';
          break;
        case 'all':
          endpoint = '/api/gallery/admin/all';
          break;
        default:
          endpoint = '/api/gallery/admin/pending';
      }

      const response = await fetch(`http://localhost:5000${endpoint}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch data');
      }

      const data = await response.json();
      console.log(`Fetched ${activeTab} data:`, data);
      
      if (activeTab === 'all') {
        setAllItems(data.items || []);
      } else if (activeTab === 'flagged') {
        setFlaggedItems(data || []);
      } else {
        setPendingItems(data || []);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (itemId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/gallery/admin/${itemId}/approve`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to approve item');
      }

      toast.success('Item approved successfully');
      fetchData();
    } catch (error) {
      console.error('Error approving item:', error);
      toast.error('Failed to approve item');
    }
  };

  const handleReject = async (itemId) => {
    if (!rejectionReason.trim()) {
      toast.error('Please provide a rejection reason');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/gallery/admin/${itemId}/reject`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ rejectionReason })
      });

      if (!response.ok) {
        throw new Error('Failed to reject item');
      }

      toast.success('Item rejected successfully');
      setShowRejectModal(false);
      setRejectionReason('');
      setSelectedItem(null);
      fetchData();
    } catch (error) {
      console.error('Error rejecting item:', error);
      toast.error('Failed to reject item');
    }
  };

  const handleDelete = async (itemId) => {
    if (!window.confirm('Are you sure you want to delete this item? This action cannot be undone.')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/gallery/admin/${itemId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to delete item');
      }

      toast.success('Item deleted successfully');
      fetchData();
    } catch (error) {
      console.error('Error deleting item:', error);
      toast.error('Failed to delete item');
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      pending: 'bg-yellow-100 text-yellow-800',
      approved: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800',
      flagged: 'bg-orange-100 text-orange-800',
      deleted: 'bg-gray-100 text-gray-800'
    };
    return badges[status] || 'bg-gray-100 text-gray-800';
  };

  const getCategoryBadge = (category) => {
    const badges = {
      game: 'bg-blue-100 text-blue-800',
      practice: 'bg-purple-100 text-purple-800',
      community: 'bg-pink-100 text-pink-800',
      fan: 'bg-indigo-100 text-indigo-800',
      other: 'bg-gray-100 text-gray-800'
    };
    return badges[category] || 'bg-gray-100 text-gray-800';
  };

  const renderItemCard = (item) => (
    <div key={item._id} className="bg-white rounded-lg shadow-md p-6 mb-4">
      <div className="flex items-start gap-4">
        <div className="flex-shrink-0">
          <img
            src={`http://localhost:5000${item.imageUrl}`}
            alt={item.title}
            className="w-24 h-24 object-cover rounded-lg"
            onError={(e) => {
              e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iOTYiIGhlaWdodD0iOTYiIHZpZXdCb3g9IjAgMCA5NiA5NiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9Ijk2IiBoZWlnaHQ9Ijk2IiBmaWxsPSIjRjNGNEY2Ii8+Cjx0ZXh0IHg9IjQ4IiB5PSI0OCIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjEyIiBmaWxsPSIjOUI5QkEwIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj5JbWFnZSBFcnJvcjwvdGV4dD4KPC9zdmc+Cg==';
            }}
          />
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <h3 className="text-lg font-semibold text-gray-900 truncate">{item.title}</h3>
            <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusBadge(item.status)}`}>
              {item.status}
            </span>
            <span className={`px-2 py-1 text-xs font-medium rounded-full ${getCategoryBadge(item.category)}`}>
              {item.category}
            </span>
          </div>
          
          <p className="text-gray-600 text-sm mb-2 line-clamp-2">{item.description}</p>
          
          <div className="flex items-center gap-4 text-sm text-gray-500 mb-3">
            <span>By: {item.authorName}</span>
            <span>Views: {item.viewCount}</span>
            <span>Likes: {item.likes?.length || 0}</span>
            <span>Comments: {item.comments?.filter(c => c.status === 'active').length || 0}</span>
            {item.flagCount > 0 && (
              <span className="text-red-600 font-medium">Flags: {item.flagCount}</span>
            )}
          </div>

          {item.rejectionReason && (
            <div className="bg-red-50 border border-red-200 rounded p-2 mb-3">
              <p className="text-red-800 text-sm">
                <strong>Rejection Reason:</strong> {item.rejectionReason}
              </p>
            </div>
          )}

          <div className="flex gap-2">
            <button
              onClick={() => {
                setSelectedItem(item);
                setShowDetailsModal(true);
              }}
              className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
            >
              View Details
            </button>
            
            {item.status === 'pending' && (
              <>
                <button
                  onClick={() => handleApprove(item._id)}
                  className="px-3 py-1 text-sm bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
                >
                  Approve
                </button>
                <button
                  onClick={() => {
                    setSelectedItem(item);
                    setShowRejectModal(true);
                  }}
                  className="px-3 py-1 text-sm bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
                >
                  Reject
                </button>
              </>
            )}
            
            <button
              onClick={() => handleDelete(item._id)}
              className="px-3 py-1 text-sm bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors"
            >
              Delete
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const renderItems = () => {
    const items = activeTab === 'pending' ? pendingItems : 
                  activeTab === 'flagged' ? flaggedItems : 
                  allItems;

    if (loading) {
      return (
        <div className="flex justify-center items-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
        </div>
      );
    }

    if (items.length === 0) {
      return (
        <div className="text-center py-8">
          <p className="text-gray-500">No {activeTab} items found.</p>
        </div>
      );
    }

    return items.map(renderItemCard);
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-green-900 mb-2">Fans & Gallery Moderation</h1>
        <p className="text-gray-600">Review and manage fans & gallery content, approve submissions, and handle flagged items.</p>
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setActiveTab('pending')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            activeTab === 'pending'
              ? 'bg-green-600 text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          Pending Review ({pendingItems.length})
        </button>
        <button
          onClick={() => setActiveTab('flagged')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            activeTab === 'flagged'
              ? 'bg-green-600 text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          Flagged Items ({flaggedItems.length})
        </button>
        <button
          onClick={() => setActiveTab('all')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            activeTab === 'all'
              ? 'bg-green-600 text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          All Items ({allItems.length})
        </button>
      </div>

      {/* Items List */}
      <div className="space-y-4">
        {renderItems()}
      </div>

      {/* Reject Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Reject Gallery Item</h3>
            <p className="text-gray-600 mb-4">
              Please provide a reason for rejecting "{selectedItem?.title}"
            </p>
            <textarea
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="Enter rejection reason..."
              className="w-full p-3 border border-gray-300 rounded-lg mb-4 resize-none"
              rows="3"
            />
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => {
                  setShowRejectModal(false);
                  setRejectionReason('');
                  setSelectedItem(null);
                }}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleReject(selectedItem._id)}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
              >
                Reject
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Details Modal */}
      {showDetailsModal && selectedItem && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-xl font-semibold">{selectedItem.title}</h3>
              <button
                onClick={() => {
                  setShowDetailsModal(false);
                  setSelectedItem(null);
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <img
                  src={`http://localhost:5000${selectedItem.imageUrl}`}
                  alt={selectedItem.title}
                  className="w-full rounded-lg"
                              onError={(e) => {
              e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgdmlld0JveD0iMCAwIDQwMCAzMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSI0MDAiIGhlaWdodD0iMzAwIiBmaWxsPSIjRjNGNEY2Ii8+Cjx0ZXh0IHg9IjIwMCIgeT0iMTUwIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTYiIGZpbGw9IiM5QjlCQTAiIHRleHQtYW5jaG9yPSJtaWRkbGUiPkltYWdlIEVycm9yPC90ZXh0Pgo8L3N2Zz4K';
            }}
                />
              </div>
              
              <div>
                <div className="mb-4">
                  <h4 className="font-semibold mb-2">Details</h4>
                  <p className="text-gray-600 mb-2">{selectedItem.description}</p>
                  <div className="flex gap-2 mb-2">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusBadge(selectedItem.status)}`}>
                      {selectedItem.status}
                    </span>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getCategoryBadge(selectedItem.category)}`}>
                      {selectedItem.category}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500">
                    By: {selectedItem.authorName} | Views: {selectedItem.viewCount} | 
                    Likes: {selectedItem.likes?.length || 0}
                  </p>
                </div>

                {selectedItem.flags && selectedItem.flags.length > 0 && (
                  <div className="mb-4">
                    <h4 className="font-semibold mb-2 text-red-600">Flags ({selectedItem.flags.length})</h4>
                    <div className="space-y-2">
                      {selectedItem.flags.map((flag, index) => (
                        <div key={index} className="bg-red-50 border border-red-200 rounded p-2">
                          <p className="text-sm">
                            <strong>Reason:</strong> {flag.reason}
                          </p>
                          {flag.description && (
                            <p className="text-sm text-gray-600 mt-1">{flag.description}</p>
                          )}
                          <p className="text-xs text-gray-500 mt-1">
                            Flagged by: {flag.flaggedBy?.username || 'Unknown'} | 
                            {new Date(flag.flaggedAt).toLocaleDateString()}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {selectedItem.comments && selectedItem.comments.length > 0 && (
                  <div>
                    <h4 className="font-semibold mb-2">Comments ({selectedItem.comments.filter(c => c.status === 'active').length})</h4>
                    <div className="space-y-2 max-h-40 overflow-y-auto">
                      {selectedItem.comments
                        .filter(comment => comment.status === 'active')
                        .map((comment, index) => (
                          <div key={index} className="bg-gray-50 rounded p-2">
                            <p className="text-sm font-medium">{comment.userName}</p>
                            <p className="text-sm text-gray-600">{comment.content}</p>
                            <p className="text-xs text-gray-500">
                              {new Date(comment.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                        ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 
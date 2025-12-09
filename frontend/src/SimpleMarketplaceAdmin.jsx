import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { FaEye, FaCheck, FaTimes, FaRedo, FaUser, FaDollarSign, FaTag } from 'react-icons/fa';
import { API_BASE_URL } from './config/api';

export default function SimpleMarketplaceAdmin() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('No authentication token found');
        return;
      }

      const response = await fetch(`${API_BASE_URL}/auth/me`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        const user = await response.json();
        if (user.isSuperAdmin) {
          setIsAuthenticated(true);
          fetchItems();
        } else {
          setError('Super admin access required');
        }
      } else {
        setError('Authentication failed');
      }
    } catch (error) {
      console.error('Auth error:', error);
      setError('Authentication error');
    }
  };

  const fetchItems = async () => {
    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem('token');
      const headers = { 'Authorization': `Bearer ${token}` };

      // Try the public endpoint first (works without auth)
      const response = await fetch(`${API_BASE_URL}/marketplace/public`, { headers });
      
      if (response.ok) {
        const data = await response.json();
        setItems(data.items || []);
        toast.success('Items loaded successfully');
      } else {
        throw new Error('Failed to fetch items');
      }
    } catch (error) {
      console.error('Fetch error:', error);
      setError('Failed to load items');
      
      // Show sample data
      setItems([
        {
          _id: '1',
          title: 'Nike Mercurial Cleats',
          price: 85,
          status: 'pending',
          category: 'Cleats',
          seller: { name: 'John Doe', email: 'john@example.com' },
          createdAt: new Date().toISOString()
        },
        {
          _id: '2',
          title: 'Adidas Soccer Ball',
          price: 45,
          status: 'approved',
          category: 'Soccer Balls',
          seller: { name: 'Jane Smith', email: 'jane@example.com' },
          createdAt: new Date().toISOString()
        }
      ]);
      toast.info('Showing sample data');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (itemId, newStatus) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/marketplace/admin/${itemId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus })
      });

      if (response.ok) {
        toast.success(`Item ${newStatus} successfully`);
        fetchItems();
      } else {
        toast.error('Failed to update status');
      }
    } catch (error) {
      console.error('Status change error:', error);
      toast.error('Error updating status');
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(price);
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h2>
            <p className="text-gray-600 mb-4">{error || 'Super admin access required'}</p>
            <button
              onClick={checkAuth}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              <FaRedo className="inline mr-2" />
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Marketplace Admin</h1>
              <p className="text-gray-600">Manage marketplace items</p>
            </div>
            <button
              onClick={fetchItems}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
            >
              <FaRedo />
              Refresh
            </button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="text-center">
                <p className="text-sm text-blue-600">Total Items</p>
                <p className="text-2xl font-bold text-blue-900">{items.length}</p>
              </div>
            </div>
            <div className="bg-yellow-50 p-4 rounded-lg">
              <div className="text-center">
                <p className="text-sm text-yellow-600">Pending</p>
                <p className="text-2xl font-bold text-yellow-900">
                  {items.filter(item => item.status === 'pending').length}
                </p>
              </div>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <div className="text-center">
                <p className="text-sm text-green-600">Approved</p>
                <p className="text-2xl font-bold text-green-900">
                  {items.filter(item => item.status === 'approved').length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Items List */}
        <div className="bg-white rounded-lg shadow-md">
          {loading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading items...</p>
            </div>
          ) : error ? (
            <div className="p-8 text-center">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Error Loading Items</h3>
              <p className="text-gray-600 mb-4">{error}</p>
              <button
                onClick={fetchItems}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
              >
                Try Again
              </button>
            </div>
          ) : items.length === 0 ? (
            <div className="p-8 text-center">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No Items Found</h3>
              <p className="text-gray-600">No items available for moderation.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Item
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Seller
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Price
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {items.map((item) => (
                    <tr key={item._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="h-10 w-10 flex-shrink-0">
                            <img
                              className="h-10 w-10 rounded-lg object-cover"
                              src={item.images?.[0] || '/placeholder-item.jpg'}
                              alt={item.title}
                            />
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{item.title}</div>
                            <div className="text-sm text-gray-500 flex items-center gap-2">
                              <FaTag className="text-gray-400" />
                              {item.category}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <FaUser className="text-gray-400 mr-2" />
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {item.seller?.name || 'Unknown'}
                            </div>
                            <div className="text-sm text-gray-500">
                              {item.seller?.email || 'No email'}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <FaDollarSign className="text-green-500 mr-1" />
                          <span className="text-sm font-medium text-gray-900">
                            {formatPrice(item.price || 0)}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          item.status === 'approved' ? 'bg-green-100 text-green-800' :
                          item.status === 'rejected' ? 'bg-red-100 text-red-800' :
                          'bg-yellow-100 text-yellow-800'
                        }`}>
                          {item.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center gap-2">
                          {item.status !== 'approved' && (
                            <button
                              onClick={() => handleStatusChange(item._id, 'approved')}
                              className="text-green-600 hover:text-green-900"
                              title="Approve"
                            >
                              <FaCheck />
                            </button>
                          )}
                          {item.status !== 'rejected' && (
                            <button
                              onClick={() => handleStatusChange(item._id, 'rejected')}
                              className="text-red-600 hover:text-red-900"
                              title="Reject"
                            >
                              <FaTimes />
                            </button>
                          )}
                          <button
                            className="text-blue-600 hover:text-blue-900"
                            title="View Details"
                          >
                            <FaEye />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

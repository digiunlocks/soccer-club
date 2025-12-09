import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { FaClock, FaExclamationTriangle, FaDollarSign, FaCalendarAlt, FaRedo } from 'react-icons/fa';
import { API_BASE_URL } from './config/api';

const SERVER_URL = API_BASE_URL.replace('/api', '');

const MyExpiringItems = () => {
  const [items, setItems] = useState([]);
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [extending, setExtending] = useState(null);

  useEffect(() => {
    fetchExpiringItems();
  }, []);

  const fetchExpiringItems = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/marketplace/extension/my-expiring-items`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setItems(data.items);
        setSettings(data.settings);
      } else {
        toast.error('Failed to load expiring items');
      }
    } catch (error) {
      console.error('Error fetching expiring items:', error);
      toast.error('Error loading items');
    } finally {
      setLoading(false);
    }
  };

  const handleExtend = async (itemId) => {
    if (!confirm('Are you sure you want to extend this listing? Extension fees may apply.')) {
      return;
    }
    
    setExtending(itemId);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/marketplace/extension/extend/${itemId}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        toast.success('Listing extended successfully!');
        await fetchExpiringItems();
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to extend listing');
      }
    } catch (error) {
      console.error('Error extending item:', error);
      toast.error('Error extending item');
    } finally {
      setExtending(null);
    }
  };

  const getDaysColor = (days) => {
    if (days <= 0) return 'text-red-600';
    if (days <= 3) return 'text-red-500';
    if (days <= 7) return 'text-yellow-600';
    return 'text-green-600';
  };

  const getStatusBadge = (item) => {
    if (item.status === 'expired') {
      return <span className="px-2 py-1 bg-red-600 text-white text-xs font-semibold rounded">Expired</span>;
    }
    if (item.daysRemaining <= 0) {
      return <span className="px-2 py-1 bg-red-500 text-white text-xs font-semibold rounded">Expiring Today</span>;
    }
    if (item.daysRemaining <= 3) {
      return <span className="px-2 py-1 bg-red-400 text-white text-xs font-semibold rounded">Urgent</span>;
    }
    if (item.daysRemaining <= 7) {
      return <span className="px-2 py-1 bg-yellow-500 text-white text-xs font-semibold rounded">Expiring Soon</span>;
    }
    return null;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 py-8">
        <div className="container mx-auto px-4">
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <div className="text-xl">Loading your items...</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="container mx-auto px-4">
        {/* Header with Breadcrumb */}
        <div className="mb-4">
          <nav className="text-sm text-gray-600">
            <Link to="/" className="hover:text-blue-600">Home</Link>
            <span className="mx-2">/</span>
            <Link to="/my-items" className="hover:text-blue-600">My Items</Link>
            <span className="mx-2">/</span>
            <span className="text-gray-900">Expiring Listings</span>
          </nav>
        </div>

        {/* Title and Summary */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-orange-100 rounded-lg">
                <FaClock className="text-2xl text-orange-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">My Expiring Listings</h1>
                <p className="text-sm text-gray-600">
                  Monitor and extend items that are expiring soon
                </p>
              </div>
            </div>
            <Link
              to="/my-items"
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 border border-gray-300"
            >
              ← Back to My Items
            </Link>
          </div>

          {/* Stats Summary - Only show when there are items */}
          {items.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pt-4 border-t">
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">{items.length}</div>
                <div className="text-sm text-gray-600">Items Expiring Soon</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">
                  {items.filter(i => i.daysRemaining <= 3).length}
                </div>
                <div className="text-sm text-gray-600">Urgent (≤3 days)</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-700">
                  {items.filter(i => i.status === 'expired').length}
                </div>
                <div className="text-sm text-gray-600">Already Expired</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {items.filter(i => i.canExtend).length}
                </div>
                <div className="text-sm text-gray-600">Can Be Extended</div>
              </div>
            </div>
          )}
        </div>

        {/* Extension Information - Only show when there are items */}
        {items.length > 0 && settings && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <h3 className="font-semibold text-blue-900 mb-3 flex items-center gap-2">
              <FaRedo className="text-blue-700" />
              Extension Policy
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div className="flex items-center gap-2">
                <FaCalendarAlt className="text-blue-600" />
                <div>
                  <div className="text-gray-600">Extension Duration</div>
                  <div className="font-semibold text-blue-900">{settings.extensionDays} days</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <FaRedo className="text-blue-600" />
                <div>
                  <div className="text-gray-600">Max Extensions Allowed</div>
                  <div className="font-semibold text-blue-900">{settings.maxExtensionsAllowed} per item</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <FaDollarSign className="text-blue-600" />
                <div>
                  <div className="text-gray-600">Extension Fee</div>
                  <div className="font-semibold text-blue-900">
                    {settings.allowExtensions ? 'Varies by item' : 'Not Available'}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Empty State */}
        {items.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <div className="max-w-md mx-auto">
              <div className="p-4 bg-green-100 rounded-full w-20 h-20 mx-auto mb-4 flex items-center justify-center">
                <FaCalendarAlt className="text-4xl text-green-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">
                All Clear! 🎉
              </h3>
              <p className="text-gray-600 mb-6">
                You don't have any items expiring within the next 30 days. Your listings are healthy and active!
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Link
                  to="/my-items"
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
                >
                  View All My Items
                </Link>
                <Link
                  to="/marketplace/sell"
                  className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium"
                >
                  List New Item
                </Link>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {items.map((item) => (
              <div
                key={item._id}
                className={`bg-white rounded-lg shadow-md p-6 ${
                  item.status === 'expired' ? 'border-2 border-red-500' : ''
                }`}
              >
                <div className="flex gap-6">
                  {/* Item Image */}
                  <div className="flex-shrink-0">
                    <img
                      src={item.images[0] ? `${SERVER_URL}/uploads/${item.images[0]}` : '/placeholder.jpg'}
                      alt={item.title}
                      className="w-32 h-32 object-cover rounded-lg"
                    />
                  </div>

                  {/* Item Info */}
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <Link
                          to={`/marketplace/item/${item._id}`}
                          className="text-xl font-semibold text-gray-900 hover:text-blue-600"
                        >
                          {item.title}
                        </Link>
                        <div className="flex items-center gap-2 mt-1">
                          {getStatusBadge(item)}
                          <span className="text-sm text-gray-500">
                            {item.category}
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-green-600">
                          ${item.price}
                        </div>
                      </div>
                    </div>

                    {/* Expiration Info */}
                    <div className="bg-gray-50 rounded-lg p-4 mb-4">
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div>
                          <div className="text-xs text-gray-500 mb-1">Expiration Date</div>
                          <div className="font-medium text-gray-900">
                            {new Date(item.expiresAt).toLocaleDateString()}
                          </div>
                        </div>
                        <div>
                          <div className="text-xs text-gray-500 mb-1">Days Remaining</div>
                          <div className={`font-bold text-lg ${getDaysColor(item.daysRemaining)}`}>
                            {item.daysRemaining} {item.daysRemaining === 1 ? 'day' : 'days'}
                          </div>
                        </div>
                        <div>
                          <div className="text-xs text-gray-500 mb-1">Extensions Used</div>
                          <div className="font-medium text-gray-900">
                            {item.extensionCount} / {settings?.maxExtensionsAllowed || 3}
                          </div>
                        </div>
                        <div>
                          <div className="text-xs text-gray-500 mb-1">Extension Price</div>
                          <div className="font-bold text-green-600">
                            ${item.extensionPrice}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center gap-3">
                      {item.canExtend ? (
                        <button
                          onClick={() => handleExtend(item._id)}
                          disabled={extending === item._id || !settings?.allowExtensions}
                          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center gap-2"
                        >
                          <FaRedo />
                          {extending === item._id ? 'Extending...' : `Extend for ${item.extensionDays} Days`}
                        </button>
                      ) : (
                        <div className="px-4 py-2 bg-gray-300 text-gray-600 rounded-lg flex items-center gap-2">
                          <FaExclamationTriangle />
                          Cannot Extend (Max Reached)
                        </div>
                      )}
                      
                      <Link
                        to={`/marketplace/item/${item._id}`}
                        className="px-4 py-2 border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50"
                      >
                        View Details
                      </Link>
                      
                      {item.status === 'expired' && (
                        <div className="ml-auto text-sm text-red-600 font-semibold flex items-center gap-2">
                          <FaExclamationTriangle />
                          This item is expired and not visible to buyers
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyExpiringItems;


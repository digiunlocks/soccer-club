import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { FaClock, FaExclamationTriangle, FaDollarSign, FaCalendarAlt, FaRedo } from 'react-icons/fa';

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
      const response = await fetch('http://localhost:5000/api/marketplace/extension/my-expiring-items', {
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
      const response = await fetch(`http://localhost:5000/api/marketplace/extension/extend/${itemId}`, {
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
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <FaClock className="text-3xl text-orange-600" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">My Expiring Listings</h1>
                <p className="text-sm text-gray-600">
                  Manage listings that are expiring soon or have expired
                </p>
              </div>
            </div>
            <Link
              to="/my-items"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              View All My Items
            </Link>
          </div>
        </div>

        {settings && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <h3 className="font-semibold text-blue-900 mb-2">Extension Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-blue-800">
              <div>
                <strong>Extension Duration:</strong> {settings.extensionDays} days
              </div>
              <div>
                <strong>Max Extensions:</strong> {settings.maxExtensionsAllowed} per item
              </div>
              <div>
                <strong>Extensions Enabled:</strong> {settings.allowExtensions ? 'Yes' : 'No'}
              </div>
            </div>
          </div>
        )}

        {items.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <FaCalendarAlt className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No Expiring Items
            </h3>
            <p className="text-gray-600 mb-4">
              You don't have any items expiring soon. Great job keeping your listings active!
            </p>
            <Link
              to="/my-items"
              className="inline-block px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              View All My Items
            </Link>
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
                      src={item.images[0] ? `http://localhost:5000/uploads/${item.images[0]}` : '/placeholder.jpg'}
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


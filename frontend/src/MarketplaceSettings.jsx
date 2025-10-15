import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { FaClock, FaDollarSign, FaPlus, FaTrash, FaSave, FaCog, FaArrowLeft } from 'react-icons/fa';

const MarketplaceSettings = () => {
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  const [formData, setFormData] = useState({
    defaultExpirationDays: 30,
    expirationWarningDays: 7,
    allowExtensions: true,
    extensionDays: 30,
    maxExtensionsAllowed: 3,
    freeListingsEnabled: true,
    freeListingDuration: 30,
    freeListingsPerUser: 3,
    autoExpireEnabled: true,
    autoDeleteExpiredAfterDays: 30,
    sendExpirationWarnings: true,
    sendExpiredNotifications: true,
    requireApproval: true,
    maxImagesPerListing: 5
  });
  
  const [newTier, setNewTier] = useState({
    name: '',
    duration: 30,
    price: 0,
    description: '',
    featured: false
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/marketplace/settings');
      if (response.ok) {
        const data = await response.json();
        setSettings(data);
        setFormData({
          defaultExpirationDays: data.defaultExpirationDays,
          expirationWarningDays: data.expirationWarningDays,
          allowExtensions: data.allowExtensions,
          extensionDays: data.extensionDays,
          maxExtensionsAllowed: data.maxExtensionsAllowed,
          freeListingsEnabled: data.freeListingsEnabled,
          freeListingDuration: data.freeListingDuration,
          freeListingsPerUser: data.freeListingsPerUser,
          autoExpireEnabled: data.autoExpireEnabled,
          autoDeleteExpiredAfterDays: data.autoDeleteExpiredAfterDays,
          sendExpirationWarnings: data.sendExpirationWarnings,
          sendExpiredNotifications: data.sendExpiredNotifications,
          requireApproval: data.requireApproval,
          maxImagesPerListing: data.maxImagesPerListing
        });
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
      toast.error('Failed to load settings');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('Please log in to update settings');
        return;
      }
      
      console.log('🔧 [Frontend] Sending settings update:', formData);
      
      const response = await fetch('http://localhost:5000/api/marketplace/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });
      
      const data = await response.json();
      console.log('🔧 [Frontend] Response:', response.status, data);
      
      if (response.ok) {
        setSettings(data.settings);
        toast.success('Settings updated successfully!');
      } else {
        console.error('❌ [Frontend] Update failed:', data);
        const errorMsg = data.error || data.message || 'Failed to update settings';
        toast.error(`Update failed: ${errorMsg}`);
      }
    } catch (error) {
      console.error('❌ [Frontend] Network error:', error);
      toast.error(`Network error: ${error.message}`);
    } finally {
      setSaving(false);
    }
  };

  const handleAddTier = async () => {
    if (!newTier.name || newTier.duration <= 0) {
      toast.error('Please fill in all required fields');
      return;
    }
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/marketplace/settings/pricing-tier', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(newTier)
      });
      
      if (response.ok) {
        const data = await response.json();
        setSettings(data.settings);
        setNewTier({ name: '', duration: 30, price: 0, description: '', featured: false });
        toast.success('Pricing tier added!');
      } else {
        toast.error('Failed to add pricing tier');
      }
    } catch (error) {
      console.error('Error adding pricing tier:', error);
      toast.error('Error adding pricing tier');
    }
  };

  const handleDeleteTier = async (tierId) => {
    if (!confirm('Are you sure you want to delete this pricing tier?')) return;
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/marketplace/settings/pricing-tier/${tierId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setSettings(data.settings);
        toast.success('Pricing tier deleted!');
      } else {
        toast.error('Failed to delete pricing tier');
      }
    } catch (error) {
      console.error('Error deleting pricing tier:', error);
      toast.error('Error deleting pricing tier');
    }
  };

  const handleUpdateCategoryPricing = async (category, basePrice, extensionPrice) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/marketplace/settings/category-pricing/${category}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ basePrice, extensionPrice })
      });
      
      if (response.ok) {
        const data = await response.json();
        setSettings(data.settings);
        toast.success(`Updated pricing for ${category}`);
      } else {
        toast.error('Failed to update category pricing');
      }
    } catch (error) {
      console.error('Error updating category pricing:', error);
      toast.error('Error updating category pricing');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-xl">Loading settings...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="container mx-auto px-4">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <FaCog className="text-3xl text-blue-600" />
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Marketplace Settings</h2>
                <p className="text-sm text-gray-600">Configure expiration dates, pricing, and posting rules</p>
              </div>
            </div>
            <button
              onClick={() => {
                // Navigate to admin dashboard and automatically open marketplace section
                window.location.href = '/admin?section=marketplace';
              }}
              className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              <FaArrowLeft />
              Back to Marketplace Management
            </button>
          </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Expiration Settings */}
        <div className="border-b border-gray-200 pb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <FaClock className="text-blue-600" />
            Expiration Settings
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Default Expiration (days)
              </label>
              <input
                type="number"
                min="1"
                max="365"
                value={formData.defaultExpirationDays}
                onChange={(e) => setFormData({ ...formData, defaultExpirationDays: parseInt(e.target.value) })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              />
              <p className="text-xs text-gray-500 mt-1">How long new listings stay active</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Warning Days Before Expiration
              </label>
              <input
                type="number"
                min="1"
                max="30"
                value={formData.expirationWarningDays}
                onChange={(e) => setFormData({ ...formData, expirationWarningDays: parseInt(e.target.value) })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              />
              <p className="text-xs text-gray-500 mt-1">Notify sellers this many days before expiration</p>
            </div>
          </div>
        </div>

        {/* Extension Settings */}
        <div className="border-b border-gray-200 pb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Extension Settings</h3>
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="allowExtensions"
                checked={formData.allowExtensions}
                onChange={(e) => setFormData({ ...formData, allowExtensions: e.target.checked })}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <label htmlFor="allowExtensions" className="text-sm font-medium text-gray-700">
                Allow sellers to extend expired listings
              </label>
            </div>
            {formData.allowExtensions && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 ml-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Extension Duration (days)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="90"
                    value={formData.extensionDays}
                    onChange={(e) => setFormData({ ...formData, extensionDays: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Max Extensions Allowed
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="10"
                    value={formData.maxExtensionsAllowed}
                    onChange={(e) => setFormData({ ...formData, maxExtensionsAllowed: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Free Listings */}
        <div className="border-b border-gray-200 pb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Free Listings</h3>
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="freeListingsEnabled"
                checked={formData.freeListingsEnabled}
                onChange={(e) => setFormData({ ...formData, freeListingsEnabled: e.target.checked })}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <label htmlFor="freeListingsEnabled" className="text-sm font-medium text-gray-700">
                Enable free listings
              </label>
            </div>
            {formData.freeListingsEnabled && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 ml-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Free Listing Duration (days)
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={formData.freeListingDuration}
                    onChange={(e) => setFormData({ ...formData, freeListingDuration: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Free Listings Per User
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formData.freeListingsPerUser}
                    onChange={(e) => setFormData({ ...formData, freeListingsPerUser: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Notifications */}
        <div className="border-b border-gray-200 pb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Notifications</h3>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="sendExpirationWarnings"
                checked={formData.sendExpirationWarnings}
                onChange={(e) => setFormData({ ...formData, sendExpirationWarnings: e.target.checked })}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <label htmlFor="sendExpirationWarnings" className="text-sm font-medium text-gray-700">
                Send expiration warning notifications
              </label>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="sendExpiredNotifications"
                checked={formData.sendExpiredNotifications}
                onChange={(e) => setFormData({ ...formData, sendExpiredNotifications: e.target.checked })}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <label htmlFor="sendExpiredNotifications" className="text-sm font-medium text-gray-700">
                Send expired item notifications
              </label>
            </div>
          </div>
        </div>

        {/* Auto-expiration */}
        <div className="border-b border-gray-200 pb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Auto-Expiration</h3>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="autoExpireEnabled"
              checked={formData.autoExpireEnabled}
              onChange={(e) => setFormData({ ...formData, autoExpireEnabled: e.target.checked })}
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <label htmlFor="autoExpireEnabled" className="text-sm font-medium text-gray-700">
              Automatically expire items after expiration date
            </label>
          </div>
        </div>

        {/* Other Settings */}
        <div className="border-b border-gray-200 pb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Other Settings</h3>
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="requireApproval"
                checked={formData.requireApproval}
                onChange={(e) => setFormData({ ...formData, requireApproval: e.target.checked })}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <label htmlFor="requireApproval" className="text-sm font-medium text-gray-700">
                Require admin approval for new listings
              </label>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Max Images Per Listing
              </label>
              <input
                type="number"
                min="1"
                max="10"
                value={formData.maxImagesPerListing}
                onChange={(e) => setFormData({ ...formData, maxImagesPerListing: parseInt(e.target.value) })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 max-w-xs"
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center gap-2"
          >
            <FaSave />
            {saving ? 'Saving...' : 'Save Settings'}
          </button>
        </div>
      </form>

      {/* Pricing Tiers */}
      {settings && (
        <div className="mt-8 border-t border-gray-200 pt-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <FaDollarSign className="text-green-600" />
            Pricing Tiers
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
            {settings.pricingTiers.map((tier) => (
              <div key={tier._id} className={`border rounded-lg p-4 ${tier.featured ? 'border-yellow-400 bg-yellow-50' : 'border-gray-200'}`}>
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-semibold text-gray-900">{tier.name}</h4>
                    <p className="text-sm text-gray-600">{tier.description}</p>
                    <p className="text-lg font-bold text-green-600 mt-2">${tier.price}</p>
                    <p className="text-xs text-gray-500">{tier.duration} days</p>
                    {tier.featured && <span className="text-xs bg-yellow-600 text-white px-2 py-1 rounded mt-2 inline-block">Featured</span>}
                  </div>
                  <button
                    onClick={() => handleDeleteTier(tier._id)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <FaTrash />
                  </button>
                </div>
              </div>
            ))}
          </div>
          
          {/* Add New Tier */}
          <div className="border border-gray-300 rounded-lg p-4 bg-gray-50">
            <h4 className="font-semibold text-gray-900 mb-3">Add New Pricing Tier</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <input
                type="text"
                placeholder="Tier Name"
                value={newTier.name}
                onChange={(e) => setNewTier({ ...newTier, name: e.target.value })}
                className="px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              />
              <input
                type="number"
                placeholder="Duration (days)"
                value={newTier.duration}
                onChange={(e) => setNewTier({ ...newTier, duration: parseInt(e.target.value) })}
                className="px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              />
              <input
                type="number"
                step="0.01"
                placeholder="Price ($)"
                value={newTier.price}
                onChange={(e) => setNewTier({ ...newTier, price: parseFloat(e.target.value) })}
                className="px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              />
              <input
                type="text"
                placeholder="Description"
                value={newTier.description}
                onChange={(e) => setNewTier({ ...newTier, description: e.target.value })}
                className="px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div className="flex items-center gap-2 mt-3">
              <input
                type="checkbox"
                id="tierFeatured"
                checked={newTier.featured}
                onChange={(e) => setNewTier({ ...newTier, featured: e.target.checked })}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <label htmlFor="tierFeatured" className="text-sm font-medium text-gray-700">
                Featured tier
              </label>
            </div>
            <button
              onClick={handleAddTier}
              className="mt-3 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2"
            >
              <FaPlus />
              Add Tier
            </button>
          </div>
        </div>
      )}

      {/* Category Pricing */}
      {settings && (
        <div className="mt-8 border-t border-gray-200 pt-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Category Pricing</h3>
          <div className="space-y-3">
            {settings.categoryPricing.map((cat) => (
              <div key={cat._id} className="flex items-center gap-4 border border-gray-200 rounded-lg p-3">
                <div className="flex-1 font-medium text-gray-900">{cat.category}</div>
                <div className="flex items-center gap-2">
                  <label className="text-sm text-gray-600">Base:</label>
                  <input
                    type="number"
                    step="0.01"
                    value={cat.basePrice}
                    onChange={(e) => handleUpdateCategoryPricing(cat.category, parseFloat(e.target.value), cat.extensionPrice)}
                    className="w-20 px-2 py-1 border border-gray-300 rounded text-sm"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <label className="text-sm text-gray-600">Extension:</label>
                  <input
                    type="number"
                    step="0.01"
                    value={cat.extensionPrice}
                    onChange={(e) => handleUpdateCategoryPricing(cat.category, cat.basePrice, parseFloat(e.target.value))}
                    className="w-20 px-2 py-1 border border-gray-300 rounded text-sm"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
        </div>
      </div>
    </div>
  );
};

export default MarketplaceSettings;


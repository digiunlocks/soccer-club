import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import { API_BASE_URL } from './config/api';

const SERVER_URL = API_BASE_URL.replace('/api', '');

export default function AdvertisementManager() {
  const navigate = useNavigate();
  const [advertisements, setAdvertisements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingAd, setEditingAd] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    subtitle: '',
    description: '',
    type: 'club-update',
    ctaText: '',
    ctaLink: '',
    ctaType: 'internal',
    eventDate: '',
    eventDateText: '',
    location: '',
    price: '',
    originalPrice: '',
    discount: '',
    badge: '',
    badgeColor: 'bg-green-500',
    visible: true,
    featured: false,
    order: 0,
    priority: 1,
    startDate: '',
    endDate: '',
    targetAudience: ['all'],
    tags: '',
    seoTitle: '',
    seoDescription: '',
    organization: {
      name: '',
      website: '',
      logo: ''
    }
  });

  const [filters, setFilters] = useState({
    type: '',
    featured: '',
    visible: ''
  });

  const [selectedAds, setSelectedAds] = useState([]);
  const [bulkAction, setBulkAction] = useState('');

  useEffect(() => {
    fetchAdvertisements();
  }, [filters]);

  const fetchAdvertisements = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      if (!token) {
        toast.error('Please log in to access the Advertisement Manager');
        navigate('/signin');
        return;
      }

      const queryParams = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value) queryParams.append(key, value);
      });

      const response = await fetch(`${API_BASE_URL}/advertisements?${queryParams}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.status === 401) {
        toast.error('Invalid token. Please log in again.');
        localStorage.removeItem('token');
        navigate('/signin');
        return;
      }

      if (!response.ok) {
        throw new Error('Failed to fetch advertisements');
      }

      const data = await response.json();
      setAdvertisements(data);
    } catch (error) {
      console.error('Error fetching advertisements:', error);
      toast.error('Failed to load advertisements');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const submitData = {
        ...formData,
        tags: formData.tags ? formData.tags.split(',').map(tag => tag.trim()) : [],
        targetAudience: Array.isArray(formData.targetAudience) ? formData.targetAudience : [formData.targetAudience],
        eventDate: formData.eventDate ? new Date(formData.eventDate) : null,
        startDate: formData.startDate ? new Date(formData.startDate) : null,
        endDate: formData.endDate ? new Date(formData.endDate) : null
      };

      const url = editingAd 
        ? `${API_BASE_URL}/advertisements/${editingAd._id}`
        : `${API_BASE_URL}/advertisements`;
      
      const method = editingAd ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(submitData)
      });

      if (!response.ok) {
        throw new Error('Failed to save advertisement');
      }

      toast.success(editingAd ? 'Advertisement updated successfully!' : 'Advertisement created successfully!');
      setShowForm(false);
      setEditingAd(null);
      resetForm();
      fetchAdvertisements();
    } catch (error) {
      console.error('Error saving advertisement:', error);
      toast.error('Failed to save advertisement');
    }
  };

  const handleEdit = (ad) => {
    setEditingAd(ad);
    setFormData({
      title: ad.title || '',
      subtitle: ad.subtitle || '',
      description: ad.description || '',
      type: ad.type || 'club-update',
      ctaText: ad.ctaText || '',
      ctaLink: ad.ctaLink || '',
      ctaType: ad.ctaType || 'internal',
      eventDate: ad.eventDate ? new Date(ad.eventDate).toISOString().split('T')[0] : '',
      eventDateText: ad.eventDateText || '',
      location: ad.location || '',
      price: ad.price || '',
      originalPrice: ad.originalPrice || '',
      discount: ad.discount || '',
      badge: ad.badge || '',
      badgeColor: ad.badgeColor || 'bg-green-500',
      visible: ad.visible !== undefined ? ad.visible : true,
      featured: ad.featured || false,
      order: ad.order || 0,
      priority: ad.priority || 1,
      startDate: ad.startDate ? new Date(ad.startDate).toISOString().split('T')[0] : '',
      endDate: ad.endDate ? new Date(ad.endDate).toISOString().split('T')[0] : '',
      targetAudience: ad.targetAudience || ['all'],
      tags: ad.tags ? ad.tags.join(', ') : '',
      seoTitle: ad.seoTitle || '',
      seoDescription: ad.seoDescription || '',
      organization: {
        name: ad.organization?.name || '',
        website: ad.organization?.website || '',
        logo: ad.organization?.logo || ''
      }
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this advertisement?')) {
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/advertisements/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to delete advertisement');
      }

      toast.success('Advertisement deleted successfully!');
      fetchAdvertisements();
    } catch (error) {
      console.error('Error deleting advertisement:', error);
      toast.error('Failed to delete advertisement');
    }
  };

  const handleBulkAction = async () => {
    if (!bulkAction || selectedAds.length === 0) {
      toast.error('Please select an action and advertisements');
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/advertisements/bulk`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          action: bulkAction,
          ids: selectedAds,
          data: bulkAction === 'toggle-visibility' ? { visible: true } : 
                bulkAction === 'toggle-featured' ? { featured: true } : {}
        })
      });

      if (!response.ok) {
        throw new Error('Failed to perform bulk action');
      }

      toast.success('Bulk action completed successfully!');
      setSelectedAds([]);
      setBulkAction('');
      fetchAdvertisements();
    } catch (error) {
      console.error('Error performing bulk action:', error);
      toast.error('Failed to perform bulk action');
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      subtitle: '',
      description: '',
      type: 'club-update',
      ctaText: '',
      ctaLink: '',
      ctaType: 'internal',
      eventDate: '',
      eventDateText: '',
      location: '',
      price: '',
      originalPrice: '',
      discount: '',
      badge: '',
      badgeColor: 'bg-green-500',
      visible: true,
      featured: false,
      order: 0,
      priority: 1,
      startDate: '',
      endDate: '',
      targetAudience: ['all'],
      tags: '',
      seoTitle: '',
      seoDescription: '',
      organization: {
        name: '',
        website: '',
        logo: ''
      }
    });
  };

  const getTypeLabel = (type) => {
    const labels = {
      'club-update': 'Club Update',
      'merchandise': 'Merchandise',
      'other-club': 'Other Club',
      'community-event': 'Community Event',
      'league': 'League',
      'training': 'Training',
      'tournament': 'Tournament'
    };
    return labels[type] || type;
  };

  const getTypeColor = (type) => {
    const colors = {
      'club-update': 'bg-green-100 text-green-800',
      'merchandise': 'bg-blue-100 text-blue-800',
      'other-club': 'bg-purple-100 text-purple-800',
      'community-event': 'bg-orange-100 text-orange-800',
      'league': 'bg-indigo-100 text-indigo-800',
      'training': 'bg-teal-100 text-teal-800',
      'tournament': 'bg-yellow-100 text-yellow-800'
    };
    return colors[type] || 'bg-gray-100 text-gray-800';
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2 mb-8"></div>
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-20 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Advertisement Manager</h1>
        <p className="text-gray-600">Create and manage advertisements displayed on the homepage.</p>
      </div>

      {/* Filters and Actions */}
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <div className="flex flex-wrap items-center gap-4 mb-4">
          <select
            value={filters.type}
            onChange={(e) => setFilters({ ...filters, type: e.target.value })}
            className="border border-gray-300 rounded px-3 py-2"
          >
            <option value="">All Types</option>
            <option value="club-update">Club Update</option>
            <option value="merchandise">Merchandise</option>
            <option value="other-club">Other Club</option>
            <option value="community-event">Community Event</option>
            <option value="league">League</option>
            <option value="training">Training</option>
            <option value="tournament">Tournament</option>
          </select>

          <select
            value={filters.featured}
            onChange={(e) => setFilters({ ...filters, featured: e.target.value })}
            className="border border-gray-300 rounded px-3 py-2"
          >
            <option value="">All Featured</option>
            <option value="true">Featured</option>
            <option value="false">Not Featured</option>
          </select>

          <select
            value={filters.visible}
            onChange={(e) => setFilters({ ...filters, visible: e.target.value })}
            className="border border-gray-300 rounded px-3 py-2"
          >
            <option value="">All Visibility</option>
            <option value="true">Visible</option>
            <option value="false">Hidden</option>
          </select>
        </div>

        <div className="flex flex-wrap items-center gap-4">
          <button
            onClick={() => {
              setShowForm(true);
              setEditingAd(null);
              resetForm();
            }}
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
          >
            Add New Advertisement
          </button>

          {selectedAds.length > 0 && (
            <div className="flex items-center gap-2">
              <select
                value={bulkAction}
                onChange={(e) => setBulkAction(e.target.value)}
                className="border border-gray-300 rounded px-3 py-2"
              >
                <option value="">Bulk Actions</option>
                <option value="delete">Delete Selected</option>
                <option value="toggle-visibility">Toggle Visibility</option>
                <option value="toggle-featured">Toggle Featured</option>
              </select>
              <button
                onClick={handleBulkAction}
                className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
              >
                Apply
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Advertisements List */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left">
                  <input
                    type="checkbox"
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedAds(advertisements.map(ad => ad._id));
                      } else {
                        setSelectedAds([]);
                      }
                    }}
                    checked={selectedAds.length === advertisements.length && advertisements.length > 0}
                  />
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Advertisement
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Analytics
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {advertisements.map((ad) => (
                <tr key={ad._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <input
                      type="checkbox"
                      checked={selectedAds.includes(ad._id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedAds([...selectedAds, ad._id]);
                        } else {
                          setSelectedAds(selectedAds.filter(id => id !== ad._id));
                        }
                      }}
                    />
                  </td>
                  <td className="px-6 py-4">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{ad.title}</div>
                      {ad.subtitle && (
                        <div className="text-sm text-gray-500">{ad.subtitle}</div>
                      )}
                      <div className="text-xs text-gray-400 mt-1">
                        Created: {new Date(ad.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getTypeColor(ad.type)}`}>
                      {getTypeLabel(ad.type)}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col space-y-1">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        ad.visible ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {ad.visible ? 'Visible' : 'Hidden'}
                      </span>
                      {ad.featured && (
                        <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800">
                          Featured
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900">
                      <div>Views: {ad.views}</div>
                      <div>Clicks: {ad.clicks}</div>
                      {ad.views > 0 && (
                        <div className="text-xs text-gray-500">
                          CTR: {((ad.clicks / ad.views) * 100).toFixed(1)}%
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleEdit(ad)}
                        className="text-blue-600 hover:text-blue-900 text-sm font-medium"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(ad._id)}
                        className="text-red-600 hover:text-red-900 text-sm font-medium"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {advertisements.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            No advertisements found. Create your first advertisement to get started.
          </div>
        )}
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b">
              <h2 className="text-2xl font-bold text-gray-900">
                {editingAd ? 'Edit Advertisement' : 'Create New Advertisement'}
              </h2>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {/* Basic Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                    maxLength={100}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Subtitle
                  </label>
                  <input
                    type="text"
                    value={formData.subtitle}
                    onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                    maxLength={150}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description *
                </label>
                <textarea
                  required
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                  maxLength={500}
                />
              </div>

              {/* Type and CTA */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Type *
                  </label>
                  <select
                    required
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                  >
                    <option value="club-update">Club Update</option>
                    <option value="merchandise">Merchandise</option>
                    <option value="other-club">Other Club</option>
                    <option value="community-event">Community Event</option>
                    <option value="league">League</option>
                    <option value="training">Training</option>
                    <option value="tournament">Tournament</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    CTA Text *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.ctaText}
                    onChange={(e) => setFormData({ ...formData, ctaText: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                    maxLength={50}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    CTA Link *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.ctaLink}
                    onChange={(e) => setFormData({ ...formData, ctaLink: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
              </div>

              {/* Event Details */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Event Date
                  </label>
                  <input
                    type="date"
                    value={formData.eventDate}
                    onChange={(e) => setFormData({ ...formData, eventDate: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Event Date Text
                  </label>
                  <input
                    type="text"
                    value={formData.eventDateText}
                    onChange={(e) => setFormData({ ...formData, eventDateText: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="e.g., March 15-17, 2024"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Location
                  </label>
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
              </div>

              {/* Pricing */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Price
                  </label>
                  <input
                    type="text"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="e.g., $25"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Original Price
                  </label>
                  <input
                    type="text"
                    value={formData.originalPrice}
                    onChange={(e) => setFormData({ ...formData, originalPrice: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="e.g., $30"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Discount
                  </label>
                  <input
                    type="text"
                    value={formData.discount}
                    onChange={(e) => setFormData({ ...formData, discount: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="e.g., 20% OFF"
                  />
                </div>
              </div>

              {/* Badge and Settings */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Badge
                  </label>
                  <input
                    type="text"
                    value={formData.badge}
                    onChange={(e) => setFormData({ ...formData, badge: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                    maxLength={30}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Badge Color
                  </label>
                  <select
                    value={formData.badgeColor}
                    onChange={(e) => setFormData({ ...formData, badgeColor: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                  >
                    <option value="bg-green-500">Green</option>
                    <option value="bg-blue-500">Blue</option>
                    <option value="bg-red-500">Red</option>
                    <option value="bg-yellow-500">Yellow</option>
                    <option value="bg-purple-500">Purple</option>
                    <option value="bg-pink-500">Pink</option>
                    <option value="bg-indigo-500">Indigo</option>
                    <option value="bg-orange-500">Orange</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Order
                  </label>
                  <input
                    type="number"
                    value={formData.order}
                    onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) || 0 })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Priority
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: parseInt(e.target.value) || 1 })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
              </div>

              {/* Checkboxes */}
              <div className="flex space-x-6">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.visible}
                    onChange={(e) => setFormData({ ...formData, visible: e.target.checked })}
                    className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">Visible</span>
                </label>

                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.featured}
                    onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                    className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">Featured</span>
                </label>
              </div>

              {/* Organization Info */}
              <div className="border-t pt-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Organization Information (for external content)</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Organization Name
                    </label>
                    <input
                      type="text"
                      value={formData.organization.name}
                      onChange={(e) => setFormData({
                        ...formData,
                        organization: { ...formData.organization, name: e.target.value }
                      })}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Website
                    </label>
                    <input
                      type="url"
                      value={formData.organization.website}
                      onChange={(e) => setFormData({
                        ...formData,
                        organization: { ...formData.organization, website: e.target.value }
                      })}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Logo URL
                    </label>
                    <input
                      type="url"
                      value={formData.organization.logo}
                      onChange={(e) => setFormData({
                        ...formData,
                        organization: { ...formData.organization, logo: e.target.value }
                      })}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                  </div>
                </div>
              </div>

              {/* Form Actions */}
              <div className="flex justify-end space-x-4 pt-6 border-t">
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    setEditingAd(null);
                    resetForm();
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  {editingAd ? 'Update Advertisement' : 'Create Advertisement'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
} 
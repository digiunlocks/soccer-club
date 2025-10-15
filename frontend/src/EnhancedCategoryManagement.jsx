import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { Link } from 'react-router-dom';
import { FaPlus, FaEdit, FaTrash, FaSave, FaTimes, FaTag, FaList, FaDollarSign, FaClock, FaCog, FaChevronDown, FaChevronUp, FaArrowLeft } from 'react-icons/fa';

const EnhancedCategoryManagement = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  // Form states
  const [showCategoryForm, setShowCategoryForm] = useState(false);
  const [showSubcategoryForm, setShowSubcategoryForm] = useState(false);
  const [showSettingsForm, setShowSettingsForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [editingSubcategory, setEditingSubcategory] = useState(null);
  const [selectedCategoryId, setSelectedCategoryId] = useState(null);
  const [expandedCategory, setExpandedCategory] = useState(null);
  
  const [categoryForm, setCategoryForm] = useState({
    name: '',
    description: '',
    icon: '',
    color: '#3B82F6',
    isActive: true,
    sortOrder: 0
  });
  
  const [subcategoryForm, setSubcategoryForm] = useState({
    name: '',
    description: '',
    isActive: true
  });

  const [settingsForm, setSettingsForm] = useState({
    pricingSettings: {
      enabled: false,
      basePrice: 0,
      extensionPrice: 0,
      pricingTiers: []
    },
    expirationSettings: {
      enabled: false,
      defaultExpirationDays: 30,
      expirationWarningDays: 7,
      allowExtensions: true,
      extensionDays: 30,
      maxExtensionsAllowed: 3,
      autoExpireEnabled: true
    },
    freeListingSettings: {
      enabled: true,
      freeListingDuration: 30,
      freeListingsPerUser: 3
    },
    notificationSettings: {
      sendExpirationWarnings: true,
      sendExpiredNotifications: true
    }
  });

  const [newPricingTier, setNewPricingTier] = useState({
    name: '',
    duration: 30,
    price: 0,
    description: '',
    featured: false
  });

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/categories/admin', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.ok) {
        const data = await response.json();
        setCategories(data);
      } else {
        toast.error('Failed to load categories');
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
      toast.error('Error loading categories');
    } finally {
      setLoading(false);
    }
  };

  const handleCategorySubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    
    try {
      const token = localStorage.getItem('token');
      const url = editingCategory 
        ? `http://localhost:5000/api/categories/${editingCategory._id}`
        : 'http://localhost:5000/api/categories';
      
      const method = editingCategory ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(categoryForm)
      });
      
      if (response.ok) {
        toast.success(editingCategory ? 'Category updated!' : 'Category created!');
        await fetchCategories();
        resetCategoryForm();
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to save category');
      }
    } catch (error) {
      console.error('Error saving category:', error);
      toast.error('Error saving category');
    } finally {
      setSaving(false);
    }
  };

  const handleSettingsSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    
    try {
      const token = localStorage.getItem('token');
      
      // Update pricing settings
      await fetch(`http://localhost:5000/api/categories/${selectedCategoryId}/pricing`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ pricingSettings: settingsForm.pricingSettings })
      });
      
      // Update expiration settings
      await fetch(`http://localhost:5000/api/categories/${selectedCategoryId}/expiration`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ expirationSettings: settingsForm.expirationSettings })
      });
      
      // Update free listing settings
      await fetch(`http://localhost:5000/api/categories/${selectedCategoryId}/free-listings`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ freeListingSettings: settingsForm.freeListingSettings })
      });
      
      toast.success('Category settings updated!');
      await fetchCategories();
      resetSettingsForm();
    } catch (error) {
      console.error('Error saving settings:', error);
      toast.error('Error saving settings');
    } finally {
      setSaving(false);
    }
  };

  const handleAddPricingTier = async () => {
    if (!newPricingTier.name || newPricingTier.duration <= 0) {
      toast.error('Please fill in all required fields');
      return;
    }
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/categories/${selectedCategoryId}/pricing-tiers`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(newPricingTier)
      });
      
      if (response.ok) {
        toast.success('Pricing tier added!');
        await fetchCategories();
        setNewPricingTier({ name: '', duration: 30, price: 0, description: '', featured: false });
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to add pricing tier');
      }
    } catch (error) {
      console.error('Error adding pricing tier:', error);
      toast.error('Error adding pricing tier');
    }
  };

  const handleDeletePricingTier = async (tierId) => {
    if (!confirm('Are you sure you want to delete this pricing tier?')) return;
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/categories/${selectedCategoryId}/pricing-tiers/${tierId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.ok) {
        toast.success('Pricing tier deleted!');
        await fetchCategories();
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to delete pricing tier');
      }
    } catch (error) {
      console.error('Error deleting pricing tier:', error);
      toast.error('Error deleting pricing tier');
    }
  };

  const resetCategoryForm = () => {
    setCategoryForm({
      name: '',
      description: '',
      icon: '',
      color: '#3B82F6',
      isActive: true,
      sortOrder: 0
    });
    setEditingCategory(null);
    setShowCategoryForm(false);
  };

  const resetSubcategoryForm = () => {
    setSubcategoryForm({
      name: '',
      description: '',
      isActive: true
    });
    setEditingSubcategory(null);
    setShowSubcategoryForm(false);
    setSelectedCategoryId(null);
  };

  const resetSettingsForm = () => {
    setSettingsForm({
      pricingSettings: {
        enabled: false,
        basePrice: 0,
        extensionPrice: 0,
        pricingTiers: []
      },
      expirationSettings: {
        enabled: false,
        defaultExpirationDays: 30,
        expirationWarningDays: 7,
        allowExtensions: true,
        extensionDays: 30,
        maxExtensionsAllowed: 3,
        autoExpireEnabled: true
      },
      freeListingSettings: {
        enabled: true,
        freeListingDuration: 30,
        freeListingsPerUser: 3
      },
      notificationSettings: {
        sendExpirationWarnings: true,
        sendExpiredNotifications: true
      }
    });
    setShowSettingsForm(false);
    setSelectedCategoryId(null);
  };

  const startEditCategory = (category) => {
    setCategoryForm({
      name: category.name,
      description: category.description || '',
      icon: category.icon || '',
      color: category.color || '#3B82F6',
      isActive: category.isActive,
      sortOrder: category.sortOrder || 0
    });
    setEditingCategory(category);
    setShowCategoryForm(true);
  };

  const startEditSettings = (category) => {
    setSettingsForm({
      pricingSettings: category.pricingSettings || {
        enabled: false,
        basePrice: 0,
        extensionPrice: 0,
        pricingTiers: []
      },
      expirationSettings: category.expirationSettings || {
        enabled: false,
        defaultExpirationDays: 30,
        expirationWarningDays: 7,
        allowExtensions: true,
        extensionDays: 30,
        maxExtensionsAllowed: 3,
        autoExpireEnabled: true
      },
      freeListingSettings: category.freeListingSettings || {
        enabled: true,
        freeListingDuration: 30,
        freeListingsPerUser: 3
      },
      notificationSettings: category.notificationSettings || {
        sendExpirationWarnings: true,
        sendExpiredNotifications: true
      }
    });
    setSelectedCategoryId(category._id);
    setShowSettingsForm(true);
  };

  const toggleCategoryExpansion = (categoryId) => {
    setExpandedCategory(expandedCategory === categoryId ? null : categoryId);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-xl">Loading categories...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="container mx-auto px-4">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <button
                onClick={() => {
                  // Navigate to admin dashboard and automatically open marketplace section
                  window.location.href = '/admin?section=marketplace';
                }}
                className="flex items-center gap-2 px-3 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
                title="Back to Marketplace Management"
              >
                <FaArrowLeft />
                Back to Marketplace Management
              </button>
            </div>
            <div className="flex items-center gap-3">
              <FaTag className="text-3xl text-blue-600" />
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Enhanced Category Management</h2>
                <p className="text-sm text-gray-600">Manage categories with pricing, expiration, and extension controls</p>
              </div>
            </div>
            <button
              onClick={() => setShowCategoryForm(true)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <FaPlus />
              Add Category
            </button>
          </div>

          {/* Categories List */}
          <div className="space-y-4">
            {categories.map((category) => (
              <div key={category._id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => toggleCategoryExpansion(category._id)}
                      className="p-1 hover:bg-gray-100 rounded"
                    >
                      {expandedCategory === category._id ? <FaChevronUp /> : <FaChevronDown />}
                    </button>
                    <div 
                      className="w-4 h-4 rounded-full"
                      style={{ backgroundColor: category.color }}
                    ></div>
                    <h3 className="text-lg font-semibold text-gray-900">{category.name}</h3>
                    <span className="px-2 py-1 bg-gray-100 text-gray-600 text-sm rounded">
                      {category.itemCount} items
                    </span>
                    {!category.isActive && (
                      <span className="px-2 py-1 bg-red-100 text-red-600 text-sm rounded">
                        Inactive
                      </span>
                    )}
                    {category.pricingSettings?.enabled && (
                      <span className="px-2 py-1 bg-green-100 text-green-600 text-sm rounded">
                        <FaDollarSign className="inline mr-1" />
                        Pricing Enabled
                      </span>
                    )}
                    {category.expirationSettings?.enabled && (
                      <span className="px-2 py-1 bg-blue-100 text-blue-600 text-sm rounded">
                        <FaClock className="inline mr-1" />
                        Custom Expiration
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => startEditSettings(category)}
                      className="p-2 text-purple-600 hover:bg-purple-50 rounded"
                      title="Manage Settings"
                    >
                      <FaCog />
                    </button>
                    <button
                      onClick={() => startEditCategory(category)}
                      className="p-2 text-gray-600 hover:bg-gray-50 rounded"
                      title="Edit Category"
                    >
                      <FaEdit />
                    </button>
                  </div>
                </div>
                
                {category.description && (
                  <p className="text-gray-600 text-sm mb-3 ml-8">{category.description}</p>
                )}

                {/* Expanded Content */}
                {expandedCategory === category._id && (
                  <div className="ml-8 space-y-4">
                    {/* Pricing Settings Summary */}
                    {category.pricingSettings?.enabled && (
                      <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                        <h4 className="font-semibold text-green-800 mb-2 flex items-center gap-2">
                          <FaDollarSign />
                          Pricing Settings
                        </h4>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <strong>Base Price:</strong> ${category.pricingSettings.basePrice}
                          </div>
                          <div>
                            <strong>Extension Price:</strong> ${category.pricingSettings.extensionPrice}
                          </div>
                          <div className="col-span-2">
                            <strong>Pricing Tiers:</strong> {category.pricingSettings.pricingTiers?.length || 0} tiers
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Expiration Settings Summary */}
                    {category.expirationSettings?.enabled && (
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                        <h4 className="font-semibold text-blue-800 mb-2 flex items-center gap-2">
                          <FaClock />
                          Expiration Settings
                        </h4>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <strong>Default Duration:</strong> {category.expirationSettings.defaultExpirationDays} days
                          </div>
                          <div>
                            <strong>Warning Period:</strong> {category.expirationSettings.expirationWarningDays} days
                          </div>
                          <div>
                            <strong>Extensions:</strong> {category.expirationSettings.allowExtensions ? 'Enabled' : 'Disabled'}
                          </div>
                          <div>
                            <strong>Max Extensions:</strong> {category.expirationSettings.maxExtensionsAllowed}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Subcategories */}
                    {category.subcategories && category.subcategories.length > 0 && (
                      <div>
                        <h4 className="text-sm font-medium text-gray-700 mb-2">Subcategories:</h4>
                        <div className="space-y-2">
                          {category.subcategories.map((subcategory) => (
                            <div key={subcategory._id} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                              <div className="flex items-center gap-2">
                                <FaList className="text-gray-400" />
                                <span className="text-sm text-gray-900">{subcategory.name}</span>
                                {!subcategory.isActive && (
                                  <span className="px-1 py-0.5 bg-red-100 text-red-600 text-xs rounded">
                                    Inactive
                                  </span>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>

          {categories.length === 0 && (
            <div className="text-center py-12">
              <FaTag className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No Categories</h3>
              <p className="text-gray-600 mb-4">Create your first category to organize marketplace items</p>
              <button
                onClick={() => setShowCategoryForm(true)}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Add Category
              </button>
            </div>
          )}
        </div>

        {/* Category Form Modal */}
        {showCategoryForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">
                  {editingCategory ? 'Edit Category' : 'Add Category'}
                </h3>
                <button
                  onClick={resetCategoryForm}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <FaTimes />
                </button>
              </div>

              <form onSubmit={handleCategorySubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Category Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={categoryForm.name}
                    onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    placeholder="e.g., Soccer Equipment"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    value={categoryForm.description}
                    onChange={(e) => setCategoryForm({ ...categoryForm, description: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    rows="3"
                    placeholder="Brief description of this category"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Color
                  </label>
                  <input
                    type="color"
                    value={categoryForm.color}
                    onChange={(e) => setCategoryForm({ ...categoryForm, color: e.target.value })}
                    className="w-full h-10 border border-gray-300 rounded-md"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="isActive"
                    checked={categoryForm.isActive}
                    onChange={(e) => setCategoryForm({ ...categoryForm, isActive: e.target.checked })}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <label htmlFor="isActive" className="text-sm font-medium text-gray-700">
                    Active
                  </label>
                </div>

                <div className="flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={resetCategoryForm}
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 flex items-center gap-2"
                  >
                    <FaSave />
                    {saving ? 'Saving...' : (editingCategory ? 'Update' : 'Create')}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Settings Form Modal */}
        {showSettingsForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold">Category Settings & Pricing</h3>
                <button
                  onClick={resetSettingsForm}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <FaTimes />
                </button>
              </div>

              <form onSubmit={handleSettingsSubmit} className="space-y-8">
                {/* Pricing Settings */}
                <div className="border border-gray-200 rounded-lg p-4">
                  <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <FaDollarSign className="text-green-600" />
                    Pricing Settings
                  </h4>
                  
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id="pricingEnabled"
                        checked={settingsForm.pricingSettings.enabled}
                        onChange={(e) => setSettingsForm({
                          ...settingsForm,
                          pricingSettings: { ...settingsForm.pricingSettings, enabled: e.target.checked }
                        })}
                        className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
                      />
                      <label htmlFor="pricingEnabled" className="text-sm font-medium text-gray-700">
                        Enable custom pricing for this category
                      </label>
                    </div>

                    {settingsForm.pricingSettings.enabled && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 ml-6">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Base Price ($)
                          </label>
                          <input
                            type="number"
                            step="0.01"
                            min="0"
                            value={settingsForm.pricingSettings.basePrice}
                            onChange={(e) => setSettingsForm({
                              ...settingsForm,
                              pricingSettings: { ...settingsForm.pricingSettings, basePrice: parseFloat(e.target.value) }
                            })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Extension Price ($)
                          </label>
                          <input
                            type="number"
                            step="0.01"
                            min="0"
                            value={settingsForm.pricingSettings.extensionPrice}
                            onChange={(e) => setSettingsForm({
                              ...settingsForm,
                              pricingSettings: { ...settingsForm.pricingSettings, extensionPrice: parseFloat(e.target.value) }
                            })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Expiration Settings */}
                <div className="border border-gray-200 rounded-lg p-4">
                  <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <FaClock className="text-blue-600" />
                    Expiration Settings
                  </h4>
                  
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id="expirationEnabled"
                        checked={settingsForm.expirationSettings.enabled}
                        onChange={(e) => setSettingsForm({
                          ...settingsForm,
                          expirationSettings: { ...settingsForm.expirationSettings, enabled: e.target.checked }
                        })}
                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <label htmlFor="expirationEnabled" className="text-sm font-medium text-gray-700">
                        Enable custom expiration settings for this category
                      </label>
                    </div>

                    {settingsForm.expirationSettings.enabled && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 ml-6">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Default Expiration (days)
                          </label>
                          <input
                            type="number"
                            min="1"
                            max="365"
                            value={settingsForm.expirationSettings.defaultExpirationDays}
                            onChange={(e) => setSettingsForm({
                              ...settingsForm,
                              expirationSettings: { ...settingsForm.expirationSettings, defaultExpirationDays: parseInt(e.target.value) }
                            })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Warning Days
                          </label>
                          <input
                            type="number"
                            min="1"
                            max="30"
                            value={settingsForm.expirationSettings.expirationWarningDays}
                            onChange={(e) => setSettingsForm({
                              ...settingsForm,
                              expirationSettings: { ...settingsForm.expirationSettings, expirationWarningDays: parseInt(e.target.value) }
                            })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Extension Days
                          </label>
                          <input
                            type="number"
                            min="1"
                            max="90"
                            value={settingsForm.expirationSettings.extensionDays}
                            onChange={(e) => setSettingsForm({
                              ...settingsForm,
                              expirationSettings: { ...settingsForm.expirationSettings, extensionDays: parseInt(e.target.value) }
                            })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Max Extensions
                          </label>
                          <input
                            type="number"
                            min="0"
                            max="10"
                            value={settingsForm.expirationSettings.maxExtensionsAllowed}
                            onChange={(e) => setSettingsForm({
                              ...settingsForm,
                              expirationSettings: { ...settingsForm.expirationSettings, maxExtensionsAllowed: parseInt(e.target.value) }
                            })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={resetSettingsForm}
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:bg-gray-400 flex items-center gap-2"
                  >
                    <FaSave />
                    {saving ? 'Saving...' : 'Save Settings'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EnhancedCategoryManagement;

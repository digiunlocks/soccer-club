import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { API_BASE_URL } from './config/api';

const API_URL = `${API_BASE_URL}/hero-content`;

export default function HeroTextEditor() {
  const [heroItems, setHeroItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [form, setForm] = useState({
    caption: '',
    subtitle: '',
    buttonText: '',
    buttonLink: '',
    order: 0,
    visible: true
  });
  const [submitting, setSubmitting] = useState(false);

  const fetchHeroItems = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(API_URL, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      if (!response.ok) throw new Error('Failed to fetch hero items');
      const data = await response.json();
      setHeroItems(data);
    } catch (error) {
      toast.error('Failed to load hero items');
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHeroItems();
  }, []);

  const handleEditText = (item) => {
    setForm({
      caption: item.caption || '',
      subtitle: item.subtitle || '',
      buttonText: item.buttonText || '',
      buttonLink: item.buttonLink || '',
      order: item.order || 0,
      visible: item.visible !== undefined ? item.visible : true
    });
    setEditingItem(item);
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!editingItem) return;
    
    setSubmitting(true);
    try {
      const token = localStorage.getItem("token");
      
      const response = await fetch(`${API_URL}/${editingItem._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(form)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update hero text');
      }

      toast.success('Hero text updated successfully!');
      setEditingItem(null);
      await fetchHeroItems();
    } catch (error) {
      toast.error(error.message);
      console.error('Error:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = () => {
    setEditingItem(null);
    setForm({
      caption: '',
      subtitle: '',
      buttonText: '',
      buttonLink: '',
      order: 0,
      visible: true
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-2 flex items-center">
          <svg className="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
          </svg>
          Hero Text Content Manager
        </h2>
        <p className="text-gray-600">Edit text overlays, captions, and call-to-action buttons for your hero images and videos.</p>
      </div>

      {/* Hero Items List */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Current Hero Items</h3>
        
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-2 text-gray-600">Loading hero items...</span>
          </div>
        ) : (
          <div className="space-y-4">
            {heroItems.map((item, index) => (
              <div key={item._id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    {/* Media Preview */}
                    <div className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                      {item.type === 'video' ? (
                        <video 
                          src={item.url} 
                          className="w-full h-full object-cover"
                          muted
                        />
                      ) : (
                        <img 
                          src={item.url} 
                          alt="Hero content"
                          className="w-full h-full object-cover"
                        />
                      )}
                    </div>
                    
                    {/* Item Info */}
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h4 className="font-medium text-gray-800">
                          {item.caption || `Hero Item ${index + 1}`}
                        </h4>
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          item.visible ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                        }`}>
                          {item.visible ? 'Visible' : 'Hidden'}
                        </span>
                        <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">
                          Order: {item.order}
                        </span>
                      </div>
                      
                      {/* Current Text Preview */}
                      <div className="space-y-1">
                        {item.subtitle && (
                          <p className="text-sm text-gray-600">{item.subtitle}</p>
                        )}
                        {item.buttonText && (
                          <p className="text-sm text-blue-600 font-medium">
                            Button: {item.buttonText} {item.buttonLink && `→ ${item.buttonLink}`}
                          </p>
                        )}
                        {!item.caption && !item.subtitle && !item.buttonText && (
                          <p className="text-sm text-gray-500 italic">No text content added</p>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  {/* Edit Button */}
                  <button
                    onClick={() => handleEditText(item)}
                    className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                    <span>Edit Text</span>
                  </button>
                </div>
              </div>
            ))}
            
            {heroItems.length === 0 && (
              <div className="text-center py-12 text-gray-500">
                <svg className="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <p className="text-lg font-medium mb-2">No Hero Items Found</p>
                <p className="text-sm">Upload some images or videos first in the Hero Media Management section.</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Text Editor Modal */}
      {editingItem && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">Edit Hero Text Content</h3>
                <button
                  onClick={handleCancel}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Current Media Preview */}
              <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-4">
                  <div className="w-20 h-20 bg-gray-200 rounded-lg overflow-hidden">
                    {editingItem.type === 'video' ? (
                      <video 
                        src={editingItem.url} 
                        className="w-full h-full object-cover"
                        muted
                      />
                    ) : (
                      <img 
                        src={editingItem.url} 
                        alt="Hero content"
                        className="w-full h-full object-cover"
                      />
                    )}
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Editing text for:</p>
                    <p className="font-medium text-gray-900">
                      {editingItem.type === 'video' ? 'Video Content' : 'Image Content'}
                    </p>
                  </div>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Caption/Title */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Main Caption/Title *
                  </label>
                  <input
                    type="text"
                    name="caption"
                    value={form.caption}
                    onChange={handleChange}
                    placeholder="e.g., Welcome to Seattle Leopards FC"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">This will appear as the main headline over the hero image</p>
                </div>

                {/* Subtitle */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Subtitle (Optional)
                  </label>
                  <input
                    type="text"
                    name="subtitle"
                    value={form.subtitle}
                    onChange={handleChange}
                    placeholder="e.g., Join the Best Youth Soccer Club in Seattle"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <p className="text-xs text-gray-500 mt-1">Additional text that appears below the main caption</p>
                </div>

                {/* Button Text and Link */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Button Text (Optional)
                    </label>
                    <input
                      type="text"
                      name="buttonText"
                      value={form.buttonText}
                      onChange={handleChange}
                      placeholder="e.g., Join Now"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Button Link (Optional)
                    </label>
                    <input
                      type="text"
                      name="buttonLink"
                      value={form.buttonLink}
                      onChange={handleChange}
                      placeholder="e.g., /join/player"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                {/* Display Order and Visibility */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Display Order
                    </label>
                    <input
                      type="number"
                      name="order"
                      value={form.order}
                      onChange={handleChange}
                      min="0"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <p className="text-xs text-gray-500 mt-1">0 = first, higher numbers = later</p>
                  </div>
                  <div className="flex items-center space-x-2 pt-6">
                    <input
                      type="checkbox"
                      name="visible"
                      checked={form.visible}
                      onChange={handleChange}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label className="text-sm font-medium text-gray-700">
                      Visible on website
                    </label>
                  </div>
                </div>

                {/* Preview */}
                <div className="p-4 bg-gray-50 rounded-lg">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Preview:</h4>
                  <div className="space-y-2">
                    {form.caption && (
                      <div className="text-lg font-bold text-gray-900">{form.caption}</div>
                    )}
                    {form.subtitle && (
                      <div className="text-sm text-gray-600">{form.subtitle}</div>
                    )}
                    {form.buttonText && (
                      <div className="pt-2">
                        <span className="inline-block bg-green-600 text-white px-4 py-2 rounded-md text-sm">
                          {form.buttonText}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex space-x-3 pt-4">
                  <button
                    type="submit"
                    disabled={submitting}
                    className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {submitting ? (
                      <span className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Updating...
                      </span>
                    ) : (
                      'Update Text Content'
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={handleCancel}
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


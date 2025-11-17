import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from 'react-toastify';
import HeroTextSettingsManager from './HeroTextSettingsManager';

const API_URL = "http://localhost:5000/api/hero-content";
const UPLOAD_URL = `${API_URL}/upload`;
const BASE_URL = "http://localhost:5000";

export default function BrandingManager() {
  const navigate = useNavigate();
  const [heroItems, setHeroItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [activeTab, setActiveTab] = useState('hero-text');
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ 
    mediaType: "image", // image, video, slideshow
    url: "", 
    caption: "",
    subtitle: "",
    buttonText: "",
    buttonLink: "",
    visible: true, 
    order: 0, 
    slideshowInterval: 5000,
    transitionEffect: "fade", // fade, slide, zoom
    autoplay: true,
    showControls: true
  });
  const [editing, setEditing] = useState(null);
  const [logoFile, setLogoFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState(null);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [currentLogo, setCurrentLogo] = useState(null);

  const fetchHeroItems = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(API_URL, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error("Failed to fetch hero content");
      const data = await res.json();
      setHeroItems(data);
    } catch (err) {
      setError(err.message);
      toast.error("Failed to load hero content");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { 
    fetchHeroItems();
    fetchCurrentLogo();
  }, []);

  const fetchCurrentLogo = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/settings/public');
      if (response.ok) {
        const data = await response.json();
        if (data.logoUrl) {
          const fullUrl = data.logoUrl.startsWith('http') 
            ? data.logoUrl 
            : `http://localhost:5000${data.logoUrl}`;
          setCurrentLogo(fullUrl);
        }
      }
    } catch (error) {
      console.error('Error fetching logo:', error);
    }
  };

  const handleLogoChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file size (2MB limit)
    if (file.size > 2 * 1024 * 1024) {
      toast.error("File size must be less than 2MB");
      return;
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/svg+xml'];
    if (!allowedTypes.includes(file.type)) {
      toast.error("Please upload a PNG, JPG, or SVG file");
      return;
    }

    setLogoFile(file);
    
    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setLogoPreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleLogoUpload = async () => {
    if (!logoFile) {
      toast.error("Please select a logo file");
      return;
    }

    try {
      setUploadingLogo(true);
      const formData = new FormData();
      formData.append('logo', logoFile);

      const token = localStorage.getItem("token");
      if (!token) {
        toast.error("Authentication required. Please log in.");
        navigate("/login");
        return;
      }

      const response = await fetch("http://localhost:5000/api/settings/upload-logo", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (response.status === 401) {
        toast.error("Invalid token. Please log in again.");
        localStorage.removeItem("token");
        navigate("/login");
        return;
      }

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || data.message || "Failed to upload logo");
      }

      const data = await response.json();
      const fullLogoUrl = data.logoUrl.startsWith('http') 
        ? data.logoUrl 
        : `http://localhost:5000${data.logoUrl}`;
      
      setCurrentLogo(fullLogoUrl);
      setLogoFile(null);
      setLogoPreview(null);
      
      toast.success("Logo uploaded successfully! It will appear on your site shortly.");
      
      // Refresh the page after 2 seconds to show the new logo
      setTimeout(() => {
        window.location.reload();
      }, 2000);
    } catch (error) {
      console.error("Logo upload error:", error);
      toast.error(error.message || "Failed to upload logo");
    } finally {
      setUploadingLogo(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    let newValue;
    if (type === "checkbox") {
      newValue = checked;
    } else if (type === "range") {
      newValue = parseInt(value);
    } else {
      newValue = value;
    }
    
    setForm((prev) => ({ ...prev, [name]: newValue }));
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    setUploadProgress(0);

    const formData = new FormData();
    formData.append('file', file);

    const xhr = new XMLHttpRequest();

    xhr.upload.addEventListener('progress', (e) => {
      if (e.lengthComputable) {
        const percentComplete = (e.loaded / e.total) * 100;
        setUploadProgress(percentComplete);
      }
    });

    xhr.onload = () => {
      setUploading(false);
      if (xhr.status === 200) {
        const { url } = JSON.parse(xhr.responseText);
        const fullUrl = BASE_URL + url;
        console.log('Upload successful. URL:', url, 'Full URL:', fullUrl);
        setForm((prev) => ({ ...prev, url: fullUrl }));
        toast.success("File uploaded successfully!");
      } else {
        toast.error("Upload failed");
      }
    };

    xhr.onerror = () => {
      setUploading(false);
      toast.error("Upload failed");
    };

    const token = localStorage.getItem("token");
    xhr.open('POST', UPLOAD_URL);
    xhr.setRequestHeader('Authorization', `Bearer ${token}`);
    xhr.send(formData);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    
    try {
      const token = localStorage.getItem("token");
      
      // Prepare data to send
      let dataToSend;
      
      if (editing) {
        // When editing, only send the fields that have changed or are provided
        dataToSend = {};
        
        // Always include these fields when editing
        if (form.caption !== undefined) dataToSend.caption = form.caption;
        if (form.subtitle !== undefined) dataToSend.subtitle = form.subtitle;
        if (form.buttonText !== undefined) dataToSend.buttonText = form.buttonText;
        if (form.buttonLink !== undefined) dataToSend.buttonLink = form.buttonLink;
        if (form.order !== undefined) dataToSend.order = form.order;
        if (form.visible !== undefined) dataToSend.visible = form.visible;
        if (form.slideshowInterval !== undefined) dataToSend.slideshowInterval = form.slideshowInterval;
        if (form.transitionEffect !== undefined) dataToSend.transitionEffect = form.transitionEffect;
        if (form.autoplay !== undefined) dataToSend.autoplay = form.autoplay;
        if (form.showControls !== undefined) dataToSend.showControls = form.showControls;
        
        // Only include media fields if they're provided and not empty
        if (form.url && form.url.trim() !== '') {
          dataToSend.url = form.url;
        }
        if (form.mediaType && form.mediaType.trim() !== '') {
          dataToSend.mediaType = form.mediaType;
        }
        
        console.log('Editing - sending data:', dataToSend);
      } else {
        // When creating new, require all necessary fields
        if (!form.url || form.url.trim() === '') {
          throw new Error("Please upload a media file before adding the hero item");
        }
        
        dataToSend = {
          ...form,
          type: form.mediaType === 'video' ? 'video' : 'image' // Map mediaType to type
        };
        
        console.log('Creating new - sending data:', dataToSend);
      }
      
      const res = await fetch(editing ? `${API_URL}/${editing}` : API_URL, {
        method: editing ? "PUT" : "POST",
        headers: { 
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(dataToSend),
      });
      
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to save hero content");
      }
      
      setForm({ mediaType: "image", url: "", caption: "", subtitle: "", buttonText: "", buttonLink: "", visible: true, order: 0, slideshowInterval: 5000, transitionEffect: "fade", autoplay: true, showControls: true });
      setEditing(null);
      await fetchHeroItems();
      toast.success(editing ? "Hero content updated!" : "Hero content added!");
    } catch (err) {
      setError(err.message);
      toast.error(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (item) => {
    const formData = {
      mediaType: item.type || item.mediaType || "image",
      url: item.url,
      caption: item.caption || "",
      subtitle: item.subtitle || "",
      buttonText: item.buttonText || "",
      buttonLink: item.buttonLink || "",
      visible: item.visible,
      order: item.order || 0,
      slideshowInterval: item.slideshowInterval || 5000,
      transitionEffect: item.transitionEffect || "fade",
      autoplay: item.autoplay !== undefined ? item.autoplay : true,
      showControls: item.showControls !== undefined ? item.showControls : true,
    };
    setForm(formData);
    setEditing(item._id);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this hero item?")) return;
    
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_URL}/${id}`, { 
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (!res.ok) throw new Error("Failed to delete hero content");
      
      await fetchHeroItems();
      toast.success("Hero content deleted!");
    } catch (err) {
      toast.error("Failed to delete hero content");
    }
  };

  const handleToggleVisibility = async (item) => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_URL}/${item._id}`, {
        method: "PUT",
        headers: { 
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ ...item, visible: !item.visible }),
      });
      
      if (!res.ok) throw new Error("Failed to update visibility");
      
      await fetchHeroItems();
      toast.success(`Hero content ${!item.visible ? 'made visible' : 'hidden'}!`);
    } catch (err) {
      toast.error("Failed to update visibility");
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-green-900 mb-2">Branding Management</h1>
          <p className="text-gray-600">Manage your website's branding including hero images, logos, and visual identity</p>
        </div>
        <button
          onClick={() => navigate(-1)}
          className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 transition-colors flex items-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back
        </button>
      </div>

      {/* Tab Navigation */}
      <div className="mb-6">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('hero-text')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'hero-text'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <svg className="w-4 h-4 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
              </svg>
              Global Hero Text
            </button>
            <button
              onClick={() => setActiveTab('hero-media')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'hero-media'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <svg className="w-4 h-4 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              Hero Media Upload
            </button>
            <button
              onClick={() => setActiveTab('branding')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'branding'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <svg className="w-4 h-4 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zM21 5a2 2 0 00-2-2h-4a2 2 0 00-2 2v12a4 4 0 004 4h4a2 2 0 002-2V5z" />
              </svg>
              Site Branding
            </button>
          </nav>
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === 'hero-text' && <HeroTextSettingsManager />}
      
      {activeTab === 'hero-media' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Hero Section Management */}
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
              <svg className="w-5 h-5 mr-2 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              Hero Section
            </h2>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Content Type</label>
                <select 
                  name="mediaType" 
                  value={form.mediaType} 
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  <option value="image">Single Image</option>
                  <option value="video">Video Content</option>
                  <option value="slideshow">Image Slideshow</option>
                </select>
                <p className="text-xs text-gray-500 mt-1">
                  {form.mediaType === 'image' && 'Static image display'}
                  {form.mediaType === 'video' && 'Video player with controls'}
                  {form.mediaType === 'slideshow' && 'Multiple images with transitions'}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {editing ? 
                    (form.mediaType === 'slideshow' ? 'Replace Images (Optional)' : 'Replace Media (Optional)') :
                    (form.mediaType === 'slideshow' ? 'Upload Multiple Images' : 'Upload Media')
                  }
                </label>
                <div className="flex items-center space-x-2">
                  <input
                    type="file"
                    accept={form.mediaType === 'video' ? 'video/*' : 'image/*'}
                    multiple={form.mediaType === 'slideshow'}
                    onChange={handleFileChange}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                  {uploading && (
                    <div className="text-sm text-green-600">
                      {Math.round(uploadProgress)}%
                    </div>
                  )}
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  {editing ? 'Leave empty to keep current media' :
                   form.mediaType === 'slideshow' ? 'Select multiple images for slideshow' : 
                   form.mediaType === 'video' ? 'Select a video file' : 
                   'Select an image file'}
                </p>
                {form.url && (
                  <div className="mt-2">
                    {form.mediaType === 'video' ? (
                      <video 
                        src={form.url} 
                        controls 
                        className="w-32 h-20 object-cover rounded border"
                      />
                    ) : (
                      <img 
                        src={form.url} 
                        alt="Preview" 
                        className="w-20 h-20 object-cover rounded border"
                      />
                    )}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Caption/Title (Main Headline)</label>
                <input
                  type="text"
                  name="caption"
                  value={form.caption}
                  onChange={handleChange}
                  placeholder="e.g., Welcome to Seattle Leopards FC"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                />
                <p className="text-xs text-gray-500 mt-1">This will appear as the main headline over the hero image</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Subtitle (Optional)</label>
                <input
                  type="text"
                  name="subtitle"
                  value={form.subtitle || ''}
                  onChange={handleChange}
                  placeholder="e.g., Join the Best Youth Soccer Club in Seattle"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                />
                <p className="text-xs text-gray-500 mt-1">Additional text that appears below the main caption</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Button Text (Optional)</label>
                  <input
                    type="text"
                    name="buttonText"
                    value={form.buttonText || ''}
                    onChange={handleChange}
                    placeholder="e.g., Join Now"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Button Link (Optional)</label>
                  <input
                    type="text"
                    name="buttonLink"
                    value={form.buttonLink || ''}
                    onChange={handleChange}
                    placeholder="e.g., /join/player or https://..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Display Order</label>
                <input
                  type="number"
                  name="order"
                  value={form.order}
                  onChange={handleChange}
                  min="0"
                  placeholder="0 = first, higher numbers = later"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>

              {/* Advanced Settings */}
              {(form.mediaType === 'slideshow' || form.mediaType === 'video') && (
                <div className="border-t pt-4">
                  <h4 className="text-sm font-semibold text-gray-700 mb-3">Advanced Settings</h4>
                  
                  {form.mediaType === 'slideshow' && (
                    <>
                      <div className="mb-3">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Slideshow Speed: {form.slideshowInterval}ms
                        </label>
                        <input
                          type="range"
                          name="slideshowInterval"
                          value={form.slideshowInterval}
                          onChange={handleChange}
                          min="1000"
                          max="30000"
                          step="1000"
                          className="w-full"
                        />
                        <div className="flex justify-between text-xs text-gray-500 mt-1">
                          <span>Fast (1s)</span>
                          <span>Slow (30s)</span>
                        </div>
                      </div>

                      <div className="mb-3">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Transition Effect</label>
                        <select 
                          name="transitionEffect" 
                          value={form.transitionEffect} 
                          onChange={handleChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                        >
                          <option value="fade">Fade In/Out</option>
                          <option value="slide">Slide Left</option>
                          <option value="slideRight">Slide Right</option>
                          <option value="zoom">Zoom In/Out</option>
                          <option value="flip">Flip Effect</option>
                        </select>
                      </div>

                      <div className="mb-3">
                        <label className="flex items-center">
                          <input
                            type="checkbox"
                            name="autoplay"
                            checked={form.autoplay}
                            onChange={handleChange}
                            className="h-4 w-4 text-green-600 rounded border-gray-300"
                          />
                          <span className="ml-2 text-sm text-gray-700">Auto-play slideshow</span>
                        </label>
                      </div>

                      <div className="mb-3">
                        <label className="flex items-center">
                          <input
                            type="checkbox"
                            name="showControls"
                            checked={form.showControls}
                            onChange={handleChange}
                            className="h-4 w-4 text-green-600 rounded border-gray-300"
                          />
                          <span className="ml-2 text-sm text-gray-700">Show navigation controls</span>
                        </label>
                      </div>
                    </>
                  )}

                  {form.mediaType === 'video' && (
                    <>
                      <div className="mb-3">
                        <label className="flex items-center">
                          <input
                            type="checkbox"
                            name="autoplay"
                            checked={form.autoplay}
                            onChange={handleChange}
                            className="h-4 w-4 text-green-600 rounded border-gray-300"
                          />
                          <span className="ml-2 text-sm text-gray-700">Auto-play video (muted)</span>
                        </label>
                      </div>

                      <div className="mb-3">
                        <label className="flex items-center">
                          <input
                            type="checkbox"
                            name="showControls"
                            checked={form.showControls}
                            onChange={handleChange}
                            className="h-4 w-4 text-green-600 rounded border-gray-300"
                          />
                          <span className="ml-2 text-sm text-gray-700">Show video controls</span>
                        </label>
                      </div>
                    </>
                  )}
                </div>
              )}

              <div className="flex items-center">
                <input 
                  type="checkbox" 
                  name="visible" 
                  checked={form.visible} 
                  onChange={handleChange}
                  className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                />
                <label className="ml-2 block text-sm text-gray-900">Visible on website</label>
              </div>

              <div className="flex gap-3 flex-wrap">
                <button 
                  type="submit" 
                  disabled={submitting || (!editing && !form.url)}
                  className={`font-semibold py-2 px-6 rounded-md transition-colors ${
                    editing 
                      ? 'bg-blue-600 text-white hover:bg-blue-700' 
                      : 'bg-green-600 text-white hover:bg-green-700'
                  } ${submitting || (!editing && !form.url) ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  {submitting ? (
                    <span className="flex items-center gap-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      {editing ? "Updating..." : "Adding..."}
                    </span>
                  ) : (
                    editing ? "Update Hero Item" : "Add Hero Item"
                  )}
                </button>
                
                <button 
                  type="button"
                  onClick={() => window.open('/', '_blank')}
                  className="font-semibold py-2 px-6 rounded-md transition-colors bg-purple-600 text-white hover:bg-purple-700"
                >
                  Preview Homepage
                </button>
                
                {editing && (
                  <button 
                    type="button"
                    disabled={submitting}
                    onClick={() => {
                      setEditing(null);
                      setForm({ mediaType: "image", url: "", caption: "", subtitle: "", buttonText: "", buttonLink: "", visible: true, order: 0, slideshowInterval: 5000, transitionEffect: "fade", autoplay: true, showControls: true });
                    }}
                    className={`font-semibold py-2 px-6 rounded-md transition-colors ${
                      submitting ? 'bg-gray-400 cursor-not-allowed' : 'bg-gray-500 hover:bg-gray-600'
                    } text-white`}
                  >
                    Cancel Edit
                  </button>
                )}
              </div>
              
              {!editing && !form.url && (
                <p className="text-sm text-orange-600 mt-2 flex items-center">
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                  Please upload a media file before adding the hero item
                </p>
              )}
              {editing && (
                <div className="bg-blue-50 border border-blue-200 rounded-md p-3 mt-2">
                  <p className="text-sm text-blue-700 flex items-center">
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="font-semibold">Edit Mode:</span> You can update text fields without uploading new media. The existing image/video will remain unchanged.
                  </p>
                </div>
              )}
            </form>
          </div>

          {/* Site Branding Settings */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
              <svg className="w-5 h-5 mr-2 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zM21 5a2 2 0 00-2-2h-4a2 2 0 00-2 2v12a4 4 0 004 4h4a2 2 0 002-2V5z" />
              </svg>
              Site Branding
            </h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Site Name</label>
                <input
                  type="text"
                  defaultValue="Soccer Club"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Site Tagline</label>
                <input
                  type="text"
                  defaultValue="Building Champions, Creating Memories"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Primary Color</label>
                <div className="flex items-center space-x-2">
                  <input
                    type="color"
                    defaultValue="#15803d"
                    className="w-12 h-8 border border-gray-300 rounded cursor-pointer"
                  />
                  <span className="text-sm text-gray-600">Green</span>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Site Logo Upload</label>
                
                {/* Current Logo Preview */}
                {currentLogo && (
                  <div className="mb-3">
                    <p className="text-sm text-gray-600 mb-2">Current Logo:</p>
                    <div className="w-32 h-32 border-2 border-gray-300 rounded-lg p-2 bg-gray-50">
                      <img 
                        src={currentLogo} 
                        alt="Current Logo" 
                        className="w-full h-full object-contain"
                      />
                    </div>
                  </div>
                )}
                
                {/* New Logo Preview */}
                {logoPreview && (
                  <div className="mb-3">
                    <p className="text-sm text-green-600 font-medium mb-2">New Logo Preview:</p>
                    <div className="w-32 h-32 border-2 border-green-500 rounded-lg p-2 bg-green-50">
                      <img 
                        src={logoPreview} 
                        alt="Logo Preview" 
                        className="w-full h-full object-contain"
                      />
                    </div>
                  </div>
                )}
                
                {/* File Input */}
                <div className="flex items-center gap-3">
                  <input
                    type="file"
                    accept="image/png,image/jpeg,image/jpg,image/svg+xml"
                    onChange={handleLogoChange}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                  <button
                    type="button"
                    onClick={handleLogoUpload}
                    disabled={!logoFile || uploadingLogo}
                    className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed whitespace-nowrap"
                  >
                    {uploadingLogo ? "Uploading..." : "Upload Logo"}
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-1">PNG, JPG, or SVG • Max 2MB • Will be resized to 200x200px</p>
              </div>
            </div>
            
            <div className="mt-6">
              <button className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition-colors">
                Save Branding Settings
              </button>
            </div>
          </div>
        </div>

        {/* Current Hero Items */}
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                <svg className="w-5 h-5 mr-2 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
                Current Hero Items ({heroItems.length})
              </h2>
              <div className="flex gap-2">
                <button 
                  onClick={() => window.open('/', '_blank')}
                  className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors text-sm flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                  Preview Live
                </button>
                <button 
                  onClick={fetchHeroItems}
                  className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors text-sm flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  Refresh
                </button>
              </div>
            </div>
            
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
              <p className="text-sm text-blue-800">
                <strong>💡 Tip:</strong> Add hero items above, then use "Preview Homepage" to see them live. 
                Changes are saved automatically when you add/update items.
              </p>
            </div>
            
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto"></div>
                <p className="mt-2 text-gray-600">Loading...</p>
              </div>
            ) : error ? (
              <div className="text-center py-8">
                <p className="text-red-600">Error: {error}</p>
                <button 
                  onClick={fetchHeroItems}
                  className="mt-2 text-green-600 hover:text-green-700"
                >
                  Try Again
                </button>
              </div>
            ) : heroItems.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-600">No hero items found. Add some to get started!</p>
              </div>
            ) : (
              <div className="space-y-3">
                {heroItems.map((item) => (
                  <div key={item._id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        {(item.type === 'image' || item.mediaType === 'image') ? (
                          <img 
                            src={item.url} 
                            alt={item.caption || 'Hero image'} 
                            className="w-16 h-16 object-cover rounded border"
                          />
                        ) : (item.type === 'video' || item.mediaType === 'video') ? (
                          <video 
                            src={item.url} 
                            className="w-16 h-16 object-cover rounded border"
                            muted
                          />
                        ) : (
                          <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-purple-500 rounded border flex items-center justify-center">
                            <span className="text-white text-xs font-bold">Slideshow</span>
                          </div>
                        )}
                        <div>
                          <p className="font-medium text-gray-900">
                            {item.caption || `${item.type || item.mediaType} (Order: ${item.order})`}
                          </p>
                          <p className="text-sm text-gray-600">
                            {item.transitionEffect && `Effect: ${item.transitionEffect}`} • {item.visible ? 'Visible' : 'Hidden'}
                            {item.slideshowInterval && ` • ${item.slideshowInterval}ms`}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleToggleVisibility(item)}
                          className={`px-2 py-1 text-xs rounded ${
                            item.visible 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-gray-100 text-gray-800'
                          }`}
                        >
                          {item.visible ? 'Visible' : 'Hidden'}
                        </button>
                        <button
                          onClick={() => handleEdit(item)}
                          className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded hover:bg-blue-200"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(item._id)}
                          className="px-2 py-1 text-xs bg-red-100 text-red-800 rounded hover:bg-red-200"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
              <svg className="w-5 h-5 mr-2 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              Quick Actions
            </h2>
            
            <div className="space-y-3">
              <button 
                onClick={() => window.open('/', '_blank')}
                className="w-full text-left p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center">
                  <svg className="w-4 h-4 mr-3 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                  Preview Homepage
                </div>
              </button>
              
              <button 
                onClick={fetchHeroItems}
                className="w-full text-left p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center">
                  <svg className="w-4 h-4 mr-3 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  Refresh Hero Items
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>
      )}
      
      {activeTab === 'branding' && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
            <svg className="w-5 h-5 mr-2 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zM21 5a2 2 0 00-2-2h-4a2 2 0 00-2 2v12a4 4 0 004 4h4a2 2 0 002-2V5z" />
            </svg>
            Site Branding Settings
          </h2>
          
          <form className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Site Name</label>
              <input
                type="text"
                defaultValue="Soccer Club"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Site Tagline</label>
              <input
                type="text"
                defaultValue="Building Champions, Creating Memories"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Primary Color</label>
              <div className="flex items-center space-x-3">
                <input
                  type="color"
                  defaultValue="#4CAF50"
                  className="w-12 h-10 border border-gray-300 rounded cursor-pointer"
                />
                <span className="text-sm text-gray-600">Green</span>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Site Logo Upload</label>
              
              {/* Current Logo Preview */}
              {currentLogo && (
                <div className="mb-3">
                  <p className="text-sm text-gray-600 mb-2">Current Logo:</p>
                  <div className="w-32 h-32 border-2 border-gray-300 rounded-lg p-2 bg-gray-50">
                    <img 
                      src={currentLogo} 
                      alt="Current Logo" 
                      className="w-full h-full object-contain"
                    />
                  </div>
                </div>
              )}
              
              {/* New Logo Preview */}
              {logoPreview && (
                <div className="mb-3">
                  <p className="text-sm text-green-600 font-medium mb-2">New Logo Preview:</p>
                  <div className="w-32 h-32 border-2 border-green-500 rounded-lg p-2 bg-green-50">
                    <img 
                      src={logoPreview} 
                      alt="Logo Preview" 
                      className="w-full h-full object-contain"
                    />
                  </div>
                </div>
              )}
              
              {/* File Input */}
              <div className="flex items-center gap-3">
                <input
                  type="file"
                  accept="image/png,image/jpeg,image/jpg,image/svg+xml"
                  onChange={handleLogoChange}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                />
                <button
                  type="button"
                  onClick={handleLogoUpload}
                  disabled={!logoFile || uploadingLogo}
                  className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed whitespace-nowrap"
                >
                  {uploadingLogo ? "Uploading..." : "Upload Logo"}
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-1">PNG, JPG, or SVG • Max 2MB • Will be resized to 200x200px</p>
            </div>
            
            <button
              type="submit"
              className="w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 transition-colors"
            >
              Save Branding Settings
            </button>
          </form>
        </div>
      )}
    </div>
  );
}

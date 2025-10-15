import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from 'react-toastify';

const API_URL = "http://localhost:5000/api/hero-content";
const UPLOAD_URL = `${API_URL}/upload`;
const BASE_URL = "http://localhost:5000";

export default function SuperAdminHeroManager() {
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [form, setForm] = useState({ type: "image", url: "", caption: "", displayMode: "slideshow", visible: true, order: 0, slideshowInterval: 5000 });
  const [editing, setEditing] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [submitting, setSubmitting] = useState(false);

  const fetchItems = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(API_URL, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error("Failed to fetch hero content");
    const data = await res.json();
    setItems(data);
    } catch (err) {
      setError(err.message);
      toast.error("Failed to load hero content");
    } finally {
    setLoading(false);
    }
  };

  useEffect(() => { fetchItems(); }, []);

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
    setError("");
    
    const formData = new FormData();
    formData.append("file", file);
    
    try {
      const token = localStorage.getItem("token");
      const xhr = new XMLHttpRequest();
      xhr.open("POST", UPLOAD_URL);
      xhr.setRequestHeader("Authorization", `Bearer ${token}`);
      
      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          setUploadProgress(Math.round((event.loaded / event.total) * 100));
        }
      };
      
      xhr.onload = () => {
        setUploading(false);
        if (xhr.status === 200) {
          const { url } = JSON.parse(xhr.responseText);
          const fullUrl = BASE_URL + url;
          console.log('Upload successful. URL:', url, 'Full URL:', fullUrl);
          setForm((prev) => ({ ...prev, url: fullUrl }));
          toast.success("File uploaded successfully!");
        } else {
          setError("Upload failed");
          toast.error("File upload failed");
        }
      };
      
      xhr.onerror = () => {
        setUploading(false);
        setError("Upload failed");
        toast.error("File upload failed");
      };
      
      xhr.send(formData);
    } catch (err) {
      setUploading(false);
      setError("Upload failed");
      toast.error("File upload failed");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(editing ? `${API_URL}/${editing}` : API_URL, {
        method: editing ? "PUT" : "POST",
        headers: { 
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(form),
      });
      
      if (!res.ok) throw new Error("Failed to save hero content");
      
      setForm({ type: "image", url: "", caption: "", displayMode: "slideshow", visible: true, order: 0, slideshowInterval: 5000 });
      setEditing(null);
      await fetchItems();
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
      type: item.type,
      url: item.url,
      caption: item.caption || "",
      displayMode: item.displayMode || "slideshow",
      visible: item.visible,
      order: item.order || 0,
      slideshowInterval: item.slideshowInterval || 5000,
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
      
      await fetchItems();
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
      
      await fetchItems();
      toast.success(`Hero content ${!item.visible ? 'made visible' : 'hidden'}!`);
    } catch (err) {
      toast.error("Failed to update visibility");
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Header with Back Button */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-green-900 mb-2">Hero Section Manager</h1>
          <p className="text-gray-600">Manage the main hero section content for your website</p>
        </div>
        <button
          onClick={() => navigate('/admin')}
          className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 transition-colors flex items-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to Dashboard
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Add/Edit Form */}
                 <div className={`rounded-lg shadow-md p-6 ${
           editing ? 'bg-blue-50 border-2 border-blue-200' : 'bg-white'
         }`}>
                       <h2 className={`text-xl font-semibold mb-4 ${
              editing ? 'text-blue-800' : 'text-green-800'
            }`}>
              {editing ? "Edit Hero Content" : "Add New Hero Content"}
            </h2>
            

          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Content Type</label>
                <select 
                  name="type" 
                  value={form.type} 
                  onChange={handleChange} 
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                >
            <option value="image">Image</option>
            <option value="video">Video</option>
          </select>
        </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Display Mode</label>
                <select 
                  name="displayMode" 
                  value={form.displayMode} 
                  onChange={handleChange} 
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                >
            <option value="slideshow">Slideshow</option>
            <option value="static">Static</option>
            <option value="video">Video Only</option>
          </select>
        </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">URL</label>
              <div className="flex gap-2">
                <input 
                  name="url" 
                  value={form.url} 
                  onChange={handleChange} 
                  placeholder="Image/Video URL" 
                  className="flex-1 border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500" 
                  required 
                />
                <button 
                  type="button"
                  onClick={() => {
                    console.log('Current form URL:', form.url);
                    console.log('Current form state:', form);
                  }}
                  className="px-3 py-2 bg-gray-500 text-white text-sm rounded hover:bg-gray-600"
                >
                  Debug
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Upload File</label>
              <input 
                type="file" 
                accept={form.type === "image" ? "image/*" : "video/*"} 
                onChange={handleFileChange} 
                disabled={uploading}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
              />
              {uploading && (
                <div className="mt-2">
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-green-600 h-2 rounded-full" style={{ width: `${uploadProgress}%` }}></div>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">Uploading... {uploadProgress}%</p>
                </div>
              )}
            </div>

            {form.url && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Preview</label>
                <div className="border border-gray-300 rounded-md p-2">
                  {form.type === "image" ? (
                    <img 
                      src={form.url} 
                      alt="preview" 
                      className="w-full h-32 object-cover rounded"
                      crossOrigin="anonymous"
                      onLoad={(e) => {
                        console.log('Image loaded successfully:', form.url);
                      }}
                      onError={(e) => {
                        console.error('Image failed to load:', form.url);
                        e.target.style.display = 'none';
                        e.target.nextSibling.style.display = 'block';
                      }}
                    />
                  ) : (
                    <video src={form.url} className="w-full h-32 object-cover rounded" controls crossOrigin="anonymous" />
                  )}
                  {form.type === "image" && (
                    <div className="text-center text-gray-500 text-sm" style={{ display: 'none' }}>
                      <svg className="w-8 h-8 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <p>Image preview not available</p>
                      <p className="text-xs mt-1">URL: {form.url}</p>
                      <button 
                        onClick={() => {
                          console.log('Testing image URL:', form.url);
                          fetch(form.url, { mode: 'cors' })
                            .then(response => {
                              console.log('Image fetch response:', response.status, response.statusText);
                            })
                            .catch(error => {
                              console.error('Image fetch error:', error);
                            });
                        }}
                        className="mt-2 px-2 py-1 bg-blue-500 text-white text-xs rounded hover:bg-blue-600"
                      >
                        Test Image URL
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Caption</label>
              <input 
                name="caption" 
                value={form.caption} 
                onChange={handleChange} 
                placeholder="Caption (optional)" 
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500" 
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Display Order</label>
              <input 
                name="order" 
                type="number" 
                value={form.order} 
                onChange={handleChange} 
                placeholder="0" 
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500" 
              />
            </div>

            {/* Slideshow Interval Control - Only show when display mode is slideshow */}
            {form.displayMode === "slideshow" && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Slideshow Interval (seconds)
                </label>
                <div className="flex items-center gap-4">
                                     <input 
                     key={`slideshow-interval-${editing || 'new'}-${form.slideshowInterval}`}
                     name="slideshowInterval" 
                     type="range" 
                     min="1000" 
                     max="30000" 
                     step="1000"
                     value={form.slideshowInterval || 5000} 
                     onChange={handleChange} 
                     className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                     style={{
                       background: 'linear-gradient(to right, #10b981 0%, #10b981 ' + (((form.slideshowInterval || 5000) - 1000) / 29000 * 100) + '%, #e5e7eb ' + (((form.slideshowInterval || 5000) - 1000) / 29000 * 100) + '%, #e5e7eb 100%)'
                     }}
                   />
                                     <span className="text-sm font-medium text-gray-700 min-w-[60px]">
                     {((form.slideshowInterval || 5000) / 1000).toFixed(1)}s
                   </span>
                </div>
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>1s</span>
                  <span>30s</span>
                </div>
                <p className="text-xs text-gray-600 mt-1">
                  Time between slide transitions in slideshow mode
                </p>
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

            <div className="flex gap-3">
              <button 
                type="submit" 
                disabled={submitting}
                className={`font-semibold py-2 px-6 rounded-md transition-colors ${
                  editing 
                    ? 'bg-blue-600 text-white hover:bg-blue-700' 
                    : 'bg-green-600 text-white hover:bg-green-700'
                } ${submitting ? 'opacity-50 cursor-not-allowed' : ''}`}
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
              {editing && (
                <button 
                  type="button"
                  disabled={submitting}
                  onClick={() => {
                    setEditing(null);
                    setForm({ type: "image", url: "", caption: "", displayMode: "slideshow", visible: true, order: 0, slideshowInterval: 5000 });
                  }}
                  className={`font-semibold py-2 px-6 rounded-md transition-colors ${
                    submitting ? 'bg-gray-400 cursor-not-allowed' : 'bg-gray-500 hover:bg-gray-600'
                  } text-white`}
                >
                  Cancel Edit
        </button>
              )}
            </div>
            
            {error && <div className="text-red-600 text-sm bg-red-50 p-3 rounded-md">{error}</div>}
      </form>
        </div>

        {/* Current Hero Content */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4 text-green-800">Current Hero Content</h2>
          
          {loading ? (
            <div className="flex items-center justify-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
              <span className="ml-2 text-gray-600">Loading...</span>
            </div>
          ) : items.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <svg className="w-12 h-12 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <p className="text-lg font-semibold">No hero content yet</p>
              <p className="text-sm">Add your first hero item to get started</p>
            </div>
          ) : (
        <div className="space-y-4">
          {items.map(item => (
                <div key={item._id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0">
              {item.type === "image" ? (
                        <img 
                          src={item.url} 
                          alt="hero" 
                          className="w-20 h-16 object-cover rounded-md"
                          crossOrigin="anonymous"
                          onError={(e) => {
                            console.error('Hero image failed to load:', item.url);
                            e.target.style.display = 'none';
                            e.target.nextSibling.style.display = 'block';
                          }}
                        />
                      ) : (
                        <video 
                          src={item.url} 
                          className="w-20 h-16 object-cover rounded-md" 
                          controls 
                          crossOrigin="anonymous"
                        />
                      )}
                      {/* Fallback for broken images */}
                      {item.type === "image" && (
                        <div className="w-20 h-16 bg-gray-100 rounded-md flex items-center justify-center" style={{ display: 'none' }}>
                          <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-semibold text-gray-900 truncate">
                          {item.caption || `Hero ${item.type}`}
                        </h3>
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-1 text-xs rounded-full ${
                            item.visible 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-gray-100 text-gray-800'
                          }`}>
                            {item.visible ? 'Visible' : 'Hidden'}
                          </span>
                          <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">
                            {item.type}
                          </span>
                        </div>
                      </div>
                      
                      <div className="text-sm text-gray-600 space-y-1">
                        <p>Mode: {item.displayMode}</p>
                        <p>Order: {item.order || 0}</p>
                        {item.displayMode === 'slideshow' && (
                          <p>Slideshow Interval: {(item.slideshowInterval || 5000) / 1000}s</p>
                        )}
                        <p className="truncate">URL: {item.url}</p>
                      </div>
                      
                      <div className="flex gap-2 mt-3">
                        <button 
                          onClick={() => handleEdit(item)} 
                          className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                        >
                          Edit
                        </button>
                        <button 
                          onClick={() => handleToggleVisibility(item)} 
                          className="text-green-600 hover:text-green-800 text-sm font-medium"
                        >
                          {item.visible ? 'Hide' : 'Show'}
                        </button>
                        <button 
                          onClick={() => handleDelete(item._id)} 
                          className="text-red-600 hover:text-red-800 text-sm font-medium"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
              </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 
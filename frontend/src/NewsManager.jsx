import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { toast } from 'react-toastify';

export default function NewsManager() {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Check if user is authenticated (admin)
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate('/signin');
      return;
    }
  }, [navigate]);
  
  return (
    <div className="max-w-7xl mx-auto p-6 bg-gray-50 min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => {
              if (location.state?.from) {
                navigate('/admin', { state: { section: location.state.from } });
              } else {
                navigate('/admin');
              }
            }}
            className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back
          </button>
          <h2 className="text-2xl font-bold text-green-900">News & Blog Manager</h2>
        </div>
        <button
          className="bg-green-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-green-700 transition-colors flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          Add New Post
        </button>
      </div>

      <div className="bg-white rounded-lg p-8 text-center">
        <h3 className="text-xl font-bold text-gray-900 mb-4">News & Blog Management</h3>
        <p className="text-gray-600">News and blog management functionality coming soon...</p>
        <p className="text-sm text-gray-500 mt-2">This will include creating news articles, blog posts, and announcements for the club.</p>
      </div>
    </div>
  );
} 
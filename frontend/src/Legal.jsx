import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

export default function Legal() {
  const [legalContent, setLegalContent] = useState('');
  const [pageTitle, setPageTitle] = useState('Legal Information');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch legal content from settings
    const fetchLegalContent = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch("http://localhost:5000/api/settings", {
          headers: { Authorization: `Bearer ${token}` },
        });
        
        if (res.ok) {
          const data = await res.json();
          setLegalContent(data.legalPageContent || '');
          setPageTitle(data.legalPageTitle || 'Legal Information');
        }
      } catch (err) {
        console.error("Failed to fetch legal content:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchLegalContent();
  }, []);

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded mb-4"></div>
          <div className="h-4 bg-gray-200 rounded mb-2"></div>
          <div className="h-4 bg-gray-200 rounded mb-2"></div>
          <div className="h-4 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto p-6">
      <div className="mb-6">
        <Link 
          to="/"
          className="inline-flex items-center gap-2 text-green-700 hover:text-green-900 transition-colors mb-4"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to Home
        </Link>
        <h1 className="text-3xl font-bold text-green-900 mb-2">{pageTitle}</h1>
        <p className="text-gray-600">Last updated: {new Date().toLocaleDateString()}</p>
        <p className="text-sm text-gray-500 mt-2">
          This Legal Information page contains important information about our organization's legal status, 
          governing documents, compliance, and dispute resolution procedures.
        </p>
      </div>

      <div className="bg-white rounded-lg shadow-md p-8">
        {legalContent ? (
          <div 
            className="prose prose-green max-w-none"
            dangerouslySetInnerHTML={{ __html: legalContent }}
          />
        ) : (
          <div className="text-center py-12">
            <h2 className="text-2xl font-semibold text-gray-700 mb-4">Legal Information Content</h2>
            <p className="text-gray-600 mb-6">
              The legal information content is being loaded from the site settings.
            </p>
            <div className="animate-pulse">
              <div className="h-4 bg-gray-200 rounded mb-2"></div>
              <div className="h-4 bg-gray-200 rounded mb-2"></div>
              <div className="h-4 bg-gray-200 rounded mb-2"></div>
              <div className="h-4 bg-gray-200 rounded"></div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 
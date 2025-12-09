import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { API_BASE_URL } from './config/api';

export default function Cookie() {
  const [cookieContent, setCookieContent] = useState('');
  const [pageTitle, setPageTitle] = useState('Cookie Policy');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch cookie policy content from settings
    const fetchCookieContent = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/settings/cookie`);
        
        if (res.ok) {
          const data = await res.json();
          setCookieContent(data.cookiePageContent || '');
          setPageTitle(data.cookiePageTitle || 'Cookie Policy');
        } else {
          console.error("Failed to fetch cookie content:", res.status);
          // Set default content if API fails
          setCookieContent(`
            <div class="space-y-6">
              <section>
                <h2 class="text-2xl font-bold text-gray-900 mb-4">Cookie Policy</h2>
                <p class="text-gray-700 mb-4">
                  This Cookie Policy explains how Seattle Leopards FC uses cookies and similar tracking technologies 
                  to enhance your browsing experience and provide personalized services.
                </p>
                <p class="text-gray-700 mb-4">
                  <strong>What Are Cookies?</strong> Cookies are small text files that are placed on your device when you visit our website. 
                  They help us provide you with a better experience by remembering your preferences and analyzing how you use our site.
                </p>
                <p class="text-gray-700 mb-4">
                  <strong>How We Use Cookies:</strong> We use cookies for essential website functions, performance monitoring, 
                  functional preferences, and marketing purposes.
                </p>
                <p class="text-gray-700 mb-4">
                  For more detailed information about our cookie usage, please contact us at privacy@seattleleopardsfc.com
                </p>
              </section>
            </div>
          `);
        }
      } catch (err) {
        console.error("Failed to fetch cookie content:", err);
        // Set default content if API fails
        setCookieContent(`
          <div class="space-y-6">
            <section>
              <h2 class="text-2xl font-bold text-gray-900 mb-4">Cookie Policy</h2>
              <p class="text-gray-700 mb-4">
                This Cookie Policy explains how Seattle Leopards FC uses cookies and similar tracking technologies 
                to enhance your browsing experience and provide personalized services.
              </p>
              <p class="text-gray-700 mb-4">
                <strong>What Are Cookies?</strong> Cookies are small text files that are placed on your device when you visit our website. 
                They help us provide you with a better experience by remembering your preferences and analyzing how you use our site.
              </p>
              <p class="text-gray-700 mb-4">
                <strong>How We Use Cookies:</strong> We use cookies for essential website functions, performance monitoring, 
                functional preferences, and marketing purposes.
              </p>
              <p class="text-gray-700 mb-4">
                For more detailed information about our cookie usage, please contact us at privacy@seattleleopardsfc.com
              </p>
            </section>
          </div>
        `);
      } finally {
        setLoading(false);
      }
    };

    fetchCookieContent();
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
          This Cookie Policy explains how Seattle Leopards FC uses cookies and similar tracking technologies 
          to enhance your browsing experience and provide personalized services.
        </p>
      </div>

      <div className="bg-white rounded-lg shadow-md p-8">
        {cookieContent ? (
          <div 
            className="prose prose-green max-w-none"
            dangerouslySetInnerHTML={{ __html: cookieContent }}
          />
        ) : (
          <div className="text-center py-12">
            <h2 className="text-2xl font-semibold text-gray-700 mb-4">Cookie Policy Content</h2>
            <p className="text-gray-600 mb-6">
              The cookie policy content is being loaded from the site settings.
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
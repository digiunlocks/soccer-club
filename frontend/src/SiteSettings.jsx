import { useState, useEffect } from "react";
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import { API_BASE_URL } from './config/api';

export default function SiteSettings() {
  const navigate = useNavigate();
  const [settings, setSettings] = useState({
    // Club Information
    clubName: "Seattle Leopards FC",
    clubTagline: "Building Champions, Building Community",
    clubDescription: "Seattle Leopards FC is a premier youth soccer club dedicated to developing skilled players and fostering a love for the beautiful game.",
    foundedYear: "2020",
    clubMission: "To provide exceptional soccer training and development opportunities for youth players in the Seattle area.",
    clubVision: "To be the leading youth soccer development program in the Pacific Northwest.",
    clubValues: "Excellence, Integrity, Teamwork, Respect, Growth",
    
    // Contact Information
    contactEmail: "info@seattleleopardsfc.com",
    contactPhone: "(206) 555-0123",
    contactAddress: "123 Soccer Way",
    contactCity: "Seattle",
    contactState: "WA",
    contactZip: "98101",
    contactCountry: "USA",
    officeHours: "Monday-Friday: 9:00 AM - 5:00 PM",
    emergencyContact: "(206) 555-9999",
    
    // Social Media
    facebookUrl: "https://facebook.com/seattleleopardsfc",
    instagramUrl: "https://instagram.com/seattleleopardsfc",
    twitterUrl: "https://twitter.com/seattleleopardsfc",
    youtubeUrl: "https://youtube.com/seattleleopardsfc",
    linkedinUrl: "https://linkedin.com/company/seattleleopardsfc",
    tiktokUrl: "",
    
    // Website Settings
    siteTitle: "Seattle Leopards FC - Premier Youth Soccer Club",
    siteDescription: "Join Seattle Leopards FC for premier youth soccer training and development in the Seattle area.",
    siteKeywords: "youth soccer, seattle, soccer club, soccer training, youth sports",
    siteLanguage: "en",
    timezone: "America/Los_Angeles",
    dateFormat: "MM/DD/YYYY",
    timeFormat: "12",
    
    // Branding & Design
    primaryColor: "#166534",
    secondaryColor: "#EAB308",
    accentColor: "#059669",
    backgroundColor: "#FFFFFF",
    textColor: "#1F2937",
    logoUrl: "",
    faviconUrl: "",
    heroImageUrl: "",
    aboutImageUrl: "",
    customCSS: "",
    customJS: "",
    
    // Features & Settings
    enableRegistration: true,
    enableDonations: true,
    enableNewsletter: true,
    enableContactForm: true,
    enableProgramSearch: true,
    enableBlog: false,
    enableEvents: true,
    enableGallery: true,
    enableTestimonials: true,
    enableTeamRoster: true,
    enableSchedule: true,
    enableStandings: true,
    enableLiveScores: false,
    enableOnlineStore: false,
    enableMemberPortal: true,
    enableCoachPortal: true,
    enableAdvertisements: true,
    
    // Email Configuration
    emailNotifications: true,
    adminEmail: "admin@seattleleopardsfc.com",
    supportEmail: "support@seattleleopardsfc.com",
    noreplyEmail: "noreply@seattleleopardsfc.com",
    emailProvider: "gmail",
    emailTemplateHeader: "",
    emailTemplateFooter: "",
    
    // Security & Privacy
    enableTwoFactorAuth: false,
    requireEmailVerification: true,
    sessionTimeout: 24,
    maxLoginAttempts: 5,
    passwordMinLength: 8,
    requireStrongPassword: true,
    enableCSRFProtection: true,
    enableRateLimiting: true,
    enableContentSecurityPolicy: true,
    
    // Performance & Caching
    enableCaching: true,
    cacheDuration: 3600,
    enableImageOptimization: true,
    enableGzipCompression: true,
    enableCDN: false,
    cdnUrl: "",
    
    // Legal & Compliance
    privacyPolicy: "Your privacy is important to us. We collect and use your information to provide our services and improve your experience.",
    termsOfService: "By using our services, you agree to our terms and conditions.",
    cookiePolicy: "We use cookies to enhance your browsing experience and analyze site traffic.",
    refundPolicy: "Refunds are processed within 30 days of purchase.",
    waiverText: "I acknowledge and accept the risks associated with participation in soccer activities.",
    gdprCompliance: true,
    ccpaCompliance: true,
    
    // Footer Content Management
    footerCompanyName: "Seattle Leopards FC",
    footerTagline: "Building Champions, Building Community",
    footerDescription: "Premier youth soccer club dedicated to developing skilled players and fostering a love for the beautiful game.",
    footerCopyright: "© 2024 Seattle Leopards FC. All rights reserved.",
    
    // Footer Links
    footerTermsUrl: "/terms",
    footerPrivacyUrl: "/privacy",
    footerCookieUrl: "/cookie",
    footerLegalUrl: "/legal",
    
    // Footer Social Media
    footerFacebookUrl: "https://facebook.com/seattleleopardsfc",
    footerInstagramUrl: "https://instagram.com/seattleleopardsfc",
    footerTwitterUrl: "https://twitter.com/seattleleopardsfc",
    footerYoutubeUrl: "https://youtube.com/seattleleopardsfc",
    
    // Footer Contact
    footerContactEmail: "info@seattleleopardsfc.com",
    footerContactPhone: "(206) 555-0123",
    footerContactAddress: "123 Soccer Way, Seattle, WA 98101",
    
    // Footer Sections
    footerAboutText: "Seattle Leopards FC is committed to excellence in youth soccer development, providing top-tier training and fostering a supportive community for young athletes.",
    footerQuickLinks: "About Us,Programs,Teams,Contact,Donate",
    footerPrograms: "Youth Programs,Competitive Teams,Training Camps,Summer Leagues",
    footerSupport: "Volunteer,Donate,Sponsor,Partner",
    
    // Footer Newsletter
    footerNewsletterTitle: "Stay Connected",
    footerNewsletterDescription: "Get the latest updates on programs, events, and club news.",
    footerNewsletterPlaceholder: "Enter your email address",
    footerNewsletterButton: "Subscribe",
    
    // Footer Legal Content
    footerTermsTitle: "Terms of Service",
    footerPrivacyTitle: "Privacy Policy",
    footerCookieTitle: "Cookie Policy",
    footerLegalTitle: "Legal Information",
    
    // Footer Display Settings
    footerShowSocialMedia: true,
    footerShowNewsletter: true,
    footerShowQuickLinks: true,
    footerShowContact: true,
    footerShowPrograms: true,
    footerShowSupport: true,
    footerShowCopyright: true,
    
    // Page Content Management
    termsPageTitle: "Terms of Service",
    termsPageContent: "",
    privacyPageTitle: "Privacy Policy", 
    privacyPageContent: "",
    cookiePageTitle: "Cookie Policy",
    cookiePageContent: "",
    legalPageTitle: "Legal Information",
    legalPageContent: "",
    
    // SEO & Analytics
    googleAnalyticsId: "",
    facebookPixelId: "",
    googleTagManagerId: "",
    bingWebmasterTools: "",
    yandexMetrika: "",
    metaImageUrl: "",
    structuredData: "",
    canonicalUrl: "",
    robotsTxt: "User-agent: *\nAllow: /",
    sitemapUrl: "",
    
    // Integrations
    stripePublishableKey: "",
    stripeSecretKey: "",
    paypalClientId: "",
    paypalSecret: "",
    googleMapsApiKey: "",
    weatherApiKey: "",
    smsApiKey: "",
    smsProvider: "twilio",
    
    // Notifications & Alerts
    enableSMSNotifications: false,
    enablePushNotifications: false,
    enableEmailAlerts: true,
    alertEmailRecipients: "admin@seattleleopardsfc.com",
    maintenanceNotifications: true,
    
    // Maintenance & System
    maintenanceMode: false,
    maintenanceMessage: "We're currently performing maintenance. Please check back soon.",
    maintenanceStartTime: "",
    maintenanceEndTime: "",
    systemVersion: "1.0.0",
    lastBackup: "",
    autoBackup: true,
    backupFrequency: "daily",
    
    // Content Management
    maxFileUploadSize: 10485760,
    allowedFileTypes: "jpg,jpeg,png,gif,pdf,doc,docx",
    enableImageWatermark: false,
    watermarkText: "Seattle Leopards FC",
    enableAutoImageResize: true,
    maxImageWidth: 1920,
    maxImageHeight: 1080,
    
    // Content Management System Settings
    enableContentModeration: false,
    enableContentVersioning: false,
    enableContentScheduling: false,
    enableContentAnalytics: false,
    
    // Media Library Settings
    maxMediaFileSize: 50,
    allowedMediaTypes: "jpg,jpeg,png,gif,mp4,avi,mov,webm",
    enableMediaCategories: false,
    enableMediaTags: false,
    enableMediaWatermark: false,
    enableMediaCompression: false,
    mediaStorageLocation: "local",
    mediaStorageQuota: 100,
    
    // Fans & Gallery Settings
    enablePublicGallery: true,
    enableFanSubmissions: true,
    enableGalleryModeration: true,
    enableGalleryComments: true,
    maxFanSubmissionsPerDay: 5,
    fanSubmissionCategories: "Game Photos,Team Events,Fan Moments,Memories",
    galleryItemsPerPage: 20,
    featuredGalleryItems: 6,
    
    // User Experience
    enableDarkMode: false,
    enableAccessibility: true,
    enableKeyboardNavigation: true,
    enableScreenReader: true,
    defaultLanguage: "en",
    supportedLanguages: "en,es",
    
    // Advanced Features
    enableAPI: false,
    apiRateLimit: 100,
    enableWebhooks: false,
    webhookUrl: "",
    enableRealTimeUpdates: false,
    enableOfflineMode: false,
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("general");
  const [showAdvanced, setShowAdvanced] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      setError("Authentication required. Please log in.");
      return;
    }
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setError("Authentication required. Please log in.");
        return;
      }

      const res = await fetch(`${API_BASE_URL}/settings`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      if (res.status === 401) {
        setError("Invalid token. Please log in again.");
        localStorage.removeItem("token");
        navigate("/signin");
        return;
      }
      
      if (res.ok) {
        const data = await res.json();
        console.log("Fetched settings data:", data);
        // Construct full URLs for images if they exist
        const processedData = { ...data };
        if (data.logoUrl && !data.logoUrl.startsWith('http')) {
          processedData.logoUrl = `${API_BASE_URL.replace('/api', '')}${data.logoUrl}`;
          console.log("Processed logo URL:", processedData.logoUrl);
        }
        if (data.faviconUrl && !data.faviconUrl.startsWith('http')) {
          processedData.faviconUrl = `${API_BASE_URL.replace('/api', '')}${data.faviconUrl}`;
        }
        if (data.heroImageUrl && !data.heroImageUrl.startsWith('http')) {
          processedData.heroImageUrl = `${API_BASE_URL.replace('/api', '')}${data.heroImageUrl}`;
        }
        if (data.aboutImageUrl && !data.aboutImageUrl.startsWith('http')) {
          processedData.aboutImageUrl = `${API_BASE_URL.replace('/api', '')}${data.aboutImageUrl}`;
        }
        setSettings(prev => ({ ...prev, ...processedData }));
      } else {
        throw new Error("Failed to fetch settings");
      }
    } catch (err) {
      console.error("Failed to fetch settings:", err);
      toast.error("Failed to load site settings");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setSettings(prev => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value
    }));
  };

  const handleLogoUpload = async (e) => {
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

    try {
      const formData = new FormData();
      formData.append('logo', file);

      const token = localStorage.getItem("token");
      if (!token) {
        toast.error("Authentication required. Please log in.");
        navigate("/signin");
        return;
      }

      const response = await fetch(`${API_BASE_URL}/settings/upload-logo`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (response.status === 401) {
        toast.error("Invalid token. Please log in again.");
        localStorage.removeItem("token");
        navigate("/signin");
        return;
      }

      if (response.status === 429) {
        toast.error("Too many requests. Please wait a moment and try again.");
        return;
      }

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || data.message || "Failed to upload logo");
      }

      const data = await response.json();
      // Construct full URL for the logo
      const fullLogoUrl = `${API_BASE_URL.replace('/api', '')}${data.logoUrl}`;
      console.log("Logo uploaded successfully. URL:", fullLogoUrl);
      setSettings(prev => ({
        ...prev,
        logoUrl: fullLogoUrl
      }));
      
      toast.success("Logo uploaded successfully! The logo will appear on the main site within 10 seconds.");
      
      // Force a page refresh after 2 seconds to update the logo
      setTimeout(() => {
        window.location.reload();
      }, 2000);
    } catch (error) {
      console.error("Logo upload error:", error);
      toast.error(error.message || "Failed to upload logo");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        toast.error("Authentication required. Please log in.");
        navigate("/signin");
        return;
      }

      const res = await fetch(`${API_BASE_URL}/settings`, {
        method: "PUT",
        headers: { 
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify(settings),
      });

      if (res.status === 401) {
        toast.error("Invalid token. Please log in again.");
        localStorage.removeItem("token");
        navigate("/signin");
        return;
      }

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || data.message || "Failed to save settings");
      }

      toast.success("Site settings saved successfully!");
    } catch (err) {
      setError(err.message);
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    if (window.confirm("Are you sure you want to reset all settings to default values?")) {
      setSettings({
        clubName: "Seattle Leopards FC",
        clubTagline: "Building Champions, Building Community",
        clubDescription: "Seattle Leopards FC is a premier youth soccer club dedicated to developing skilled players and fostering a love for the beautiful game.",
        foundedYear: "2020",
        clubMission: "To provide exceptional soccer training and development opportunities for youth players in the Seattle area.",
        clubVision: "To be the leading youth soccer development program in the Pacific Northwest.",
        clubValues: "Excellence, Integrity, Teamwork, Respect, Growth",
        contactEmail: "info@seattleleopardsfc.com",
        contactPhone: "(206) 555-0123",
        contactAddress: "123 Soccer Way",
        contactCity: "Seattle",
        contactState: "WA",
        contactZip: "98101",
        contactCountry: "USA",
        officeHours: "Monday-Friday: 9:00 AM - 5:00 PM",
        emergencyContact: "(206) 555-9999",
        facebookUrl: "https://facebook.com/seattleleopardsfc",
        instagramUrl: "https://instagram.com/seattleleopardsfc",
        twitterUrl: "https://twitter.com/seattleleopardsfc",
        youtubeUrl: "https://youtube.com/seattleleopardsfc",
        linkedinUrl: "https://linkedin.com/company/seattleleopardsfc",
        tiktokUrl: "",
        siteTitle: "Seattle Leopards FC - Premier Youth Soccer Club",
        siteDescription: "Join Seattle Leopards FC for premier youth soccer training and development in the Seattle area.",
        siteKeywords: "youth soccer, seattle, soccer club, soccer training, youth sports",
        siteLanguage: "en",
        timezone: "America/Los_Angeles",
        dateFormat: "MM/DD/YYYY",
        timeFormat: "12",
        primaryColor: "#166534",
        secondaryColor: "#EAB308",
        accentColor: "#059669",
        backgroundColor: "#FFFFFF",
        textColor: "#1F2937",
        logoUrl: "",
        faviconUrl: "",
        heroImageUrl: "",
        aboutImageUrl: "",
        customCSS: "",
        customJS: "",
        enableRegistration: true,
        enableDonations: true,
        enableNewsletter: true,
        enableContactForm: true,
        enableProgramSearch: true,
        enableBlog: false,
        enableEvents: true,
        enableGallery: true,
        enableTestimonials: true,
        enableTeamRoster: true,
        enableSchedule: true,
        enableStandings: true,
        enableLiveScores: false,
        enableOnlineStore: false,
        enableMemberPortal: true,
        enableCoachPortal: true,
        enableAdvertisements: true,
        emailNotifications: true,
        adminEmail: "admin@seattleleopardsfc.com",
        supportEmail: "support@seattleleopardsfc.com",
        noreplyEmail: "noreply@seattleleopardsfc.com",
        emailProvider: "gmail",
        emailTemplateHeader: "",
        emailTemplateFooter: "",
        enableTwoFactorAuth: false,
        requireEmailVerification: true,
        sessionTimeout: 24,
        maxLoginAttempts: 5,
        passwordMinLength: 8,
        requireStrongPassword: true,
        enableCSRFProtection: true,
        enableRateLimiting: true,
        enableContentSecurityPolicy: true,
        enableCaching: true,
        cacheDuration: 3600,
        enableImageOptimization: true,
        enableGzipCompression: true,
        enableCDN: false,
        cdnUrl: "",
        privacyPolicy: "Your privacy is important to us. We collect and use your information to provide our services and improve your experience.",
        termsOfService: "By using our services, you agree to our terms and conditions.",
        cookiePolicy: "We use cookies to enhance your browsing experience and analyze site traffic.",
        refundPolicy: "Refunds are processed within 30 days of purchase.",
        waiverText: "I acknowledge and accept the risks associated with participation in soccer activities.",
        gdprCompliance: true,
        ccpaCompliance: true,
        googleAnalyticsId: "",
        facebookPixelId: "",
        googleTagManagerId: "",
        bingWebmasterTools: "",
        yandexMetrika: "",
        metaImageUrl: "",
        structuredData: "",
        canonicalUrl: "",
        robotsTxt: "User-agent: *\nAllow: /",
        sitemapUrl: "",
        stripePublishableKey: "",
        stripeSecretKey: "",
        paypalClientId: "",
        paypalSecret: "",
        googleMapsApiKey: "",
        weatherApiKey: "",
        smsApiKey: "",
        smsProvider: "twilio",
        enableSMSNotifications: false,
        enablePushNotifications: false,
        enableEmailAlerts: true,
        alertEmailRecipients: "admin@seattleleopardsfc.com",
        maintenanceNotifications: true,
        maintenanceMode: false,
        maintenanceMessage: "We're currently performing maintenance. Please check back soon.",
        maintenanceStartTime: "",
        maintenanceEndTime: "",
        systemVersion: "1.0.0",
        lastBackup: "",
        autoBackup: true,
        backupFrequency: "daily",
        maxFileUploadSize: 10485760,
        allowedFileTypes: "jpg,jpeg,png,gif,pdf,doc,docx",
        enableImageWatermark: false,
        watermarkText: "Seattle Leopards FC",
        enableAutoImageResize: true,
        maxImageWidth: 1920,
        maxImageHeight: 1080,
        enableDarkMode: false,
        enableAccessibility: true,
        enableKeyboardNavigation: true,
        enableScreenReader: true,
        defaultLanguage: "en",
        supportedLanguages: "en,es",
        enableAPI: false,
        apiRateLimit: 100,
        enableWebhooks: false,
        webhookUrl: "",
        enableRealTimeUpdates: false,
        enableOfflineMode: false,
      });
      toast.info("Settings reset to default values");
    }
  };

  const handleExport = () => {
    const dataStr = JSON.stringify(settings, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'site-settings.json';
    link.click();
    URL.revokeObjectURL(url);
    toast.success("Settings exported successfully!");
  };

  const handleImport = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const importedSettings = JSON.parse(event.target.result);
        setSettings(prev => ({ ...prev, ...importedSettings }));
        toast.success("Settings imported successfully!");
      } catch (err) {
        toast.error("Invalid settings file");
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="loader"></div>
          <span className="ml-3 text-lg">Loading site settings...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate('/admin')}
            className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Dashboard
          </button>
          <h1 className="text-3xl font-bold text-green-900">Site Settings</h1>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleExport}
            className="bg-blue-600 text-white px-4 py-2 rounded font-bold hover:bg-blue-700 transition"
          >
            Export Settings
          </button>
          <label className="bg-yellow-500 text-white px-4 py-2 rounded font-bold hover:bg-yellow-600 transition cursor-pointer">
            Import Settings
            <input
              type="file"
              accept=".json"
              onChange={handleImport}
              className="hidden"
            />
          </label>
          <button
            onClick={handleReset}
            className="bg-red-600 text-white px-4 py-2 rounded font-bold hover:bg-red-700 transition"
          >
            Reset to Default
          </button>
        </div>
      </div>

                        {/* Tab Navigation */}
                  <div className="border-b border-gray-200 mb-6">
                    <div className="flex flex-wrap gap-1 overflow-x-auto pb-2">
                    {[
                      { id: "general", label: "General", icon: "🏠" },
                      { id: "contact", label: "Contact", icon: "📞" },
                      { id: "social", label: "Social Media", icon: "📱" },
                      { id: "branding", label: "Branding", icon: "🎨" },
                      { id: "features", label: "Features", icon: "⚙️" },
                      { id: "email", label: "Email", icon: "📧" },
                      { id: "security", label: "Security", icon: "🔒" },
                      { id: "performance", label: "Performance", icon: "⚡" },
                      { id: "legal", label: "Legal", icon: "⚖️" },
                      { id: "footer", label: "Footer", icon: "📋" },
                      { id: "advertisements", label: "Advertisements", icon: "📢" },
                      { id: "seo", label: "SEO", icon: "🔍" },
                      { id: "integrations", label: "Integrations", icon: "🔗" },
                      { id: "notifications", label: "Notifications", icon: "🔔" },
                      { id: "maintenance", label: "Maintenance", icon: "🔧" },
                      { id: "content", label: "Content", icon: "📄" },
                      { id: "ux", label: "UX", icon: "👤" },
                      { id: "content-management", label: "Content Management", icon: "📝" },
                      { id: "media-library", label: "Media Library", icon: "🎬" },
                      { id: "fans-gallery", label: "Fans & Gallery", icon: "📸" },
                      { id: "advanced", label: "Advanced", icon: "🚀" },
                    ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-3 py-2 text-sm font-semibold border-b-2 transition-colors whitespace-nowrap ${
              activeTab === tab.id
                ? "border-green-500 text-green-700"
                : "border-transparent text-gray-600 hover:text-gray-800"
            }`}
          >
            <span className="mr-2">{tab.icon}</span>
            {tab.label}
          </button>
        ))}
                    </div>
                  </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* General Settings */}
        {activeTab === "general" && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold mb-4 text-green-900">General Club Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold mb-2">Club Name</label>
                <input
                  type="text"
                  name="clubName"
                  value={settings.clubName}
                  onChange={handleChange}
                  className="w-full border rounded px-3 py-2"
                  required
                />
              </div>
              <div>
                <label className="block font-semibold mb-2">Club Tagline</label>
                <input
                  type="text"
                  name="clubTagline"
                  value={settings.clubTagline}
                  onChange={handleChange}
                  className="w-full border rounded px-3 py-2"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block font-semibold mb-2">Club Description</label>
                <textarea
                  name="clubDescription"
                  value={settings.clubDescription}
                  onChange={handleChange}
                  rows="3"
                  className="w-full border rounded px-3 py-2"
                />
              </div>
              <div>
                <label className="block font-semibold mb-2">Founded Year</label>
                <input
                  type="number"
                  name="foundedYear"
                  value={settings.foundedYear}
                  onChange={handleChange}
                  className="w-full border rounded px-3 py-2"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block font-semibold mb-2">Club Mission</label>
                <textarea
                  name="clubMission"
                  value={settings.clubMission}
                  onChange={handleChange}
                  rows="3"
                  className="w-full border rounded px-3 py-2"
                />
              </div>
              <div>
                <label className="block font-semibold mb-2">Club Vision</label>
                <textarea
                  name="clubVision"
                  value={settings.clubVision}
                  onChange={handleChange}
                  rows="3"
                  className="w-full border rounded px-3 py-2"
                />
              </div>
              <div>
                <label className="block font-semibold mb-2">Club Values</label>
                <textarea
                  name="clubValues"
                  value={settings.clubValues}
                  onChange={handleChange}
                  rows="3"
                  className="w-full border rounded px-3 py-2"
                />
              </div>
            </div>
          </div>
        )}

        {/* Contact Settings */}
        {activeTab === "contact" && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold mb-4 text-green-900">Contact Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold mb-2">Contact Email</label>
                <input
                  type="email"
                  name="contactEmail"
                  value={settings.contactEmail}
                  onChange={handleChange}
                  className="w-full border rounded px-3 py-2"
                />
              </div>
              <div>
                <label className="block font-semibold mb-2">Contact Phone</label>
                <input
                  type="tel"
                  name="contactPhone"
                  value={settings.contactPhone}
                  onChange={handleChange}
                  className="w-full border rounded px-3 py-2"
                />
              </div>
              <div>
                <label className="block font-semibold mb-2">Address</label>
                <input
                  type="text"
                  name="contactAddress"
                  value={settings.contactAddress}
                  onChange={handleChange}
                  className="w-full border rounded px-3 py-2"
                />
              </div>
              <div>
                <label className="block font-semibold mb-2">City</label>
                <input
                  type="text"
                  name="contactCity"
                  value={settings.contactCity}
                  onChange={handleChange}
                  className="w-full border rounded px-3 py-2"
                />
              </div>
              <div>
                <label className="block font-semibold mb-2">State</label>
                <input
                  type="text"
                  name="contactState"
                  value={settings.contactState}
                  onChange={handleChange}
                  className="w-full border rounded px-3 py-2"
                />
              </div>
              <div>
                <label className="block font-semibold mb-2">ZIP Code</label>
                <input
                  type="text"
                  name="contactZip"
                  value={settings.contactZip}
                  onChange={handleChange}
                  className="w-full border rounded px-3 py-2"
                />
              </div>
              <div>
                <label className="block font-semibold mb-2">Country</label>
                <input
                  type="text"
                  name="contactCountry"
                  value={settings.contactCountry}
                  onChange={handleChange}
                  className="w-full border rounded px-3 py-2"
                />
              </div>
              <div>
                <label className="block font-semibold mb-2">Office Hours</label>
                <input
                  type="text"
                  name="officeHours"
                  value={settings.officeHours}
                  onChange={handleChange}
                  className="w-full border rounded px-3 py-2"
                />
              </div>
              <div>
                <label className="block font-semibold mb-2">Emergency Contact</label>
                <input
                  type="tel"
                  name="emergencyContact"
                  value={settings.emergencyContact}
                  onChange={handleChange}
                  className="w-full border rounded px-3 py-2"
                />
              </div>
            </div>
          </div>
        )}

        {/* Social Media Settings */}
        {activeTab === "social" && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold mb-4 text-green-900">Social Media Links</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold mb-2">Facebook URL</label>
                <input
                  type="url"
                  name="facebookUrl"
                  value={settings.facebookUrl}
                  onChange={handleChange}
                  className="w-full border rounded px-3 py-2"
                  placeholder="https://facebook.com/..."
                />
              </div>
              <div>
                <label className="block font-semibold mb-2">Instagram URL</label>
                <input
                  type="url"
                  name="instagramUrl"
                  value={settings.instagramUrl}
                  onChange={handleChange}
                  className="w-full border rounded px-3 py-2"
                  placeholder="https://instagram.com/..."
                />
              </div>
              <div>
                <label className="block font-semibold mb-2">Twitter URL</label>
                <input
                  type="url"
                  name="twitterUrl"
                  value={settings.twitterUrl}
                  onChange={handleChange}
                  className="w-full border rounded px-3 py-2"
                  placeholder="https://twitter.com/..."
                />
              </div>
              <div>
                <label className="block font-semibold mb-2">YouTube URL</label>
                <input
                  type="url"
                  name="youtubeUrl"
                  value={settings.youtubeUrl}
                  onChange={handleChange}
                  className="w-full border rounded px-3 py-2"
                  placeholder="https://youtube.com/..."
                />
              </div>
              <div>
                <label className="block font-semibold mb-2">LinkedIn URL</label>
                <input
                  type="url"
                  name="linkedinUrl"
                  value={settings.linkedinUrl}
                  onChange={handleChange}
                  className="w-full border rounded px-3 py-2"
                  placeholder="https://linkedin.com/..."
                />
              </div>
              <div>
                <label className="block font-semibold mb-2">TikTok URL</label>
                <input
                  type="url"
                  name="tiktokUrl"
                  value={settings.tiktokUrl}
                  onChange={handleChange}
                  className="w-full border rounded px-3 py-2"
                  placeholder="https://tiktok.com/..."
                />
              </div>
            </div>
          </div>
        )}

        {/* Branding Settings */}
        {activeTab === "branding" && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold mb-4 text-green-900">Branding & Colors</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold mb-2">Primary Color</label>
                <div className="flex gap-2">
                  <input
                    type="color"
                    name="primaryColor"
                    value={settings.primaryColor}
                    onChange={handleChange}
                    className="w-16 h-10 border rounded"
                  />
                  <input
                    type="text"
                    name="primaryColor"
                    value={settings.primaryColor}
                    onChange={handleChange}
                    className="flex-1 border rounded px-3 py-2"
                    placeholder="#166534"
                  />
                </div>
              </div>
              <div>
                <label className="block font-semibold mb-2">Secondary Color</label>
                <div className="flex gap-2">
                  <input
                    type="color"
                    name="secondaryColor"
                    value={settings.secondaryColor}
                    onChange={handleChange}
                    className="w-16 h-10 border rounded"
                  />
                  <input
                    type="text"
                    name="secondaryColor"
                    value={settings.secondaryColor}
                    onChange={handleChange}
                    className="flex-1 border rounded px-3 py-2"
                    placeholder="#EAB308"
                  />
                </div>
              </div>
              <div>
                <label className="block font-semibold mb-2">Accent Color</label>
                <div className="flex gap-2">
                  <input
                    type="color"
                    name="accentColor"
                    value={settings.accentColor}
                    onChange={handleChange}
                    className="w-16 h-10 border rounded"
                  />
                  <input
                    type="text"
                    name="accentColor"
                    value={settings.accentColor}
                    onChange={handleChange}
                    className="flex-1 border rounded px-3 py-2"
                    placeholder="#059669"
                  />
                </div>
              </div>
              <div>
                <label className="block font-semibold mb-2">Background Color</label>
                <div className="flex gap-2">
                  <input
                    type="color"
                    name="backgroundColor"
                    value={settings.backgroundColor}
                    onChange={handleChange}
                    className="w-16 h-10 border rounded"
                  />
                  <input
                    type="text"
                    name="backgroundColor"
                    value={settings.backgroundColor}
                    onChange={handleChange}
                    className="flex-1 border rounded px-3 py-2"
                    placeholder="#FFFFFF"
                  />
                </div>
              </div>
              <div>
                <label className="block font-semibold mb-2">Text Color</label>
                <div className="flex gap-2">
                  <input
                    type="color"
                    name="textColor"
                    value={settings.textColor}
                    onChange={handleChange}
                    className="w-16 h-10 border rounded"
                  />
                  <input
                    type="text"
                    name="textColor"
                    value={settings.textColor}
                    onChange={handleChange}
                    className="flex-1 border rounded px-3 py-2"
                    placeholder="#1F2937"
                  />
                </div>
              </div>
              <div className="md:col-span-2">
                <label className="block font-semibold mb-2">Club Logo</label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  <div className="mb-4">
                    <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                      <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                  <div className="mb-4">
                    <label htmlFor="logo-upload" className="cursor-pointer bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors">
                      Upload Logo
                    </label>
                    <input
                      id="logo-upload"
                      type="file"
                      accept="image/*"
                      onChange={handleLogoUpload}
                      className="hidden"
                    />
                  </div>
                  <div className="text-sm text-gray-500">
                    <p><strong>Recommended size:</strong> 200x200 pixels (square)</p>
                    <p><strong>Maximum size:</strong> 2MB</p>
                    <p><strong>Formats:</strong> PNG, JPG, SVG</p>
                    <p><strong>Background:</strong> Transparent or white recommended</p>
                  </div>
                  <div className="mt-4">
                    <p className="text-sm font-semibold mb-2">Current Logo:</p>
                    {console.log("Current logoUrl state:", settings.logoUrl)}
                    <div className="flex gap-2 mb-2">
                      <button
                        type="button"
                        onClick={() => window.location.reload()}
                        className="text-blue-600 hover:text-blue-800 text-sm"
                      >
                        Refresh Page
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          const newWindow = window.open('/', '_blank');
                          if (newWindow) {
                            newWindow.focus();
                          }
                        }}
                        className="text-green-600 hover:text-green-800 text-sm"
                      >
                        Open Main Site
                      </button>
                    </div>
                    {settings.logoUrl ? (
                      <div className="inline-block border rounded p-2 bg-gray-50">
                        <img 
                          src={settings.logoUrl} 
                          alt="Current logo" 
                          className="h-16 w-16 object-contain"
                          crossOrigin="anonymous"
                          onError={(e) => {
                            console.log("Image failed to load:", e.target.src);
                            e.target.style.display = 'none';
                            e.target.nextSibling.style.display = 'block';
                          }}
                          onLoad={(e) => {
                            console.log("Image loaded successfully:", e.target.src);
                          }}
                        />
                        <div className="hidden h-16 w-16 bg-gray-200 flex items-center justify-center text-gray-500 text-xs">
                          Logo not found
                        </div>
                        <button
                          type="button"
                          onClick={() => setSettings(prev => ({ ...prev, logoUrl: "" }))}
                          className="mt-2 text-red-600 hover:text-red-800 text-sm block"
                        >
                          Remove Logo
                        </button>
                      </div>
                    ) : (
                      <div className="h-16 w-16 bg-gray-200 flex items-center justify-center text-gray-500 text-xs border rounded">
                        No logo uploaded
                      </div>
                    )}
                  </div>
                </div>
              </div>
              <div>
                <label className="block font-semibold mb-2">Favicon URL</label>
                <input
                  type="url"
                  name="faviconUrl"
                  value={settings.faviconUrl}
                  onChange={handleChange}
                  className="w-full border rounded px-3 py-2"
                  placeholder="https://example.com/favicon.ico"
                />
              </div>
              <div>
                <label className="block font-semibold mb-2">Hero Image URL</label>
                <input
                  type="url"
                  name="heroImageUrl"
                  value={settings.heroImageUrl}
                  onChange={handleChange}
                  className="w-full border rounded px-3 py-2"
                  placeholder="https://example.com/hero.jpg"
                />
              </div>
              <div>
                <label className="block font-semibold mb-2">About Image URL</label>
                <input
                  type="url"
                  name="aboutImageUrl"
                  value={settings.aboutImageUrl}
                  onChange={handleChange}
                  className="w-full border rounded px-3 py-2"
                  placeholder="https://example.com/about.jpg"
                />
              </div>
              <div>
                <label className="block font-semibold mb-2">Custom CSS</label>
                <textarea
                  name="customCSS"
                  value={settings.customCSS}
                  onChange={handleChange}
                  rows="4"
                  className="w-full border rounded px-3 py-2"
                />
              </div>
              <div>
                <label className="block font-semibold mb-2">Custom JS</label>
                <textarea
                  name="customJS"
                  value={settings.customJS}
                  onChange={handleChange}
                  rows="4"
                  className="w-full border rounded px-3 py-2"
                />
              </div>
            </div>
          </div>
        )}

        {/* Features Settings */}
        {activeTab === "features" && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold mb-4 text-green-900">Site Features</h2>
            <div className="space-y-4">
              <label className="flex items-center gap-3">
                <input
                  type="checkbox"
                  name="enableRegistration"
                  checked={settings.enableRegistration}
                  onChange={handleChange}
                  className="w-5 h-5"
                />
                <span className="font-semibold">Enable User Registration</span>
              </label>
              <label className="flex items-center gap-3">
                <input
                  type="checkbox"
                  name="enableDonations"
                  checked={settings.enableDonations}
                  onChange={handleChange}
                  className="w-5 h-5"
                />
                <span className="font-semibold">Enable Donations</span>
              </label>
              <label className="flex items-center gap-3">
                <input
                  type="checkbox"
                  name="enableNewsletter"
                  checked={settings.enableNewsletter}
                  onChange={handleChange}
                  className="w-5 h-5"
                />
                <span className="font-semibold">Enable Newsletter Signup</span>
              </label>
              <label className="flex items-center gap-3">
                <input
                  type="checkbox"
                  name="enableContactForm"
                  checked={settings.enableContactForm}
                  onChange={handleChange}
                  className="w-5 h-5"
                />
                <span className="font-semibold">Enable Contact Form</span>
              </label>
              <label className="flex items-center gap-3">
                <input
                  type="checkbox"
                  name="enableProgramSearch"
                  checked={settings.enableProgramSearch}
                  onChange={handleChange}
                  className="w-5 h-5"
                />
                <span className="font-semibold">Enable Program Search</span>
              </label>
              <label className="flex items-center gap-3">
                <input
                  type="checkbox"
                  name="enableBlog"
                  checked={settings.enableBlog}
                  onChange={handleChange}
                  className="w-5 h-5"
                />
                <span className="font-semibold">Enable Blog</span>
              </label>
              <label className="flex items-center gap-3">
                <input
                  type="checkbox"
                  name="enableEvents"
                  checked={settings.enableEvents}
                  onChange={handleChange}
                  className="w-5 h-5"
                />
                <span className="font-semibold">Enable Events</span>
              </label>
              <label className="flex items-center gap-3">
                <input
                  type="checkbox"
                  name="enableGallery"
                  checked={settings.enableGallery}
                  onChange={handleChange}
                  className="w-5 h-5"
                />
                <span className="font-semibold">Enable Gallery</span>
              </label>
              <label className="flex items-center gap-3">
                <input
                  type="checkbox"
                  name="enableTestimonials"
                  checked={settings.enableTestimonials}
                  onChange={handleChange}
                  className="w-5 h-5"
                />
                <span className="font-semibold">Enable Testimonials</span>
              </label>
              <label className="flex items-center gap-3">
                <input
                  type="checkbox"
                  name="enableTeamRoster"
                  checked={settings.enableTeamRoster}
                  onChange={handleChange}
                  className="w-5 h-5"
                />
                <span className="font-semibold">Enable Team Roster</span>
              </label>
              <label className="flex items-center gap-3">
                <input
                  type="checkbox"
                  name="enableSchedule"
                  checked={settings.enableSchedule}
                  onChange={handleChange}
                  className="w-5 h-5"
                />
                <span className="font-semibold">Enable Schedule</span>
              </label>
              <label className="flex items-center gap-3">
                <input
                  type="checkbox"
                  name="enableStandings"
                  checked={settings.enableStandings}
                  onChange={handleChange}
                  className="w-5 h-5"
                />
                <span className="font-semibold">Enable Standings</span>
              </label>
              <label className="flex items-center gap-3">
                <input
                  type="checkbox"
                  name="enableLiveScores"
                  checked={settings.enableLiveScores}
                  onChange={handleChange}
                  className="w-5 h-5"
                />
                <span className="font-semibold">Enable Live Scores</span>
              </label>
              <label className="flex items-center gap-3">
                <input
                  type="checkbox"
                  name="enableOnlineStore"
                  checked={settings.enableOnlineStore}
                  onChange={handleChange}
                  className="w-5 h-5"
                />
                <span className="font-semibold">Enable Online Store</span>
              </label>
              <label className="flex items-center gap-3">
                <input
                  type="checkbox"
                  name="enableMemberPortal"
                  checked={settings.enableMemberPortal}
                  onChange={handleChange}
                  className="w-5 h-5"
                />
                <span className="font-semibold">Enable Member Portal</span>
              </label>
              <label className="flex items-center gap-3">
                <input
                  type="checkbox"
                  name="enableCoachPortal"
                  checked={settings.enableCoachPortal}
                  onChange={handleChange}
                  className="w-5 h-5"
                />
                <span className="font-semibold">Enable Coach Portal</span>
              </label>
              <label className="flex items-center gap-3">
                <input
                  type="checkbox"
                  name="enableAdvertisements"
                  checked={settings.enableAdvertisements}
                  onChange={handleChange}
                  className="w-5 h-5"
                />
                <span className="font-semibold">Enable Advertisements on Homepage</span>
              </label>
            </div>
          </div>
        )}

        {/* Email Settings */}
        {activeTab === "email" && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold mb-4 text-green-900">Email Configuration</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold mb-2">Admin Email</label>
                <input
                  type="email"
                  name="adminEmail"
                  value={settings.adminEmail}
                  onChange={handleChange}
                  className="w-full border rounded px-3 py-2"
                />
              </div>
              <div>
                <label className="block font-semibold mb-2">Support Email</label>
                <input
                  type="email"
                  name="supportEmail"
                  value={settings.supportEmail}
                  onChange={handleChange}
                  className="w-full border rounded px-3 py-2"
                />
              </div>
              <div>
                <label className="block font-semibold mb-2">Noreply Email</label>
                <input
                  type="email"
                  name="noreplyEmail"
                  value={settings.noreplyEmail}
                  onChange={handleChange}
                  className="w-full border rounded px-3 py-2"
                />
              </div>
              <div>
                <label className="block font-semibold mb-2">Email Provider</label>
                <select
                  name="emailProvider"
                  value={settings.emailProvider}
                  onChange={handleChange}
                  className="w-full border rounded px-3 py-2"
                >
                  <option value="gmail">Gmail</option>
                  <option value="outlook">Outlook</option>
                  <option value="yahoo">Yahoo</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div>
                <label className="block font-semibold mb-2">Email Template Header</label>
                <textarea
                  name="emailTemplateHeader"
                  value={settings.emailTemplateHeader}
                  onChange={handleChange}
                  rows="4"
                  className="w-full border rounded px-3 py-2"
                />
              </div>
              <div>
                <label className="block font-semibold mb-2">Email Template Footer</label>
                <textarea
                  name="emailTemplateFooter"
                  value={settings.emailTemplateFooter}
                  onChange={handleChange}
                  rows="4"
                  className="w-full border rounded px-3 py-2"
                />
              </div>
              <div className="md:col-span-2">
                <label className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    name="emailNotifications"
                    checked={settings.emailNotifications}
                    onChange={handleChange}
                    className="w-5 h-5"
                  />
                  <span className="font-semibold">Enable Email Notifications</span>
                </label>
              </div>
              <div className="md:col-span-2">
                <label className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    name="enableTwoFactorAuth"
                    checked={settings.enableTwoFactorAuth}
                    onChange={handleChange}
                    className="w-5 h-5"
                  />
                  <span className="font-semibold">Enable Two-Factor Authentication</span>
                </label>
              </div>
              <div className="md:col-span-2">
                <label className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    name="requireEmailVerification"
                    checked={settings.requireEmailVerification}
                    onChange={handleChange}
                    className="w-5 h-5"
                  />
                  <span className="font-semibold">Require Email Verification for New Users</span>
                </label>
              </div>
              <div className="md:col-span-2">
                <label className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    name="enableRateLimiting"
                    checked={settings.enableRateLimiting}
                    onChange={handleChange}
                    className="w-5 h-5"
                  />
                  <span className="font-semibold">Enable Rate Limiting</span>
                </label>
              </div>
              <div className="md:col-span-2">
                <label className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    name="enableContentSecurityPolicy"
                    checked={settings.enableContentSecurityPolicy}
                    onChange={handleChange}
                    className="w-5 h-5"
                  />
                  <span className="font-semibold">Enable Content Security Policy</span>
                </label>
              </div>
            </div>
          </div>
        )}

        {/* Legal Settings */}
        {activeTab === "legal" && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold mb-4 text-green-900">Legal Pages</h2>
            <div className="space-y-4">
              <div>
                <label className="block font-semibold mb-2">Privacy Policy</label>
                <textarea
                  name="privacyPolicy"
                  value={settings.privacyPolicy}
                  onChange={handleChange}
                  rows="6"
                  className="w-full border rounded px-3 py-2"
                />
              </div>
              <div>
                <label className="block font-semibold mb-2">Terms of Service</label>
                <textarea
                  name="termsOfService"
                  value={settings.termsOfService}
                  onChange={handleChange}
                  rows="6"
                  className="w-full border rounded px-3 py-2"
                />
              </div>
              <div>
                <label className="block font-semibold mb-2">Cookie Policy</label>
                <textarea
                  name="cookiePolicy"
                  value={settings.cookiePolicy}
                  onChange={handleChange}
                  rows="4"
                  className="w-full border rounded px-3 py-2"
                />
              </div>
              <div>
                <label className="block font-semibold mb-2">Refund Policy</label>
                <textarea
                  name="refundPolicy"
                  value={settings.refundPolicy}
                  onChange={handleChange}
                  rows="4"
                  className="w-full border rounded px-3 py-2"
                />
              </div>
              <div>
                <label className="block font-semibold mb-2">Waiver Text</label>
                <textarea
                  name="waiverText"
                  value={settings.waiverText}
                  onChange={handleChange}
                  rows="4"
                  className="w-full border rounded px-3 py-2"
                />
              </div>
              <div className="md:col-span-2">
                <label className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    name="gdprCompliance"
                    checked={settings.gdprCompliance}
                    onChange={handleChange}
                    className="w-5 h-5"
                  />
                  <span className="font-semibold">GDPR Compliance</span>
                </label>
              </div>
              <div className="md:col-span-2">
                <label className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    name="ccpaCompliance"
                    checked={settings.ccpaCompliance}
                    onChange={handleChange}
                    className="w-5 h-5"
                  />
                  <span className="font-semibold">CCPA Compliance</span>
                </label>
              </div>
            </div>
          </div>
        )}

        {/* Footer Settings */}
        {activeTab === "footer" && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold mb-4 text-green-900">Footer Content Management</h2>
            
            {/* Footer Basic Information */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-green-800 mb-3">Basic Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold mb-2">Company Name</label>
                  <input
                    type="text"
                    name="footerCompanyName"
                    value={settings.footerCompanyName}
                    onChange={handleChange}
                    className="w-full border rounded px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-2">Tagline</label>
                  <input
                    type="text"
                    name="footerTagline"
                    value={settings.footerTagline}
                    onChange={handleChange}
                    className="w-full border rounded px-3 py-2"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block font-semibold mb-2">Description</label>
                  <textarea
                    name="footerDescription"
                    value={settings.footerDescription}
                    onChange={handleChange}
                    rows="3"
                    className="w-full border rounded px-3 py-2"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block font-semibold mb-2">Copyright Text</label>
                  <input
                    type="text"
                    name="footerCopyright"
                    value={settings.footerCopyright}
                    onChange={handleChange}
                    className="w-full border rounded px-3 py-2"
                  />
                </div>
              </div>
            </div>

            {/* Footer Links */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-green-800 mb-3">Footer Links</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold mb-2">Terms URL</label>
                  <input
                    type="text"
                    name="footerTermsUrl"
                    value={settings.footerTermsUrl}
                    onChange={handleChange}
                    className="w-full border rounded px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-2">Privacy URL</label>
                  <input
                    type="text"
                    name="footerPrivacyUrl"
                    value={settings.footerPrivacyUrl}
                    onChange={handleChange}
                    className="w-full border rounded px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-2">Cookie URL</label>
                  <input
                    type="text"
                    name="footerCookieUrl"
                    value={settings.footerCookieUrl}
                    onChange={handleChange}
                    className="w-full border rounded px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-2">Legal URL</label>
                  <input
                    type="text"
                    name="footerLegalUrl"
                    value={settings.footerLegalUrl}
                    onChange={handleChange}
                    className="w-full border rounded px-3 py-2"
                  />
                </div>
              </div>
            </div>

            {/* Footer Social Media */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-green-800 mb-3">Social Media Links</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold mb-2">Facebook URL</label>
                  <input
                    type="url"
                    name="footerFacebookUrl"
                    value={settings.footerFacebookUrl}
                    onChange={handleChange}
                    className="w-full border rounded px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-2">Instagram URL</label>
                  <input
                    type="url"
                    name="footerInstagramUrl"
                    value={settings.footerInstagramUrl}
                    onChange={handleChange}
                    className="w-full border rounded px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-2">Twitter URL</label>
                  <input
                    type="url"
                    name="footerTwitterUrl"
                    value={settings.footerTwitterUrl}
                    onChange={handleChange}
                    className="w-full border rounded px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-2">YouTube URL</label>
                  <input
                    type="url"
                    name="footerYoutubeUrl"
                    value={settings.footerYoutubeUrl}
                    onChange={handleChange}
                    className="w-full border rounded px-3 py-2"
                  />
                </div>
              </div>
            </div>

            {/* Footer Contact Information */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-green-800 mb-3">Contact Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold mb-2">Contact Email</label>
                  <input
                    type="email"
                    name="footerContactEmail"
                    value={settings.footerContactEmail}
                    onChange={handleChange}
                    className="w-full border rounded px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-2">Contact Phone</label>
                  <input
                    type="text"
                    name="footerContactPhone"
                    value={settings.footerContactPhone}
                    onChange={handleChange}
                    className="w-full border rounded px-3 py-2"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block font-semibold mb-2">Contact Address</label>
                  <input
                    type="text"
                    name="footerContactAddress"
                    value={settings.footerContactAddress}
                    onChange={handleChange}
                    className="w-full border rounded px-3 py-2"
                  />
                </div>
              </div>
            </div>

            {/* Footer Content Sections */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-green-800 mb-3">Content Sections</h3>
              <div className="space-y-4">
                <div>
                  <label className="block font-semibold mb-2">About Text</label>
                  <textarea
                    name="footerAboutText"
                    value={settings.footerAboutText}
                    onChange={handleChange}
                    rows="3"
                    className="w-full border rounded px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-2">Quick Links (comma-separated)</label>
                  <input
                    type="text"
                    name="footerQuickLinks"
                    value={settings.footerQuickLinks}
                    onChange={handleChange}
                    className="w-full border rounded px-3 py-2"
                    placeholder="About Us, Programs, Teams, Contact"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-2">Programs (comma-separated)</label>
                  <input
                    type="text"
                    name="footerPrograms"
                    value={settings.footerPrograms}
                    onChange={handleChange}
                    className="w-full border rounded px-3 py-2"
                    placeholder="Youth Programs, Competitive Teams, Training Camps"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-2">Support Links (comma-separated)</label>
                  <input
                    type="text"
                    name="footerSupport"
                    value={settings.footerSupport}
                    onChange={handleChange}
                    className="w-full border rounded px-3 py-2"
                    placeholder="Volunteer, Donate, Sponsor, Partner"
                  />
                </div>
              </div>
            </div>

            {/* Footer Newsletter */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-green-800 mb-3">Newsletter Section</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold mb-2">Newsletter Title</label>
                  <input
                    type="text"
                    name="footerNewsletterTitle"
                    value={settings.footerNewsletterTitle}
                    onChange={handleChange}
                    className="w-full border rounded px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-2">Newsletter Description</label>
                  <input
                    type="text"
                    name="footerNewsletterDescription"
                    value={settings.footerNewsletterDescription}
                    onChange={handleChange}
                    className="w-full border rounded px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-2">Placeholder Text</label>
                  <input
                    type="text"
                    name="footerNewsletterPlaceholder"
                    value={settings.footerNewsletterPlaceholder}
                    onChange={handleChange}
                    className="w-full border rounded px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-2">Button Text</label>
                  <input
                    type="text"
                    name="footerNewsletterButton"
                    value={settings.footerNewsletterButton}
                    onChange={handleChange}
                    className="w-full border rounded px-3 py-2"
                  />
                </div>
              </div>
            </div>

            {/* Footer Display Settings */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-green-800 mb-3">Display Settings</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      name="footerShowSocialMedia"
                      checked={settings.footerShowSocialMedia}
                      onChange={handleChange}
                      className="w-5 h-5"
                    />
                    <span className="font-semibold">Show Social Media</span>
                  </label>
                </div>
                <div>
                  <label className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      name="footerShowNewsletter"
                      checked={settings.footerShowNewsletter}
                      onChange={handleChange}
                      className="w-5 h-5"
                    />
                    <span className="font-semibold">Show Newsletter</span>
                  </label>
                </div>
                <div>
                  <label className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      name="footerShowQuickLinks"
                      checked={settings.footerShowQuickLinks}
                      onChange={handleChange}
                      className="w-5 h-5"
                    />
                    <span className="font-semibold">Show Quick Links</span>
                  </label>
                </div>
                <div>
                  <label className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      name="footerShowContact"
                      checked={settings.footerShowContact}
                      onChange={handleChange}
                      className="w-5 h-5"
                    />
                    <span className="font-semibold">Show Contact Info</span>
                  </label>
                </div>
                <div>
                  <label className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      name="footerShowPrograms"
                      checked={settings.footerShowPrograms}
                      onChange={handleChange}
                      className="w-5 h-5"
                    />
                    <span className="font-semibold">Show Programs</span>
                  </label>
                </div>
                <div>
                  <label className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      name="footerShowSupport"
                      checked={settings.footerShowSupport}
                      onChange={handleChange}
                      className="w-5 h-5"
                    />
                    <span className="font-semibold">Show Support Links</span>
                  </label>
                </div>
                <div>
                  <label className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      name="footerShowCopyright"
                      checked={settings.footerShowCopyright}
                      onChange={handleChange}
                      className="w-5 h-5"
                    />
                    <span className="font-semibold">Show Copyright</span>
                  </label>
                </div>
              </div>
            </div>

            {/* Footer Preview */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-green-800 mb-3">Footer Preview</h3>
              <div className="bg-gray-100 p-4 rounded-lg">
                <div className="text-sm text-gray-600">
                  <p><strong>{settings.footerCompanyName}</strong></p>
                  <p className="text-xs">{settings.footerTagline}</p>
                  <p className="text-xs mt-2">{settings.footerDescription}</p>
                  <p className="text-xs mt-4">{settings.footerCopyright}</p>
                </div>
              </div>
            </div>

            {/* Footer Page Content Management */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-green-800 mb-3">Page Content Management</h3>
              <p className="text-sm text-gray-600 mb-4">Manage the content of your legal pages directly from here.</p>
              
              <div className="space-y-6">
                {/* Terms of Service Page */}
                <div className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-md font-semibold text-green-700">Terms of Service Page</h4>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => setActiveTab("terms-content")}
                        className="px-3 py-1 text-sm bg-green-600 text-white rounded hover:bg-green-700 transition"
                      >
                        Edit Content
                      </button>
                      <a
                        href="/terms"
                        target="_blank"
                        className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition"
                      >
                        View Page
                      </a>
                    </div>
                  </div>
                  <div className="text-sm text-gray-600">
                    <p><strong>URL:</strong> {settings.footerTermsUrl}</p>
                    <p><strong>Status:</strong> <span className="text-green-600">Active</span></p>
                    <p><strong>Last Updated:</strong> {new Date().toLocaleDateString()}</p>
                  </div>
                </div>

                {/* Privacy Policy Page */}
                <div className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-md font-semibold text-green-700">Privacy Policy Page</h4>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => setActiveTab("privacy-content")}
                        className="px-3 py-1 text-sm bg-green-600 text-white rounded hover:bg-green-700 transition"
                      >
                        Edit Content
                      </button>
                      <a
                        href="/privacy"
                        target="_blank"
                        className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition"
                      >
                        View Page
                      </a>
                    </div>
                  </div>
                  <div className="text-sm text-gray-600">
                    <p><strong>URL:</strong> {settings.footerPrivacyUrl}</p>
                    <p><strong>Status:</strong> <span className="text-green-600">Active</span></p>
                    <p><strong>Last Updated:</strong> {new Date().toLocaleDateString()}</p>
                  </div>
                </div>

                {/* Cookie Policy Page */}
                <div className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-md font-semibold text-green-700">Cookie Policy Page</h4>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => setActiveTab("cookie-content")}
                        className="px-3 py-1 text-sm bg-green-600 text-white rounded hover:bg-green-700 transition"
                      >
                        Edit Content
                      </button>
                      <a
                        href="/cookie"
                        target="_blank"
                        className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition"
                      >
                        View Page
                      </a>
                    </div>
                  </div>
                  <div className="text-sm text-gray-600">
                    <p><strong>URL:</strong> {settings.footerCookieUrl}</p>
                    <p><strong>Status:</strong> <span className="text-yellow-600">Not Created</span></p>
                    <p><strong>Last Updated:</strong> Never</p>
                  </div>
                </div>

                {/* Legal Information Page */}
                <div className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-md font-semibold text-green-700">Legal Information Page</h4>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => setActiveTab("legal-content")}
                        className="px-3 py-1 text-sm bg-green-600 text-white rounded hover:bg-green-700 transition"
                      >
                        Edit Content
                      </button>
                      <a
                        href="/legal"
                        target="_blank"
                        className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition"
                      >
                        View Page
                      </a>
                    </div>
                  </div>
                  <div className="text-sm text-gray-600">
                    <p><strong>URL:</strong> {settings.footerLegalUrl}</p>
                    <p><strong>Status:</strong> <span className="text-yellow-600">Not Created</span></p>
                    <p><strong>Last Updated:</strong> Never</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Terms of Service Content Editor */}
        {activeTab === "terms-content" && (
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-green-900">Terms of Service Content Editor</h2>
              <button
                type="button"
                onClick={() => setActiveTab("footer")}
                className="px-4 py-2 text-sm bg-gray-600 text-white rounded hover:bg-gray-700 transition"
              >
                ← Back to Footer
              </button>
            </div>
            
            <div className="space-y-6">
              <div>
                <label className="block font-semibold mb-2">Page Title</label>
                <input
                  type="text"
                  name="termsPageTitle"
                  value={settings.termsPageTitle || "Terms of Service"}
                  onChange={handleChange}
                  className="w-full border rounded px-3 py-2"
                />
              </div>
              
              <div>
                <label className="block font-semibold mb-2">Page Content (HTML)</label>
                <textarea
                  name="termsPageContent"
                  value={settings.termsPageContent || ""}
                  onChange={handleChange}
                  rows="20"
                  className="w-full border rounded px-3 py-2 font-mono text-sm"
                  placeholder="Enter your Terms of Service content here. You can use HTML formatting."
                />
              </div>
              
              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={() => {
                    // Load default terms content
                    setSettings(prev => ({
                      ...prev,
                      termsPageContent: `<!-- Default Terms of Service Content -->
<h1>Terms of Service</h1>
<p>Last updated: ${new Date().toLocaleDateString()}</p>

<section>
  <h2>1. Acceptance of Terms</h2>
  <p>By accessing and using the Seattle Leopards FC website and services, you accept and agree to be bound by the terms and provision of this agreement.</p>
</section>

<section>
  <h2>2. Use License</h2>
  <p>Permission is granted to temporarily download one copy of the materials on Seattle Leopards FC's website for personal, non-commercial transitory viewing only.</p>
</section>

<section>
  <h2>3. Disclaimer</h2>
  <p>The materials on Seattle Leopards FC's website are provided on an 'as is' basis. Seattle Leopards FC makes no warranties, expressed or implied, and hereby disclaims and negates all other warranties including without limitation, implied warranties or conditions of merchantability, fitness for a particular purpose, or non-infringement of intellectual property or other violation of rights.</p>
</section>

<section>
  <h2>4. Limitations</h2>
  <p>In no event shall Seattle Leopards FC or its suppliers be liable for any damages (including, without limitation, damages for loss of data or profit, or due to business interruption) arising out of the use or inability to use the materials on Seattle Leopards FC's website.</p>
</section>

<section>
  <h2>5. Contact Information</h2>
  <p>If you have any questions about these Terms of Service, please contact us at info@seattleleopardsfc.com</p>
</section>`
                    }));
                  }}
                  className="px-4 py-2 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition"
                >
                  Load Default Content
                </button>
                <a
                  href="/terms"
                  target="_blank"
                  className="px-4 py-2 text-sm bg-green-600 text-white rounded hover:bg-green-700 transition"
                >
                  Preview Page
                </a>
              </div>
            </div>
          </div>
        )}

        {/* Privacy Policy Content Editor */}
        {activeTab === "privacy-content" && (
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-green-900">Privacy Policy Content Editor</h2>
              <button
                type="button"
                onClick={() => setActiveTab("footer")}
                className="px-4 py-2 text-sm bg-gray-600 text-white rounded hover:bg-gray-700 transition"
              >
                ← Back to Footer
              </button>
            </div>
            
            <div className="space-y-6">
              <div>
                <label className="block font-semibold mb-2">Page Title</label>
                <input
                  type="text"
                  name="privacyPageTitle"
                  value={settings.privacyPageTitle || "Privacy Policy"}
                  onChange={handleChange}
                  className="w-full border rounded px-3 py-2"
                />
              </div>
              
              <div>
                <label className="block font-semibold mb-2">Page Content (HTML)</label>
                <textarea
                  name="privacyPageContent"
                  value={settings.privacyPageContent || ""}
                  onChange={handleChange}
                  rows="20"
                  className="w-full border rounded px-3 py-2 font-mono text-sm"
                  placeholder="Enter your Privacy Policy content here. You can use HTML formatting."
                />
              </div>
              
              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={() => {
                    // Load default privacy content
                    setSettings(prev => ({
                      ...prev,
                      privacyPageContent: `<!-- Default Privacy Policy Content -->
<h1>Privacy Policy</h1>
<p>Last updated: ${new Date().toLocaleDateString()}</p>

<section>
  <h2>1. Information We Collect</h2>
  <p>We collect information you provide directly to us, such as when you create an account, register for programs, or contact us for support.</p>
</section>

<section>
  <h2>2. How We Use Your Information</h2>
  <p>We use the information we collect to provide, maintain, and improve our services, communicate with you, and ensure the safety of our participants.</p>
</section>

<section>
  <h2>3. Information Sharing</h2>
  <p>We do not sell, trade, or otherwise transfer your personal information to third parties without your consent, except as described in this policy.</p>
</section>

<section>
  <h2>4. Data Security</h2>
  <p>We implement appropriate security measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction.</p>
</section>

<section>
  <h2>5. Your Rights</h2>
  <p>You have the right to access, correct, or delete your personal information. You may also opt out of certain communications from us.</p>
</section>

<section>
  <h2>6. Contact Us</h2>
  <p>If you have questions about this Privacy Policy, please contact us at privacy@seattleleopardsfc.com</p>
</section>`
                    }));
                  }}
                  className="px-4 py-2 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition"
                >
                  Load Default Content
                </button>
                <a
                  href="/privacy"
                  target="_blank"
                  className="px-4 py-2 text-sm bg-green-600 text-white rounded hover:bg-green-700 transition"
                >
                  Preview Page
                </a>
              </div>
            </div>
          </div>
        )}

        {/* Cookie Policy Content Editor */}
        {activeTab === "cookie-content" && (
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-green-900">Cookie Policy Content Editor</h2>
              <button
                type="button"
                onClick={() => setActiveTab("footer")}
                className="px-4 py-2 text-sm bg-gray-600 text-white rounded hover:bg-gray-700 transition"
              >
                ← Back to Footer
              </button>
            </div>
            
            <div className="space-y-6">
              <div>
                <label className="block font-semibold mb-2">Page Title</label>
                <input
                  type="text"
                  name="cookiePageTitle"
                  value={settings.cookiePageTitle || "Cookie Policy"}
                  onChange={handleChange}
                  className="w-full border rounded px-3 py-2"
                />
              </div>
              
              <div>
                <label className="block font-semibold mb-2">Page Content (HTML)</label>
                <textarea
                  name="cookiePageContent"
                  value={settings.cookiePageContent || ""}
                  onChange={handleChange}
                  rows="20"
                  className="w-full border rounded px-3 py-2 font-mono text-sm"
                  placeholder="Enter your Cookie Policy content here. You can use HTML formatting."
                />
              </div>
              
              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={() => {
                                         // Load default cookie content
                     setSettings(prev => ({
                       ...prev,
                       cookiePageContent: `<!-- Default Cookie Policy Content -->
<h1>Cookie Policy</h1>
<p>Last updated: ${new Date().toLocaleDateString()}</p>

<section>
  <h2>1. What Are Cookies and Tracking Technologies</h2>
  <p>Cookies are small text files that are stored on your device (computer, tablet, or mobile) when you visit our website. They help us provide you with a better experience by remembering your preferences, analyzing site usage, and personalizing content. We also use similar tracking technologies such as web beacons, pixel tags, and local storage.</p>
</section>

<section>
  <h2>2. Why We Use Cookies</h2>
  <p>We use cookies and tracking technologies for several important purposes:</p>
  <ul>
    <li><strong>Essential Functionality:</strong> To make our website work properly and securely</li>
    <li><strong>User Experience:</strong> To remember your preferences and provide personalized content</li>
    <li><strong>Analytics:</strong> To understand how visitors use our website and improve our services</li>
    <li><strong>Security:</strong> To protect against fraud and ensure secure transactions</li>
    <li><strong>Performance:</strong> To optimize website speed and functionality</li>
  </ul>
</section>

<section>
  <h2>3. Types of Cookies We Use</h2>
  
  <h3>Essential Cookies (Always Active)</h3>
  <p>These cookies are necessary for the website to function properly and cannot be disabled. They include:</p>
  <ul>
    <li><strong>Authentication Cookies:</strong> Keep you logged in during your session</li>
    <li><strong>Security Cookies:</strong> Protect against fraud and ensure secure transactions</li>
    <li><strong>Session Cookies:</strong> Maintain your session while browsing our site</li>
    <li><strong>Load Balancing Cookies:</strong> Distribute website traffic across servers</li>
  </ul>

  <h3>Performance and Analytics Cookies</h3>
  <p>These cookies help us understand how visitors interact with our website:</p>
  <ul>
    <li><strong>Google Analytics:</strong> Track page views, user behavior, and website performance</li>
    <li><strong>Heat Mapping:</strong> Understand which areas of our site are most popular</li>
    <li><strong>Error Tracking:</strong> Identify and fix technical issues quickly</li>
    <li><strong>Performance Monitoring:</strong> Ensure our website loads quickly and efficiently</li>
  </ul>

  <h3>Functional Cookies</h3>
  <p>These cookies enhance your experience by remembering your preferences:</p>
  <ul>
    <li><strong>Language Preferences:</strong> Remember your preferred language</li>
    <li><strong>Theme Settings:</strong> Remember your display preferences</li>
    <li><strong>Form Data:</strong> Remember information you've entered in forms</li>
    <li><strong>Shopping Cart:</strong> Remember items in your cart (if applicable)</li>
  </ul>

  <h3>Marketing and Advertising Cookies</h3>
  <p>These cookies help us deliver relevant content and advertisements:</p>
  <ul>
    <li><strong>Social Media Integration:</strong> Enable sharing on social platforms</li>
    <li><strong>Retargeting:</strong> Show relevant content based on your interests</li>
    <li><strong>Email Marketing:</strong> Track email campaign effectiveness</li>
    <li><strong>Partner Integration:</strong> Work with trusted third-party services</li>
  </ul>
</section>

<section>
  <h2>4. Third-Party Cookies</h2>
  <p>Some cookies are placed by third-party services that appear on our pages:</p>
  <ul>
    <li><strong>Payment Processors:</strong> Stripe, PayPal for secure transactions</li>
    <li><strong>Social Media:</strong> Facebook, Instagram, Twitter for sharing features</li>
    <li><strong>Analytics Services:</strong> Google Analytics, Facebook Pixel for insights</li>
    <li><strong>Email Services:</strong> Mailchimp, Constant Contact for newsletters</li>
  </ul>
  <p>These third parties have their own privacy policies and cookie practices.</p>
</section>

<section>
  <h2>5. Cookie Duration</h2>
  <p>Cookies on our website have different lifespans:</p>
  <ul>
    <li><strong>Session Cookies:</strong> Deleted when you close your browser</li>
    <li><strong>Persistent Cookies:</strong> Remain on your device for a set period (up to 2 years)</li>
    <li><strong>Essential Cookies:</strong> May persist longer for security purposes</li>
  </ul>
</section>

<section>
  <h2>6. Managing Your Cookie Preferences</h2>
  
  <h3>Browser Settings</h3>
  <p>You can control cookies through your browser settings:</p>
  <ul>
    <li><strong>Chrome:</strong> Settings → Privacy and Security → Cookies and other site data</li>
    <li><strong>Firefox:</strong> Options → Privacy & Security → Cookies and Site Data</li>
    <li><strong>Safari:</strong> Preferences → Privacy → Manage Website Data</li>
    <li><strong>Edge:</strong> Settings → Cookies and site permissions → Cookies and site data</li>
  </ul>

  <h3>Cookie Consent</h3>
  <p>When you first visit our website, you'll see a cookie consent banner. You can:</p>
  <ul>
    <li>Accept all cookies for the best experience</li>
    <li>Customize your preferences</li>
    <li>Reject non-essential cookies</li>
    <li>Change your preferences at any time</li>
  </ul>

  <h3>Opt-Out Options</h3>
  <p>You can opt out of certain tracking:</p>
  <ul>
    <li><strong>Google Analytics:</strong> Use the Google Analytics Opt-out Browser Add-on</li>
    <li><strong>Facebook Pixel:</strong> Adjust your Facebook ad preferences</li>
    <li><strong>Email Marketing:</strong> Unsubscribe from our email lists</li>
  </ul>
</section>

<section>
  <h2>7. Impact of Disabling Cookies</h2>
  <p>While you can disable cookies, this may affect your experience:</p>
  <ul>
    <li><strong>Essential Features:</strong> Some website functions may not work properly</li>
    <li><strong>Personalization:</strong> Content may not be tailored to your preferences</li>
    <li><strong>Security:</strong> Some security features may be limited</li>
    <li><strong>Performance:</strong> Website may load slower or have issues</li>
  </ul>
</section>

<section>
  <h2>8. Children's Privacy and Cookies</h2>
  <p>We are committed to protecting children's privacy:</p>
  <ul>
    <li>We do not knowingly collect personal information from children under 13</li>
    <li>We limit tracking on pages designed for children</li>
    <li>Parents can control their child's cookie preferences</li>
    <li>We comply with COPPA and other children's privacy laws</li>
  </ul>
</section>

<section>
  <h2>9. Updates to This Cookie Policy</h2>
  <p>We may update this Cookie Policy from time to time to reflect changes in our practices or for legal reasons. We will notify you of any material changes by:</p>
  <ul>
    <li>Posting the updated policy on our website</li>
    <li>Sending email notifications to registered users</li>
    <li>Displaying a notice on our website</li>
  </ul>
  <p>Continued use of our website after changes constitutes acceptance of the updated policy.</p>
</section>

<section>
  <h2>10. Contact Information</h2>
  <p>If you have questions about our use of cookies or this Cookie Policy, please contact us:</p>
  <ul>
    <li><strong>Email:</strong> privacy@seattleleopardsfc.com</li>
    <li><strong>Phone:</strong> (206) 555-0123</li>
    <li><strong>Address:</strong> 123 Soccer Way, Seattle, WA 98101</li>
  </ul>
  <p>We're committed to transparency and will respond to your inquiries within 30 days.</p>
</section>`
                    }));
                  }}
                  className="px-4 py-2 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition"
                >
                  Load Default Content
                </button>
                <a
                  href="/cookie"
                  target="_blank"
                  className="px-4 py-2 text-sm bg-green-600 text-white rounded hover:bg-green-700 transition"
                >
                  Preview Page
                </a>
              </div>
            </div>
          </div>
        )}

        {/* Legal Information Content Editor */}
        {activeTab === "legal-content" && (
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-green-900">Legal Information Content Editor</h2>
              <button
                type="button"
                onClick={() => setActiveTab("footer")}
                className="px-4 py-2 text-sm bg-gray-600 text-white rounded hover:bg-gray-700 transition"
              >
                ← Back to Footer
              </button>
            </div>
            
            <div className="space-y-6">
              <div>
                <label className="block font-semibold mb-2">Page Title</label>
                <input
                  type="text"
                  name="legalPageTitle"
                  value={settings.legalPageTitle || "Legal Information"}
                  onChange={handleChange}
                  className="w-full border rounded px-3 py-2"
                />
              </div>
              
              <div>
                <label className="block font-semibold mb-2">Page Content (HTML)</label>
                <textarea
                  name="legalPageContent"
                  value={settings.legalPageContent || ""}
                  onChange={handleChange}
                  rows="20"
                  className="w-full border rounded px-3 py-2 font-mono text-sm"
                  placeholder="Enter your Legal Information content here. You can use HTML formatting."
                />
              </div>
              
              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={() => {
                                         // Load default legal content
                     setSettings(prev => ({
                       ...prev,
                       legalPageContent: `<!-- Default Legal Information Content -->
<h1>Legal Information</h1>
<p>Last updated: ${new Date().toLocaleDateString()}</p>

<section>
  <h2>1. Organization Information</h2>
  <p>Seattle Leopards FC is a registered youth soccer organization operating in Seattle, Washington. We are committed to providing a safe, inclusive, and development-focused environment for young athletes.</p>
  
  <h3>Legal Status</h3>
  <ul>
    <li><strong>Organization Type:</strong> Youth Sports Organization</li>
    <li><strong>Registration:</strong> Registered with Washington State</li>
    <li><strong>Tax Status:</strong> Non-profit organization</li>
    <li><strong>Operating Location:</strong> Seattle, Washington, USA</li>
  </ul>
</section>

<section>
  <h2>2. Governing Documents and Policies</h2>
  <p>Our organization operates under comprehensive governing documents and policies that ensure transparency, accountability, and proper management.</p>
  
  <h3>Bylaws and Constitution</h3>
  <ul>
    <li><strong>Organizational Bylaws:</strong> Define our structure, governance, and operational procedures</li>
    <li><strong>Code of Conduct:</strong> Establishes behavioral standards for all members</li>
    <li><strong>Conflict of Interest Policy:</strong> Ensures fair and ethical decision-making</li>
    <li><strong>Financial Policies:</strong> Govern fiscal responsibility and transparency</li>
  </ul>
  
  <h3>Program Policies</h3>
  <ul>
    <li><strong>Player Development Policy:</strong> Outlines our approach to youth development</li>
    <li><strong>Safety and Risk Management:</strong> Comprehensive safety protocols</li>
    <li><strong>Anti-Discrimination Policy:</strong> Ensures equal opportunity and inclusion</li>
    <li><strong>Harassment Prevention:</strong> Zero-tolerance policy for harassment</li>
  </ul>
</section>

<section>
  <h2>3. Legal Compliance and Regulations</h2>
  <p>We maintain strict compliance with all applicable laws and regulations governing youth sports organizations.</p>
  
  <h3>Federal Compliance</h3>
  <ul>
    <li><strong>Title IX:</strong> Ensuring equal opportunities regardless of gender</li>
    <li><strong>ADA Compliance:</strong> Providing accessible programs for all abilities</li>
    <li><strong>Child Protection Laws:</strong> Safeguarding minors in our programs</li>
    <li><strong>Tax Regulations:</strong> Maintaining proper non-profit status</li>
  </ul>
  
  <h3>State and Local Compliance</h3>
  <ul>
    <li><strong>Washington State Youth Sports Laws:</strong> Compliance with state regulations</li>
    <li><strong>Seattle Municipal Codes:</strong> Adherence to local ordinances</li>
    <li><strong>Health and Safety Regulations:</strong> Meeting all safety requirements</li>
    <li><strong>Insurance Requirements:</strong> Maintaining adequate coverage</li>
  </ul>
  
  <h3>Sports Governing Bodies</h3>
  <ul>
    <li><strong>US Youth Soccer:</strong> Following national youth soccer guidelines</li>
    <li><strong>Washington Youth Soccer:</strong> Compliance with state soccer association</li>
    <li><strong>Local League Rules:</strong> Adherence to competition regulations</li>
  </ul>
</section>

<section>
  <h2>4. Dispute Resolution and Grievance Procedures</h2>
  <p>We have established comprehensive procedures for addressing concerns and resolving disputes fairly and efficiently.</p>
  
  <h3>Grievance Process</h3>
  <ol>
    <li><strong>Informal Resolution:</strong> Direct communication with involved parties</li>
    <li><strong>Mediation:</strong> Facilitated discussion with neutral mediator</li>
    <li><strong>Formal Review:</strong> Written complaint and investigation process</li>
    <li><strong>Appeal Process:</strong> Right to appeal decisions</li>
  </ol>
  
  <h3>Types of Disputes Covered</h3>
  <ul>
    <li><strong>Program Participation:</strong> Team selection and playing time</li>
    <li><strong>Financial Matters:</strong> Fees, refunds, and financial assistance</li>
    <li><strong>Code of Conduct:</strong> Behavioral issues and disciplinary actions</li>
    <li><strong>Safety Concerns:</strong> Equipment, facilities, and supervision</li>
    <li><strong>Discrimination:</strong> Equal opportunity and inclusion issues</li>
  </ul>
  
  <h3>External Resources</h3>
  <ul>
    <li><strong>Washington State Attorney General:</strong> For consumer protection issues</li>
    <li><strong>US Youth Soccer:</strong> For soccer-specific disputes</li>
    <li><strong>Local Mediation Services:</strong> For facilitated resolution</li>
  </ul>
</section>

<section>
  <h2>5. Insurance and Liability</h2>
  <p>We maintain comprehensive insurance coverage to protect our organization, staff, volunteers, and participants.</p>
  
  <h3>Insurance Coverage</h3>
  <ul>
    <li><strong>General Liability:</strong> Protection against accidents and injuries</li>
    <li><strong>Directors and Officers:</strong> Coverage for board members and leadership</li>
    <li><strong>Professional Liability:</strong> Protection for coaches and staff</li>
    <li><strong>Property Insurance:</strong> Coverage for equipment and facilities</li>
  </ul>
  
  <h3>Participant Responsibilities</h3>
  <ul>
    <li><strong>Medical Clearance:</strong> Required health documentation</li>
    <li><strong>Emergency Contacts:</strong> Updated contact information</li>
    <li><strong>Waiver and Release:</strong> Understanding of inherent risks</li>
    <li><strong>Code of Conduct:</strong> Agreement to behavioral standards</li>
  </ul>
</section>

<section>
  <h2>6. Financial Transparency and Accountability</h2>
  <p>We are committed to financial transparency and proper stewardship of our resources.</p>
  
  <h3>Financial Reporting</h3>
  <ul>
    <li><strong>Annual Reports:</strong> Published financial statements</li>
    <li><strong>Tax Filings:</strong> Public access to tax documents</li>
    <li><strong>Budget Transparency:</strong> Clear allocation of resources</li>
    <li><strong>Audit Procedures:</strong> Regular financial reviews</li>
  </ul>
  
  <h3>Fee Structure and Financial Assistance</h3>
  <ul>
    <li><strong>Transparent Pricing:</strong> Clear fee breakdown and policies</li>
    <li><strong>Scholarship Programs:</strong> Need-based financial assistance</li>
    <li><strong>Payment Plans:</strong> Flexible payment options</li>
    <li><strong>Refund Policies:</strong> Clear refund and cancellation terms</li>
  </ul>
</section>

<section>
  <h2>7. Intellectual Property and Trademarks</h2>
  <p>We protect our intellectual property while respecting the rights of others.</p>
  
  <h3>Our Intellectual Property</h3>
  <ul>
    <li><strong>Club Name and Logo:</strong> Registered trademarks</li>
    <li><strong>Program Materials:</strong> Copyrighted training resources</li>
    <li><strong>Website Content:</strong> Protected digital materials</li>
    <li><strong>Photography and Media:</strong> Usage rights and permissions</li>
  </ul>
  
  <h3>Usage Guidelines</h3>
  <ul>
    <li><strong>Logo Usage:</strong> Guidelines for club branding</li>
    <li><strong>Photo Permissions:</strong> Consent requirements for images</li>
    <li><strong>Social Media:</strong> Guidelines for online content</li>
    <li><strong>Third-Party Use:</strong> Permission requirements for external use</li>
  </ul>
</section>

<section>
  <h2>8. Contact Information for Legal Matters</h2>
  <p>For legal inquiries, compliance questions, or formal complaints, please contact us through the appropriate channels.</p>
  
  <h3>Legal Contact Information</h3>
  <ul>
    <li><strong>Legal Inquiries:</strong> legal@seattleleopardsfc.com</li>
    <li><strong>Compliance Questions:</strong> compliance@seattleleopardsfc.com</li>
    <li><strong>Formal Complaints:</strong> complaints@seattleleopardsfc.com</li>
    <li><strong>General Contact:</strong> info@seattleleopardsfc.com</li>
  </ul>
  
  <h3>Mailing Address</h3>
  <p>
    Seattle Leopards FC<br />
    Attn: Legal Department<br />
    123 Soccer Way<br />
    Seattle, WA 98101<br />
    United States
  </p>
  
  <h3>Response Timeline</h3>
  <ul>
    <li><strong>General Inquiries:</strong> Response within 3-5 business days</li>
    <li><strong>Formal Complaints:</strong> Acknowledgment within 2 business days</li>
    <li><strong>Legal Matters:</strong> Response within 1-2 business days</li>
    <li><strong>Emergency Issues:</strong> Immediate attention for safety concerns</li>
  </ul>
</section>

<section>
  <h2>9. Updates to Legal Information</h2>
  <p>This legal information may be updated periodically to reflect changes in our organization, policies, or applicable laws.</p>
  
  <h3>Notification of Changes</h3>
  <ul>
    <li><strong>Website Updates:</strong> Changes posted on our website</li>
    <li><strong>Member Notification:</strong> Email notifications for significant changes</li>
    <li><strong>Public Notice:</strong> Announcements for major policy changes</li>
    <li><strong>Effective Dates:</strong> Clear indication of when changes take effect</li>
  </ul>
  
  <p><strong>Last Updated:</strong> ${new Date().toLocaleDateString()}</p>
  <p><strong>Next Review Date:</strong> ${new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toLocaleDateString()}</p>
</section>`
                    }));
                  }}
                  className="px-4 py-2 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition"
                >
                  Load Default Content
                </button>
                <a
                  href="/legal"
                  target="_blank"
                  className="px-4 py-2 text-sm bg-green-600 text-white rounded hover:bg-green-700 transition"
                >
                  Preview Page
                </a>
              </div>
            </div>
          </div>
        )}

        {/* Advertisements Management */}
        {activeTab === "advertisements" && (
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-green-900">Advertisement Management</h2>
              <button
                type="button"
                onClick={() => setActiveTab("advertisement-create")}
                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition"
              >
                + Add New Advertisement
              </button>
            </div>
            
            <div className="mb-6">
              <p className="text-sm text-gray-600 mb-4">
                Manage advertisements that appear in the right sidebar of your homepage. 
                These can include events, merchandise, news, and other club updates.
              </p>
            </div>

            {/* Advertisements List */}
            <div className="space-y-4">
              <div className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-md font-semibold text-green-700">Spring Tryouts 2024</h4>
                  <div className="flex gap-2">
                    <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded">Event</span>
                    <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded">Active</span>
                  </div>
                </div>
                <div className="text-sm text-gray-600 mb-3">
                  <p><strong>Type:</strong> Event</p>
                  <p><strong>Views:</strong> 1,234</p>
                  <p><strong>Clicks:</strong> 89</p>
                  <p><strong>CTR:</strong> 7.2%</p>
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setActiveTab("advertisement-edit-1")}
                    className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition"
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    className="px-3 py-1 text-sm bg-yellow-600 text-white rounded hover:bg-yellow-700 transition"
                  >
                    Toggle
                  </button>
                  <button
                    type="button"
                    className="px-3 py-1 text-sm bg-red-600 text-white rounded hover:bg-red-700 transition"
                  >
                    Delete
                  </button>
                </div>
              </div>

              <div className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-md font-semibold text-green-700">New Team Jerseys</h4>
                  <div className="flex gap-2">
                    <span className="px-2 py-1 text-xs bg-purple-100 text-purple-800 rounded">Merchandise</span>
                    <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded">Active</span>
                  </div>
                </div>
                <div className="text-sm text-gray-600 mb-3">
                  <p><strong>Type:</strong> Merchandise</p>
                  <p><strong>Views:</strong> 856</p>
                  <p><strong>Clicks:</strong> 67</p>
                  <p><strong>CTR:</strong> 7.8%</p>
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setActiveTab("advertisement-edit-2")}
                    className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition"
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    className="px-3 py-1 text-sm bg-yellow-600 text-white rounded hover:bg-yellow-700 transition"
                  >
                    Toggle
                  </button>
                  <button
                    type="button"
                    className="px-3 py-1 text-sm bg-red-600 text-white rounded hover:bg-red-700 transition"
                  >
                    Delete
                  </button>
                </div>
              </div>

              <div className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-md font-semibold text-green-700">Summer Soccer Camp</h4>
                  <div className="flex gap-2">
                    <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded">Event</span>
                    <span className="px-2 py-1 text-xs bg-gray-100 text-gray-800 rounded">Inactive</span>
                  </div>
                </div>
                <div className="text-sm text-gray-600 mb-3">
                  <p><strong>Type:</strong> Event</p>
                  <p><strong>Views:</strong> 543</p>
                  <p><strong>Clicks:</strong> 34</p>
                  <p><strong>CTR:</strong> 6.3%</p>
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setActiveTab("advertisement-edit-3")}
                    className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition"
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    className="px-3 py-1 text-sm bg-yellow-600 text-white rounded hover:bg-yellow-700 transition"
                  >
                    Toggle
                  </button>
                  <button
                    type="button"
                    className="px-3 py-1 text-sm bg-red-600 text-white rounded hover:bg-red-700 transition"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>

            {/* Analytics Summary */}
            <div className="mt-8 p-4 bg-gray-50 rounded-lg">
              <h3 className="text-lg font-semibold text-green-800 mb-3">Analytics Summary</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">3</div>
                  <div className="text-sm text-gray-600">Total Ads</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">2</div>
                  <div className="text-sm text-gray-600">Active</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">2,633</div>
                  <div className="text-sm text-gray-600">Total Views</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-600">190</div>
                  <div className="text-sm text-gray-600">Total Clicks</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* SEO Settings */}
        {activeTab === "seo" && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold mb-4 text-green-900">SEO & Analytics</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold mb-2">Site Title</label>
                <input
                  type="text"
                  name="siteTitle"
                  value={settings.siteTitle}
                  onChange={handleChange}
                  className="w-full border rounded px-3 py-2"
                />
              </div>
              <div>
                <label className="block font-semibold mb-2">Meta Description</label>
                <textarea
                  name="siteDescription"
                  value={settings.siteDescription}
                  onChange={handleChange}
                  rows="3"
                  className="w-full border rounded px-3 py-2"
                />
              </div>
              <div>
                <label className="block font-semibold mb-2">Meta Keywords</label>
                <input
                  type="text"
                  name="siteKeywords"
                  value={settings.siteKeywords}
                  onChange={handleChange}
                  className="w-full border rounded px-3 py-2"
                  placeholder="keyword1, keyword2, keyword3"
                />
              </div>
              <div>
                <label className="block font-semibold mb-2">Meta Image URL</label>
                <input
                  type="url"
                  name="metaImageUrl"
                  value={settings.metaImageUrl}
                  onChange={handleChange}
                  className="w-full border rounded px-3 py-2"
                  placeholder="https://example.com/image.jpg"
                />
              </div>
              <div>
                <label className="block font-semibold mb-2">Google Analytics ID</label>
                <input
                  type="text"
                  name="googleAnalyticsId"
                  value={settings.googleAnalyticsId}
                  onChange={handleChange}
                  className="w-full border rounded px-3 py-2"
                  placeholder="G-XXXXXXXXXX"
                />
              </div>
              <div>
                <label className="block font-semibold mb-2">Facebook Pixel ID</label>
                <input
                  type="text"
                  name="facebookPixelId"
                  value={settings.facebookPixelId}
                  onChange={handleChange}
                  className="w-full border rounded px-3 py-2"
                  placeholder="XXXXXXXXXX"
                />
              </div>
              <div>
                <label className="block font-semibold mb-2">Google Tag Manager ID</label>
                <input
                  type="text"
                  name="googleTagManagerId"
                  value={settings.googleTagManagerId}
                  onChange={handleChange}
                  className="w-full border rounded px-3 py-2"
                  placeholder="GTM-XXXXXXXXXX"
                />
              </div>
              <div>
                <label className="block font-semibold mb-2">Bing Webmaster Tools</label>
                <input
                  type="text"
                  name="bingWebmasterTools"
                  value={settings.bingWebmasterTools}
                  onChange={handleChange}
                  className="w-full border rounded px-3 py-2"
                  placeholder="Your-Bing-Webmaster-Verification-Code"
                />
              </div>
              <div>
                <label className="block font-semibold mb-2">Yandex Metrika</label>
                <input
                  type="text"
                  name="yandexMetrika"
                  value={settings.yandexMetrika}
                  onChange={handleChange}
                  className="w-full border rounded px-3 py-2"
                  placeholder="Your-Yandex-Metrika-Code"
                />
              </div>
              <div>
                <label className="block font-semibold mb-2">Structured Data</label>
                <textarea
                  name="structuredData"
                  value={settings.structuredData}
                  onChange={handleChange}
                  rows="6"
                  className="w-full border rounded px-3 py-2"
                />
              </div>
              <div>
                <label className="block font-semibold mb-2">Canonical URL</label>
                <input
                  type="url"
                  name="canonicalUrl"
                  value={settings.canonicalUrl}
                  onChange={handleChange}
                  className="w-full border rounded px-3 py-2"
                  placeholder="https://www.seattleleopardsfc.com"
                />
              </div>
              <div>
                <label className="block font-semibold mb-2">Robots.txt</label>
                <textarea
                  name="robotsTxt"
                  value={settings.robotsTxt}
                  onChange={handleChange}
                  rows="4"
                  className="w-full border rounded px-3 py-2"
                />
              </div>
              <div>
                <label className="block font-semibold mb-2">Sitemap URL</label>
                <input
                  type="url"
                  name="sitemapUrl"
                  value={settings.sitemapUrl}
                  onChange={handleChange}
                  className="w-full border rounded px-3 py-2"
                  placeholder="https://www.seattleleopardsfc.com/sitemap.xml"
                />
              </div>
            </div>
          </div>
        )}

        {/* Security Settings */}
        {activeTab === "security" && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold mb-4 text-green-900">Security & Privacy Settings</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    name="enableTwoFactorAuth"
                    checked={settings.enableTwoFactorAuth}
                    onChange={handleChange}
                    className="w-5 h-5"
                  />
                  <span className="font-semibold">Enable Two-Factor Authentication</span>
                </label>
              </div>
              <div className="md:col-span-2">
                <label className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    name="requireEmailVerification"
                    checked={settings.requireEmailVerification}
                    onChange={handleChange}
                    className="w-5 h-5"
                  />
                  <span className="font-semibold">Require Email Verification for New Users</span>
                </label>
              </div>
              <div>
                <label className="block font-semibold mb-2">Session Timeout (hours)</label>
                <input
                  type="number"
                  name="sessionTimeout"
                  value={settings.sessionTimeout}
                  onChange={handleChange}
                  className="w-full border rounded px-3 py-2"
                  min="1"
                  max="168"
                />
              </div>
              <div>
                <label className="block font-semibold mb-2">Max Login Attempts</label>
                <input
                  type="number"
                  name="maxLoginAttempts"
                  value={settings.maxLoginAttempts}
                  onChange={handleChange}
                  className="w-full border rounded px-3 py-2"
                  min="1"
                  max="10"
                />
              </div>
              <div>
                <label className="block font-semibold mb-2">Password Minimum Length</label>
                <input
                  type="number"
                  name="passwordMinLength"
                  value={settings.passwordMinLength}
                  onChange={handleChange}
                  className="w-full border rounded px-3 py-2"
                  min="6"
                  max="50"
                />
              </div>
              <div className="md:col-span-2">
                <label className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    name="requireStrongPassword"
                    checked={settings.requireStrongPassword}
                    onChange={handleChange}
                    className="w-5 h-5"
                  />
                  <span className="font-semibold">Require Strong Password</span>
                </label>
              </div>
              <div className="md:col-span-2">
                <label className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    name="enableCSRFProtection"
                    checked={settings.enableCSRFProtection}
                    onChange={handleChange}
                    className="w-5 h-5"
                  />
                  <span className="font-semibold">Enable CSRF Protection</span>
                </label>
              </div>
              <div className="md:col-span-2">
                <label className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    name="enableRateLimiting"
                    checked={settings.enableRateLimiting}
                    onChange={handleChange}
                    className="w-5 h-5"
                  />
                  <span className="font-semibold">Enable Rate Limiting</span>
                </label>
              </div>
              <div className="md:col-span-2">
                <label className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    name="enableContentSecurityPolicy"
                    checked={settings.enableContentSecurityPolicy}
                    onChange={handleChange}
                    className="w-5 h-5"
                  />
                  <span className="font-semibold">Enable Content Security Policy</span>
                </label>
              </div>
            </div>
          </div>
        )}

        {/* Performance Settings */}
        {activeTab === "performance" && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold mb-4 text-green-900">Performance & Caching</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    name="enableCaching"
                    checked={settings.enableCaching}
                    onChange={handleChange}
                    className="w-5 h-5"
                  />
                  <span className="font-semibold">Enable Caching</span>
                </label>
              </div>
              <div>
                <label className="block font-semibold mb-2">Cache Duration (seconds)</label>
                <input
                  type="number"
                  name="cacheDuration"
                  value={settings.cacheDuration}
                  onChange={handleChange}
                  className="w-full border rounded px-3 py-2"
                  min="60"
                  max="86400"
                />
              </div>
              <div className="md:col-span-2">
                <label className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    name="enableImageOptimization"
                    checked={settings.enableImageOptimization}
                    onChange={handleChange}
                    className="w-5 h-5"
                  />
                  <span className="font-semibold">Enable Image Optimization</span>
                </label>
              </div>
              <div className="md:col-span-2">
                <label className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    name="enableGzipCompression"
                    checked={settings.enableGzipCompression}
                    onChange={handleChange}
                    className="w-5 h-5"
                  />
                  <span className="font-semibold">Enable Gzip Compression</span>
                </label>
              </div>
              <div className="md:col-span-2">
                <label className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    name="enableCDN"
                    checked={settings.enableCDN}
                    onChange={handleChange}
                    className="w-5 h-5"
                  />
                  <span className="font-semibold">Enable CDN</span>
                </label>
              </div>
              <div>
                <label className="block font-semibold mb-2">CDN URL</label>
                <input
                  type="url"
                  name="cdnUrl"
                  value={settings.cdnUrl}
                  onChange={handleChange}
                  className="w-full border rounded px-3 py-2"
                  placeholder="https://cdn.example.com"
                />
              </div>
            </div>
          </div>
        )}

        {/* Integrations Settings */}
        {activeTab === "integrations" && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold mb-4 text-green-900">Third-Party Integrations</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold mb-2">Stripe Publishable Key</label>
                <input
                  type="text"
                  name="stripePublishableKey"
                  value={settings.stripePublishableKey}
                  onChange={handleChange}
                  className="w-full border rounded px-3 py-2"
                  placeholder="pk_test_..."
                />
              </div>
              <div>
                <label className="block font-semibold mb-2">Stripe Secret Key</label>
                <input
                  type="password"
                  name="stripeSecretKey"
                  value={settings.stripeSecretKey}
                  onChange={handleChange}
                  className="w-full border rounded px-3 py-2"
                  placeholder="sk_test_..."
                />
              </div>
              <div>
                <label className="block font-semibold mb-2">PayPal Client ID</label>
                <input
                  type="text"
                  name="paypalClientId"
                  value={settings.paypalClientId}
                  onChange={handleChange}
                  className="w-full border rounded px-3 py-2"
                  placeholder="Your PayPal Client ID"
                />
              </div>
              <div>
                <label className="block font-semibold mb-2">PayPal Secret</label>
                <input
                  type="password"
                  name="paypalSecret"
                  value={settings.paypalSecret}
                  onChange={handleChange}
                  className="w-full border rounded px-3 py-2"
                  placeholder="Your PayPal Secret"
                />
              </div>
              <div>
                <label className="block font-semibold mb-2">Google Maps API Key</label>
                <input
                  type="text"
                  name="googleMapsApiKey"
                  value={settings.googleMapsApiKey}
                  onChange={handleChange}
                  className="w-full border rounded px-3 py-2"
                  placeholder="AIza..."
                />
              </div>
              <div>
                <label className="block font-semibold mb-2">Weather API Key</label>
                <input
                  type="text"
                  name="weatherApiKey"
                  value={settings.weatherApiKey}
                  onChange={handleChange}
                  className="w-full border rounded px-3 py-2"
                  placeholder="Your Weather API Key"
                />
              </div>
              <div>
                <label className="block font-semibold mb-2">SMS API Key</label>
                <input
                  type="password"
                  name="smsApiKey"
                  value={settings.smsApiKey}
                  onChange={handleChange}
                  className="w-full border rounded px-3 py-2"
                  placeholder="Your SMS API Key"
                />
              </div>
              <div>
                <label className="block font-semibold mb-2">SMS Provider</label>
                <select
                  name="smsProvider"
                  value={settings.smsProvider}
                  onChange={handleChange}
                  className="w-full border rounded px-3 py-2"
                >
                  <option value="twilio">Twilio</option>
                  <option value="nexmo">Nexmo</option>
                  <option value="aws">AWS SNS</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Notifications Settings */}
        {activeTab === "notifications" && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold mb-4 text-green-900">Notifications & Alerts</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    name="enableSMSNotifications"
                    checked={settings.enableSMSNotifications}
                    onChange={handleChange}
                    className="w-5 h-5"
                  />
                  <span className="font-semibold">Enable SMS Notifications</span>
                </label>
              </div>
              <div className="md:col-span-2">
                <label className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    name="enablePushNotifications"
                    checked={settings.enablePushNotifications}
                    onChange={handleChange}
                    className="w-5 h-5"
                  />
                  <span className="font-semibold">Enable Push Notifications</span>
                </label>
              </div>
              <div className="md:col-span-2">
                <label className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    name="enableEmailAlerts"
                    checked={settings.enableEmailAlerts}
                    onChange={handleChange}
                    className="w-5 h-5"
                  />
                  <span className="font-semibold">Enable Email Alerts</span>
                </label>
              </div>
              <div>
                <label className="block font-semibold mb-2">Alert Email Recipients</label>
                <input
                  type="text"
                  name="alertEmailRecipients"
                  value={settings.alertEmailRecipients}
                  onChange={handleChange}
                  className="w-full border rounded px-3 py-2"
                  placeholder="admin@example.com, support@example.com"
                />
              </div>
              <div className="md:col-span-2">
                <label className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    name="maintenanceNotifications"
                    checked={settings.maintenanceNotifications}
                    onChange={handleChange}
                    className="w-5 h-5"
                  />
                  <span className="font-semibold">Enable Maintenance Notifications</span>
                </label>
              </div>
            </div>
          </div>
        )}

        {/* Content Management Settings */}
        {activeTab === "content" && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold mb-4 text-green-900">Content Management</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold mb-2">Max File Upload Size (bytes)</label>
                <input
                  type="number"
                  name="maxFileUploadSize"
                  value={settings.maxFileUploadSize}
                  onChange={handleChange}
                  className="w-full border rounded px-3 py-2"
                  min="1048576"
                  max="52428800"
                />
                <small className="text-gray-500">Current: {Math.round(settings.maxFileUploadSize / 1024 / 1024)}MB</small>
              </div>
              <div>
                <label className="block font-semibold mb-2">Allowed File Types</label>
                <input
                  type="text"
                  name="allowedFileTypes"
                  value={settings.allowedFileTypes}
                  onChange={handleChange}
                  className="w-full border rounded px-3 py-2"
                  placeholder="jpg,jpeg,png,gif,pdf,doc,docx"
                />
              </div>
              <div className="md:col-span-2">
                <label className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    name="enableImageWatermark"
                    checked={settings.enableImageWatermark}
                    onChange={handleChange}
                    className="w-5 h-5"
                  />
                  <span className="font-semibold">Enable Image Watermark</span>
                </label>
              </div>
              <div>
                <label className="block font-semibold mb-2">Watermark Text</label>
                <input
                  type="text"
                  name="watermarkText"
                  value={settings.watermarkText}
                  onChange={handleChange}
                  className="w-full border rounded px-3 py-2"
                />
              </div>
              <div className="md:col-span-2">
                <label className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    name="enableAutoImageResize"
                    checked={settings.enableAutoImageResize}
                    onChange={handleChange}
                    className="w-5 h-5"
                  />
                  <span className="font-semibold">Enable Auto Image Resize</span>
                </label>
              </div>
              <div>
                <label className="block font-semibold mb-2">Max Image Width (px)</label>
                <input
                  type="number"
                  name="maxImageWidth"
                  value={settings.maxImageWidth}
                  onChange={handleChange}
                  className="w-full border rounded px-3 py-2"
                  min="100"
                  max="4000"
                />
              </div>
              <div>
                <label className="block font-semibold mb-2">Max Image Height (px)</label>
                <input
                  type="number"
                  name="maxImageHeight"
                  value={settings.maxImageHeight}
                  onChange={handleChange}
                  className="w-full border rounded px-3 py-2"
                  min="100"
                  max="4000"
                />
              </div>
            </div>
          </div>
        )}

        {/* User Experience Settings */}
        {activeTab === "ux" && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold mb-4 text-green-900">User Experience</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    name="enableDarkMode"
                    checked={settings.enableDarkMode}
                    onChange={handleChange}
                    className="w-5 h-5"
                  />
                  <span className="font-semibold">Enable Dark Mode</span>
                </label>
              </div>
              <div className="md:col-span-2">
                <label className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    name="enableAccessibility"
                    checked={settings.enableAccessibility}
                    onChange={handleChange}
                    className="w-5 h-5"
                  />
                  <span className="font-semibold">Enable Accessibility Features</span>
                </label>
              </div>
              <div className="md:col-span-2">
                <label className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    name="enableKeyboardNavigation"
                    checked={settings.enableKeyboardNavigation}
                    onChange={handleChange}
                    className="w-5 h-5"
                  />
                  <span className="font-semibold">Enable Keyboard Navigation</span>
                </label>
              </div>
              <div className="md:col-span-2">
                <label className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    name="enableScreenReader"
                    checked={settings.enableScreenReader}
                    onChange={handleChange}
                    className="w-5 h-5"
                  />
                  <span className="font-semibold">Enable Screen Reader Support</span>
                </label>
              </div>
              <div>
                <label className="block font-semibold mb-2">Default Language</label>
                <select
                  name="defaultLanguage"
                  value={settings.defaultLanguage}
                  onChange={handleChange}
                  className="w-full border rounded px-3 py-2"
                >
                  <option value="en">English</option>
                  <option value="es">Spanish</option>
                  <option value="fr">French</option>
                  <option value="de">German</option>
                </select>
              </div>
              <div>
                <label className="block font-semibold mb-2">Supported Languages</label>
                <input
                  type="text"
                  name="supportedLanguages"
                  value={settings.supportedLanguages}
                  onChange={handleChange}
                  className="w-full border rounded px-3 py-2"
                  placeholder="en,es,fr,de"
                />
              </div>
            </div>
          </div>
        )}

        {/* Content Management Settings */}
        {activeTab === "content-management" && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold mb-4 text-green-900">Content Management System</h2>
            <div className="space-y-6">
              
              {/* Homepage Content Management */}
              <div className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-lg font-semibold text-green-700">Homepage Content</h3>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => navigate('/admin/hero')}
                      className="px-3 py-1 text-sm bg-green-600 text-white rounded hover:bg-green-700 transition"
                    >
                      Manage Homepage
                    </button>
                    <a
                      href="/"
                      target="_blank"
                      className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition"
                    >
                      View Homepage
                    </a>
                  </div>
                </div>
                <p className="text-sm text-gray-600">
                  Manage hero sections, about us content, programs, and other homepage elements.
                </p>
              </div>

              {/* About Page Management */}
              <div className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-lg font-semibold text-green-700">About Page</h3>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => navigate('/admin/about')}
                      className="px-3 py-1 text-sm bg-green-600 text-white rounded hover:bg-green-700 transition"
                    >
                      Manage About Page
                    </button>
                    <a
                      href="/about"
                      target="_blank"
                      className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition"
                    >
                      View About Page
                    </a>
                  </div>
                </div>
                <p className="text-sm text-gray-600">
                  Manage club history, mission, vision, values, and team information.
                </p>
              </div>

              {/* Gallery Management */}
              <div className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-lg font-semibold text-green-700">Photo Gallery</h3>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => navigate('/admin/gallery')}
                      className="px-3 py-1 text-sm bg-green-600 text-white rounded hover:bg-green-700 transition"
                    >
                      Manage Gallery
                    </button>
                    <a
                      href="/gallery"
                      target="_blank"
                      className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition"
                    >
                      View Gallery
                    </a>
                  </div>
                </div>
                <p className="text-sm text-gray-600">
                  Upload and organize photos from games, practices, and events.
                </p>
              </div>

              {/* News & Announcements */}
              <div className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-lg font-semibold text-green-700">News & Announcements</h3>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => navigate('/admin/news')}
                      className="px-3 py-1 text-sm bg-green-600 text-white rounded hover:bg-green-700 transition"
                    >
                      Manage News
                    </button>
                    <a
                      href="/news"
                      target="_blank"
                      className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition"
                    >
                      View News
                    </a>
                  </div>
                </div>
                <p className="text-sm text-gray-600">
                  Create and manage news articles, announcements, and updates.
                </p>
              </div>

              {/* Programs Management */}
              <div className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-lg font-semibold text-green-700">Programs & Teams</h3>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => navigate('/admin/programs')}
                      className="px-3 py-1 text-sm bg-green-600 text-white rounded hover:bg-green-700 transition"
                    >
                      Manage Programs
                    </button>
                    <a
                      href="/programs"
                      target="_blank"
                      className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition"
                    >
                      View Programs
                    </a>
                  </div>
                </div>
                <p className="text-sm text-gray-600">
                  Manage team rosters, program descriptions, and age group information.
                </p>
              </div>

              {/* Schedule Management */}
              <div className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-lg font-semibold text-green-700">Schedules & Events</h3>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => navigate('/admin/schedule')}
                      className="px-3 py-1 text-sm bg-green-600 text-white rounded hover:bg-green-700 transition"
                    >
                      Manage Schedule
                    </button>
                    <a
                      href="/schedule"
                      target="_blank"
                      className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition"
                    >
                      View Schedule
                    </a>
                  </div>
                </div>
                <p className="text-sm text-gray-600">
                  Manage game schedules, practice times, and special events.
                </p>
              </div>

              {/* Content Settings */}
              <div className="border-t border-gray-200 pt-6">
                <h3 className="text-lg font-semibold text-green-700 mb-4">Content Settings</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        name="enableContentModeration"
                        checked={settings.enableContentModeration || false}
                        onChange={handleChange}
                        className="w-5 h-5"
                      />
                      <span className="font-semibold">Enable Content Moderation</span>
                    </label>
                    <p className="text-sm text-gray-600 mt-1">Require approval for user-generated content</p>
                  </div>
                  <div>
                    <label className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        name="enableContentVersioning"
                        checked={settings.enableContentVersioning || false}
                        onChange={handleChange}
                        className="w-5 h-5"
                      />
                      <span className="font-semibold">Enable Content Versioning</span>
                    </label>
                    <p className="text-sm text-gray-600 mt-1">Keep track of content changes and revisions</p>
                  </div>
                  <div>
                    <label className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        name="enableContentScheduling"
                        checked={settings.enableContentScheduling || false}
                        onChange={handleChange}
                        className="w-5 h-5"
                      />
                      <span className="font-semibold">Enable Content Scheduling</span>
                    </label>
                    <p className="text-sm text-gray-600 mt-1">Schedule content to be published at specific times</p>
                  </div>
                  <div>
                    <label className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        name="enableContentAnalytics"
                        checked={settings.enableContentAnalytics || false}
                        onChange={handleChange}
                        className="w-5 h-5"
                      />
                      <span className="font-semibold">Enable Content Analytics</span>
                    </label>
                    <p className="text-sm text-gray-600 mt-1">Track content performance and engagement</p>
                  </div>
                </div>
              </div>

              {/* Content Backup & Export */}
              <div className="border-t border-gray-200 pt-6">
                <h3 className="text-lg font-semibold text-green-700 mb-4">Content Backup & Export</h3>
                <div className="flex gap-4">
                  <button
                    type="button"
                    onClick={() => {
                      // Export content functionality
                      toast.info('Content export feature coming soon!');
                    }}
                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
                  >
                    Export All Content
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      // Backup content functionality
                      toast.info('Content backup feature coming soon!');
                    }}
                    className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition"
                  >
                    Create Backup
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      // Restore content functionality
                      toast.info('Content restore feature coming soon!');
                    }}
                    className="px-4 py-2 bg-yellow-600 text-white rounded hover:bg-yellow-700 transition"
                  >
                    Restore from Backup
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Media Library Settings */}
        {activeTab === "media-library" && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold mb-4 text-green-900">Media Library Management</h2>
            <div className="space-y-6">
              
              {/* Media Upload Settings */}
              <div className="border border-gray-200 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-green-700 mb-3">Upload Settings</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-semibold mb-2">Max File Size (MB)</label>
                    <input
                      type="number"
                      name="maxMediaFileSize"
                      value={settings.maxMediaFileSize || 50}
                      onChange={handleChange}
                      className="w-full border rounded px-3 py-2"
                      min="1"
                      max="500"
                    />
                    <small className="text-gray-500">Maximum file size for media uploads</small>
                  </div>
                  <div>
                    <label className="block font-semibold mb-2">Allowed File Types</label>
                    <input
                      type="text"
                      name="allowedMediaTypes"
                      value={settings.allowedMediaTypes || "jpg,jpeg,png,gif,mp4,avi,mov,webm"}
                      onChange={handleChange}
                      className="w-full border rounded px-3 py-2"
                      placeholder="jpg,jpeg,png,gif,mp4,avi,mov,webm"
                    />
                    <small className="text-gray-500">Comma-separated list of allowed file extensions</small>
                  </div>
                </div>
              </div>

              {/* Media Organization */}
              <div className="border border-gray-200 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-green-700 mb-3">Media Organization</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        name="enableMediaCategories"
                        checked={settings.enableMediaCategories || false}
                        onChange={handleChange}
                        className="w-5 h-5"
                      />
                      <span className="font-semibold">Enable Media Categories</span>
                    </label>
                    <p className="text-sm text-gray-600 mt-1">Allow organizing media into categories</p>
                  </div>
                  <div>
                    <label className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        name="enableMediaTags"
                        checked={settings.enableMediaTags || false}
                        onChange={handleChange}
                        className="w-5 h-5"
                      />
                      <span className="font-semibold">Enable Media Tags</span>
                    </label>
                    <p className="text-sm text-gray-600 mt-1">Allow tagging media for better searchability</p>
                  </div>
                  <div>
                    <label className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        name="enableMediaWatermark"
                        checked={settings.enableMediaWatermark || false}
                        onChange={handleChange}
                        className="w-5 h-5"
                      />
                      <span className="font-semibold">Enable Media Watermark</span>
                    </label>
                    <p className="text-sm text-gray-600 mt-1">Automatically add watermark to uploaded media</p>
                  </div>
                  <div>
                    <label className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        name="enableMediaCompression"
                        checked={settings.enableMediaCompression || false}
                        onChange={handleChange}
                        className="w-5 h-5"
                      />
                      <span className="font-semibold">Enable Media Compression</span>
                    </label>
                    <p className="text-sm text-gray-600 mt-1">Automatically compress large media files</p>
                  </div>
                </div>
              </div>

              {/* Media Storage */}
              <div className="border border-gray-200 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-green-700 mb-3">Storage Settings</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-semibold mb-2">Storage Location</label>
                    <select
                      name="mediaStorageLocation"
                      value={settings.mediaStorageLocation || "local"}
                      onChange={handleChange}
                      className="w-full border rounded px-3 py-2"
                    >
                      <option value="local">Local Storage</option>
                      <option value="cloud">Cloud Storage</option>
                      <option value="cdn">CDN Storage</option>
                    </select>
                  </div>
                  <div>
                    <label className="block font-semibold mb-2">Storage Quota (GB)</label>
                    <input
                      type="number"
                      name="mediaStorageQuota"
                      value={settings.mediaStorageQuota || 100}
                      onChange={handleChange}
                      className="w-full border rounded px-3 py-2"
                      min="1"
                      max="1000"
                    />
                    <small className="text-gray-500">Maximum storage space for media files</small>
                  </div>
                </div>
              </div>

              {/* Media Management Actions */}
              <div className="border-t border-gray-200 pt-6">
                <h3 className="text-lg font-semibold text-green-700 mb-4">Media Management</h3>
                <div className="flex gap-4">
                  <button
                    type="button"
                    onClick={() => navigate('/admin/gallery')}
                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
                  >
                    Manage Media Library
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      toast.info('Media cleanup feature coming soon!');
                    }}
                    className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition"
                  >
                    Cleanup Unused Media
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      toast.info('Media backup feature coming soon!');
                    }}
                    className="px-4 py-2 bg-yellow-600 text-white rounded hover:bg-yellow-700 transition"
                  >
                    Backup Media
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Fans & Gallery Settings */}
        {activeTab === "fans-gallery" && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold mb-4 text-green-900">Fans & Gallery Management</h2>
            <div className="space-y-6">
              
              {/* Gallery Settings */}
              <div className="border border-gray-200 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-green-700 mb-3">Gallery Settings</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        name="enablePublicGallery"
                        checked={settings.enablePublicGallery || true}
                        onChange={handleChange}
                        className="w-5 h-5"
                      />
                      <span className="font-semibold">Enable Public Gallery</span>
                    </label>
                    <p className="text-sm text-gray-600 mt-1">Allow public access to the gallery</p>
                  </div>
                  <div>
                    <label className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        name="enableFanSubmissions"
                        checked={settings.enableFanSubmissions || true}
                        onChange={handleChange}
                        className="w-5 h-5"
                      />
                      <span className="font-semibold">Enable Fan Submissions</span>
                    </label>
                    <p className="text-sm text-gray-600 mt-1">Allow fans to submit photos and videos</p>
                  </div>
                  <div>
                    <label className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        name="enableGalleryModeration"
                        checked={settings.enableGalleryModeration || true}
                        onChange={handleChange}
                        className="w-5 h-5"
                      />
                      <span className="font-semibold">Enable Gallery Moderation</span>
                    </label>
                    <p className="text-sm text-gray-600 mt-1">Require approval for fan submissions</p>
                  </div>
                  <div>
                    <label className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        name="enableGalleryComments"
                        checked={settings.enableGalleryComments || true}
                        onChange={handleChange}
                        className="w-5 h-5"
                      />
                      <span className="font-semibold">Enable Gallery Comments</span>
                    </label>
                    <p className="text-sm text-gray-600 mt-1">Allow comments on gallery items</p>
                  </div>
                </div>
              </div>

              {/* Fan Engagement */}
              <div className="border border-gray-200 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-green-700 mb-3">Fan Engagement</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-semibold mb-2">Max Fan Submissions per Day</label>
                    <input
                      type="number"
                      name="maxFanSubmissionsPerDay"
                      value={settings.maxFanSubmissionsPerDay || 5}
                      onChange={handleChange}
                      className="w-full border rounded px-3 py-2"
                      min="1"
                      max="50"
                    />
                    <small className="text-gray-500">Limit daily submissions per fan</small>
                  </div>
                  <div>
                    <label className="block font-semibold mb-2">Fan Submission Categories</label>
                    <input
                      type="text"
                      name="fanSubmissionCategories"
                      value={settings.fanSubmissionCategories || "Game Photos,Team Events,Fan Moments,Memories"}
                      onChange={handleChange}
                      className="w-full border rounded px-3 py-2"
                      placeholder="Game Photos,Team Events,Fan Moments,Memories"
                    />
                    <small className="text-gray-500">Comma-separated list of allowed categories</small>
                  </div>
                </div>
              </div>

              {/* Gallery Display */}
              <div className="border border-gray-200 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-green-700 mb-3">Gallery Display</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-semibold mb-2">Items per Page</label>
                    <input
                      type="number"
                      name="galleryItemsPerPage"
                      value={settings.galleryItemsPerPage || 20}
                      onChange={handleChange}
                      className="w-full border rounded px-3 py-2"
                      min="5"
                      max="100"
                    />
                    <small className="text-gray-500">Number of items to display per page</small>
                  </div>
                  <div>
                    <label className="block font-semibold mb-2">Featured Items Count</label>
                    <input
                      type="number"
                      name="featuredGalleryItems"
                      value={settings.featuredGalleryItems || 6}
                      onChange={handleChange}
                      className="w-full border rounded px-3 py-2"
                      min="1"
                      max="20"
                    />
                    <small className="text-gray-500">Number of featured items to highlight</small>
                  </div>
                </div>
              </div>

              {/* Gallery Management Actions */}
              <div className="border-t border-gray-200 pt-6">
                <h3 className="text-lg font-semibold text-green-700 mb-4">Gallery Management</h3>
                <div className="flex gap-4">
                  <button
                    type="button"
                    onClick={() => navigate('/admin/gallery')}
                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
                  >
                    Manage Gallery
                  </button>
                  <button
                    type="button"
                    onClick={() => navigate('/fans-gallery')}
                    className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition"
                  >
                    View Fans Gallery
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      toast.info('Gallery moderation feature coming soon!');
                    }}
                    className="px-4 py-2 bg-yellow-600 text-white rounded hover:bg-yellow-700 transition"
                  >
                    Moderate Submissions
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Advanced Settings */}
        {activeTab === "advanced" && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold mb-4 text-green-900">Advanced Features</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    name="enableAPI"
                    checked={settings.enableAPI}
                    onChange={handleChange}
                    className="w-5 h-5"
                  />
                  <span className="font-semibold">Enable API Access</span>
                </label>
              </div>
              <div>
                <label className="block font-semibold mb-2">API Rate Limit (requests/hour)</label>
                <input
                  type="number"
                  name="apiRateLimit"
                  value={settings.apiRateLimit}
                  onChange={handleChange}
                  className="w-full border rounded px-3 py-2"
                  min="10"
                  max="10000"
                />
              </div>
              <div className="md:col-span-2">
                <label className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    name="enableWebhooks"
                    checked={settings.enableWebhooks}
                    onChange={handleChange}
                    className="w-5 h-5"
                  />
                  <span className="font-semibold">Enable Webhooks</span>
                </label>
              </div>
              <div>
                <label className="block font-semibold mb-2">Webhook URL</label>
                <input
                  type="url"
                  name="webhookUrl"
                  value={settings.webhookUrl}
                  onChange={handleChange}
                  className="w-full border rounded px-3 py-2"
                  placeholder="https://your-webhook-endpoint.com"
                />
              </div>
              <div className="md:col-span-2">
                <label className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    name="enableRealTimeUpdates"
                    checked={settings.enableRealTimeUpdates}
                    onChange={handleChange}
                    className="w-5 h-5"
                  />
                  <span className="font-semibold">Enable Real-Time Updates</span>
                </label>
              </div>
              <div className="md:col-span-2">
                <label className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    name="enableOfflineMode"
                    checked={settings.enableOfflineMode}
                    onChange={handleChange}
                    className="w-5 h-5"
                  />
                  <span className="font-semibold">Enable Offline Mode</span>
                </label>
              </div>
            </div>
          </div>
        )}

        {/* Maintenance Settings */}
        {activeTab === "maintenance" && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold mb-4 text-green-900">Maintenance Mode</h2>
            <div className="space-y-4">
              <label className="flex items-center gap-3">
                <input
                  type="checkbox"
                  name="maintenanceMode"
                  checked={settings.maintenanceMode}
                  onChange={handleChange}
                  className="w-5 h-5"
                />
                <span className="font-semibold">Enable Maintenance Mode</span>
              </label>
              <div>
                <label className="block font-semibold mb-2">Maintenance Message</label>
                <textarea
                  name="maintenanceMessage"
                  value={settings.maintenanceMessage}
                  onChange={handleChange}
                  rows="4"
                  className="w-full border rounded px-3 py-2"
                  placeholder="We're currently performing maintenance. Please check back soon."
                />
              </div>
              <div>
                <label className="block font-semibold mb-2">Maintenance Start Time</label>
                <input
                  type="time"
                  name="maintenanceStartTime"
                  value={settings.maintenanceStartTime}
                  onChange={handleChange}
                  className="w-full border rounded px-3 py-2"
                />
              </div>
              <div>
                <label className="block font-semibold mb-2">Maintenance End Time</label>
                <input
                  type="time"
                  name="maintenanceEndTime"
                  value={settings.maintenanceEndTime}
                  onChange={handleChange}
                  className="w-full border rounded px-3 py-2"
                />
              </div>
              <div className="md:col-span-2">
                <label className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    name="maintenanceNotifications"
                    checked={settings.maintenanceNotifications}
                    onChange={handleChange}
                    className="w-5 h-5"
                  />
                  <span className="font-semibold">Enable Maintenance Notifications</span>
                </label>
              </div>
            </div>
          </div>
        )}

        {/* Save Button */}
        <div className="flex justify-end gap-4 pt-6 border-t">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="bg-gray-500 text-white px-6 py-2 rounded font-bold hover:bg-gray-600 transition"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving}
            className="bg-green-700 text-white px-6 py-2 rounded font-bold hover:bg-green-800 transition disabled:opacity-50"
          >
            {saving ? "Saving..." : "Save Settings"}
          </button>
        </div>

        {error && (
          <div className="text-red-600 text-center p-4 bg-red-50 rounded">
            <div className="flex items-center justify-center gap-2">
              <span>⚠️</span>
              <span>{error}</span>
            </div>
            {(error.includes("Invalid token") || error.includes("Authentication required")) && (
              <button
                onClick={() => navigate("/signin")}
                className="mt-3 bg-green-600 text-white px-4 py-2 rounded font-semibold hover:bg-green-700 transition"
              >
                Log In
              </button>
            )}
          </div>
        )}
      </form>
    </div>
  );
} 
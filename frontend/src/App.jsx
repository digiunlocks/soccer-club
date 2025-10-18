import { Routes, Route, Link, useLocation, useNavigate, Navigate } from "react-router-dom";
import { useState, useEffect } from "react";
import Logo from "./components/Logo";

import Home from "./Home";
import About from "./About";
import Teams from "./Teams";
import Programs from "./Programs";
import Terms from "./Terms";
import Privacy from "./Privacy";
import Cookie from "./Cookie";
import Legal from "./Legal";
import Contact from "./Contact";
import PlayerApplication from "./PlayerApplication";
import CoachApplication from "./CoachApplication";
import RefereeApplication from "./RefereeApplication";
import VolunteerApplication from "./VolunteerApplication";
import Register from "./Register";
import Login from "./Login";
import Donate from "./Donate";
import SuperAdminHeroManager from "./SuperAdminHeroManager";
import BrandingManager from "./BrandingManager";
import ClubManager from "./ClubManager";
import ContactManager from "./ContactManager";
import ContentManager from "./ContentManager";
import PlaceholderManager from "./PlaceholderManager";
import AdminDashboard from "./AdminDashboard";
import ApplicationsManager from "./ApplicationsManager";
import ProgramManager from "./ProgramManager";
import AdminTeamManager from "./AdminTeamManager";
import UserManager from "./UserManager";
import NewsManager from "./NewsManager";
import PaymentManager from "./PaymentManager";
import SiteSettings from "./SiteSettings";
import ScheduleManager from "./ScheduleManager";
import Schedules from "./Schedules";
import Account from "./Account";
import Gallery from "./Gallery";
import PublicGallery from "./PublicGallery";
import FansGallery from "./FansGallery";
import GalleryModerationManager from "./GalleryModerationManager";
import AdvertisementManager from "./AdvertisementManager";
import Marketplace from "./Marketplace";
import MarketplaceItemDetail from "./MarketplaceItemDetail";
import MarketplacePost from "./MarketplacePost";
import MarketplaceModerationManager from "./MarketplaceModerationManager";
import MarketplaceAdminManager from "./components/MarketplaceAdminManager";
import MarketplaceConversation from "./MarketplaceConversation";
import MarketplaceDashboard from "./MarketplaceDashboard";
import MarketplaceSettings from "./MarketplaceSettings";
import MyExpiringItems from "./MyExpiringItems";
import CategoryManagement from "./EnhancedCategoryManagement";
import MembershipManagement from "./MembershipManagement";
import AboutPageManager from "./AboutPageManager";
import Messages from "./Messages";
import UserTransactions from "./UserTransactions";
import PrivacySettings from "./PrivacySettings";
import BroadcastManager from "./components/BroadcastManager";
import Notifications from './Notifications';
import UnifiedInbox from './UnifiedInbox';
import MyMarketplaceItems from './MyMarketplaceItems';
import MarketplaceNotification from './components/MarketplaceNotification';

import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default function App() {
  const [navOpen, setNavOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [joinDropdownOpen, setJoinDropdownOpen] = useState(false);
  const [dropdownTimeout, setDropdownTimeout] = useState(null);
  const [logoUrl, setLogoUrl] = useState(null);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    setIsLoggedIn(!!token);
  }, [location]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (joinDropdownOpen && !event.target.closest('.join-dropdown')) {
        setJoinDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [joinDropdownOpen]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setIsLoggedIn(false);
    navigate("/");
  };

  const handleJoinDropdownToggle = () => {
    if (joinDropdownOpen) {
      setJoinDropdownOpen(false);
      if (dropdownTimeout) {
        clearTimeout(dropdownTimeout);
        setDropdownTimeout(null);
      }
    } else {
      setJoinDropdownOpen(true);
      if (dropdownTimeout) {
        clearTimeout(dropdownTimeout);
      }
      const timeout = setTimeout(() => {
        setJoinDropdownOpen(false);
      }, 5000);
      setDropdownTimeout(timeout);
    }
  };

  const handleJoinDropdownMouseEnter = () => {
    if (dropdownTimeout) {
      clearTimeout(dropdownTimeout);
      setDropdownTimeout(null);
    }
  };

  const handleJoinDropdownMouseLeave = () => {
    if (dropdownTimeout) {
      clearTimeout(dropdownTimeout);
    }
    const timeout = setTimeout(() => {
      setJoinDropdownOpen(false);
    }, 1000);
    setDropdownTimeout(timeout);
  };

  const isAdminRoute = location.pathname.startsWith('/admin');

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {!isAdminRoute && (
        <header className="bg-green-900 text-white shadow-lg">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo and main nav */}
            <div className="flex items-center space-x-8">
              <Link to="/" className="flex items-center space-x-2">
                <Logo />
              </Link>
              
              {/* Donate button next to logo */}
              <Link to="/donate" className="bg-yellow-500 hover:bg-yellow-600 text-green-900 px-4 py-2 rounded-md font-semibold transition shadow-md">
                Donate
              </Link>
              
              <div className="hidden md:flex space-x-4 lg:space-x-6">
                <Link to="/" className="hover:text-green-300 transition whitespace-nowrap">Home</Link>
                <Link to="/about" className="hover:text-green-300 transition whitespace-nowrap">About</Link>
                <Link to="/teams" className="hover:text-green-300 transition whitespace-nowrap">Teams</Link>
                <Link to="/programs" className="hover:text-green-300 transition whitespace-nowrap">Programs</Link>
                <Link to="/schedules" className="hover:text-green-300 transition whitespace-nowrap">Schedules</Link>
                <Link to="/gallery" className="hover:text-green-300 transition whitespace-nowrap">Fan & Gallery</Link>
                <Link to="/marketplace" className="hover:text-green-300 transition whitespace-nowrap">Marketplace</Link>
                <Link to="/contact" className="hover:text-green-300 transition whitespace-nowrap">Contact</Link>
              </div>
            </div>

            {/* Right side - Navigation elements */}
            <div className="flex items-center space-x-2 lg:space-x-4">
              {/* Join dropdown */}
              <div className="relative join-dropdown">
                <button
                  onClick={handleJoinDropdownToggle}
                  onMouseEnter={handleJoinDropdownMouseEnter}
                  onMouseLeave={handleJoinDropdownMouseLeave}
                  className="text-white hover:text-green-300 transition font-medium flex items-center space-x-1 px-2 py-1 rounded hover:bg-green-800"
                >
                  <span>Join Us</span>
                  <svg className={`w-3 h-3 transition-transform ${joinDropdownOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                
                {joinDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50 border border-gray-200">
                    <Link to="/join/player" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition">Player Application</Link>
                    <Link to="/join/coach" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition">Coach Application</Link>
                    <Link to="/join/referee" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition">Referee Application</Link>
                    <Link to="/join/volunteer" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition">Volunteer Application</Link>
                  </div>
                )}
              </div>

              {/* Unified Inbox - only show when logged in */}
              {isLoggedIn && (
                <MarketplaceNotification />
              )}

              {/* Auth buttons */}
              <div className="hidden md:flex items-center space-x-2 lg:space-x-3">
                {isLoggedIn ? (
                  <>
                    <Link to="/account" className="hover:text-green-300 font-medium px-2 py-1 rounded hover:bg-green-800 transition">Account</Link>
                    <button 
                      onClick={handleLogout} 
                      className="hover:text-green-300 font-medium px-2 py-1 rounded hover:bg-green-800 transition"
                    >
                      Sign Out
                    </button>
                  </>
                ) : (
                  <>
                    <Link to="/signin" className="hover:text-green-300 font-medium px-2 py-1 rounded hover:bg-green-800 transition">Sign In</Link>
                    <Link to="/register" className="hover:text-green-300 font-medium px-2 py-1 rounded hover:bg-green-800 transition">Register</Link>
                  </>
                )}
              </div>

              {/* Mobile menu button */}
              <button
                onClick={() => setNavOpen(!navOpen)}
                className="md:hidden p-2 rounded-md hover:text-green-300 hover:bg-green-800 transition"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            </div>
          </div>

          {/* Mobile navigation */}
          <div className={`md:hidden ${navOpen ? 'block' : 'hidden'}`}>
            <div className="px-2 pt-2 pb-3 space-y-1">
              <Link to="/" className="block px-3 py-2 rounded-md text-base font-medium hover:text-green-300 hover:bg-green-800 transition" onClick={() => setNavOpen(false)}>Home</Link>
              <Link to="/about" className="block px-3 py-2 rounded-md text-base font-medium hover:text-green-300 hover:bg-green-800 transition" onClick={() => setNavOpen(false)}>About</Link>
              <Link to="/teams" className="block px-3 py-2 rounded-md text-base font-medium hover:text-green-300 hover:bg-green-800 transition" onClick={() => setNavOpen(false)}>Teams</Link>
              <Link to="/programs" className="block px-3 py-2 rounded-md text-base font-medium hover:text-green-300 hover:bg-green-800 transition" onClick={() => setNavOpen(false)}>Programs</Link>
              <Link to="/schedules" className="block px-3 py-2 rounded-md text-base font-medium hover:text-green-300 hover:bg-green-800 transition" onClick={() => setNavOpen(false)}>Schedules</Link>
              <Link to="/gallery" className="block px-3 py-2 rounded-md text-base font-medium hover:text-green-300 hover:bg-green-800 transition" onClick={() => setNavOpen(false)}>Fan & Gallery</Link>
              <Link to="/marketplace" className="block px-3 py-2 rounded-md text-base font-medium hover:text-green-300 hover:bg-green-800 transition" onClick={() => setNavOpen(false)}>Marketplace</Link>
              <Link to="/donate" className="block px-3 py-2 rounded-md text-base font-medium hover:text-green-300 hover:bg-green-800 transition" onClick={() => setNavOpen(false)}>Donate</Link>
              <Link to="/contact" className="block px-3 py-2 rounded-md text-base font-medium hover:text-green-300 hover:bg-green-800 transition" onClick={() => setNavOpen(false)}>Contact</Link>
              
              {/* Mobile join dropdown */}
              <div className="px-3 py-2">
                <div className="text-sm font-medium text-green-200 mb-2">Join Us</div>
                <div className="space-y-1">
                  <Link to="/join/player" className="block px-3 py-2 rounded-md text-sm hover:text-green-300 hover:bg-green-800 transition" onClick={() => setNavOpen(false)}>Player Application</Link>
                  <Link to="/join/coach" className="block px-3 py-2 rounded-md text-sm hover:text-green-300 hover:bg-green-800 transition" onClick={() => setNavOpen(false)}>Coach Application</Link>
                  <Link to="/join/referee" className="block px-3 py-2 rounded-md text-sm hover:text-green-300 hover:bg-green-800 transition" onClick={() => setNavOpen(false)}>Referee Application</Link>
                  <Link to="/join/volunteer" className="block px-3 py-2 rounded-md text-sm hover:text-green-300 hover:bg-green-800 transition" onClick={() => setNavOpen(false)}>Volunteer Application</Link>
                </div>
              </div>
            </div>

            {/* Mobile auth buttons */}
            <div className="flex flex-col gap-2 w-full mt-2">
              {isLoggedIn ? (
                <>
                  <Link to="/account" className="hover:text-green-300 font-medium px-4 py-2 text-center" onClick={() => setNavOpen(false)}>Account</Link>
  
                  <button 
                    onClick={() => {
                      handleLogout();
                      setNavOpen(false);
                    }} 
                    className="hover:text-green-300 font-medium px-4 py-2 text-center"
                  >
                    Sign Out
                  </button>
                </>
              ) : (
                <>
                  <Link to="/signin" className="hover:text-green-300 font-medium px-4 py-2 text-center" onClick={() => setNavOpen(false)}>Sign In</Link>
                  <Link to="/register" className="hover:text-green-300 font-medium px-4 py-2 text-center" onClick={() => setNavOpen(false)}>Register</Link>
                </>
              )}
            </div>
          </div>
        </nav>
      </header>
      )}
      <main className="flex-1 max-w-4xl mx-auto p-4 sm:p-8 w-full">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/teams" element={<Teams />} />
          <Route path="/programs" element={<Programs />} />
          <Route path="/schedules" element={<Schedules />} />
                      <Route path="/fans-gallery" element={<FansGallery />} />
            <Route path="/marketplace" element={<Marketplace />} />
            <Route path="/marketplace/post" element={<MarketplacePost />} />
            <Route path="/marketplace/item/:id" element={<MarketplaceItemDetail />} />
          <Route path="/marketplace/dashboard" element={<MarketplaceDashboard />} />
          <Route path="/marketplace/expiring-items" element={<MyExpiringItems />} />
            <Route path="/marketplace/conversation/:itemId/:otherUserId" element={<MarketplaceConversation />} />
            
            <Route path="/gallery" element={<PublicGallery />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/join" element={<Navigate to="/join/player" replace />} />
          <Route path="/join/player" element={<PlayerApplication />} />
          <Route path="/join/coach" element={<CoachApplication />} />
          <Route path="/join/referee" element={<RefereeApplication />} />
          <Route path="/join/volunteer" element={<VolunteerApplication />} />
          <Route path="/register" element={<Register />} />
          <Route path="/signin" element={<Login />} />
                      <Route path="/donate" element={<Donate />} />
            <Route path="/terms" element={<Terms />} />
            <Route path="/privacy" element={<Privacy />} />
            <Route path="/cookie" element={<Cookie />} />
            <Route path="/legal" element={<Legal />} />
            <Route path="/account" element={<Account />} />
          
          <Route path="/messages" element={<Messages />} />
          <Route path="/notifications" element={<Notifications />} />
          <Route path="/inbox" element={<UnifiedInbox />} />
          <Route path="/my-items" element={<MyMarketplaceItems />} />
          <Route path="/user-transactions" element={<UserTransactions />} />
          <Route path="/privacy-settings" element={<PrivacySettings />} />
          <Route path="/admin/hero" element={<SuperAdminHeroManager />} />
          <Route path="/admin/branding" element={<BrandingManager />} />
          <Route path="/admin/club" element={<ClubManager />} />
          <Route path="/admin/contact" element={<ContactManager />} />
          <Route path="/admin/content" element={<ContentManager />} />
          <Route path="/admin/social" element={<PlaceholderManager 
            title="Social & SEO Management" 
            description="Manage social media integration and SEO settings"
            icon={<svg className="w-16 h-16 text-green-600 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 4V2a1 1 0 011-1h8a1 1 0 011 1v2m0 0V1a1 1 0 011-1h2a1 1 0 011 1v22a1 1 0 01-1 1h-2a1 1 0 01-1-1v-1M7 4v16a1 1 0 01-1 1H4a1 1 0 01-1-1V1a1 1 0 011-1h2a1 1 0 011 1v3z" />
            </svg>}
          />} />
          <Route path="/admin/navigation" element={<PlaceholderManager 
            title="Navigation Management" 
            description="Manage website navigation menus and structure"
            icon={<svg className="w-16 h-16 text-green-600 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
            </svg>}
          />} />
          <Route path="/admin/features" element={<PlaceholderManager 
            title="Features Management" 
            description="Configure website features and functionality"
            icon={<svg className="w-16 h-16 text-green-600 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>}
          />} />
          <Route path="/admin/security" element={<PlaceholderManager 
            title="Security Management" 
            description="Configure security settings and access controls"
            icon={<svg className="w-16 h-16 text-green-600 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>}
          />} />
          <Route path="/admin/performance" element={<PlaceholderManager 
            title="Performance Management" 
            description="Monitor and optimize website performance"
            icon={<svg className="w-16 h-16 text-green-600 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>}
          />} />
          <Route path="/admin/integrations" element={<PlaceholderManager 
            title="Integrations Management" 
            description="Manage third-party integrations and APIs"
            icon={<svg className="w-16 h-16 text-green-600 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 4a2 2 0 114 0v1a1 1 0 001 1h3a1 1 0 011 1v3a1 1 0 01-1 1h-1a2 2 0 100 4h1a1 1 0 011 1v3a1 1 0 01-1 1h-3a1 1 0 01-1-1v-1a2 2 0 10-4 0v1a1 1 0 01-1 1H7a1 1 0 01-1-1v-3a1 1 0 011-1h1a2 2 0 100-4H7a1 1 0 01-1-1V9a1 1 0 011-1h3a1 1 0 001-1V4z" />
            </svg>}
          />} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin/marketplace-settings" element={<MarketplaceSettings />} />
          <Route path="/admin/category-management" element={<CategoryManagement />} />
          <Route path="/admin/membership-management" element={<MembershipManagement />} />
          <Route path="/admin/applications" element={<ApplicationsManager />} />
          <Route path="/admin/programs" element={<ProgramManager />} />
          <Route path="/admin/teams" element={<AdminTeamManager />} />
          <Route path="/admin/users" element={<UserManager />} />
          <Route path="/admin/news" element={<NewsManager />} />
          <Route path="/admin/payments" element={<PaymentManager />} />
          <Route path="/admin/settings" element={<SiteSettings />} />
          <Route path="/admin/schedules" element={<ScheduleManager />} />
          <Route path="/admin/gallery" element={<Gallery />} />
          <Route path="/admin/gallery-moderation" element={<GalleryModerationManager />} />
          <Route path="/admin/marketplace-moderation" element={<MarketplaceAdminManager />} />
          <Route path="/admin/marketplace" element={<MarketplaceAdminManager />} />
          <Route path="/admin/advertisements" element={<AdvertisementManager />} />
          <Route path="/admin/about" element={<AboutPageManager />} />
          <Route path="/admin/broadcast" element={<BroadcastManager />} />
   
          </Routes>
      </main>
      <ToastContainer position="top-center" autoClose={3000} hideProgressBar newestOnTop closeOnClick pauseOnFocusLoss draggable pauseOnHover />
      <footer className="w-full bg-green-900 text-white py-6 mt-8 shadow-inner">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between px-4 gap-4">
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-6 text-green-200 items-center">
            <div className="flex gap-4">
              <a href="#" className="hover:text-yellow-400 transition">Facebook</a>
              <a href="#" className="hover:text-yellow-400 transition">Instagram</a>
              <a href="#" className="hover:text-yellow-400 transition">Twitter</a>
            </div>
            <div className="flex gap-4">
                                              <Link to="/terms" className="hover:text-yellow-400 transition">Terms</Link>
                <Link to="/privacy" className="hover:text-yellow-400 transition">Privacy</Link>
                <Link to="/cookie" className="hover:text-yellow-400 transition">Cookie</Link>
                <Link to="/legal" className="hover:text-yellow-400 transition">Legal</Link>
            </div>
          </div>
          <div className="text-sm text-green-300">&copy; {new Date().getFullYear()} Seattle Leopards FC. All rights reserved.</div>
        </div>
      </footer>
    </div>
  );
}

// Cache busting utility to ensure fresh data after updates
export const clearCacheAndReload = () => {
  // Clear localStorage cache
  localStorage.removeItem('adminDashboardCache');
  localStorage.removeItem('membershipCache');
  localStorage.removeItem('marketplaceCache');
  
  // Clear sessionStorage
  sessionStorage.clear();
  
  // Force reload with cache busting
  window.location.reload(true);
};

// Check if we need to clear cache (useful for development)
export const shouldClearCache = () => {
  const lastUpdate = localStorage.getItem('lastSystemUpdate');
  const currentTime = Date.now();
  const oneHour = 60 * 60 * 1000; // 1 hour in milliseconds
  
  if (!lastUpdate || (currentTime - parseInt(lastUpdate)) > oneHour) {
    localStorage.setItem('lastSystemUpdate', currentTime.toString());
    return true;
  }
  return false;
};

// Force refresh for admin dashboard
export const forceAdminRefresh = () => {
  if (shouldClearCache()) {
    clearCacheAndReload();
  }
};

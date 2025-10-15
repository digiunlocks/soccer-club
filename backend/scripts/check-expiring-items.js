const mongoose = require('mongoose');
const MarketplaceItem = require('../models/MarketplaceItem');
const MarketplaceSettings = require('../models/MarketplaceSettings');
const Notification = require('../models/Notification');

// Check for expiring items and send notifications
async function checkExpiringItems() {
  try {
    console.log('🔍 Checking for expiring marketplace items...');
    
    const settings = await MarketplaceSettings.getSettings();
    
    if (!settings.sendExpirationWarnings) {
      console.log('⚠️  Expiration warnings are disabled');
      return;
    }
    
    const now = new Date();
    const warningDate = new Date(now.getTime() + (settings.expirationWarningDays * 24 * 60 * 60 * 1000));
    
    // Find items expiring soon
    const expiringItems = await MarketplaceItem.find({
      status: 'approved',
      expiresAt: {
        $gte: now,
        $lte: warningDate
      }
    }).populate('seller', 'username email');
    
    console.log(`📊 Found ${expiringItems.length} items expiring within ${settings.expirationWarningDays} days`);
    
    for (const item of expiringItems) {
      const daysRemaining = item.getDaysUntilExpiration();
      
      // Check if notification already sent recently (within last 24 hours)
      const recentNotification = await Notification.findOne({
        user: item.seller._id,
        type: 'item_expiring_soon',
        'data.itemId': item._id.toString(),
        createdAt: { $gte: new Date(now.getTime() - 24 * 60 * 60 * 1000) }
      });
      
      if (!recentNotification) {
        // Send notification
        await Notification.create({
          user: item.seller._id,
          type: 'item_expiring_soon',
          title: `Your listing "${item.title}" expires in ${daysRemaining} days`,
          message: `Your marketplace item "${item.title}" will expire on ${item.expiresAt.toLocaleDateString()}. Extend your listing to keep it active.`,
          data: {
            itemId: item._id.toString(),
            itemTitle: item.title,
            expiresAt: item.expiresAt,
            daysRemaining,
            canExtend: item.canBeExtended(settings.maxExtensionsAllowed),
            extensionPrice: settings.getExtensionPrice(item.category)
          }
        });
        
        console.log(`📧 Sent expiration warning to ${item.seller.username} for "${item.title}" (${daysRemaining} days left)`);
      }
    }
    
    // Find expired items
    const expiredItems = await MarketplaceItem.find({
      status: 'approved',
      expiresAt: { $lt: now }
    }).populate('seller', 'username email');
    
    console.log(`⏰ Found ${expiredItems.length} expired items`);
    
    for (const item of expiredItems) {
      // Update status to expired
      item.status = 'expired';
      await item.save();
      
      // Send notification if enabled
      if (settings.sendExpiredNotifications) {
        await Notification.create({
          user: item.seller._id,
          type: 'item_expired',
          title: `Your listing "${item.title}" has expired`,
          message: `Your marketplace item "${item.title}" has expired and is no longer visible to buyers. You can extend it to reactivate the listing.`,
          data: {
            itemId: item._id.toString(),
            itemTitle: item.title,
            expiredAt: item.expiresAt,
            canExtend: item.canBeExtended(settings.maxExtensionsAllowed),
            extensionPrice: settings.getExtensionPrice(item.category)
          }
        });
        
        console.log(`📧 Sent expiration notification to ${item.seller.username} for "${item.title}"`);
      }
    }
    
    console.log('✅ Expiration check completed');
    
  } catch (error) {
    console.error('❌ Error checking expiring items:', error);
  }
}

// If run directly
if (require.main === module) {
  require('dotenv').config();
  
  mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/soccer-club')
    .then(async () => {
      console.log('✅ Connected to MongoDB');
      await checkExpiringItems();
      await mongoose.disconnect();
      console.log('👋 Disconnected from MongoDB');
      process.exit(0);
    })
    .catch(error => {
      console.error('❌ MongoDB connection error:', error);
      process.exit(1);
    });
}

module.exports = checkExpiringItems;


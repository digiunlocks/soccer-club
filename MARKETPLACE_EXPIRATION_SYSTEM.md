# Marketplace Expiration & Extension System

## Overview
A comprehensive marketplace management system that allows admins to control item expiration, extensions, and pricing. Sellers receive notifications about expiring items and can extend their listings.

---

## ✨ Features Implemented

### 1. **Admin Dashboard - Marketplace Settings** (`/admin/marketplace-settings`)
Complete control panel for marketplace configuration:

#### Expiration Settings
- **Default Expiration Days**: Set how long new listings stay active (1-365 days)
- **Warning Days**: Configure when to notify sellers before expiration (1-30 days)
- **Auto-Expiration**: Automatically expire items after expiration date

#### Extension Settings
- **Allow Extensions**: Enable/disable listing extensions
- **Extension Duration**: Set extension period (1-90 days)
- **Max Extensions**: Limit how many times an item can be extended (0-10)

#### Free Listings
- **Enable Free Listings**: Allow free item postings
- **Free Duration**: Set duration for free listings
- **Free Listings Per User**: Limit free listings per user

#### Pricing Tiers
- Create multiple pricing tiers (e.g., Free-30 Days, Basic-60 Days, Premium-90 Days)
- Set custom prices and durations
- Mark tiers as "Featured"
- Delete or modify existing tiers

#### Category-Based Pricing
- Set different prices for different item categories
- Configure base posting price per category
- Set extension price per category

#### Notification Settings
- Toggle expiration warning notifications
- Toggle expired item notifications

---

### 2. **Automatic Expiration Checker** (`backend/scripts/check-expiring-items.js`)
Background script that monitors marketplace items:

**Features:**
- Checks for items expiring within warning period
- Automatically marks expired items
- Sends notifications to sellers
- Prevents duplicate notifications (24-hour cooldown)
- Provides extension information in notifications

**Usage:**
```bash
node scripts/check-expiring-items.js
```

**Recommended Setup:**
Set up a cron job or scheduled task to run this script daily:
```bash
# Run daily at 9 AM
0 9 * * * cd /path/to/backend && node scripts/check-expiring-items.js
```

---

### 3. **Seller Dashboard - Expiring Items** (`/marketplace/expiring-items`)
Dedicated page for sellers to manage expiring listings:

**Features:**
- View all items expiring soon or already expired
- Color-coded urgency indicators:
  - 🔴 Red: Expired or expiring today
  - 🟡 Yellow: Expiring within 7 days
  - 🟢 Green: More than 7 days remaining
- One-click extension with fee display
- Extension history (how many times extended)
- Direct links to item details
- Clear status badges

---

### 4. **Enhanced Notifications**
New notification types added:
- `item_expiring_soon`: Warns sellers N days before expiration
- `item_expired`: Notifies when item has expired
- `item_extended`: Confirms successful extension

**Notification Data Includes:**
- Days remaining
- Extension availability
- Extension price
- Item details

---

## 🔧 Technical Implementation

### Backend Models

#### `MarketplaceSettings.js`
```javascript
{
  defaultExpirationDays: Number,
  expirationWarningDays: Number,
  allowExtensions: Boolean,
  extensionDays: Number,
  maxExtensionsAllowed: Number,
  pricingTiers: [{
    name: String,
    duration: Number,
    price: Number,
    featured: Boolean
  }],
  categoryPricing: [{
    category: String,
    basePrice: Number,
    extensionPrice: Number
  }],
  freeListingsEnabled: Boolean,
  autoExpireEnabled: Boolean,
  sendExpirationWarnings: Boolean
}
```

#### `MarketplaceItem.js` (Enhanced)
```javascript
{
  expiresAt: Date,
  postingFee: Number,
  extensionFee: Number,
  totalFeesPaid: Number,
  extensionCount: Number,
  lastExtendedAt: Date
}
```

**Methods:**
- `extendExpiration(days, fee)`: Extend item expiration
- `canBeExtended(maxExtensions)`: Check if extension allowed
- `getDaysUntilExpiration()`: Calculate days remaining
- `cleanupExpired()`: Static method to expire old items

---

### Backend Routes

#### `/api/marketplace/settings` (Admin)
- `GET /`: Fetch current settings
- `PUT /`: Update settings (admin only)
- `POST /pricing-tier`: Add pricing tier (admin only)
- `DELETE /pricing-tier/:id`: Delete tier (admin only)
- `PUT /category-pricing/:category`: Update category pricing (admin only)

#### `/api/marketplace/extension` (Sellers)
- `GET /my-expiring-items`: Get seller's expiring items
- `POST /extend/:itemId`: Extend an item
- `GET /extension-info/:itemId`: Get extension details for item

---

### Frontend Components

#### `MarketplaceSettings.jsx`
Admin component for marketplace configuration
- Form-based settings management
- Pricing tier CRUD operations
- Category pricing editor
- Real-time validation

#### `MyExpiringItems.jsx`
Seller component for managing expiring listings
- Grid/list view of expiring items
- Color-coded urgency
- One-click extension
- Extension fee display
- Extension history tracking

---

## 📊 Admin Workflow

1. **Access Settings**: Navigate to `/admin/marketplace-settings`
2. **Configure Expiration**: Set default expiration and warning periods
3. **Set Up Pricing**: Create pricing tiers and category-based pricing
4. **Enable Extensions**: Configure extension rules and limits
5. **Save Settings**: Click "Save Settings" to apply changes
6. **Monitor**: View marketplace management dashboard for overview

---

## 🛍️ Seller Workflow

1. **Post Item**: Item automatically expires after configured days
2. **Receive Warning**: Get notification N days before expiration
3. **View Expiring Items**: Navigate to `/marketplace/expiring-items`
4. **Extend Listing**: Click "Extend for X Days" button
5. **Confirm**: Item extended for configured duration
6. **Track Extensions**: See extension count and remaining extensions

---

## 💰 Pricing Examples

### Example 1: Free with Paid Extensions
```
Default Expiration: 30 days
Free Listings: Enabled (30 days)
Extension: $2 per 30 days
Max Extensions: 3
```

### Example 2: Tiered Pricing
```
Free Tier: 30 days - $0
Basic Tier: 60 days - $5
Premium Tier: 90 days - $10 (Featured)
Extension: $3 per 30 days
```

### Example 3: Category-Based
```
Soccer Balls: $0 base, $2 extension
Cleats: $0 base, $3 extension
Training Equipment: $0 base, $5 extension
```

---

## 🚀 How to Use

### For Admins:
1. Go to Admin Dashboard
2. Click "Marketplace" section
3. Click "Configure Settings" on the Marketplace Settings card
4. Adjust settings as needed
5. Save changes

### For Sellers:
1. View "My Items" or check notifications
2. Click on expiring item notifications
3. Or navigate to `/marketplace/expiring-items`
4. Click "Extend" on items you want to keep active
5. Confirm extension

---

## 🔄 Automation Setup

### Daily Expiration Check (Recommended)

**Windows (Task Scheduler):**
```powershell
# Create a batch file: check-expiring.bat
cd C:\path\to\soccer-club\backend
node scripts\check-expiring-items.js

# Schedule it to run daily at 9 AM using Task Scheduler
```

**Linux/Mac (Crontab):**
```bash
# Add to crontab
0 9 * * * cd /path/to/soccer-club/backend && node scripts/check-expiring-items.js
```

---

## 🎯 Key Benefits

✅ **For Admins:**
- Complete control over marketplace timing
- Flexible pricing strategies
- Automated expiration management
- Revenue generation through extensions

✅ **For Sellers:**
- Clear expiration warnings
- Easy listing extensions
- Transparent pricing
- Extension history tracking

✅ **For System:**
- Keeps marketplace fresh
- Encourages active listings
- Prevents stale content
- Automated cleanup

---

## 📝 Notes

- Extension fees are configured per category
- Maximum extensions prevent infinite renewals
- Expired items are hidden from buyers but not deleted
- Sellers can extend expired items to reactivate them
- Notifications are sent once per 24 hours to avoid spam

---

## 🔧 Troubleshooting

**Issue**: Items not expiring
- **Solution**: Ensure `autoExpireEnabled` is true in settings
- Run the expiration checker script manually

**Issue**: Notifications not sent
- **Solution**: Check `sendExpirationWarnings` setting
- Verify SMTP/email configuration

**Issue**: Can't extend item
- **Solution**: Check if `allowExtensions` is enabled
- Verify extension count hasn't reached max

---

## 🎉 Summary

This comprehensive system provides:
1. ✅ Admin control over expiration and pricing
2. ✅ Automatic expiration checking and notifications
3. ✅ Seller UI for managing expiring items
4. ✅ Flexible pricing tiers and category-based pricing
5. ✅ Extension system with limits
6. ✅ Complete notification integration

The system is now ready to use! Admins can configure settings, and sellers will automatically receive notifications about expiring items.


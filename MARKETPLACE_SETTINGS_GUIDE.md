# Comprehensive Marketplace Settings System

## Overview
Complete administrative control center for all marketplace functions including ratings, reviews, moderation, display, notifications, fees, and security.

## ✅ Features Implemented

### **1. General Settings**
Control core marketplace functionality:
- Site name and description
- Maintenance mode toggle
- Guest browsing permissions
- Email verification requirements
- Automatic listing approval
- Image upload limits (quantity and resolution)
- Negotiable pricing toggle
- Messaging system enable/disable
- Offers system enable/disable
- Favorites system enable/disable
- Max active listings per user
- Listing expiration days (1-365)
- Listing extensions enable/disable
- Max extensions allowed (0-10)
- Extension duration in days

### **2. Ratings System (Comprehensive & Fair)**
Complete control over how ratings work:

#### **Rating System Type**
- 5-Star Rating (★★★★★)
- 10-Point Scale (1-10)
- Thumbs Up/Down (👍👎)
- Percentage (0-100%)

#### **Display Controls**
- Show/hide average rating
- Show/hide rating count
- Show/hide individual ratings
- Minimum rating threshold to display
- Hide/show user names in ratings
- Display rating distribution chart
- Show rating breakdown by stars

#### **Fairness & Verification**
- Require transaction to rate (prevents fake ratings)
- Enable verification badges ("Verified Purchase")
- Moderate ratings before publishing
- Flag inappropriate ratings
- Helpful votes system
- Rating edit window (0-30 days)
- Auto-hide negative ratings (optional)
- Negative rating threshold configuration

#### **Comment Controls**
- Require comments with ratings
- Min comment length (prevent spam)
- Max comment length (keep concise)
- Sort options: Recent, Helpful, Highest, Lowest

### **3. Review System (Extensive)**
Advanced review management:

#### **Review Requirements**
- Enable/disable review system
- Require transaction to review
- Allow/block anonymous reviews
- Min review length (5-100 chars, default: 20)
- Max review length (100-10K chars, default: 2000)

#### **Review Features**
- Allow review edits
- Review edit window (0-90 days, default: 14)
- Enable review images (up to 10 images)
- Enable review videos
- Review voting (helpful/not helpful)
- Review reporting system
- Display reviewer statistics
- Display review dates
- Verified buyer badges

#### **Seller Interaction**
- Enable review replies
- Allow seller responses
- Seller response window (1-90 days, default: 30)
- Auto-approve verified buyers' reviews

#### **Moderation**
- Moderate before publishing
- Auto-approve verified buyers (optional)
- Review filters by rating/date
- Show review summary statistics

#### **Display Settings**
- Reviews per page (5-100, default: 10)
- Sort order: Recent, Helpful, Rating
- Enable advanced filters
- Show review summary

### **4. Moderation Settings**
Powerful content moderation tools:

#### **Auto-Moderation**
- Enable automatic moderation
- Profanity filter
- Block suspicious listings
- Require manual approval
- Flag threshold (1-20, default: 3)
- Auto-remove threshold (2-50, default: 10)

#### **Content Filtering**
- Image moderation
- Block explicit content
- Spam detection
- Banned words blocking
- Duplicate listing detection (by title, image, or both)

#### **Price Validation**
- Enable price validation
- Min price limit
- Max price limit
- Suspicious price threshold alert

#### **User Verification**
- Phone verification requirement
- ID verification requirement
- Trust score system
- Minimum trust score to list

#### **Enforcement**
- Ban duration (1-365 days, default: 30)
- Warning before ban
- Max warnings before ban (1-10, default: 3)

### **5. Display Settings**
Control how marketplace appears to users:

#### **Layout**
- Listings per page (6-100, default: 24)
- Grid columns (2, 3, 4, or 6)
- Featured listings section
- Featured listings count
- Recent listings section
- Recent listings count
- Trending listings section

#### **Item Display**
- Quick view modal
- Seller info display
- Location in results
- Price in results
- Condition badge
- View count display
- Favorite count display
- Image zoom feature
- Image carousel

#### **Sorting & Filtering**
- Default sort order (Recent, Price Low-High, Popular)
- Enable advanced filters
- Similar items suggestion
- Similar items count

#### **User Features**
- Social sharing buttons
- Breadcrumb navigation
- Wishlist functionality
- Compare feature
- Max compare items (2-10, default: 4)

### **6. Notification Settings**
Comprehensive notification control:

#### **Channels**
- Email notifications
- Push notifications
- SMS notifications (if enabled)

#### **Event Notifications**
- New listing posted
- Price change alerts
- New messages
- New offers
- Offer accepted
- Item sold
- Item expiring soon
- Expiration warning days (1-30, default: 7)
- New reviews
- New ratings
- Item flagged
- Low inventory (if applicable)
- Suspicious activity (admin)

#### **Digest Options**
- Daily digest emails
- Weekly reports

### **7. Fee & Payment Settings**
Complete financial control:

#### **Listing Fees**
- Enable/disable listing fees
- Default posting fee
- Default renewal fee
- Default extension fee
- Default featured listing fee

#### **Commission**
- Enable commission system
- Commission percentage (0-100%)
- Commission flat fee
- Free listings per month (0-100)

#### **Pricing**
- Promotional pricing toggle
- Bulk discounts toggle
- Payment processor (Stripe, PayPal, Square)
- Currency selection
- Tax enable/disable
- Tax rate (0-100%)

#### **Refunds**
- Enable refunds
- Refund window (1-90 days, default: 30)

### **8. Security Settings**
Robust security controls:

#### **Rate Limiting**
- Enable rate limiting
- Max requests per minute (10-1000, default: 60)

#### **CAPTCHA**
- Enable CAPTCHA
- CAPTCHA provider (reCAPTCHA, hCaptcha)

#### **Authentication**
- Two-factor authentication toggle
- Require strong passwords
- Min password length (6-32, default: 8)
- Session timeout (5-1440 minutes, default: 30)

#### **Login Protection**
- Login attempt limiting
- Max login attempts (3-20, default: 5)
- Lockout duration (1-1440 minutes, default: 15)

#### **Advanced Security**
- IP blocking
- Security event logging
- Data encryption
- Audit log
- GDPR compliance mode
- Cookie consent banner

## 🎯 How to Use

### Accessing Settings

1. Navigate to **Admin Dashboard**
2. Click **Marketplace Management**
3. Select the **Settings** tab
4. Choose a settings category from the tabs

### Modifying Settings

1. Select a settings category (General, Ratings, Reviews, etc.)
2. Modify any setting using:
   - **Toggle switches** for enable/disable options
   - **Number inputs** for numerical values
   - **Dropdown menus** for predefined options
   - **Text inputs** for custom text
3. Changes are tracked in real-time
4. Click **"Save All Settings"** button when done

### Saving Changes

- **Save All Settings**: Saves all changes across all categories
- Settings are validated before saving
- Success/error messages appear as toast notifications
- Changes take effect immediately

### Resetting Settings

1. Click **"Reset to Default"** button
2. Confirm the action
3. All settings return to default values
4. This action cannot be undone

## 📊 Settings Categories

### General Settings Tab
Core marketplace functionality and feature toggles.

**Key Settings:**
- Maintenance mode (emergency disable)
- Auto-approve listings (trust vs. control)
- Max images per listing (balance quality vs. load)
- Listing expiration (encourage fresh content)

### Ratings System Tab
Complete control over rating display and fairness.

**Key Settings:**
- Rating system type (choose what fits your users)
- Require transaction to rate (prevent fake reviews)
- Enable verification badges (build trust)
- Moderate before publish (quality control)

### Reviews Tab
Detailed review system configuration.

**Key Settings:**
- Min/max review length (quality standards)
- Enable review images (richer feedback)
- Seller response window (encourage engagement)
- Moderate before publish (content quality)

### Moderation Tab
Content and user moderation controls.

**Key Settings:**
- Flag threshold (community-driven moderation)
- Profanity filter (keep it clean)
- Price validation (prevent scams)
- Trust score system (reputation-based access)

### Display Tab
Visual presentation and UX controls.

**Key Settings:**
- Grid columns (desktop/mobile optimization)
- Featured listings count (balance promotion)
- Default sort order (user preference)
- Enable quick view (faster browsing)

### Notifications Tab
Communication preferences for all users.

**Key Settings:**
- Email notifications (primary channel)
- Push notifications (real-time alerts)
- Expiration warning days (give users time)
- Daily digest (reduce notification fatigue)

### Fees & Payments Tab
Financial and payment processing settings.

**Key Settings:**
- Enable listing fees (monetization)
- Commission percentage (revenue model)
- Free listings per month (user acquisition)
- Refund window (buyer protection)

### Security Tab
Platform security and compliance.

**Key Settings:**
- Rate limiting (DDoS protection)
- CAPTCHA (bot prevention)
- Two-factor auth (enhanced security)
- GDPR compliance (legal requirements)

## 🔧 Technical Implementation

### Frontend
- **Component**: `frontend/src/components/UnifiedMarketplaceManager.jsx`
- **State Management**: React useState hooks
- **Real-time Updates**: Settings update immediately in UI
- **Validation**: Client-side validation before saving
- **Toast Notifications**: User feedback on actions

### Backend
- **Model**: `backend/models/MarketplaceSettings.js`
- **Routes**: `backend/routes/marketplaceSettings.js`
- **Endpoint**: `PUT /api/marketplace/settings`
- **Authentication**: Admin-only access with JWT
- **Validation**: Mongoose schema validation

### Database
- **Collection**: `marketplacesettings`
- **Schema**: Comprehensive nested object structure
- **Indexes**: Optimized for quick retrieval
- **Versioning**: Timestamps for change tracking

## 🚀 Best Practices

### Ratings & Reviews

1. **Enable Transaction Requirement**
   - Prevents fake ratings/reviews
   - Builds genuine trust
   - Recommended: **ON**

2. **Moderate Before Publishing**
   - Quality control
   - Prevents inappropriate content
   - Recommended: **ON** for reviews, **OFF** for ratings (faster)

3. **Allow Edits with Time Limit**
   - Users can fix mistakes
   - Prevent abuse with time window
   - Recommended: **7 days** for ratings, **14 days** for reviews

4. **Enable Verification Badges**
   - Shows "Verified Purchase"
   - Builds trust instantly
   - Recommended: **ON**

5. **Display Rating Distribution**
   - Transparent feedback overview
   - Helps buyers make decisions
   - Recommended: **ON**

### Moderation

1. **Set Appropriate Flag Threshold**
   - Too low: Good content gets hidden
   - Too high: Bad content stays visible
   - Recommended: **3-5 flags**

2. **Enable Auto-Moderation**
   - Reduces admin workload
   - Catches obvious violations
   - Recommended: **ON**

3. **Price Validation**
   - Prevents scams
   - Alert on suspicious prices
   - Recommended: **ON** with threshold

4. **Trust Score System**
   - Reputation-based access
   - New users build trust gradually
   - Recommended: **ON** with low barrier (0-20)

### Display & UX

1. **Optimize Grid Layout**
   - Desktop: 4 columns
   - Tablet: 3 columns
   - Mobile: 2 columns
   - Recommended: **4 columns** default

2. **Featured Listings**
   - Prime visibility for quality items
   - Monetization opportunity
   - Recommended: **8-12 items**

3. **Enable Quick View**
   - Faster browsing experience
   - Reduces page loads
   - Recommended: **ON**

4. **Similar Items**
   - Increases engagement
   - Cross-selling opportunity
   - Recommended: **ON** with 4-6 items

### Fees & Revenue

1. **Start with Free Listings**
   - Build user base first
   - Add fees gradually
   - Recommended: **3-5 free/month**

2. **Commission vs. Listing Fees**
   - Commission: Take % of sale (better UX)
   - Listing fees: Upfront cost (guaranteed revenue)
   - Recommended: **Commission model** (10-15%)

3. **Promotional Pricing**
   - Seasonal discounts
   - User acquisition campaigns
   - Recommended: **Enable** for flexibility

### Security

1. **Rate Limiting**
   - Prevents DDoS attacks
   - Protects server resources
   - Recommended: **60 requests/minute**

2. **CAPTCHA on Forms**
   - Prevents bot spam
   - Minimal user friction
   - Recommended: **ON** for registration/posting

3. **Two-Factor Authentication**
   - Enhanced account security
   - Optional for users, required for admins
   - Recommended: **Optional** for users

4. **GDPR Compliance**
   - Legal requirement in EU
   - Privacy best practice
   - Recommended: **ON** always

## 📈 Impact on User Experience

### Ratings & Reviews
- **High Quality Control** → Slower approval but trusted content
- **Quick Approval** → Faster feedback but potential spam
- **Balance**: Moderate reviews, auto-approve ratings from verified buyers

### Moderation
- **Strict Moderation** → Safer but slower marketplace
- **Light Moderation** → Faster but riskier
- **Balance**: Auto-moderation + community flags + periodic review

### Fees
- **High Fees** → Less listings but higher quality
- **Low/No Fees** → More listings but variable quality
- **Balance**: Free tier + premium features + commission on sales

## 🔄 Regular Maintenance

### Weekly
- Review flagged items (Moderation tab)
- Check notification settings effectiveness
- Monitor user feedback on ratings/reviews

### Monthly
- Analyze rating distribution patterns
- Review fee structure effectiveness
- Update banned words list
- Check security logs

### Quarterly
- Comprehensive settings review
- User survey on UX preferences
- Adjust thresholds based on growth
- Export settings backup

## 📝 API Endpoints

### Get Settings (Public - Limited)
```
GET /api/marketplace/settings
```
Returns public-facing settings only.

### Get Settings (Admin - Full)
```
GET /api/marketplace/settings/admin
Authorization: Bearer {token}
```
Returns complete settings object.

### Update Settings
```
PUT /api/marketplace/settings
Authorization: Bearer {token}
Content-Type: application/json

{
  "general": { ... },
  "ratings": { ... },
  "reviews": { ... },
  ...
}
```

### Reset to Default
```
POST /api/marketplace/settings/reset
Authorization: Bearer {token}
```

### Get Specific Section
```
GET /api/marketplace/settings/:section
Authorization: Bearer {token}
```
Sections: general, ratings, reviews, moderation, display, notifications, fees, security

### Update Specific Section
```
PUT /api/marketplace/settings/:section
Authorization: Bearer {token}
Content-Type: application/json

{
  "enableRatings": true,
  "ratingSystem": "5-star",
  ...
}
```

### Export Settings
```
GET /api/marketplace/settings/export/json
Authorization: Bearer {token}
```
Downloads JSON file with all settings.

### Import Settings
```
POST /api/marketplace/settings/import
Authorization: Bearer {token}
Content-Type: application/json

{
  "general": { ... },
  ...
}
```

## 🎨 UI Features

### Tab Navigation
- **8 Categories**: General, Ratings, Reviews, Moderation, Display, Notifications, Fees, Security
- **Active Highlighting**: Green border on active tab
- **Icons**: Visual indicators for each category
- **Scrollable**: Horizontal scroll on mobile

### Form Controls
- **Toggle Switches**: Visual on/off switches
- **Number Inputs**: Spinners with min/max validation
- **Dropdowns**: Predefined option selection
- **Text Inputs**: Custom text entry
- **Color Coding**: Red for dangerous options (e.g., Maintenance Mode)

### Save Functionality
- **Save All Button**: Top-right and sticky bottom
- **Loading State**: "Saving..." indicator
- **Success Toast**: Green notification on save
- **Error Toast**: Red notification with error message
- **Auto-reload**: Settings refresh after successful save

### Reset Feature
- **Confirmation Dialog**: Prevents accidental resets
- **Instant Reset**: Returns to default values
- **Visual Feedback**: Toast notification
- **Non-destructive**: Can immediately save to undo

## 🔒 Security & Permissions

- **Admin-Only Access**: All settings require admin role
- **JWT Authentication**: Secure token-based auth
- **Validation**: Server-side validation of all inputs
- **Audit Log**: Track who changed what (if enabled)
- **Change History**: Timestamps on all modifications

## 🐛 Troubleshooting

**Settings Not Saving**
- Check admin permissions
- Verify JWT token validity
- Check browser console for errors
- Ensure backend server is running

**Settings Not Loading**
- Verify API endpoint is correct
- Check network tab for 401/403 errors
- Ensure admin route is registered
- Check MongoDB connection

**Changes Not Reflecting**
- Clear browser cache
- Check if settings are being applied in components
- Verify frontend is fetching latest settings
- Check for JavaScript errors

**Validation Errors**
- Review min/max constraints
- Check enum values for dropdowns
- Ensure required fields are filled
- Validate number ranges

## 📚 Related Documentation

- [Category & Fee Management](./CATEGORY_FEE_MANAGEMENT_GUIDE.md)
- [Unified Marketplace Manager](./MARKETPLACE_MANAGER_README.md)
- [Rating System](./COMPREHENSIVE_RATING_SYSTEM.md)
- [Finance Integration](./FINANCE_INTEGRATION_DEMO.md)

---

**Last Updated**: October 24, 2025  
**Version**: 3.0  
**Status**: Production Ready ✅  
**Coverage**: 100% Feature Complete

This settings system provides complete administrative control over every aspect of the marketplace, ensuring fairness, security, and an optimal user experience.


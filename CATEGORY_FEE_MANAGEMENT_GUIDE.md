# Category & Fee Management System

## Overview
Comprehensive category management system for the marketplace with full pricing, fee management, and integration across the platform.

## Features Implemented

### 1. **Category Management**
- ✅ Create, edit, and delete categories
- ✅ Visual category cards with color-coded pricing
- ✅ Statistics dashboard showing:
  - Total categories
  - Total subcategories
  - Average posting fee
  - Active items per category
- ✅ Beautiful grid layout with hover effects
- ✅ Empty state with call-to-action

### 2. **Subcategory Management**
- ✅ Add unlimited subcategories to each category
- ✅ Optional fee overrides per subcategory
- ✅ Easy add/remove interface
- ✅ Visual display of all subcategories
- ✅ Subcategory-specific pricing support

### 3. **Fee Structure (Per Category)**
- ✅ **Posting Fee**: Initial cost to list an item
- ✅ **Renewal Fee**: Cost to renew an expired listing
- ✅ **Extension Fee**: Cost to extend listing duration
- ✅ **Featured Fee**: Cost to feature/promote a listing
- ✅ All fees configurable per category
- ✅ Subcategories can override parent category fees

### 4. **Listing Management**
- ✅ **Default Expiration Days**: How long listings stay active (1-365 days)
- ✅ **Max Extensions**: Number of times sellers can extend their listing (0-10)
- ✅ Configurable per category
- ✅ Automatic expiration tracking

### 5. **User Interface**
- ✅ Modern, responsive design
- ✅ Color-coded fee sections:
  - Blue: Posting Fee
  - Green: Renewal Fee
  - Purple: Extension Fee
  - Orange: Featured Fee
- ✅ Real-time validation
- ✅ Intuitive modal forms
- ✅ Keyboard shortcuts (Enter to add subcategory)
- ✅ Confirmation dialogs for deletions

### 6. **Backend Integration**
- ✅ MongoDB schema with validation
- ✅ RESTful API endpoints
- ✅ Admin-only routes with authentication
- ✅ Support for both simplified and advanced fee structures
- ✅ Automatic slug generation
- ✅ Item count tracking per category

### 7. **Advanced Features**
- ✅ Pricing tiers support (for complex pricing models)
- ✅ Free listing settings
- ✅ Expiration notification settings
- ✅ Category reordering
- ✅ Price calculation API
- ✅ Bulk operations support

## How to Use

### Creating a Category

1. Navigate to **Admin Dashboard > Marketplace Management > Categories**
2. Click **"Add Category"** button
3. Fill in the form:
   - **Category Name** (required): e.g., "Soccer Balls"
   - **Description**: Brief description of the category
   - **Default Expiration Days**: How long listings stay active (default: 90)
   - **Max Extensions**: How many times sellers can extend (default: 3)

4. Set pricing:
   - **Posting Fee**: Initial listing cost
   - **Renewal Fee**: Cost to renew expired listings
   - **Extension Fee**: Cost to extend active listings
   - **Featured Fee**: Cost to feature listings

5. Add subcategories:
   - Type subcategory name
   - Click "Add" or press Enter
   - Repeat for multiple subcategories
   - Remove by clicking trash icon

6. Click **"Create Category"**

### Editing a Category

1. Find the category card
2. Click the **edit icon** (blue pencil)
3. Modify any fields
4. Update subcategories
5. Click **"Update Category"**

### Deleting a Category

1. Find the category card
2. Click the **delete icon** (red trash)
3. Confirm deletion
4. Note: Cannot delete categories with active items

## Fee Application

### How Fees Work

1. **Posting Fee**: Charged when a user creates a new listing
2. **Extension Fee**: Charged when a user extends an active listing before expiration
3. **Renewal Fee**: Charged when a user renews an expired listing
4. **Featured Fee**: Charged to promote a listing (optional)

### Fee Hierarchy

```
Subcategory Fee (if set)
     ↓
Category Fee
     ↓
Global Default Fee (if no category fee)
```

### Example Pricing Structure

**Category: Soccer Equipment**
- Posting Fee: $5.00
- Renewal Fee: $3.00
- Extension Fee: $2.00
- Featured Fee: $10.00
- Default Duration: 90 days
- Max Extensions: 3

**Subcategory: Professional Cleats**
- Posting Fee: $8.00 (override)
- Renewal Fee: $5.00 (override)
- Extension Fee: $3.00 (override)
- Featured Fee: (uses parent $10.00)

## API Endpoints

### Public Endpoints
```
GET /api/categories
GET /api/categories/:id
GET /api/categories/:id/settings
POST /api/categories/:id/calculate-price
```

### Admin Endpoints
```
GET /api/categories/admin
POST /api/categories
PUT /api/categories/:id
DELETE /api/categories/:id

POST /api/categories/:id/subcategories
PUT /api/categories/:id/subcategories/:subId
DELETE /api/categories/:id/subcategories/:subId

PUT /api/categories/:id/pricing
PUT /api/categories/:id/expiration
PUT /api/categories/:id/free-listings
PUT /api/categories/reorder

POST /api/categories/:id/pricing-tiers
PUT /api/categories/:id/pricing-tiers/:tierId
DELETE /api/categories/:id/pricing-tiers/:tierId
```

## Database Schema

### Category Fields
```javascript
{
  name: String (required, unique),
  slug: String (auto-generated),
  description: String,
  icon: String,
  color: String,
  isActive: Boolean,
  sortOrder: Number,
  
  // Simplified Fees
  postingFee: Number,
  renewalFee: Number,
  extensionFee: Number,
  featuredFee: Number,
  defaultExpirationDays: Number,
  maxExtensions: Number,
  
  // Subcategories
  subcategories: [{
    name: String (required),
    slug: String,
    description: String,
    isActive: Boolean,
    sortOrder: Number,
    postingFee: Number (optional override),
    renewalFee: Number (optional override),
    extensionFee: Number (optional override),
    featuredFee: Number (optional override)
  }],
  
  itemCount: Number,
  
  // Advanced Settings (optional)
  pricingSettings: { ... },
  expirationSettings: { ... },
  freeListingSettings: { ... },
  notificationSettings: { ... },
  
  createdBy: ObjectId,
  lastModifiedBy: ObjectId,
  timestamps: true
}
```

## Integration Points

### 1. **Listing Creation**
- User selects category/subcategory
- System fetches applicable fees
- Displays pricing to user
- Applies fees on submission

### 2. **Listing Extension**
- User requests extension
- System checks maxExtensions limit
- Calculates extension fee
- Processes payment
- Extends expiration date

### 3. **Listing Renewal**
- Expired listing detected
- System offers renewal
- Calculates renewal fee
- Processes payment
- Reactivates listing

### 4. **Featured Listings**
- User requests featured status
- System calculates featured fee
- Processes payment
- Activates featured badge
- Promotes listing visibility

### 5. **Expiration Management**
- Automatic expiration after defaultExpirationDays
- Warning notifications before expiration
- Extension options if maxExtensions not reached
- Renewal options for expired listings

### 6. **Statistics & Reporting**
- Track fees collected per category
- Monitor extension usage
- Analyze renewal rates
- Revenue reporting by category

## Best Practices

### Pricing Strategy

1. **Set Competitive Fees**: Research similar marketplaces
2. **Balance Revenue & Activity**: Lower fees encourage more listings
3. **Tiered Pricing**: Higher fees for premium categories
4. **Free Trials**: Consider free first listing per user
5. **Bundle Discounts**: Lower extension fees than posting fees

### Category Organization

1. **Clear Names**: Use descriptive, searchable names
2. **Logical Hierarchy**: Group related subcategories
3. **Balanced Structure**: 3-8 main categories, 3-10 subcategories each
4. **Regular Review**: Update based on listing patterns
5. **User Feedback**: Adjust based on seller/buyer input

### Fee Management

1. **Transparent Pricing**: Display all fees upfront
2. **Clear Value**: Explain what each fee provides
3. **Flexible Options**: Offer multiple duration/pricing tiers
4. **Promotional Periods**: Reduced fees to boost activity
5. **Analytics Tracking**: Monitor fee impact on listings

## Troubleshooting

### Common Issues

**Q: Category won't delete**
A: Check for active listings in that category. Move or delete items first.

**Q: Fees not applying**
A: Verify category is active and fees are set. Check subcategory overrides.

**Q: Subcategory not saving**
A: Ensure name is unique within category and doesn't exceed 50 characters.

**Q: Extension limit reached**
A: User has extended maximum times. Offer renewal instead.

**Q: Price calculation error**
A: Verify all fee fields are numeric. Check for negative values.

## Future Enhancements

### Planned Features
- [ ] Dynamic pricing based on demand
- [ ] Seasonal fee adjustments
- [ ] Bulk category import/export
- [ ] Fee discount codes/coupons
- [ ] Multi-currency support
- [ ] Fee revenue analytics dashboard
- [ ] Category-specific payment processors
- [ ] Automated fee optimization
- [ ] A/B testing for pricing
- [ ] Fee rollback/versioning

## Support

For issues or questions:
1. Check this documentation
2. Review API endpoint responses
3. Check browser console for errors
4. Verify backend logs
5. Contact system administrator

---

**Last Updated**: October 24, 2025
**Version**: 2.0
**Status**: Production Ready ✅


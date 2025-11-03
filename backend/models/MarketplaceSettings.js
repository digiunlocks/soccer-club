const mongoose = require('mongoose');

const marketplaceSettingsSchema = new mongoose.Schema({
  // General Settings
  general: {
    siteName: {
      type: String,
      default: 'Soccer Club Marketplace'
    },
    siteDescription: {
      type: String,
      default: 'Buy and sell soccer equipment'
    },
    maintenanceMode: {
      type: Boolean,
      default: false
    },
    allowGuestBrowsing: {
      type: Boolean,
      default: true
    },
    requireEmailVerification: {
      type: Boolean,
      default: true
    },
    autoApproveListings: {
      type: Boolean,
      default: false
    },
    maxImagesPerListing: {
      type: Number,
      default: 10,
      min: 1,
      max: 20
    },
    minImageResolution: {
      type: Number,
      default: 800
    },
    allowNegotiablePrices: {
      type: Boolean,
      default: true
    },
    enableMessaging: {
      type: Boolean,
      default: true
    },
    enableOffers: {
      type: Boolean,
      default: true
    },
    enableFavorites: {
      type: Boolean,
      default: true
    },
    maxActiveListingsPerUser: {
      type: Number,
      default: 50,
      min: 1,
      max: 1000
    },
    listingExpirationDays: {
      type: Number,
      default: 90,
      min: 1,
      max: 365
    },
    enableListingExtensions: {
      type: Boolean,
      default: true
    },
    maxListingExtensions: {
      type: Number,
      default: 3,
      min: 0,
      max: 10
    },
    extensionDays: {
      type: Number,
      default: 30,
      min: 1,
      max: 90
    }
  },

  // Rating System Settings
  ratings: {
    enableRatings: {
      type: Boolean,
      default: true
    },
    ratingSystem: {
      type: String,
      enum: ['5-star', '10-point', 'thumbs', 'percentage'],
      default: '5-star'
    },
    allowSellerRatings: {
      type: Boolean,
      default: true
    },
    allowBuyerRatings: {
      type: Boolean,
      default: true
    },
    requireTransactionToRate: {
      type: Boolean,
      default: true
    },
    displayAverageRating: {
      type: Boolean,
      default: true
    },
    displayRatingCount: {
      type: Boolean,
      default: true
    },
    displayIndividualRatings: {
      type: Boolean,
      default: true
    },
    minRatingToDisplay: {
      type: Number,
      default: 1,
      min: 1,
      max: 5
    },
    hideUserNamesInRatings: {
      type: Boolean,
      default: false
    },
    allowRatingEdits: {
      type: Boolean,
      default: true
    },
    ratingEditWindow: {
      type: Number,
      default: 7,
      min: 0,
      max: 30
    },
    requireRatingComment: {
      type: Boolean,
      default: false
    },
    minCommentLength: {
      type: Number,
      default: 10,
      min: 0,
      max: 100
    },
    maxCommentLength: {
      type: Number,
      default: 500,
      min: 50,
      max: 2000
    },
    enableRatingVerification: {
      type: Boolean,
      default: true
    },
    verifiedBadgeText: {
      type: String,
      default: 'Verified Purchase'
    },
    flagInappropriateRatings: {
      type: Boolean,
      default: true
    },
    autoHideNegativeRatings: {
      type: Boolean,
      default: false
    },
    negativeRatingThreshold: {
      type: Number,
      default: 2,
      min: 1,
      max: 5
    },
    displayRatingDistribution: {
      type: Boolean,
      default: true
    },
    enableHelpfulVotes: {
      type: Boolean,
      default: true
    },
    sortRatingsBy: {
      type: String,
      enum: ['recent', 'helpful', 'rating-high', 'rating-low'],
      default: 'recent'
    },
    moderateRatingsBeforePublish: {
      type: Boolean,
      default: false
    }
  },

  // Review System Settings
  reviews: {
    enableReviews: {
      type: Boolean,
      default: true
    },
    requireTransactionToReview: {
      type: Boolean,
      default: false
    },
    allowAnonymousReviews: {
      type: Boolean,
      default: false
    },
    minReviewLength: {
      type: Number,
      default: 20,
      min: 5,
      max: 100
    },
    maxReviewLength: {
      type: Number,
      default: 2000,
      min: 100,
      max: 10000
    },
    allowReviewEdits: {
      type: Boolean,
      default: true
    },
    reviewEditWindow: {
      type: Number,
      default: 14,
      min: 0,
      max: 90
    },
    enableReviewImages: {
      type: Boolean,
      default: true
    },
    maxReviewImages: {
      type: Number,
      default: 5,
      min: 0,
      max: 10
    },
    enableReviewVideos: {
      type: Boolean,
      default: false
    },
    moderateReviewsBeforePublish: {
      type: Boolean,
      default: true
    },
    autoApproveVerifiedBuyers: {
      type: Boolean,
      default: false
    },
    enableReviewReplies: {
      type: Boolean,
      default: true
    },
    allowSellerResponses: {
      type: Boolean,
      default: true
    },
    sellerResponseWindow: {
      type: Number,
      default: 30,
      min: 1,
      max: 90
    },
    enableReviewVoting: {
      type: Boolean,
      default: true
    },
    enableReviewReporting: {
      type: Boolean,
      default: true
    },
    displayReviewerStats: {
      type: Boolean,
      default: true
    },
    displayReviewDate: {
      type: Boolean,
      default: true
    },
    displayVerifiedBadge: {
      type: Boolean,
      default: true
    },
    sortReviewsBy: {
      type: String,
      enum: ['recent', 'helpful', 'rating'],
      default: 'recent'
    },
    reviewsPerPage: {
      type: Number,
      default: 10,
      min: 5,
      max: 100
    },
    enableReviewFilters: {
      type: Boolean,
      default: true
    },
    showReviewSummary: {
      type: Boolean,
      default: true
    }
  },

  // Moderation Settings
  moderation: {
    enableAutoModeration: {
      type: Boolean,
      default: true
    },
    profanityFilter: {
      type: Boolean,
      default: true
    },
    blockSuspiciousListings: {
      type: Boolean,
      default: true
    },
    requireManualApproval: {
      type: Boolean,
      default: false
    },
    flagThreshold: {
      type: Number,
      default: 3,
      min: 1,
      max: 20
    },
    autoRemoveThreshold: {
      type: Number,
      default: 10,
      min: 2,
      max: 50
    },
    enableImageModeration: {
      type: Boolean,
      default: true
    },
    blockExplicitContent: {
      type: Boolean,
      default: true
    },
    enableSpamDetection: {
      type: Boolean,
      default: true
    },
    enablePriceValidation: {
      type: Boolean,
      default: true
    },
    minPrice: {
      type: Number,
      default: 1,
      min: 0
    },
    maxPrice: {
      type: Number,
      default: 100000,
      min: 1
    },
    suspiciousPriceThreshold: {
      type: Number,
      default: 10000
    },
    blockDuplicateListings: {
      type: Boolean,
      default: true
    },
    duplicateDetectionMethod: {
      type: String,
      enum: ['title', 'image', 'title-image'],
      default: 'title-image'
    },
    blockBannedWords: {
      type: Boolean,
      default: true
    },
    requirePhoneVerification: {
      type: Boolean,
      default: false
    },
    requireIdVerification: {
      type: Boolean,
      default: false
    },
    trustScoreEnabled: {
      type: Boolean,
      default: true
    },
    minTrustScoreToList: {
      type: Number,
      default: 0,
      min: 0,
      max: 100
    },
    banDuration: {
      type: Number,
      default: 30,
      min: 1,
      max: 365
    },
    warningBeforeBan: {
      type: Boolean,
      default: true
    },
    maxWarnings: {
      type: Number,
      default: 3,
      min: 1,
      max: 10
    }
  },

  // Display Settings
  display: {
    listingsPerPage: {
      type: Number,
      default: 24,
      min: 6,
      max: 100
    },
    gridColumns: {
      type: Number,
      default: 4,
      enum: [2, 3, 4, 6]
    },
    showFeaturedListings: {
      type: Boolean,
      default: true
    },
    featuredListingsCount: {
      type: Number,
      default: 8
    },
    showRecentListings: {
      type: Boolean,
      default: true
    },
    recentListingsCount: {
      type: Number,
      default: 12
    },
    showTrendingListings: {
      type: Boolean,
      default: true
    },
    enableQuickView: {
      type: Boolean,
      default: true
    },
    showSellerInfo: {
      type: Boolean,
      default: true
    },
    showLocationInResults: {
      type: Boolean,
      default: true
    },
    showPriceInResults: {
      type: Boolean,
      default: true
    },
    showConditionInResults: {
      type: Boolean,
      default: true
    },
    showViewCount: {
      type: Boolean,
      default: true
    },
    showFavoriteCount: {
      type: Boolean,
      default: true
    },
    enableImageZoom: {
      type: Boolean,
      default: true
    },
    enableImageCarousel: {
      type: Boolean,
      default: true
    },
    defaultSortOrder: {
      type: String,
      enum: ['recent', 'price-low', 'price-high', 'popular'],
      default: 'recent'
    },
    enableAdvancedFilters: {
      type: Boolean,
      default: true
    },
    showSimilarItems: {
      type: Boolean,
      default: true
    },
    similarItemsCount: {
      type: Number,
      default: 4
    },
    enableSocialSharing: {
      type: Boolean,
      default: true
    },
    showBreadcrumbs: {
      type: Boolean,
      default: true
    },
    enableWishlist: {
      type: Boolean,
      default: true
    },
    enableCompare: {
      type: Boolean,
      default: true
    },
    maxCompareItems: {
      type: Number,
      default: 4,
      min: 2,
      max: 10
    }
  },

  // Notification Settings
  notifications: {
    enableEmailNotifications: {
      type: Boolean,
      default: true
    },
    enablePushNotifications: {
      type: Boolean,
      default: true
    },
    enableSMSNotifications: {
      type: Boolean,
      default: false
    },
    notifyOnNewListing: {
      type: Boolean,
      default: true
    },
    notifyOnPriceChange: {
      type: Boolean,
      default: true
    },
    notifyOnNewMessage: {
      type: Boolean,
      default: true
    },
    notifyOnNewOffer: {
      type: Boolean,
      default: true
    },
    notifyOnOfferAccepted: {
      type: Boolean,
      default: true
    },
    notifyOnItemSold: {
      type: Boolean,
      default: true
    },
    notifyOnItemExpiring: {
      type: Boolean,
      default: true
    },
    expirationWarningDays: {
      type: Number,
      default: 7,
      min: 1,
      max: 30
    },
    notifyOnNewReview: {
      type: Boolean,
      default: true
    },
    notifyOnNewRating: {
      type: Boolean,
      default: true
    },
    notifyOnItemFlagged: {
      type: Boolean,
      default: true
    },
    notifyOnLowInventory: {
      type: Boolean,
      default: false
    },
    notifyAdminOnSuspiciousActivity: {
      type: Boolean,
      default: true
    },
    dailyDigest: {
      type: Boolean,
      default: false
    },
    weeklyReport: {
      type: Boolean,
      default: true
    }
  },

  // Fee Settings
  fees: {
    enableListingFees: {
      type: Boolean,
      default: false
    },
    defaultPostingFee: {
      type: Number,
      default: 0,
      min: 0
    },
    defaultRenewalFee: {
      type: Number,
      default: 0,
      min: 0
    },
    defaultExtensionFee: {
      type: Number,
      default: 0,
      min: 0
    },
    defaultFeaturedFee: {
      type: Number,
      default: 5,
      min: 0
    },
    commissionEnabled: {
      type: Boolean,
      default: false
    },
    commissionPercentage: {
      type: Number,
      default: 10,
      min: 0,
      max: 100
    },
    commissionFlatFee: {
      type: Number,
      default: 0,
      min: 0
    },
    freeListingsPerMonth: {
      type: Number,
      default: 3,
      min: 0,
      max: 100
    },
    enablePromotionalPricing: {
      type: Boolean,
      default: false
    },
    enableBulkDiscounts: {
      type: Boolean,
      default: false
    },
    paymentProcessor: {
      type: String,
      enum: ['stripe', 'paypal', 'square'],
      default: 'stripe'
    },
    currency: {
      type: String,
      default: 'USD'
    },
    taxEnabled: {
      type: Boolean,
      default: false
    },
    taxRate: {
      type: Number,
      default: 0,
      min: 0,
      max: 100
    },
    enableRefunds: {
      type: Boolean,
      default: true
    },
    refundWindow: {
      type: Number,
      default: 30,
      min: 1,
      max: 90
    }
  },

  // Security Settings
  security: {
    enableRateLimiting: {
      type: Boolean,
      default: true
    },
    maxRequestsPerMinute: {
      type: Number,
      default: 60,
      min: 10,
      max: 1000
    },
    enableCaptcha: {
      type: Boolean,
      default: true
    },
    captchaProvider: {
      type: String,
      enum: ['recaptcha', 'hcaptcha'],
      default: 'recaptcha'
    },
    enableTwoFactorAuth: {
      type: Boolean,
      default: false
    },
    requireStrongPasswords: {
      type: Boolean,
      default: true
    },
    minPasswordLength: {
      type: Number,
      default: 8,
      min: 6,
      max: 32
    },
    sessionTimeout: {
      type: Number,
      default: 30,
      min: 5,
      max: 1440
    },
    enableLoginAttemptLimiting: {
      type: Boolean,
      default: true
    },
    maxLoginAttempts: {
      type: Number,
      default: 5,
      min: 3,
      max: 20
    },
    lockoutDuration: {
      type: Number,
      default: 15,
      min: 1,
      max: 1440
    },
    enableIpBlocking: {
      type: Boolean,
      default: true
    },
    logSecurityEvents: {
      type: Boolean,
      default: true
    },
    enableDataEncryption: {
      type: Boolean,
      default: true
    },
    enableAuditLog: {
      type: Boolean,
      default: true
    },
    gdprCompliance: {
      type: Boolean,
      default: true
    },
    cookieConsent: {
      type: Boolean,
      default: true
    }
  },

  lastModifiedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

// Static method to get or create settings
marketplaceSettingsSchema.statics.getSettings = async function() {
  try {
    let settings = await this.findOne();
    if (!settings) {
      console.log('⚙️  [MarketplaceSettings] No settings found, creating with defaults...');
      // Create with default values by letting Mongoose apply defaults
      settings = new this({
        general: {},
        ratings: {},
        reviews: {},
        moderation: {},
        display: {},
        notifications: {},
        fees: {},
        security: {}
      });
      await settings.save();
      console.log('✅ [MarketplaceSettings] Default settings created successfully');
    }
    return settings;
  } catch (error) {
    console.error('❌ [MarketplaceSettings] Error in getSettings:', error);
    throw error;
  }
};

// Static method to update settings
marketplaceSettingsSchema.statics.updateSettings = async function(newSettings, userId) {
  let settings = await this.findOne();
  if (!settings) {
    settings = new this(newSettings);
  } else {
    Object.assign(settings, newSettings);
  }
  settings.lastModifiedBy = userId;
  await settings.save();
  return settings;
};

module.exports = mongoose.model('MarketplaceSettings', marketplaceSettingsSchema);

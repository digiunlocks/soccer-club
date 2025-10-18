const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  simpleId: {
    type: String,
    unique: true,
    sparse: true
  },
  username: { 
    type: String, 
    required: true, 
    unique: true,
    trim: true,
    minlength: 3,
    maxlength: 30
  },
  name: { 
    type: String, 
    required: true,
    trim: true
  },
  email: { 
    type: String, 
    required: true, 
    unique: true,
    trim: true,
    lowercase: true
  },
  phone: { 
    type: String, 
    required: true,
    trim: true
  },
  password: { 
    type: String, 
    required: true 
  },
  isSuperAdmin: { 
    type: Boolean, 
    default: false 
  },
  // Seller rating fields
  rating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5
  },
  ratingCount: {
    type: Number,
    default: 0
  },
  team: { 
    type: String, 
    default: '' 
  },
  coach: { 
    type: String, 
    default: '' 
  },
  program: { 
    type: String, 
    default: '' 
  },
  // Address information
  address: { 
    type: String, 
    default: '',
    trim: true
  },
  city: { 
    type: String, 
    default: '',
    trim: true
  },
  state: { 
    type: String, 
    default: '',
    trim: true
  },
  zipCode: { 
    type: String, 
    default: '',
    trim: true
  },
  country: { 
    type: String, 
    default: '',
    trim: true
  },
  // Privacy settings for contact information
  privacySettings: {
    showEmail: { type: Boolean, default: true },
    showPhone: { type: Boolean, default: true },
    showContactInMarketplace: { type: Boolean, default: true },
    showContactInMessages: { type: Boolean, default: true },
    showContactInProfile: { type: Boolean, default: true }
  },
  correctionEmails: [{
    sentAt: { type: Date, default: Date.now },
    reason: { type: String, required: true },
    email: { type: String, required: true }
  }],
  // Password reset history for admin tracking
  passwordResets: [{
    resetBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    resetByUsername: { type: String, required: true },
    resetAt: { type: Date, default: Date.now },
    reason: { type: String, required: true },
    newPasswordLength: { type: Number, required: true }
  }],
  // Self-service password reset fields
  resetPasswordToken: { type: String },
  resetPasswordExpires: { type: Date }
}, { timestamps: true });

// Method to get masked contact info based on privacy settings
userSchema.methods.getMaskedContactInfo = function(context = 'general') {
  const contact = {};
  
  // Check privacy settings based on context
  let showEmail = this.privacySettings.showEmail;
  let showPhone = this.privacySettings.showPhone;
  
  if (context === 'marketplace' && !this.privacySettings.showContactInMarketplace) {
    showEmail = false;
    showPhone = false;
  } else if (context === 'messages' && !this.privacySettings.showContactInMessages) {
    showEmail = false;
    showPhone = false;
  } else if (context === 'profile' && !this.privacySettings.showContactInProfile) {
    showEmail = false;
    showPhone = false;
  }
  
  if (showEmail && this.email) {
    contact.email = this.email;
  }
  
  if (showPhone && this.phone) {
    contact.phone = this.phone;
  }
  
  return contact;
};

// Method to get public profile info (for other users to see)
userSchema.methods.getPublicProfile = function() {
  return {
    _id: this._id,
    username: this.username,
    name: this.name,
    team: this.team,
    coach: this.coach,
    program: this.program,
    contact: this.getMaskedContactInfo('profile'),
    memberSince: this.createdAt
  };
};

module.exports = mongoose.model('User', userSchema); 
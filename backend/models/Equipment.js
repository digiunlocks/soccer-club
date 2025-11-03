const mongoose = require('mongoose');

const maintenanceRecordSchema = new mongoose.Schema({
  date: {
    type: Date,
    required: true
  },
  type: {
    type: String,
    enum: ['routine', 'repair', 'inspection', 'cleaning'],
    required: true
  },
  description: {
    type: String,
    required: true,
    trim: true
  },
  cost: {
    type: Number,
    default: 0,
    min: 0
  },
  performedBy: {
    type: String,
    trim: true
  },
  nextMaintenanceDate: {
    type: Date
  },
  notes: {
    type: String,
    trim: true
  }
});

const rentalRecordSchema = new mongoose.Schema({
  renterName: {
    type: String,
    required: true,
    trim: true
  },
  renterEmail: {
    type: String,
    required: true,
    trim: true,
    lowercase: true
  },
  renterPhone: {
    type: String,
    trim: true
  },
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date,
    required: true
  },
  dailyRate: {
    type: Number,
    required: true,
    min: 0
  },
  totalAmount: {
    type: Number,
    required: true,
    min: 0
  },
  status: {
    type: String,
    enum: ['active', 'completed', 'overdue', 'cancelled'],
    default: 'active'
  },
  deposit: {
    type: Number,
    default: 0,
    min: 0
  },
  notes: {
    type: String,
    trim: true
  }
});

const equipmentSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  category: {
    type: String,
    required: true,
    enum: ['balls', 'goals', 'cones', 'uniforms', 'goalkeeper', 'training', 'medical', 'safety', 'field', 'technology', 'storage', 'other']
  },
  description: {
    type: String,
    trim: true
  },
  quantity: {
    type: Number,
    required: true,
    min: 0
  },
  unitPrice: {
    type: Number,
    required: true,
    min: 0
  },
  totalValue: {
    type: Number,
    required: true,
    min: 0
  },
  condition: {
    type: String,
    enum: ['excellent', 'good', 'fair', 'poor', 'damaged', 'retired'],
    default: 'excellent'
  },
  location: {
    type: String,
    required: true,
    enum: ['main_facility', 'storage_room', 'equipment_shed', 'field_1', 'field_2', 'field_3', 'office', 'locker_room', 'other']
  },
  status: {
    type: String,
    enum: ['available', 'in_use', 'rented', 'maintenance', 'repair', 'lost', 'retired'],
    default: 'available'
  },
  purchaseDate: {
    type: Date,
    required: true
  },
  supplier: {
    type: String,
    trim: true
  },
  serialNumber: {
    type: String,
    trim: true,
    sparse: true // Allows multiple null values but enforces uniqueness for non-null values
  },
  model: {
    type: String,
    trim: true
  },
  size: {
    type: String,
    trim: true
  },
  color: {
    type: String,
    trim: true
  },
  brand: {
    type: String,
    trim: true
  },
  maintenanceSchedule: {
    type: String,
    enum: ['none', 'weekly', 'monthly', 'quarterly', 'annually'],
    default: 'none'
  },
  lastMaintenance: {
    type: Date
  },
  nextMaintenance: {
    type: Date
  },
  maintenanceRecords: [maintenanceRecordSchema],
  assignedTo: {
    type: String,
    trim: true
  },
  notes: {
    type: String,
    trim: true
  },
  warrantyExpiry: {
    type: Date
  },
  isRentable: {
    type: Boolean,
    default: false
  },
  rentalRate: {
    type: Number,
    default: 0,
    min: 0
  },
  rentalRecords: [rentalRecordSchema],
  images: [{
    url: String,
    caption: String,
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }],
  tags: [{
    type: String,
    trim: true
  }],
  lowStockThreshold: {
    type: Number,
    default: 5,
    min: 0
  },
  isLowStock: {
    type: Boolean,
    default: false
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

// Indexes for better query performance
equipmentSchema.index({ name: 1 });
equipmentSchema.index({ category: 1 });
equipmentSchema.index({ status: 1 });
equipmentSchema.index({ location: 1 });
equipmentSchema.index({ condition: 1 });
equipmentSchema.index({ isRentable: 1 });
equipmentSchema.index({ createdBy: 1 });

// Virtual for checking if equipment needs maintenance
equipmentSchema.virtual('needsMaintenance').get(function() {
  if (!this.nextMaintenance) return false;
  return new Date() >= this.nextMaintenance;
});

// Virtual for checking if equipment is overdue for return
equipmentSchema.virtual('isOverdue').get(function() {
  if (this.status !== 'rented') return false;
  const activeRental = this.rentalRecords.find(rental => rental.status === 'active');
  if (!activeRental) return false;
  return new Date() > activeRental.endDate;
});

// Pre-save middleware to calculate total value and check low stock
equipmentSchema.pre('save', function(next) {
  this.totalValue = this.quantity * this.unitPrice;
  this.isLowStock = this.quantity <= this.lowStockThreshold;
  
  // Auto-update status based on quantity
  if (this.quantity === 0 && this.status === 'available') {
    this.status = 'retired';
  }
  
  next();
});

// Static method to get equipment statistics
equipmentSchema.statics.getStatistics = async function(userId) {
  const stats = await this.aggregate([
    { $match: { createdBy: userId } },
    {
      $group: {
        _id: null,
        totalItems: { $sum: 1 },
        totalValue: { $sum: '$totalValue' },
        totalQuantity: { $sum: '$quantity' },
        lowStockCount: { $sum: { $cond: ['$isLowStock', 1, 0] } },
        needsMaintenanceCount: {
          $sum: {
            $cond: [
              { $and: [{ $ne: ['$nextMaintenance', null] }, { $lte: ['$nextMaintenance', new Date()] }] },
              1,
              0
            ]
          }
        }
      }
    }
  ]);

  const categoryStats = await this.aggregate([
    { $match: { createdBy: userId } },
    {
      $group: {
        _id: '$category',
        count: { $sum: 1 },
        totalValue: { $sum: '$totalValue' },
        totalQuantity: { $sum: '$quantity' }
      }
    },
    { $sort: { count: -1 } }
  ]);

  const statusStats = await this.aggregate([
    { $match: { createdBy: userId } },
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 }
      }
    }
  ]);

  return {
    overview: stats[0] || {
      totalItems: 0,
      totalValue: 0,
      totalQuantity: 0,
      lowStockCount: 0,
      needsMaintenanceCount: 0
    },
    byCategory: categoryStats,
    byStatus: statusStats
  };
};

// Instance method to add maintenance record
equipmentSchema.methods.addMaintenanceRecord = function(recordData) {
  this.maintenanceRecords.push(recordData);
  this.lastMaintenance = recordData.date;
  
  // Calculate next maintenance date based on schedule
  if (this.maintenanceSchedule !== 'none') {
    const nextDate = new Date(recordData.date);
    switch (this.maintenanceSchedule) {
      case 'weekly':
        nextDate.setDate(nextDate.getDate() + 7);
        break;
      case 'monthly':
        nextDate.setMonth(nextDate.getMonth() + 1);
        break;
      case 'quarterly':
        nextDate.setMonth(nextDate.getMonth() + 3);
        break;
      case 'annually':
        nextDate.setFullYear(nextDate.getFullYear() + 1);
        break;
    }
    this.nextMaintenance = nextDate;
  }
  
  return this.save();
};

// Instance method to rent equipment
equipmentSchema.methods.rentEquipment = function(rentalData) {
  if (this.status !== 'available' || this.quantity < 1) {
    throw new Error('Equipment not available for rental');
  }
  
  this.rentalRecords.push({
    ...rentalData,
    status: 'active'
  });
  
  this.quantity -= 1;
  if (this.quantity === 0) {
    this.status = 'rented';
  }
  
  return this.save();
};

// Instance method to return equipment
equipmentSchema.methods.returnEquipment = function(rentalId) {
  const rental = this.rentalRecords.id(rentalId);
  if (!rental || rental.status !== 'active') {
    throw new Error('Active rental not found');
  }
  
  rental.status = 'completed';
  this.quantity += 1;
  this.status = 'available';
  
  return this.save();
};

module.exports = mongoose.model('Equipment', equipmentSchema);

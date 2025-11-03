const express = require('express');
const Equipment = require('../models/Equipment');
const auth = require('../middleware/auth');
const router = express.Router();

// GET /api/equipment - Get all equipment with filtering and pagination
router.get('/', auth, async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search = '',
      category = '',
      status = '',
      location = '',
      condition = '',
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    // Build filter object
    const filter = { createdBy: req.user._id };
    
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { model: { $regex: search, $options: 'i' } },
        { brand: { $regex: search, $options: 'i' } },
        { serialNumber: { $regex: search, $options: 'i' } }
      ];
    }
    
    if (category) filter.category = category;
    if (status) filter.status = status;
    if (location) filter.location = location;
    if (condition) filter.condition = condition;

    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    // Execute query with pagination
    const equipment = await Equipment.find(filter)
      .sort(sort)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .populate('createdBy', 'username name email')
      .populate('updatedBy', 'username name email');

    const total = await Equipment.countDocuments(filter);

    res.json({
      equipment,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    console.error('Get equipment error:', error);
    res.status(500).json({ error: 'Failed to fetch equipment' });
  }
});

// GET /api/equipment/stats - Get equipment statistics
router.get('/stats', auth, async (req, res) => {
  try {
    const stats = await Equipment.getStatistics(req.user._id);
    res.json(stats);
  } catch (error) {
    console.error('Get equipment stats error:', error);
    res.status(500).json({ error: 'Failed to fetch equipment statistics' });
  }
});

// GET /api/equipment/:id - Get specific equipment
router.get('/:id', auth, async (req, res) => {
  try {
    const equipment = await Equipment.findOne({
      _id: req.params.id,
      createdBy: req.user._id
    }).populate('createdBy', 'username name email');

    if (!equipment) {
      return res.status(404).json({ error: 'Equipment not found' });
    }

    res.json(equipment);
  } catch (error) {
    console.error('Get equipment error:', error);
    res.status(500).json({ error: 'Failed to fetch equipment' });
  }
});

// POST /api/equipment - Create new equipment
router.post('/', auth, async (req, res) => {
  try {
    const equipmentData = {
      ...req.body,
      createdBy: req.user._id
    };

    const equipment = new Equipment(equipmentData);
    await equipment.save();

    res.status(201).json(equipment);
  } catch (error) {
    console.error('Create equipment error:', error);
    res.status(500).json({ error: 'Failed to create equipment' });
  }
});

// PUT /api/equipment/:id - Update equipment
router.put('/:id', auth, async (req, res) => {
  try {
    const equipment = await Equipment.findOne({
      _id: req.params.id,
      createdBy: req.user._id
    });

    if (!equipment) {
      return res.status(404).json({ error: 'Equipment not found' });
    }

    const updateData = {
      ...req.body,
      updatedBy: req.user._id
    };

    const updatedEquipment = await Equipment.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );

    res.json(updatedEquipment);
  } catch (error) {
    console.error('Update equipment error:', error);
    res.status(500).json({ error: 'Failed to update equipment' });
  }
});

// POST /api/equipment/:id/maintenance - Add maintenance record
router.post('/:id/maintenance', auth, async (req, res) => {
  try {
    const equipment = await Equipment.findOne({
      _id: req.params.id,
      createdBy: req.user._id
    });

    if (!equipment) {
      return res.status(404).json({ error: 'Equipment not found' });
    }

    await equipment.addMaintenanceRecord(req.body);
    
    res.json({ message: 'Maintenance record added successfully', equipment });
  } catch (error) {
    console.error('Add maintenance error:', error);
    res.status(500).json({ error: 'Failed to add maintenance record' });
  }
});

// POST /api/equipment/:id/rent - Rent equipment
router.post('/:id/rent', auth, async (req, res) => {
  try {
    const equipment = await Equipment.findOne({
      _id: req.params.id,
      createdBy: req.user._id
    });

    if (!equipment) {
      return res.status(404).json({ error: 'Equipment not found' });
    }

    await equipment.rentEquipment(req.body);
    
    res.json({ message: 'Equipment rented successfully', equipment });
  } catch (error) {
    console.error('Rent equipment error:', error);
    res.status(400).json({ error: error.message || 'Failed to rent equipment' });
  }
});

// POST /api/equipment/:id/return - Return equipment
router.post('/:id/return', auth, async (req, res) => {
  try {
    const { rentalId } = req.body;
    
    const equipment = await Equipment.findOne({
      _id: req.params.id,
      createdBy: req.user._id
    });

    if (!equipment) {
      return res.status(404).json({ error: 'Equipment not found' });
    }

    await equipment.returnEquipment(rentalId);
    
    res.json({ message: 'Equipment returned successfully', equipment });
  } catch (error) {
    console.error('Return equipment error:', error);
    res.status(400).json({ error: error.message || 'Failed to return equipment' });
  }
});

// GET /api/equipment/rentals/active - Get active rentals
router.get('/rentals/active', auth, async (req, res) => {
  try {
    const equipment = await Equipment.find({
      createdBy: req.user._id,
      'rentalRecords.status': 'active'
    }).select('name category rentalRecords');

    const activeRentals = [];
    equipment.forEach(item => {
      item.rentalRecords.forEach(rental => {
        if (rental.status === 'active') {
          activeRentals.push({
            equipmentId: item._id,
            equipmentName: item.name,
            equipmentCategory: item.category,
            ...rental.toObject()
          });
        }
      });
    });

    res.json(activeRentals);
  } catch (error) {
    console.error('Get active rentals error:', error);
    res.status(500).json({ error: 'Failed to fetch active rentals' });
  }
});

// GET /api/equipment/maintenance/due - Get equipment due for maintenance
router.get('/maintenance/due', auth, async (req, res) => {
  try {
    const equipment = await Equipment.find({
      createdBy: req.user._id,
      nextMaintenance: { $lte: new Date() },
      status: { $ne: 'retired' }
    }).sort({ nextMaintenance: 1 });

    res.json(equipment);
  } catch (error) {
    console.error('Get maintenance due error:', error);
    res.status(500).json({ error: 'Failed to fetch equipment due for maintenance' });
  }
});

// GET /api/equipment/low-stock - Get low stock equipment
router.get('/low-stock', auth, async (req, res) => {
  try {
    const equipment = await Equipment.find({
      createdBy: req.user._id,
      isLowStock: true,
      status: { $ne: 'retired' }
    }).sort({ quantity: 1 });

    res.json(equipment);
  } catch (error) {
    console.error('Get low stock error:', error);
    res.status(500).json({ error: 'Failed to fetch low stock equipment' });
  }
});

// DELETE /api/equipment/:id - Delete equipment
router.delete('/:id', auth, async (req, res) => {
  try {
    const equipment = await Equipment.findOne({
      _id: req.params.id,
      createdBy: req.user._id
    });

    if (!equipment) {
      return res.status(404).json({ error: 'Equipment not found' });
    }

    // Don't allow deletion of equipment with active rentals
    const hasActiveRentals = equipment.rentalRecords.some(rental => rental.status === 'active');
    if (hasActiveRentals) {
      return res.status(400).json({ error: 'Cannot delete equipment with active rentals' });
    }

    await Equipment.findByIdAndDelete(req.params.id);
    
    res.json({ message: 'Equipment deleted successfully' });
  } catch (error) {
    console.error('Delete equipment error:', error);
    res.status(500).json({ error: 'Failed to delete equipment' });
  }
});

// GET /api/equipment/export/csv - Export equipment to CSV
router.get('/export/csv', auth, async (req, res) => {
  try {
    const { category, status, location, condition } = req.query;
    
    const filter = { createdBy: req.user._id };
    if (category) filter.category = category;
    if (status) filter.status = status;
    if (location) filter.location = location;
    if (condition) filter.condition = condition;

    const equipment = await Equipment.find(filter).sort({ createdAt: -1 });
    
    // Generate CSV
    const csvHeader = 'Name,Category,Quantity,Unit Price,Total Value,Condition,Status,Location,Purchase Date,Supplier,Serial Number,Model,Brand,Is Rentable,Rental Rate,Notes\n';
    const csvRows = equipment.map(item => 
      `"${item.name}","${item.category}","${item.quantity}","${item.unitPrice}","${item.totalValue}","${item.condition}","${item.status}","${item.location}","${item.purchaseDate.toISOString().split('T')[0]}","${item.supplier || ''}","${item.serialNumber || ''}","${item.model || ''}","${item.brand || ''}","${item.isRentable}","${item.rentalRate}","${item.notes || ''}"`
    ).join('\n');
    
    const csv = csvHeader + csvRows;
    
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=equipment.csv');
    res.send(csv);
  } catch (error) {
    console.error('Export equipment error:', error);
    res.status(500).json({ error: 'Failed to export equipment' });
  }
});

module.exports = router;

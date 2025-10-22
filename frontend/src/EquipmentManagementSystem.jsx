import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const EquipmentManagementSystem = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [equipment, setEquipment] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('add');
  const [selectedItem, setSelectedItem] = useState(null);
  const [filter, setFilter] = useState({
    search: '',
    category: 'all',
    status: 'all',
    location: 'all'
  });

  const [equipmentForm, setEquipmentForm] = useState({
    name: '',
    category: 'balls',
    description: '',
    quantity: 1,
    unitPrice: 0,
    totalValue: 0,
    condition: 'excellent',
    location: 'main_facility',
    purchaseDate: new Date().toISOString().split('T')[0],
    supplier: '',
    serialNumber: '',
    model: '',
    size: '',
    color: '',
    status: 'available',
    maintenanceSchedule: 'none',
    lastMaintenance: '',
    nextMaintenance: '',
    assignedTo: '',
    notes: '',
    warrantyExpiry: '',
    rentalRate: 0,
    isRentable: false
  });

  const tabs = [
    { id: 'overview', name: 'Overview', icon: '📊' },
    { id: 'inventory', name: 'Inventory', icon: '📦' },
    { id: 'purchases', name: 'Purchases', icon: '🛒' },
    { id: 'rentals', name: 'Rentals', icon: '🔄' },
    { id: 'maintenance', name: 'Maintenance', icon: '🔧' },
    { id: 'reports', name: 'Reports', icon: '📈' }
  ];

  const categories = [
    { id: 'balls', name: 'Soccer Balls', icon: '⚽', color: 'blue' },
    { id: 'goals', name: 'Goals & Nets', icon: '🥅', color: 'green' },
    { id: 'cones', name: 'Training Cones', icon: '🔶', color: 'orange' },
    { id: 'uniforms', name: 'Uniforms', icon: '👕', color: 'purple' },
    { id: 'goalkeeper', name: 'Goalkeeper Gear', icon: '🧤', color: 'yellow' },
    { id: 'training', name: 'Training Equipment', icon: '🏋️', color: 'teal' },
    { id: 'medical', name: 'Medical Supplies', icon: '🏥', color: 'red' },
    { id: 'safety', name: 'Safety Equipment', icon: '🦺', color: 'orange' },
    { id: 'field', name: 'Field Equipment', icon: '🏟️', color: 'green' },
    { id: 'tech', name: 'Technology', icon: '💻', color: 'indigo' },
    { id: 'storage', name: 'Storage & Transport', icon: '🎒', color: 'gray' },
    { id: 'other', name: 'Other', icon: '📦', color: 'slate' }
  ];

  const conditions = [
    { id: 'excellent', name: 'Excellent', icon: '⭐', color: 'green' },
    { id: 'good', name: 'Good', icon: '👍', color: 'blue' },
    { id: 'fair', name: 'Fair', icon: '👌', color: 'yellow' },
    { id: 'poor', name: 'Poor', icon: '👎', color: 'orange' },
    { id: 'damaged', name: 'Damaged', icon: '🔧', color: 'red' },
    { id: 'retired', name: 'Retired', icon: '🚫', color: 'gray' }
  ];

  const statuses = [
    { id: 'available', name: 'Available', icon: '✅', color: 'green' },
    { id: 'in_use', name: 'In Use', icon: '🔄', color: 'blue' },
    { id: 'rented', name: 'Rented Out', icon: '📤', color: 'purple' },
    { id: 'maintenance', name: 'Under Maintenance', icon: '🔧', color: 'orange' },
    { id: 'repair', name: 'Needs Repair', icon: '⚠️', color: 'red' },
    { id: 'lost', name: 'Lost/Missing', icon: '❓', color: 'red' },
    { id: 'retired', name: 'Retired', icon: '🚫', color: 'gray' }
  ];

  const locations = [
    { id: 'main_facility', name: 'Main Facility' },
    { id: 'storage_room', name: 'Storage Room' },
    { id: 'equipment_shed', name: 'Equipment Shed' },
    { id: 'field_1', name: 'Field 1' },
    { id: 'field_2', name: 'Field 2' },
    { id: 'training_center', name: 'Training Center' },
    { id: 'office', name: 'Club Office' },
    { id: 'rented_out', name: 'Rented Out' },
    { id: 'off_site', name: 'Off-Site' }
  ];

  const maintenanceSchedules = [
    { id: 'none', name: 'No Schedule' },
    { id: 'weekly', name: 'Weekly' },
    { id: 'monthly', name: 'Monthly' },
    { id: 'quarterly', name: 'Quarterly' },
    { id: 'annually', name: 'Annually' },
    { id: 'as_needed', name: 'As Needed' }
  ];

  useEffect(() => {
    document.title = 'Equipment Management - Seattle Leopards FC Admin';
    loadEquipment();
  }, []);

  useEffect(() => {
    calculateTotalValue();
  }, [equipmentForm.quantity, equipmentForm.unitPrice]);

  const loadEquipment = () => {
    // Mock data - replace with actual API call
    const mockEquipment = [
      {
        _id: '1',
        name: 'Official Match Soccer Ball',
        category: 'balls',
        quantity: 25,
        unitPrice: 45.00,
        totalValue: 1125.00,
        condition: 'excellent',
        location: 'storage_room',
        status: 'available',
        purchaseDate: '2024-09-15',
        supplier: 'Nike Sports Equipment',
        isRentable: true,
        rentalRate: 5.00
      },
      {
        _id: '2',
        name: 'Training Cones (Set of 50)',
        category: 'cones',
        quantity: 3,
        unitPrice: 35.00,
        totalValue: 105.00,
        condition: 'good',
        location: 'equipment_shed',
        status: 'available',
        purchaseDate: '2024-08-20',
        supplier: 'Pro Training Supplies'
      },
      {
        _id: '3',
        name: 'Team Uniform Kit - Home',
        category: 'uniforms',
        quantity: 20,
        unitPrice: 65.00,
        totalValue: 1300.00,
        condition: 'excellent',
        location: 'main_facility',
        status: 'in_use',
        purchaseDate: '2025-01-10',
        supplier: 'Adidas Team Gear',
        size: 'Various'
      },
      {
        _id: '4',
        name: 'Goalkeeper Gloves',
        category: 'goalkeeper',
        quantity: 8,
        unitPrice: 55.00,
        totalValue: 440.00,
        condition: 'good',
        location: 'storage_room',
        status: 'available',
        purchaseDate: '2024-11-05',
        supplier: 'Goalkeeper Pro'
      },
      {
        _id: '5',
        name: 'Portable Goal (8x6 ft)',
        category: 'goals',
        quantity: 4,
        unitPrice: 350.00,
        totalValue: 1400.00,
        condition: 'good',
        location: 'field_1',
        status: 'in_use',
        purchaseDate: '2024-07-15',
        supplier: 'Field Equipment Inc.'
      }
    ];
    setEquipment(mockEquipment);
  };

  const calculateTotalValue = () => {
    const total = (parseFloat(equipmentForm.quantity) || 0) * (parseFloat(equipmentForm.unitPrice) || 0);
    setEquipmentForm(prev => ({ ...prev, totalValue: total.toFixed(2) }));
  };

  const saveEquipment = () => {
    if (!equipmentForm.name || !equipmentForm.category) {
      setMessage('Please fill in equipment name and category');
      setTimeout(() => setMessage(''), 3000);
      return;
    }

    setMessage('Equipment saved successfully!');
    setShowModal(false);
    resetForm();
    setTimeout(() => setMessage(''), 3000);
    loadEquipment();
  };

  const resetForm = () => {
    setEquipmentForm({
      name: '',
      category: 'balls',
      description: '',
      quantity: 1,
      unitPrice: 0,
      totalValue: 0,
      condition: 'excellent',
      location: 'main_facility',
      purchaseDate: new Date().toISOString().split('T')[0],
      supplier: '',
      serialNumber: '',
      model: '',
      size: '',
      color: '',
      status: 'available',
      maintenanceSchedule: 'none',
      lastMaintenance: '',
      nextMaintenance: '',
      assignedTo: '',
      notes: '',
      warrantyExpiry: '',
      rentalRate: 0,
      isRentable: false
    });
  };

  const getFilteredEquipment = () => {
    let filtered = [...equipment];

    if (filter.search) {
      filtered = filtered.filter(item =>
        item.name?.toLowerCase().includes(filter.search.toLowerCase()) ||
        item.supplier?.toLowerCase().includes(filter.search.toLowerCase()) ||
        item.description?.toLowerCase().includes(filter.search.toLowerCase())
      );
    }

    if (filter.category !== 'all') filtered = filtered.filter(item => item.category === filter.category);
    if (filter.status !== 'all') filtered = filtered.filter(item => item.status === filter.status);
    if (filter.location !== 'all') filtered = filtered.filter(item => item.location === filter.location);

    return filtered;
  };

  const filteredEquipment = getFilteredEquipment();

  const stats = {
    totalItems: equipment.reduce((sum, item) => sum + parseInt(item.quantity), 0),
    totalValue: equipment.reduce((sum, item) => sum + parseFloat(item.totalValue), 0),
    categories: categories.length,
    available: equipment.filter(item => item.status === 'available').reduce((sum, item) => sum + parseInt(item.quantity), 0),
    inUse: equipment.filter(item => item.status === 'in_use').reduce((sum, item) => sum + parseInt(item.quantity), 0),
    maintenance: equipment.filter(item => item.status === 'maintenance' || item.status === 'repair').length,
    rented: equipment.filter(item => item.status === 'rented').reduce((sum, item) => sum + parseInt(item.quantity), 0),
    byCategory: categories.map(cat => ({
      ...cat,
      count: equipment.filter(item => item.category === cat.id).reduce((sum, item) => sum + parseInt(item.quantity), 0),
      value: equipment.filter(item => item.category === cat.id).reduce((sum, item) => sum + parseFloat(item.totalValue), 0)
    })).filter(cat => cat.count > 0),
    lowStock: equipment.filter(item => parseInt(item.quantity) < 5).length,
    needsMaintenance: equipment.filter(item => item.status === 'maintenance' || item.status === 'repair').length
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(amount || 0);
  };

  const exportEquipment = () => {
    const csv = [
      ['Name', 'Category', 'Quantity', 'Unit Price', 'Total Value', 'Condition', 'Status', 'Location', 'Purchase Date', 'Supplier'],
      ...filteredEquipment.map(item => [
        item.name,
        categories.find(c => c.id === item.category)?.name || item.category,
        item.quantity,
        item.unitPrice,
        item.totalValue,
        item.condition,
        item.status,
        locations.find(l => l.id === item.location)?.name || item.location,
        item.purchaseDate,
        item.supplier || ''
      ])
    ];

    const csvContent = csv.map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `equipment-inventory-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Equipment Management</h1>
              <p className="mt-1 text-sm text-gray-500">
                Track, manage, and maintain all club equipment inventory
              </p>
            </div>
            <div className="flex space-x-3">
              <Link
                to="/admin"
                className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors"
              >
                ← Back to Admin
              </Link>
              <button
                onClick={() => {
                  resetForm();
                  setModalType('add');
                  setShowModal(true);
                }}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                <i className="bi bi-plus-circle me-2"></i>Add Equipment
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Message */}
      {message && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-4">
          <div className={`p-4 rounded-lg ${message.includes('success') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
            {message}
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-sm border mb-6">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6" aria-label="Tabs">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <span className="mr-2">{tab.icon}</span>
                  {tab.name}
                  {tab.id === 'maintenance' && stats.needsMaintenance > 0 && (
                    <span className="ml-2 bg-orange-100 text-orange-800 px-2 py-0.5 rounded-full text-xs">
                      {stats.needsMaintenance}
                    </span>
                  )}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Key Metrics */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-lg shadow-sm border border-blue-200">
                <div className="flex items-center justify-between mb-2">
                  <div className="text-4xl">📦</div>
                  <div className="text-blue-600"><i className="bi bi-box text-xl"></i></div>
                </div>
                <div className="text-3xl font-bold text-blue-900">{stats.totalItems}</div>
                <div className="text-sm text-blue-700 mt-1">Total Items</div>
              </div>

              <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-lg shadow-sm border border-green-200">
                <div className="flex items-center justify-between mb-2">
                  <div className="text-4xl">💰</div>
                  <div className="text-green-600"><i className="bi bi-currency-dollar text-xl"></i></div>
                </div>
                <div className="text-3xl font-bold text-green-900">{formatCurrency(stats.totalValue)}</div>
                <div className="text-sm text-green-700 mt-1">Total Value</div>
              </div>

              <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-lg shadow-sm border border-purple-200">
                <div className="flex items-center justify-between mb-2">
                  <div className="text-4xl">✅</div>
                  <div className="text-purple-600"><i className="bi bi-check-circle text-xl"></i></div>
                </div>
                <div className="text-3xl font-bold text-purple-900">{stats.available}</div>
                <div className="text-sm text-purple-700 mt-1">Available</div>
              </div>

              <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-6 rounded-lg shadow-sm border border-orange-200">
                <div className="flex items-center justify-between mb-2">
                  <div className="text-4xl">🔧</div>
                  <div className="text-orange-600"><i className="bi bi-tools text-xl"></i></div>
                </div>
                <div className="text-3xl font-bold text-orange-900">{stats.maintenance}</div>
                <div className="text-sm text-orange-700 mt-1">Maintenance</div>
              </div>
            </div>

            {/* Status Breakdown */}
            <div className="grid grid-cols-4 gap-4">
              <div className="bg-white p-6 rounded-lg shadow-sm border">
                <div className="text-2xl font-bold text-blue-900">{stats.inUse}</div>
                <div className="text-sm text-blue-700 mt-1">In Use</div>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-sm border">
                <div className="text-2xl font-bold text-purple-900">{stats.rented}</div>
                <div className="text-sm text-purple-700 mt-1">Rented Out</div>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-sm border">
                <div className="text-2xl font-bold text-red-900">{stats.lowStock}</div>
                <div className="text-sm text-red-700 mt-1">Low Stock Items</div>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-sm border">
                <div className="text-2xl font-bold text-teal-900">{stats.categories}</div>
                <div className="text-sm text-teal-700 mt-1">Categories</div>
              </div>
            </div>

            {/* Equipment by Category */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Equipment by Category</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {stats.byCategory.map((cat) => (
                  <div key={cat.id} className={`bg-${cat.color}-50 p-4 rounded-lg border border-${cat.color}-200`}>
                    <div className="text-3xl mb-2 text-center">{cat.icon}</div>
                    <div className="font-semibold text-gray-900 text-sm text-center">{cat.name}</div>
                    <div className="text-lg font-bold text-center text-gray-900 mt-2">{cat.count}</div>
                    <div className="text-xs text-gray-600 text-center mt-1">{formatCurrency(cat.value)}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* What is Equipment Management */}
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">📦 What is Equipment Management?</h2>
              <p className="text-gray-700 mb-4">
                Equipment Management is your complete solution for tracking, managing, and maintaining all club assets. 
                From soccer balls and training cones to uniforms and medical supplies, keep detailed records of purchases, 
                location, condition, maintenance schedules, and rental activities.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white p-4 rounded-lg border">
                  <h3 className="font-semibold text-gray-900 mb-2">📊 Inventory Tracking</h3>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Real-time quantity tracking</li>
                    <li>• 12+ equipment categories</li>
                    <li>• Location management</li>
                    <li>• Condition monitoring</li>
                    <li>• Purchase history</li>
                    <li>• Value tracking</li>
                  </ul>
                </div>
                <div className="bg-white p-4 rounded-lg border">
                  <h3 className="font-semibold text-gray-900 mb-2">🔧 Maintenance</h3>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Maintenance schedules</li>
                    <li>• Repair tracking</li>
                    <li>• Service history</li>
                    <li>• Warranty management</li>
                    <li>• Condition assessment</li>
                    <li>• Cost tracking</li>
                  </ul>
                </div>
                <div className="bg-white p-4 rounded-lg border">
                  <h3 className="font-semibold text-gray-900 mb-2">💼 Rentals & Reports</h3>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Equipment rentals</li>
                    <li>• Rental rate management</li>
                    <li>• Usage tracking</li>
                    <li>• Financial reports</li>
                    <li>• CSV export</li>
                    <li>• Audit trails</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Inventory Tab */}
        {activeTab === 'inventory' && (
          <div className="space-y-6">
            {/* Filters */}
            <div className="bg-white rounded-lg shadow-sm border p-4">
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-4">
                <input
                  type="text"
                  placeholder="Search equipment..."
                  value={filter.search}
                  onChange={(e) => setFilter(f => ({ ...f, search: e.target.value }))}
                  className="border rounded px-3 py-2"
                />
                <select
                  value={filter.category}
                  onChange={(e) => setFilter(f => ({ ...f, category: e.target.value }))}
                  className="border rounded px-3 py-2"
                >
                  <option value="all">All Categories</option>
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.icon} {cat.name}</option>
                  ))}
                </select>
                <select
                  value={filter.status}
                  onChange={(e) => setFilter(f => ({ ...f, status: e.target.value }))}
                  className="border rounded px-3 py-2"
                >
                  <option value="all">All Status</option>
                  {statuses.map(status => (
                    <option key={status.id} value={status.id}>{status.icon} {status.name}</option>
                  ))}
                </select>
                <select
                  value={filter.location}
                  onChange={(e) => setFilter(f => ({ ...f, location: e.target.value }))}
                  className="border rounded px-3 py-2"
                >
                  <option value="all">All Locations</option>
                  {locations.map(loc => (
                    <option key={loc.id} value={loc.id}>{loc.name}</option>
                  ))}
                </select>
                <button
                  onClick={exportEquipment}
                  className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
                >
                  <i className="bi bi-download me-2"></i>Export
                </button>
              </div>
              <div className="text-sm text-gray-600">
                Showing {filteredEquipment.length} of {equipment.length} items
              </div>
            </div>

            {/* Equipment Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredEquipment.length === 0 ? (
                <div className="col-span-3 text-center py-12">
                  <div className="text-6xl mb-4">📦</div>
                  <p className="text-lg font-semibold text-gray-900 mb-2">No equipment found</p>
                  <p className="text-sm text-gray-600">Add equipment to start tracking your inventory</p>
                </div>
              ) : (
                filteredEquipment.map((item) => {
                  const category = categories.find(c => c.id === item.category);
                  const statusOption = statuses.find(s => s.id === item.status);
                  const conditionOption = conditions.find(c => c.id === item.condition);
                  const location = locations.find(l => l.id === item.location);

                  return (
                    <div key={item._id} className="bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow">
                      <div className="p-6">
                        {/* Header */}
                        <div className="flex items-start justify-between mb-4">
                          <div className="text-4xl">{category?.icon}</div>
                          <div className="flex flex-col items-end gap-2">
                            <span className={`px-2 py-1 text-xs rounded-full bg-${statusOption?.color}-100 text-${statusOption?.color}-800`}>
                              {statusOption?.icon} {statusOption?.name}
                            </span>
                            {item.quantity < 5 && (
                              <span className="px-2 py-1 text-xs rounded-full bg-red-100 text-red-800">
                                Low Stock
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Details */}
                        <h3 className="font-bold text-gray-900 text-lg mb-2">{item.name}</h3>
                        <div className="space-y-2 text-sm mb-4">
                          <div className="flex justify-between">
                            <span className="text-gray-600">Category:</span>
                            <span className="font-semibold">{category?.name}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Quantity:</span>
                            <span className="font-semibold text-blue-600">{item.quantity}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Unit Price:</span>
                            <span className="font-semibold">{formatCurrency(item.unitPrice)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Total Value:</span>
                            <span className="font-semibold text-green-600">{formatCurrency(item.totalValue)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Condition:</span>
                            <span className={`px-2 py-0.5 text-xs rounded-full bg-${conditionOption?.color}-100 text-${conditionOption?.color}-800`}>
                              {conditionOption?.name}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Location:</span>
                            <span className="font-semibold text-xs">{location?.name}</span>
                          </div>
                          {item.isRentable && (
                            <div className="flex justify-between">
                              <span className="text-gray-600">Rental Rate:</span>
                              <span className="font-semibold text-purple-600">{formatCurrency(item.rentalRate)}/day</span>
                            </div>
                          )}
                        </div>

                        {/* Actions */}
                        <div className="flex gap-2 pt-4 border-t">
                          <button
                            onClick={() => {
                              setSelectedItem(item);
                              setModalType('view');
                              setShowModal(true);
                            }}
                            className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 text-sm"
                          >
                            <i className="bi bi-eye me-2"></i>View
                          </button>
                          <button
                            onClick={() => {
                              setEquipmentForm({...item});
                              setModalType('edit');
                              setShowModal(true);
                            }}
                            className="flex-1 bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 text-sm"
                          >
                            <i className="bi bi-pencil me-2"></i>Edit
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}

        {/* Purchases Tab */}
        {activeTab === 'purchases' && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Purchase History</h2>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Item</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Quantity</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Unit Price</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Supplier</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {equipment.map((item) => (
                      <tr key={item._id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 text-sm">
                          {item.purchaseDate ? new Date(item.purchaseDate).toLocaleDateString() : 'N/A'}
                        </td>
                        <td className="px-6 py-4 text-sm font-medium text-gray-900">{item.name}</td>
                        <td className="px-6 py-4 text-sm">{item.quantity}</td>
                        <td className="px-6 py-4 text-sm">{formatCurrency(item.unitPrice)}</td>
                        <td className="px-6 py-4 text-sm font-bold text-green-600">{formatCurrency(item.totalValue)}</td>
                        <td className="px-6 py-4 text-sm text-gray-600">{item.supplier || 'N/A'}</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="bg-gray-50">
                    <tr>
                      <td colSpan="4" className="px-6 py-4 text-sm font-bold text-gray-900 text-right">
                        Total Investment:
                      </td>
                      <td className="px-6 py-4 text-sm font-bold text-green-600">
                        {formatCurrency(stats.totalValue)}
                      </td>
                      <td></td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Rentals Tab */}
        {activeTab === 'rentals' && (
          <div className="space-y-6">
            <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg border p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-2">🔄 Equipment Rental System</h2>
              <p className="text-gray-700">
                Track equipment rentals, rates, and generate additional revenue by renting out unused equipment.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {equipment.filter(item => item.isRentable).map((item) => {
                const category = categories.find(c => c.id === item.category);
                
                return (
                  <div key={item._id} className="bg-white rounded-lg shadow-sm border p-6">
                    <div className="text-4xl mb-3 text-center">{category?.icon}</div>
                    <h3 className="font-bold text-gray-900 text-center mb-2">{item.name}</h3>
                    <div className="text-center mb-4">
                      <div className="text-2xl font-bold text-purple-600">{formatCurrency(item.rentalRate)}</div>
                      <div className="text-sm text-gray-600">per day</div>
                    </div>
                    <div className="text-sm text-center text-gray-600 mb-4">
                      {item.quantity} available
                    </div>
                    <button className="w-full bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700">
                      <i className="bi bi-calendar-check me-2"></i>Book Rental
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Maintenance Tab */}
        {activeTab === 'maintenance' && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Maintenance Schedule</h2>
              
              {/* Items Needing Maintenance */}
              {equipment.filter(item => item.status === 'maintenance' || item.status === 'repair').length > 0 ? (
                <div className="space-y-4">
                  {equipment.filter(item => item.status === 'maintenance' || item.status === 'repair').map((item) => {
                    const category = categories.find(c => c.id === item.category);
                    
                    return (
                      <div key={item._id} className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className="text-3xl">{category?.icon}</div>
                            <div>
                              <h3 className="font-bold text-gray-900">{item.name}</h3>
                              <p className="text-sm text-gray-600">
                                Status: {item.status === 'maintenance' ? 'Under Maintenance' : 'Needs Repair'}
                              </p>
                            </div>
                          </div>
                          <button className="bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700">
                            <i className="bi bi-tools me-2"></i>Update Status
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="text-6xl mb-4">✅</div>
                  <p className="text-lg font-semibold text-gray-900 mb-2">All equipment is in good condition</p>
                  <p className="text-sm text-gray-600">No items currently need maintenance or repair</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Reports Tab */}
        {activeTab === 'reports' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white rounded-lg shadow-sm border p-6">
                <h3 className="font-bold text-gray-900 mb-4">Equipment Value by Category</h3>
                <div className="space-y-3">
                  {stats.byCategory.map((cat) => {
                    const percentage = (cat.value / stats.totalValue) * 100;
                    
                    return (
                      <div key={cat.id}>
                        <div className="flex justify-between text-sm mb-1">
                          <span>{cat.icon} {cat.name}</span>
                          <span className="font-bold text-green-600">{formatCurrency(cat.value)}</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className={`bg-${cat.color}-600 h-2 rounded-full`}
                            style={{ width: `${percentage}%` }}
                          ></div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm border p-6">
                <h3 className="font-bold text-gray-900 mb-4">Quick Stats</h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center p-3 bg-blue-50 rounded">
                    <span className="text-sm text-gray-700">Average Item Value</span>
                    <span className="font-bold text-blue-600">
                      {formatCurrency(stats.totalValue / equipment.length || 0)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-green-50 rounded">
                    <span className="text-sm text-gray-700">Utilization Rate</span>
                    <span className="font-bold text-green-600">
                      {Math.round((stats.inUse / stats.totalItems) * 100)}%
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-purple-50 rounded">
                    <span className="text-sm text-gray-700">Available Capacity</span>
                    <span className="font-bold text-purple-600">
                      {Math.round((stats.available / stats.totalItems) * 100)}%
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-orange-50 rounded">
                    <span className="text-sm text-gray-700">Items Needing Attention</span>
                    <span className="font-bold text-orange-600">
                      {stats.maintenance + stats.lowStock}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Add/Edit Equipment Modal */}
        {showModal && (modalType === 'add' || modalType === 'edit') && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
            <div className="bg-white rounded-lg max-w-4xl w-full my-8 p-6">
              <div className="flex justify-between items-start mb-6">
                <h2 className="text-2xl font-bold text-gray-900">
                  {modalType === 'add' ? 'Add New Equipment' : 'Edit Equipment'}
                </h2>
                <button
                  onClick={() => {
                    setShowModal(false);
                    resetForm();
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <i className="bi bi-x-lg text-2xl"></i>
                </button>
              </div>

              <div className="space-y-6 max-h-[70vh] overflow-y-auto pr-2">
                {/* Basic Information */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h3 className="font-semibold text-blue-900 mb-3">Basic Information</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Equipment Name *</label>
                      <input
                        type="text"
                        value={equipmentForm.name}
                        onChange={(e) => setEquipmentForm(prev => ({ ...prev, name: e.target.value }))}
                        className="w-full border rounded-lg px-3 py-2"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Category *</label>
                      <select
                        value={equipmentForm.category}
                        onChange={(e) => setEquipmentForm(prev => ({ ...prev, category: e.target.value }))}
                        className="w-full border rounded-lg px-3 py-2"
                      >
                        {categories.map(cat => (
                          <option key={cat.id} value={cat.id}>{cat.icon} {cat.name}</option>
                        ))}
                      </select>
                    </div>
                    <div className="col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                      <textarea
                        rows={2}
                        value={equipmentForm.description}
                        onChange={(e) => setEquipmentForm(prev => ({ ...prev, description: e.target.value }))}
                        className="w-full border rounded-lg px-3 py-2"
                      />
                    </div>
                  </div>
                </div>

                {/* Quantity & Pricing */}
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <h3 className="font-semibold text-green-900 mb-3">Quantity & Pricing</h3>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Quantity *</label>
                      <input
                        type="number"
                        value={equipmentForm.quantity}
                        onChange={(e) => setEquipmentForm(prev => ({ ...prev, quantity: e.target.value }))}
                        className="w-full border rounded-lg px-3 py-2"
                        min="1"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Unit Price *</label>
                      <input
                        type="number"
                        value={equipmentForm.unitPrice}
                        onChange={(e) => setEquipmentForm(prev => ({ ...prev, unitPrice: e.target.value }))}
                        className="w-full border rounded-lg px-3 py-2"
                        min="0"
                        step="0.01"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Total Value</label>
                      <input
                        type="text"
                        value={formatCurrency(equipmentForm.totalValue)}
                        readOnly
                        className="w-full border rounded-lg px-3 py-2 bg-gray-50 font-semibold"
                      />
                    </div>
                  </div>
                </div>

                {/* Status & Location */}
                <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                  <h3 className="font-semibold text-purple-900 mb-3">Status & Location</h3>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                      <select
                        value={equipmentForm.status}
                        onChange={(e) => setEquipmentForm(prev => ({ ...prev, status: e.target.value }))}
                        className="w-full border rounded-lg px-3 py-2"
                      >
                        {statuses.map(status => (
                          <option key={status.id} value={status.id}>{status.icon} {status.name}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Condition</label>
                      <select
                        value={equipmentForm.condition}
                        onChange={(e) => setEquipmentForm(prev => ({ ...prev, condition: e.target.value }))}
                        className="w-full border rounded-lg px-3 py-2"
                      >
                        {conditions.map(cond => (
                          <option key={cond.id} value={cond.id}>{cond.icon} {cond.name}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                      <select
                        value={equipmentForm.location}
                        onChange={(e) => setEquipmentForm(prev => ({ ...prev, location: e.target.value }))}
                        className="w-full border rounded-lg px-3 py-2"
                      >
                        {locations.map(loc => (
                          <option key={loc.id} value={loc.id}>{loc.name}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                {/* Purchase Details */}
                <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                  <h3 className="font-semibold text-orange-900 mb-3">Purchase Details</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Purchase Date</label>
                      <input
                        type="date"
                        value={equipmentForm.purchaseDate}
                        onChange={(e) => setEquipmentForm(prev => ({ ...prev, purchaseDate: e.target.value }))}
                        className="w-full border rounded-lg px-3 py-2"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Supplier</label>
                      <input
                        type="text"
                        value={equipmentForm.supplier}
                        onChange={(e) => setEquipmentForm(prev => ({ ...prev, supplier: e.target.value }))}
                        className="w-full border rounded-lg px-3 py-2"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Model/Brand</label>
                      <input
                        type="text"
                        value={equipmentForm.model}
                        onChange={(e) => setEquipmentForm(prev => ({ ...prev, model: e.target.value }))}
                        className="w-full border rounded-lg px-3 py-2"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Serial Number</label>
                      <input
                        type="text"
                        value={equipmentForm.serialNumber}
                        onChange={(e) => setEquipmentForm(prev => ({ ...prev, serialNumber: e.target.value }))}
                        className="w-full border rounded-lg px-3 py-2"
                      />
                    </div>
                  </div>
                </div>

                {/* Rental Options */}
                <div className="bg-pink-50 border border-pink-200 rounded-lg p-4">
                  <h3 className="font-semibold text-pink-900 mb-3">Rental Options</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="col-span-2">
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={equipmentForm.isRentable}
                          onChange={(e) => setEquipmentForm(prev => ({ ...prev, isRentable: e.target.checked }))}
                          className="mr-2"
                        />
                        <span className="text-sm font-medium text-gray-700">Available for Rental</span>
                      </label>
                    </div>
                    {equipmentForm.isRentable && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Rental Rate (per day)</label>
                        <input
                          type="number"
                          value={equipmentForm.rentalRate}
                          onChange={(e) => setEquipmentForm(prev => ({ ...prev, rentalRate: e.target.value }))}
                          className="w-full border rounded-lg px-3 py-2"
                          min="0"
                          step="0.01"
                        />
                      </div>
                    )}
                  </div>
                </div>

                {/* Additional Notes */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                  <textarea
                    rows={3}
                    value={equipmentForm.notes}
                    onChange={(e) => setEquipmentForm(prev => ({ ...prev, notes: e.target.value }))}
                    className="w-full border rounded-lg px-3 py-2"
                    placeholder="Additional notes or information..."
                  />
                </div>
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-3 mt-6 pt-4 border-t">
                <button
                  onClick={() => {
                    setShowModal(false);
                    resetForm();
                  }}
                  className="bg-gray-100 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-200"
                >
                  Cancel
                </button>
                <button
                  onClick={saveEquipment}
                  disabled={loading}
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  {loading ? 'Saving...' : modalType === 'add' ? 'Add Equipment' : 'Update Equipment'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* View Equipment Modal */}
        {showModal && modalType === 'view' && selectedItem && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto p-8">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h2 className="text-3xl font-bold text-gray-900">{selectedItem.name}</h2>
                  <p className="text-gray-600 mt-1">{categories.find(c => c.id === selectedItem.category)?.name}</p>
                </div>
                <button
                  onClick={() => {
                    setShowModal(false);
                    setSelectedItem(null);
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <i className="bi bi-x-lg text-2xl"></i>
                </button>
              </div>

              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-6">
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <div className="text-sm text-gray-600 mb-1">Quantity</div>
                    <div className="text-3xl font-bold text-blue-600">{selectedItem.quantity}</div>
                  </div>
                  <div className="bg-green-50 p-4 rounded-lg">
                    <div className="text-sm text-gray-600 mb-1">Total Value</div>
                    <div className="text-3xl font-bold text-green-600">{formatCurrency(selectedItem.totalValue)}</div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-sm text-gray-600">Status:</span>
                    <div className="mt-1">
                      <span className={`px-3 py-1 text-sm rounded-full bg-${statuses.find(s => s.id === selectedItem.status)?.color}-100 text-${statuses.find(s => s.id === selectedItem.status)?.color}-800`}>
                        {statuses.find(s => s.id === selectedItem.status)?.name}
                      </span>
                    </div>
                  </div>
                  <div>
                    <span className="text-sm text-gray-600">Condition:</span>
                    <div className="mt-1">
                      <span className={`px-3 py-1 text-sm rounded-full bg-${conditions.find(c => c.id === selectedItem.condition)?.color}-100 text-${conditions.find(c => c.id === selectedItem.condition)?.color}-800`}>
                        {conditions.find(c => c.id === selectedItem.condition)?.name}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Unit Price:</span>
                    <span className="font-semibold">{formatCurrency(selectedItem.unitPrice)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Location:</span>
                    <span className="font-semibold">{locations.find(l => l.id === selectedItem.location)?.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Purchase Date:</span>
                    <span className="font-semibold">
                      {selectedItem.purchaseDate ? new Date(selectedItem.purchaseDate).toLocaleDateString() : 'N/A'}
                    </span>
                  </div>
                  {selectedItem.supplier && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Supplier:</span>
                      <span className="font-semibold">{selectedItem.supplier}</span>
                    </div>
                  )}
                  {selectedItem.isRentable && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Rental Rate:</span>
                      <span className="font-semibold text-purple-600">{formatCurrency(selectedItem.rentalRate)}/day</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EquipmentManagementSystem;


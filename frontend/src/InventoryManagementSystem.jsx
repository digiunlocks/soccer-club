import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const InventoryManagementSystem = () => {
  const [activeTab, setActiveTab] = useState('inventory');
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
  const [stats, setStats] = useState({
    totalItems: 0,
    totalValue: 0,
    categories: 0,
    available: 0,
    inUse: 0,
    maintenance: 0,
    rented: 0,
    lowStock: 0,
    needsMaintenance: 0
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
    { id: 'inventory', name: 'Inventory', icon: '📦' },
    { id: 'overview', name: 'Overview', icon: '📊' },
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
    document.title = 'Inventory Management - Seattle Leopards FC Admin';
    loadEquipment();
  }, []);

  useEffect(() => {
    calculateTotalValue();
  }, [equipmentForm.quantity, equipmentForm.unitPrice]);

  const loadEquipment = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      if (!token) {
        setMessage('Please log in to access equipment management');
        setTimeout(() => setMessage(''), 3000);
        return;
      }
      
      console.log('Loading equipment with token:', token.substring(0, 20) + '...');
      
      const response = await fetch('/api/equipment', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log('Equipment API response status:', response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log('Equipment data received:', data);
        setEquipment(data.equipment || []);
        
        // Load stats
        const statsResponse = await fetch('/api/equipment/stats', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        
        if (statsResponse.ok) {
          const statsData = await statsResponse.json();
          setStats(statsData.overview || {
            totalItems: 0,
            totalValue: 0,
            categories: 0,
            available: 0,
            inUse: 0,
            maintenance: 0,
            rented: 0,
            lowStock: 0,
            needsMaintenance: 0
          });
        }
      } else {
        const errorData = await response.json();
        console.error('API Error:', errorData);
        setMessage(`Failed to load equipment: ${errorData.error || 'Unknown error'}`);
        setTimeout(() => setMessage(''), 5000);
      }
    } catch (error) {
      console.error('Error loading equipment:', error);
      setMessage(`Network error: ${error.message}`);
      setTimeout(() => setMessage(''), 5000);
    } finally {
      setLoading(false);
    }
  };

  const addSampleEquipment = async () => {
    const sampleEquipment = [
      {
        name: 'Official Match Soccer Ball',
        category: 'balls',
        description: 'Professional match soccer ball for games and training',
        quantity: 25,
        unitPrice: 45.00,
        condition: 'excellent',
        location: 'storage_room',
        status: 'available',
        purchaseDate: new Date('2024-09-15').toISOString().split('T')[0],
        supplier: 'Nike Sports Equipment',
        isRentable: true,
        rentalRate: 5.00
      },
      {
        name: 'Training Cones (Set of 50)',
        category: 'cones',
        description: 'Orange training cones for drills and practice',
        quantity: 3,
        unitPrice: 35.00,
        condition: 'good',
        location: 'equipment_shed',
        status: 'available',
        purchaseDate: new Date('2024-08-20').toISOString().split('T')[0],
        supplier: 'Pro Training Supplies'
      },
      {
        name: 'Team Uniform Kit - Home',
        category: 'uniforms',
        description: 'Complete home uniform set for team',
        quantity: 20,
        unitPrice: 65.00,
        condition: 'excellent',
        location: 'main_facility',
        status: 'in_use',
        purchaseDate: new Date('2025-01-10').toISOString().split('T')[0],
        supplier: 'Adidas Team Gear',
        size: 'Various'
      },
      {
        name: 'Goalkeeper Gloves',
        category: 'goalkeeper',
        description: 'Professional goalkeeper gloves',
        quantity: 8,
        unitPrice: 55.00,
        condition: 'good',
        location: 'storage_room',
        status: 'available',
        purchaseDate: new Date('2024-11-05').toISOString().split('T')[0],
        supplier: 'Goalkeeper Pro'
      },
      {
        name: 'Portable Goal (8x6 ft)',
        category: 'goals',
        description: 'Portable soccer goal for training',
        quantity: 4,
        unitPrice: 350.00,
        condition: 'good',
        location: 'field_1',
        status: 'in_use',
        purchaseDate: new Date('2024-07-15').toISOString().split('T')[0],
        supplier: 'Field Equipment Inc.'
      }
    ];

    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      for (const equipment of sampleEquipment) {
        await fetch('/api/equipment', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(equipment)
        });
      }
      
      setMessage('Sample equipment added successfully!');
      loadEquipment();
    } catch (error) {
      console.error('Error adding sample equipment:', error);
      setMessage('Failed to add sample equipment');
    } finally {
      setLoading(false);
      setTimeout(() => setMessage(''), 3000);
    }
  };

  const calculateTotalValue = () => {
    const total = (parseFloat(equipmentForm.quantity) || 0) * (parseFloat(equipmentForm.unitPrice) || 0);
    setEquipmentForm(prev => ({ ...prev, totalValue: total.toFixed(2) }));
  };

  const saveEquipment = async () => {
    if (!equipmentForm.name || !equipmentForm.category) {
      setMessage('Please fill in equipment name and category');
      setTimeout(() => setMessage(''), 3000);
      return;
    }

    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      const response = await fetch('/api/equipment', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(equipmentForm)
      });

      if (response.ok) {
        setMessage('Equipment saved successfully!');
        setShowModal(false);
        resetForm();
        loadEquipment();
      } else {
        const error = await response.json();
        setMessage(error.error || 'Failed to save equipment');
      }
    } catch (error) {
      console.error('Error saving equipment:', error);
      setMessage('Failed to save equipment');
    } finally {
      setLoading(false);
      setTimeout(() => setMessage(''), 3000);
    }
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

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(amount || 0);
  };

  const exportEquipment = async () => {
    try {
      const token = localStorage.getItem('token');
      const params = new URLSearchParams({
        category: filter.category,
        status: filter.status,
        location: filter.location
      });
      
      const response = await fetch(`/api/equipment/export/csv?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `equipment-${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
        window.URL.revokeObjectURL(url);
      } else {
        setMessage('Failed to export equipment');
        setTimeout(() => setMessage(''), 3000);
      }
    } catch (error) {
      console.error('Export error:', error);
      setMessage('Failed to export equipment');
      setTimeout(() => setMessage(''), 3000);
    }
  };

  const deleteEquipment = async (equipment) => {
    if (!window.confirm(`Are you sure you want to delete ${equipment.name}?`)) {
      return;
    }

    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      const response = await fetch(`/api/equipment/${equipment._id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        setMessage(`${equipment.name} deleted successfully`);
        loadEquipment();
      } else {
        const error = await response.json();
        setMessage(error.error || 'Failed to delete equipment');
      }
    } catch (error) {
      console.error('Error deleting equipment:', error);
      setMessage('Failed to delete equipment');
    } finally {
      setLoading(false);
      setTimeout(() => setMessage(''), 3000);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Inventory Management</h1>
              <p className="mt-1 text-sm text-gray-500">
                Track, manage, and maintain all club inventory and equipment
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
                  <div className="text-4xl">⚠️</div>
                  <div className="text-orange-600"><i className="bi bi-exclamation-triangle text-xl"></i></div>
                </div>
                <div className="text-3xl font-bold text-orange-900">{stats.lowStock}</div>
                <div className="text-sm text-orange-700 mt-1">Low Stock</div>
              </div>
            </div>

            {/* Additional Metrics */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 p-6 rounded-lg shadow-sm border border-indigo-200">
                <div className="flex items-center justify-between mb-2">
                  <div className="text-4xl">🔧</div>
                  <div className="text-indigo-600"><i className="bi bi-tools text-xl"></i></div>
                </div>
                <div className="text-3xl font-bold text-indigo-900">{stats.maintenance}</div>
                <div className="text-sm text-indigo-700 mt-1">In Maintenance</div>
              </div>

              <div className="bg-gradient-to-br from-pink-50 to-pink-100 p-6 rounded-lg shadow-sm border border-pink-200">
                <div className="flex items-center justify-between mb-2">
                  <div className="text-4xl">🔄</div>
                  <div className="text-pink-600"><i className="bi bi-arrow-repeat text-xl"></i></div>
                </div>
                <div className="text-3xl font-bold text-pink-900">{stats.rented}</div>
                <div className="text-sm text-pink-700 mt-1">Rented Out</div>
              </div>

              <div className="bg-gradient-to-br from-teal-50 to-teal-100 p-6 rounded-lg shadow-sm border border-teal-200">
                <div className="flex items-center justify-between mb-2">
                  <div className="text-4xl">📊</div>
                  <div className="text-teal-600"><i className="bi bi-graph-up text-xl"></i></div>
                </div>
                <div className="text-3xl font-bold text-teal-900">{stats.categories}</div>
                <div className="text-sm text-teal-700 mt-1">Categories</div>
              </div>

              <div className="bg-gradient-to-br from-red-50 to-red-100 p-6 rounded-lg shadow-sm border border-red-200">
                <div className="flex items-center justify-between mb-2">
                  <div className="text-4xl">🚨</div>
                  <div className="text-red-600"><i className="bi bi-alarm text-xl"></i></div>
                </div>
                <div className="text-3xl font-bold text-red-900">{stats.needsMaintenance}</div>
                <div className="text-sm text-red-700 mt-1">Needs Maintenance</div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Quick Actions</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <button
                  onClick={addSampleEquipment}
                  className="bg-green-600 text-white px-4 py-3 rounded-lg hover:bg-green-700 transition-colors text-center"
                >
                  <i className="bi bi-download text-xl mb-2 block"></i>
                  Add Sample Data
                </button>
                <button
                  onClick={exportEquipment}
                  className="bg-purple-600 text-white px-4 py-3 rounded-lg hover:bg-purple-700 transition-colors text-center"
                >
                  <i className="bi bi-file-earmark-arrow-down text-xl mb-2 block"></i>
                  Export Data
                </button>
                <button
                  onClick={() => setActiveTab('reports')}
                  className="bg-orange-600 text-white px-4 py-3 rounded-lg hover:bg-orange-700 transition-colors text-center"
                >
                  <i className="bi bi-graph-up text-xl mb-2 block"></i>
                  View Reports
                </button>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Recent Activity</h3>
              <div className="space-y-3">
                {equipment.slice(0, 5).map((item) => (
                  <div key={item._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center">
                      <div className="text-2xl mr-3">
                        {categories.find(c => c.id === item.category)?.icon}
                      </div>
                      <div>
                        <div className="font-semibold text-gray-900">{item.name}</div>
                        <div className="text-sm text-gray-600">
                          {item.quantity} units • {formatCurrency(item.totalValue)}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`px-2 py-1 text-xs rounded-full ${
                        item.status === 'available' ? 'bg-green-100 text-green-800' :
                        item.status === 'in_use' ? 'bg-blue-100 text-blue-800' :
                        item.status === 'maintenance' ? 'bg-orange-100 text-orange-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {item.status.replace('_', ' ')}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Purchases Tab */}
        {activeTab === 'purchases' && (
          <div className="space-y-6">
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-2">🛒 Purchase Management</h2>
              <p className="text-gray-700">
                Track equipment purchases, suppliers, and procurement history. Manage purchase orders and vendor relationships.
              </p>
            </div>

            {/* Purchase History Table */}
            <div className="bg-white rounded-lg shadow-sm border">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">Purchase History</h3>
              </div>
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
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
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
                        <td className="px-6 py-4 text-sm">
                          <button
                            onClick={() => {
                              setSelectedItem(item);
                              setModalType('view');
                              setShowModal(true);
                            }}
                            className="text-blue-600 hover:text-blue-800 mr-2"
                          >
                            <i className="bi bi-eye"></i>
                          </button>
                          <button
                            onClick={() => {
                              setEquipmentForm({...item});
                              setModalType('edit');
                              setShowModal(true);
                            }}
                            className="text-gray-600 hover:text-gray-800"
                          >
                            <i className="bi bi-pencil"></i>
                          </button>
                        </td>
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
                      <td></td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>

            {/* Supplier Management */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Supplier Management</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {Array.from(new Set(equipment.map(item => item.supplier).filter(Boolean))).map(supplier => {
                  const supplierItems = equipment.filter(item => item.supplier === supplier);
                  const totalSpent = supplierItems.reduce((sum, item) => sum + parseFloat(item.totalValue), 0);
                  
                  return (
                    <div key={supplier} className="bg-gray-50 rounded-lg p-4">
                      <h4 className="font-semibold text-gray-900 mb-2">{supplier}</h4>
                      <div className="text-sm text-gray-600">
                        <div>Items: {supplierItems.length}</div>
                        <div>Total Spent: {formatCurrency(totalSpent)}</div>
                        <div>Last Purchase: {supplierItems[0]?.purchaseDate ? new Date(supplierItems[0].purchaseDate).toLocaleDateString() : 'N/A'}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Maintenance Tab */}
        {activeTab === 'maintenance' && (
          <div className="space-y-6">
            <div className="bg-gradient-to-r from-orange-50 to-red-50 rounded-lg border p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-2">🔧 Maintenance Management</h2>
              <p className="text-gray-700">
                Track equipment maintenance schedules, repairs, and service history. Ensure all equipment is properly maintained.
              </p>
            </div>

            {/* Maintenance Alerts */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white rounded-lg shadow-sm border p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Maintenance Alerts</h3>
                <div className="space-y-3">
                  {equipment.filter(item => item.status === 'maintenance' || item.status === 'repair').map((item) => (
                    <div key={item._id} className="flex items-center justify-between p-3 bg-orange-50 rounded-lg border border-orange-200">
                      <div className="flex items-center">
                        <div className="text-2xl mr-3">
                          {categories.find(c => c.id === item.category)?.icon}
                        </div>
                        <div>
                          <div className="font-semibold text-gray-900">{item.name}</div>
                          <div className="text-sm text-gray-600">
                            Status: {item.status} • Last: {item.lastMaintenance ? new Date(item.lastMaintenance).toLocaleDateString() : 'Never'}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <button
                          onClick={() => {
                            setSelectedItem(item);
                            setModalType('maintenance');
                            setShowModal(true);
                          }}
                          className="bg-orange-600 text-white px-3 py-1 rounded text-sm hover:bg-orange-700"
                        >
                          Update
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm border p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Maintenance Schedule</h3>
                <div className="space-y-3">
                  {equipment.filter(item => item.maintenanceSchedule !== 'none').map((item) => (
                    <div key={item._id} className="flex items-center justify-between p-3 bg-blue-50 rounded-lg border border-blue-200">
                      <div className="flex items-center">
                        <div className="text-2xl mr-3">
                          {categories.find(c => c.id === item.category)?.icon}
                        </div>
                        <div>
                          <div className="font-semibold text-gray-900">{item.name}</div>
                          <div className="text-sm text-gray-600">
                            Schedule: {item.maintenanceSchedule} • Next: {item.nextMaintenance ? new Date(item.nextMaintenance).toLocaleDateString() : 'Not scheduled'}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          item.nextMaintenance && new Date(item.nextMaintenance) <= new Date() 
                            ? 'bg-red-100 text-red-800' 
                            : 'bg-green-100 text-green-800'
                        }`}>
                          {item.nextMaintenance && new Date(item.nextMaintenance) <= new Date() ? 'Due' : 'Scheduled'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Maintenance History */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Maintenance History</h3>
              <div className="text-center py-8 text-gray-500">
                <i className="bi bi-tools text-4xl mb-2"></i>
                <p>Maintenance records will appear here once equipment maintenance is tracked.</p>
              </div>
            </div>
          </div>
        )}

        {/* Reports Tab */}
        {activeTab === 'reports' && (
          <div className="space-y-6">
            <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg border p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-2">📈 Inventory Reports & Analytics</h2>
              <p className="text-gray-700">
                Comprehensive reports and analytics for inventory management, financial tracking, and operational insights.
              </p>
            </div>

            {/* Key Metrics Dashboard */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-lg shadow-sm border border-green-200">
                <div className="flex items-center justify-between mb-2">
                  <div className="text-4xl">💰</div>
                  <div className="text-green-600"><i className="bi bi-currency-dollar text-xl"></i></div>
                </div>
                <div className="text-3xl font-bold text-green-900">{formatCurrency(stats.totalValue || 0)}</div>
                <div className="text-sm text-green-700 mt-1">Total Investment</div>
              </div>

              <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-lg shadow-sm border border-blue-200">
                <div className="flex items-center justify-between mb-2">
                  <div className="text-4xl">📦</div>
                  <div className="text-blue-600"><i className="bi bi-box text-xl"></i></div>
                </div>
                <div className="text-3xl font-bold text-blue-900">{stats.totalItems || 0}</div>
                <div className="text-sm text-blue-700 mt-1">Total Items</div>
              </div>

              <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-lg shadow-sm border border-purple-200">
                <div className="flex items-center justify-between mb-2">
                  <div className="text-4xl">✅</div>
                  <div className="text-purple-600"><i className="bi bi-check-circle text-xl"></i></div>
                </div>
                <div className="text-3xl font-bold text-purple-900">{stats.available || 0}</div>
                <div className="text-sm text-purple-700 mt-1">Available</div>
              </div>

              <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-6 rounded-lg shadow-sm border border-orange-200">
                <div className="flex items-center justify-between mb-2">
                  <div className="text-4xl">⚠️</div>
                  <div className="text-orange-600"><i className="bi bi-exclamation-triangle text-xl"></i></div>
                </div>
                <div className="text-3xl font-bold text-orange-900">{stats.lowStock || 0}</div>
                <div className="text-sm text-orange-700 mt-1">Low Stock</div>
              </div>
            </div>

            {/* Detailed Reports */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Financial Summary */}
              <div className="bg-white rounded-lg shadow-sm border p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Financial Summary</h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                    <span className="text-gray-700">Total Investment</span>
                    <span className="font-bold text-green-600 text-lg">{formatCurrency(stats.totalValue || 0)}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                    <span className="text-gray-700">Average Item Value</span>
                    <span className="font-bold text-blue-600 text-lg">
                      {formatCurrency((stats.totalValue || 0) / (equipment.length || 1))}
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-purple-50 rounded-lg">
                    <span className="text-gray-700">Total Items</span>
                    <span className="font-bold text-purple-600 text-lg">{stats.totalItems || 0}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-indigo-50 rounded-lg">
                    <span className="text-gray-700">Categories</span>
                    <span className="font-bold text-indigo-600 text-lg">{stats.categories || 0}</span>
                  </div>
                </div>
              </div>

              {/* Status Overview */}
              <div className="bg-white rounded-lg shadow-sm border p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Status Overview</h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                    <span className="text-gray-700">Available</span>
                    <span className="font-bold text-green-600 text-lg">{stats.available || 0}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                    <span className="text-gray-700">In Use</span>
                    <span className="font-bold text-blue-600 text-lg">{stats.inUse || 0}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-orange-50 rounded-lg">
                    <span className="text-gray-700">Maintenance</span>
                    <span className="font-bold text-orange-600 text-lg">{stats.maintenance || 0}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-purple-50 rounded-lg">
                    <span className="text-gray-700">Rented</span>
                    <span className="font-bold text-purple-600 text-lg">{stats.rented || 0}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Category Breakdown */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Value by Category</h3>
              {equipment.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <i className="bi bi-graph-up text-4xl mb-2"></i>
                  <p>No data available. Add equipment to see category breakdown.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {categories.map(cat => {
                    const categoryItems = equipment.filter(item => item.category === cat.id);
                    const categoryValue = categoryItems.reduce((sum, item) => sum + parseFloat(item.totalValue || 0), 0);
                    const percentage = (stats.totalValue || 0) > 0 ? (categoryValue / (stats.totalValue || 1)) * 100 : 0;
                    
                    if (categoryItems.length === 0) return null;
                    
                    return (
                      <div key={cat.id} className="border rounded-lg p-4">
                        <div className="flex justify-between text-sm mb-2">
                          <span className="flex items-center font-semibold">
                            <span className="mr-2 text-xl">{cat.icon}</span>
                            {cat.name} ({categoryItems.length} items)
                          </span>
                          <span className="font-bold text-green-600 text-lg">{formatCurrency(categoryValue)}</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-4">
                          <div
                            className="bg-blue-600 h-4 rounded-full transition-all duration-300"
                            style={{ width: `${percentage}%` }}
                          ></div>
                        </div>
                        <div className="text-xs text-gray-500 mt-2">{percentage.toFixed(1)}% of total value</div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Alerts & Notifications */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Alerts & Notifications</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-red-50 p-4 rounded-lg border border-red-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-sm text-red-700">Low Stock Items</div>
                      <div className="text-2xl font-bold text-red-600">{stats.lowStock || 0}</div>
                    </div>
                    <i className="bi bi-exclamation-triangle text-2xl text-red-500"></i>
                  </div>
                </div>
                <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-sm text-orange-700">Needs Maintenance</div>
                      <div className="text-2xl font-bold text-orange-600">{stats.needsMaintenance || 0}</div>
                    </div>
                    <i className="bi bi-tools text-2xl text-orange-500"></i>
                  </div>
                </div>
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-sm text-blue-700">Active Rentals</div>
                      <div className="text-2xl font-bold text-blue-600">{stats.rented || 0}</div>
                    </div>
                    <i className="bi bi-arrow-repeat text-2xl text-blue-500"></i>
                  </div>
                </div>
              </div>
            </div>

            {/* Export Options */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Export Reports</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <button
                  onClick={exportEquipment}
                  className="bg-green-600 text-white px-6 py-4 rounded-lg hover:bg-green-700 transition-colors text-center"
                >
                  <i className="bi bi-file-earmark-excel text-2xl mb-2 block"></i>
                  <div className="font-semibold">Export to CSV</div>
                  <div className="text-sm opacity-90">Download inventory data</div>
                </button>
                <button
                  onClick={() => setMessage('PDF export coming soon!')}
                  className="bg-red-600 text-white px-6 py-4 rounded-lg hover:bg-red-700 transition-colors text-center"
                >
                  <i className="bi bi-file-earmark-pdf text-2xl mb-2 block"></i>
                  <div className="font-semibold">Export to PDF</div>
                  <div className="text-sm opacity-90">Generate report document</div>
                </button>
                <button
                  onClick={() => setMessage('Print view coming soon!')}
                  className="bg-gray-600 text-white px-6 py-4 rounded-lg hover:bg-gray-700 transition-colors text-center"
                >
                  <i className="bi bi-printer text-2xl mb-2 block"></i>
                  <div className="font-semibold">Print Report</div>
                  <div className="text-sm opacity-90">Print current view</div>
                </button>
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

            {/* Rental Management */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white rounded-lg shadow-sm border p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Available for Rent</h3>
                <div className="space-y-3">
                  {equipment.filter(item => item.isRentable && item.status === 'available').map((item) => {
                    const category = categories.find(c => c.id === item.category);
                    
                    return (
                      <div key={item._id} className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200">
                        <div className="flex items-center">
                          <div className="text-2xl mr-3">{category?.icon}</div>
                          <div>
                            <div className="font-semibold text-gray-900">{item.name}</div>
                            <div className="text-sm text-gray-600">
                              {item.quantity} available • {formatCurrency(item.rentalRate)}/day
                            </div>
                          </div>
                        </div>
                        <button
                          onClick={() => {
                            setSelectedItem(item);
                            setModalType('rent');
                            setShowModal(true);
                          }}
                          className="bg-purple-600 text-white px-3 py-1 rounded text-sm hover:bg-purple-700"
                        >
                          Rent
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm border p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Active Rentals</h3>
                <div className="space-y-3">
                  {equipment.filter(item => item.status === 'rented').map((item) => {
                    const category = categories.find(c => c.id === item.category);
                    
                    return (
                      <div key={item._id} className="flex items-center justify-between p-3 bg-blue-50 rounded-lg border border-blue-200">
                        <div className="flex items-center">
                          <div className="text-2xl mr-3">{category?.icon}</div>
                          <div>
                            <div className="font-semibold text-gray-900">{item.name}</div>
                            <div className="text-sm text-gray-600">
                              Rented • {formatCurrency(item.rentalRate)}/day
                            </div>
                          </div>
                        </div>
                        <button
                          onClick={() => {
                            setSelectedItem(item);
                            setModalType('return');
                            setShowModal(true);
                          }}
                          className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700"
                        >
                          Return
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Rental Revenue */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Rental Revenue</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                  <div className="text-2xl font-bold text-green-600">
                    {formatCurrency(equipment.filter(item => item.isRentable).reduce((sum, item) => sum + (item.rentalRate * 30), 0))}
                  </div>
                  <div className="text-sm text-green-700">Potential Monthly Revenue</div>
                </div>
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                  <div className="text-2xl font-bold text-blue-600">
                    {equipment.filter(item => item.isRentable).length}
                  </div>
                  <div className="text-sm text-blue-700">Rentable Items</div>
                </div>
                <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                  <div className="text-2xl font-bold text-purple-600">
                    {formatCurrency(equipment.filter(item => item.isRentable).reduce((sum, item) => sum + item.rentalRate, 0) / equipment.filter(item => item.isRentable).length || 0)}
                  </div>
                  <div className="text-sm text-purple-700">Average Daily Rate</div>
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
                  placeholder="Search inventory..."
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
                Showing {filteredEquipment.length} of {equipment.length} inventory items
              </div>
            </div>

            {/* Inventory Header */}
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-gray-900">Inventory Items</h2>
            </div>

            {/* Equipment Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {loading ? (
                <div className="col-span-3 text-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                  <p className="text-lg font-semibold text-gray-900">Loading inventory...</p>
                </div>
              ) : filteredEquipment.length === 0 ? (
                <div className="col-span-3 text-center py-12">
                  <div className="text-6xl mb-4">📦</div>
                  <p className="text-lg font-semibold text-gray-900 mb-2">No inventory items found</p>
                  <p className="text-sm text-gray-600">Use the "Add Equipment" button above to get started</p>
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
                          <button
                            onClick={() => deleteEquipment(item)}
                            className="flex-1 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 text-sm"
                          >
                            <i className="bi bi-trash me-2"></i>Delete
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

export default InventoryManagementSystem;


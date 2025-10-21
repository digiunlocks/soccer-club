import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from 'react-toastify';

const API_URL = "http://localhost:5000/api/teams";

const AGE_GROUPS = [
  "Under 6", "Under 8", "Under 10", "Under 12", "Under 14", 
  "Under 16", "Under 18", "Adult", "Women's", "Coed"
];

const TEAM_LEVELS = ["Recreational", "Competitive", "Elite", "Development", "All-Star"];
const TEAM_STATUSES = ["Active", "Inactive", "Forming", "Full", "Tryouts"];
const UNIFORM_SIZES = ["2XS", "XS", "S", "M", "L", "XL", "2XL", "3XL", "4XL"];
const UNIFORM_TYPES = ["Home", "Away", "Training", "Goalkeeper", "Warm-up"];
const UNIFORM_CONDITIONS = ["New", "Excellent", "Good", "Fair", "Needs Replacement"];

export default function AdminTeamManager() {
  const navigate = useNavigate();
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingTeam, setEditingTeam] = useState(null);
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [filter, setFilter] = useState({ ageGroup: "", level: "", status: "" });
  const [showUniformModal, setShowUniformModal] = useState(false);
  const [uniformInventory, setUniformInventory] = useState([]);
  const [showUniformAssignment, setShowUniformAssignment] = useState(false);
  const [selectedUniform, setSelectedUniform] = useState(null);
  const [activeDetailTab, setActiveDetailTab] = useState('info');
  
  const [form, setForm] = useState({
    name: "",
    ageGroup: "",
    level: "",
    status: "Forming",
    coach: "",
    assistantCoach: "",
    maxPlayers: 16,
    currentPlayers: 0,
    practiceDays: "",
    practiceTime: "",
    gameDay: "",
    gameTime: "",
    location: "",
    fees: 0,
    season: "",
    description: "",
    visible: true,
    uniforms: {
      primaryColor: "#000000",
      secondaryColor: "#FFFFFF",
      inventory: []
    }
  });

  const [newUniform, setNewUniform] = useState({
    type: "Home",
    number: "",
    size: "M",
    condition: "New",
    assignedTo: "",
    assignedDate: null,
    notes: ""
  });

  useEffect(() => {
    fetchTeams();
  }, []);

  const fetchTeams = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(API_URL, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch teams');
      }
      
      const data = await response.json();
      setTeams(data);
    } catch (error) {
      console.error('Error fetching teams:', error);
      setError('Failed to load teams');
      toast.error('Failed to load teams');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    
    try {
      const token = localStorage.getItem("token");
      const url = editingTeam ? `${API_URL}/${editingTeam._id}` : API_URL;
      const method = editingTeam ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(form)
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to save team');
      }
      
      const savedTeam = await response.json();
      
      if (editingTeam) {
        setTeams(prev => prev.map(team => 
          team._id === savedTeam._id ? savedTeam : team
        ));
        toast.success('Team updated successfully');
      } else {
        setTeams(prev => [...prev, savedTeam]);
        toast.success('Team created successfully');
      }
      
      resetForm();
      setShowForm(false);
      setEditingTeam(null);
      
    } catch (error) {
      console.error('Error saving team:', error);
      setError(error.message);
      toast.error(error.message);
    }
  };

  const handleEdit = (team) => {
    setForm({
      name: team.name,
      ageGroup: team.ageGroup,
      level: team.level,
      status: team.status,
      coach: team.coach,
      assistantCoach: team.assistantCoach || "",
      maxPlayers: team.maxPlayers,
      currentPlayers: team.currentPlayers,
      practiceDays: team.practiceDays,
      practiceTime: team.practiceTime,
      gameDay: team.gameDay,
      gameTime: team.gameTime,
      location: team.location,
      fees: team.fees,
      season: team.season,
      description: team.description || "",
      visible: team.visible,
      uniforms: team.uniforms || {
        primaryColor: "#000000",
        secondaryColor: "#FFFFFF",
        inventory: []
      }
    });
    setEditingTeam(team);
    setShowForm(true);
  };

  const handleDelete = async (teamId) => {
    if (!window.confirm('Are you sure you want to delete this team?')) {
      return;
    }
    
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_URL}/${teamId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete team');
      }
      
      setTeams(prev => prev.filter(team => team._id !== teamId));
      toast.success('Team deleted successfully');
      
    } catch (error) {
      console.error('Error deleting team:', error);
      toast.error('Failed to delete team');
    }
  };

  const resetForm = () => {
    setForm({
      name: "",
      ageGroup: "",
      level: "",
      status: "Forming",
      coach: "",
      assistantCoach: "",
      maxPlayers: 16,
      currentPlayers: 0,
      practiceDays: "",
      practiceTime: "",
      gameDay: "",
      gameTime: "",
      location: "",
      fees: 0,
      season: "",
      description: "",
      visible: true,
      uniforms: {
        primaryColor: "#000000",
        secondaryColor: "#FFFFFF",
        inventory: []
      }
    });
  };

  const addUniform = () => {
    const uniform = {
      ...newUniform,
      id: `uniform_${Date.now()}`,
      createdDate: new Date().toISOString()
    };
    
    setForm(prev => ({
      ...prev,
      uniforms: {
        ...prev.uniforms,
        inventory: [...(prev.uniforms.inventory || []), uniform]
      }
    }));

    setNewUniform({
      type: "Home",
      number: "",
      size: "M",
      condition: "New",
      assignedTo: "",
      assignedDate: null,
      notes: ""
    });
    
    toast.success('Uniform added to inventory');
  };

  const updateUniform = (uniformId, updates) => {
    setForm(prev => ({
      ...prev,
      uniforms: {
        ...prev.uniforms,
        inventory: prev.uniforms.inventory.map(u =>
          u.id === uniformId ? { ...u, ...updates } : u
        )
      }
    }));
  };

  const removeUniform = (uniformId) => {
    if (!confirm('Remove this uniform from inventory?')) return;
    
    setForm(prev => ({
      ...prev,
      uniforms: {
        ...prev.uniforms,
        inventory: prev.uniforms.inventory.filter(u => u.id !== uniformId)
      }
    }));
    
    toast.success('Uniform removed from inventory');
  };

  const assignUniform = (uniformId, playerName) => {
    updateUniform(uniformId, {
      assignedTo: playerName,
      assignedDate: new Date().toISOString()
    });
    toast.success(`Uniform assigned to ${playerName}`);
  };

  const returnUniform = (uniformId) => {
    updateUniform(uniformId, {
      assignedTo: "",
      assignedDate: null
    });
    toast.success('Uniform returned to inventory');
  };

  const filteredTeams = teams.filter(team => {
    if (filter.ageGroup && team.ageGroup !== filter.ageGroup) return false;
    if (filter.level && team.level !== filter.level) return false;
    if (filter.status && team.status !== filter.status) return false;
    return true;
  });

  const getStatusColor = (status) => {
    const colors = {
      Active: "bg-green-100 text-green-800 border-green-200",
      Inactive: "bg-gray-100 text-gray-800 border-gray-200",
      Forming: "bg-yellow-100 text-yellow-800 border-yellow-200",
      Full: "bg-red-100 text-red-800 border-red-200",
      Tryouts: "bg-blue-100 text-blue-800 border-blue-200"
    };
    return colors[status] || "bg-gray-100 text-gray-800 border-gray-200";
  };

  const getLevelColor = (level) => {
    const colors = {
      Recreational: "bg-blue-100 text-blue-800 border-blue-200",
      Competitive: "bg-orange-100 text-orange-800 border-orange-200",
      Elite: "bg-purple-100 text-purple-800 border-purple-200",
      Development: "bg-green-100 text-green-800 border-green-200",
      "All-Star": "bg-red-100 text-red-800 border-red-200"
    };
    return colors[level] || "bg-gray-100 text-gray-800 border-gray-200";
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto p-6 bg-gray-50 min-h-screen">
        <div className="flex justify-center items-center h-64">
          <div className="text-xl text-gray-600">Loading teams...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate('/admin')}
            className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Dashboard
          </button>
          <h2 className="text-2xl font-bold text-green-900">Team Management</h2>
        </div>
        <button
          onClick={() => {
            resetForm();
            setEditingTeam(null);
            setShowForm(true);
          }}
          className="bg-green-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-green-700 transition-colors flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          Add New Team
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white p-6 rounded-lg shadow-sm border mb-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Filter Teams</h3>
        <div className="flex flex-wrap gap-4">
          <select 
            value={filter.ageGroup} 
            onChange={e => setFilter(f => ({ ...f, ageGroup: e.target.value }))}
            className="border rounded px-4 py-2 bg-white"
          >
            <option value="">All Age Groups</option>
            {AGE_GROUPS.map(group => <option key={group} value={group}>{group}</option>)}
          </select>
          <select 
            value={filter.level} 
            onChange={e => setFilter(f => ({ ...f, level: e.target.value }))}
            className="border rounded px-4 py-2 bg-white"
          >
            <option value="">All Levels</option>
            {TEAM_LEVELS.map(level => <option key={level} value={level}>{level}</option>)}
          </select>
          <select 
            value={filter.status} 
            onChange={e => setFilter(f => ({ ...f, status: e.target.value }))}
            className="border rounded px-4 py-2 bg-white"
          >
            <option value="">All Statuses</option>
            {TEAM_STATUSES.map(status => <option key={status} value={status}>{status}</option>)}
          </select>
          <button
            onClick={() => setFilter({ ageGroup: "", level: "", status: "" })}
            className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 transition-colors"
          >
            Clear Filters
          </button>
        </div>
      </div>

      {/* Team Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="bg-green-600 text-white p-6">
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-bold">
                  {editingTeam ? 'Edit Team' : 'Add New Team'}
                </h3>
                <button
                  onClick={() => {
                    setShowForm(false);
                    setEditingTeam(null);
                    resetForm();
                  }}
                  className="text-white text-2xl font-bold hover:text-gray-300"
                >
                  ×
                </button>
              </div>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6">
              {error && (
                <div className="mb-4 p-3 bg-red-100 text-red-700 rounded border">
                  {error}
                </div>
              )}
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Basic Information */}
                <div className="space-y-4">
                  <h4 className="font-bold text-gray-900">Basic Information</h4>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Team Name *</label>
                    <input
                      type="text"
                      name="name"
                      value={form.name}
                      onChange={handleChange}
                      required
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Age Group *</label>
                    <select
                      name="ageGroup"
                      value={form.ageGroup}
                      onChange={handleChange}
                      required
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                    >
                      <option value="">Select Age Group</option>
                      {AGE_GROUPS.map(group => <option key={group} value={group}>{group}</option>)}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Level *</label>
                    <select
                      name="level"
                      value={form.level}
                      onChange={handleChange}
                      required
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                    >
                      <option value="">Select Level</option>
                      {TEAM_LEVELS.map(level => <option key={level} value={level}>{level}</option>)}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Status *</label>
                    <select
                      name="status"
                      value={form.status}
                      onChange={handleChange}
                      required
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                    >
                      {TEAM_STATUSES.map(status => <option key={status} value={status}>{status}</option>)}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Coach *</label>
                    <input
                      type="text"
                      name="coach"
                      value={form.coach}
                      onChange={handleChange}
                      required
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Assistant Coach</label>
                    <input
                      type="text"
                      name="assistantCoach"
                      value={form.assistantCoach}
                      onChange={handleChange}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                  </div>
                </div>
                
                {/* Roster & Schedule */}
                <div className="space-y-4">
                  <h4 className="font-bold text-gray-900">Roster & Schedule</h4>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Max Players *</label>
                      <input
                        type="number"
                        name="maxPlayers"
                        value={form.maxPlayers}
                        onChange={handleChange}
                        min="1"
                        max="30"
                        required
                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Current Players</label>
                      <input
                        type="number"
                        name="currentPlayers"
                        value={form.currentPlayers}
                        onChange={handleChange}
                        min="0"
                        max={form.maxPlayers}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Practice Days *</label>
                    <input
                      type="text"
                      name="practiceDays"
                      value={form.practiceDays}
                      onChange={handleChange}
                      placeholder="e.g., Tuesday & Thursday"
                      required
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Practice Time *</label>
                    <input
                      type="text"
                      name="practiceTime"
                      value={form.practiceTime}
                      onChange={handleChange}
                      placeholder="e.g., 4:30 PM - 6:00 PM"
                      required
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Game Day *</label>
                    <input
                      type="text"
                      name="gameDay"
                      value={form.gameDay}
                      onChange={handleChange}
                      placeholder="e.g., Saturday"
                      required
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Game Time *</label>
                    <input
                      type="text"
                      name="gameTime"
                      value={form.gameTime}
                      onChange={handleChange}
                      placeholder="e.g., 10:30 AM"
                      required
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                  </div>
                </div>
              </div>
              
              {/* Additional Information */}
              <div className="mt-6 space-y-4">
                <h4 className="font-bold text-gray-900">Additional Information</h4>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Location *</label>
                    <input
                      type="text"
                      name="location"
                      value={form.location}
                      onChange={handleChange}
                      placeholder="e.g., Greenfield Park"
                      required
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Fees *</label>
                    <input
                      type="number"
                      name="fees"
                      value={form.fees}
                      onChange={handleChange}
                      min="0"
                      placeholder="0"
                      required
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Season *</label>
                    <input
                      type="text"
                      name="season"
                      value={form.season}
                      onChange={handleChange}
                      placeholder="e.g., Fall 2024"
                      required
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea
                    name="description"
                    value={form.description}
                    onChange={handleChange}
                    rows="3"
                    placeholder="Team description..."
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
                
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    name="visible"
                    checked={form.visible}
                    onChange={handleChange}
                    className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                  />
                  <label className="ml-2 block text-sm text-gray-900">
                    Visible on public website
                  </label>
                </div>
              </div>

              {/* Uniform Management Section */}
              <div className="mt-6 space-y-4">
                <h4 className="font-bold text-gray-900 flex items-center gap-2">
                  <span>👕</span> Uniform Management
                </h4>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Primary Color</label>
                    <div className="flex gap-2">
                      <input
                        type="color"
                        value={form.uniforms.primaryColor}
                        onChange={(e) => setForm(prev => ({
                          ...prev,
                          uniforms: { ...prev.uniforms, primaryColor: e.target.value }
                        }))}
                        className="h-10 w-20 border rounded"
                      />
                      <input
                        type="text"
                        value={form.uniforms.primaryColor}
                        onChange={(e) => setForm(prev => ({
                          ...prev,
                          uniforms: { ...prev.uniforms, primaryColor: e.target.value }
                        }))}
                        className="flex-1 border border-gray-300 rounded-md px-3 py-2"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Secondary Color</label>
                    <div className="flex gap-2">
                      <input
                        type="color"
                        value={form.uniforms.secondaryColor}
                        onChange={(e) => setForm(prev => ({
                          ...prev,
                          uniforms: { ...prev.uniforms, secondaryColor: e.target.value }
                        }))}
                        className="h-10 w-20 border rounded"
                      />
                      <input
                        type="text"
                        value={form.uniforms.secondaryColor}
                        onChange={(e) => setForm(prev => ({
                          ...prev,
                          uniforms: { ...prev.uniforms, secondaryColor: e.target.value }
                        }))}
                        className="flex-1 border border-gray-300 rounded-md px-3 py-2"
                      />
                    </div>
                  </div>
                </div>

                {/* Add Uniform to Inventory */}
                <div className="bg-gray-50 p-4 rounded-lg border">
                  <h5 className="font-semibold text-gray-900 mb-3">Add Uniform to Inventory</h5>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3">
                    <select
                      value={newUniform.type}
                      onChange={(e) => setNewUniform(prev => ({ ...prev, type: e.target.value }))}
                      className="border rounded px-3 py-2"
                    >
                      {UNIFORM_TYPES.map(type => (
                        <option key={type} value={type}>{type}</option>
                      ))}
                    </select>
                    
                    <input
                      type="text"
                      value={newUniform.number}
                      onChange={(e) => setNewUniform(prev => ({ ...prev, number: e.target.value }))}
                      placeholder="Number"
                      className="border rounded px-3 py-2"
                    />
                    
                    <select
                      value={newUniform.size}
                      onChange={(e) => setNewUniform(prev => ({ ...prev, size: e.target.value }))}
                      className="border rounded px-3 py-2"
                    >
                      {UNIFORM_SIZES.map(size => (
                        <option key={size} value={size}>{size}</option>
                      ))}
                    </select>
                    
                    <select
                      value={newUniform.condition}
                      onChange={(e) => setNewUniform(prev => ({ ...prev, condition: e.target.value }))}
                      className="border rounded px-3 py-2"
                    >
                      {UNIFORM_CONDITIONS.map(cond => (
                        <option key={cond} value={cond}>{cond}</option>
                      ))}
                    </select>
                  </div>
                  
                  <input
                    type="text"
                    value={newUniform.notes}
                    onChange={(e) => setNewUniform(prev => ({ ...prev, notes: e.target.value }))}
                    placeholder="Notes (optional)"
                    className="w-full border rounded px-3 py-2 mb-3"
                  />
                  
                  <button
                    type="button"
                    onClick={addUniform}
                    className="w-full bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                  >
                    <i className="bi bi-plus-lg me-2"></i>Add Uniform
                  </button>
                </div>

                {/* Uniform Inventory List */}
                {form.uniforms.inventory && form.uniforms.inventory.length > 0 && (
                  <div className="bg-white border rounded-lg p-4">
                    <h5 className="font-semibold text-gray-900 mb-3">
                      Uniform Inventory ({form.uniforms.inventory.length})
                    </h5>
                    <div className="space-y-2 max-h-64 overflow-y-auto">
                      {form.uniforms.inventory.map((uniform) => (
                        <div key={uniform.id} className="flex items-center justify-between p-3 bg-gray-50 rounded border">
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <span className={`px-2 py-1 text-xs rounded ${
                                uniform.type === 'Home' ? 'bg-blue-100 text-blue-800' :
                                uniform.type === 'Away' ? 'bg-green-100 text-green-800' :
                                uniform.type === 'Training' ? 'bg-purple-100 text-purple-800' :
                                uniform.type === 'Goalkeeper' ? 'bg-orange-100 text-orange-800' :
                                'bg-gray-100 text-gray-800'
                              }`}>
                                {uniform.type}
                              </span>
                              <span className="font-semibold text-gray-900">#{uniform.number}</span>
                              <span className="text-sm text-gray-600">Size: {uniform.size}</span>
                              <span className={`text-xs px-2 py-1 rounded ${
                                uniform.assignedTo ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'
                              }`}>
                                {uniform.assignedTo || 'Available'}
                              </span>
                            </div>
                            {uniform.notes && (
                              <p className="text-xs text-gray-500 mt-1">{uniform.notes}</p>
                            )}
                          </div>
                          <button
                            type="button"
                            onClick={() => removeUniform(uniform.id)}
                            className="text-red-600 hover:text-red-800 ml-2"
                          >
                            <i className="bi bi-trash"></i>
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              
              <div className="mt-6 flex gap-4">
                <button
                  type="submit"
                  className="flex-1 bg-green-600 text-white py-2 px-4 rounded font-semibold hover:bg-green-700 transition-colors"
                >
                  {editingTeam ? 'Update Team' : 'Create Team'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    setEditingTeam(null);
                    resetForm();
                  }}
                  className="flex-1 bg-gray-600 text-white py-2 px-4 rounded font-semibold hover:bg-gray-700 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Teams List */}
      <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
        <div className="p-6 border-b">
          <h3 className="text-lg font-bold text-gray-900">
            Teams ({filteredTeams.length})
          </h3>
        </div>
        
        {filteredTeams.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            {teams.length === 0 ? 'No teams found. Create your first team!' : 'No teams match your filters.'}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Team</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Level</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Coach</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Roster</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fees</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredTeams.map((team) => (
                  <tr key={team._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{team.name}</div>
                        <div className="text-sm text-gray-500">{team.ageGroup}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getLevelColor(team.level)}`}>
                        {team.level}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(team.status)}`}>
                        {team.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {team.coach}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{team.currentPlayers}/{team.maxPlayers}</div>
                      <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                        <div 
                          className="bg-green-600 h-2 rounded-full"
                          style={{ width: `${Math.round((team.currentPlayers / team.maxPlayers) * 100)}%` }}
                        ></div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      ${team.fees}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex gap-2">
                        <button
                          onClick={() => setSelectedTeam(team)}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          View
                        </button>
                        <button
                          onClick={() => handleEdit(team)}
                          className="text-green-600 hover:text-green-900"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(team._id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Team Details Modal */}
      {selectedTeam && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="bg-green-600 text-white p-6">
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-2xl font-bold">{selectedTeam.name}</h2>
                  <p className="text-green-100">{selectedTeam.ageGroup} • {selectedTeam.level}</p>
                </div>
                <button
                  onClick={() => setSelectedTeam(null)}
                  className="text-white text-2xl font-bold hover:text-gray-300"
                >
                  ×
                </button>
              </div>
            </div>

            {/* Tabs */}
            <div className="border-b">
              <div className="flex gap-4 px-6">
                <button
                  onClick={() => setActiveDetailTab('info')}
                  className={`py-3 px-1 border-b-2 font-medium text-sm ${
                    activeDetailTab === 'info'
                      ? 'border-green-500 text-green-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  ℹ️ Team Info
                </button>
                <button
                  onClick={() => setActiveDetailTab('uniforms')}
                  className={`py-3 px-1 border-b-2 font-medium text-sm ${
                    activeDetailTab === 'uniforms'
                      ? 'border-green-500 text-green-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  👕 Uniforms ({selectedTeam.uniforms?.inventory?.length || 0})
                </button>
              </div>
            </div>
            
            <div className="p-6">
              {activeDetailTab === 'info' && (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h3 className="text-lg font-bold text-gray-900 mb-3">Team Information</h3>
                      <div className="space-y-2 text-sm">
                        <div><strong>Status:</strong> <span className={`px-2 py-1 rounded text-xs font-semibold ${getStatusColor(selectedTeam.status)}`}>{selectedTeam.status}</span></div>
                        <div><strong>Coach:</strong> {selectedTeam.coach}</div>
                        <div><strong>Assistant Coach:</strong> {selectedTeam.assistantCoach || "Not assigned"}</div>
                        <div><strong>Players:</strong> {selectedTeam.currentPlayers}/{selectedTeam.maxPlayers}</div>
                        <div><strong>Season Fees:</strong> ${selectedTeam.fees}</div>
                        <div><strong>Season:</strong> {selectedTeam.season}</div>
                        <div><strong>Visible:</strong> {selectedTeam.visible ? "Yes" : "No"}</div>
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="text-lg font-bold text-gray-900 mb-3">Schedule</h3>
                      <div className="space-y-2 text-sm">
                        <div><strong>Practice:</strong> {selectedTeam.practiceDays} {selectedTeam.practiceTime}</div>
                        <div><strong>Games:</strong> {selectedTeam.gameDay} {selectedTeam.gameTime}</div>
                        <div><strong>Location:</strong> {selectedTeam.location}</div>
                      </div>
                    </div>
                  </div>
                  
                  {selectedTeam.description && (
                    <div className="mt-6">
                      <h3 className="text-lg font-bold text-gray-900 mb-3">Description</h3>
                      <p className="text-gray-600">{selectedTeam.description}</p>
                    </div>
                  )}
                </>
              )}

              {activeDetailTab === 'uniforms' && (
                <div className="space-y-6">
                  {/* Team Colors */}
                  <div className="bg-gradient-to-r from-gray-50 to-gray-100 p-4 rounded-lg border">
                    <h3 className="text-lg font-bold text-gray-900 mb-3">Team Colors</h3>
                    <div className="flex items-center gap-6">
                      <div>
                        <label className="text-sm font-medium text-gray-700">Primary Color</label>
                        <div className="flex items-center gap-2 mt-1">
                          <div
                            className="w-12 h-12 rounded-lg border-2 border-gray-300"
                            style={{ backgroundColor: selectedTeam.uniforms?.primaryColor || '#000000' }}
                          ></div>
                          <span className="text-sm font-mono text-gray-600">
                            {selectedTeam.uniforms?.primaryColor || '#000000'}
                          </span>
                        </div>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-700">Secondary Color</label>
                        <div className="flex items-center gap-2 mt-1">
                          <div
                            className="w-12 h-12 rounded-lg border-2 border-gray-300"
                            style={{ backgroundColor: selectedTeam.uniforms?.secondaryColor || '#FFFFFF' }}
                          ></div>
                          <span className="text-sm font-mono text-gray-600">
                            {selectedTeam.uniforms?.secondaryColor || '#FFFFFF'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Uniform Statistics */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-blue-50 p-4 rounded-lg border border-blue-200 text-center">
                      <div className="text-2xl font-bold text-blue-900">
                        {selectedTeam.uniforms?.inventory?.length || 0}
                      </div>
                      <div className="text-sm text-blue-700">Total Uniforms</div>
                    </div>
                    <div className="bg-green-50 p-4 rounded-lg border border-green-200 text-center">
                      <div className="text-2xl font-bold text-green-900">
                        {selectedTeam.uniforms?.inventory?.filter(u => !u.assignedTo).length || 0}
                      </div>
                      <div className="text-sm text-green-700">Available</div>
                    </div>
                    <div className="bg-purple-50 p-4 rounded-lg border border-purple-200 text-center">
                      <div className="text-2xl font-bold text-purple-900">
                        {selectedTeam.uniforms?.inventory?.filter(u => u.assignedTo).length || 0}
                      </div>
                      <div className="text-sm text-purple-700">Assigned</div>
                    </div>
                    <div className="bg-red-50 p-4 rounded-lg border border-red-200 text-center">
                      <div className="text-2xl font-bold text-red-900">
                        {selectedTeam.uniforms?.inventory?.filter(u => u.condition === 'Needs Replacement').length || 0}
                      </div>
                      <div className="text-sm text-red-700">Needs Replacement</div>
                    </div>
                  </div>

                  {/* Uniform Inventory Table */}
                  {selectedTeam.uniforms?.inventory && selectedTeam.uniforms.inventory.length > 0 ? (
                    <div className="bg-white rounded-lg border">
                      <div className="overflow-x-auto">
                        <table className="w-full">
                          <thead className="bg-gray-50">
                            <tr>
                              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Number</th>
                              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Size</th>
                              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Condition</th>
                              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Assigned To</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-200">
                            {selectedTeam.uniforms.inventory.map((uniform) => (
                              <tr key={uniform.id} className="hover:bg-gray-50">
                                <td className="px-4 py-3">
                                  <span className={`px-2 py-1 text-xs rounded ${
                                    uniform.type === 'Home' ? 'bg-blue-100 text-blue-800' :
                                    uniform.type === 'Away' ? 'bg-green-100 text-green-800' :
                                    uniform.type === 'Training' ? 'bg-purple-100 text-purple-800' :
                                    uniform.type === 'Goalkeeper' ? 'bg-orange-100 text-orange-800' :
                                    'bg-gray-100 text-gray-800'
                                  }`}>
                                    {uniform.type}
                                  </span>
                                </td>
                                <td className="px-4 py-3 font-semibold text-gray-900">#{uniform.number}</td>
                                <td className="px-4 py-3 text-sm text-gray-600">{uniform.size}</td>
                                <td className="px-4 py-3">
                                  <span className={`px-2 py-1 text-xs rounded ${
                                    uniform.condition === 'New' || uniform.condition === 'Excellent' ? 'bg-green-100 text-green-800' :
                                    uniform.condition === 'Good' ? 'bg-blue-100 text-blue-800' :
                                    uniform.condition === 'Fair' ? 'bg-yellow-100 text-yellow-800' :
                                    'bg-red-100 text-red-800'
                                  }`}>
                                    {uniform.condition}
                                  </span>
                                </td>
                                <td className="px-4 py-3">
                                  <span className={`px-2 py-1 text-xs rounded ${
                                    uniform.assignedTo ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'
                                  }`}>
                                    {uniform.assignedTo ? 'Assigned' : 'Available'}
                                  </span>
                                </td>
                                <td className="px-4 py-3 text-sm text-gray-900">
                                  {uniform.assignedTo || (
                                    <span className="text-gray-400 italic">Unassigned</span>
                                  )}
                                  {uniform.assignedDate && (
                                    <div className="text-xs text-gray-500">
                                      Since: {new Date(uniform.assignedDate).toLocaleDateString()}
                                    </div>
                                  )}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-12 bg-gray-50 rounded-lg border">
                      <div className="text-6xl mb-4">👕</div>
                      <p className="text-gray-600 mb-2">No uniforms in inventory</p>
                      <p className="text-sm text-gray-500">Edit the team to add uniforms</p>
                    </div>
                  )}
                </div>
              )}
              
              <div className="mt-6 flex gap-4">
                <button
                  onClick={() => {
                    setSelectedTeam(null);
                    handleEdit(selectedTeam);
                  }}
                  className="flex-1 bg-green-600 text-white py-2 px-4 rounded font-semibold hover:bg-green-700 transition-colors"
                >
                  Edit Team
                </button>
                <button
                  onClick={() => setSelectedTeam(null)}
                  className="flex-1 bg-gray-600 text-white py-2 px-4 rounded font-semibold hover:bg-gray-700 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 
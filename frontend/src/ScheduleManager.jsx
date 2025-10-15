import { useEffect, useState } from "react";
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';

const API_URL = "http://localhost:5000/api/schedules";

const TEAMS = [
  "U8 Leopards", "U10 Tigers", "U12 Lions", "U14 Panthers", "U16 Warriors", 
  "U18 Elite", "Adult Leopards", "Women's Team", "Coed Team"
];

const EVENT_TYPES = [
  "Practice", "Game", "Tournament", "Tryout", "Meeting", "Training", 
  "Scrimmage", "Friendly Match", "Championship", "Workshop"
];

const LOCATIONS = [
  "Main Field", "Practice Field 1", "Practice Field 2", "Indoor Facility", 
  "Away Field", "Tournament Venue", "Community Center", "High School Field"
];

const DAYS_OF_WEEK = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

export default function ScheduleManager() {
  const navigate = useNavigate();
  const [schedules, setSchedules] = useState([]);
  const [form, setForm] = useState({
    title: "",
    eventType: "Practice",
    team: "",
    location: "",
    startDate: "",
    startTime: "",
    endTime: "",
    description: "",
    isRecurring: false,
    recurringDays: [],
    recurringEndDate: "",
    maxParticipants: "",
    isPublic: true,
    requiresRegistration: false,
    coach: "",
    notes: "",
    weatherDependent: false,
    equipment: "",
    cost: "",
    contactInfo: ""
  });
  const [editing, setEditing] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState({
    team: "",
    eventType: "",
    dateFrom: "",
    dateTo: "",
    location: ""
  });
  const [viewMode, setViewMode] = useState("list"); // list, timeline
  const [bulkActions, setBulkActions] = useState([]);
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [stats, setStats] = useState({
    total: 0,
    thisWeek: 0,
    thisMonth: 0,
    upcoming: 0
  });

  // Fallback: If viewMode is not valid, force it to 'list'
  if (viewMode !== "list" && viewMode !== "timeline") {
    setViewMode("list");
  }

  const fetchSchedules = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setError("Authentication required. Please log in again.");
        setLoading(false);
        return;
      }

      let url = API_URL + "?";
      if (filter.team) url += `team=${filter.team}&`;
      if (filter.eventType) url += `eventType=${filter.eventType}&`;
      if (filter.dateFrom) url += `dateFrom=${filter.dateFrom}&`;
      if (filter.dateTo) url += `dateTo=${filter.dateTo}&`;
      if (filter.location) url += `location=${filter.location}&`;
      
      const res = await fetch(url, {
        headers: { "Authorization": `Bearer ${token}` }
      });
      
      if (!res.ok) {
        if (res.status === 401) {
          setError("Authentication failed. Please log in again.");
          setLoading(false);
          return;
        }
        throw new Error("Failed to fetch schedules");
      }
      
      const data = await res.json();

      // Handle backend response format - it returns { schedules: [...], pagination: {...} }
      const schedulesArray = data.schedules || data;
      
      if (!Array.isArray(schedulesArray)) {
        throw new Error(
          typeof data === "object" && data !== null && data.error
            ? data.error
            : "Unexpected response from server. Please check the backend API."
        );
      }

      setSchedules(schedulesArray);
      
      // Calculate stats
      const now = new Date();
      const thisWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
      const thisMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
      
      setStats({
        total: schedulesArray.length,
        thisWeek: schedulesArray.filter(s => new Date(s.startDate) <= thisWeek).length,
        thisMonth: schedulesArray.filter(s => new Date(s.startDate) <= thisMonth).length,
        upcoming: schedulesArray.filter(s => new Date(s.startDate) > now).length
      });
    } catch (err) {
      toast.error("Failed to load schedules");
      setError("Error: " + err.message);
    }
    setLoading(false);
  };

  useEffect(() => { 
    const token = localStorage.getItem("token");
    if (!token) {
      setError("Authentication required. Please log in again.");
      return;
    }
    fetchSchedules(); 
  }, [filter]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm(prev => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
  };

  const handleRecurringDayChange = (day) => {
    setForm(prev => ({
      ...prev,
      recurringDays: prev.recurringDays.includes(day)
        ? prev.recurringDays.filter(d => d !== day)
        : [...prev.recurringDays, day]
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    
    if (form.isRecurring && form.recurringDays.length === 0) {
      setError("Please select at least one day for recurring events");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setError("Authentication required. Please log in again.");
        return;
      }

      const payload = {
        ...form,
        maxParticipants: form.maxParticipants ? parseInt(form.maxParticipants) : null,
        cost: form.cost ? parseFloat(form.cost) : null
      };

      const res = await fetch(editing ? `${API_URL}/${editing}` : API_URL, {
        method: editing ? "PUT" : "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(payload),
      });
      
      if (!res.ok) {
        if (res.status === 401) {
          setError("Authentication failed. Please log in again.");
          return;
        }
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to save schedule");
      }
      
      toast.success(editing ? "Schedule updated successfully!" : "Schedule created successfully!");
      resetForm();
      fetchSchedules();
    } catch (err) {
      toast.error(err.message);
      setError(err.message);
    }
  };

  const resetForm = () => {
    setForm({
      title: "",
      eventType: "Practice",
      team: "",
      location: "",
      startDate: "",
      startTime: "",
      endTime: "",
      description: "",
      isRecurring: false,
      recurringDays: [],
      recurringEndDate: "",
      maxParticipants: "",
      isPublic: true,
      requiresRegistration: false,
      coach: "",
      notes: "",
      weatherDependent: false,
      equipment: "",
      cost: "",
      contactInfo: ""
    });
    setEditing(null);
  };

  const handleEdit = (schedule) => {
    setForm({
      title: schedule.title,
      eventType: schedule.eventType,
      team: schedule.team,
      location: schedule.location,
      startDate: schedule.startDate,
      startTime: schedule.startTime,
      endTime: schedule.endTime,
      description: schedule.description || "",
      isRecurring: schedule.isRecurring || false,
      recurringDays: schedule.recurringDays || [],
      recurringEndDate: schedule.recurringEndDate || "",
      maxParticipants: schedule.maxParticipants?.toString() || "",
      isPublic: schedule.isPublic !== false,
      requiresRegistration: schedule.requiresRegistration || false,
      coach: schedule.coach || "",
      notes: schedule.notes || "",
      weatherDependent: schedule.weatherDependent || false,
      equipment: schedule.equipment || "",
      cost: schedule.cost?.toString() || "",
      contactInfo: schedule.contactInfo || ""
    });
    setEditing(schedule._id);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this schedule?")) return;
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setError("Authentication required. Please log in again.");
        return;
      }

      const res = await fetch(`${API_URL}/${id}`, { 
        method: "DELETE",
        headers: { "Authorization": `Bearer ${token}` }
      });
      
      if (!res.ok) {
        if (res.status === 401) {
          setError("Authentication failed. Please log in again.");
          return;
        }
        throw new Error("Failed to delete schedule");
      }
      
      toast.success("Schedule deleted successfully!");
      fetchSchedules();
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleBulkAction = async (action) => {
    if (bulkActions.length === 0) {
      toast.warning("Please select schedules to perform bulk actions");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setError("Authentication required. Please log in again.");
        return;
      }

      const res = await fetch(`${API_URL}/bulk`, {
        method: "PUT",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ ids: bulkActions, action })
      });
      
      if (!res.ok) {
        if (res.status === 401) {
          setError("Authentication failed. Please log in again.");
          return;
        }
        throw new Error("Failed to perform bulk action");
      }
      
      toast.success(`Bulk ${action} completed successfully!`);
      setBulkActions([]);
      setShowBulkModal(false);
      fetchSchedules();
    } catch (err) {
      toast.error(err.message);
    }
  };

  const exportSchedules = () => {
    const csv = [
      ["Title", "Event Type", "Team", "Location", "Date", "Time", "Description", "Coach", "Cost"],
      ...schedules.map(s => [
        s.title,
        s.eventType,
        s.team,
        s.location,
        s.startDate,
        `${s.startTime} - ${s.endTime}`,
        s.description || "",
        s.coach || "",
        s.cost || ""
      ])
    ].map(row => row.map(cell => `"${cell}"`).join(",")).join("\n");

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'schedules.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  const getEventTypeColor = (type) => {
    const colors = {
      Practice: "bg-blue-100 text-blue-800",
      Game: "bg-green-100 text-green-800",
      Tournament: "bg-purple-100 text-purple-800",
      Tryout: "bg-yellow-100 text-yellow-800",
      Meeting: "bg-gray-100 text-gray-800",
      Training: "bg-indigo-100 text-indigo-800",
      Scrimmage: "bg-orange-100 text-orange-800",
      "Friendly Match": "bg-pink-100 text-pink-800",
      Championship: "bg-red-100 text-red-800",
      Workshop: "bg-teal-100 text-teal-800"
    };
    return colors[type] || "bg-gray-100 text-gray-800";
  };

  const formatDateTime = (date, time) => {
    const d = new Date(date);
    return `${d.toLocaleDateString()} at ${time}`;
  };

  // Now we can have early returns after all hooks are called
  if (error) {
    return (
      <div className="p-8 text-red-600 font-bold text-center">
        Error: {error}
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6 bg-white rounded shadow mt-8">
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
          <h2 className="text-2xl font-bold text-green-900">Schedule Manager</h2>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={() => setViewMode("list")} 
            className={`px-3 py-1 rounded ${viewMode === "list" ? "bg-green-700 text-white" : "bg-gray-200"}`}
          >
            List
          </button>
          <button 
            onClick={() => setViewMode("timeline")} 
            className={`px-3 py-1 rounded ${viewMode === "timeline" ? "bg-green-700 text-white" : "bg-gray-200"}`}
          >
            Timeline
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-blue-50 p-4 rounded-lg text-center">
          <div className="text-2xl font-bold text-blue-900">{stats.total}</div>
          <div className="text-sm text-blue-700">Total Events</div>
        </div>
        <div className="bg-green-50 p-4 rounded-lg text-center">
          <div className="text-2xl font-bold text-green-900">{stats.thisWeek}</div>
          <div className="text-sm text-green-700">This Week</div>
        </div>
        <div className="bg-yellow-50 p-4 rounded-lg text-center">
          <div className="text-2xl font-bold text-yellow-900">{stats.thisMonth}</div>
          <div className="text-sm text-yellow-700">This Month</div>
        </div>
        <div className="bg-purple-50 p-4 rounded-lg text-center">
          <div className="text-2xl font-bold text-purple-900">{stats.upcoming}</div>
          <div className="text-sm text-purple-700">Upcoming</div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-gray-50 p-4 rounded-lg mb-6">
        <h3 className="font-semibold mb-3">Filters</h3>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <select 
            value={filter.team} 
            onChange={e => setFilter(f => ({ ...f, team: e.target.value }))}
            className="border rounded px-3 py-2"
          >
            <option value="">All Teams</option>
            {TEAMS.map(team => <option key={team} value={team}>{team}</option>)}
          </select>
          <select 
            value={filter.eventType} 
            onChange={e => setFilter(f => ({ ...f, eventType: e.target.value }))}
            className="border rounded px-3 py-2"
          >
            <option value="">All Event Types</option>
            {EVENT_TYPES.map(type => <option key={type} value={type}>{type}</option>)}
          </select>
          <input 
            type="date" 
            value={filter.dateFrom} 
            onChange={e => setFilter(f => ({ ...f, dateFrom: e.target.value }))}
            placeholder="From Date"
            className="border rounded px-3 py-2"
          />
          <input 
            type="date" 
            value={filter.dateTo} 
            onChange={e => setFilter(f => ({ ...f, dateTo: e.target.value }))}
            placeholder="To Date"
            className="border rounded px-3 py-2"
          />
          <select 
            value={filter.location} 
            onChange={e => setFilter(f => ({ ...f, location: e.target.value }))}
            className="border rounded px-3 py-2"
          >
            <option value="">All Locations</option>
            {LOCATIONS.map(loc => <option key={loc} value={loc}>{loc}</option>)}
          </select>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-4 mb-6">
        <button 
          onClick={() => setShowBulkModal(true)}
          disabled={bulkActions.length === 0}
          className="bg-yellow-500 text-white px-4 py-2 rounded font-bold hover:bg-yellow-600 transition disabled:opacity-50"
        >
          Bulk Actions ({bulkActions.length})
        </button>
        <button 
          onClick={exportSchedules}
          className="bg-green-700 text-white px-4 py-2 rounded font-bold hover:bg-green-800 transition"
        >
          Export CSV
        </button>
      </div>

      {/* Divider Dash */}
      <div className="w-full flex items-center justify-center mb-6">
        <span className="block w-24 border-t-2 border-dashed border-gray-400"></span>
      </div>

      {/* Schedule Form */}
      <div className="bg-gray-50 p-6 rounded-lg mb-6">
        <h3 className="text-xl font-bold mb-4 text-green-900">
          {editing ? "Edit Schedule" : "Create New Schedule"}
        </h3>
        
        {/* Form Instructions */}
        <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mb-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-blue-700">
                <strong>Quick Guide:</strong> Fill in the basic event details below. For recurring events (like weekly practices), check "Recurring Event" and select the days.
              </p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Event Information */}
          <div>
            <h4 className="text-lg font-semibold text-gray-800 mb-3 border-b pb-2">Event Details</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Event Title *</label>
                <input 
                  name="title" 
                  value={form.title} 
                  onChange={handleChange} 
                  placeholder="e.g., U10 Practice Session" 
                  className="w-full border rounded px-3 py-2" 
                  required 
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Event Type *</label>
                <select 
                  name="eventType" 
                  value={form.eventType} 
                  onChange={handleChange} 
                  className="w-full border rounded px-3 py-2"
                  required
                >
                  {EVENT_TYPES.map(type => <option key={type} value={type}>{type}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Team *</label>
                <select 
                  name="team" 
                  value={form.team} 
                  onChange={handleChange} 
                  className="w-full border rounded px-3 py-2"
                  required
                >
                  <option value="">Select Team</option>
                  {TEAMS.map(team => <option key={team} value={team}>{team}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Location *</label>
                <select 
                  name="location" 
                  value={form.location} 
                  onChange={handleChange} 
                  className="w-full border rounded px-3 py-2"
                  required
                >
                  <option value="">Select Location</option>
                  {LOCATIONS.map(loc => <option key={loc} value={loc}>{loc}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Coach/Instructor</label>
                <input 
                  name="coach" 
                  value={form.coach} 
                  onChange={handleChange} 
                  placeholder="e.g., Coach Smith" 
                  className="w-full border rounded px-3 py-2" 
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Max Participants</label>
                <input 
                  name="maxParticipants" 
                  type="number" 
                  value={form.maxParticipants} 
                  onChange={handleChange} 
                  placeholder="e.g., 20" 
                  className="w-full border rounded px-3 py-2" 
                />
              </div>
            </div>
          </div>

          {/* Date & Time Section */}
          <div>
            <h4 className="text-lg font-semibold text-gray-800 mb-3 border-b pb-2">When & Where</h4>
            
            {/* Single Event vs Recurring */}
            <div className="mb-4">
              <label className="flex items-center gap-2 mb-3">
                <input 
                  type="checkbox" 
                  name="isRecurring" 
                  checked={form.isRecurring} 
                  onChange={handleChange} 
                />
                <span className="font-medium">This is a recurring event (e.g., weekly practice)</span>
              </label>
            </div>

            {!form.isRecurring ? (
              /* Single Event Date & Time */
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Event Date *</label>
                  <input 
                    name="startDate" 
                    type="date" 
                    value={form.startDate} 
                    onChange={handleChange} 
                    className="w-full border rounded px-3 py-2"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Start Time *</label>
                  <input 
                    name="startTime" 
                    type="time" 
                    value={form.startTime} 
                    onChange={handleChange} 
                    className="w-full border rounded px-3 py-2"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">End Time *</label>
                  <input 
                    name="endTime" 
                    type="time" 
                    value={form.endTime} 
                    onChange={handleChange} 
                    className="w-full border rounded px-3 py-2"
                    required
                  />
                </div>
              </div>
            ) : (
              /* Recurring Event Settings */
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Start Date *</label>
                    <input 
                      name="startDate" 
                      type="date" 
                      value={form.startDate} 
                      onChange={handleChange} 
                      className="w-full border rounded px-3 py-2"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Start Time *</label>
                    <input 
                      name="startTime" 
                      type="time" 
                      value={form.startTime} 
                      onChange={handleChange} 
                      className="w-full border rounded px-3 py-2"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">End Time *</label>
                    <input 
                      name="endTime" 
                      type="time" 
                      value={form.endTime} 
                      onChange={handleChange} 
                      className="w-full border rounded px-3 py-2"
                      required
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Repeat on these days *</label>
                  <div className="grid grid-cols-7 gap-2">
                    {DAYS_OF_WEEK.map(day => (
                      <label key={day} className="flex flex-col items-center p-2 border rounded hover:bg-gray-50 cursor-pointer">
                        <input 
                          type="checkbox" 
                          checked={form.recurringDays.includes(day)} 
                          onChange={() => handleRecurringDayChange(day)} 
                          className="mb-1"
                        />
                        <span className="text-xs font-medium">{day.slice(0, 3)}</span>
                      </label>
                    ))}
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">End Date (Optional)</label>
                  <input 
                    name="recurringEndDate" 
                    type="date" 
                    value={form.recurringEndDate} 
                    onChange={handleChange} 
                    placeholder="When to stop repeating" 
                    className="w-full border rounded px-3 py-2" 
                  />
                  <p className="text-xs text-gray-500 mt-1">Leave empty if no end date</p>
                </div>
              </div>
            )}
          </div>

          {/* Additional Information */}
          <div>
            <h4 className="text-lg font-semibold text-gray-800 mb-3 border-b pb-2">Additional Information</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Cost (Optional)</label>
                <div className="relative">
                  <span className="absolute left-3 top-2 text-gray-500">$</span>
                  <input 
                    name="cost" 
                    type="number" 
                    step="0.01" 
                    value={form.cost} 
                    onChange={handleChange} 
                    placeholder="0.00" 
                    className="w-full border rounded px-3 py-2 pl-8" 
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Required Equipment</label>
                <input 
                  name="equipment" 
                  value={form.equipment} 
                  onChange={handleChange} 
                  placeholder="e.g., Soccer ball, cleats" 
                  className="w-full border rounded px-3 py-2" 
                />
              </div>
            </div>
            
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Event Description</label>
              <textarea 
                name="description" 
                value={form.description} 
                onChange={handleChange} 
                placeholder="Describe what this event is about, what participants can expect..." 
                className="w-full border rounded px-3 py-2" 
                rows="3"
              />
            </div>
            
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Contact Information</label>
              <input 
                name="contactInfo" 
                value={form.contactInfo} 
                onChange={handleChange} 
                placeholder="Phone, email, or other contact details" 
                className="w-full border rounded px-3 py-2" 
              />
            </div>
            
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Additional Notes</label>
              <textarea 
                name="notes" 
                value={form.notes} 
                onChange={handleChange} 
                placeholder="Any special instructions, reminders, or notes..." 
                className="w-full border rounded px-3 py-2" 
                rows="2"
              />
            </div>
          </div>

          {/* Event Settings */}
          <div>
            <h4 className="text-lg font-semibold text-gray-800 mb-3 border-b pb-2">Event Settings</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <label className="flex items-center gap-2 p-3 border rounded hover:bg-gray-50 cursor-pointer">
                <input 
                  type="checkbox" 
                  name="isPublic" 
                  checked={form.isPublic} 
                  onChange={handleChange} 
                />
                <div>
                  <span className="font-medium">Public Event</span>
                  <p className="text-xs text-gray-500">Visible to everyone</p>
                </div>
              </label>
              <label className="flex items-center gap-2 p-3 border rounded hover:bg-gray-50 cursor-pointer">
                <input 
                  type="checkbox" 
                  name="requiresRegistration" 
                  checked={form.requiresRegistration} 
                  onChange={handleChange} 
                />
                <div>
                  <span className="font-medium">Requires Registration</span>
                  <p className="text-xs text-gray-500">Participants must sign up</p>
                </div>
              </label>
              <label className="flex items-center gap-2 p-3 border rounded hover:bg-gray-50 cursor-pointer">
                <input 
                  type="checkbox" 
                  name="weatherDependent" 
                  checked={form.weatherDependent} 
                  onChange={handleChange} 
                />
                <div>
                  <span className="font-medium">Weather Dependent</span>
                  <p className="text-xs text-gray-500">May be cancelled due to weather</p>
                </div>
              </label>
            </div>
          </div>

          {/* Submit Buttons */}
          <div className="flex gap-4 pt-4 border-t">
            <button 
              type="submit" 
              className="bg-green-700 text-white px-8 py-3 rounded-lg font-bold hover:bg-green-800 transition flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
              </svg>
              {editing ? "Update Schedule" : "Create Schedule"}
            </button>
            {editing && (
              <button 
                type="button" 
                onClick={resetForm}
                className="bg-gray-500 text-white px-8 py-3 rounded-lg font-bold hover:bg-gray-600 transition"
              >
                Cancel
              </button>
            )}
          </div>
        </form>
        {error && <div className="text-red-600 text-sm mt-4 p-3 bg-red-50 border border-red-200 rounded">{error}</div>}
      </div>

      {/* Schedules List */}
      {(viewMode === "list" || (viewMode !== "timeline" && viewMode !== "list")) && (
        <div className="overflow-x-auto">
          <table className="w-full border">
            <thead>
              <tr className="bg-green-100">
                <th className="p-3 text-left">
                  <input 
                    type="checkbox" 
                    onChange={e => {
                      if (e.target.checked) {
                        setBulkActions(schedules.map(s => s._id));
                      } else {
                        setBulkActions([]);
                      }
                    }}
                    checked={bulkActions.length === schedules.length && schedules.length > 0}
                  />
                </th>
                <th className="p-3 text-left">Title</th>
                <th className="p-3 text-left">Type</th>
                <th className="p-3 text-left">Team</th>
                <th className="p-3 text-left">Location</th>
                <th className="p-3 text-left">Date & Time</th>
                <th className="p-3 text-left">Coach</th>
                <th className="p-3 text-left">Status</th>
                <th className="p-3 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="9" className="p-4 text-center">Loading schedules...</td>
                </tr>
              ) : schedules.length === 0 ? (
                <tr>
                  <td colSpan="9" className="p-4 text-center text-gray-500">No schedules found</td>
                </tr>
              ) : (
                schedules.map(schedule => (
                  <tr key={schedule._id} className="border-t hover:bg-green-50">
                    <td className="p-3">
                      <input 
                        type="checkbox" 
                        checked={bulkActions.includes(schedule._id)}
                        onChange={e => {
                          if (e.target.checked) {
                            setBulkActions(prev => [...prev, schedule._id]);
                          } else {
                            setBulkActions(prev => prev.filter(id => id !== schedule._id));
                          }
                        }}
                      />
                    </td>
                    <td className="p-3 font-bold">{schedule.title}</td>
                    <td className="p-3">
                      <span className={`px-2 py-1 rounded text-xs font-semibold ${getEventTypeColor(schedule.eventType)}`}>
                        {schedule.eventType}
                      </span>
                    </td>
                    <td className="p-3">{schedule.team}</td>
                    <td className="p-3 text-sm">{schedule.location}</td>
                    <td className="p-3 text-sm">
                      {formatDateTime(schedule.startDate, schedule.startTime)}
                      {schedule.endTime && ` - ${schedule.endTime}`}
                    </td>
                    <td className="p-3 text-sm">{schedule.coach || "-"}</td>
                    <td className="p-3">
                      <span className={`px-2 py-1 rounded text-xs font-semibold ${
                        new Date(schedule.startDate) < new Date() 
                          ? "bg-gray-100 text-gray-800" 
                          : "bg-green-100 text-green-800"
                      }`}>
                        {new Date(schedule.startDate) < new Date() ? "Past" : "Upcoming"}
                      </span>
                    </td>
                    <td className="p-3">
                      <div className="flex gap-2">
                        <button 
                          onClick={() => handleEdit(schedule)}
                          className="text-blue-700 underline font-semibold text-sm"
                        >
                          Edit
                        </button>
                        <button 
                          onClick={() => handleDelete(schedule._id)}
                          className="text-red-700 underline font-semibold text-sm"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Timeline View */}
      {viewMode === "timeline" && (
        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="text-center mb-4">
            <h3 className="text-lg font-semibold">Timeline View</h3>
            <p className="text-sm text-gray-600">Timeline view coming soon...</p>
          </div>
        </div>
      )}

      {/* Bulk Actions Modal */}
      {showBulkModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-md w-full mx-4">
            <h3 className="text-lg font-bold mb-4">Bulk Actions</h3>
            <p className="mb-4">Selected {bulkActions.length} schedule(s)</p>
            <div className="flex flex-col gap-2">
              <button 
                onClick={() => handleBulkAction("delete")}
                className="bg-red-700 text-white px-4 py-2 rounded font-bold hover:bg-red-800 transition"
              >
                Delete Selected
              </button>
              <button 
                onClick={() => handleBulkAction("makePublic")}
                className="bg-green-700 text-white px-4 py-2 rounded font-bold hover:bg-green-800 transition"
              >
                Make Public
              </button>
              <button 
                onClick={() => handleBulkAction("makePrivate")}
                className="bg-gray-700 text-white px-4 py-2 rounded font-bold hover:bg-gray-600 transition"
              >
                Make Private
              </button>
              <button 
                onClick={() => setShowBulkModal(false)}
                className="bg-gray-500 text-white px-4 py-2 rounded font-bold hover:bg-gray-600 transition"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 
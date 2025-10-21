import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const SchedulingManager = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [schedules, setSchedules] = useState([]);
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [showScheduleForm, setShowScheduleForm] = useState(false);
  const [showResourceForm, setShowResourceForm] = useState(false);
  const [selectedSchedule, setSelectedSchedule] = useState(null);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [viewMode, setViewMode] = useState('week');
  const [filter, setFilter] = useState({
    search: '',
    type: 'all',
    resource: 'all',
    team: 'all',
    status: 'all'
  });

  const [scheduleData, setScheduleData] = useState({
    title: '',
    type: 'practice',
    team: '',
    date: '',
    startTime: '',
    endTime: '',
    duration: 90,
    resource: '',
    location: '',
    notes: '',
    recurring: false,
    recurringPattern: 'weekly',
    recurringEndDate: '',
    color: '#3B82F6',
    visibility: 'public',
    status: 'confirmed',
    reminders: [],
    participants: [],
    coach: '',
    conflicts: []
  });

  const [resourceData, setResourceData] = useState({
    name: '',
    type: 'field',
    capacity: 0,
    location: '',
    available: true,
    availableHours: {
      monday: { start: '08:00', end: '20:00', available: true },
      tuesday: { start: '08:00', end: '20:00', available: true },
      wednesday: { start: '08:00', end: '20:00', available: true },
      thursday: { start: '08:00', end: '20:00', available: true },
      friday: { start: '08:00', end: '20:00', available: true },
      saturday: { start: '08:00', end: '18:00', available: true },
      sunday: { start: '10:00', end: '16:00', available: true }
    },
    bookings: [],
    notes: ''
  });

  const scheduleTypes = [
    { id: 'practice', name: 'Practice', icon: '⚽', color: 'blue', visibility: 'both' },
    { id: 'match', name: 'Match/Game', icon: '🏆', color: 'green', visibility: 'public' },
    { id: 'training', name: 'Training Session', icon: '🎯', color: 'purple', visibility: 'both' },
    { id: 'event', name: 'Event', icon: '🎉', color: 'pink', visibility: 'public' },
    { id: 'meeting', name: 'Meeting', icon: '📋', color: 'orange', visibility: 'internal' },
    { id: 'tryout', name: 'Tryout', icon: '⚡', color: 'yellow', visibility: 'public' },
    { id: 'camp', name: 'Camp', icon: '⛺', color: 'teal', visibility: 'public' },
    { id: 'maintenance', name: 'Facility Maintenance', icon: '🔧', color: 'red', visibility: 'internal' },
    { id: 'other', name: 'Other', icon: '📅', color: 'gray', visibility: 'both' }
  ];

  const resourceTypes = [
    { id: 'field', name: 'Soccer Field', icon: '⚽', color: 'green' },
    { id: 'indoor', name: 'Indoor Facility', icon: '🏢', color: 'blue' },
    { id: 'gym', name: 'Gymnasium', icon: '💪', color: 'red' },
    { id: 'room', name: 'Meeting Room', icon: '🚪', color: 'purple' },
    { id: 'equipment', name: 'Equipment Set', icon: '📦', color: 'orange' },
    { id: 'vehicle', name: 'Club Vehicle', icon: '🚐', color: 'teal' }
  ];

  const visibilityOptions = [
    { id: 'public', name: 'Public', icon: '🌐', description: 'Visible on public calendar' },
    { id: 'members', name: 'Members Only', icon: '🔐', description: 'Members can view' },
    { id: 'internal', name: 'Internal', icon: '🏢', description: 'Staff and coaches only' }
  ];

  const tabs = [
    { id: 'overview', name: 'Overview', icon: '📊' },
    { id: 'calendar', name: 'Calendar View', icon: '📅' },
    { id: 'list', name: 'Schedule List', icon: '📋' },
    { id: 'resources', name: 'Resources', icon: '🏟️' },
    { id: 'conflicts', name: 'Conflicts', icon: '⚠️' }
  ];

  useEffect(() => {
    document.title = 'Scheduling & Calendar - Seattle Leopards FC Admin';
    loadSchedules();
    loadResources();
  }, []);

  const loadSchedules = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/schedules');
      if (response.ok) {
        const data = await response.json();
        setSchedules(data);
      }
    } catch (error) {
      console.error('Error loading schedules:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadResources = async () => {
    try {
      const response = await fetch('/api/resources');
      if (response.ok) {
        const data = await response.json();
        setResources(data);
      }
    } catch (error) {
      console.error('Error loading resources:', error);
    }
  };

  const saveSchedule = async () => {
    try {
      setLoading(true);
      const url = selectedSchedule ? `/api/schedules/${selectedSchedule._id}` : '/api/schedules';
      const method = selectedSchedule ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(scheduleData)
      });

      if (response.ok) {
        setMessage('Schedule saved successfully!');
        loadSchedules();
        setShowScheduleForm(false);
        resetScheduleData();
      } else {
        setMessage('Error saving schedule');
      }
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      console.error('Error saving schedule:', error);
      setMessage('Error saving schedule');
      setTimeout(() => setMessage(''), 3000);
    } finally {
      setLoading(false);
    }
  };

  const saveResource = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/resources', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(resourceData)
      });

      if (response.ok) {
        setMessage('Resource added successfully!');
        loadResources();
        setShowResourceForm(false);
      }
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      console.error('Error saving resource:', error);
    } finally {
      setLoading(false);
    }
  };

  const deleteSchedule = async (id) => {
    if (!confirm('Are you sure you want to delete this schedule?')) return;

    try {
      setLoading(true);
      const response = await fetch(`/api/schedules/${id}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        setMessage('Schedule deleted successfully!');
        loadSchedules();
      }
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      console.error('Error deleting schedule:', error);
    } finally {
      setLoading(false);
    }
  };

  const resetScheduleData = () => {
    setScheduleData({
      title: '',
      type: 'practice',
      team: '',
      date: '',
      startTime: '',
      endTime: '',
      duration: 90,
      resource: '',
      location: '',
      notes: '',
      recurring: false,
      recurringPattern: 'weekly',
      recurringEndDate: '',
      color: '#3B82F6',
      visibility: 'public',
      status: 'confirmed',
      reminders: [],
      participants: [],
      coach: '',
      conflicts: []
    });
    setSelectedSchedule(null);
  };

  const detectConflicts = (newSchedule) => {
    if (!Array.isArray(schedules)) return [];
    
    const conflicts = schedules.filter(existing => {
      if (existing._id === newSchedule._id) return false;
      if (existing.resource !== newSchedule.resource) return false;
      if (existing.date !== newSchedule.date) return false;
      
      const existingStart = new Date(`${existing.date}T${existing.startTime}`);
      const existingEnd = new Date(`${existing.date}T${existing.endTime}`);
      const newStart = new Date(`${newSchedule.date}T${newSchedule.startTime}`);
      const newEnd = new Date(`${newSchedule.date}T${newSchedule.endTime}`);
      
      return (newStart < existingEnd && newEnd > existingStart);
    });
    
    return conflicts;
  };

  const getFilteredSchedules = () => {
    // Ensure schedules is always an array
    let filtered = Array.isArray(schedules) ? schedules : [];

    if (filter.search) {
      filtered = filtered.filter(s =>
        s.title?.toLowerCase().includes(filter.search.toLowerCase()) ||
        s.team?.toLowerCase().includes(filter.search.toLowerCase()) ||
        s.location?.toLowerCase().includes(filter.search.toLowerCase())
      );
    }
    if (filter.type !== 'all') filtered = filtered.filter(s => s.type === filter.type);
    if (filter.resource !== 'all') filtered = filtered.filter(s => s.resource === filter.resource);
    if (filter.team !== 'all') filtered = filtered.filter(s => s.team === filter.team);
    if (filter.status !== 'all') filtered = filtered.filter(s => s.status === filter.status);

    return filtered.sort((a, b) => new Date(`${a.date}T${a.startTime}`) - new Date(`${b.date}T${b.startTime}`));
  };

  const filteredSchedules = getFilteredSchedules();

  const stats = {
    total: Array.isArray(schedules) ? schedules.length : 0,
    thisWeek: Array.isArray(schedules) ? schedules.filter(s => {
      const weekStart = new Date();
      weekStart.setDate(weekStart.getDate() - weekStart.getDay());
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekEnd.getDate() + 7);
      const scheduleDate = new Date(s.date);
      return scheduleDate >= weekStart && scheduleDate <= weekEnd;
    }).length : 0,
    today: Array.isArray(schedules) ? schedules.filter(s => {
      const today = new Date().toDateString();
      return new Date(s.date).toDateString() === today;
    }).length : 0,
    upcoming: Array.isArray(schedules) ? schedules.filter(s => new Date(s.date) >= new Date()).length : 0,
    byType: scheduleTypes.map(type => ({
      ...type,
      count: Array.isArray(schedules) ? schedules.filter(s => s.type === type.id).length : 0,
      publicCount: Array.isArray(schedules) ? schedules.filter(s => s.type === type.id && s.visibility === 'public').length : 0,
      internalCount: Array.isArray(schedules) ? schedules.filter(s => s.type === type.id && s.visibility === 'internal').length : 0
    })),
    publicSchedules: Array.isArray(schedules) ? schedules.filter(s => s.visibility === 'public').length : 0,
    internalSchedules: Array.isArray(schedules) ? schedules.filter(s => s.visibility === 'internal').length : 0,
    conflicts: Array.isArray(schedules) ? schedules.filter(s => s.conflicts && s.conflicts.length > 0).length : 0,
    resources: Array.isArray(resources) ? resources.length : 0,
    resourceUtilization: (Array.isArray(resources) && resources.length > 0 && Array.isArray(schedules))
      ? ((schedules.length / (resources.length * 30)) * 100).toFixed(1) 
      : 0
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Scheduling & Calendar Management</h1>
              <p className="mt-1 text-sm text-gray-500">
                Master calendar for all club activities - public schedules and internal coordination
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
                  setShowResourceForm(true);
                }}
                className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 transition-colors"
              >
                <i className="bi bi-plus-lg me-2"></i>Add Resource
              </button>
              <button
                onClick={() => {
                  resetScheduleData();
                  setShowScheduleForm(true);
                }}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                <i className="bi bi-plus-lg me-2"></i>Schedule Activity
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
                  {tab.id === 'conflicts' && stats.conflicts > 0 && (
                    <span className="ml-2 bg-red-100 text-red-800 px-2 py-0.5 rounded-full text-xs">
                      {stats.conflicts}
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
            {/* Statistics Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white p-6 rounded-lg shadow-sm border">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-3xl font-bold text-blue-900">{stats.total}</div>
                    <div className="text-sm text-blue-700 mt-1">Total Schedules</div>
                  </div>
                  <div className="text-4xl">📅</div>
                </div>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-sm border">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-3xl font-bold text-green-900">{stats.today}</div>
                    <div className="text-sm text-green-700 mt-1">Today</div>
                  </div>
                  <div className="text-4xl">📆</div>
                </div>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-sm border">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-3xl font-bold text-purple-900">{stats.thisWeek}</div>
                    <div className="text-sm text-purple-700 mt-1">This Week</div>
                  </div>
                  <div className="text-4xl">📊</div>
                </div>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-sm border border-red-300">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-3xl font-bold text-red-900">{stats.conflicts}</div>
                    <div className="text-sm text-red-700 mt-1">Conflicts</div>
                  </div>
                  <div className="text-4xl">⚠️</div>
                </div>
              </div>
            </div>

            {/* Public vs Internal Split */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-lg border border-blue-200">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-3xl">🌐</span>
                  <div className="text-right">
                    <div className="text-3xl font-bold text-blue-900">{stats.publicSchedules}</div>
                    <div className="text-sm text-blue-700">Public Schedules</div>
                  </div>
                </div>
                <p className="text-sm text-blue-700">
                  Visible on public calendar - practices, matches, events
                </p>
              </div>
              <div className="bg-gradient-to-br from-gray-50 to-gray-100 p-6 rounded-lg border border-gray-200">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-3xl">🏢</span>
                  <div className="text-right">
                    <div className="text-3xl font-bold text-gray-900">{stats.internalSchedules}</div>
                    <div className="text-sm text-gray-700">Internal Schedules</div>
                  </div>
                </div>
                <p className="text-sm text-gray-700">
                  Staff only - meetings, planning, internal coordination
                </p>
              </div>
            </div>

            {/* Resource Stats */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white p-6 rounded-lg shadow-sm border">
                <div className="text-2xl font-bold text-teal-900">{stats.resources}</div>
                <div className="text-sm text-teal-700 mt-1">Available Resources</div>
                <div className="text-xs text-gray-500 mt-2">Fields, facilities, equipment</div>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-sm border">
                <div className="text-2xl font-bold text-indigo-900">{stats.resourceUtilization}%</div>
                <div className="text-sm text-indigo-700 mt-1">Resource Utilization</div>
                <div className="text-xs text-gray-500 mt-2">Based on bookings vs capacity</div>
              </div>
            </div>

            {/* Schedule Types Grid */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Activities by Type</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {stats.byType.map((type) => (
                  <div
                    key={type.id}
                    className="bg-gradient-to-br from-gray-50 to-white p-4 rounded-lg border hover:shadow-lg transition-all cursor-pointer"
                    onClick={() => {
                      setFilter(f => ({ ...f, type: type.id }));
                      setActiveTab('list');
                    }}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-2xl">{type.icon}</span>
                      <div className="text-2xl font-bold text-gray-800">{type.count}</div>
                    </div>
                    <h3 className="font-semibold text-gray-900 text-sm mb-1">{type.name}</h3>
                    <div className="flex gap-2 text-xs mt-2">
                      {type.visibility === 'both' && (
                        <>
                          <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded">
                            🌐 {type.publicCount}
                          </span>
                          <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded">
                            🔒 {type.internalCount}
                          </span>
                        </>
                      )}
                      {type.visibility === 'public' && (
                        <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded">
                          🌐 Public
                        </span>
                      )}
                      {type.visibility === 'internal' && (
                        <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded">
                          🔒 Internal
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* What is Scheduling Management */}
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">📅 What is Scheduling Management?</h2>
              <p className="text-gray-700 mb-4">
                Scheduling Management is your club's **Master Calendar System** that coordinates ALL activities - both 
                public-facing schedules (visible to parents and players) and internal operations (staff-only). It prevents 
                conflicts, manages resources, and keeps everyone synchronized.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
                <div className="bg-white p-4 rounded-lg border-2 border-blue-200">
                  <h3 className="font-semibold text-blue-900 mb-3 flex items-center gap-2">
                    <span className="text-2xl">🌐</span> PUBLIC SCHEDULES
                  </h3>
                  <p className="text-sm text-blue-700 mb-3 font-medium">
                    Visible on your website calendar for parents and players:
                  </p>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Team practice schedules</li>
                    <li>• Match/game schedules</li>
                    <li>• Training session times</li>
                    <li>• Public events (tryouts, camps)</li>
                    <li>• Tournament schedules</li>
                    <li>• Clinic and workshop times</li>
                  </ul>
                  <div className="mt-3 p-2 bg-blue-50 rounded text-xs text-blue-800">
                    <strong>Purpose:</strong> Keep families informed about team activities
                  </div>
                </div>
                
                <div className="bg-white p-4 rounded-lg border-2 border-gray-300">
                  <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <span className="text-2xl">🏢</span> INTERNAL SCHEDULES
                  </h3>
                  <p className="text-sm text-gray-700 mb-3 font-medium">
                    Private schedules for staff, coaches, and volunteers:
                  </p>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Board meetings</li>
                    <li>• Coach planning meetings</li>
                    <li>• Staff training sessions</li>
                    <li>• Volunteer coordination</li>
                    <li>• Facility maintenance windows</li>
                    <li>• Administrative meetings</li>
                  </ul>
                  <div className="mt-3 p-2 bg-gray-100 rounded text-xs text-gray-800">
                    <strong>Purpose:</strong> Internal coordination and operations
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-white p-4 rounded-lg border">
                  <h3 className="font-semibold text-gray-900 mb-2">🏟️ Resource Management</h3>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Field and facility booking</li>
                    <li>• Equipment reservation</li>
                    <li>• Venue availability tracking</li>
                    <li>• Conflict detection</li>
                  </ul>
                </div>
                <div className="bg-white p-4 rounded-lg border">
                  <h3 className="font-semibold text-gray-900 mb-2">⚠️ Conflict Prevention</h3>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Automatic conflict detection</li>
                    <li>• Double-booking prevention</li>
                    <li>• Resource availability checks</li>
                    <li>• Conflict resolution tools</li>
                  </ul>
                </div>
                <div className="bg-white p-4 rounded-lg border">
                  <h3 className="font-semibold text-gray-900 mb-2">🔔 Notifications</h3>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Schedule change alerts</li>
                    <li>• Reminder notifications</li>
                    <li>• Conflict warnings</li>
                    <li>• Automated emails</li>
                  </ul>
                </div>
                <div className="bg-white p-4 rounded-lg border">
                  <h3 className="font-semibold text-gray-900 mb-2">🔄 Recurring Events</h3>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Weekly practice schedules</li>
                    <li>• Recurring meetings</li>
                    <li>• Season-long planning</li>
                    <li>• Pattern-based scheduling</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Calendar View Tab */}
        {activeTab === 'calendar' && (
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">Calendar View</h2>
              <div className="flex gap-2">
                <button
                  onClick={() => setViewMode('day')}
                  className={`px-4 py-2 rounded ${viewMode === 'day' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700'}`}
                >
                  Day
                </button>
                <button
                  onClick={() => setViewMode('week')}
                  className={`px-4 py-2 rounded ${viewMode === 'week' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700'}`}
                >
                  Week
                </button>
                <button
                  onClick={() => setViewMode('month')}
                  className={`px-4 py-2 rounded ${viewMode === 'month' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700'}`}
                >
                  Month
                </button>
              </div>
            </div>

            <div className="text-center py-12 bg-gray-50 rounded-lg">
              <div className="text-6xl mb-4">📅</div>
              <p className="text-gray-600 mb-2">Interactive Calendar View</p>
              <p className="text-sm text-gray-500">
                Visual calendar with drag-and-drop scheduling coming soon
              </p>
            </div>
          </div>
        )}

        {/* Schedule List Tab */}
        {activeTab === 'list' && (
          <div className="space-y-6">
            {/* Filters */}
            <div className="bg-white rounded-lg shadow-sm border p-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                <input
                  type="text"
                  placeholder="Search schedules..."
                  value={filter.search}
                  onChange={(e) => setFilter(f => ({ ...f, search: e.target.value }))}
                  className="border rounded px-3 py-2"
                />
                <select
                  value={filter.type}
                  onChange={(e) => setFilter(f => ({ ...f, type: e.target.value }))}
                  className="border rounded px-3 py-2"
                >
                  <option value="all">All Types</option>
                  {scheduleTypes.map(type => (
                    <option key={type.id} value={type.id}>{type.icon} {type.name}</option>
                  ))}
                </select>
                <select
                  value={filter.resource}
                  onChange={(e) => setFilter(f => ({ ...f, resource: e.target.value }))}
                  className="border rounded px-3 py-2"
                >
                  <option value="all">All Resources</option>
                  {Array.isArray(resources) && resources.map(res => (
                    <option key={res._id} value={res._id}>{res.name}</option>
                  ))}
                </select>
                <select
                  value={filter.status}
                  onChange={(e) => setFilter(f => ({ ...f, status: e.target.value }))}
                  className="border rounded px-3 py-2"
                >
                  <option value="all">All Status</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="tentative">Tentative</option>
                  <option value="cancelled">Cancelled</option>
                </select>
                <button
                  onClick={() => setFilter({
                    search: '',
                    type: 'all',
                    resource: 'all',
                    team: 'all',
                    status: 'all'
                  })}
                  className="text-sm text-blue-600 hover:text-blue-800"
                >
                  Clear Filters
                </button>
              </div>
              <div className="mt-4 text-sm text-gray-600">
                Showing {filteredSchedules.length} of {schedules.length} schedules
              </div>
            </div>

            {/* Schedule List */}
            <div className="space-y-3">
              {filteredSchedules.length === 0 ? (
                <div className="bg-white rounded-lg shadow-sm border p-12 text-center">
                  <div className="text-6xl mb-4">📅</div>
                  <p className="text-lg font-semibold mb-2 text-gray-900">No schedules found</p>
                  <p className="text-sm text-gray-600 mb-4">Create your first scheduled activity</p>
                  <button
                    onClick={() => {
                      resetScheduleData();
                      setShowScheduleForm(true);
                    }}
                    className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
                  >
                    Schedule Activity
                  </button>
                </div>
              ) : (
                filteredSchedules.map((schedule) => {
                  const scheduleType = scheduleTypes.find(t => t.id === schedule.type);
                  const conflicts = detectConflicts(schedule);
                  
                  return (
                    <div key={schedule._id} className="bg-white rounded-lg shadow-sm border p-4 hover:shadow-md transition-shadow">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <div
                              className="w-1 h-16 rounded"
                              style={{ backgroundColor: schedule.color || '#3B82F6' }}
                            ></div>
                            <div className="flex-1">
                              <h3 className="text-lg font-bold text-gray-900">{schedule.title}</h3>
                              <div className="flex items-center gap-3 flex-wrap mt-1">
                                <span className={`px-2 py-1 text-xs rounded-full bg-${scheduleType?.color}-100 text-${scheduleType?.color}-800`}>
                                  {scheduleType?.icon} {scheduleType?.name}
                                </span>
                                <span className={`px-2 py-1 text-xs rounded-full ${
                                  schedule.visibility === 'public' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'
                                }`}>
                                  {visibilityOptions.find(v => v.id === schedule.visibility)?.icon} {visibilityOptions.find(v => v.id === schedule.visibility)?.name}
                                </span>
                                {conflicts.length > 0 && (
                                  <span className="px-2 py-1 text-xs rounded-full bg-red-100 text-red-800">
                                    ⚠️ {conflicts.length} conflict(s)
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="text-right text-sm">
                          <div className="font-semibold text-gray-900">
                            {new Date(schedule.date).toLocaleDateString()}
                          </div>
                          <div className="text-gray-600">
                            {schedule.startTime} - {schedule.endTime}
                          </div>
                          <div className="text-xs text-gray-500">{schedule.duration} min</div>
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-4 mt-3 text-sm">
                        <div>
                          <span className="text-gray-600">Team:</span>
                          <span className="ml-1 font-semibold text-gray-900">{schedule.team}</span>
                        </div>
                        <div>
                          <span className="text-gray-600">Location:</span>
                          <span className="ml-1 font-semibold text-gray-900">{schedule.location}</span>
                        </div>
                        <div>
                          <span className="text-gray-600">Coach:</span>
                          <span className="ml-1 font-semibold text-gray-900">{schedule.coach || 'TBD'}</span>
                        </div>
                      </div>

                      <div className="flex gap-2 mt-4 border-t pt-3">
                        <button
                          onClick={() => {
                            setSelectedSchedule(schedule);
                            setScheduleData(schedule);
                            setShowScheduleForm(true);
                          }}
                          className="flex-1 bg-blue-50 text-blue-600 px-3 py-2 rounded hover:bg-blue-100 text-sm"
                        >
                          <i className="bi bi-pencil me-1"></i>Edit
                        </button>
                        <button
                          onClick={() => deleteSchedule(schedule._id)}
                          className="bg-red-50 text-red-600 px-3 py-2 rounded hover:bg-red-100 text-sm"
                        >
                          <i className="bi bi-trash"></i>
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}

        {/* Resources Tab */}
        {activeTab === 'resources' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {!Array.isArray(resources) || resources.length === 0 ? (
                <div className="col-span-full bg-white rounded-lg shadow-sm border p-12 text-center">
                  <div className="text-6xl mb-4">🏟️</div>
                  <p className="text-lg font-semibold mb-2 text-gray-900">No resources added</p>
                  <p className="text-sm text-gray-600 mb-4">Add fields, facilities, and equipment to manage bookings</p>
                  <button
                    onClick={() => setShowResourceForm(true)}
                    className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700"
                  >
                    Add Resource
                  </button>
                </div>
              ) : (
                (Array.isArray(resources) ? resources : []).map((resource) => {
                  const resourceType = resourceTypes.find(t => t.id === resource.type);
                  const bookings = Array.isArray(schedules) ? schedules.filter(s => s.resource === resource._id).length : 0;
                  
                  return (
                    <div key={resource._id} className="bg-white rounded-lg shadow-sm border p-6 hover:shadow-md transition-shadow">
                      <div className="flex items-center gap-3 mb-4">
                        <div className={`w-12 h-12 rounded-lg bg-${resourceType?.color}-100 flex items-center justify-center text-2xl`}>
                          {resourceType?.icon}
                        </div>
                        <div className="flex-1">
                          <h3 className="font-bold text-gray-900">{resource.name}</h3>
                          <p className="text-sm text-gray-600">{resourceType?.name}</p>
                        </div>
                      </div>

                      <div className="space-y-2 text-sm mb-4">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Capacity:</span>
                          <span className="font-semibold">{resource.capacity || 'Unlimited'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Bookings:</span>
                          <span className="font-semibold text-blue-600">{bookings}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Status:</span>
                          <span className={`px-2 py-1 text-xs rounded ${
                            resource.available ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                          }`}>
                            {resource.available ? 'Available' : 'Unavailable'}
                          </span>
                        </div>
                      </div>

                      {resource.location && (
                        <div className="text-sm text-gray-600 mb-4">
                          <i className="bi bi-geo-alt me-1"></i>
                          {resource.location}
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}

        {/* Conflicts Tab */}
        {activeTab === 'conflicts' && (
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              Schedule Conflicts ({stats.conflicts})
            </h2>
            {stats.conflicts === 0 ? (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">✅</div>
                <p className="text-lg font-semibold text-green-900 mb-2">No Conflicts Detected</p>
                <p className="text-sm text-gray-600">All schedules are properly coordinated</p>
              </div>
            ) : (
              <div className="space-y-4">
                {(Array.isArray(schedules) ? schedules : []).filter(s => detectConflicts(s).length > 0).map((schedule) => {
                  const conflicts = detectConflicts(schedule);
                  return (
                    <div key={schedule._id} className="bg-red-50 border border-red-200 rounded-lg p-4">
                      <h3 className="font-semibold text-red-900 mb-2">
                        {schedule.title}
                      </h3>
                      <p className="text-sm text-red-700 mb-2">
                        Conflicts with {conflicts.length} other schedule(s):
                      </p>
                      <ul className="text-sm text-red-600 space-y-1">
                        {conflicts.map(c => (
                          <li key={c._id}>
                            • {c.title} ({c.startTime} - {c.endTime})
                          </li>
                        ))}
                      </ul>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Schedule Form Modal */}
        {showScheduleForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="bg-blue-600 text-white p-6">
                <div className="flex justify-between items-center">
                  <h2 className="text-2xl font-bold">
                    {selectedSchedule ? 'Edit Schedule' : 'New Schedule'}
                  </h2>
                  <button
                    onClick={() => {
                      setShowScheduleForm(false);
                      resetScheduleData();
                    }}
                    className="text-white text-2xl hover:text-gray-300"
                  >
                    ×
                  </button>
                </div>
              </div>

              <div className="p-6 space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Title *</label>
                  <input
                    type="text"
                    value={scheduleData.title}
                    onChange={(e) => setScheduleData(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="e.g., U14 Team Practice"
                    className="w-full border rounded-lg px-3 py-2"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Type *</label>
                    <select
                      value={scheduleData.type}
                      onChange={(e) => setScheduleData(prev => ({ ...prev, type: e.target.value }))}
                      className="w-full border rounded-lg px-3 py-2"
                    >
                      {scheduleTypes.map(type => (
                        <option key={type.id} value={type.id}>{type.icon} {type.name}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Visibility *</label>
                    <select
                      value={scheduleData.visibility}
                      onChange={(e) => setScheduleData(prev => ({ ...prev, visibility: e.target.value }))}
                      className="w-full border rounded-lg px-3 py-2"
                    >
                      {visibilityOptions.map(vis => (
                        <option key={vis.id} value={vis.id}>{vis.icon} {vis.name}</option>
                      ))}
                    </select>
                    <p className="text-xs text-gray-500 mt-1">
                      {visibilityOptions.find(v => v.id === scheduleData.visibility)?.description}
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Team *</label>
                    <input
                      type="text"
                      value={scheduleData.team}
                      onChange={(e) => setScheduleData(prev => ({ ...prev, team: e.target.value }))}
                      placeholder="Team name"
                      className="w-full border rounded-lg px-3 py-2"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Date *</label>
                    <input
                      type="date"
                      value={scheduleData.date}
                      onChange={(e) => setScheduleData(prev => ({ ...prev, date: e.target.value }))}
                      className="w-full border rounded-lg px-3 py-2"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Start Time *</label>
                    <input
                      type="time"
                      value={scheduleData.startTime}
                      onChange={(e) => setScheduleData(prev => ({ ...prev, startTime: e.target.value }))}
                      className="w-full border rounded-lg px-3 py-2"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">End Time *</label>
                    <input
                      type="time"
                      value={scheduleData.endTime}
                      onChange={(e) => setScheduleData(prev => ({ ...prev, endTime: e.target.value }))}
                      className="w-full border rounded-lg px-3 py-2"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Duration (min)</label>
                    <input
                      type="number"
                      value={scheduleData.duration}
                      onChange={(e) => setScheduleData(prev => ({ ...prev, duration: parseInt(e.target.value) || 90 }))}
                      className="w-full border rounded-lg px-3 py-2"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Location *</label>
                    <input
                      type="text"
                      value={scheduleData.location}
                      onChange={(e) => setScheduleData(prev => ({ ...prev, location: e.target.value }))}
                      placeholder="Field/Facility name"
                      className="w-full border rounded-lg px-3 py-2"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Resource</label>
                    <select
                      value={scheduleData.resource}
                      onChange={(e) => setScheduleData(prev => ({ ...prev, resource: e.target.value }))}
                      className="w-full border rounded-lg px-3 py-2"
                    >
                      <option value="">No specific resource</option>
                      {Array.isArray(resources) && resources.map(res => (
                        <option key={res._id} value={res._id}>{res.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Coach/Organizer</label>
                  <input
                    type="text"
                    value={scheduleData.coach}
                    onChange={(e) => setScheduleData(prev => ({ ...prev, coach: e.target.value }))}
                    placeholder="Name"
                    className="w-full border rounded-lg px-3 py-2"
                  />
                </div>

                <div>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={scheduleData.recurring}
                      onChange={(e) => setScheduleData(prev => ({ ...prev, recurring: e.target.checked }))}
                      className="rounded"
                    />
                    <span className="text-sm text-gray-700">Recurring Schedule</span>
                  </label>
                </div>

                {scheduleData.recurring && (
                  <div className="grid grid-cols-2 gap-4 bg-gray-50 p-4 rounded-lg">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Pattern</label>
                      <select
                        value={scheduleData.recurringPattern}
                        onChange={(e) => setScheduleData(prev => ({ ...prev, recurringPattern: e.target.value }))}
                        className="w-full border rounded-lg px-3 py-2"
                      >
                        <option value="daily">Daily</option>
                        <option value="weekly">Weekly</option>
                        <option value="biweekly">Bi-weekly</option>
                        <option value="monthly">Monthly</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">End Date</label>
                      <input
                        type="date"
                        value={scheduleData.recurringEndDate}
                        onChange={(e) => setScheduleData(prev => ({ ...prev, recurringEndDate: e.target.value }))}
                        className="w-full border rounded-lg px-3 py-2"
                      />
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Notes</label>
                  <textarea
                    rows={3}
                    value={scheduleData.notes}
                    onChange={(e) => setScheduleData(prev => ({ ...prev, notes: e.target.value }))}
                    placeholder="Additional notes..."
                    className="w-full border rounded-lg px-3 py-2"
                  />
                </div>

                {/* Conflict Warning */}
                {scheduleData.date && scheduleData.startTime && scheduleData.endTime && scheduleData.resource && (
                  (() => {
                    const conflicts = detectConflicts(scheduleData);
                    return conflicts.length > 0 ? (
                      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                        <div className="flex items-start gap-2">
                          <i className="bi bi-exclamation-triangle text-red-600 text-xl"></i>
                          <div className="flex-1">
                            <h4 className="font-semibold text-red-900">Scheduling Conflict Detected!</h4>
                            <p className="text-sm text-red-700 mt-1">
                              This schedule conflicts with {conflicts.length} existing booking(s):
                            </p>
                            <ul className="text-sm text-red-600 mt-2 space-y-1">
                              {conflicts.map(c => (
                                <li key={c._id}>• {c.title} ({c.startTime} - {c.endTime})</li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      </div>
                    ) : null;
                  })()
                )}

                {/* Actions */}
                <div className="flex justify-end gap-3 border-t pt-4">
                  <button
                    onClick={() => {
                      setShowScheduleForm(false);
                      resetScheduleData();
                    }}
                    className="bg-gray-100 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-200"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={saveSchedule}
                    disabled={loading || !scheduleData.title || !scheduleData.date}
                    className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
                  >
                    {loading ? 'Saving...' : selectedSchedule ? 'Update Schedule' : 'Create Schedule'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Resource Form Modal */}
        {showResourceForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-2xl w-full p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Add New Resource</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Resource Name *</label>
                  <input
                    type="text"
                    value={resourceData.name}
                    onChange={(e) => setResourceData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="e.g., Field 1, Conference Room A"
                    className="w-full border rounded-lg px-3 py-2"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Type *</label>
                    <select
                      value={resourceData.type}
                      onChange={(e) => setResourceData(prev => ({ ...prev, type: e.target.value }))}
                      className="w-full border rounded-lg px-3 py-2"
                    >
                      {resourceTypes.map(type => (
                        <option key={type.id} value={type.id}>{type.icon} {type.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Capacity</label>
                    <input
                      type="number"
                      value={resourceData.capacity}
                      onChange={(e) => setResourceData(prev => ({ ...prev, capacity: parseInt(e.target.value) || 0 }))}
                      placeholder="0 = unlimited"
                      className="w-full border rounded-lg px-3 py-2"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
                  <input
                    type="text"
                    value={resourceData.location}
                    onChange={(e) => setResourceData(prev => ({ ...prev, location: e.target.value }))}
                    placeholder="Address or description"
                    className="w-full border rounded-lg px-3 py-2"
                  />
                </div>

                <div className="flex justify-end gap-3">
                  <button
                    onClick={() => setShowResourceForm(false)}
                    className="bg-gray-100 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-200"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={saveResource}
                    disabled={loading || !resourceData.name}
                    className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 disabled:opacity-50"
                  >
                    {loading ? 'Saving...' : 'Add Resource'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SchedulingManager;


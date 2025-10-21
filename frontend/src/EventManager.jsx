import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const EventManager = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [showEventForm, setShowEventForm] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [showAttendeesModal, setShowAttendeesModal] = useState(false);
  const [showRegistrationModal, setShowRegistrationModal] = useState(false);
  const [filter, setFilter] = useState({
    search: '',
    type: 'all',
    visibility: 'all',
    status: 'all',
    dateFrom: '',
    dateTo: ''
  });

  const [eventData, setEventData] = useState({
    title: '',
    description: '',
    type: 'public',
    category: 'tournament',
    date: '',
    startTime: '',
    endTime: '',
    location: '',
    venue: '',
    address: '',
    city: '',
    state: '',
    zip: '',
    capacity: 0,
    currentRegistrations: 0,
    visibility: 'public',
    requiresRegistration: true,
    registrationDeadline: '',
    registrationFee: 0,
    status: 'upcoming',
    organizer: '',
    contactEmail: '',
    contactPhone: '',
    featured: false,
    imageUrl: '',
    tags: [],
    attendees: [],
    agenda: [],
    sponsors: [],
    volunteers: [],
    notes: ''
  });

  const eventCategories = [
    { id: 'tournament', name: 'Tournament', icon: '🏆', color: 'blue', description: 'Competitive tournaments', audience: 'both' },
    { id: 'camp', name: 'Training Camp', icon: '⛺', color: 'green', description: 'Multi-day training camps', audience: 'both' },
    { id: 'clinic', name: 'Skills Clinic', icon: '🎓', color: 'purple', description: 'Skill development clinics', audience: 'both' },
    { id: 'tryout', name: 'Tryouts', icon: '⚽', color: 'orange', description: 'Team tryout sessions', audience: 'public' },
    { id: 'fundraiser', name: 'Fundraiser', icon: '💰', color: 'teal', description: 'Fundraising events', audience: 'both' },
    { id: 'social', name: 'Social Event', icon: '🎉', color: 'pink', description: 'Team parties, celebrations', audience: 'both' },
    { id: 'meeting', name: 'Meeting', icon: '📋', color: 'indigo', description: 'Board/parent meetings', audience: 'internal' },
    { id: 'community', name: 'Community Event', icon: '🤝', color: 'yellow', description: 'Community outreach', audience: 'public' },
    { id: 'awards', name: 'Awards Ceremony', icon: '🏅', color: 'red', description: 'End of season awards', audience: 'both' },
    { id: 'workshop', name: 'Workshop', icon: '🛠️', color: 'cyan', description: 'Educational workshops', audience: 'both' },
    { id: 'volunteer', name: 'Volunteer Day', icon: '🙋', color: 'lime', description: 'Volunteer activities', audience: 'internal' },
    { id: 'other', name: 'Other Event', icon: '📅', color: 'gray', description: 'Miscellaneous events', audience: 'both' }
  ];

  const eventStatuses = [
    { id: 'draft', name: 'Draft', icon: '📝', color: 'gray' },
    { id: 'upcoming', name: 'Upcoming', icon: '📅', color: 'blue' },
    { id: 'registration_open', name: 'Registration Open', icon: '✅', color: 'green' },
    { id: 'registration_closed', name: 'Registration Closed', icon: '🔒', color: 'orange' },
    { id: 'in_progress', name: 'In Progress', icon: '▶️', color: 'yellow' },
    { id: 'completed', name: 'Completed', icon: '✓', color: 'teal' },
    { id: 'cancelled', name: 'Cancelled', icon: '❌', color: 'red' },
    { id: 'postponed', name: 'Postponed', icon: '⏰', color: 'purple' }
  ];

  const visibilityOptions = [
    { id: 'public', name: 'Public', icon: '🌐', description: 'Visible to everyone, open registration' },
    { id: 'members_only', name: 'Members Only', icon: '🔐', description: 'Only registered club members' },
    { id: 'internal', name: 'Internal', icon: '🏢', description: 'Staff and volunteers only' },
    { id: 'private', name: 'Private', icon: '🔒', description: 'Invite-only' }
  ];

  const tabs = [
    { id: 'overview', name: 'Overview', icon: '📊' },
    { id: 'upcoming', name: 'Upcoming', icon: '📅' },
    { id: 'registration', name: 'Registration', icon: '📝' },
    { id: 'all', name: 'All Events', icon: '📋' },
    { id: 'analytics', name: 'Analytics', icon: '📈' }
  ];

  useEffect(() => {
    document.title = 'Event Management - Seattle Leopards FC Admin';
    loadEvents();
  }, []);

  const loadEvents = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/events');
      if (response.ok) {
        const data = await response.json();
        setEvents(data);
      }
    } catch (error) {
      console.error('Error loading events:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveEvent = async () => {
    try {
      setLoading(true);
      const url = selectedEvent ? `/api/events/${selectedEvent._id}` : '/api/events';
      const method = selectedEvent ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(eventData)
      });

      if (response.ok) {
        setMessage('Event saved successfully!');
        loadEvents();
        setShowEventForm(false);
        resetEventData();
      } else {
        setMessage('Error saving event');
      }
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      console.error('Error saving event:', error);
      setMessage('Error saving event');
      setTimeout(() => setMessage(''), 3000);
    } finally {
      setLoading(false);
    }
  };

  const deleteEvent = async (id) => {
    if (!confirm('Are you sure you want to delete this event?')) return;

    try {
      setLoading(true);
      const response = await fetch(`/api/events/${id}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        setMessage('Event deleted successfully!');
        loadEvents();
      }
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      console.error('Error deleting event:', error);
    } finally {
      setLoading(false);
    }
  };

  const duplicateEvent = (event) => {
    const duplicated = {
      ...event,
      title: `${event.title} (Copy)`,
      status: 'draft',
      date: '',
      currentRegistrations: 0,
      attendees: []
    };
    delete duplicated._id;
    
    setEventData(duplicated);
    setSelectedEvent(null);
    setShowEventForm(true);
  };

  const resetEventData = () => {
    setEventData({
      title: '',
      description: '',
      type: 'public',
      category: 'tournament',
      date: '',
      startTime: '',
      endTime: '',
      location: '',
      venue: '',
      address: '',
      city: '',
      state: '',
      zip: '',
      capacity: 0,
      currentRegistrations: 0,
      visibility: 'public',
      requiresRegistration: true,
      registrationDeadline: '',
      registrationFee: 0,
      status: 'upcoming',
      organizer: '',
      contactEmail: '',
      contactPhone: '',
      featured: false,
      imageUrl: '',
      tags: [],
      attendees: [],
      agenda: [],
      sponsors: [],
      volunteers: [],
      notes: ''
    });
    setSelectedEvent(null);
  };

  const addAgendaItem = () => {
    setEventData(prev => ({
      ...prev,
      agenda: [...prev.agenda, { time: '', title: '', description: '' }]
    }));
  };

  const updateAgendaItem = (index, field, value) => {
    setEventData(prev => ({
      ...prev,
      agenda: prev.agenda.map((item, i) => 
        i === index ? { ...item, [field]: value } : item
      )
    }));
  };

  const removeAgendaItem = (index) => {
    setEventData(prev => ({
      ...prev,
      agenda: prev.agenda.filter((_, i) => i !== index)
    }));
  };

  const getFilteredEvents = () => {
    let filtered = events;

    // Tab filtering
    if (activeTab === 'upcoming') {
      filtered = filtered.filter(e => 
        (e.status === 'upcoming' || e.status === 'registration_open') && 
        new Date(e.date) >= new Date()
      );
    } else if (activeTab === 'registration') {
      filtered = filtered.filter(e => e.status === 'registration_open');
    }

    // Additional filters
    if (filter.search) {
      filtered = filtered.filter(e =>
        e.title?.toLowerCase().includes(filter.search.toLowerCase()) ||
        e.description?.toLowerCase().includes(filter.search.toLowerCase()) ||
        e.location?.toLowerCase().includes(filter.search.toLowerCase())
      );
    }
    if (filter.type !== 'all') filtered = filtered.filter(e => e.category === filter.type);
    if (filter.visibility !== 'all') filtered = filtered.filter(e => e.visibility === filter.visibility);
    if (filter.status !== 'all') filtered = filtered.filter(e => e.status === filter.status);
    if (filter.dateFrom) filtered = filtered.filter(e => new Date(e.date) >= new Date(filter.dateFrom));
    if (filter.dateTo) filtered = filtered.filter(e => new Date(e.date) <= new Date(filter.dateTo));

    return filtered.sort((a, b) => new Date(a.date) - new Date(b.date));
  };

  const filteredEvents = getFilteredEvents();

  const stats = {
    total: events.length,
    upcoming: events.filter(e => 
      (e.status === 'upcoming' || e.status === 'registration_open') && 
      new Date(e.date) >= new Date()
    ).length,
    registrationOpen: events.filter(e => e.status === 'registration_open').length,
    completed: events.filter(e => e.status === 'completed').length,
    public: events.filter(e => e.visibility === 'public').length,
    internal: events.filter(e => e.visibility === 'internal').length,
    membersOnly: events.filter(e => e.visibility === 'members_only').length,
    thisMonth: events.filter(e => {
      const eventDate = new Date(e.date);
      const now = new Date();
      return eventDate.getMonth() === now.getMonth() && eventDate.getFullYear() === now.getFullYear();
    }).length,
    byCategory: eventCategories.map(cat => ({
      ...cat,
      count: events.filter(e => e.category === cat.id).length,
      publicCount: events.filter(e => e.category === cat.id && e.visibility === 'public').length,
      internalCount: events.filter(e => e.category === cat.id && (e.visibility === 'internal' || e.visibility === 'members_only')).length
    })),
    totalRegistrations: events.reduce((sum, e) => sum + (e.currentRegistrations || 0), 0),
    totalCapacity: events.reduce((sum, e) => sum + (e.capacity || 0), 0),
    avgAttendance: events.filter(e => e.status === 'completed').length > 0
      ? Math.round(events.filter(e => e.status === 'completed').reduce((sum, e) => sum + (e.attendees?.length || 0), 0) / events.filter(e => e.status === 'completed').length)
      : 0
  };

  const getStatusColor = (status) => {
    const statusObj = eventStatuses.find(s => s.id === status);
    return statusObj?.color || 'gray';
  };

  const getVisibilityBadge = (visibility) => {
    const vis = visibilityOptions.find(v => v.id === visibility);
    return vis || visibilityOptions[0];
  };

  const exportEvents = () => {
    const csv = [
      ['Title', 'Category', 'Date', 'Time', 'Location', 'Visibility', 'Status', 'Registrations', 'Capacity'],
      ...filteredEvents.map(e => [
        e.title,
        eventCategories.find(c => c.id === e.category)?.name || e.category,
        new Date(e.date).toLocaleDateString(),
        e.startTime,
        e.location,
        e.visibility,
        e.status,
        e.currentRegistrations || 0,
        e.capacity || 0
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `events-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Event Management</h1>
              <p className="mt-1 text-sm text-gray-500">
                Create and manage public events and internal club activities
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
                onClick={exportEvents}
                className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors"
              >
                <i className="bi bi-download me-2"></i>Export
              </button>
              <button
                onClick={() => {
                  resetEventData();
                  setShowEventForm(true);
                }}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                <i className="bi bi-plus-lg me-2"></i>Create Event
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
                  {tab.id === 'upcoming' && stats.upcoming > 0 && (
                    <span className="ml-2 bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full text-xs">
                      {stats.upcoming}
                    </span>
                  )}
                  {tab.id === 'registration' && stats.registrationOpen > 0 && (
                    <span className="ml-2 bg-green-100 text-green-800 px-2 py-0.5 rounded-full text-xs">
                      {stats.registrationOpen}
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
                    <div className="text-sm text-blue-700 mt-1">Total Events</div>
                  </div>
                  <div className="text-4xl">📅</div>
                </div>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-sm border">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-3xl font-bold text-green-900">{stats.upcoming}</div>
                    <div className="text-sm text-green-700 mt-1">Upcoming</div>
                  </div>
                  <div className="text-4xl">⏰</div>
                </div>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-sm border">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-3xl font-bold text-purple-900">{stats.registrationOpen}</div>
                    <div className="text-sm text-purple-700 mt-1">Open Registration</div>
                  </div>
                  <div className="text-4xl">✅</div>
                </div>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-sm border">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-3xl font-bold text-orange-900">{stats.thisMonth}</div>
                    <div className="text-sm text-orange-700 mt-1">This Month</div>
                  </div>
                  <div className="text-4xl">📆</div>
                </div>
              </div>
            </div>

            {/* Public vs Internal */}
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-lg border border-blue-200">
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-3xl">🌐</span>
                  <div>
                    <div className="text-2xl font-bold text-blue-900">{stats.public}</div>
                    <div className="text-sm text-blue-700">Public Events</div>
                  </div>
                </div>
                <p className="text-xs text-blue-600">Open to everyone</p>
              </div>
              <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-lg border border-purple-200">
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-3xl">🔐</span>
                  <div>
                    <div className="text-2xl font-bold text-purple-900">{stats.membersOnly}</div>
                    <div className="text-sm text-purple-700">Members Only</div>
                  </div>
                </div>
                <p className="text-xs text-purple-600">Club members only</p>
              </div>
              <div className="bg-gradient-to-br from-gray-50 to-gray-100 p-6 rounded-lg border border-gray-200">
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-3xl">🏢</span>
                  <div>
                    <div className="text-2xl font-bold text-gray-900">{stats.internal}</div>
                    <div className="text-sm text-gray-700">Internal Events</div>
                  </div>
                </div>
                <p className="text-xs text-gray-600">Staff and volunteers</p>
              </div>
            </div>

            {/* Registration Stats */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white p-6 rounded-lg shadow-sm border">
                <div className="text-2xl font-bold text-teal-900">{stats.totalRegistrations}</div>
                <div className="text-sm text-teal-700 mt-1">Total Registrations</div>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-sm border">
                <div className="text-2xl font-bold text-indigo-900">{stats.avgAttendance}</div>
                <div className="text-sm text-indigo-700 mt-1">Avg Attendance</div>
              </div>
            </div>

            {/* Event Categories Grid */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Events by Category</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {stats.byCategory.map((cat) => (
                  <div
                    key={cat.id}
                    className="bg-gradient-to-br from-gray-50 to-white p-4 rounded-lg border hover:shadow-lg transition-all cursor-pointer"
                    onClick={() => {
                      setFilter(f => ({ ...f, type: cat.id }));
                      setActiveTab('all');
                    }}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-2xl">{cat.icon}</span>
                      <div className="text-2xl font-bold text-gray-800">{cat.count}</div>
                    </div>
                    <h3 className="font-semibold text-gray-900 text-sm mb-1">{cat.name}</h3>
                    <p className="text-xs text-gray-600 mb-2">{cat.description}</p>
                    <div className="flex gap-2 text-xs">
                      <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded">
                        🌐 {cat.publicCount} public
                      </span>
                      <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded">
                        🔒 {cat.internalCount} internal
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* What is Event Management */}
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">🎉 What is Event Management?</h2>
              <p className="text-gray-700 mb-4">
                Event Management is a comprehensive system for planning, organizing, and executing both **public events** 
                (open to community) and **internal events** (for club members/staff only). It handles everything from 
                registration to attendance tracking and post-event analytics.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
                <div className="bg-white p-4 rounded-lg border-2 border-blue-200">
                  <h3 className="font-semibold text-blue-900 mb-3 flex items-center gap-2">
                    <span className="text-2xl">🌐</span> Public Events
                  </h3>
                  <p className="text-sm text-gray-700 mb-3">
                    Events open to the community, parents, and general public:
                  </p>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Tournaments and competitions</li>
                    <li>• Public tryouts and camps</li>
                    <li>• Community outreach events</li>
                    <li>• Fundraising activities</li>
                    <li>• Open skills clinics</li>
                    <li>• Awards ceremonies</li>
                    <li>• Fan appreciation events</li>
                  </ul>
                </div>
                
                <div className="bg-white p-4 rounded-lg border-2 border-gray-300">
                  <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <span className="text-2xl">🏢</span> Internal Events
                  </h3>
                  <p className="text-sm text-gray-700 mb-3">
                    Events for club members, staff, and volunteers only:
                  </p>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Board and committee meetings</li>
                    <li>• Coach training workshops</li>
                    <li>• Staff planning sessions</li>
                    <li>• Volunteer coordination meetings</li>
                    <li>• Team parent meetings</li>
                    <li>• Internal social events</li>
                    <li>• Strategic planning sessions</li>
                  </ul>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-white p-4 rounded-lg border">
                  <h3 className="font-semibold text-gray-900 mb-2">📝 Registration & RSVP</h3>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Online registration forms</li>
                    <li>• Capacity management</li>
                    <li>• Waitlist functionality</li>
                    <li>• Payment collection</li>
                  </ul>
                </div>
                <div className="bg-white p-4 rounded-lg border">
                  <h3 className="font-semibold text-gray-900 mb-2">📊 Tracking & Analytics</h3>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Attendance tracking</li>
                    <li>• Registration analytics</li>
                    <li>• Event performance metrics</li>
                    <li>• Engagement statistics</li>
                  </ul>
                </div>
                <div className="bg-white p-4 rounded-lg border">
                  <h3 className="font-semibold text-gray-900 mb-2">📅 Event Planning</h3>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Detailed event agenda</li>
                    <li>• Volunteer coordination</li>
                    <li>• Sponsor management</li>
                    <li>• Resource planning</li>
                  </ul>
                </div>
                <div className="bg-white p-4 rounded-lg border">
                  <h3 className="font-semibold text-gray-900 mb-2">🔔 Communication</h3>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Automated reminders</li>
                    <li>• Registration confirmations</li>
                    <li>• Event updates</li>
                    <li>• Post-event surveys</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Upcoming/Registration/All Events Tabs */}
        {(activeTab === 'upcoming' || activeTab === 'registration' || activeTab === 'all') && (
          <div className="space-y-6">
            {/* Filters */}
            <div className="bg-white rounded-lg shadow-sm border p-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
                <input
                  type="text"
                  placeholder="Search events..."
                  value={filter.search}
                  onChange={(e) => setFilter(f => ({ ...f, search: e.target.value }))}
                  className="border rounded px-3 py-2"
                />
                <select
                  value={filter.type}
                  onChange={(e) => setFilter(f => ({ ...f, type: e.target.value }))}
                  className="border rounded px-3 py-2"
                >
                  <option value="all">All Categories</option>
                  {eventCategories.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.icon} {cat.name}</option>
                  ))}
                </select>
                <select
                  value={filter.visibility}
                  onChange={(e) => setFilter(f => ({ ...f, visibility: e.target.value }))}
                  className="border rounded px-3 py-2"
                >
                  <option value="all">All Visibility</option>
                  {visibilityOptions.map(vis => (
                    <option key={vis.id} value={vis.id}>{vis.icon} {vis.name}</option>
                  ))}
                </select>
                {activeTab === 'all' && (
                  <select
                    value={filter.status}
                    onChange={(e) => setFilter(f => ({ ...f, status: e.target.value }))}
                    className="border rounded px-3 py-2"
                  >
                    <option value="all">All Status</option>
                    {eventStatuses.map(status => (
                      <option key={status.id} value={status.id}>{status.icon} {status.name}</option>
                    ))}
                  </select>
                )}
                <input
                  type="date"
                  value={filter.dateFrom}
                  onChange={(e) => setFilter(f => ({ ...f, dateFrom: e.target.value }))}
                  placeholder="From"
                  className="border rounded px-3 py-2"
                />
                <input
                  type="date"
                  value={filter.dateTo}
                  onChange={(e) => setFilter(f => ({ ...f, dateTo: e.target.value }))}
                  placeholder="To"
                  className="border rounded px-3 py-2"
                />
              </div>
              <div className="flex justify-between items-center mt-4">
                <p className="text-sm text-gray-600">
                  Showing {filteredEvents.length} of {events.length} events
                </p>
                <button
                  onClick={() => setFilter({
                    search: '',
                    type: 'all',
                    visibility: 'all',
                    status: 'all',
                    dateFrom: '',
                    dateTo: ''
                  })}
                  className="text-sm text-blue-600 hover:text-blue-800"
                >
                  Clear Filters
                </button>
              </div>
            </div>

            {/* Events List */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filteredEvents.length === 0 ? (
                <div className="col-span-full bg-white rounded-lg shadow-sm border p-12 text-center">
                  <div className="text-6xl mb-4">🎉</div>
                  <p className="text-lg font-semibold mb-2 text-gray-900">No events found</p>
                  <p className="text-sm text-gray-600 mb-4">Create your first event to get started</p>
                  <button
                    onClick={() => {
                      resetEventData();
                      setShowEventForm(true);
                    }}
                    className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
                  >
                    Create Event
                  </button>
                </div>
              ) : (
                filteredEvents.map((event) => {
                  const category = eventCategories.find(c => c.id === event.category);
                  const visibility = getVisibilityBadge(event.visibility);
                  const daysUntil = Math.ceil((new Date(event.date) - new Date()) / (1000 * 60 * 60 * 24));
                  
                  return (
                    <div key={event._id} className="bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow">
                      {event.imageUrl && (
                        <div className="h-48 bg-gray-200 rounded-t-lg overflow-hidden">
                          <img src={event.imageUrl} alt={event.title} className="w-full h-full object-cover" />
                        </div>
                      )}
                      {!event.imageUrl && (
                        <div className={`h-2 bg-${category?.color}-500 rounded-t-lg`}></div>
                      )}
                      
                      <div className="p-6">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <h3 className="text-xl font-bold text-gray-900 mb-2">{event.title}</h3>
                            <div className="flex flex-wrap gap-2 mb-3">
                              <span className={`px-2 py-1 text-xs rounded-full bg-${category?.color}-100 text-${category?.color}-800`}>
                                {category?.icon} {category?.name}
                              </span>
                              <span className={`px-2 py-1 text-xs rounded-full bg-${visibility.id === 'public' ? 'blue' : 'gray'}-100 text-${visibility.id === 'public' ? 'blue' : 'gray'}-800`}>
                                {visibility.icon} {visibility.name}
                              </span>
                              <span className={`px-2 py-1 text-xs rounded-full bg-${getStatusColor(event.status)}-100 text-${getStatusColor(event.status)}-800`}>
                                {eventStatuses.find(s => s.id === event.status)?.icon} {eventStatuses.find(s => s.id === event.status)?.name}
                              </span>
                              {event.featured && (
                                <span className="px-2 py-1 text-xs rounded-full bg-yellow-100 text-yellow-800">
                                  ⭐ Featured
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        {event.description && (
                          <p className="text-sm text-gray-600 mb-4 line-clamp-2">{event.description}</p>
                        )}

                        <div className="space-y-2 text-sm mb-4">
                          <div className="flex items-center gap-2 text-gray-700">
                            <i className="bi bi-calendar3"></i>
                            <span className="font-medium">{new Date(event.date).toLocaleDateString()}</span>
                            {daysUntil >= 0 && daysUntil <= 30 && (
                              <span className="text-xs text-blue-600">({daysUntil} days)</span>
                            )}
                          </div>
                          <div className="flex items-center gap-2 text-gray-700">
                            <i className="bi bi-clock"></i>
                            <span>{event.startTime} - {event.endTime}</span>
                          </div>
                          <div className="flex items-center gap-2 text-gray-700">
                            <i className="bi bi-geo-alt"></i>
                            <span>{event.location}</span>
                          </div>
                          {event.requiresRegistration && (
                            <div className="flex items-center gap-2 text-gray-700">
                              <i className="bi bi-people"></i>
                              <span>{event.currentRegistrations || 0} / {event.capacity || '∞'} registered</span>
                              {event.capacity > 0 && (
                                <div className="flex-1 ml-2">
                                  <div className="w-full bg-gray-200 rounded-full h-2">
                                    <div 
                                      className="bg-blue-600 h-2 rounded-full"
                                      style={{ width: `${Math.min((event.currentRegistrations / event.capacity) * 100, 100)}%` }}
                                    ></div>
                                  </div>
                                </div>
                              )}
                            </div>
                          )}
                        </div>

                        {/* Actions */}
                        <div className="flex gap-2 border-t pt-4">
                          <button
                            onClick={() => {
                              setSelectedEvent(event);
                              setEventData(event);
                              setShowEventForm(true);
                            }}
                            className="flex-1 bg-blue-50 text-blue-600 px-3 py-2 rounded hover:bg-blue-100 text-sm"
                          >
                            <i className="bi bi-pencil me-1"></i>Edit
                          </button>
                          <button
                            onClick={() => {
                              setSelectedEvent(event);
                              setShowAttendeesModal(true);
                            }}
                            className="flex-1 bg-green-50 text-green-600 px-3 py-2 rounded hover:bg-green-100 text-sm"
                          >
                            <i className="bi bi-people me-1"></i>Attendees
                          </button>
                          <button
                            onClick={() => duplicateEvent(event)}
                            className="bg-purple-50 text-purple-600 px-3 py-2 rounded hover:bg-purple-100 text-sm"
                          >
                            <i className="bi bi-files"></i>
                          </button>
                          <button
                            onClick={() => deleteEvent(event._id)}
                            className="bg-red-50 text-red-600 px-3 py-2 rounded hover:bg-red-100 text-sm"
                          >
                            <i className="bi bi-trash"></i>
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

        {/* Analytics Tab */}
        {activeTab === 'analytics' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-lg border border-blue-200">
                <div className="text-2xl font-bold text-blue-900">
                  {stats.completed > 0 ? ((stats.completed / stats.total) * 100).toFixed(1) : 0}%
                </div>
                <div className="text-sm text-blue-700">Completion Rate</div>
              </div>
              <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-lg border border-green-200">
                <div className="text-2xl font-bold text-green-900">
                  {stats.totalCapacity > 0 ? ((stats.totalRegistrations / stats.totalCapacity) * 100).toFixed(1) : 0}%
                </div>
                <div className="text-sm text-green-700">Registration Fill Rate</div>
              </div>
              <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-lg border border-purple-200">
                <div className="text-2xl font-bold text-purple-900">
                  {stats.avgAttendance}
                </div>
                <div className="text-sm text-purple-700">Avg Attendance</div>
              </div>
              <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-6 rounded-lg border border-orange-200">
                <div className="text-2xl font-bold text-orange-900">
                  {Math.round(stats.total / 12)}
                </div>
                <div className="text-sm text-orange-700">Events Per Month</div>
              </div>
            </div>

            {/* Category Performance */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Event Category Performance</h2>
              <div className="space-y-3">
                {stats.byCategory.filter(c => c.count > 0).map((cat) => (
                  <div key={cat.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{cat.icon}</span>
                      <div>
                        <div className="font-semibold text-gray-900">{cat.name}</div>
                        <div className="text-sm text-gray-600">{cat.count} events total</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right text-sm">
                        <div className="text-blue-600">🌐 {cat.publicCount} public</div>
                        <div className="text-gray-600">🔒 {cat.internalCount} internal</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Event Form Modal */}
        {showEventForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-5xl w-full max-h-[90vh] overflow-y-auto">
              <div className="bg-blue-600 text-white p-6">
                <div className="flex justify-between items-center">
                  <h2 className="text-2xl font-bold">
                    {selectedEvent ? 'Edit Event' : 'Create New Event'}
                  </h2>
                  <button
                    onClick={() => {
                      setShowEventForm(false);
                      resetEventData();
                    }}
                    className="text-white text-2xl hover:text-gray-300"
                  >
                    ×
                  </button>
                </div>
              </div>

              <div className="p-6 space-y-6">
                {/* Basic Information */}
                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Event Title *</label>
                    <input
                      type="text"
                      value={eventData.title}
                      onChange={(e) => setEventData(prev => ({ ...prev, title: e.target.value }))}
                      placeholder="e.g., Summer Soccer Tournament 2025"
                      className="w-full border rounded-lg px-3 py-2"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                    <textarea
                      rows={3}
                      value={eventData.description}
                      onChange={(e) => setEventData(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Detailed event description..."
                      className="w-full border rounded-lg px-3 py-2"
                    />
                  </div>
                </div>

                {/* Category & Visibility */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Category *</label>
                    <select
                      value={eventData.category}
                      onChange={(e) => setEventData(prev => ({ ...prev, category: e.target.value }))}
                      className="w-full border rounded-lg px-3 py-2"
                    >
                      {eventCategories.map(cat => (
                        <option key={cat.id} value={cat.id}>{cat.icon} {cat.name}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Visibility *</label>
                    <select
                      value={eventData.visibility}
                      onChange={(e) => setEventData(prev => ({ ...prev, visibility: e.target.value }))}
                      className="w-full border rounded-lg px-3 py-2"
                    >
                      {visibilityOptions.map(vis => (
                        <option key={vis.id} value={vis.id}>{vis.icon} {vis.name}</option>
                      ))}
                    </select>
                    <p className="text-xs text-gray-500 mt-1">
                      {visibilityOptions.find(v => v.id === eventData.visibility)?.description}
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                    <select
                      value={eventData.status}
                      onChange={(e) => setEventData(prev => ({ ...prev, status: e.target.value }))}
                      className="w-full border rounded-lg px-3 py-2"
                    >
                      {eventStatuses.map(status => (
                        <option key={status.id} value={status.id}>{status.icon} {status.name}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Capacity</label>
                    <input
                      type="number"
                      value={eventData.capacity}
                      onChange={(e) => setEventData(prev => ({ ...prev, capacity: parseInt(e.target.value) || 0 }))}
                      placeholder="0 = unlimited"
                      className="w-full border rounded-lg px-3 py-2"
                    />
                  </div>
                </div>

                {/* Date & Time */}
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Date *</label>
                    <input
                      type="date"
                      value={eventData.date}
                      onChange={(e) => setEventData(prev => ({ ...prev, date: e.target.value }))}
                      className="w-full border rounded-lg px-3 py-2"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Start Time *</label>
                    <input
                      type="time"
                      value={eventData.startTime}
                      onChange={(e) => setEventData(prev => ({ ...prev, startTime: e.target.value }))}
                      className="w-full border rounded-lg px-3 py-2"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">End Time</label>
                    <input
                      type="time"
                      value={eventData.endTime}
                      onChange={(e) => setEventData(prev => ({ ...prev, endTime: e.target.value }))}
                      className="w-full border rounded-lg px-3 py-2"
                    />
                  </div>
                </div>

                {/* Location */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Location *</label>
                    <input
                      type="text"
                      value={eventData.location}
                      onChange={(e) => setEventData(prev => ({ ...prev, location: e.target.value }))}
                      placeholder="e.g., Greenfield Sports Complex"
                      className="w-full border rounded-lg px-3 py-2"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Venue/Field</label>
                    <input
                      type="text"
                      value={eventData.venue}
                      onChange={(e) => setEventData(prev => ({ ...prev, venue: e.target.value }))}
                      placeholder="Specific field or room"
                      className="w-full border rounded-lg px-3 py-2"
                    />
                  </div>
                </div>

                {/* Address Details */}
                <div className="grid grid-cols-4 gap-4">
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Street Address</label>
                    <input
                      type="text"
                      value={eventData.address}
                      onChange={(e) => setEventData(prev => ({ ...prev, address: e.target.value }))}
                      placeholder="123 Main St"
                      className="w-full border rounded-lg px-3 py-2"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">City</label>
                    <input
                      type="text"
                      value={eventData.city}
                      onChange={(e) => setEventData(prev => ({ ...prev, city: e.target.value }))}
                      placeholder="Seattle"
                      className="w-full border rounded-lg px-3 py-2"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">State</label>
                    <input
                      type="text"
                      value={eventData.state}
                      onChange={(e) => setEventData(prev => ({ ...prev, state: e.target.value }))}
                      placeholder="WA"
                      maxLength="2"
                      className="w-full border rounded-lg px-3 py-2"
                    />
                  </div>
                </div>

                {/* Registration Settings */}
                <div className="border-t pt-4">
                  <h3 className="font-semibold text-gray-900 mb-3">Registration Settings</h3>
                  
                  <div className="flex items-center gap-4 mb-4">
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={eventData.requiresRegistration}
                        onChange={(e) => setEventData(prev => ({ ...prev, requiresRegistration: e.target.checked }))}
                        className="rounded"
                      />
                      <span className="text-sm text-gray-700">Requires Registration</span>
                    </label>

                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={eventData.featured}
                        onChange={(e) => setEventData(prev => ({ ...prev, featured: e.target.checked }))}
                        className="rounded"
                      />
                      <span className="text-sm text-gray-700">Featured Event</span>
                    </label>
                  </div>

                  {eventData.requiresRegistration && (
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Registration Deadline</label>
                        <input
                          type="date"
                          value={eventData.registrationDeadline}
                          onChange={(e) => setEventData(prev => ({ ...prev, registrationDeadline: e.target.value }))}
                          className="w-full border rounded-lg px-3 py-2"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Registration Fee ($)</label>
                        <input
                          type="number"
                          value={eventData.registrationFee}
                          onChange={(e) => setEventData(prev => ({ ...prev, registrationFee: parseFloat(e.target.value) || 0 }))}
                          placeholder="0.00"
                          step="0.01"
                          className="w-full border rounded-lg px-3 py-2"
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Contact Information */}
                <div className="border-t pt-4">
                  <h3 className="font-semibold text-gray-900 mb-3">Contact Information</h3>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Organizer</label>
                      <input
                        type="text"
                        value={eventData.organizer}
                        onChange={(e) => setEventData(prev => ({ ...prev, organizer: e.target.value }))}
                        placeholder="Event organizer name"
                        className="w-full border rounded-lg px-3 py-2"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Contact Email</label>
                      <input
                        type="email"
                        value={eventData.contactEmail}
                        onChange={(e) => setEventData(prev => ({ ...prev, contactEmail: e.target.value }))}
                        placeholder="contact@email.com"
                        className="w-full border rounded-lg px-3 py-2"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Contact Phone</label>
                      <input
                        type="tel"
                        value={eventData.contactPhone}
                        onChange={(e) => setEventData(prev => ({ ...prev, contactPhone: e.target.value }))}
                        placeholder="(555) 123-4567"
                        className="w-full border rounded-lg px-3 py-2"
                      />
                    </div>
                  </div>
                </div>

                {/* Event Agenda */}
                <div className="border-t pt-4">
                  <h3 className="font-semibold text-gray-900 mb-3">Event Agenda</h3>
                  {eventData.agenda.map((item, index) => (
                    <div key={index} className="grid grid-cols-12 gap-2 mb-2">
                      <input
                        type="time"
                        value={item.time}
                        onChange={(e) => updateAgendaItem(index, 'time', e.target.value)}
                        className="col-span-2 border rounded px-3 py-2"
                        placeholder="Time"
                      />
                      <input
                        type="text"
                        value={item.title}
                        onChange={(e) => updateAgendaItem(index, 'title', e.target.value)}
                        className="col-span-4 border rounded px-3 py-2"
                        placeholder="Activity"
                      />
                      <input
                        type="text"
                        value={item.description}
                        onChange={(e) => updateAgendaItem(index, 'description', e.target.value)}
                        className="col-span-5 border rounded px-3 py-2"
                        placeholder="Details"
                      />
                      <button
                        onClick={() => removeAgendaItem(index)}
                        className="col-span-1 text-red-600 hover:text-red-800"
                      >
                        <i className="bi bi-trash"></i>
                      </button>
                    </div>
                  ))}
                  <button
                    onClick={addAgendaItem}
                    className="text-sm text-blue-600 hover:text-blue-800"
                  >
                    <i className="bi bi-plus-lg me-1"></i>Add Agenda Item
                  </button>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Image URL</label>
                  <input
                    type="url"
                    value={eventData.imageUrl}
                    onChange={(e) => setEventData(prev => ({ ...prev, imageUrl: e.target.value }))}
                    placeholder="https://example.com/image.jpg"
                    className="w-full border rounded-lg px-3 py-2"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Notes (Internal)</label>
                  <textarea
                    rows={3}
                    value={eventData.notes}
                    onChange={(e) => setEventData(prev => ({ ...prev, notes: e.target.value }))}
                    placeholder="Internal notes about this event..."
                    className="w-full border rounded-lg px-3 py-2"
                  />
                </div>

                {/* Actions */}
                <div className="flex justify-end gap-3 border-t pt-4">
                  <button
                    onClick={() => {
                      setShowEventForm(false);
                      resetEventData();
                    }}
                    className="bg-gray-100 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-200"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={saveEvent}
                    disabled={loading || !eventData.title || !eventData.date}
                    className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
                  >
                    {loading ? 'Saving...' : selectedEvent ? 'Update Event' : 'Create Event'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Attendees Modal */}
        {showAttendeesModal && selectedEvent && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto">
              <div className="bg-green-600 text-white p-6">
                <div className="flex justify-between items-center">
                  <div>
                    <h2 className="text-2xl font-bold">{selectedEvent.title}</h2>
                    <p className="text-green-100">Event Attendees & Registrations</p>
                  </div>
                  <button
                    onClick={() => setShowAttendeesModal(false)}
                    className="text-white text-2xl hover:text-gray-300"
                  >
                    ×
                  </button>
                </div>
              </div>

              <div className="p-6">
                <div className="grid grid-cols-3 gap-4 mb-6">
                  <div className="bg-blue-50 p-4 rounded-lg border border-blue-200 text-center">
                    <div className="text-2xl font-bold text-blue-900">{selectedEvent.currentRegistrations || 0}</div>
                    <div className="text-sm text-blue-700">Registered</div>
                  </div>
                  <div className="bg-green-50 p-4 rounded-lg border border-green-200 text-center">
                    <div className="text-2xl font-bold text-green-900">{selectedEvent.attendees?.length || 0}</div>
                    <div className="text-sm text-green-700">Attended</div>
                  </div>
                  <div className="bg-purple-50 p-4 rounded-lg border border-purple-200 text-center">
                    <div className="text-2xl font-bold text-purple-900">{selectedEvent.capacity || '∞'}</div>
                    <div className="text-sm text-purple-700">Capacity</div>
                  </div>
                </div>

                {selectedEvent.attendees && selectedEvent.attendees.length > 0 ? (
                  <div className="bg-white border rounded-lg overflow-hidden">
                    <table className="w-full">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Registered</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y">
                        {selectedEvent.attendees.map((attendee, idx) => (
                          <tr key={idx} className="hover:bg-gray-50">
                            <td className="px-4 py-3 text-sm text-gray-900">{attendee.name}</td>
                            <td className="px-4 py-3 text-sm text-gray-600">{attendee.email}</td>
                            <td className="px-4 py-3 text-sm text-gray-600">
                              {new Date(attendee.registeredDate).toLocaleDateString()}
                            </td>
                            <td className="px-4 py-3">
                              <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">
                                Confirmed
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="text-center py-12 bg-gray-50 rounded-lg">
                    <div className="text-6xl mb-4">👥</div>
                    <p className="text-gray-600">No registrations yet</p>
                  </div>
                )}

                <div className="flex justify-end gap-3 mt-6">
                  <button
                    onClick={() => setShowAttendeesModal(false)}
                    className="bg-gray-100 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-200"
                  >
                    Close
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

export default EventManager;


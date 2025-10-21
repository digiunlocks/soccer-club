import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const TrainingManager = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [trainingSessions, setTrainingSessions] = useState([]);
  const [trainingPlans, setTrainingPlans] = useState([]);
  const [drills, setDrills] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [showSessionForm, setShowSessionForm] = useState(false);
  const [showDrillLibrary, setShowDrillLibrary] = useState(false);
  const [selectedSession, setSelectedSession] = useState(null);
  const [selectedDrill, setSelectedDrill] = useState(null);
  const [filter, setFilter] = useState({
    search: '',
    team: 'all',
    type: 'all',
    status: 'all',
    dateFrom: '',
    dateTo: ''
  });

  const [sessionData, setSessionData] = useState({
    title: '',
    team: '',
    date: '',
    startTime: '',
    endTime: '',
    location: '',
    type: 'technical',
    focus: '',
    objectives: [],
    drills: [],
    equipment: [],
    attendance: [],
    notes: '',
    status: 'planned',
    coach: '',
    assistants: [],
    duration: 90,
    intensity: 'medium'
  });

  const trainingTypes = [
    { id: 'technical', name: 'Technical Skills', icon: '⚽', color: 'blue', description: 'Ball control, passing, shooting' },
    { id: 'tactical', name: 'Tactical Training', icon: '🎯', color: 'purple', description: 'Positioning, formations, strategy' },
    { id: 'physical', name: 'Physical Conditioning', icon: '💪', color: 'red', description: 'Fitness, strength, endurance' },
    { id: 'mental', name: 'Mental/Psychology', icon: '🧠', color: 'pink', description: 'Focus, confidence, teamwork' },
    { id: 'goalkeeper', name: 'Goalkeeper Training', icon: '🧤', color: 'orange', description: 'GK-specific skills' },
    { id: 'set_pieces', name: 'Set Pieces', icon: '🎪', color: 'teal', description: 'Corners, free kicks, penalties' },
    { id: 'small_sided', name: 'Small-Sided Games', icon: '👥', color: 'green', description: '3v3, 5v5, mini games' },
    { id: 'scrimmage', name: 'Scrimmage/Match Practice', icon: '⚔️', color: 'indigo', description: 'Full match simulation' },
    { id: 'recovery', name: 'Recovery Session', icon: '🌟', color: 'cyan', description: 'Light training, stretching' }
  ];

  const skillFocusAreas = [
    'Ball Control', 'Passing', 'Shooting', 'Dribbling', 'Defending', 
    'Heading', 'First Touch', 'Crossing', 'Finishing', 'Tackling',
    'Positioning', 'Movement', 'Communication', 'Decision Making'
  ];

  const intensityLevels = [
    { id: 'low', name: 'Low', color: 'green', description: 'Light activity, recovery' },
    { id: 'medium', name: 'Medium', color: 'blue', description: 'Standard training' },
    { id: 'high', name: 'High', color: 'orange', description: 'Intense workout' },
    { id: 'very_high', name: 'Very High', color: 'red', description: 'Maximum effort' }
  ];

  const sessionStatuses = [
    { id: 'planned', name: 'Planned', icon: '📋', color: 'blue' },
    { id: 'confirmed', name: 'Confirmed', icon: '✓', color: 'green' },
    { id: 'in_progress', name: 'In Progress', icon: '▶️', color: 'orange' },
    { id: 'completed', name: 'Completed', icon: '✅', color: 'teal' },
    { id: 'cancelled', name: 'Cancelled', icon: '❌', color: 'red' },
    { id: 'rescheduled', name: 'Rescheduled', icon: '🔄', color: 'purple' }
  ];

  const drillCategories = [
    { id: 'warmup', name: 'Warm-up Drills', icon: '🔥', color: 'orange' },
    { id: 'technical', name: 'Technical Drills', icon: '⚽', color: 'blue' },
    { id: 'tactical', name: 'Tactical Drills', icon: '🎯', color: 'purple' },
    { id: 'physical', name: 'Physical Drills', icon: '💪', color: 'red' },
    { id: 'shooting', name: 'Shooting Drills', icon: '🎯', color: 'green' },
    { id: 'passing', name: 'Passing Drills', icon: '➡️', color: 'teal' },
    { id: 'defending', name: 'Defending Drills', icon: '🛡️', color: 'indigo' },
    { id: 'game', name: 'Game Situations', icon: '⚔️', color: 'pink' },
    { id: 'cooldown', name: 'Cool-down', icon: '🌊', color: 'cyan' }
  ];

  const tabs = [
    { id: 'overview', name: 'Overview', icon: '📊' },
    { id: 'sessions', name: 'Training Sessions', icon: '📅' },
    { id: 'plans', name: 'Training Plans', icon: '📋' },
    { id: 'drills', name: 'Drill Library', icon: '⚽' },
    { id: 'analytics', name: 'Analytics', icon: '📈' }
  ];

  useEffect(() => {
    document.title = 'Training Management - Seattle Leopards FC Admin';
    loadTrainingSessions();
    loadDrills();
  }, []);

  const loadTrainingSessions = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/training/sessions');
      if (response.ok) {
        const data = await response.json();
        setTrainingSessions(data);
      }
    } catch (error) {
      console.error('Error loading sessions:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadDrills = async () => {
    try {
      const response = await fetch('/api/training/drills');
      if (response.ok) {
        const data = await response.json();
        setDrills(data);
      }
    } catch (error) {
      console.error('Error loading drills:', error);
    }
  };

  const saveSession = async () => {
    try {
      setLoading(true);
      const url = selectedSession ? `/api/training/sessions/${selectedSession._id}` : '/api/training/sessions';
      const method = selectedSession ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(sessionData)
      });

      if (response.ok) {
        setMessage('Training session saved successfully!');
        loadTrainingSessions();
        setShowSessionForm(false);
        resetSessionData();
      } else {
        setMessage('Error saving session');
      }
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      console.error('Error saving session:', error);
      setMessage('Error saving session');
      setTimeout(() => setMessage(''), 3000);
    } finally {
      setLoading(false);
    }
  };

  const deleteSession = async (id) => {
    if (!confirm('Are you sure you want to delete this training session?')) return;

    try {
      setLoading(true);
      const response = await fetch(`/api/training/sessions/${id}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        setMessage('Session deleted successfully!');
        loadTrainingSessions();
      }
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      console.error('Error deleting session:', error);
    } finally {
      setLoading(false);
    }
  };

  const duplicateSession = async (session) => {
    const duplicated = {
      ...session,
      title: `${session.title} (Copy)`,
      status: 'planned',
      date: '',
      attendance: []
    };
    delete duplicated._id;
    
    setSessionData(duplicated);
    setShowSessionForm(true);
  };

  const resetSessionData = () => {
    setSessionData({
      title: '',
      team: '',
      date: '',
      startTime: '',
      endTime: '',
      location: '',
      type: 'technical',
      focus: '',
      objectives: [],
      drills: [],
      equipment: [],
      attendance: [],
      notes: '',
      status: 'planned',
      coach: '',
      assistants: [],
      duration: 90,
      intensity: 'medium'
    });
    setSelectedSession(null);
  };

  const addObjective = () => {
    setSessionData(prev => ({
      ...prev,
      objectives: [...prev.objectives, '']
    }));
  };

  const updateObjective = (index, value) => {
    setSessionData(prev => ({
      ...prev,
      objectives: prev.objectives.map((obj, i) => i === index ? value : obj)
    }));
  };

  const removeObjective = (index) => {
    setSessionData(prev => ({
      ...prev,
      objectives: prev.objectives.filter((_, i) => i !== index)
    }));
  };

  const getFilteredSessions = () => {
    let filtered = trainingSessions;

    if (filter.search) {
      filtered = filtered.filter(s =>
        s.title?.toLowerCase().includes(filter.search.toLowerCase()) ||
        s.team?.toLowerCase().includes(filter.search.toLowerCase()) ||
        s.focus?.toLowerCase().includes(filter.search.toLowerCase())
      );
    }
    if (filter.team !== 'all') filtered = filtered.filter(s => s.team === filter.team);
    if (filter.type !== 'all') filtered = filtered.filter(s => s.type === filter.type);
    if (filter.status !== 'all') filtered = filtered.filter(s => s.status === filter.status);
    if (filter.dateFrom) filtered = filtered.filter(s => new Date(s.date) >= new Date(filter.dateFrom));
    if (filter.dateTo) filtered = filtered.filter(s => new Date(s.date) <= new Date(filter.dateTo));

    return filtered.sort((a, b) => new Date(b.date) - new Date(a.date));
  };

  const filteredSessions = getFilteredSessions();

  const stats = {
    total: trainingSessions.length,
    upcoming: trainingSessions.filter(s => 
      (s.status === 'planned' || s.status === 'confirmed') && 
      new Date(s.date) >= new Date()
    ).length,
    completed: trainingSessions.filter(s => s.status === 'completed').length,
    thisWeek: trainingSessions.filter(s => {
      const weekAhead = new Date();
      weekAhead.setDate(weekAhead.getDate() + 7);
      const sessionDate = new Date(s.date);
      return sessionDate >= new Date() && sessionDate <= weekAhead;
    }).length,
    byType: trainingTypes.map(type => ({
      ...type,
      count: trainingSessions.filter(s => s.type === type.id).length
    })),
    totalDrills: drills.length,
    avgDuration: trainingSessions.length > 0
      ? Math.round(trainingSessions.reduce((sum, s) => sum + (s.duration || 90), 0) / trainingSessions.length)
      : 90,
    totalAttendance: trainingSessions.reduce((sum, s) => sum + (s.attendance?.length || 0), 0)
  };

  const getStatusColor = (status) => {
    const statusObj = sessionStatuses.find(s => s.id === status);
    return statusObj?.color || 'gray';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Training Management</h1>
              <p className="mt-1 text-sm text-gray-500">
                Plan, schedule, and track training sessions and player development
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
                  setShowDrillLibrary(true);
                  setActiveTab('drills');
                }}
                className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 transition-colors"
              >
                <i className="bi bi-book me-2"></i>Drill Library
              </button>
              <button
                onClick={() => {
                  resetSessionData();
                  setShowSessionForm(true);
                }}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                <i className="bi bi-plus-lg me-2"></i>New Training Session
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
                  {tab.id === 'sessions' && stats.upcoming > 0 && (
                    <span className="ml-2 bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full text-xs">
                      {stats.upcoming}
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
                    <div className="text-sm text-blue-700 mt-1">Total Sessions</div>
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
                    <div className="text-3xl font-bold text-purple-900">{stats.completed}</div>
                    <div className="text-sm text-purple-700 mt-1">Completed</div>
                  </div>
                  <div className="text-4xl">✅</div>
                </div>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-sm border">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-3xl font-bold text-orange-900">{stats.thisWeek}</div>
                    <div className="text-sm text-orange-700 mt-1">This Week</div>
                  </div>
                  <div className="text-4xl">📆</div>
                </div>
              </div>
            </div>

            {/* Training Metrics */}
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-gradient-to-br from-teal-50 to-teal-100 p-6 rounded-lg border border-teal-200">
                <div className="text-2xl font-bold text-teal-900">{stats.avgDuration} min</div>
                <div className="text-sm text-teal-700">Avg Session Duration</div>
              </div>
              <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 p-6 rounded-lg border border-indigo-200">
                <div className="text-2xl font-bold text-indigo-900">{stats.totalDrills}</div>
                <div className="text-sm text-indigo-700">Drills in Library</div>
              </div>
              <div className="bg-gradient-to-br from-pink-50 to-pink-100 p-6 rounded-lg border border-pink-200">
                <div className="text-2xl font-bold text-pink-900">{stats.totalAttendance}</div>
                <div className="text-sm text-pink-700">Total Attendance</div>
              </div>
            </div>

            {/* Training Types Grid */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Training by Type</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {stats.byType.map((type) => (
                  <div
                    key={type.id}
                    className="bg-gradient-to-br from-gray-50 to-white p-4 rounded-lg border hover:shadow-lg transition-all cursor-pointer"
                    onClick={() => {
                      setFilter(f => ({ ...f, type: type.id }));
                      setActiveTab('sessions');
                    }}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-2xl">{type.icon}</span>
                      <div className="text-2xl font-bold text-gray-800">{type.count}</div>
                    </div>
                    <h3 className="font-semibold text-gray-900 text-sm mb-1">{type.name}</h3>
                    <p className="text-xs text-gray-600">{type.description}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* What is Training Management */}
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">🎯 What is Training Management?</h2>
              <p className="text-gray-700 mb-4">
                Training Management is a comprehensive system for planning, scheduling, and tracking all training activities. 
                It helps coaches create structured training sessions, track player development, manage drill libraries, 
                and analyze training effectiveness.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-white p-4 rounded-lg border">
                  <h3 className="font-semibold text-gray-900 mb-2">📅 Session Planning</h3>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Schedule training sessions</li>
                    <li>• Set objectives and focus areas</li>
                    <li>• Plan drill sequences</li>
                    <li>• Equipment requirements</li>
                  </ul>
                </div>
                <div className="bg-white p-4 rounded-lg border">
                  <h3 className="font-semibold text-gray-900 mb-2">⚽ Drill Library</h3>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• 100+ pre-built drills</li>
                    <li>• Create custom drills</li>
                    <li>• Drill diagrams and videos</li>
                    <li>• Categorized by skill type</li>
                  </ul>
                </div>
                <div className="bg-white p-4 rounded-lg border">
                  <h3 className="font-semibold text-gray-900 mb-2">📊 Progress Tracking</h3>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Attendance tracking</li>
                    <li>• Skill development monitoring</li>
                    <li>• Player assessments</li>
                    <li>• Performance analytics</li>
                  </ul>
                </div>
                <div className="bg-white p-4 rounded-lg border">
                  <h3 className="font-semibold text-gray-900 mb-2">📋 Training Plans</h3>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Season-long plans</li>
                    <li>• Age-appropriate programs</li>
                    <li>• Progressive skill development</li>
                    <li>• Template system</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Training Sessions Tab */}
        {activeTab === 'sessions' && (
          <div className="space-y-6">
            {/* Filters */}
            <div className="bg-white rounded-lg shadow-sm border p-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                <input
                  type="text"
                  placeholder="Search sessions..."
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
                  {trainingTypes.map(type => (
                    <option key={type.id} value={type.id}>{type.icon} {type.name}</option>
                  ))}
                </select>
                <select
                  value={filter.status}
                  onChange={(e) => setFilter(f => ({ ...f, status: e.target.value }))}
                  className="border rounded px-3 py-2"
                >
                  <option value="all">All Status</option>
                  {sessionStatuses.map(status => (
                    <option key={status.id} value={status.id}>{status.icon} {status.name}</option>
                  ))}
                </select>
                <input
                  type="date"
                  value={filter.dateFrom}
                  onChange={(e) => setFilter(f => ({ ...f, dateFrom: e.target.value }))}
                  placeholder="From Date"
                  className="border rounded px-3 py-2"
                />
                <input
                  type="date"
                  value={filter.dateTo}
                  onChange={(e) => setFilter(f => ({ ...f, dateTo: e.target.value }))}
                  placeholder="To Date"
                  className="border rounded px-3 py-2"
                />
              </div>
              <div className="flex justify-between items-center mt-4">
                <p className="text-sm text-gray-600">
                  Showing {filteredSessions.length} of {trainingSessions.length} sessions
                </p>
                <button
                  onClick={() => setFilter({
                    search: '',
                    team: 'all',
                    type: 'all',
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

            {/* Sessions List */}
            <div className="space-y-4">
              {filteredSessions.length === 0 ? (
                <div className="bg-white rounded-lg shadow-sm border p-12 text-center">
                  <div className="text-6xl mb-4">📅</div>
                  <p className="text-lg font-semibold mb-2 text-gray-900">No training sessions found</p>
                  <p className="text-sm text-gray-600 mb-4">Create your first training session to get started</p>
                  <button
                    onClick={() => {
                      resetSessionData();
                      setShowSessionForm(true);
                    }}
                    className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
                  >
                    Create Session
                  </button>
                </div>
              ) : (
                filteredSessions.map((session) => {
                  const sessionType = trainingTypes.find(t => t.id === session.type);
                  return (
                    <div key={session._id} className="bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow">
                      <div className="p-6">
                        <div className="flex items-start justify-between mb-4">
                          <div>
                            <h3 className="text-xl font-bold text-gray-900 mb-2">{session.title}</h3>
                            <div className="flex items-center gap-3 flex-wrap">
                              <span className={`px-3 py-1 text-sm rounded-full bg-${sessionType?.color}-100 text-${sessionType?.color}-800`}>
                                {sessionType?.icon} {sessionType?.name}
                              </span>
                              <span className={`px-3 py-1 text-sm rounded-full bg-${getStatusColor(session.status)}-100 text-${getStatusColor(session.status)}-800`}>
                                {sessionStatuses.find(s => s.id === session.status)?.icon} {sessionStatuses.find(s => s.id === session.status)?.name}
                              </span>
                              {session.intensity && (
                                <span className={`px-3 py-1 text-sm rounded-full bg-${
                                  intensityLevels.find(i => i.id === session.intensity)?.color
                                }-100 text-${
                                  intensityLevels.find(i => i.id === session.intensity)?.color
                                }-800`}>
                                  💪 {intensityLevels.find(i => i.id === session.intensity)?.name} Intensity
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="text-right text-sm text-gray-600">
                            <div className="font-semibold">{new Date(session.date).toLocaleDateString()}</div>
                            <div className="text-xs">{session.startTime} - {session.endTime}</div>
                            <div className="text-xs text-gray-500">{session.duration} min</div>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4 text-sm">
                          <div>
                            <span className="text-gray-600">Team:</span>
                            <span className="ml-1 font-semibold text-gray-900">{session.team}</span>
                          </div>
                          <div>
                            <span className="text-gray-600">Location:</span>
                            <span className="ml-1 font-semibold text-gray-900">{session.location}</span>
                          </div>
                          <div>
                            <span className="text-gray-600">Coach:</span>
                            <span className="ml-1 font-semibold text-gray-900">{session.coach || 'TBD'}</span>
                          </div>
                          <div>
                            <span className="text-gray-600">Attendance:</span>
                            <span className="ml-1 font-semibold text-gray-900">{session.attendance?.length || 0} players</span>
                          </div>
                        </div>

                        {session.focus && (
                          <div className="mb-4">
                            <span className="text-sm text-gray-600">Focus: </span>
                            <span className="text-sm font-semibold text-gray-900">{session.focus}</span>
                          </div>
                        )}

                        {session.objectives && session.objectives.length > 0 && (
                          <div className="mb-4">
                            <span className="text-sm font-semibold text-gray-700">Objectives:</span>
                            <ul className="text-sm text-gray-600 mt-1 space-y-1">
                              {session.objectives.map((obj, idx) => (
                                <li key={idx} className="flex items-start gap-2">
                                  <span className="text-green-600">✓</span>
                                  {obj}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {/* Actions */}
                        <div className="flex gap-2 border-t pt-4">
                          <button
                            onClick={() => {
                              setSelectedSession(session);
                              setSessionData(session);
                              setShowSessionForm(true);
                            }}
                            className="flex-1 bg-blue-50 text-blue-600 px-4 py-2 rounded hover:bg-blue-100 text-sm"
                          >
                            <i className="bi bi-pencil me-1"></i>Edit
                          </button>
                          <button
                            onClick={() => duplicateSession(session)}
                            className="flex-1 bg-purple-50 text-purple-600 px-4 py-2 rounded hover:bg-purple-100 text-sm"
                          >
                            <i className="bi bi-files me-1"></i>Duplicate
                          </button>
                          <button
                            onClick={() => deleteSession(session._id)}
                            className="bg-red-50 text-red-600 px-4 py-2 rounded hover:bg-red-100 text-sm"
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

        {/* Training Plans Tab */}
        {activeTab === 'plans' && (
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="text-center py-12">
              <div className="text-6xl mb-4">📋</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Training Plans</h3>
              <p className="text-gray-600 mb-4">
                Create season-long training programs and progressive development plans
              </p>
              <p className="text-sm text-gray-500">
                Coming soon: Create multi-week training plans with progression tracking
              </p>
            </div>
          </div>
        )}

        {/* Drill Library Tab */}
        {activeTab === 'drills' && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Drill Library</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {drillCategories.map((category) => (
                  <div key={category.id} className="bg-gray-50 p-4 rounded-lg border hover:shadow-md transition-shadow cursor-pointer">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-2xl">{category.icon}</span>
                      <h3 className="font-semibold text-gray-900">{category.name}</h3>
                    </div>
                    <p className="text-sm text-gray-600">
                      {drills.filter(d => d.category === category.id).length} drills
                    </p>
                  </div>
                ))}
              </div>
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
                  {stats.completed > 0 ? (stats.totalAttendance / stats.completed).toFixed(1) : 0}
                </div>
                <div className="text-sm text-green-700">Avg Attendance</div>
              </div>
              <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-lg border border-purple-200">
                <div className="text-2xl font-bold text-purple-900">
                  {Math.round(stats.total / 12)} per month
                </div>
                <div className="text-sm text-purple-700">Training Frequency</div>
              </div>
              <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-6 rounded-lg border border-orange-200">
                <div className="text-2xl font-bold text-orange-900">
                  {Math.round(stats.total * stats.avgDuration / 60)}
                </div>
                <div className="text-sm text-orange-700">Total Training Hours</div>
              </div>
            </div>
          </div>
        )}

        {/* Training Session Form Modal */}
        {showSessionForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="bg-blue-600 text-white p-6">
                <div className="flex justify-between items-center">
                  <h2 className="text-2xl font-bold">
                    {selectedSession ? 'Edit Training Session' : 'New Training Session'}
                  </h2>
                  <button
                    onClick={() => {
                      setShowSessionForm(false);
                      resetSessionData();
                    }}
                    className="text-white text-2xl hover:text-gray-300"
                  >
                    ×
                  </button>
                </div>
              </div>

              <div className="p-6 space-y-6">
                {/* Basic Info */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Session Title *</label>
                  <input
                    type="text"
                    value={sessionData.title}
                    onChange={(e) => setSessionData(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="e.g., Ball Control & Passing Drills"
                    className="w-full border rounded-lg px-3 py-2"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Team *</label>
                    <input
                      type="text"
                      value={sessionData.team}
                      onChange={(e) => setSessionData(prev => ({ ...prev, team: e.target.value }))}
                      placeholder="Team name"
                      className="w-full border rounded-lg px-3 py-2"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Coach</label>
                    <input
                      type="text"
                      value={sessionData.coach}
                      onChange={(e) => setSessionData(prev => ({ ...prev, coach: e.target.value }))}
                      placeholder="Coach name"
                      className="w-full border rounded-lg px-3 py-2"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Date *</label>
                    <input
                      type="date"
                      value={sessionData.date}
                      onChange={(e) => setSessionData(prev => ({ ...prev, date: e.target.value }))}
                      className="w-full border rounded-lg px-3 py-2"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Start Time *</label>
                    <input
                      type="time"
                      value={sessionData.startTime}
                      onChange={(e) => setSessionData(prev => ({ ...prev, startTime: e.target.value }))}
                      className="w-full border rounded-lg px-3 py-2"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">End Time *</label>
                    <input
                      type="time"
                      value={sessionData.endTime}
                      onChange={(e) => setSessionData(prev => ({ ...prev, endTime: e.target.value }))}
                      className="w-full border rounded-lg px-3 py-2"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Duration (min)</label>
                    <input
                      type="number"
                      value={sessionData.duration}
                      onChange={(e) => setSessionData(prev => ({ ...prev, duration: parseInt(e.target.value) || 90 }))}
                      className="w-full border rounded-lg px-3 py-2"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Location *</label>
                    <input
                      type="text"
                      value={sessionData.location}
                      onChange={(e) => setSessionData(prev => ({ ...prev, location: e.target.value }))}
                      placeholder="Training ground/field"
                      className="w-full border rounded-lg px-3 py-2"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Focus Area</label>
                    <select
                      value={sessionData.focus}
                      onChange={(e) => setSessionData(prev => ({ ...prev, focus: e.target.value }))}
                      className="w-full border rounded-lg px-3 py-2"
                    >
                      <option value="">Select focus...</option>
                      {skillFocusAreas.map(skill => (
                        <option key={skill} value={skill}>{skill}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Training Type *</label>
                    <select
                      value={sessionData.type}
                      onChange={(e) => setSessionData(prev => ({ ...prev, type: e.target.value }))}
                      className="w-full border rounded-lg px-3 py-2"
                    >
                      {trainingTypes.map(type => (
                        <option key={type.id} value={type.id}>{type.icon} {type.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Intensity</label>
                    <select
                      value={sessionData.intensity}
                      onChange={(e) => setSessionData(prev => ({ ...prev, intensity: e.target.value }))}
                      className="w-full border rounded-lg px-3 py-2"
                    >
                      {intensityLevels.map(level => (
                        <option key={level.id} value={level.id}>{level.name} - {level.description}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Objectives */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Session Objectives</label>
                  {sessionData.objectives.map((objective, index) => (
                    <div key={index} className="flex gap-2 mb-2">
                      <input
                        type="text"
                        value={objective}
                        onChange={(e) => updateObjective(index, e.target.value)}
                        placeholder={`Objective ${index + 1}`}
                        className="flex-1 border rounded-lg px-3 py-2"
                      />
                      <button
                        onClick={() => removeObjective(index)}
                        className="text-red-600 hover:text-red-800 px-3"
                      >
                        <i className="bi bi-trash"></i>
                      </button>
                    </div>
                  ))}
                  <button
                    onClick={addObjective}
                    className="text-sm text-blue-600 hover:text-blue-800"
                  >
                    <i className="bi bi-plus-lg me-1"></i>Add Objective
                  </button>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Notes</label>
                  <textarea
                    rows={3}
                    value={sessionData.notes}
                    onChange={(e) => setSessionData(prev => ({ ...prev, notes: e.target.value }))}
                    placeholder="Additional notes about this session..."
                    className="w-full border rounded-lg px-3 py-2"
                  />
                </div>

                {/* Actions */}
                <div className="flex justify-end gap-3">
                  <button
                    onClick={() => {
                      setShowSessionForm(false);
                      resetSessionData();
                    }}
                    className="bg-gray-100 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-200"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={saveSession}
                    disabled={loading || !sessionData.title || !sessionData.team || !sessionData.date}
                    className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
                  >
                    {loading ? 'Saving...' : selectedSession ? 'Update Session' : 'Create Session'}
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

export default TrainingManager;


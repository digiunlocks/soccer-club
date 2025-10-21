import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const MatchManager = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [showMatchForm, setShowMatchForm] = useState(false);
  const [selectedMatch, setSelectedMatch] = useState(null);
  const [showScoreModal, setShowScoreModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [filter, setFilter] = useState({
    search: '',
    team: 'all',
    status: 'all',
    type: 'all',
    dateFrom: '',
    dateTo: ''
  });

  const [matchData, setMatchData] = useState({
    homeTeam: '',
    awayTeam: '',
    date: '',
    time: '',
    location: '',
    venue: '',
    type: 'league',
    status: 'scheduled',
    homeScore: null,
    awayScore: null,
    referee: '',
    assistantReferee1: '',
    assistantReferee2: '',
    weather: '',
    attendance: 0,
    notes: '',
    homeLineup: [],
    awayLineup: [],
    events: [],
    statistics: {
      homeShots: 0,
      awayShots: 0,
      homeShotsOnTarget: 0,
      awayShotsOnTarget: 0,
      homePossession: 50,
      awayPossession: 50,
      homeCorners: 0,
      awayCorners: 0,
      homeFouls: 0,
      awayFouls: 0,
      homeYellowCards: 0,
      awayYellowCards: 0,
      homeRedCards: 0,
      awayRedCards: 0
    }
  });

  const matchTypes = [
    { id: 'league', name: 'League Match', icon: '🏆', color: 'blue' },
    { id: 'cup', name: 'Cup Match', icon: '🥇', color: 'yellow' },
    { id: 'friendly', name: 'Friendly Match', icon: '🤝', color: 'green' },
    { id: 'tournament', name: 'Tournament', icon: '🎯', color: 'purple' },
    { id: 'playoff', name: 'Playoff', icon: '⭐', color: 'red' },
    { id: 'exhibition', name: 'Exhibition', icon: '🎪', color: 'pink' }
  ];

  const matchStatuses = [
    { id: 'scheduled', name: 'Scheduled', icon: '📅', color: 'blue' },
    { id: 'confirmed', name: 'Confirmed', icon: '✓', color: 'green' },
    { id: 'in_progress', name: 'In Progress', icon: '▶️', color: 'orange' },
    { id: 'halftime', name: 'Halftime', icon: '⏸️', color: 'yellow' },
    { id: 'completed', name: 'Completed', icon: '✅', color: 'teal' },
    { id: 'postponed', name: 'Postponed', icon: '⏰', color: 'purple' },
    { id: 'cancelled', name: 'Cancelled', icon: '❌', color: 'red' }
  ];

  const tabs = [
    { id: 'overview', name: 'Overview', icon: '📊' },
    { id: 'upcoming', name: 'Upcoming', icon: '📅' },
    { id: 'live', name: 'Live', icon: '🔴' },
    { id: 'completed', name: 'Completed', icon: '✅' },
    { id: 'all', name: 'All Matches', icon: '📋' },
    { id: 'analytics', name: 'Analytics', icon: '📈' }
  ];

  useEffect(() => {
    document.title = 'Match Management - Seattle Leopards FC Admin';
    loadMatches();
  }, []);

  const loadMatches = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/matches');
      if (response.ok) {
        const data = await response.json();
        setMatches(data);
      }
    } catch (error) {
      console.error('Error loading matches:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveMatch = async () => {
    try {
      setLoading(true);
      const url = selectedMatch ? `/api/matches/${selectedMatch._id}` : '/api/matches';
      const method = selectedMatch ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(matchData)
      });

      if (response.ok) {
        setMessage('Match saved successfully!');
        loadMatches();
        setShowMatchForm(false);
        resetMatchData();
      } else {
        setMessage('Error saving match');
      }
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      console.error('Error saving match:', error);
      setMessage('Error saving match');
      setTimeout(() => setMessage(''), 3000);
    } finally {
      setLoading(false);
    }
  };

  const updateScore = async (matchId, homeScore, awayScore) => {
    try {
      setLoading(true);
      const response = await fetch(`/api/matches/${matchId}/score`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ homeScore, awayScore, status: 'completed' })
      });

      if (response.ok) {
        setMessage('Score updated successfully!');
        loadMatches();
        setShowScoreModal(false);
      }
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      console.error('Error updating score:', error);
    } finally {
      setLoading(false);
    }
  };

  const deleteMatch = async (id) => {
    if (!confirm('Are you sure you want to delete this match?')) return;

    try {
      setLoading(true);
      const response = await fetch(`/api/matches/${id}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        setMessage('Match deleted successfully!');
        loadMatches();
      }
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      console.error('Error deleting match:', error);
    } finally {
      setLoading(false);
    }
  };

  const resetMatchData = () => {
    setMatchData({
      homeTeam: '',
      awayTeam: '',
      date: '',
      time: '',
      location: '',
      venue: '',
      type: 'league',
      status: 'scheduled',
      homeScore: null,
      awayScore: null,
      referee: '',
      assistantReferee1: '',
      assistantReferee2: '',
      weather: '',
      attendance: 0,
      notes: '',
      homeLineup: [],
      awayLineup: [],
      events: [],
      statistics: {
        homeShots: 0,
        awayShots: 0,
        homeShotsOnTarget: 0,
        awayShotsOnTarget: 0,
        homePossession: 50,
        awayPossession: 50,
        homeCorners: 0,
        awayCorners: 0,
        homeFouls: 0,
        awayFouls: 0,
        homeYellowCards: 0,
        awayYellowCards: 0,
        homeRedCards: 0,
        awayRedCards: 0
      }
    });
    setSelectedMatch(null);
  };

  const getFilteredMatches = () => {
    let filtered = matches;

    // Tab filtering
    if (activeTab === 'upcoming') {
      filtered = filtered.filter(m => 
        (m.status === 'scheduled' || m.status === 'confirmed') && 
        new Date(m.date) >= new Date()
      );
    } else if (activeTab === 'live') {
      filtered = filtered.filter(m => 
        m.status === 'in_progress' || m.status === 'halftime'
      );
    } else if (activeTab === 'completed') {
      filtered = filtered.filter(m => m.status === 'completed');
    }

    // Additional filters
    if (filter.search) {
      filtered = filtered.filter(m =>
        m.homeTeam?.toLowerCase().includes(filter.search.toLowerCase()) ||
        m.awayTeam?.toLowerCase().includes(filter.search.toLowerCase()) ||
        m.location?.toLowerCase().includes(filter.search.toLowerCase())
      );
    }
    if (filter.team !== 'all') {
      filtered = filtered.filter(m => m.homeTeam === filter.team || m.awayTeam === filter.team);
    }
    if (filter.status !== 'all') filtered = filtered.filter(m => m.status === filter.status);
    if (filter.type !== 'all') filtered = filtered.filter(m => m.type === filter.type);
    if (filter.dateFrom) filtered = filtered.filter(m => new Date(m.date) >= new Date(filter.dateFrom));
    if (filter.dateTo) filtered = filtered.filter(m => new Date(m.date) <= new Date(filter.dateTo));

    return filtered.sort((a, b) => new Date(a.date) - new Date(b.date));
  };

  const filteredMatches = getFilteredMatches();

  const stats = {
    total: matches.length,
    upcoming: matches.filter(m => 
      (m.status === 'scheduled' || m.status === 'confirmed') && 
      new Date(m.date) >= new Date()
    ).length,
    live: matches.filter(m => m.status === 'in_progress' || m.status === 'halftime').length,
    completed: matches.filter(m => m.status === 'completed').length,
    cancelled: matches.filter(m => m.status === 'cancelled').length,
    postponed: matches.filter(m => m.status === 'postponed').length,
    thisWeek: matches.filter(m => {
      const weekAhead = new Date();
      weekAhead.setDate(weekAhead.getDate() + 7);
      const matchDate = new Date(m.date);
      return matchDate >= new Date() && matchDate <= weekAhead;
    }).length,
    byType: matchTypes.map(type => ({
      ...type,
      count: matches.filter(m => m.type === type.id).length
    })),
    wins: matches.filter(m => m.status === 'completed' && m.homeScore > m.awayScore).length,
    losses: matches.filter(m => m.status === 'completed' && m.homeScore < m.awayScore).length,
    draws: matches.filter(m => m.status === 'completed' && m.homeScore === m.awayScore).length,
    totalGoalsScored: matches.filter(m => m.status === 'completed').reduce((sum, m) => sum + (m.homeScore || 0), 0),
    totalGoalsConceded: matches.filter(m => m.status === 'completed').reduce((sum, m) => sum + (m.awayScore || 0), 0)
  };

  const getStatusColor = (status) => {
    const statusObj = matchStatuses.find(s => s.id === status);
    return statusObj?.color || 'gray';
  };

  const getMatchResult = (match) => {
    if (match.status !== 'completed') return null;
    if (match.homeScore > match.awayScore) return 'win';
    if (match.homeScore < match.awayScore) return 'loss';
    return 'draw';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Match Management</h1>
              <p className="mt-1 text-sm text-gray-500">
                Schedule, track, and manage all matches and competitions
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
                  resetMatchData();
                  setShowMatchForm(true);
                }}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                <i className="bi bi-plus-lg me-2"></i>Schedule Match
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
                  {tab.id === 'live' && stats.live > 0 && (
                    <span className="ml-2 bg-red-100 text-red-800 px-2 py-0.5 rounded-full text-xs animate-pulse">
                      {stats.live} LIVE
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
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              <div className="bg-white p-6 rounded-lg shadow-sm border">
                <div className="text-3xl font-bold text-blue-900">{stats.total}</div>
                <div className="text-sm text-blue-700 mt-1">Total Matches</div>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-sm border">
                <div className="text-3xl font-bold text-green-900">{stats.upcoming}</div>
                <div className="text-sm text-green-700 mt-1">Upcoming</div>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-sm border border-red-300">
                <div className="text-3xl font-bold text-red-900">{stats.live}</div>
                <div className="text-sm text-red-700 mt-1">Live Now</div>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-sm border">
                <div className="text-3xl font-bold text-teal-900">{stats.completed}</div>
                <div className="text-sm text-teal-700 mt-1">Completed</div>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-sm border">
                <div className="text-3xl font-bold text-purple-900">{stats.postponed}</div>
                <div className="text-sm text-purple-700 mt-1">Postponed</div>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-sm border">
                <div className="text-3xl font-bold text-orange-900">{stats.thisWeek}</div>
                <div className="text-sm text-orange-700 mt-1">This Week</div>
              </div>
            </div>

            {/* Results Summary */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-lg border border-green-200">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-3xl font-bold text-green-900">{stats.wins}</div>
                    <div className="text-sm text-green-700 mt-1">Wins</div>
                  </div>
                  <div className="text-4xl">🏆</div>
                </div>
              </div>
              <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 p-6 rounded-lg border border-yellow-200">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-3xl font-bold text-yellow-900">{stats.draws}</div>
                    <div className="text-sm text-yellow-700 mt-1">Draws</div>
                  </div>
                  <div className="text-4xl">🤝</div>
                </div>
              </div>
              <div className="bg-gradient-to-br from-red-50 to-red-100 p-6 rounded-lg border border-red-200">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-3xl font-bold text-red-900">{stats.losses}</div>
                    <div className="text-sm text-red-700 mt-1">Losses</div>
                  </div>
                  <div className="text-4xl">📉</div>
                </div>
              </div>
            </div>

            {/* Goals Stats */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white p-6 rounded-lg shadow-sm border">
                <div className="text-2xl font-bold text-green-900">{stats.totalGoalsScored}</div>
                <div className="text-sm text-green-700 mt-1">Goals Scored</div>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-sm border">
                <div className="text-2xl font-bold text-red-900">{stats.totalGoalsConceded}</div>
                <div className="text-sm text-red-700 mt-1">Goals Conceded</div>
              </div>
            </div>

            {/* Match Types */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Matches by Type</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {stats.byType.map((type) => (
                  <div
                    key={type.id}
                    className="bg-gradient-to-br from-gray-50 to-white p-4 rounded-lg border hover:shadow-lg transition-all cursor-pointer"
                    onClick={() => {
                      setFilter(f => ({ ...f, type: type.id }));
                      setActiveTab('all');
                    }}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-2xl">{type.icon}</span>
                      <div className="text-2xl font-bold text-gray-800">{type.count}</div>
                    </div>
                    <h3 className="font-semibold text-gray-900 text-sm">{type.name}</h3>
                  </div>
                ))}
              </div>
            </div>

            {/* What is Match Management */}
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">⚽ What is Match Management?</h2>
              <p className="text-gray-700 mb-4">
                Match Management is a comprehensive system for scheduling, tracking, and analyzing all soccer matches. 
                It handles everything from scheduling matches to recording detailed statistics, managing officials, 
                and generating performance reports.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-white p-4 rounded-lg border">
                  <h3 className="font-semibold text-gray-900 mb-2">📅 Match Scheduling</h3>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Schedule league and cup matches</li>
                    <li>• Set dates, times, and venues</li>
                    <li>• Assign referees and officials</li>
                    <li>• Coordinate with teams</li>
                  </ul>
                </div>
                <div className="bg-white p-4 rounded-lg border">
                  <h3 className="font-semibold text-gray-900 mb-2">📊 Score & Statistics</h3>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Live score updates</li>
                    <li>• Detailed match statistics</li>
                    <li>• Player performance tracking</li>
                    <li>• Possession and shot statistics</li>
                  </ul>
                </div>
                <div className="bg-white p-4 rounded-lg border">
                  <h3 className="font-semibold text-gray-900 mb-2">👥 Officials & Lineups</h3>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Referee assignments</li>
                    <li>• Team lineups and formations</li>
                    <li>• Substitutions tracking</li>
                    <li>• Cards and discipline</li>
                  </ul>
                </div>
                <div className="bg-white p-4 rounded-lg border">
                  <h3 className="font-semibold text-gray-900 mb-2">📝 Match Reports</h3>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Post-match reports</li>
                    <li>• Match events timeline</li>
                    <li>• Weather and conditions</li>
                    <li>• Attendance tracking</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Upcoming/Live/Completed/All Matches Tabs */}
        {(activeTab === 'upcoming' || activeTab === 'live' || activeTab === 'completed' || activeTab === 'all') && (
          <div className="space-y-6">
            {/* Filters */}
            <div className="bg-white rounded-lg shadow-sm border p-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
                <input
                  type="text"
                  placeholder="Search matches..."
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
                  {matchTypes.map(type => (
                    <option key={type.id} value={type.id}>{type.icon} {type.name}</option>
                  ))}
                </select>
                {activeTab === 'all' && (
                  <select
                    value={filter.status}
                    onChange={(e) => setFilter(f => ({ ...f, status: e.target.value }))}
                    className="border rounded px-3 py-2"
                  >
                    <option value="all">All Status</option>
                    {matchStatuses.map(status => (
                      <option key={status.id} value={status.id}>{status.icon} {status.name}</option>
                    ))}
                  </select>
                )}
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
                <button
                  onClick={() => setFilter({
                    search: '',
                    team: 'all',
                    status: 'all',
                    type: 'all',
                    dateFrom: '',
                    dateTo: ''
                  })}
                  className="text-sm text-blue-600 hover:text-blue-800"
                >
                  Clear Filters
                </button>
              </div>
              <div className="mt-4 text-sm text-gray-600">
                Showing {filteredMatches.length} of {matches.length} matches
              </div>
            </div>

            {/* Matches List */}
            <div className="space-y-4">
              {filteredMatches.length === 0 ? (
                <div className="bg-white rounded-lg shadow-sm border p-12 text-center">
                  <div className="text-6xl mb-4">⚽</div>
                  <p className="text-lg font-semibold mb-2 text-gray-900">No matches found</p>
                  <p className="text-sm text-gray-600 mb-4">Schedule your first match to get started</p>
                  <button
                    onClick={() => {
                      resetMatchData();
                      setShowMatchForm(true);
                    }}
                    className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
                  >
                    Schedule Match
                  </button>
                </div>
              ) : (
                filteredMatches.map((match) => {
                  const matchType = matchTypes.find(t => t.id === match.type);
                  const result = getMatchResult(match);
                  return (
                    <div key={match._id} className="bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow">
                      <div className="p-6">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-center gap-3">
                            <span className={`px-3 py-1 text-sm rounded-full bg-${matchType?.color}-100 text-${matchType?.color}-800`}>
                              {matchType?.icon} {matchType?.name}
                            </span>
                            <span className={`px-3 py-1 text-sm rounded-full bg-${getStatusColor(match.status)}-100 text-${getStatusColor(match.status)}-800`}>
                              {matchStatuses.find(s => s.id === match.status)?.icon} {matchStatuses.find(s => s.id === match.status)?.name}
                            </span>
                            {match.status === 'in_progress' && (
                              <span className="px-3 py-1 text-sm rounded-full bg-red-100 text-red-800 animate-pulse">
                                🔴 LIVE
                              </span>
                            )}
                          </div>
                          <div className="text-right text-sm text-gray-600">
                            {new Date(match.date).toLocaleDateString()}
                            <div className="text-xs text-gray-500">{match.time}</div>
                          </div>
                        </div>

                        {/* Match Details */}
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex-1 text-right">
                            <div className="text-xl font-bold text-gray-900">{match.homeTeam}</div>
                            <div className="text-sm text-gray-600">Home</div>
                          </div>
                          
                          <div className="mx-8 text-center">
                            {match.status === 'completed' ? (
                              <div className="flex items-center gap-3">
                                <div className={`text-3xl font-bold ${
                                  result === 'win' ? 'text-green-600' :
                                  result === 'loss' ? 'text-red-600' :
                                  'text-gray-600'
                                }`}>
                                  {match.homeScore}
                                </div>
                                <div className="text-2xl text-gray-400">-</div>
                                <div className={`text-3xl font-bold ${
                                  result === 'loss' ? 'text-green-600' :
                                  result === 'win' ? 'text-red-600' :
                                  'text-gray-600'
                                }`}>
                                  {match.awayScore}
                                </div>
                              </div>
                            ) : match.status === 'in_progress' || match.status === 'halftime' ? (
                              <div className="flex items-center gap-3">
                                <div className="text-3xl font-bold text-blue-600">{match.homeScore || 0}</div>
                                <div className="text-2xl text-gray-400">-</div>
                                <div className="text-3xl font-bold text-blue-600">{match.awayScore || 0}</div>
                              </div>
                            ) : (
                              <div className="text-2xl text-gray-400">vs</div>
                            )}
                          </div>
                          
                          <div className="flex-1 text-left">
                            <div className="text-xl font-bold text-gray-900">{match.awayTeam}</div>
                            <div className="text-sm text-gray-600">Away</div>
                          </div>
                        </div>

                        {/* Location & Referee */}
                        <div className="flex items-center justify-between text-sm text-gray-600 mb-4">
                          <div className="flex items-center gap-2">
                            <i className="bi bi-geo-alt"></i>
                            <span>{match.location} {match.venue && `- ${match.venue}`}</span>
                          </div>
                          {match.referee && (
                            <div className="flex items-center gap-2">
                              <i className="bi bi-person-badge"></i>
                              <span>Ref: {match.referee}</span>
                            </div>
                          )}
                        </div>

                        {/* Actions */}
                        <div className="flex gap-2 border-t pt-4">
                          <button
                            onClick={() => {
                              setSelectedMatch(match);
                              setMatchData(match);
                              setShowMatchForm(true);
                            }}
                            className="flex-1 bg-blue-50 text-blue-600 px-4 py-2 rounded hover:bg-blue-100 text-sm"
                          >
                            <i className="bi bi-pencil me-1"></i>Edit
                          </button>
                          {(match.status === 'in_progress' || match.status === 'scheduled' || match.status === 'confirmed') && (
                            <button
                              onClick={() => {
                                setSelectedMatch(match);
                                setShowScoreModal(true);
                              }}
                              className="flex-1 bg-green-50 text-green-600 px-4 py-2 rounded hover:bg-green-100 text-sm"
                            >
                              <i className="bi bi-trophy me-1"></i>Update Score
                            </button>
                          )}
                          <button
                            onClick={() => {
                              setSelectedMatch(match);
                              setShowReportModal(true);
                            }}
                            className="flex-1 bg-purple-50 text-purple-600 px-4 py-2 rounded hover:bg-purple-100 text-sm"
                          >
                            <i className="bi bi-file-text me-1"></i>Report
                          </button>
                          <button
                            onClick={() => deleteMatch(match._id)}
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

        {/* Analytics Tab */}
        {activeTab === 'analytics' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-lg border border-blue-200">
                <div className="text-2xl font-bold text-blue-900">
                  {stats.wins > 0 ? ((stats.wins / (stats.wins + stats.losses + stats.draws)) * 100).toFixed(1) : 0}%
                </div>
                <div className="text-sm text-blue-700">Win Rate</div>
              </div>
              <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-lg border border-green-200">
                <div className="text-2xl font-bold text-green-900">
                  {stats.completed > 0 ? (stats.totalGoalsScored / stats.completed).toFixed(1) : 0}
                </div>
                <div className="text-sm text-green-700">Goals Per Match</div>
              </div>
              <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-lg border border-purple-200">
                <div className="text-2xl font-bold text-purple-900">
                  {stats.totalGoalsScored - stats.totalGoalsConceded >= 0 ? '+' : ''}
                  {stats.totalGoalsScored - stats.totalGoalsConceded}
                </div>
                <div className="text-sm text-purple-700">Goal Difference</div>
              </div>
              <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-6 rounded-lg border border-orange-200">
                <div className="text-2xl font-bold text-orange-900">
                  {stats.completed > 0 ? (stats.totalGoalsConceded / stats.completed).toFixed(1) : 0}
                </div>
                <div className="text-sm text-orange-700">Goals Conceded/Match</div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Performance Analytics</h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <span className="font-medium text-gray-900">Total Matches Played</span>
                  <span className="text-2xl font-bold text-blue-600">{stats.completed}</span>
                </div>
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <span className="font-medium text-gray-900">Points Earned (W=3, D=1)</span>
                  <span className="text-2xl font-bold text-green-600">{(stats.wins * 3) + stats.draws}</span>
                </div>
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <span className="font-medium text-gray-900">Clean Sheets</span>
                  <span className="text-2xl font-bold text-teal-600">
                    {matches.filter(m => m.status === 'completed' && m.awayScore === 0).length}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Match Form Modal */}
        {showMatchForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="bg-blue-600 text-white p-6">
                <div className="flex justify-between items-center">
                  <h2 className="text-2xl font-bold">
                    {selectedMatch ? 'Edit Match' : 'Schedule New Match'}
                  </h2>
                  <button
                    onClick={() => {
                      setShowMatchForm(false);
                      resetMatchData();
                    }}
                    className="text-white text-2xl hover:text-gray-300"
                  >
                    ×
                  </button>
                </div>
              </div>

              <div className="p-6 space-y-6">
                {/* Teams */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Home Team *</label>
                    <input
                      type="text"
                      value={matchData.homeTeam}
                      onChange={(e) => setMatchData(prev => ({ ...prev, homeTeam: e.target.value }))}
                      placeholder="Home team name"
                      className="w-full border rounded-lg px-3 py-2"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Away Team *</label>
                    <input
                      type="text"
                      value={matchData.awayTeam}
                      onChange={(e) => setMatchData(prev => ({ ...prev, awayTeam: e.target.value }))}
                      placeholder="Away team name"
                      className="w-full border rounded-lg px-3 py-2"
                      required
                    />
                  </div>
                </div>

                {/* Date, Time, Location */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Date *</label>
                    <input
                      type="date"
                      value={matchData.date}
                      onChange={(e) => setMatchData(prev => ({ ...prev, date: e.target.value }))}
                      className="w-full border rounded-lg px-3 py-2"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Time *</label>
                    <input
                      type="time"
                      value={matchData.time}
                      onChange={(e) => setMatchData(prev => ({ ...prev, time: e.target.value }))}
                      className="w-full border rounded-lg px-3 py-2"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Location *</label>
                    <input
                      type="text"
                      value={matchData.location}
                      onChange={(e) => setMatchData(prev => ({ ...prev, location: e.target.value }))}
                      placeholder="City/Area"
                      className="w-full border rounded-lg px-3 py-2"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Venue</label>
                    <input
                      type="text"
                      value={matchData.venue}
                      onChange={(e) => setMatchData(prev => ({ ...prev, venue: e.target.value }))}
                      placeholder="Stadium/Field"
                      className="w-full border rounded-lg px-3 py-2"
                    />
                  </div>
                </div>

                {/* Type & Status */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Match Type *</label>
                    <select
                      value={matchData.type}
                      onChange={(e) => setMatchData(prev => ({ ...prev, type: e.target.value }))}
                      className="w-full border rounded-lg px-3 py-2"
                    >
                      {matchTypes.map(type => (
                        <option key={type.id} value={type.id}>{type.icon} {type.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                    <select
                      value={matchData.status}
                      onChange={(e) => setMatchData(prev => ({ ...prev, status: e.target.value }))}
                      className="w-full border rounded-lg px-3 py-2"
                    >
                      {matchStatuses.map(status => (
                        <option key={status.id} value={status.id}>{status.icon} {status.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Officials */}
                <div className="border-t pt-4">
                  <h3 className="font-semibold text-gray-900 mb-3">Match Officials</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Referee</label>
                      <input
                        type="text"
                        value={matchData.referee}
                        onChange={(e) => setMatchData(prev => ({ ...prev, referee: e.target.value }))}
                        placeholder="Main referee"
                        className="w-full border rounded-lg px-3 py-2"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Assistant Referee 1</label>
                      <input
                        type="text"
                        value={matchData.assistantReferee1}
                        onChange={(e) => setMatchData(prev => ({ ...prev, assistantReferee1: e.target.value }))}
                        placeholder="Linesman 1"
                        className="w-full border rounded-lg px-3 py-2"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Assistant Referee 2</label>
                      <input
                        type="text"
                        value={matchData.assistantReferee2}
                        onChange={(e) => setMatchData(prev => ({ ...prev, assistantReferee2: e.target.value }))}
                        placeholder="Linesman 2"
                        className="w-full border rounded-lg px-3 py-2"
                      />
                    </div>
                  </div>
                </div>

                {/* Additional Info */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Weather</label>
                    <input
                      type="text"
                      value={matchData.weather}
                      onChange={(e) => setMatchData(prev => ({ ...prev, weather: e.target.value }))}
                      placeholder="e.g., Sunny, 72°F"
                      className="w-full border rounded-lg px-3 py-2"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Attendance</label>
                    <input
                      type="number"
                      value={matchData.attendance}
                      onChange={(e) => setMatchData(prev => ({ ...prev, attendance: parseInt(e.target.value) || 0 }))}
                      placeholder="0"
                      className="w-full border rounded-lg px-3 py-2"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Match Notes</label>
                  <textarea
                    rows={3}
                    value={matchData.notes}
                    onChange={(e) => setMatchData(prev => ({ ...prev, notes: e.target.value }))}
                    placeholder="Additional notes about this match..."
                    className="w-full border rounded-lg px-3 py-2"
                  />
                </div>

                {/* Actions */}
                <div className="flex justify-end gap-3">
                  <button
                    onClick={() => {
                      setShowMatchForm(false);
                      resetMatchData();
                    }}
                    className="bg-gray-100 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-200"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={saveMatch}
                    disabled={loading || !matchData.homeTeam || !matchData.awayTeam || !matchData.date}
                    className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
                  >
                    {loading ? 'Saving...' : selectedMatch ? 'Update Match' : 'Schedule Match'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Score Update Modal */}
        {showScoreModal && selectedMatch && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-2xl w-full p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Update Match Score</h2>
              
              <div className="space-y-6">
                <div className="text-center">
                  <div className="text-lg text-gray-600 mb-4">
                    {selectedMatch.homeTeam} vs {selectedMatch.awayTeam}
                  </div>
                  <div className="flex items-center justify-center gap-8">
                    <div className="text-center">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {selectedMatch.homeTeam}
                      </label>
                      <input
                        type="number"
                        value={matchData.homeScore ?? ''}
                        onChange={(e) => setMatchData(prev => ({ ...prev, homeScore: parseInt(e.target.value) || 0 }))}
                        min="0"
                        className="w-24 text-center text-3xl font-bold border-2 rounded-lg px-3 py-4"
                      />
                    </div>
                    <div className="text-3xl text-gray-400">-</div>
                    <div className="text-center">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {selectedMatch.awayTeam}
                      </label>
                      <input
                        type="number"
                        value={matchData.awayScore ?? ''}
                        onChange={(e) => setMatchData(prev => ({ ...prev, awayScore: parseInt(e.target.value) || 0 }))}
                        min="0"
                        className="w-24 text-center text-3xl font-bold border-2 rounded-lg px-3 py-4"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex justify-end gap-3">
                  <button
                    onClick={() => setShowScoreModal(false)}
                    className="bg-gray-100 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-200"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => updateScore(selectedMatch._id, matchData.homeScore, matchData.awayScore)}
                    className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700"
                  >
                    Save Score
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Match Report Modal */}
        {showReportModal && selectedMatch && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="bg-purple-600 text-white p-6">
                <div className="flex justify-between items-center">
                  <h2 className="text-2xl font-bold">Match Report</h2>
                  <button
                    onClick={() => setShowReportModal(false)}
                    className="text-white text-2xl hover:text-gray-300"
                  >
                    ×
                  </button>
                </div>
              </div>

              <div className="p-6">
                <div className="text-center mb-6">
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">
                    {selectedMatch.homeTeam} vs {selectedMatch.awayTeam}
                  </h3>
                  <p className="text-gray-600">
                    {new Date(selectedMatch.date).toLocaleDateString()} at {selectedMatch.time}
                  </p>
                  {selectedMatch.status === 'completed' && (
                    <div className="text-4xl font-bold text-blue-600 mt-4">
                      {selectedMatch.homeScore} - {selectedMatch.awayScore}
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-6 mb-6">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-gray-900 mb-2">Match Details</h4>
                    <div className="space-y-1 text-sm">
                      <div><strong>Type:</strong> {matchTypes.find(t => t.id === selectedMatch.type)?.name}</div>
                      <div><strong>Location:</strong> {selectedMatch.location}</div>
                      <div><strong>Venue:</strong> {selectedMatch.venue || 'TBD'}</div>
                      <div><strong>Weather:</strong> {selectedMatch.weather || 'N/A'}</div>
                      <div><strong>Attendance:</strong> {selectedMatch.attendance || 0}</div>
                    </div>
                  </div>

                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-gray-900 mb-2">Officials</h4>
                    <div className="space-y-1 text-sm">
                      <div><strong>Referee:</strong> {selectedMatch.referee || 'TBD'}</div>
                      <div><strong>AR1:</strong> {selectedMatch.assistantReferee1 || 'TBD'}</div>
                      <div><strong>AR2:</strong> {selectedMatch.assistantReferee2 || 'TBD'}</div>
                    </div>
                  </div>
                </div>

                {selectedMatch.statistics && selectedMatch.status === 'completed' && (
                  <div className="bg-gradient-to-r from-blue-50 to-green-50 p-4 rounded-lg mb-6">
                    <h4 className="font-semibold text-gray-900 mb-4 text-center">Match Statistics</h4>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">{selectedMatch.statistics.homeShots}</span>
                        <span className="text-sm text-gray-600">Shots</span>
                        <span className="text-sm font-medium">{selectedMatch.statistics.awayShots}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">{selectedMatch.statistics.homeShotsOnTarget}</span>
                        <span className="text-sm text-gray-600">Shots on Target</span>
                        <span className="text-sm font-medium">{selectedMatch.statistics.awayShotsOnTarget}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">{selectedMatch.statistics.homePossession}%</span>
                        <span className="text-sm text-gray-600">Possession</span>
                        <span className="text-sm font-medium">{selectedMatch.statistics.awayPossession}%</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">{selectedMatch.statistics.homeCorners}</span>
                        <span className="text-sm text-gray-600">Corners</span>
                        <span className="text-sm font-medium">{selectedMatch.statistics.awayCorners}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">{selectedMatch.statistics.homeFouls}</span>
                        <span className="text-sm text-gray-600">Fouls</span>
                        <span className="text-sm font-medium">{selectedMatch.statistics.awayFouls}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-yellow-600">{selectedMatch.statistics.homeYellowCards} 🟨</span>
                        <span className="text-sm text-gray-600">Cards</span>
                        <span className="text-sm font-medium text-yellow-600">🟨 {selectedMatch.statistics.awayYellowCards}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-red-600">{selectedMatch.statistics.homeRedCards} 🟥</span>
                        <span className="text-sm text-gray-600">Red Cards</span>
                        <span className="text-sm font-medium text-red-600">🟥 {selectedMatch.statistics.awayRedCards}</span>
                      </div>
                    </div>
                  </div>
                )}

                {selectedMatch.notes && (
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-gray-900 mb-2">Notes</h4>
                    <p className="text-sm text-gray-600">{selectedMatch.notes}</p>
                  </div>
                )}

                <div className="flex justify-end">
                  <button
                    onClick={() => setShowReportModal(false)}
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

export default MatchManager;


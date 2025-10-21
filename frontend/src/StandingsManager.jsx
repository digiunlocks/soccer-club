import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const StandingsManager = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [leagues, setLeagues] = useState([]);
  const [standings, setStandings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [showLeagueForm, setShowLeagueForm] = useState(false);
  const [showTeamForm, setShowTeamForm] = useState(false);
  const [selectedLeague, setSelectedLeague] = useState(null);
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [filter, setFilter] = useState({
    search: '',
    division: 'all',
    season: 'all'
  });

  const [leagueData, setLeagueData] = useState({
    name: '',
    division: '',
    season: '',
    startDate: '',
    endDate: '',
    teams: [],
    visibility: 'public',
    type: 'league',
    pointsForWin: 3,
    pointsForDraw: 1,
    pointsForLoss: 0,
    tiebreaker: 'goal_difference',
    description: ''
  });

  const [teamStanding, setTeamStanding] = useState({
    team: '',
    played: 0,
    won: 0,
    drawn: 0,
    lost: 0,
    goalsFor: 0,
    goalsAgainst: 0,
    goalDifference: 0,
    points: 0,
    form: [], // Last 5 results
    streak: '',
    position: 1,
    positionChange: 0
  });

  const leagueTypes = [
    { id: 'league', name: 'League/Division', icon: '🏆', color: 'blue', description: 'Regular season standings' },
    { id: 'cup', name: 'Cup Competition', icon: '🥇', color: 'yellow', description: 'Tournament bracket' },
    { id: 'tournament', name: 'Tournament', icon: '🎯', color: 'purple', description: 'Tournament standings' },
    { id: 'playoff', name: 'Playoff', icon: '⭐', color: 'red', description: 'Playoff bracket' },
    { id: 'friendly', name: 'Friendly Table', icon: '🤝', color: 'green', description: 'Non-competitive table' }
  ];

  const divisions = [
    { id: 'u6', name: 'Under 6', ageGroup: 'U6' },
    { id: 'u8', name: 'Under 8', ageGroup: 'U8' },
    { id: 'u10', name: 'Under 10', ageGroup: 'U10' },
    { id: 'u12', name: 'Under 12', ageGroup: 'U12' },
    { id: 'u14', name: 'Under 14', ageGroup: 'U14' },
    { id: 'u16', name: 'Under 16', ageGroup: 'U16' },
    { id: 'u18', name: 'Under 18', ageGroup: 'U18' },
    { id: 'adult', name: 'Adult', ageGroup: 'Adult' },
    { id: 'womens', name: "Women's", ageGroup: "Women's" }
  ];

  const tiebreakerOptions = [
    { id: 'goal_difference', name: 'Goal Difference', description: 'Goals scored minus goals conceded' },
    { id: 'goals_scored', name: 'Goals Scored', description: 'Total goals scored' },
    { id: 'head_to_head', name: 'Head-to-Head', description: 'Results between tied teams' },
    { id: 'wins', name: 'Most Wins', description: 'Number of victories' }
  ];

  const visibilityOptions = [
    { id: 'public', name: 'Public', icon: '🌐', description: 'Visible on website for fans and parents' },
    { id: 'members', name: 'Members Only', icon: '🔐', description: 'Only club members can view' },
    { id: 'internal', name: 'Internal', icon: '🏢', description: 'Staff and coaches only' }
  ];

  const tabs = [
    { id: 'overview', name: 'Overview', icon: '📊' },
    { id: 'leagues', name: 'Leagues & Divisions', icon: '🏆' },
    { id: 'standings', name: 'Standings Tables', icon: '📋' },
    { id: 'analytics', name: 'Analytics', icon: '📈' }
  ];

  useEffect(() => {
    document.title = 'Standings Management - Seattle Leopards FC Admin';
    loadLeagues();
  }, []);

  const loadLeagues = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/standings/leagues');
      if (response.ok) {
        const data = await response.json();
        setLeagues(Array.isArray(data) ? data : []);
      }
    } catch (error) {
      console.error('Error loading leagues:', error);
      setLeagues([]);
    } finally {
      setLoading(false);
    }
  };

  const loadStandings = async (leagueId) => {
    try {
      setLoading(true);
      const response = await fetch(`/api/standings/league/${leagueId}`);
      if (response.ok) {
        const data = await response.json();
        setStandings(Array.isArray(data) ? data : []);
      }
    } catch (error) {
      console.error('Error loading standings:', error);
      setStandings([]);
    } finally {
      setLoading(false);
    }
  };

  const saveLeague = async () => {
    try {
      setLoading(true);
      const url = selectedLeague ? `/api/standings/leagues/${selectedLeague._id}` : '/api/standings/leagues';
      const method = selectedLeague ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(leagueData)
      });

      if (response.ok) {
        setMessage('League saved successfully!');
        loadLeagues();
        setShowLeagueForm(false);
        resetLeagueData();
      } else {
        setMessage('Error saving league');
      }
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      console.error('Error saving league:', error);
      setMessage('Error saving league');
      setTimeout(() => setMessage(''), 3000);
    } finally {
      setLoading(false);
    }
  };

  const updateStanding = async (leagueId, teamId, updates) => {
    try {
      const response = await fetch(`/api/standings/league/${leagueId}/team/${teamId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });

      if (response.ok) {
        setMessage('Standing updated successfully!');
        loadStandings(leagueId);
      }
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      console.error('Error updating standing:', error);
    }
  };

  const calculatePoints = (won, drawn, lost) => {
    return (won * leagueData.pointsForWin) + (drawn * leagueData.pointsForDraw) + (lost * leagueData.pointsForLoss);
  };

  const resetLeagueData = () => {
    setLeagueData({
      name: '',
      division: '',
      season: '',
      startDate: '',
      endDate: '',
      teams: [],
      visibility: 'public',
      type: 'league',
      pointsForWin: 3,
      pointsForDraw: 1,
      pointsForLoss: 0,
      tiebreaker: 'goal_difference',
      description: ''
    });
    setSelectedLeague(null);
  };

  const filteredLeagues = (Array.isArray(leagues) ? leagues : []).filter(league => {
    if (filter.search && !league.name?.toLowerCase().includes(filter.search.toLowerCase())) return false;
    if (filter.division !== 'all' && league.division !== filter.division) return false;
    if (filter.season !== 'all' && league.season !== filter.season) return false;
    return true;
  });

  const stats = {
    totalLeagues: Array.isArray(leagues) ? leagues.length : 0,
    publicLeagues: Array.isArray(leagues) ? leagues.filter(l => l.visibility === 'public').length : 0,
    internalLeagues: Array.isArray(leagues) ? leagues.filter(l => l.visibility === 'internal').length : 0,
    activeSeasons: Array.isArray(leagues) ? new Set(leagues.map(l => l.season)).size : 0,
    totalTeams: Array.isArray(leagues) ? leagues.reduce((sum, l) => sum + (Array.isArray(l.teams) ? l.teams.length : 0), 0) : 0,
    byType: leagueTypes.map(type => ({
      ...type,
      count: Array.isArray(leagues) ? leagues.filter(l => l.type === type.id).length : 0
    }))
  };

  const getPositionClass = (position, totalTeams) => {
    if (position <= 3) return 'bg-green-50 border-green-200';
    if (position >= totalTeams - 2) return 'bg-red-50 border-red-200';
    return '';
  };

  const getFormBadge = (result) => {
    if (result === 'W') return <span className="w-6 h-6 rounded-full bg-green-500 text-white text-xs flex items-center justify-center">W</span>;
    if (result === 'D') return <span className="w-6 h-6 rounded-full bg-yellow-500 text-white text-xs flex items-center justify-center">D</span>;
    if (result === 'L') return <span className="w-6 h-6 rounded-full bg-red-500 text-white text-xs flex items-center justify-center">L</span>;
    return null;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Standings Management</h1>
              <p className="mt-1 text-sm text-gray-500">
                Manage league tables, rankings, and team standings (Public & Internal)
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
                  resetLeagueData();
                  setShowLeagueForm(true);
                }}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                <i className="bi bi-plus-lg me-2"></i>Create League
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
                    <div className="text-3xl font-bold text-blue-900">{stats.totalLeagues}</div>
                    <div className="text-sm text-blue-700 mt-1">Total Leagues</div>
                  </div>
                  <div className="text-4xl">🏆</div>
                </div>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-sm border">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-3xl font-bold text-green-900">{stats.activeSeasons}</div>
                    <div className="text-sm text-green-700 mt-1">Active Seasons</div>
                  </div>
                  <div className="text-4xl">📅</div>
                </div>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-sm border">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-3xl font-bold text-purple-900">{stats.totalTeams}</div>
                    <div className="text-sm text-purple-700 mt-1">Total Teams</div>
                  </div>
                  <div className="text-4xl">👥</div>
                </div>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-sm border">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-3xl font-bold text-orange-900">{stats.publicLeagues}</div>
                    <div className="text-sm text-orange-700 mt-1">Public Tables</div>
                  </div>
                  <div className="text-4xl">🌐</div>
                </div>
              </div>
            </div>

            {/* Public vs Internal */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-lg border border-blue-200">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-3xl">🌐</span>
                  <div className="text-right">
                    <div className="text-3xl font-bold text-blue-900">{stats.publicLeagues}</div>
                    <div className="text-sm text-blue-700">Public Standings</div>
                  </div>
                </div>
                <p className="text-sm text-blue-700">
                  Displayed on website for fans, parents, and players
                </p>
              </div>
              <div className="bg-gradient-to-br from-gray-50 to-gray-100 p-6 rounded-lg border border-gray-200">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-3xl">🏢</span>
                  <div className="text-right">
                    <div className="text-3xl font-bold text-gray-900">{stats.internalLeagues}</div>
                    <div className="text-sm text-gray-700">Internal Standings</div>
                  </div>
                </div>
                <p className="text-sm text-gray-700">
                  Private tables for staff evaluation and planning
                </p>
              </div>
            </div>

            {/* League Types */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Standings by Type</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {stats.byType.map((type) => (
                  <div
                    key={type.id}
                    className="bg-gradient-to-br from-gray-50 to-white p-4 rounded-lg border hover:shadow-lg transition-all cursor-pointer"
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

            {/* What is Standings Management */}
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">🏆 What is Standings Management?</h2>
              <p className="text-gray-700 mb-4">
                Standings Management maintains **league tables and team rankings** for competitions. It serves 
                **BOTH public and internal purposes** - showing fans how teams are performing while providing 
                staff with detailed analytics and private evaluation tools.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
                <div className="bg-white p-4 rounded-lg border-2 border-blue-200">
                  <h3 className="font-semibold text-blue-900 mb-3 flex items-center gap-2">
                    <span className="text-2xl">🌐</span> PUBLIC STANDINGS
                  </h3>
                  <p className="text-sm text-blue-700 mb-3 font-medium">
                    Displayed on your website for everyone to see:
                  </p>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• League tables by age group</li>
                    <li>• Team rankings and positions</li>
                    <li>• Win/Loss/Draw records</li>
                    <li>• Goals scored and conceded</li>
                    <li>• Current form (last 5 games)</li>
                    <li>• Tournament brackets</li>
                    <li>• Season standings history</li>
                  </ul>
                  <div className="mt-3 p-2 bg-blue-50 rounded text-xs text-blue-800">
                    <strong>Purpose:</strong> Keep fans, parents, and players informed of team performance
                  </div>
                </div>
                
                <div className="bg-white p-4 rounded-lg border-2 border-gray-300">
                  <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <span className="text-2xl">🏢</span> INTERNAL STANDINGS
                  </h3>
                  <p className="text-sm text-gray-700 mb-3 font-medium">
                    Private evaluation tables for staff use only:
                  </p>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Practice performance rankings</li>
                    <li>• Internal scrimmage results</li>
                    <li>• Player development tracking</li>
                    <li>• Team evaluation metrics</li>
                    <li>• Coach assessment data</li>
                    <li>• Trial period standings</li>
                    <li>• Selection criteria tracking</li>
                  </ul>
                  <div className="mt-3 p-2 bg-gray-100 rounded text-xs text-gray-800">
                    <strong>Purpose:</strong> Staff evaluation, team selection, and planning
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-white p-4 rounded-lg border">
                  <h3 className="font-semibold text-gray-900 mb-2">📊 Automatic Calculations</h3>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Points calculated automatically</li>
                    <li>• Goal difference tracking</li>
                    <li>• Automatic table sorting</li>
                    <li>• Tiebreaker rules</li>
                  </ul>
                </div>
                <div className="bg-white p-4 rounded-lg border">
                  <h3 className="font-semibold text-gray-900 mb-2">🎯 Advanced Features</h3>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Multiple tiebreaker options</li>
                    <li>• Form tracking (W/L/D)</li>
                    <li>• Position change indicators</li>
                    <li>• Historical comparisons</li>
                  </ul>
                </div>
                <div className="bg-white p-4 rounded-lg border">
                  <h3 className="font-semibold text-gray-900 mb-2">📈 Analytics</h3>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Performance trends</li>
                    <li>• Win rate statistics</li>
                    <li>• Scoring patterns</li>
                    <li>• Season comparisons</li>
                  </ul>
                </div>
                <div className="bg-white p-4 rounded-lg border">
                  <h3 className="font-semibold text-gray-900 mb-2">🔒 Visibility Control</h3>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Public website display</li>
                    <li>• Members-only access</li>
                    <li>• Internal staff view</li>
                    <li>• Flexible privacy settings</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Leagues Tab */}
        {activeTab === 'leagues' && (
          <div className="space-y-6">
            {/* Filters */}
            <div className="bg-white rounded-lg shadow-sm border p-4">
              <div className="flex gap-4">
                <input
                  type="text"
                  placeholder="Search leagues..."
                  value={filter.search}
                  onChange={(e) => setFilter(f => ({ ...f, search: e.target.value }))}
                  className="border rounded px-3 py-2 flex-1"
                />
                <select
                  value={filter.division}
                  onChange={(e) => setFilter(f => ({ ...f, division: e.target.value }))}
                  className="border rounded px-3 py-2"
                >
                  <option value="all">All Divisions</option>
                  {divisions.map(div => (
                    <option key={div.id} value={div.id}>{div.name}</option>
                  ))}
                </select>
                <button
                  onClick={() => setFilter({ search: '', division: 'all', season: 'all' })}
                  className="text-sm text-blue-600 hover:text-blue-800"
                >
                  Clear
                </button>
              </div>
            </div>

            {/* Leagues Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filteredLeagues.length === 0 ? (
                <div className="col-span-full bg-white rounded-lg shadow-sm border p-12 text-center">
                  <div className="text-6xl mb-4">🏆</div>
                  <p className="text-lg font-semibold mb-2 text-gray-900">No leagues found</p>
                  <p className="text-sm text-gray-600 mb-4">Create your first league to manage standings</p>
                  <button
                    onClick={() => {
                      resetLeagueData();
                      setShowLeagueForm(true);
                    }}
                    className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
                  >
                    Create League
                  </button>
                </div>
              ) : (
                filteredLeagues.map((league) => {
                  const leagueType = leagueTypes.find(t => t.id === league.type);
                  return (
                    <div key={league._id} className="bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow">
                      <div className={`h-2 bg-${leagueType?.color}-500 rounded-t-lg`}></div>
                      <div className="p-6">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex-1">
                            <h3 className="text-xl font-bold text-gray-900 mb-2">{league.name}</h3>
                            <div className="flex gap-2 flex-wrap">
                              <span className={`px-2 py-1 text-xs rounded-full bg-${leagueType?.color}-100 text-${leagueType?.color}-800`}>
                                {leagueType?.icon} {leagueType?.name}
                              </span>
                              <span className={`px-2 py-1 text-xs rounded-full ${
                                league.visibility === 'public' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'
                              }`}>
                                {visibilityOptions.find(v => v.id === league.visibility)?.icon} {visibilityOptions.find(v => v.id === league.visibility)?.name}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="space-y-2 text-sm mb-4">
                          <div className="flex justify-between">
                            <span className="text-gray-600">Division:</span>
                            <span className="font-semibold text-gray-900">
                              {divisions.find(d => d.id === league.division)?.name || league.division}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Season:</span>
                            <span className="font-semibold text-gray-900">{league.season}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Teams:</span>
                            <span className="font-semibold text-gray-900">
                              {Array.isArray(league.teams) ? league.teams.length : 0}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Points System:</span>
                            <span className="font-semibold text-gray-900">
                              W:{league.pointsForWin} D:{league.pointsForDraw} L:{league.pointsForLoss}
                            </span>
                          </div>
                        </div>

                        <div className="flex gap-2">
                          <button
                            onClick={() => {
                              setSelectedLeague(league);
                              loadStandings(league._id);
                              setActiveTab('standings');
                            }}
                            className="flex-1 bg-blue-50 text-blue-600 px-3 py-2 rounded hover:bg-blue-100 text-sm"
                          >
                            <i className="bi bi-table me-1"></i>View Table
                          </button>
                          <button
                            onClick={() => {
                              setSelectedLeague(league);
                              setLeagueData(league);
                              setShowLeagueForm(true);
                            }}
                            className="flex-1 bg-green-50 text-green-600 px-3 py-2 rounded hover:bg-green-100 text-sm"
                          >
                            <i className="bi bi-pencil me-1"></i>Edit
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

        {/* Standings Tables Tab */}
        {activeTab === 'standings' && (
          <div className="space-y-6">
            {selectedLeague ? (
              <div className="bg-white rounded-lg shadow-sm border">
                <div className="p-6 border-b">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900">{selectedLeague.name}</h2>
                      <p className="text-sm text-gray-600">{selectedLeague.division} - {selectedLeague.season}</p>
                    </div>
                    <button
                      onClick={() => setSelectedLeague(null)}
                      className="text-gray-600 hover:text-gray-800"
                    >
                      <i className="bi bi-x-lg"></i> Close
                    </button>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Pos</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Team</th>
                        <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">P</th>
                        <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">W</th>
                        <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">D</th>
                        <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">L</th>
                        <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">GF</th>
                        <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">GA</th>
                        <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">GD</th>
                        <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Pts</th>
                        <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Form</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {standings.length === 0 ? (
                        <tr>
                          <td colSpan="11" className="px-6 py-12 text-center text-gray-500">
                            <div className="text-6xl mb-4">📊</div>
                            <p className="text-lg font-semibold mb-2">No teams in this league yet</p>
                            <p className="text-sm">Add teams to start tracking standings</p>
                          </td>
                        </tr>
                      ) : (
                        standings.map((team, index) => (
                          <tr 
                            key={team._id || index} 
                            className={`hover:bg-gray-50 ${getPositionClass(index + 1, standings.length)}`}
                          >
                            <td className="px-6 py-4 text-center">
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-gray-900">{index + 1}</span>
                                {team.positionChange > 0 && (
                                  <i className="bi bi-arrow-up text-green-600 text-xs"></i>
                                )}
                                {team.positionChange < 0 && (
                                  <i className="bi bi-arrow-down text-red-600 text-xs"></i>
                                )}
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="font-semibold text-gray-900">{team.team}</div>
                            </td>
                            <td className="px-6 py-4 text-center text-sm text-gray-900">{team.played}</td>
                            <td className="px-6 py-4 text-center text-sm text-green-600 font-semibold">{team.won}</td>
                            <td className="px-6 py-4 text-center text-sm text-yellow-600 font-semibold">{team.drawn}</td>
                            <td className="px-6 py-4 text-center text-sm text-red-600 font-semibold">{team.lost}</td>
                            <td className="px-6 py-4 text-center text-sm text-gray-900">{team.goalsFor}</td>
                            <td className="px-6 py-4 text-center text-sm text-gray-900">{team.goalsAgainst}</td>
                            <td className="px-6 py-4 text-center">
                              <span className={`font-semibold ${
                                team.goalDifference > 0 ? 'text-green-600' :
                                team.goalDifference < 0 ? 'text-red-600' :
                                'text-gray-600'
                              }`}>
                                {team.goalDifference > 0 ? '+' : ''}{team.goalDifference}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-center">
                              <span className="font-bold text-blue-600 text-lg">{team.points}</span>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex gap-1 justify-center">
                                {Array.isArray(team.form) && team.form.slice(-5).map((result, idx) => (
                                  <div key={idx}>{getFormBadge(result)}</div>
                                ))}
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>

                {standings.length > 0 && (
                  <div className="p-4 bg-gray-50 border-t">
                    <div className="flex justify-between items-center text-sm">
                      <div className="flex gap-4">
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-4 bg-green-100 border border-green-200 rounded"></div>
                          <span className="text-gray-600">Promotion/Top 3</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-4 bg-red-100 border border-red-200 rounded"></div>
                          <span className="text-gray-600">Relegation/Bottom 3</span>
                        </div>
                      </div>
                      <div className="text-xs text-gray-500">
                        P=Played, W=Won, D=Drawn, L=Lost, GF=Goals For, GA=Goals Against, GD=Goal Difference, Pts=Points
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow-sm border p-12 text-center">
                <div className="text-6xl mb-4">📋</div>
                <p className="text-lg font-semibold mb-2 text-gray-900">Select a League</p>
                <p className="text-sm text-gray-600">Choose a league from the Leagues tab to view standings</p>
              </div>
            )}
          </div>
        )}

        {/* Analytics Tab */}
        {activeTab === 'analytics' && (
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Standings Analytics</h2>
            <div className="text-center py-12 text-gray-500">
              <div className="text-6xl mb-4">📈</div>
              <p>Detailed standings analytics coming soon...</p>
            </div>
          </div>
        )}

        {/* League Form Modal */}
        {showLeagueForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto">
              <div className="bg-blue-600 text-white p-6">
                <div className="flex justify-between items-center">
                  <h2 className="text-2xl font-bold">
                    {selectedLeague ? 'Edit League' : 'Create New League'}
                  </h2>
                  <button
                    onClick={() => {
                      setShowLeagueForm(false);
                      resetLeagueData();
                    }}
                    className="text-white text-2xl hover:text-gray-300"
                  >
                    ×
                  </button>
                </div>
              </div>

              <div className="p-6 space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">League Name *</label>
                  <input
                    type="text"
                    value={leagueData.name}
                    onChange={(e) => setLeagueData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="e.g., U14 Fall League 2025"
                    className="w-full border rounded-lg px-3 py-2"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Division *</label>
                    <select
                      value={leagueData.division}
                      onChange={(e) => setLeagueData(prev => ({ ...prev, division: e.target.value }))}
                      className="w-full border rounded-lg px-3 py-2"
                      required
                    >
                      <option value="">Select division...</option>
                      {divisions.map(div => (
                        <option key={div.id} value={div.id}>{div.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Season *</label>
                    <input
                      type="text"
                      value={leagueData.season}
                      onChange={(e) => setLeagueData(prev => ({ ...prev, season: e.target.value }))}
                      placeholder="e.g., Fall 2025"
                      className="w-full border rounded-lg px-3 py-2"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">League Type *</label>
                    <select
                      value={leagueData.type}
                      onChange={(e) => setLeagueData(prev => ({ ...prev, type: e.target.value }))}
                      className="w-full border rounded-lg px-3 py-2"
                    >
                      {leagueTypes.map(type => (
                        <option key={type.id} value={type.id}>{type.icon} {type.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Visibility *</label>
                    <select
                      value={leagueData.visibility}
                      onChange={(e) => setLeagueData(prev => ({ ...prev, visibility: e.target.value }))}
                      className="w-full border rounded-lg px-3 py-2"
                    >
                      {visibilityOptions.map(vis => (
                        <option key={vis.id} value={vis.id}>{vis.icon} {vis.name}</option>
                      ))}
                    </select>
                    <p className="text-xs text-gray-500 mt-1">
                      {visibilityOptions.find(v => v.id === leagueData.visibility)?.description}
                    </p>
                  </div>
                </div>

                <div className="border-t pt-4">
                  <h3 className="font-semibold text-gray-900 mb-3">Points System</h3>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Points for Win</label>
                      <input
                        type="number"
                        value={leagueData.pointsForWin}
                        onChange={(e) => setLeagueData(prev => ({ ...prev, pointsForWin: parseInt(e.target.value) || 3 }))}
                        className="w-full border rounded-lg px-3 py-2"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Points for Draw</label>
                      <input
                        type="number"
                        value={leagueData.pointsForDraw}
                        onChange={(e) => setLeagueData(prev => ({ ...prev, pointsForDraw: parseInt(e.target.value) || 1 }))}
                        className="w-full border rounded-lg px-3 py-2"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Points for Loss</label>
                      <input
                        type="number"
                        value={leagueData.pointsForLoss}
                        onChange={(e) => setLeagueData(prev => ({ ...prev, pointsForLoss: parseInt(e.target.value) || 0 }))}
                        className="w-full border rounded-lg px-3 py-2"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Tiebreaker Rule</label>
                  <select
                    value={leagueData.tiebreaker}
                    onChange={(e) => setLeagueData(prev => ({ ...prev, tiebreaker: e.target.value }))}
                    className="w-full border rounded-lg px-3 py-2"
                  >
                    {tiebreakerOptions.map(rule => (
                      <option key={rule.id} value={rule.id}>{rule.name} - {rule.description}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                  <textarea
                    rows={3}
                    value={leagueData.description}
                    onChange={(e) => setLeagueData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="League description..."
                    className="w-full border rounded-lg px-3 py-2"
                  />
                </div>

                <div className="flex justify-end gap-3 border-t pt-4">
                  <button
                    onClick={() => {
                      setShowLeagueForm(false);
                      resetLeagueData();
                    }}
                    className="bg-gray-100 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-200"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={saveLeague}
                    disabled={loading || !leagueData.name || !leagueData.division}
                    className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
                  >
                    {loading ? 'Saving...' : selectedLeague ? 'Update League' : 'Create League'}
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

export default StandingsManager;


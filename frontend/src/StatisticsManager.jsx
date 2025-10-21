import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const StatisticsManager = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [statistics, setStatistics] = useState({});
  const [loading, setLoading] = useState(false);
  const [dateRange, setDateRange] = useState({
    from: '',
    to: '',
    period: 'season'
  });
  const [selectedTeam, setSelectedTeam] = useState('all');
  const [selectedPlayer, setSelectedPlayer] = useState(null);

  const tabs = [
    { id: 'overview', name: 'Overview', icon: '📊' },
    { id: 'team', name: 'Team Stats', icon: '👥' },
    { id: 'player', name: 'Player Stats', icon: '⚽' },
    { id: 'match', name: 'Match Analytics', icon: '🏆' },
    { id: 'season', name: 'Season Summary', icon: '📈' },
    { id: 'comparison', name: 'Comparisons', icon: '⚖️' }
  ];

  const periodOptions = [
    { id: 'season', name: 'Current Season' },
    { id: 'month', name: 'This Month' },
    { id: 'week', name: 'This Week' },
    { id: 'custom', name: 'Custom Range' }
  ];

  useEffect(() => {
    document.title = 'Statistics & Analytics - Seattle Leopards FC Admin';
    loadStatistics();
  }, [dateRange, selectedTeam]);

  const loadStatistics = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        period: dateRange.period,
        team: selectedTeam,
        ...(dateRange.from && { from: dateRange.from }),
        ...(dateRange.to && { to: dateRange.to })
      });

      const response = await fetch(`/api/statistics?${params}`);
      if (response.ok) {
        const data = await response.json();
        setStatistics(data || {});
      }
    } catch (error) {
      console.error('Error loading statistics:', error);
      setStatistics({});
    } finally {
      setLoading(false);
    }
  };

  // Default statistics structure
  const defaultStats = {
    overview: {
      totalMatches: 0,
      wins: 0,
      draws: 0,
      losses: 0,
      goalsScored: 0,
      goalsConceded: 0,
      cleanSheets: 0,
      winRate: 0
    },
    team: {
      totalTeams: 0,
      activePlayers: 0,
      averageGoalsPerMatch: 0,
      averageAttendance: 0,
      topScorer: null,
      topAssister: null
    },
    player: {
      totalPlayers: 0,
      averageAge: 0,
      topScorers: [],
      topAssists: [],
      mostAppearances: []
    },
    match: {
      homeWins: 0,
      awayWins: 0,
      highestScore: null,
      biggestWin: null,
      longestWinStreak: 0,
      currentStreak: ''
    },
    season: {
      startDate: '',
      matchesPlayed: 0,
      matchesRemaining: 0,
      currentPosition: 0,
      pointsTotal: 0,
      goalsPerMatch: 0
    }
  };

  const stats = { ...defaultStats, ...statistics };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Statistics & Analytics</h1>
              <p className="mt-1 text-sm text-gray-500">
                Comprehensive performance analytics and statistical insights
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
                onClick={() => window.print()}
                className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors"
              >
                <i className="bi bi-printer me-2"></i>Print Report
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm border p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <select
              value={dateRange.period}
              onChange={(e) => setDateRange(prev => ({ ...prev, period: e.target.value }))}
              className="border rounded px-3 py-2"
            >
              {periodOptions.map(period => (
                <option key={period.id} value={period.id}>{period.name}</option>
              ))}
            </select>

            {dateRange.period === 'custom' && (
              <>
                <input
                  type="date"
                  value={dateRange.from}
                  onChange={(e) => setDateRange(prev => ({ ...prev, from: e.target.value }))}
                  className="border rounded px-3 py-2"
                  placeholder="From"
                />
                <input
                  type="date"
                  value={dateRange.to}
                  onChange={(e) => setDateRange(prev => ({ ...prev, to: e.target.value }))}
                  className="border rounded px-3 py-2"
                  placeholder="To"
                />
              </>
            )}

            <select
              value={selectedTeam}
              onChange={(e) => setSelectedTeam(e.target.value)}
              className="border rounded px-3 py-2"
            >
              <option value="all">All Teams</option>
              <option value="u14">U14 Team</option>
              <option value="u16">U16 Team</option>
              <option value="u18">U18 Team</option>
            </select>
          </div>
        </div>

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
            {/* Key Metrics */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-lg border border-blue-200">
                <div className="text-3xl font-bold text-blue-900">{stats.overview.totalMatches}</div>
                <div className="text-sm text-blue-700 mt-1">Matches Played</div>
              </div>
              <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-lg border border-green-200">
                <div className="text-3xl font-bold text-green-900">{stats.overview.wins}</div>
                <div className="text-sm text-green-700 mt-1">Wins</div>
              </div>
              <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 p-6 rounded-lg border border-yellow-200">
                <div className="text-3xl font-bold text-yellow-900">{stats.overview.draws}</div>
                <div className="text-sm text-yellow-700 mt-1">Draws</div>
              </div>
              <div className="bg-gradient-to-br from-red-50 to-red-100 p-6 rounded-lg border border-red-200">
                <div className="text-3xl font-bold text-red-900">{stats.overview.losses}</div>
                <div className="text-sm text-red-700 mt-1">Losses</div>
              </div>
            </div>

            {/* Win Rate & Goals */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white p-6 rounded-lg shadow-sm border">
                <div className="text-2xl font-bold text-purple-900">{stats.overview.winRate}%</div>
                <div className="text-sm text-purple-700 mt-1">Win Rate</div>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-sm border">
                <div className="text-2xl font-bold text-green-900">{stats.overview.goalsScored}</div>
                <div className="text-sm text-green-700 mt-1">Goals Scored</div>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-sm border">
                <div className="text-2xl font-bold text-red-900">{stats.overview.goalsConceded}</div>
                <div className="text-sm text-red-700 mt-1">Goals Conceded</div>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-sm border">
                <div className="text-2xl font-bold text-teal-900">{stats.overview.cleanSheets}</div>
                <div className="text-sm text-teal-700 mt-1">Clean Sheets</div>
              </div>
            </div>

            {/* What is Statistics Management */}
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">📊 What is Statistics & Analytics?</h2>
              <p className="text-gray-700 mb-4">
                Statistics & Analytics is your **data intelligence center** providing comprehensive performance metrics, 
                trends analysis, and insights across all club activities. It transforms raw match data into actionable 
                insights for coaches, management, and planning.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white p-4 rounded-lg border">
                  <h3 className="font-semibold text-gray-900 mb-2">🏆 Match Statistics</h3>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Win/Loss/Draw records</li>
                    <li>• Goals scored and conceded</li>
                    <li>• Clean sheets tracking</li>
                    <li>• Home vs away performance</li>
                    <li>• Head-to-head records</li>
                  </ul>
                </div>
                <div className="bg-white p-4 rounded-lg border">
                  <h3 className="font-semibold text-gray-900 mb-2">⚽ Player Statistics</h3>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Goals and assists leaders</li>
                    <li>• Appearances and minutes</li>
                    <li>• Shot accuracy</li>
                    <li>• Pass completion rates</li>
                    <li>• Disciplinary records</li>
                  </ul>
                </div>
                <div className="bg-white p-4 rounded-lg border">
                  <h3 className="font-semibold text-gray-900 mb-2">👥 Team Analytics</h3>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Team formation analysis</li>
                    <li>• Possession statistics</li>
                    <li>• Shooting efficiency</li>
                    <li>• Defensive metrics</li>
                    <li>• Performance trends</li>
                  </ul>
                </div>
                <div className="bg-white p-4 rounded-lg border">
                  <h3 className="font-semibold text-gray-900 mb-2">📈 Trend Analysis</h3>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Performance over time</li>
                    <li>• Improvement tracking</li>
                    <li>• Scoring patterns</li>
                    <li>• Win streak tracking</li>
                    <li>• Form analysis</li>
                  </ul>
                </div>
                <div className="bg-white p-4 rounded-lg border">
                  <h3 className="font-semibold text-gray-900 mb-2">📊 Reports</h3>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Season summary reports</li>
                    <li>• Player performance reports</li>
                    <li>• Team comparison reports</li>
                    <li>• Export to PDF/Excel</li>
                    <li>• Custom report builder</li>
                  </ul>
                </div>
                <div className="bg-white p-4 rounded-lg border">
                  <h3 className="font-semibold text-gray-900 mb-2">🎯 Insights</h3>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Strengths and weaknesses</li>
                    <li>• Areas for improvement</li>
                    <li>• Tactical recommendations</li>
                    <li>• Benchmarking</li>
                    <li>• Predictive analytics</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div className="bg-white rounded-lg shadow-sm border p-4">
                <h3 className="font-semibold text-gray-900 mb-3">⚽ Offensive Stats</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Goals Scored:</span>
                    <span className="font-bold text-green-600">{stats.overview.goalsScored}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Goals/Match:</span>
                    <span className="font-bold text-gray-900">
                      {stats.overview.totalMatches > 0 ? (stats.overview.goalsScored / stats.overview.totalMatches).toFixed(2) : '0.00'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Scoring Rate:</span>
                    <span className="font-bold text-blue-600">
                      {stats.overview.totalMatches > 0 ? ((stats.overview.goalsScored / (stats.overview.totalMatches * 90)) * 90).toFixed(1) : '0.0'}/90min
                    </span>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm border p-4">
                <h3 className="font-semibold text-gray-900 mb-3">🛡️ Defensive Stats</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Goals Conceded:</span>
                    <span className="font-bold text-red-600">{stats.overview.goalsConceded}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Conceded/Match:</span>
                    <span className="font-bold text-gray-900">
                      {stats.overview.totalMatches > 0 ? (stats.overview.goalsConceded / stats.overview.totalMatches).toFixed(2) : '0.00'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Clean Sheets:</span>
                    <span className="font-bold text-teal-600">{stats.overview.cleanSheets}</span>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm border p-4">
                <h3 className="font-semibold text-gray-900 mb-3">📊 Overall Performance</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Win Rate:</span>
                    <span className="font-bold text-purple-600">{stats.overview.winRate}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Goal Difference:</span>
                    <span className={`font-bold ${
                      (stats.overview.goalsScored - stats.overview.goalsConceded) > 0 ? 'text-green-600' :
                      (stats.overview.goalsScored - stats.overview.goalsConceded) < 0 ? 'text-red-600' :
                      'text-gray-600'
                    }`}>
                      {stats.overview.goalsScored - stats.overview.goalsConceded > 0 ? '+' : ''}
                      {stats.overview.goalsScored - stats.overview.goalsConceded}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Points:</span>
                    <span className="font-bold text-blue-600">
                      {(stats.overview.wins * 3) + stats.overview.draws}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Team Stats Tab */}
        {activeTab === 'team' && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white p-6 rounded-lg shadow-sm border">
                <div className="text-3xl font-bold text-blue-900">{stats.team.totalTeams}</div>
                <div className="text-sm text-blue-700 mt-1">Total Teams</div>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-sm border">
                <div className="text-3xl font-bold text-green-900">{stats.team.activePlayers}</div>
                <div className="text-sm text-green-700 mt-1">Active Players</div>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-sm border">
                <div className="text-3xl font-bold text-purple-900">{stats.team.averageGoalsPerMatch?.toFixed(2) || '0.00'}</div>
                <div className="text-sm text-purple-700 mt-1">Avg Goals/Match</div>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-sm border">
                <div className="text-3xl font-bold text-orange-900">{stats.team.averageAttendance}</div>
                <div className="text-sm text-orange-700 mt-1">Avg Attendance</div>
              </div>
            </div>

            {/* Top Performers */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white rounded-lg shadow-sm border p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">🥇 Top Scorer</h3>
                {stats.team.topScorer ? (
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center text-3xl">
                      ⚽
                    </div>
                    <div>
                      <div className="font-bold text-xl text-gray-900">{stats.team.topScorer.name}</div>
                      <div className="text-sm text-gray-600">{stats.team.topScorer.goals} goals</div>
                    </div>
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-8">No data available</p>
                )}
              </div>

              <div className="bg-white rounded-lg shadow-sm border p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">🎯 Top Assister</h3>
                {stats.team.topAssister ? (
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center text-3xl">
                      🅰️
                    </div>
                    <div>
                      <div className="font-bold text-xl text-gray-900">{stats.team.topAssister.name}</div>
                      <div className="text-sm text-gray-600">{stats.team.topAssister.assists} assists</div>
                    </div>
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-8">No data available</p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Player Stats Tab */}
        {activeTab === 'player' && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Top Scorers</h2>
              {Array.isArray(stats.player.topScorers) && stats.player.topScorers.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Rank</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Player</th>
                        <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Goals</th>
                        <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Assists</th>
                        <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Appearances</th>
                        <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Goals/Match</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {stats.player.topScorers.map((player, index) => (
                        <tr key={player.id || index} className="hover:bg-gray-50">
                          <td className="px-4 py-3 text-center">
                            {index === 0 && <span className="text-2xl">🥇</span>}
                            {index === 1 && <span className="text-2xl">🥈</span>}
                            {index === 2 && <span className="text-2xl">🥉</span>}
                            {index > 2 && <span className="font-semibold text-gray-700">{index + 1}</span>}
                          </td>
                          <td className="px-4 py-3 font-semibold text-gray-900">{player.name}</td>
                          <td className="px-4 py-3 text-center font-bold text-green-600">{player.goals}</td>
                          <td className="px-4 py-3 text-center text-blue-600">{player.assists || 0}</td>
                          <td className="px-4 py-3 text-center text-gray-600">{player.appearances || 0}</td>
                          <td className="px-4 py-3 text-center text-purple-600">
                            {player.appearances > 0 ? (player.goals / player.appearances).toFixed(2) : '0.00'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-12 text-gray-500">
                  <div className="text-6xl mb-4">⚽</div>
                  <p>No player statistics available</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Match Analytics Tab */}
        {activeTab === 'match' && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white p-6 rounded-lg shadow-sm border">
                <div className="text-2xl font-bold text-blue-900">{stats.match.homeWins}</div>
                <div className="text-sm text-blue-700 mt-1">Home Wins</div>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-sm border">
                <div className="text-2xl font-bold text-green-900">{stats.match.awayWins}</div>
                <div className="text-sm text-green-700 mt-1">Away Wins</div>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-sm border">
                <div className="text-2xl font-bold text-purple-900">{stats.match.longestWinStreak}</div>
                <div className="text-sm text-purple-700 mt-1">Longest Win Streak</div>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-sm border">
                <div className="font-bold text-gray-900">{stats.match.currentStreak || 'N/A'}</div>
                <div className="text-sm text-gray-700 mt-1">Current Streak</div>
              </div>
            </div>

            {stats.match.highestScore && (
              <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg border p-6">
                <h3 className="font-semibold text-gray-900 mb-3">🎯 Biggest Victory</h3>
                <div className="text-center">
                  <div className="text-4xl font-bold text-green-600 mb-2">
                    {stats.match.highestScore.home} - {stats.match.highestScore.away}
                  </div>
                  <p className="text-gray-700">
                    vs {stats.match.highestScore.opponent} on {new Date(stats.match.highestScore.date).toLocaleDateString()}
                  </p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Season Summary Tab */}
        {activeTab === 'season' && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Season Summary</h2>
              
              <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <div className="text-3xl font-bold text-blue-900">{stats.season.matchesPlayed}</div>
                  <div className="text-sm text-blue-700 mt-1">Matches Played</div>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <div className="text-3xl font-bold text-green-900">{stats.season.matchesRemaining}</div>
                  <div className="text-sm text-green-700 mt-1">Matches Remaining</div>
                </div>
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <div className="text-3xl font-bold text-purple-900">{stats.season.currentPosition || 'N/A'}</div>
                  <div className="text-sm text-purple-700 mt-1">Current Position</div>
                </div>
                <div className="text-center p-4 bg-orange-50 rounded-lg">
                  <div className="text-3xl font-bold text-orange-900">{stats.season.pointsTotal}</div>
                  <div className="text-sm text-orange-700 mt-1">Total Points</div>
                </div>
                <div className="text-center p-4 bg-teal-50 rounded-lg">
                  <div className="text-3xl font-bold text-teal-900">{stats.season.goalsPerMatch?.toFixed(1) || '0.0'}</div>
                  <div className="text-sm text-teal-700 mt-1">Goals Per Match</div>
                </div>
                <div className="text-center p-4 bg-pink-50 rounded-lg">
                  <div className="text-3xl font-bold text-pink-900">{stats.overview.winRate}%</div>
                  <div className="text-sm text-pink-700 mt-1">Success Rate</div>
                </div>
              </div>
            </div>

            {/* Season Progress */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Season Progress</h3>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-gray-600">Season Completion</span>
                    <span className="font-semibold">
                      {stats.season.matchesPlayed + stats.season.matchesRemaining > 0
                        ? Math.round((stats.season.matchesPlayed / (stats.season.matchesPlayed + stats.season.matchesRemaining)) * 100)
                        : 0}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div 
                      className="bg-blue-600 h-3 rounded-full transition-all"
                      style={{ 
                        width: `${stats.season.matchesPlayed + stats.season.matchesRemaining > 0
                          ? (stats.season.matchesPlayed / (stats.season.matchesPlayed + stats.season.matchesRemaining)) * 100
                          : 0}%` 
                      }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Comparison Tab */}
        {activeTab === 'comparison' && (
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Team & Season Comparisons</h2>
            <div className="text-center py-12 text-gray-500">
              <div className="text-6xl mb-4">⚖️</div>
              <p className="text-lg font-semibold mb-2">Comparison Tools</p>
              <p className="text-sm">Compare teams, seasons, and performance metrics</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default StatisticsManager;


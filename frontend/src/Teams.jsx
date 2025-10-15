import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const AGE_GROUPS = [
  "Under 6", "Under 8", "Under 10", "Under 12", "Under 14", 
  "Under 16", "Under 18", "Adult", "Women's", "Coed"
];

const TEAM_LEVELS = ["Recreational", "Competitive", "Elite", "Development", "All-Star"];

const API_URL = "http://localhost:5000/api/teams";

export default function Teams() {
  const navigate = useNavigate();
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [filter, setFilter] = useState({
    ageGroup: "",
    level: ""
  });

  useEffect(() => {
    fetchTeams();
  }, []);

  const fetchTeams = async () => {
    try {
      const response = await fetch(`${API_URL}/public`);
      if (!response.ok) {
        throw new Error('Failed to fetch teams');
      }
      const data = await response.json();
      setTeams(data);
    } catch (error) {
      console.error('Error fetching teams:', error);
      setError('Failed to load teams');
    } finally {
      setLoading(false);
    }
  };

  const filteredTeams = teams.filter(team => {
    if (filter.ageGroup && team.ageGroup !== filter.ageGroup) return false;
    if (filter.level && team.level !== filter.level) return false;
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

  const getPlayerPercentage = (current, max) => {
    if (!max) return 0;
    return Math.round((current / max) * 100);
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

  if (error) {
    return (
      <div className="max-w-7xl mx-auto p-6 bg-gray-50 min-h-screen">
        <div className="flex justify-center items-center h-64">
          <div className="text-xl text-red-600">{error}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6 bg-gray-50 min-h-screen">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg p-8 mb-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4">Our Teams</h1>
          <p className="text-xl text-green-100 mb-6">
            Discover our competitive and recreational teams for all ages and skill levels
          </p>
          <div className="flex justify-center gap-4">
            <button 
              onClick={() => navigate('/join/player')}
              className="bg-yellow-400 text-green-900 px-6 py-3 rounded-lg font-bold hover:bg-yellow-500 transition-colors"
            >
              Join a Team
            </button>
            <button 
              onClick={() => navigate('/schedules')}
              className="bg-white text-green-700 px-6 py-3 rounded-lg font-bold hover:bg-gray-100 transition-colors"
            >
              View Schedules
            </button>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-6 rounded-lg shadow-sm border mb-8">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Filter Teams</h2>
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
          <button
            onClick={() => setFilter({ ageGroup: "", level: "" })}
            className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 transition-colors"
          >
            Clear Filters
          </button>
        </div>
      </div>

      {/* Teams Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredTeams.map((team) => (
          <div key={team._id} className="bg-white rounded-lg shadow-sm border overflow-hidden hover:shadow-lg transition-shadow">
            {/* Team Header */}
            <div className="bg-gradient-to-r from-green-600 to-green-700 text-white p-4">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-xl font-bold">{team.name}</h3>
                  <p className="text-green-100">{team.ageGroup}</p>
                </div>
                <div className="text-right">
                  <span className={`px-2 py-1 rounded text-xs font-semibold ${getStatusColor(team.status)}`}>
                    {team.status}
                  </span>
                </div>
              </div>
            </div>

            {/* Team Info */}
            <div className="p-4">
              <div className="flex justify-between items-center mb-3">
                <span className={`px-2 py-1 rounded text-xs font-semibold ${getLevelColor(team.level)}`}>
                  {team.level}
                </span>
                <span className="text-sm text-gray-600">
                  {team.currentPlayers}/{team.maxPlayers} players
                </span>
              </div>

              {/* Progress Bar */}
              <div className="mb-4">
                <div className="flex justify-between text-xs text-gray-600 mb-1">
                  <span>Roster</span>
                  <span>{getPlayerPercentage(team.currentPlayers, team.maxPlayers)}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-green-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${getPlayerPercentage(team.currentPlayers, team.maxPlayers)}%` }}
                  ></div>
                </div>
              </div>

              {/* Quick Info */}
              <div className="space-y-2 text-sm text-gray-700 mb-4">
                <div className="flex items-center">
                  <svg className="w-4 h-4 mr-2 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  <span><strong>Coach:</strong> {team.coach}</span>
                </div>
                <div className="flex items-center">
                  <svg className="w-4 h-4 mr-2 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span><strong>Practice:</strong> {team.practiceDays}</span>
                </div>
                <div className="flex items-center">
                  <svg className="w-4 h-4 mr-2 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span><strong>Location:</strong> {team.location}</span>
                </div>
                <div className="flex items-center">
                  <svg className="w-4 h-4 mr-2 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                  </svg>
                  <span><strong>Fees:</strong> ${team.fees}/season</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2">
                <button
                  onClick={() => setSelectedTeam(team)}
                  className="flex-1 bg-green-600 text-white py-2 px-3 rounded text-sm font-semibold hover:bg-green-700 transition-colors"
                >
                  View Details
                </button>
                <button
                  onClick={() => navigate('/join/player')}
                  className="flex-1 bg-blue-600 text-white py-2 px-3 rounded text-sm font-semibold hover:bg-blue-700 transition-colors"
                >
                  Join Team
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Team Details Modal */}
      {selectedTeam && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="bg-gradient-to-r from-green-600 to-green-700 text-white p-6">
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
            
            <div className="p-6">
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
              
              <div className="mt-6">
                <h3 className="text-lg font-bold text-gray-900 mb-3">Description</h3>
                <p className="text-gray-600">{selectedTeam.description}</p>
              </div>
              
              <div className="mt-6 flex gap-4">
                <button
                  onClick={() => navigate('/join/player')}
                  className="flex-1 bg-green-600 text-white py-2 px-4 rounded font-semibold hover:bg-green-700 transition-colors"
                >
                  Join This Team
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
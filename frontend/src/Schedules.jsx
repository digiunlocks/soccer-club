import { useEffect, useState } from "react";
import { toast } from 'react-toastify';
import { API_BASE_URL } from './config/api';

export default function Schedules() {
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState({
    team: "",
    eventType: "",
    dateFrom: "",
    dateTo: ""
  });

  const TEAMS = [
    "U8 Leopards", "U10 Tigers", "U12 Lions", "U14 Panthers", "U16 Warriors", 
    "U18 Elite", "Adult Leopards", "Women's Team", "Coed Team"
  ];

  const EVENT_TYPES = [
    "Practice", "Game", "Tournament", "Tryout", "Meeting", "Training", 
    "Scrimmage", "Friendly Match", "Championship", "Workshop"
  ];

  useEffect(() => {
    fetchSchedules();
  }, [filter]);

  const fetchSchedules = async () => {
    setLoading(true);
    try {
      console.log('Fetching schedules with filters:', filter);
      
      let url = `${API_BASE_URL}/schedules/public?`;
      if (filter.team) url += `team=${filter.team}&`;
      if (filter.eventType) url += `eventType=${filter.eventType}&`;
      if (filter.dateFrom) url += `dateFrom=${filter.dateFrom}&`;
      if (filter.dateTo) url += `dateTo=${filter.dateTo}&`;
      
      console.log('Fetching from URL:', url);
      
      const res = await fetch(url);
      console.log('Schedules response status:', res.status);
      
      if (!res.ok) {
        const errorText = await res.text();
        console.error('Schedules fetch error:', errorText);
        throw new Error(`Failed to fetch schedules: ${res.status} ${res.statusText}`);
      }
      
      const data = await res.json();
      console.log('Schedules data received:', data);
      setSchedules(data);
    } catch (err) {
      console.error('Error fetching schedules:', err);
      toast.error("Failed to load schedules: " + err.message);
    }
    setLoading(false);
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

  const formatTimeRange = (startTime, endTime) => {
    return `${startTime} - ${endTime}`;
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-green-900 mb-4">Team Schedules</h1>
        <p className="text-lg text-gray-600">Stay updated with all our upcoming events, practices, and games</p>
      </div>

      {/* Filters */}
      <div className="bg-gray-50 p-6 rounded-lg mb-8">
        <h2 className="text-xl font-semibold mb-4 text-green-900">Filter Events</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <select 
            value={filter.team} 
            onChange={e => setFilter(f => ({ ...f, team: e.target.value }))}
            className="border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            <option value="">All Teams</option>
            {TEAMS.map(team => <option key={team} value={team}>{team}</option>)}
          </select>
          <select 
            value={filter.eventType} 
            onChange={e => setFilter(f => ({ ...f, eventType: e.target.value }))}
            className="border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            <option value="">All Event Types</option>
            {EVENT_TYPES.map(type => <option key={type} value={type}>{type}</option>)}
          </select>
          <div className="col-span-2 md:col-span-2 flex flex-col md:flex-row items-stretch gap-2 bg-white rounded p-2 border border-gray-200">
            <div className="flex flex-col flex-1">
              <label htmlFor="dateFrom" className="text-xs text-gray-500 mb-1 ml-1">From</label>
              <input 
                id="dateFrom"
                type="date" 
                value={filter.dateFrom} 
                onChange={e => setFilter(f => ({ ...f, dateFrom: e.target.value }))}
                placeholder="From Date"
                className="border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 w-full"
              />
            </div>
            <div className="flex items-center justify-center px-2 text-gray-500 font-medium text-sm h-full">to</div>
            <div className="flex flex-col flex-1">
              <label htmlFor="dateTo" className="text-xs text-gray-500 mb-1 ml-1">To</label>
              <input 
                id="dateTo"
                type="date" 
                value={filter.dateTo} 
                onChange={e => setFilter(f => ({ ...f, dateTo: e.target.value }))}
                placeholder="To Date"
                className="border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 w-full"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Schedule Display */}
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="loader"></div>
          <span className="ml-3 text-lg">Loading schedules...</span>
        </div>
      ) : schedules.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-2xl font-semibold text-gray-600 mb-2">No events found</div>
          <div className="text-gray-500">Try adjusting your filters or check back later for new events</div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {schedules.map(schedule => (
            <div key={schedule._id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
              <div className="p-6">
                <div className="flex items-start justify-between mb-3">
                  <h3 className="text-xl font-bold text-green-900">{schedule.title}</h3>
                  <span className={`px-2 py-1 rounded text-xs font-semibold ${getEventTypeColor(schedule.eventType)}`}>
                    {schedule.eventType}
                  </span>
                </div>
                
                <div className="space-y-2 text-sm text-gray-600">
                  <div className="flex items-center">
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    {schedule.location}
                  </div>
                  
                  <div className="flex items-center">
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {formatDateTime(schedule.startDate, schedule.startTime)}
                  </div>
                  
                  <div className="flex items-center">
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    {schedule.team}
                  </div>
                  
                  {schedule.coach && (
                    <div className="flex items-center">
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      Coach: {schedule.coach}
                    </div>
                  )}
                  
                  {schedule.cost && (
                    <div className="flex items-center">
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                      </svg>
                      Cost: ${schedule.cost}
                    </div>
                  )}
                </div>
                
                {schedule.description && (
                  <div className="mt-4 p-3 bg-gray-50 rounded">
                    <p className="text-sm text-gray-700">{schedule.description}</p>
                  </div>
                )}
                
                {schedule.requiresRegistration && (
                  <div className="mt-4">
                    <span className="inline-block bg-yellow-100 text-yellow-800 px-2 py-1 rounded text-xs font-semibold">
                      Registration Required
                    </span>
                  </div>
                )}
                
                {schedule.weatherDependent && (
                  <div className="mt-2">
                    <span className="inline-block bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs font-semibold">
                      Weather Dependent
                    </span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Call to Action */}
      <div className="mt-12 text-center bg-green-50 p-8 rounded-lg">
        <h2 className="text-2xl font-bold text-green-900 mb-4">Join Our Club</h2>
        <p className="text-gray-600 mb-6">Interested in joining one of our teams? Apply today and become part of the Seattle Leopards FC family!</p>
        <div className="flex flex-wrap justify-center gap-4">
          <a 
            href="/join/player" 
            className="bg-green-700 text-white px-6 py-3 rounded font-bold hover:bg-green-800 transition"
          >
            Apply as Player
          </a>
          <a 
            href="/join/coach" 
            className="bg-yellow-600 text-white px-6 py-3 rounded font-bold hover:bg-yellow-700 transition"
          >
            Apply as Coach
          </a>
          <a 
            href="/join/volunteer" 
            className="bg-purple-600 text-white px-6 py-3 rounded font-bold hover:bg-purple-700 transition"
          >
            Volunteer
          </a>
        </div>
      </div>
    </div>
  );
} 
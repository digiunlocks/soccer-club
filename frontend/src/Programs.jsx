import { useState, useEffect } from "react";
import { API_BASE_URL } from './config/api';

export default function Programs() {
  const [programs, setPrograms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState({ name: "", zip: "", city: "", state: "" });

  useEffect(() => {
    fetchPrograms();
  }, []);

  const fetchPrograms = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/programs`);
      
      if (!response.ok) {
        throw new Error("Failed to fetch programs");
      }
      
      const data = await response.json();
      setPrograms(data);
    } catch (err) {
      console.error("Error fetching programs:", err);
      setError("Failed to load programs. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const filteredPrograms = programs.filter(program => {
    const matchesName = !filter.name || 
      program.name.toLowerCase().includes(filter.name.toLowerCase());
    const matchesZip = !filter.zip || 
      (program.zipCodes && program.zipCodes.some(zip => zip.includes(filter.zip)));
    const matchesCity = !filter.city || 
      (program.city && program.city.toLowerCase().includes(filter.city.toLowerCase()));
    const matchesState = !filter.state || 
      (program.state && program.state.toLowerCase().includes(filter.state.toLowerCase()));
    
    return matchesName && matchesZip && matchesCity && matchesState;
  });

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="loader"></div>
          <span className="ml-3 text-lg">Loading programs...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-green-900 mb-4">Our Programs & Areas</h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Discover the various programs and areas where Seattle Leopards FC operates. 
          Find the perfect program for your location and get involved in our soccer community.
        </p>
      </div>

      {/* Search and Filter Section */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <h2 className="text-xl font-semibold text-green-900 mb-4">Find Programs Near You</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <input
            type="text"
            placeholder="Search by program name..."
            value={filter.name}
            onChange={(e) => setFilter(prev => ({ ...prev, name: e.target.value }))}
            className="border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
          />
          <input
            type="text"
            placeholder="Filter by zip code..."
            value={filter.zip}
            onChange={(e) => setFilter(prev => ({ ...prev, zip: e.target.value }))}
            className="border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
          />
          <input
            type="text"
            placeholder="Filter by city..."
            value={filter.city}
            onChange={(e) => setFilter(prev => ({ ...prev, city: e.target.value }))}
            className="border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
          />
          <input
            type="text"
            placeholder="Filter by state..."
            value={filter.state}
            onChange={(e) => setFilter(prev => ({ ...prev, state: e.target.value }))}
            className="border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Programs Display */}
      {filteredPrograms.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-gray-400 mb-4">
            <svg className="mx-auto h-16 w-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6-4h6m2 5.291A7.962 7.962 0 0112 15c-2.34 0-4.47-.881-6.08-2.33" />
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-gray-600 mb-2">No Programs Found</h3>
          <p className="text-gray-500">
            {programs.length === 0 
              ? "No programs are currently available." 
              : "Try adjusting your search filters to find programs in your area."
            }
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPrograms.map((program) => (
            <div key={program._id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <h3 className="text-xl font-bold text-green-900">{program.name}</h3>
                  {program.visible && (
                    <span className="bg-green-100 text-green-800 text-xs font-semibold px-2 py-1 rounded-full">
                      Active
                    </span>
                  )}
                </div>
                
                {program.description && (
                  <p className="text-gray-600 mb-4 line-clamp-3">{program.description}</p>
                )}
                
                <div className="space-y-2 mb-4">
                  {program.address && (
                    <div className="flex items-center text-sm text-gray-600">
                      <svg className="w-4 h-4 mr-2 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      <span>{program.address}</span>
                    </div>
                  )}
                  
                  {(program.city || program.state) && (
                    <div className="flex items-center text-sm text-gray-600">
                      <svg className="w-4 h-4 mr-2 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                      </svg>
                      <span>{[program.city, program.state].filter(Boolean).join(", ")}</span>
                    </div>
                  )}
                  
                  {program.zipCodes && program.zipCodes.length > 0 && (
                    <div className="flex items-center text-sm text-gray-600">
                      <svg className="w-4 h-4 mr-2 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
                      </svg>
                      <span>ZIP: {program.zipCodes.join(", ")}</span>
                    </div>
                  )}
                </div>
                
                {(program.assignedTeam || program.assignedCoach) && (
                  <div className="border-t pt-4 mb-4">
                    <h4 className="text-sm font-semibold text-green-800 mb-2">Program Staff</h4>
                    <div className="space-y-1">
                      {program.assignedTeam && (
                        <div className="text-sm text-gray-600">
                          <span className="font-medium">Team:</span> {program.assignedTeam}
                        </div>
                      )}
                      {program.assignedCoach && (
                        <div className="text-sm text-gray-600">
                          <span className="font-medium">Coach:</span> {program.assignedCoach}
                        </div>
                      )}
                    </div>
                  </div>
                )}
                
                <div className="flex flex-wrap gap-2">
                  {program.contact && (
                    <a
                      href={`mailto:${program.contact}`}
                      className="inline-flex items-center px-3 py-1 bg-green-100 text-green-800 text-sm rounded-full hover:bg-green-200 transition-colors"
                    >
                      <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                      Contact
                    </a>
                  )}
                  
                  {program.website && (
                    <a
                      href={program.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full hover:bg-blue-200 transition-colors"
                    >
                      <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9v-9m0-9v9" />
                      </svg>
                      Website
                    </a>
                  )}
                  
                  {program.registrationLink && (
                    <a
                      href={program.registrationLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center px-3 py-1 bg-yellow-100 text-yellow-800 text-sm rounded-full hover:bg-yellow-200 transition-colors"
                    >
                      <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                      </svg>
                      Register
                    </a>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      
      {/* Results Summary */}
      {filteredPrograms.length > 0 && (
        <div className="mt-8 text-center text-gray-600">
          <p>
            Showing {filteredPrograms.length} of {programs.length} programs
            {Object.values(filter).some(v => v) && " (filtered)"}
          </p>
        </div>
      )}
    </div>
  );
} 
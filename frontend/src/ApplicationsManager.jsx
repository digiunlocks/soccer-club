import { useEffect, useState } from "react";
import { toast } from 'react-toastify';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { api, API_ENDPOINTS } from "./config/api";

const typeLabels = {
  player: "Player",
  coach: "Coach",
  referee: "Referee",
  volunteer: "Volunteer",
};

export default function ApplicationsManager() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [apps, setApps] = useState([]);
  const [filter, setFilter] = useState({ 
    type: searchParams.get('type') || "", 
    status: searchParams.get('status') || "pending" 
  });
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState("");
  const [actionType, setActionType] = useState("");
  const [actionReason, setActionReason] = useState("");
  const [sendEmail, setSendEmail] = useState(true);
  const [pendingCount, setPendingCount] = useState(0);
  const [approvedCount, setApprovedCount] = useState(0);
  const [deniedCount, setDeniedCount] = useState(0);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const fetchApps = async () => {
    setLoading(true);
    setError("");
    try {
      let url = API_ENDPOINTS.APPLICATIONS.BASE + "?";
      if (filter.type) url += `type=${filter.type}&`;
      if (filter.status) url += `status=${filter.status}`;
      const data = await api.get(url);
      setApps(data);
      
      // Update URL params
      const newParams = new URLSearchParams();
      if (filter.type) newParams.set('type', filter.type);
      if (filter.status) newParams.set('status', filter.status);
      setSearchParams(newParams);
    } catch (err) {
      console.error("Error fetching applications:", err);
      if (err.message.includes('429')) {
        setError("Too many requests. Please wait a moment and try again.");
        toast.error("Rate limit exceeded. Please wait before trying again.");
      } else {
        setError("Failed to load applications. Please try again.");
        toast.error("Failed to load applications");
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchCounts = async () => {
    try {
      // Use a single API call to get all applications and count them locally
      const allData = await api.get(API_ENDPOINTS.APPLICATIONS.BASE);
      
      const pending = allData.filter(app => app.status === 'pending');
      const approved = allData.filter(app => app.status === 'approved');
      const denied = allData.filter(app => app.status === 'denied');
      
      setPendingCount(pending.length);
      setApprovedCount(approved.length);
      setDeniedCount(denied.length);
    } catch (err) {
      console.error("Failed to fetch counts:", err);
      // Don't show error toast for counts, just log it
    }
  };

  useEffect(() => { 
    // Add a longer delay to prevent rapid successive calls and rate limiting
    const timer = setTimeout(() => {
      fetchApps();
      fetchCounts();
    }, 300);
    
    return () => clearTimeout(timer);
  }, [filter]);

  const handleAction = async (id, action, reason, email) => {
    setActionLoading(true);
    setError("");
    try {
      await api.put(`${API_ENDPOINTS.APPLICATIONS.BASE}/${id}`, { status: action, actionReason: reason, sendEmail: email });
      setSelected(null);
      setActionType("");
      
      // Add delay before refetching to avoid rate limits
      setTimeout(() => {
        fetchApps();
        fetchCounts();
      }, 500);
      
      toast.success(`Application ${action === 'approved' ? 'approved' : 'denied'}${email ? ' and applicant emailed.' : '.'}`);
    } catch (err) {
      console.error("Error updating application:", err);
      if (err.message.includes('429')) {
        setError("Too many requests. Please wait a moment and try again.");
        toast.error("Rate limit exceeded. Please wait before trying again.");
      } else {
        setError("Failed to update application. Please try again.");
        toast.error("Failed to update application");
      }
    }
    setActionLoading(false);
  };

  const handleDelete = async (id) => {
    setDeleteLoading(true);
    try {
      await api.delete(`${API_ENDPOINTS.APPLICATIONS.BASE}/${id}`);
      setDeleteConfirm(null);
      
      // Add delay before refetching to avoid rate limits
      setTimeout(() => {
        fetchApps();
        fetchCounts();
      }, 500);
      
      toast.success("Application deleted successfully");
    } catch (err) {
      console.error("Error deleting application:", err);
      if (err.message.includes('429')) {
        toast.error("Rate limit exceeded. Please wait before trying again.");
      } else {
        toast.error("Failed to delete application");
      }
    }
    setDeleteLoading(false);
  };

  const updateFilter = (newFilter) => {
    setFilter(newFilter);
  };

  return (
    <div className="max-w-5xl mx-auto p-2 sm:p-6 bg-white rounded shadow mt-8">
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
          <h2 className="text-2xl font-bold text-green-900">Applications Manager</h2>
        </div>
        <div className="flex gap-2">
          {filter.status === "pending" && pendingCount > 0 && (
            <div className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm font-semibold">
              {pendingCount} pending
            </div>
          )}
          {filter.status === "approved" && approvedCount > 0 && (
            <div className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-semibold">
              {approvedCount} approved
            </div>
          )}
          {filter.status === "denied" && deniedCount > 0 && (
            <div className="bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm font-semibold">
              {deniedCount} denied
            </div>
          )}
        </div>
      </div>
      
      <div className="flex flex-wrap gap-4 mb-6">
        <select 
          value={filter.type} 
          onChange={e => updateFilter({ ...filter, type: e.target.value })} 
          className="border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
        >
          <option value="">All Types</option>
          <option value="player">Player</option>
          <option value="coach">Coach</option>
          <option value="referee">Referee</option>
          <option value="volunteer">Volunteer</option>
        </select>
        <select 
          value={filter.status} 
          onChange={e => updateFilter({ ...filter, status: e.target.value })} 
          className="border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
        >
          <option value="">All Statuses</option>
          <option value="pending">Pending ({pendingCount})</option>
          <option value="approved">Approved ({approvedCount})</option>
          <option value="denied">Denied ({deniedCount})</option>
        </select>
        <div className="flex gap-2">
          <button 
            onClick={() => updateFilter({ type: "", status: "pending" })}
            className="bg-yellow-600 text-white px-4 py-2 rounded font-bold hover:bg-yellow-700 transition"
          >
            Show Pending
          </button>
          <button 
            onClick={() => updateFilter({ type: "", status: "approved" })}
            className="bg-green-600 text-white px-4 py-2 rounded font-bold hover:bg-green-700 transition"
          >
            Show Approved
          </button>
          <button 
            onClick={() => updateFilter({ type: "", status: "denied" })}
            className="bg-red-600 text-white px-4 py-2 rounded font-bold hover:bg-red-700 transition"
          >
            Show Denied
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <svg className="w-5 h-5 text-red-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <span className="text-red-800 font-medium">{error}</span>
            </div>
            <button
              onClick={() => {
                setError("");
                fetchApps();
                fetchCounts();
              }}
              className="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700 transition-colors"
            >
              Retry
            </button>
          </div>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center items-center h-32">
          <div className="loader"></div>
          <span className="ml-3">Loading applications...</span>
        </div>
      ) : error ? (
        <div className="text-red-600 text-center p-4">{error}</div>
      ) : apps.length === 0 ? (
        <div className="text-center p-8 text-gray-500">
          <div className="text-lg mb-2">No applications found</div>
          <div className="text-sm">Try adjusting your filters or check back later.</div>
      </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full mb-6 border text-xs sm:text-sm">
          <thead>
            <tr className="bg-green-100">
                <th className="p-2 text-left">Type</th>
                <th className="p-2 text-left">Name</th>
                <th className="p-2 text-left">Email</th>
                <th className="p-2 text-left">Status</th>
                <th className="p-2 text-left">Date</th>
                <th className="p-2 text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {apps.map(app => (
              <tr key={app._id} className="border-t hover:bg-green-50">
                  <td className="p-2">
                    <span className={`inline-block px-2 py-1 rounded text-xs font-bold ${
                      app.type === 'player' ? 'bg-blue-100 text-blue-800' : 
                      app.type === 'coach' ? 'bg-yellow-100 text-yellow-800' : 
                      app.type === 'referee' ? 'bg-purple-100 text-purple-800' : 
                      'bg-pink-100 text-pink-800'
                    }`}>
                      {typeLabels[app.type]}
                    </span>
                  </td>
                  <td className="p-2 font-semibold">{app.info.name}</td>
                <td className="p-2">{app.info.email}</td>
                <td className="p-2">
                    <span className={`capitalize font-semibold px-2 py-1 rounded text-xs ${
                      app.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      app.status === 'approved' ? 'bg-green-100 text-green-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {app.status}
                    </span>
                  </td>
                  <td className="p-2 text-xs text-gray-600">
                    {new Date(app.createdAt).toLocaleDateString()}
                  </td>
                  <td className="p-2 text-center">
                    <div className="flex gap-2 justify-center">
                      <button 
                        onClick={() => setSelected(app)} 
                        className="text-blue-700 underline font-semibold hover:text-blue-900"
                      >
                        {app.status === 'pending' ? 'Review' : 'View'}
                      </button>
                      <button 
                        onClick={() => setDeleteConfirm(app)} 
                        className="text-red-600 underline font-semibold hover:text-red-800"
                      >
                        Delete
                      </button>
                    </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        </div>
      )}

      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60">
          <div className="bg-white rounded-lg shadow-lg max-w-2xl w-full p-6 relative max-h-[90vh] overflow-y-auto">
            <button className="absolute top-2 right-2 text-green-900 hover:text-green-700 text-2xl font-bold" onClick={() => setSelected(null)} aria-label="Close">×</button>
            <h3 className="text-xl font-bold mb-4 text-green-900">{typeLabels[selected.type]} Application</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4 text-sm text-gray-700">
              <div>
              <strong>Name:</strong> {selected.info.name}<br />
              <strong>Email:</strong> {selected.info.email}<br />
              <strong>Status:</strong> <span className="capitalize">{selected.status}</span><br />
                {selected.actionReason && <><strong>Decision Reason:</strong> {selected.actionReason}<br /></>}
              {selected.info.dob && <><strong>DOB:</strong> {selected.info.dob} (Age: {selected.info.age})<br /></>}
              {selected.info.phone && <><strong>Phone:</strong> {selected.info.phone}<br /></>}
                {selected.info.gender && <><strong>Gender:</strong> {selected.info.gender}<br /></>}
              </div>
              <div>
              {selected.info.address && <><strong>Address:</strong> {selected.info.address}, {selected.info.city}, {selected.info.state} {selected.info.zip}<br /></>}
              {selected.info.position && <><strong>Position:</strong> {selected.info.position}<br /></>}
              {selected.info.experience && <><strong>Experience:</strong> {selected.info.experience}<br /></>}
              {selected.info.interests && <><strong>Interests:</strong> {selected.info.interests}<br /></>}
              {selected.info.medical && <><strong>Medical:</strong> {selected.info.medical}<br /></>}
              {selected.info.emergencyName && <><strong>Emergency Contact:</strong> {selected.info.emergencyName} ({selected.info.emergencyPhone})<br /></>}
              </div>
            </div>
            <div className="flex gap-4 mt-4">
              {(selected.status === "pending") && (
                <>
                  <button 
                    onClick={() => { setActionType("approved"); setActionReason(""); setSendEmail(true); }} 
                    className="bg-green-700 text-white px-4 py-2 rounded font-bold hover:bg-green-800 transition" 
                    disabled={actionLoading}
                  >
                    Approve
                  </button>
                  <button 
                    onClick={() => { setActionType("denied"); setActionReason(""); setSendEmail(true); }} 
                    className="bg-red-600 text-white px-4 py-2 rounded font-bold hover:bg-red-700 transition" 
                    disabled={actionLoading}
                  >
                    Deny
                  </button>
                </>
              )}
              {selected.status === "approved" && selected.type === "player" && (
                <div className="flex items-center gap-2">
                  <input 
                    type="text" 
                    placeholder="Assign to team..." 
                    className="border rounded px-2 py-1" 
                    onBlur={e => handleAction(selected._id, { ...selected, assignedTeam: e.target.value })} 
                  />
                <span className="text-xs text-gray-600">(Assign team and click outside)</span>
                </div>
              )}
              <button 
                onClick={() => setDeleteConfirm(selected)} 
                className="bg-red-600 text-white px-4 py-2 rounded font-bold hover:bg-red-700 transition"
              >
                Delete Application
              </button>
            </div>
            {error && <div className="text-red-600 text-sm mt-2">{error}</div>}
          </div>
        </div>
      )}

      {/* Action Reason Modal */}
      {actionType && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60">
          <div className="bg-white rounded-lg shadow-lg max-w-md w-full p-6 relative">
            <button className="absolute top-2 right-2 text-green-900 hover:text-green-700 text-2xl font-bold" onClick={() => setActionType("")} aria-label="Close">×</button>
            <h3 className="text-xl font-bold mb-4 text-green-900">{actionType === "approved" ? "Approve" : "Deny"} Application</h3>
            <label className="block mb-2 font-semibold">Reason (optional, will be sent to applicant)</label>
            <textarea 
              value={actionReason} 
              onChange={e => setActionReason(e.target.value)} 
              className="border rounded px-3 py-2 w-full mb-4 focus:outline-none focus:ring-2 focus:ring-green-500" 
              rows={3} 
              placeholder="Enter reason for approval/denial..."
            />
            <label className="flex gap-2 items-center mb-4">
              <input 
                type="checkbox" 
                checked={sendEmail} 
                onChange={e => setSendEmail(e.target.checked)} 
                className="rounded"
              /> 
              Email applicant with this decision
            </label>
            <div className="flex gap-4">
              <button 
                onClick={() => { handleAction(selected._id, actionType, actionReason, sendEmail); }} 
                className="bg-green-700 text-white px-4 py-2 rounded font-bold hover:bg-green-800 transition" 
                disabled={actionLoading}
              >
                {actionLoading ? "Processing..." : (actionType === "approved" ? "Approve" : "Deny")}
              </button>
              <button 
                onClick={() => setActionType("")} 
                className="bg-gray-300 text-green-900 px-4 py-2 rounded font-bold hover:bg-gray-400 transition"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60">
          <div className="bg-white rounded-lg shadow-lg max-w-md w-full p-6 relative">
            <button className="absolute top-2 right-2 text-green-900 hover:text-green-700 text-2xl font-bold" onClick={() => setDeleteConfirm(null)} aria-label="Close">×</button>
            <h3 className="text-xl font-bold mb-4 text-red-600">Delete Application</h3>
            <div className="mb-4">
              <p className="text-gray-700 mb-2">Are you sure you want to delete this application?</p>
              <div className="bg-gray-100 p-3 rounded">
                <p><strong>Name:</strong> {deleteConfirm.info.name}</p>
                <p><strong>Email:</strong> {deleteConfirm.info.email}</p>
                <p><strong>Type:</strong> {typeLabels[deleteConfirm.type]}</p>
                <p><strong>Status:</strong> {deleteConfirm.status}</p>
              </div>
              <p className="text-red-600 text-sm mt-2">This action cannot be undone.</p>
            </div>
            <div className="flex gap-4">
              <button 
                onClick={() => handleDelete(deleteConfirm._id)} 
                className="bg-red-600 text-white px-4 py-2 rounded font-bold hover:bg-red-700 transition" 
                disabled={deleteLoading}
              >
                {deleteLoading ? "Deleting..." : "Delete"}
              </button>
              <button 
                onClick={() => setDeleteConfirm(null)} 
                className="bg-gray-300 text-green-900 px-4 py-2 rounded font-bold hover:bg-gray-400 transition"
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
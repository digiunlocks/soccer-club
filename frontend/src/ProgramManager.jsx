import { useEffect, useState, useRef } from "react";
import { useNavigate } from 'react-router-dom';

const API_URL = "http://localhost:5000/api/programs";
const TEAMS = ["U8 Leopards", "U10 Tigers", "U12 Lions", "U14 Panthers", "Adult Leopards"];
const COACHES = ["Coach Smith", "Coach Lee", "Coach Patel", "Coach Garcia"];

function toCSV(programs) {
  const header = ["Name", "Description", "Zip Codes", "Address", "City", "State", "Visible", "Contact", "Website", "Registration Link", "Assigned Team", "Assigned Coach"];
  const rows = programs.map(p => [
    p.name,
    p.description || "",
    (p.zipCodes || []).join("; "),
    p.address || "",
    p.city || "",
    p.state || "",
    p.visible ? "Yes" : "No",
    p.contact || "",
    p.website || "",
    p.registrationLink || "",
    p.assignedTeam || "",
    p.assignedCoach || "",
  ]);
  return [header, ...rows].map(r => r.map(x => `"${x.replace(/"/g, '""')}"`).join(",")).join("\n");
}

export default function ProgramManager() {
  const navigate = useNavigate();
  const [programs, setPrograms] = useState([]);
  const [form, setForm] = useState({ name: "", description: "", zipCodes: "", address: "", city: "", state: "", visible: true, contact: "", website: "", registrationLink: "", assignedTeam: "", assignedCoach: "" });
  const [editing, setEditing] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState({ name: "", zip: "", city: "", state: "" });
  const [details, setDetails] = useState(null);
  const fileInputRef = useRef();

  const fetchPrograms = async () => {
    setLoading(true);
    let url = API_URL + "?";
    if (filter.zip) url += `zip=${filter.zip}&`;
    const res = await fetch(url);
    let data = await res.json();
    if (filter.name) data = data.filter(p => p.name.toLowerCase().includes(filter.name.toLowerCase()));
    if (filter.city) data = data.filter(p => (p.city || "").toLowerCase().includes(filter.city.toLowerCase()));
    if (filter.state) data = data.filter(p => (p.state || "").toLowerCase().includes(filter.state.toLowerCase()));
    setPrograms(data);
    setLoading(false);
  };

  useEffect(() => { fetchPrograms(); }, [filter]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    const payload = { ...form, zipCodes: form.zipCodes.split(",").map(z => z.trim()).filter(Boolean) };
    try {
      const res = await fetch(editing ? `${API_URL}/${editing}` : API_URL, {
        method: editing ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error("Failed to save program");
      setForm({ name: "", description: "", zipCodes: "", address: "", city: "", state: "", visible: true, contact: "", website: "", registrationLink: "", assignedTeam: "", assignedCoach: "" });
      setEditing(null);
      fetchPrograms();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleEdit = (p) => {
    setForm({
      name: p.name,
      description: p.description || "",
      zipCodes: p.zipCodes ? p.zipCodes.join(", ") : "",
      address: p.address || "",
      city: p.city || "",
      state: p.state || "",
      visible: p.visible,
      contact: p.contact || "",
      website: p.website || "",
      registrationLink: p.registrationLink || "",
      assignedTeam: p.assignedTeam || "",
      assignedCoach: p.assignedCoach || "",
    });
    setEditing(p._id);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this program/area?")) return;
    await fetch(`${API_URL}/${id}`, { method: "DELETE" });
    fetchPrograms();
  };

  const handleToggleVisible = async (p) => {
    await fetch(`${API_URL}/${p._id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...p, visible: !p.visible }),
    });
    fetchPrograms();
  };

  // Export CSV
  const handleExport = () => {
    const csv = toCSV(programs);
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'programs.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  // Import CSV
  const handleImport = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const text = await file.text();
    const lines = text.split(/\r?\n/).filter(Boolean);
    const [header, ...rows] = lines.map(l => l.split(/,(?=(?:[^"]*"[^"]*")*[^"]*$)/).map(x => x.replace(/^"|"$/g, '').replace(/""/g, '"')));
    const idx = {};
    header.forEach((h, i) => { idx[h.trim().toLowerCase()] = i; });
    for (const row of rows) {
      const payload = {
        name: row[idx["name"]],
        description: row[idx["description"]],
        zipCodes: (row[idx["zip codes"]] || "").split(';').map(z => z.trim()).filter(Boolean),
        address: row[idx["address"]],
        city: row[idx["city"]],
        state: row[idx["state"]],
        visible: (row[idx["visible"]] || "yes").toLowerCase().startsWith('y'),
        contact: row[idx["contact"]],
        website: row[idx["website"]],
        registrationLink: row[idx["registration link"]],
        assignedTeam: row[idx["assigned team"]],
        assignedCoach: row[idx["assigned coach"]],
      };
      await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
    }
    fetchPrograms();
    fileInputRef.current.value = "";
  };

  // Analytics: programs by city
  const cityCounts = programs.reduce((acc, p) => {
    if (!p.city) return acc;
    acc[p.city] = (acc[p.city] || 0) + 1;
    return acc;
  }, {});
  const cityChartData = Object.entries(cityCounts);

  return (
    <div className="max-w-5xl mx-auto p-6 bg-white rounded shadow mt-8">
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
          <h2 className="text-2xl font-bold text-green-900">Program/Area Manager</h2>
        </div>
        <div className="flex gap-4">
          <button onClick={handleExport} className="bg-green-700 text-white px-4 py-2 rounded font-bold hover:bg-green-800 transition">Export CSV</button>
          <label className="bg-yellow-400 text-green-900 px-4 py-2 rounded font-bold hover:bg-yellow-500 transition cursor-pointer">
            Import CSV
            <input type="file" accept=".csv" onChange={handleImport} ref={fileInputRef} className="hidden" />
          </label>
        </div>
      </div>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4 mb-8">
        <input name="name" value={form.name} onChange={handleChange} placeholder="Program/Area Name" className="border rounded px-2 py-1" required />
        <textarea name="description" value={form.description} onChange={handleChange} placeholder="Description (optional)" className="border rounded px-2 py-1" />
        <input name="zipCodes" value={form.zipCodes} onChange={handleChange} placeholder="Zip Codes (comma separated)" className="border rounded px-2 py-1" required />
        <input name="address" value={form.address} onChange={handleChange} placeholder="Address" className="border rounded px-2 py-1" />
        <div className="flex gap-4">
          <input name="city" value={form.city} onChange={handleChange} placeholder="City" className="border rounded px-2 py-1 flex-1" />
          <input name="state" value={form.state} onChange={handleChange} placeholder="State" className="border rounded px-2 py-1 flex-1" />
        </div>
        <input name="contact" value={form.contact} onChange={handleChange} placeholder="Contact Info (optional)" className="border rounded px-2 py-1" />
        <input name="website" value={form.website} onChange={handleChange} placeholder="Website (optional)" className="border rounded px-2 py-1" />
        <input name="registrationLink" value={form.registrationLink} onChange={handleChange} placeholder="Registration Link (optional)" className="border rounded px-2 py-1" />
        <div className="flex gap-4">
          <select name="assignedTeam" value={form.assignedTeam} onChange={handleChange} className="border rounded px-2 py-1 flex-1">
            <option value="">Assign to Team (optional)</option>
            {TEAMS.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
          <select name="assignedCoach" value={form.assignedCoach} onChange={handleChange} className="border rounded px-2 py-1 flex-1">
            <option value="">Assign to Coach (optional)</option>
            {COACHES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <label className="flex gap-2 items-center">
          <input type="checkbox" name="visible" checked={form.visible} onChange={handleChange} /> Visible
        </label>
        <button type="submit" className="bg-green-900 text-white font-bold py-2 rounded hover:bg-green-700 transition w-40">
          {editing ? "Update" : "Add"} Program
        </button>
        {error && <div className="text-red-600 text-sm">{error}</div>}
      </form>
      <h3 className="text-xl font-semibold mb-2">Current Programs/Areas</h3>
      <div className="flex gap-4 mb-4">
        <input value={filter.name} onChange={e => setFilter(f => ({ ...f, name: e.target.value }))} placeholder="Filter by name" className="border rounded px-2 py-1" />
        <input value={filter.zip} onChange={e => setFilter(f => ({ ...f, zip: e.target.value }))} placeholder="Filter by zip" className="border rounded px-2 py-1" />
        <input value={filter.city} onChange={e => setFilter(f => ({ ...f, city: e.target.value }))} placeholder="Filter by city" className="border rounded px-2 py-1" />
        <input value={filter.state} onChange={e => setFilter(f => ({ ...f, state: e.target.value }))} placeholder="Filter by state" className="border rounded px-2 py-1" />
      </div>
      {/* Analytics: Programs by City */}
      {cityChartData.length > 0 && (
        <div className="mb-8">
          <h4 className="text-md font-bold mb-2 text-green-800">Programs by City</h4>
          <div className="flex gap-2 items-end h-32">
            {cityChartData.map(([city, count]) => (
              <div key={city} className="flex flex-col items-center flex-1">
                <div className="bg-green-700 text-white rounded-t w-8" style={{ height: `${count * 20}px` }}>{count}</div>
                <div className="text-xs mt-1 text-green-900 font-bold">{city}</div>
              </div>
            ))}
          </div>
        </div>
      )}
      {loading ? <div>Loading...</div> : (
        <table className="w-full mb-6 border">
          <thead>
            <tr className="bg-green-100">
              <th className="p-2">Name</th>
              <th className="p-2">Zip Codes</th>
              <th className="p-2">Address</th>
              <th className="p-2">City</th>
              <th className="p-2">State</th>
              <th className="p-2">Visible</th>
              <th className="p-2">Team</th>
              <th className="p-2">Coach</th>
              <th className="p-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {programs.map(p => (
              <tr key={p._id} className="border-t hover:bg-green-50">
                <td className="p-2 font-bold cursor-pointer underline" onClick={() => setDetails(p)}>{p.name}</td>
                <td className="p-2 text-xs">{p.zipCodes && p.zipCodes.join(", ")}</td>
                <td className="p-2 text-xs">{p.address}</td>
                <td className="p-2">{p.city}</td>
                <td className="p-2">{p.state}</td>
                <td className="p-2">
                  <button onClick={() => handleToggleVisible(p)} className={p.visible ? "text-green-700 font-bold" : "text-gray-400 font-bold"}>{p.visible ? "Yes" : "No"}</button>
                </td>
                <td className="p-2 text-xs">{p.assignedTeam}</td>
                <td className="p-2 text-xs">{p.assignedCoach}</td>
                <td className="p-2">
                  <button onClick={() => handleEdit(p)} className="text-blue-700 underline font-semibold mr-2">Edit</button>
                  <button onClick={() => handleDelete(p._id)} className="text-red-700 underline font-semibold">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      {details && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60">
          <div className="bg-white rounded-lg shadow-lg max-w-lg w-full p-6 relative">
            <button className="absolute top-2 right-2 text-green-900 hover:text-green-700 text-2xl font-bold" onClick={() => setDetails(null)} aria-label="Close">×</button>
            <h3 className="text-xl font-bold mb-2 text-green-900">{details.name}</h3>
            <div className="mb-2 text-sm text-gray-700">
              <strong>Description:</strong> {details.description || "-"}<br />
              <strong>Address:</strong> {details.address}, {details.city}, {details.state}<br />
              <strong>Zip Codes:</strong> {details.zipCodes && details.zipCodes.join(", ")}<br />
              <strong>Contact:</strong> {details.contact || "-"}<br />
              <strong>Website:</strong> {details.website ? <a href={details.website} className="underline text-blue-700" target="_blank" rel="noopener noreferrer">{details.website}</a> : "-"}<br />
              <strong>Registration Link:</strong> {details.registrationLink ? <a href={details.registrationLink} className="underline text-blue-700" target="_blank" rel="noopener noreferrer">{details.registrationLink}</a> : "-"}<br />
              <strong>Assigned Team:</strong> {details.assignedTeam || "-"}<br />
              <strong>Assigned Coach:</strong> {details.assignedCoach || "-"}<br />
              <strong>Visible:</strong> {details.visible ? "Yes" : "No"}<br />
              <strong>Created:</strong> {new Date(details.createdAt).toLocaleString()}<br />
              <strong>Updated:</strong> {new Date(details.updatedAt).toLocaleString()}<br />
            </div>
            {details.address && (
              <iframe
                title="Map"
                width="100%"
                height="200"
                className="rounded border mt-2"
                style={{ border: 0 }}
                loading="lazy"
                allowFullScreen
                referrerPolicy="no-referrer-when-downgrade"
                src={`https://www.google.com/maps?q=${encodeURIComponent(details.address + ', ' + details.city + ', ' + details.state)}&output=embed`}
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
} 
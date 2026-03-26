import React, { useState, useEffect } from 'react';

export default function SettingsPanel({ token, addLog }) {
  const [users, setUsers] = useState([]);
  const [newUsername, setNewUsername] = useState('');
  const [newPassword, setNewPassword] = useState('');

  const API_BASE = "https://home.gnosys.labs/api";

  const fetchUsers = async () => {
    try {
      const res = await fetch(`${API_BASE}/auth/users`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) setUsers(await res.json());
    } catch (err) { addLog("Error fetching administrators."); }
  };

  useEffect(() => {
    if (token) fetchUsers();
  }, [token]);

  const handleAddUser = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_BASE}/auth/users`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json', 
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify({ username: newUsername, password: newPassword })
      });
      if (res.ok) {
        setNewUsername('');
        setNewPassword('');
        fetchUsers();
        addLog(`Security: Provisioned new admin '${newUsername}'`);
      } else {
        addLog("Error: Failed to provision admin.");
      }
    } catch (err) { addLog("Network Error."); }
  };

  const handleDelete = async (id, username) => {
    if (!window.confirm(`Revoke access for ${username}?`)) return;
    try {
      const res = await fetch(`${API_BASE}/auth/users/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        fetchUsers();
        addLog(`Security: Revoked access for '${username}'`);
      } else {
        const data = await res.json();
        alert(data.error || "Failed to revoke access.");
        addLog(`Error: ${data.error || "Failed to revoke access."}`);
      }
    } catch (err) { addLog("Network Error."); }
  };

  return (
    <div className="animate-in fade-in slide-in-from-right-4 duration-500 space-y-12 w-full pb-20">
      <section className="bg-stoic-gray border border-stoic-border p-8 rounded-sm">
        <h2 className="text-[10px] font-bold tracking-widest uppercase text-gray-500 mb-6 border-b border-stoic-border pb-4">System Security // Access Control</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          <div>
            <h3 className="text-[9px] uppercase tracking-widest text-gray-600 mb-4">Active Administrators</h3>
            <ul className="space-y-4">
              {users.map(u => (
                <li key={u._id} className="flex justify-between items-center bg-black border border-stoic-border p-4">
                  <span className="text-white font-mono text-xs">{u.username}</span>
                  <button onClick={() => handleDelete(u._id, u.username)} className="text-[10px] text-red-900 hover:text-red-500 font-bold tracking-widest uppercase transition-colors">Revoke</button>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="text-[9px] uppercase tracking-widest text-gray-600 mb-4">Provision New Admin</h3>
            <form onSubmit={handleAddUser} className="space-y-4">
              <input className="w-full bg-black border border-stoic-border p-4 text-xs text-white focus:border-white outline-none font-mono placeholder:text-gray-800 transition-colors" placeholder="NEW IDENTIFIER" value={newUsername} onChange={e => setNewUsername(e.target.value)} required />
              <input type="password" autoComplete="new-password" className="w-full bg-black border border-stoic-border p-4 text-xs text-white focus:border-white outline-none font-mono placeholder:text-gray-800 transition-colors" placeholder="NEW PASSPHRASE" value={newPassword} onChange={e => setNewPassword(e.target.value)} required />
              <button type="submit" className="w-full bg-white text-black py-4 text-[10px] font-bold uppercase tracking-[0.2em] hover:bg-gray-300 transition-all">Provision Access</button>
            </form>
          </div>
        </div>
      </section>
    </div>
  );
}
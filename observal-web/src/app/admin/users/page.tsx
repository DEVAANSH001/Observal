'use client';
import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/auth';

type User = { id: string; email: string; name: string; role: string };

export default function AdminUsersPage() {
  const { user, loading } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState('developer');
  const [newKey, setNewKey] = useState('');

  const fetchUsers = async () => {
    try { setError(''); setUsers(await api.get('/api/v1/admin/users')); }
    catch (e: unknown) { setError(e instanceof Error ? e.message : 'Failed'); }
  };

  useEffect(() => { if (user?.role === 'admin') fetchUsers(); }, [user]);

  if (loading) return <div className="p-6">Loading...</div>;
  if (user?.role !== 'admin') return <div className="p-6 text-red-600">Admin access required</div>;

  const changeRole = async (id: string, newRole: string) => {
    try { setError(''); await api.put(`/api/v1/admin/users/${id}/role`, { role: newRole }); await fetchUsers(); }
    catch (e: unknown) { setError(e instanceof Error ? e.message : 'Failed'); }
  };

  const createUser = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setError(''); setNewKey('');
      const res = await api.post('/api/v1/admin/users', { email, name, role });
      setNewKey(res.api_key);
      setEmail(''); setName(''); setRole('developer');
      await fetchUsers();
    } catch (err: unknown) { setError(err instanceof Error ? err.message : 'Failed'); }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">User Management</h1>
        <button onClick={() => { setShowForm(!showForm); setNewKey(''); }} className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 text-sm">
          {showForm ? 'Cancel' : '+ Create User'}
        </button>
      </div>

      {error && <div className="bg-red-100 text-red-700 p-3 rounded mb-4">{error}</div>}

      {newKey && (
        <div className="bg-green-50 border border-green-200 p-4 rounded mb-4">
          <p className="font-semibold text-green-800 mb-1">User created! Share this API key with them:</p>
          <div className="flex items-center gap-2">
            <code className="bg-white border px-3 py-2 rounded text-sm flex-1 break-all">{newKey}</code>
            <button onClick={() => navigator.clipboard.writeText(newKey).catch(() => {})} className="bg-green-600 text-white px-3 py-2 rounded text-sm hover:bg-green-700">Copy</button>
          </div>
          <p className="text-xs text-green-700 mt-2">This key is shown only once. Save it now.</p>
        </div>
      )}

      {showForm && (
        <form onSubmit={createUser} className="bg-white border rounded p-4 mb-6 space-y-3">
          <div className="grid grid-cols-3 gap-3">
            <input value={email} onChange={e => setEmail(e.target.value)} placeholder="Email" required type="email" className="border rounded px-3 py-2 text-sm" />
            <input value={name} onChange={e => setName(e.target.value)} placeholder="Name" required className="border rounded px-3 py-2 text-sm" />
            <select value={role} onChange={e => setRole(e.target.value)} className="border rounded px-3 py-2 text-sm">
              <option value="developer">developer</option>
              <option value="user">user</option>
              <option value="admin">admin</option>
            </select>
          </div>
          <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 text-sm">Create User</button>
        </form>
      )}

      <table className="w-full border-collapse">
        <thead><tr className="bg-gray-100">
          <th className="border p-2 text-left">Email</th>
          <th className="border p-2 text-left">Name</th>
          <th className="border p-2 text-left">Role</th>
        </tr></thead>
        <tbody>
          {users.map(u => (
            <tr key={u.id} className="hover:bg-gray-50">
              <td className="border p-2">{u.email}</td>
              <td className="border p-2">{u.name}</td>
              <td className="border p-2">
                <select value={u.role} onChange={e => changeRole(u.id, e.target.value)} disabled={u.id === user?.id} className="border rounded px-2 py-1 disabled:opacity-50">
                  <option value="admin">admin</option>
                  <option value="developer">developer</option>
                  <option value="user">user</option>
                </select>
              </td>
            </tr>
          ))}
          {!users.length && <tr><td colSpan={3} className="border p-2 text-center text-gray-500">No users found</td></tr>}
        </tbody>
      </table>
    </div>
  );
}

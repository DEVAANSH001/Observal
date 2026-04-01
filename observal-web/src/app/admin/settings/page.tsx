'use client';
import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/auth';

type Setting = { key: string; value: string };

export default function AdminSettingsPage() {
  const { user, loading } = useAuth();
  const [settings, setSettings] = useState<Setting[]>([]);
  const [key, setKey] = useState('');
  const [value, setValue] = useState('');
  const [error, setError] = useState('');

  const fetchSettings = async () => {
    try { setError(''); setSettings(await api.get('/api/v1/admin/settings')); }
    catch (e: any) { setError(e.message); }
  };

  useEffect(() => { if (user?.role === 'admin') fetchSettings(); }, [user]);

  if (loading) return <div className="p-6">Loading...</div>;
  if (user?.role !== 'admin') return <div className="p-6 text-red-600">Admin access required</div>;

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!key.trim()) return;
    try { setError(''); await api.put(`/api/v1/admin/settings/${key}`, { value }); setKey(''); setValue(''); await fetchSettings(); }
    catch (e: any) { setError(e.message); }
  };

  const del = async (k: string) => {
    try { setError(''); await api.del(`/api/v1/admin/settings/${k}`); await fetchSettings(); }
    catch (e: any) { setError(e.message); }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Enterprise Settings</h1>
      {error && <div className="bg-red-100 text-red-700 p-3 rounded mb-4">{error}</div>}
      <form onSubmit={save} className="flex gap-2 mb-6">
        <input value={key} onChange={e => setKey(e.target.value)} placeholder="Key" className="border rounded px-3 py-2 flex-1" />
        <input value={value} onChange={e => setValue(e.target.value)} placeholder="Value" className="border rounded px-3 py-2 flex-1" />
        <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">Save</button>
      </form>
      <table className="w-full border-collapse">
        <thead><tr className="bg-gray-100">
          <th className="border p-2 text-left">Key</th>
          <th className="border p-2 text-left">Value</th>
          <th className="border p-2 text-left">Actions</th>
        </tr></thead>
        <tbody>
          {settings.map(s => (
            <tr key={s.key} className="hover:bg-gray-50">
              <td className="border p-2">{s.key}</td>
              <td className="border p-2">{s.value}</td>
              <td className="border p-2">
                <button onClick={() => del(s.key)} className="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700">Delete</button>
              </td>
            </tr>
          ))}
          {!settings.length && <tr><td colSpan={3} className="border p-2 text-center text-gray-500">No settings configured</td></tr>}
        </tbody>
      </table>
    </div>
  );
}

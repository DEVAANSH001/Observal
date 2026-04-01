'use client';
import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/auth';

type Review = { id: string; name: string; version: string; description: string; category: string; owner: string; status: string; git_url: string };

export default function AdminReviewsPage() {
  const { user, loading } = useAuth();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [error, setError] = useState('');

  const fetchReviews = async () => {
    try { setError(''); setReviews(await api.get('/api/v1/review')); }
    catch (e: any) { setError(e.message); }
  };

  useEffect(() => { if (user?.role === 'admin') fetchReviews(); }, [user]);

  if (loading) return <div className="p-6">Loading...</div>;
  if (user?.role !== 'admin') return <div className="p-6 text-red-600">Admin access required</div>;

  const approve = async (id: string) => {
    try { setError(''); await api.post(`/api/v1/review/${id}/approve`); await fetchReviews(); }
    catch (e: any) { setError(e.message); }
  };

  const reject = async (id: string) => {
    const reason = prompt('Rejection reason:');
    if (reason === null) return;
    try { setError(''); await api.post(`/api/v1/review/${id}/reject`, { reason }); await fetchReviews(); }
    catch (e: any) { setError(e.message); }
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Pending Reviews</h1>
      {error && <div className="bg-red-100 text-red-700 p-3 rounded mb-4">{error}</div>}
      <table className="w-full border-collapse">
        <thead><tr className="bg-gray-100">
          <th className="border p-2 text-left">Name</th>
          <th className="border p-2 text-left">Version</th>
          <th className="border p-2 text-left">Category</th>
          <th className="border p-2 text-left">Owner</th>
          <th className="border p-2 text-left">Git URL</th>
          <th className="border p-2 text-left">Actions</th>
        </tr></thead>
        <tbody>
          {reviews.map(r => (
            <tr key={r.id} className="hover:bg-gray-50">
              <td className="border p-2">{r.name}</td>
              <td className="border p-2">{r.version}</td>
              <td className="border p-2">{r.category}</td>
              <td className="border p-2">{r.owner}</td>
              <td className="border p-2 text-sm break-all">{r.git_url}</td>
              <td className="border p-2 space-x-2">
                <button onClick={() => approve(r.id)} className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700">Approve</button>
                <button onClick={() => reject(r.id)} className="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700">Reject</button>
              </td>
            </tr>
          ))}
          {!reviews.length && <tr><td colSpan={6} className="border p-2 text-center text-gray-500">No pending reviews</td></tr>}
        </tbody>
      </table>
    </div>
  );
}

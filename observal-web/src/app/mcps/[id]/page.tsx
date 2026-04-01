'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth'
import { api } from '@/lib/api'

export default function McpDetailPage() {
  const { id } = useParams<{ id: string }>()
  const { user, loading } = useAuth()
  const router = useRouter()
  const [mcp, setMcp] = useState<any>(null)
  const [summary, setSummary] = useState<any>(null)
  const [feedback, setFeedback] = useState<any[]>([])
  const [ide, setIde] = useState('cursor')
  const [snippet, setSnippet] = useState('')
  const [rating, setRating] = useState(5)
  const [comment, setComment] = useState('')

  useEffect(() => {
    if (!loading && !user) router.replace('/login')
  }, [user, loading, router])

  useEffect(() => {
    if (!user || !id) return
    api.get(`/api/v1/mcps/${id}`).then(setMcp)
    api.get(`/api/v1/feedback/summary/${id}`).then(setSummary)
    api.get(`/api/v1/feedback/mcp/${id}`).then(setFeedback)
  }, [user, id])

  const handleInstall = async () => {
    const res = await api.post(`/api/v1/mcps/${id}/install`, { ide })
    setSnippet(res.config_snippet)
  }

  const handleFeedback = async (e: React.FormEvent) => {
    e.preventDefault()
    await api.post('/api/v1/feedback', { target_id: id, target_type: 'mcp', rating, comment })
    setComment('')
    api.get(`/api/v1/feedback/mcp/${id}`).then(setFeedback)
    api.get(`/api/v1/feedback/summary/${id}`).then(setSummary)
  }

  if (loading || !user || !mcp) return null

  return (
    <div className="min-h-screen bg-gray-50 p-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold text-indigo-800">{mcp.name} <span className="text-lg text-gray-500">v{mcp.version}</span></h1>
      <div className="flex gap-2 mt-2 mb-4">
        <span className="bg-indigo-100 text-indigo-700 text-xs px-2 py-0.5 rounded">{mcp.category}</span>
        <span className="text-sm text-gray-500">by {mcp.owner}</span>
      </div>
      <p className="text-gray-700 mb-4">{mcp.description}</p>
      {mcp.git_url && <p className="text-sm text-gray-500 mb-2">Git: <a href={mcp.git_url} className="text-indigo-600 hover:underline">{mcp.git_url}</a></p>}
      {mcp.supported_ides?.length > 0 && (
        <div className="flex gap-1 mb-4">{mcp.supported_ides.map((i: string) => <span key={i} className="bg-blue-100 text-blue-700 text-xs px-2 py-0.5 rounded">{i}</span>)}</div>
      )}
      {mcp.setup_instructions && <div className="bg-gray-100 rounded p-3 text-sm mb-6 whitespace-pre-wrap">{mcp.setup_instructions}</div>}

      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <h2 className="font-semibold text-indigo-700 mb-3">Install</h2>
        <div className="flex gap-2 mb-3">
          <select value={ide} onChange={e => setIde(e.target.value)} className="border rounded px-3 py-2">
            {['cursor', 'kiro', 'claude-code', 'gemini-cli'].map(i => <option key={i} value={i}>{i}</option>)}
          </select>
          <button onClick={handleInstall} className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700">Get Config</button>
        </div>
        {snippet && (
          <div className="relative">
            <pre className="bg-gray-900 text-green-400 p-3 rounded text-sm overflow-x-auto">{snippet}</pre>
            <button onClick={() => navigator.clipboard.writeText(snippet)} className="absolute top-2 right-2 bg-gray-700 text-white text-xs px-2 py-1 rounded hover:bg-gray-600">Copy</button>
          </div>
        )}
      </div>

      <div className="bg-white rounded-lg shadow p-4">
        <h2 className="font-semibold text-indigo-700 mb-3">Feedback</h2>
        {summary && <p className="text-sm text-gray-600 mb-3">Average: {summary.average_rating?.toFixed(1)} ⭐ ({summary.total_reviews} reviews)</p>}
        <form onSubmit={handleFeedback} className="flex gap-2 mb-4">
          <select value={rating} onChange={e => setRating(Number(e.target.value))} className="border rounded px-2 py-1">
            {[1, 2, 3, 4, 5].map(n => <option key={n} value={n}>{n} ⭐</option>)}
          </select>
          <textarea value={comment} onChange={e => setComment(e.target.value)} placeholder="Comment…" className="border rounded px-3 py-1 flex-1 text-sm" rows={1} />
          <button type="submit" className="bg-indigo-600 text-white px-4 py-1 rounded hover:bg-indigo-700 text-sm">Submit</button>
        </form>
        <div className="space-y-2">
          {feedback.map((f, i) => (
            <div key={i} className="border-b pb-2 text-sm">
              <span className="font-medium">{f.rating} ⭐</span> <span className="text-gray-600">{f.comment}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

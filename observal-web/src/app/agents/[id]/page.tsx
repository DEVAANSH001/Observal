'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/lib/auth'
import { api } from '@/lib/api'

export default function AgentDetailPage() {
  const { id } = useParams<{ id: string }>()
  const { user, loading } = useAuth()
  const router = useRouter()
  const [agent, setAgent] = useState<any>(null)
  const [summary, setSummary] = useState<any>(null)
  const [feedback, setFeedback] = useState<any[]>([])
  const [ide, setIde] = useState('cursor')
  const [snippet, setSnippet] = useState('')
  const [rating, setRating] = useState(5)
  const [comment, setComment] = useState('')
  const [showPrompt, setShowPrompt] = useState(false)

  useEffect(() => {
    if (!loading && !user) router.replace('/login')
  }, [user, loading, router])

  useEffect(() => {
    if (!user || !id) return
    api.get(`/api/v1/agents/${id}`).then(setAgent)
    api.get(`/api/v1/feedback/summary/${id}`).then(setSummary)
    api.get(`/api/v1/feedback/agent/${id}`).then(setFeedback)
  }, [user, id])

  const handleInstall = async () => {
    const res = await api.post(`/api/v1/agents/${id}/install`, { ide })
    setSnippet(res.config_snippet)
  }

  const handleFeedback = async (e: React.FormEvent) => {
    e.preventDefault()
    await api.post('/api/v1/feedback', { target_id: id, target_type: 'agent', rating, comment })
    setComment('')
    api.get(`/api/v1/feedback/agent/${id}`).then(setFeedback)
    api.get(`/api/v1/feedback/summary/${id}`).then(setSummary)
  }

  if (loading || !user || !agent) return null

  return (
    <div className="min-h-screen bg-gray-50 p-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold text-indigo-800">{agent.name} <span className="text-lg text-gray-500">v{agent.version}</span></h1>
      <p className="text-sm text-gray-500 mt-1 mb-4">by {agent.owner} · {agent.model_name}</p>
      <p className="text-gray-700 mb-4">{agent.description}</p>
      {agent.supported_ides?.length > 0 && (
        <div className="flex gap-1 mb-4">{agent.supported_ides.map((i: string) => <span key={i} className="bg-blue-100 text-blue-700 text-xs px-2 py-0.5 rounded">{i}</span>)}</div>
      )}

      {agent.system_prompt && (
        <div className="mb-4">
          <button onClick={() => setShowPrompt(!showPrompt)} className="text-indigo-600 text-sm hover:underline">{showPrompt ? 'Hide' : 'Show'} System Prompt</button>
          {showPrompt && <pre className="bg-gray-100 rounded p-3 text-sm mt-2 whitespace-pre-wrap">{agent.system_prompt}</pre>}
        </div>
      )}

      {agent.mcp_links?.length > 0 && (
        <div className="bg-white rounded-lg shadow p-4 mb-6">
          <h2 className="font-semibold text-indigo-700 mb-2">Linked MCP Servers</h2>
          <ul className="text-sm space-y-1">
            {agent.mcp_links.map((m: any, i: number) => (
              <li key={i}><Link href={`/mcps/${m.mcp_id || m.id}`} className="text-indigo-600 hover:underline">{m.name || m.mcp_id || m.id}</Link></li>
            ))}
          </ul>
        </div>
      )}

      {agent.goal_template && (
        <div className="bg-white rounded-lg shadow p-4 mb-6">
          <h2 className="font-semibold text-indigo-700 mb-2">Goal Template</h2>
          <p className="text-sm text-gray-700 mb-2">{agent.goal_template.description}</p>
          {agent.goal_template.sections?.map((s: any, i: number) => (
            <div key={i} className="border-l-2 border-indigo-200 pl-3 mb-2 text-sm">
              <span className="font-medium">{s.name}</span>
              {s.grounding_required && <span className="ml-2 bg-yellow-100 text-yellow-700 text-xs px-1.5 py-0.5 rounded">grounding required</span>}
            </div>
          ))}
        </div>
      )}

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

      <div className="bg-white rounded-lg shadow p-4 mb-6">
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

      <Link href={`/agents/${id}/eval`} className="text-indigo-600 hover:underline text-sm">View Evaluation Dashboard →</Link>
    </div>
  )
}

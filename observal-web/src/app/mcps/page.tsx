'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/lib/auth'
import { api } from '@/lib/api'

interface Mcp {
  id: string
  name: string
  version: string
  description: string
  category: string
  owner: string
  supported_ides: string[]
  status: string
}

export default function McpsPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [mcps, setMcps] = useState<Mcp[]>([])
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('')

  useEffect(() => {
    if (!loading && !user) router.replace('/login')
  }, [user, loading, router])

  useEffect(() => {
    if (!user) return
    const params = new URLSearchParams()
    if (search) params.set('search', search)
    if (category) params.set('category', category)
    api.get(`/api/v1/mcps?${params}`).then(setMcps)
  }, [user, search, category])

  if (loading || !user) return null

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <h1 className="text-3xl font-bold text-indigo-800 mb-6">MCP Registry</h1>
      <div className="flex gap-4 mb-6">
        <input
          placeholder="Search…"
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="border rounded px-3 py-2 flex-1 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
        <select
          value={category}
          onChange={e => setCategory(e.target.value)}
          className="border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <option value="">All Categories</option>
          {['code-generation', 'database', 'devops', 'testing', 'documentation', 'security'].map(c => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
      </div>
      <div className="grid grid-cols-3 gap-4">
        {mcps.map(m => (
          <div key={m.id} className="bg-white rounded-lg shadow p-4 flex flex-col">
            <div className="flex items-center justify-between mb-2">
              <h2 className="font-semibold text-indigo-700">{m.name}</h2>
              <span className="text-xs text-gray-500">v{m.version}</span>
            </div>
            <span className="inline-block bg-indigo-100 text-indigo-700 text-xs px-2 py-0.5 rounded mb-2 w-fit">{m.category}</span>
            <p className="text-sm text-gray-600 flex-1">{m.description?.slice(0, 100)}{m.description?.length > 100 ? '…' : ''}</p>
            <div className="flex items-center justify-between mt-3 text-sm">
              <span className="text-gray-400">{m.owner}</span>
              <Link href={`/mcps/${m.id}`} className="text-indigo-600 hover:underline">View</Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

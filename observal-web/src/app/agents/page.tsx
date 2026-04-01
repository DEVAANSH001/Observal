'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/lib/auth'
import { api } from '@/lib/api'

interface Agent {
  id: string
  name: string
  version: string
  description: string
  owner: string
  model_name: string
  supported_ides: string[]
  status: string
}

export default function AgentsPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [agents, setAgents] = useState<Agent[]>([])
  const [search, setSearch] = useState('')

  useEffect(() => {
    if (!loading && !user) router.replace('/login')
  }, [user, loading, router])

  useEffect(() => {
    if (!user) return
    const params = search ? `?search=${encodeURIComponent(search)}` : ''
    api.get(`/api/v1/agents${params}`).then(setAgents)
  }, [user, search])

  if (loading || !user) return null

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <h1 className="text-3xl font-bold text-indigo-800 mb-6">Agent Registry</h1>
      <input
        placeholder="Search agents…"
        value={search}
        onChange={e => setSearch(e.target.value)}
        className="border rounded px-3 py-2 w-full mb-6 focus:outline-none focus:ring-2 focus:ring-indigo-500"
      />
      <div className="grid grid-cols-3 gap-4">
        {agents.map(a => (
          <div key={a.id} className="bg-white rounded-lg shadow p-4 flex flex-col">
            <div className="flex items-center justify-between mb-2">
              <h2 className="font-semibold text-indigo-700">{a.name}</h2>
              <span className="text-xs text-gray-500">v{a.version}</span>
            </div>
            <span className="text-xs text-gray-500 mb-2">{a.model_name}</span>
            <p className="text-sm text-gray-600 flex-1">{a.description?.slice(0, 100)}{a.description?.length > 100 ? '…' : ''}</p>
            <div className="flex items-center justify-between mt-3 text-sm">
              <span className="text-gray-400">{a.owner}</span>
              <Link href={`/agents/${a.id}`} className="text-indigo-600 hover:underline">View</Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

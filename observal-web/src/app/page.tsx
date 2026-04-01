'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth'
import { api } from '@/lib/api'

interface Stats {
  total_mcps: number
  total_agents: number
  total_users: number
  total_tool_calls_today: number
  total_agent_interactions_today: number
}

interface TopItem {
  id: string
  name: string
  value: number
}

export default function HomePage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [stats, setStats] = useState<Stats | null>(null)
  const [topMcps, setTopMcps] = useState<TopItem[]>([])
  const [topAgents, setTopAgents] = useState<TopItem[]>([])

  useEffect(() => {
    if (!loading && !user) router.replace('/login')
  }, [user, loading, router])

  useEffect(() => {
    if (!user) return
    api.get('/api/v1/overview/stats').then(setStats)
    api.get('/api/v1/overview/top-mcps').then(setTopMcps)
    api.get('/api/v1/overview/top-agents').then(setTopAgents)
  }, [user])

  if (loading || !user || !stats) return null

  const cards = [
    { label: 'MCPs', value: stats.total_mcps },
    { label: 'Agents', value: stats.total_agents },
    { label: 'Users', value: stats.total_users },
    { label: 'Tool Calls Today', value: stats.total_tool_calls_today },
    { label: 'Agent Interactions Today', value: stats.total_agent_interactions_today },
  ]

  const TopTable = ({ title, items }: { title: string; items: TopItem[] }) => (
    <div className="bg-white rounded-lg shadow p-4">
      <h2 className="text-lg font-semibold text-indigo-700 mb-3">{title}</h2>
      <table className="w-full text-sm">
        <thead><tr className="text-left text-gray-500 border-b"><th className="pb-2">Name</th><th className="pb-2 text-right">Downloads</th></tr></thead>
        <tbody>
          {items.map(i => (
            <tr key={i.id} className="border-b last:border-0">
              <td className="py-2">{i.name}</td>
              <td className="py-2 text-right">{i.value}</td>
            </tr>
          ))}
          {!items.length && <tr><td colSpan={2} className="py-2 text-gray-400">No data</td></tr>}
        </tbody>
      </table>
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <h1 className="text-3xl font-bold text-indigo-800 mb-6">Enterprise Overview</h1>
      <div className="grid grid-cols-5 gap-4 mb-8">
        {cards.map(c => (
          <div key={c.label} className="bg-white rounded-lg shadow p-4 text-center">
            <p className="text-2xl font-bold text-indigo-600">{c.value}</p>
            <p className="text-sm text-gray-500">{c.label}</p>
          </div>
        ))}
      </div>
      <div className="grid grid-cols-2 gap-6">
        <TopTable title="Top MCPs" items={topMcps} />
        <TopTable title="Top Agents" items={topAgents} />
      </div>
    </div>
  )
}

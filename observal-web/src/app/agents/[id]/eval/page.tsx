'use client';
import { Fragment, useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/auth';

type Dimension = { dimension: string; score: number; grade: string; notes: string };
type Scorecard = { id: string; trace_id: string; version: string; overall_score: number; overall_grade: string; bottleneck: string; evaluated_at: string; dimensions: Dimension[] };
type EvalRun = { id: string; status: string; traces_evaluated: number; started_at: string; completed_at: string };

export default function AgentEvalPage() {
  const { id } = useParams<{ id: string }>();
  const { user, loading } = useAuth();
  const router = useRouter();
  const [scorecards, setScorecards] = useState<Scorecard[]>([]);
  const [runs, setRuns] = useState<EvalRun[]>([]);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [running, setRunning] = useState(false);

  useEffect(() => { if (!loading && !user) router.replace('/login'); }, [user, loading, router]);

  const fetchData = async () => {
    try {
      setError('');
      const [sc, rn] = await Promise.all([
        api.get(`/api/v1/eval/agents/${id}/scorecards`),
        api.get(`/api/v1/eval/agents/${id}/runs`),
      ]);
      setScorecards(sc);
      setRuns(rn);
    } catch (e: unknown) { setError(e instanceof Error ? e.message : 'Failed to load'); }
  };

  useEffect(() => { if (user) fetchData(); }, [id, user]);

  const runEval = async () => {
    try {
      setRunning(true);
      setError('');
      await api.post(`/api/v1/eval/agents/${id}`, {});
      await fetchData();
    } catch (e: unknown) { setError(e instanceof Error ? e.message : 'Eval failed'); }
    finally { setRunning(false); }
  };

  if (loading || !user) return null;

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Agent Evaluation</h1>
        <button onClick={runEval} disabled={running} className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50">
          {running ? 'Running...' : 'Run Evaluation'}
        </button>
      </div>
      {error && <div className="bg-red-100 text-red-700 p-3 rounded mb-4">{error}</div>}

      <h2 className="text-lg font-semibold mb-2">Evaluation Runs</h2>
      <table className="w-full border-collapse mb-8">
        <thead><tr className="bg-gray-100">
          <th className="border p-2 text-left">Status</th>
          <th className="border p-2 text-left">Traces</th>
          <th className="border p-2 text-left">Started</th>
          <th className="border p-2 text-left">Completed</th>
        </tr></thead>
        <tbody>
          {runs.map(r => (
            <tr key={r.id} className="hover:bg-gray-50">
              <td className="border p-2">{r.status}</td>
              <td className="border p-2">{r.traces_evaluated}</td>
              <td className="border p-2">{r.started_at ? new Date(r.started_at).toLocaleString() : '-'}</td>
              <td className="border p-2">{r.completed_at ? new Date(r.completed_at).toLocaleString() : '-'}</td>
            </tr>
          ))}
          {!runs.length && <tr><td colSpan={4} className="border p-2 text-center text-gray-500">No runs yet</td></tr>}
        </tbody>
      </table>

      <h2 className="text-lg font-semibold mb-2">Scorecards</h2>
      <table className="w-full border-collapse">
        <thead><tr className="bg-gray-100">
          <th className="border p-2 text-left">Version</th>
          <th className="border p-2 text-left">Score</th>
          <th className="border p-2 text-left">Grade</th>
          <th className="border p-2 text-left">Bottleneck</th>
          <th className="border p-2 text-left">Date</th>
        </tr></thead>
        <tbody>
          {scorecards.map(sc => (
            <Fragment key={sc.id}>
              <tr className="hover:bg-gray-50 cursor-pointer" onClick={() => setExpanded(expanded === sc.id ? null : sc.id)}>
                <td className="border p-2">{sc.version}</td>
                <td className="border p-2">{sc.overall_score}</td>
                <td className="border p-2">{sc.overall_grade}</td>
                <td className="border p-2">{sc.bottleneck}</td>
                <td className="border p-2">{new Date(sc.evaluated_at).toLocaleString()}</td>
              </tr>
              {expanded === sc.id && (
                <tr>
                  <td colSpan={5} className="border p-0">
                    <table className="w-full bg-gray-50">
                      <thead><tr>
                        <th className="p-2 text-left text-sm">Dimension</th>
                        <th className="p-2 text-left text-sm">Score</th>
                        <th className="p-2 text-left text-sm">Grade</th>
                        <th className="p-2 text-left text-sm">Notes</th>
                      </tr></thead>
                      <tbody>
                        {sc.dimensions.map((d, i) => (
                          <tr key={i}>
                            <td className="p-2 text-sm">{d.dimension}</td>
                            <td className="p-2 text-sm">{d.score}</td>
                            <td className="p-2 text-sm">{d.grade}</td>
                            <td className="p-2 text-sm">{d.notes}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </td>
                </tr>
              )}
            </Fragment>
          ))}
          {!scorecards.length && <tr><td colSpan={5} className="border p-2 text-center text-gray-500">No scorecards yet</td></tr>}
        </tbody>
      </table>
    </div>
  );
}

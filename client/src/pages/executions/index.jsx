import { useEffect, useState } from 'react';
import ProtectedRoute from '../../components/ProtectedRoute';
import AppShell from '../../components/AppShell';
import api from '../../services/api';
import Link from 'next/link';
import { ArrowRight, Play, CheckCircle2, XCircle, Clock, PlaySquare, RefreshCw, Pause, AlertTriangle } from 'lucide-react';

export default function ExecutionsList() {
  const [executions, setExecutions] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchExecutions = async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/executions');
      setExecutions(data || []);
    } catch (err) {
      console.error('Failed to load executions:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExecutions();
  }, []);

  const getStatusBadge = (status) => {
    switch (status) {
      case 'COMPLETED':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
            COMPLETED
          </span>
        );
      case 'RUNNING':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-indigo-500/15 text-indigo-300 border border-indigo-500/30 animate-pulse">
            <Play className="h-3.5 w-3.5 text-indigo-400" />
            RUNNING
          </span>
        );
      case 'PAUSED':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-500/15 text-amber-300 border border-amber-500/30">
            <Pause className="h-3.5 w-3.5 text-amber-400" />
            PAUSED
          </span>
        );
      case 'FAILED':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-500/15 text-rose-300 border border-rose-500/30">
            <XCircle className="h-3.5 w-3.5 text-rose-400" />
            FAILED
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-gray-800 text-gray-400 border border-gray-700">
            <Clock className="h-3.5 w-3.5 text-gray-500" />
            {status || 'PENDING'}
          </span>
        );
    }
  };

  return (
    <ProtectedRoute>
      <AppShell>
        <div className="p-6 md:p-10 max-w-7xl mx-auto space-y-8">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight">Execution Audit Log</h1>
              <p className="text-sm text-gray-400 mt-1">
                Real-time execution records, step timings, and multi-agent audit trails.
              </p>
            </div>
            <button
              onClick={fetchExecutions}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-gray-900 border border-gray-800 hover:bg-gray-800 text-gray-300 hover:text-white text-xs font-semibold transition"
            >
              <RefreshCw className="h-4 w-4" /> Refresh
            </button>
          </div>

          {/* Table / List */}
          {loading ? (
            <div className="py-20 text-center text-sm text-gray-500 font-mono">Loading execution history...</div>
          ) : executions.length === 0 ? (
            <div className="text-center py-20 bg-gray-900/40 border border-gray-800/80 rounded-2xl p-8 space-y-4">
              <PlaySquare className="h-12 w-12 mx-auto text-gray-600" />
              <h3 className="text-base font-semibold text-gray-200">No Executions Found</h3>
              <p className="text-xs text-gray-400 max-w-sm mx-auto">
                Trigger a workflow from the canvas editor or generate one using the AI prompt builder.
              </p>
              <Link
                href="/workflows"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-semibold shadow-lg transition"
              >
                Go to Workflows <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          ) : (
            <div className="bg-gray-900/60 border border-gray-800/80 rounded-2xl overflow-hidden shadow-xl backdrop-blur-xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-gray-950/60 border-b border-gray-800 text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
                      <th className="px-6 py-4">Status</th>
                      <th className="px-6 py-4">Workflow Name / ID</th>
                      <th className="px-6 py-4">Started At</th>
                      <th className="px-6 py-4">Duration</th>
                      <th className="px-6 py-4 text-right">Audit Trail</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-800/60 text-xs">
                    {executions.map((exec) => (
                      <tr key={exec._id} className="hover:bg-gray-800/40 transition-colors">
                        <td className="px-6 py-4">{getStatusBadge(exec.status)}</td>
                        <td className="px-6 py-4">
                          <div className="font-semibold text-white">
                            {exec.workflowSnapshot?.name || `Workflow ${exec.workflowId}`}
                          </div>
                          <div className="text-[10px] text-gray-500 font-mono truncate max-w-xs">
                            ID: {exec._id}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-gray-400 font-mono">
                          {new Date(exec.createdAt).toLocaleString()}
                        </td>
                        <td className="px-6 py-4 text-gray-400 font-mono">
                          {exec.duration ? `${exec.duration}ms` : '-'}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <Link
                            href={`/executions/${exec._id}`}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600/10 hover:bg-indigo-600/25 text-indigo-300 border border-indigo-500/20 text-xs font-semibold transition"
                          >
                            Live Timeline <ArrowRight className="h-3.5 w-3.5" />
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </AppShell>
    </ProtectedRoute>
  );
}

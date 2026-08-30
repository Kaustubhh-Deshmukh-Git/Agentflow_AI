import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import ProtectedRoute from '../../components/ProtectedRoute';
import AppShell from '../../components/AppShell';
import api from '../../services/api';
import { socket } from '../../services/socket';
import Link from 'next/link';
import { 
  ArrowLeft, 
  Clock, 
  Activity, 
  ShieldAlert, 
  CheckCircle, 
  Database, 
  Bot, 
  Play, 
  Pause, 
  XCircle, 
  Layers, 
  AlertTriangle,
  RefreshCw
} from 'lucide-react';

export default function ExecutionTimeline() {
  const router = useRouter();
  const { id } = router.query;
  const [execution, setExecution] = useState(null);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchExecutionData = async () => {
    if (!id) return;
    try {
      const [execRes, logsRes] = await Promise.all([
        api.get(`/executions/${id}`),
        api.get(`/executions/${id}/timeline`),
      ]);
      setExecution(execRes.data);
      setLogs(logsRes.data || []);
    } catch (err) {
      console.error('Failed to load execution details:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchExecutionData();

      socket.connect();
      socket.emit('subscribe_execution', id);

      socket.on('agent_event', (event) => {
        setLogs((prev) => [...prev, event]);
        // Update execution status if system completed or failed
        if (event.agent === 'system') {
          if (event.level === 'success') {
            setExecution(prev => prev ? { ...prev, status: 'COMPLETED' } : prev);
          } else if (event.level === 'error') {
            setExecution(prev => prev ? { ...prev, status: 'FAILED' } : prev);
          }
        }
      });

      return () => {
        socket.off('agent_event');
        socket.disconnect();
      };
    }
  }, [id]);

  const handlePause = async () => {
    setActionLoading(true);
    try {
      const { data } = await api.post(`/executions/${id}/pause`);
      setExecution(data);
    } catch (err) {
      alert('Failed to pause execution: ' + (err.response?.data?.error || err.message));
    } finally {
      setActionLoading(false);
    }
  };

  const handleResume = async () => {
    setActionLoading(true);
    try {
      const { data } = await api.post(`/executions/${id}/resume`);
      setExecution(data);
    } catch (err) {
      alert('Failed to resume execution: ' + (err.response?.data?.error || err.message));
    } finally {
      setActionLoading(false);
    }
  };

  const handleCancel = async () => {
    if (!confirm('Are you sure you want to abort this execution run?')) return;
    setActionLoading(true);
    try {
      const { data } = await api.post(`/executions/${id}/cancel`);
      setExecution(data);
    } catch (err) {
      alert('Failed to cancel execution: ' + (err.response?.data?.error || err.message));
    } finally {
      setActionLoading(false);
    }
  };

  const getAgentBadge = (agent) => {
    switch (agent) {
      case 'planner':
        return { color: 'bg-purple-500/15 text-purple-300 border-purple-500/30', label: 'Planner Agent' };
      case 'execution':
        return { color: 'bg-blue-500/15 text-blue-300 border-blue-500/30', label: 'Execution Agent' };
      case 'validation':
        return { color: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30', label: 'Validation Agent' };
      case 'recovery':
        return { color: 'bg-amber-500/15 text-amber-300 border-amber-500/30', label: 'Recovery Agent' };
      case 'monitoring':
        return { color: 'bg-cyan-500/15 text-cyan-300 border-cyan-500/30', label: 'Monitoring Agent' };
      default:
        return { color: 'bg-indigo-500/15 text-indigo-300 border-indigo-500/30', label: 'System Orchestrator' };
    }
  };

  const getAgentIcon = (agent) => {
    switch (agent) {
      case 'planner': return <Database className="h-4 w-4" />;
      case 'execution': return <Activity className="h-4 w-4" />;
      case 'validation': return <CheckCircle className="h-4 w-4" />;
      case 'recovery': return <ShieldAlert className="h-4 w-4" />;
      default: return <Bot className="h-4 w-4" />;
    }
  };

  return (
    <ProtectedRoute>
      <AppShell>
        <div className="p-6 md:p-10 max-w-5xl mx-auto space-y-6">
          {/* Header Controls */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-gray-800">
            <div className="flex items-center gap-3">
              <Link
                href="/executions"
                className="p-2 rounded-xl bg-gray-900 border border-gray-800 text-gray-400 hover:text-white hover:border-gray-700 transition"
              >
                <ArrowLeft className="h-5 w-5" />
              </Link>
              <div>
                <div className="flex items-center gap-2.5">
                  <h1 className="text-xl md:text-2xl font-bold text-white tracking-tight">Execution Timeline</h1>
                  <span className={`text-xs font-mono font-semibold px-2.5 py-0.5 rounded-full uppercase tracking-wider ${
                    execution?.status === 'COMPLETED' ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30' :
                    execution?.status === 'RUNNING' ? 'bg-indigo-500/15 text-indigo-300 border border-indigo-500/30 animate-pulse' :
                    execution?.status === 'PAUSED' ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30' :
                    execution?.status === 'CANCELLED' ? 'bg-gray-800 text-gray-400 border border-gray-700' :
                    'bg-rose-500/15 text-rose-300 border border-rose-500/30'
                  }`}>
                    {execution?.status || 'RUNNING'}
                  </span>
                </div>
                <p className="text-xs text-gray-500 font-mono mt-0.5">
                  ID: {id} {execution?.startTime ? `• Started ${new Date(execution.startTime).toLocaleTimeString()}` : ''}
                </p>
              </div>
            </div>

            {/* Execution Controls: Pause, Resume, Cancel */}
            <div className="flex items-center gap-2">
              <button
                onClick={fetchExecutionData}
                className="p-2 rounded-xl bg-gray-900 border border-gray-800 hover:bg-gray-800 text-gray-400 hover:text-white transition"
                title="Refresh Logs"
              >
                <RefreshCw className="h-4 w-4" />
              </button>

              {execution?.status === 'RUNNING' && (
                <button
                  onClick={handlePause}
                  disabled={actionLoading}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-semibold transition"
                >
                  <Pause className="h-3.5 w-3.5" /> Pause
                </button>
              )}

              {execution?.status === 'PAUSED' && (
                <button
                  onClick={handleResume}
                  disabled={actionLoading}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-semibold transition"
                >
                  <Play className="h-3.5 w-3.5" /> Resume
                </button>
              )}

              {['RUNNING', 'PAUSED'].includes(execution?.status) && (
                <button
                  onClick={handleCancel}
                  disabled={actionLoading}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 text-xs font-semibold transition"
                >
                  <XCircle className="h-3.5 w-3.5" /> Cancel
                </button>
              )}
            </div>
          </div>

          {/* Timeline Feed */}
          <div className="bg-gray-900/40 border border-gray-800/80 rounded-2xl p-6 shadow-xl backdrop-blur-xs">
            {loading ? (
              <div className="py-16 text-center text-sm text-gray-500 font-mono">
                Connecting to Socket.IO event stream...
              </div>
            ) : logs.length === 0 ? (
              <div className="py-16 text-center text-gray-500">
                <Clock className="h-10 w-10 mx-auto mb-3 opacity-30 text-gray-400" />
                <p className="text-sm font-medium text-gray-300">Waiting for agent events</p>
                <p className="text-xs text-gray-500 mt-1">Planner and executor events will stream here live.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {logs.map((log, index) => {
                  const badge = getAgentBadge(log.agent);
                  return (
                    <div
                      key={log._id || index}
                      className="p-4 rounded-xl bg-gray-950/70 border border-gray-800/90 shadow-sm transition hover:border-gray-700"
                    >
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <div className="flex items-center gap-2">
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold border ${badge.color}`}>
                            {getAgentIcon(log.agent)}
                            {badge.label}
                          </span>
                          {log.nodeId && (
                            <span className="text-[10px] text-gray-400 font-mono bg-gray-900 px-2 py-0.5 rounded border border-gray-800">
                              node: {log.nodeId}
                            </span>
                          )}
                        </div>
                        <time className="text-[11px] text-gray-500 font-mono">
                          {log.createdAt ? new Date(log.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }) : ''}
                        </time>
                      </div>

                      <p className={`text-sm leading-relaxed ${
                        log.level === 'error' ? 'text-rose-400 font-medium' :
                        log.level === 'warning' ? 'text-amber-400' :
                        log.level === 'success' ? 'text-emerald-300' : 'text-gray-200'
                      }`}>
                        {log.message}
                      </p>

                      {log.metadata && Object.keys(log.metadata).length > 0 && (
                        <pre className="mt-3 p-2.5 rounded-lg bg-gray-900/90 border border-gray-800 text-[11px] text-gray-400 overflow-x-auto font-mono">
                          {JSON.stringify(log.metadata, null, 2)}
                        </pre>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </AppShell>
    </ProtectedRoute>
  );
}

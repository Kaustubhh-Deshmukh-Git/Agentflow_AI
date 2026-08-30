import { useState, useEffect } from 'react';
import ProtectedRoute from '../components/ProtectedRoute';
import AppShell from '../components/AppShell';
import { useAuthStore } from '../store/authStore';
import api from '../services/api';
import Link from 'next/link';
import { 
  Workflow, 
  PlaySquare, 
  CheckCircle2, 
  Clock, 
  Sparkles, 
  Plus, 
  ArrowRight, 
  Bot, 
  Activity, 
  Layers,
  TrendingUp,
  Cable
} from 'lucide-react';

export default function Dashboard() {
  const user = useAuthStore((state) => state.user);
  const [stats, setStats] = useState({
    totalWorkflows: 0,
    activeWorkflows: 0,
    totalExecutions: 0,
    successRate: 0,
    recentExecutions: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const { data } = await api.get('/workflows/dashboard');
        setStats(data || {});
      } catch (err) {
        console.error('Failed to fetch dashboard metrics:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  const metricCards = [
    {
      title: 'Active Workflows',
      value: stats.activeWorkflows ?? 0,
      sub: `${stats.totalWorkflows ?? 0} total registered`,
      icon: Workflow,
      color: 'from-indigo-500/20 to-indigo-600/10 text-indigo-400 border-indigo-500/30',
    },
    {
      title: 'Total Executions',
      value: stats.totalExecutions ?? 0,
      sub: 'All agent orchestration runs',
      icon: PlaySquare,
      color: 'from-purple-500/20 to-purple-600/10 text-purple-400 border-purple-500/30',
    },
    {
      title: 'Success Rate',
      value: `${stats.successRate ?? 100}%`,
      sub: 'Completed without escalation',
      icon: TrendingUp,
      color: 'from-emerald-500/20 to-emerald-600/10 text-emerald-400 border-emerald-500/30',
    },
  ];

  return (
    <ProtectedRoute>
      <AppShell>
        <div className="p-6 md:p-10 max-w-7xl mx-auto space-y-8">
          {/* Header Banner */}
          <div className="relative rounded-2xl overflow-hidden bg-gradient-to-r from-indigo-950/60 via-purple-950/40 to-gray-950 border border-indigo-500/20 p-8 shadow-2xl">
            <div className="relative z-10 max-w-3xl space-y-3">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-xs font-semibold">
                <Bot className="h-3.5 w-3.5" /> Multi-Agent Operations Console
              </div>
              <h1 className="text-2xl md:text-4xl font-extrabold text-white tracking-tight">
                Welcome back, {user?.name || 'Operator'}
              </h1>
              <p className="text-gray-300 text-sm md:text-base leading-relaxed">
                Describe an automation in natural language, visually refine your graphs on the React Flow canvas, and inspect live 5-agent execution timelines in real-time.
              </p>
              <div className="flex flex-wrap items-center gap-3 pt-2">
                <Link
                  href="/workflows/builder"
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-xs font-semibold shadow-lg shadow-indigo-600/25 transition"
                >
                  <Sparkles className="h-4 w-4" /> Prompt-to-Workflow
                </Link>
                <Link
                  href="/workflows"
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gray-900/80 hover:bg-gray-800 text-gray-200 text-xs font-semibold border border-gray-700 transition"
                >
                  <Layers className="h-4 w-4" /> View Canvas Workflows
                </Link>
                <Link
                  href="/integrations"
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gray-900/80 hover:bg-gray-800 text-gray-200 text-xs font-semibold border border-gray-700 transition"
                >
                  <Cable className="h-4 w-4" /> Manage Integrations
                </Link>
              </div>
            </div>
            {/* Background ambient glow */}
            <div className="absolute top-0 right-0 -mt-8 -mr-8 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />
          </div>

          {/* Metric Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {metricCards.map((m) => {
              const Icon = m.icon;
              return (
                <div
                  key={m.title}
                  className={`relative overflow-hidden bg-gradient-to-br ${m.color} border rounded-2xl p-6 shadow-xl backdrop-blur-xs transition hover:translate-y-[-2px]`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold uppercase tracking-wider text-gray-400">{m.title}</span>
                    <div className="p-2.5 rounded-xl bg-gray-950/40 border border-white/5">
                      <Icon className="h-5 w-5" />
                    </div>
                  </div>
                  <div className="mt-4">
                    <div className="text-3xl md:text-4xl font-extrabold text-white tracking-tight font-mono">
                      {loading ? '...' : m.value}
                    </div>
                    <div className="text-xs text-gray-400 mt-1">{m.sub}</div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Agent Architecture Showcase & Recent Executions */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left 2 Cols: Recent Executions Panel */}
            <div className="lg:col-span-2 bg-gray-900/60 border border-gray-800 rounded-2xl p-6 shadow-xl backdrop-blur-xs">
              <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-800">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400">
                    <Activity className="h-5 w-5" />
                  </div>
                  <div>
                    <h2 className="text-base font-semibold text-white">Execution Activity Feed</h2>
                    <p className="text-xs text-gray-400">Recent multi-agent runtime sessions</p>
                  </div>
                </div>
                <Link
                  href="/executions"
                  className="text-xs text-indigo-400 hover:text-indigo-300 font-medium flex items-center gap-1"
                >
                  View all <ArrowRight className="h-3 w-3" />
                </Link>
              </div>

              {loading ? (
                <div className="py-12 text-center text-sm text-gray-500">Loading activity feed...</div>
              ) : (stats.recentExecutions || []).length === 0 ? (
                <div className="py-12 text-center text-gray-500 space-y-2">
                  <PlaySquare className="h-8 w-8 mx-auto opacity-30 text-gray-400" />
                  <p className="text-sm font-medium text-gray-300">No executions logged yet</p>
                  <p className="text-xs text-gray-500">Trigger a workflow to see its step-by-step audit trail.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {stats.recentExecutions.map((exec) => (
                    <div
                      key={exec._id}
                      className="flex items-center justify-between p-3.5 rounded-xl bg-gray-950/60 border border-gray-800/80 hover:border-gray-700 transition"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className={`p-2 rounded-lg ${
                          exec.status === 'COMPLETED' ? 'bg-emerald-500/10 text-emerald-400' :
                          exec.status === 'RUNNING' ? 'bg-indigo-500/10 text-indigo-400 animate-pulse' :
                          exec.status === 'FAILED' ? 'bg-rose-500/10 text-rose-400' : 'bg-gray-800 text-gray-400'
                        }`}>
                          <PlaySquare className="h-4 w-4" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-semibold text-white truncate">
                            {exec.workflowId?.name || `Workflow ${exec.workflowId}`}
                          </p>
                          <p className="text-[10px] text-gray-500 font-mono">
                            {new Date(exec.createdAt).toLocaleString()} {exec.duration ? `• ${exec.duration}ms` : ''}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                          exec.status === 'COMPLETED' ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30' :
                          exec.status === 'RUNNING' ? 'bg-indigo-500/15 text-indigo-300 border border-indigo-500/30' :
                          exec.status === 'FAILED' ? 'bg-rose-500/15 text-rose-300 border border-rose-500/30' : 'bg-gray-800 text-gray-400'
                        }`}>
                          {exec.status}
                        </span>
                        <Link
                          href={`/executions/${exec._id}`}
                          className="p-1.5 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white transition"
                          title="View Timeline"
                        >
                          <ArrowRight className="h-3.5 w-3.5" />
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Right Col: 5-Agent Pipeline Reference */}
            <div className="bg-gray-900/60 border border-gray-800 rounded-2xl p-6 shadow-xl backdrop-blur-xs space-y-4">
              <div className="flex items-center gap-3 pb-3 border-b border-gray-800">
                <div className="p-2 rounded-lg bg-purple-500/10 text-purple-400">
                  <Bot className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-base font-semibold text-white">5-Agent Engine</h2>
                  <p className="text-xs text-gray-400">Cooperating orchestration chain</p>
                </div>
              </div>

              <div className="space-y-2.5 text-xs">
                <div className="p-2.5 rounded-xl bg-purple-500/10 border border-purple-500/20">
                  <div className="font-semibold text-purple-300">1. Planner Agent</div>
                  <div className="text-gray-400 text-[11px] mt-0.5">Topological node sequencing & confidence score</div>
                </div>

                <div className="p-2.5 rounded-xl bg-blue-500/10 border border-blue-500/20">
                  <div className="font-semibold text-blue-300">2. Execution Agent</div>
                  <div className="text-gray-400 text-[11px] mt-0.5">Integrations & AI runtime dispatcher</div>
                </div>

                <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                  <div className="font-semibold text-emerald-300">3. Validation Agent</div>
                  <div className="text-gray-400 text-[11px] mt-0.5">Output payload verification & schema integrity</div>
                </div>

                <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20">
                  <div className="font-semibold text-amber-300">4. Recovery Agent</div>
                  <div className="text-gray-400 text-[11px] mt-0.5">Failure classification & backoff retry strategy</div>
                </div>

                <div className="p-2.5 rounded-xl bg-indigo-500/10 border border-indigo-500/20">
                  <div className="font-semibold text-indigo-300">5. Monitoring Agent</div>
                  <div className="text-gray-400 text-[11px] mt-0.5">Socket.IO streaming & persistent audit trail</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </AppShell>
    </ProtectedRoute>
  );
}

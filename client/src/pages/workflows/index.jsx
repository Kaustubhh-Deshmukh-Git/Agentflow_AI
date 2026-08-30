import { useEffect, useState } from 'react';
import ProtectedRoute from '../../components/ProtectedRoute';
import AppShell from '../../components/AppShell';
import api from '../../services/api';
import Link from 'next/link';
import { 
  Plus, 
  ArrowRight, 
  Sparkles, 
  Search, 
  Copy, 
  Trash2, 
  Play, 
  Workflow as WorkflowIcon,
  Layers,
  Check
} from 'lucide-react';
import { useRouter } from 'next/router';

export default function WorkflowsList() {
  const [workflows, setWorkflows] = useState([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const fetchWorkflows = async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/workflows');
      setWorkflows(data || []);
    } catch (err) {
      console.error('Failed to load workflows:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWorkflows();
  }, []);

  const createWorkflow = async () => {
    try {
      const { data } = await api.post('/workflows', {
        name: 'New Custom Automation',
        description: 'Visual workflow created on the React Flow canvas',
        nodes: [
          { id: '1', type: 'default', position: { x: 250, y: 50 }, data: { label: 'Webhook Trigger', type: 'trigger' } }
        ],
        edges: []
      });
      router.push(`/workflows/${data._id}`);
    } catch (err) {
      console.error(err);
      alert('Failed to create workflow');
    }
  };

  const handleDuplicate = async (id, e) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      await api.post(`/workflows/${id}/duplicate`);
      fetchWorkflows();
    } catch (err) {
      console.error(err);
      alert('Failed to duplicate workflow');
    }
  };

  const handleDelete = async (id, e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!confirm('Are you sure you want to delete this workflow?')) return;
    try {
      await api.delete(`/workflows/${id}`);
      setWorkflows(prev => prev.filter(w => w._id !== id));
    } catch (err) {
      console.error(err);
      alert('Failed to delete workflow');
    }
  };

  const handleExecute = async (id, e) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      const { data } = await api.post(`/workflows/${id}/execute`);
      router.push(`/executions/${data._id}`);
    } catch (err) {
      console.error(err);
      alert('Execution trigger failed');
    }
  };

  const filtered = workflows.filter(w => {
    const matchesSearch = w.name?.toLowerCase().includes(search.toLowerCase()) || 
                          w.description?.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'all' || w.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <ProtectedRoute>
      <AppShell>
        <div className="p-6 md:p-10 max-w-7xl mx-auto space-y-8">
          {/* Header Bar */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight">Workflows</h1>
              <p className="text-sm text-gray-400 mt-1">
                Visual graph pipelines executed through the 5-agent cooperative engine.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <Link 
                href="/workflows/builder"
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-purple-600/15 text-purple-300 border border-purple-500/30 hover:bg-purple-600/25 text-xs font-semibold shadow-xs transition"
              >
                <Sparkles className="h-4 w-4" />
                Prompt Generator
              </Link>
              <button 
                onClick={createWorkflow}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-lg shadow-indigo-600/25 transition"
              >
                <Plus className="h-4 w-4" />
                New Workflow
              </button>
            </div>
          </div>

          {/* Search & Filters */}
          <div className="flex flex-col sm:flex-row items-center gap-4 bg-gray-900/40 p-3 rounded-2xl border border-gray-800/80">
            <div className="relative flex-1 w-full">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
              <input
                type="text"
                placeholder="Search workflows by title or description..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-gray-950/80 border border-gray-800 rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder-gray-500 focus:outline-hidden focus:border-indigo-500 transition"
              />
            </div>
            <div className="flex items-center gap-2 self-end sm:self-auto">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-gray-950/80 border border-gray-800 rounded-xl px-3 py-2 text-xs text-gray-300 focus:outline-hidden"
              >
                <option value="all">All Statuses</option>
                <option value="draft">Draft</option>
                <option value="active">Active</option>
                <option value="paused">Paused</option>
              </select>
            </div>
          </div>

          {/* Workflow Cards Grid */}
          {loading ? (
            <div className="py-20 text-center text-sm text-gray-500 font-mono">Loading workflow catalog...</div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-20 bg-gray-900/40 border border-gray-800/80 rounded-2xl p-8 space-y-4">
              <WorkflowIcon className="h-12 w-12 mx-auto text-gray-600" />
              <h3 className="text-base font-semibold text-gray-200">No workflows found</h3>
              <p className="text-xs text-gray-400 max-w-sm mx-auto">
                {search ? 'No workflows match your search query.' : 'Create your first automation or generate one from natural language.'}
              </p>
              <button
                onClick={createWorkflow}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-semibold shadow-lg transition"
              >
                <Plus className="h-4 w-4" /> Create Workflow
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filtered.map((wf) => (
                <div
                  key={wf._id}
                  className="bg-gray-900/60 border border-gray-800/80 hover:border-gray-700/80 p-6 rounded-2xl shadow-xl backdrop-blur-xs flex flex-col justify-between transition-all hover:translate-y-[-2px] group"
                >
                  <div>
                    <div className="flex items-start justify-between gap-2 mb-3">
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                        wf.status === 'active' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-gray-800 text-gray-400 border border-gray-700'
                      }`}>
                        {wf.status || 'draft'}
                      </span>
                      <span className="text-[11px] text-gray-500 font-mono">v{wf.version || 1}</span>
                    </div>

                    <h3 className="text-base font-semibold text-white group-hover:text-indigo-300 transition-colors line-clamp-1">
                      {wf.name}
                    </h3>
                    <p className="text-xs text-gray-400 mt-1.5 line-clamp-2 leading-relaxed min-h-[32px]">
                      {wf.description || 'Custom graph automation'}
                    </p>

                    <div className="flex items-center gap-3 mt-4 text-[11px] text-gray-500 font-mono">
                      <span>{(wf.nodes || []).length} nodes</span>
                      <span>•</span>
                      <span>{(wf.edges || []).length} connections</span>
                    </div>
                  </div>

                  {/* Card Bottom Actions */}
                  <div className="flex items-center justify-between pt-4 mt-4 border-t border-gray-800/60">
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={(e) => handleExecute(wf._id, e)}
                        className="p-2 rounded-lg bg-indigo-600/15 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/20 transition"
                        title="Execute Workflow"
                      >
                        <Play className="h-3.5 w-3.5 fill-current" />
                      </button>
                      <button
                        onClick={(e) => handleDuplicate(wf._id, e)}
                        className="p-2 rounded-lg bg-gray-800/60 hover:bg-gray-800 text-gray-400 hover:text-white transition"
                        title="Duplicate"
                      >
                        <Copy className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={(e) => handleDelete(wf._id, e)}
                        className="p-2 rounded-lg bg-gray-800/60 hover:bg-rose-500/20 text-gray-400 hover:text-rose-400 transition"
                        title="Delete"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>

                    <Link
                      href={`/workflows/${wf._id}`}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-200 text-xs font-semibold transition"
                    >
                      Canvas Editor <ArrowRight className="h-3.5 w-3.5" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </AppShell>
    </ProtectedRoute>
  );
}

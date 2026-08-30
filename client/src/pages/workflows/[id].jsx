import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import ProtectedRoute from '../../components/ProtectedRoute';
import WorkflowCanvas from '../../components/WorkflowCanvas';
import NodePalette from '../../components/NodePalette';
import NodeConfigPanel from '../../components/NodeConfigPanel';
import api from '../../services/api';
import { useWorkflowStore } from '../../store/workflowStore';
import { ArrowLeft, Save, Play, Copy, Check, Loader2, Sparkles } from 'lucide-react';
import Link from 'next/link';

export default function WorkflowEditor() {
  const router = useRouter();
  const { id } = router.query;
  const { setWorkflow, nodes, edges, workflowMeta } = useWorkflowStore();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [executing, setExecuting] = useState(false);

  useEffect(() => {
    if (id) {
      const fetchWorkflow = async () => {
        try {
          const { data } = await api.get(`/workflows/${id}`);
          setWorkflow(id, data, data.nodes, data.edges);
        } catch (err) {
          console.error('Failed to load workflow:', err);
        } finally {
          setLoading(false);
        }
      };
      fetchWorkflow();
    }
  }, [id, setWorkflow]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.put(`/workflows/${id}`, { 
        nodes, 
        edges, 
        name: workflowMeta?.name || 'Untitled Workflow',
        status: workflowMeta?.status || 'draft'
      });
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2000);
    } catch (err) {
      console.error('Save error:', err);
      alert('Failed to save workflow changes.');
    } finally {
      setSaving(false);
    }
  };

  const handleExecute = async () => {
    setExecuting(true);
    try {
      // Save current state first
      await api.put(`/workflows/${id}`, { 
        nodes, 
        edges, 
        name: workflowMeta?.name || 'Untitled Workflow' 
      });

      // Trigger execution
      const { data } = await api.post(`/workflows/${id}/execute`);
      // Redirect to the execution live timeline
      router.push(`/executions/${data._id}`);
    } catch (err) {
      console.error('Execution launch error:', err);
      alert('Failed to trigger workflow execution: ' + (err.response?.data?.error || err.message));
    } finally {
      setExecuting(false);
    }
  };

  const handleDuplicate = async () => {
    try {
      const { data } = await api.post(`/workflows/${id}/duplicate`);
      router.push(`/workflows/${data._id}`);
    } catch (err) {
      console.error(err);
      alert('Failed to duplicate workflow');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#090b10] text-white flex items-center justify-center">
        <div className="flex items-center gap-3 text-sm text-gray-400 font-mono">
          <Loader2 className="h-5 w-5 animate-spin text-indigo-500" />
          Loading React Flow Canvas...
        </div>
      </div>
    );
  }

  return (
    <ProtectedRoute>
      <div className="h-screen bg-[#090b10] text-white flex flex-col overflow-hidden select-none">
        {/* Top Editor Toolbar */}
        <div className="h-14 border-b border-gray-800/80 bg-gray-950/80 backdrop-blur-md flex items-center justify-between px-4 shrink-0 z-20">
          <div className="flex items-center gap-4">
            <Link 
              href="/workflows" 
              className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-gray-900 transition-colors"
              title="Back to Workflows"
            >
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <div className="flex items-center gap-2">
              <div className="font-semibold text-sm text-white">
                {workflowMeta?.name || 'Workflow Editor'}
              </div>
              <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-md uppercase tracking-wider ${
                workflowMeta?.status === 'active' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-gray-800 text-gray-400 border border-gray-700'
              }`}>
                {workflowMeta?.status || 'draft'}
              </span>
              <span className="text-xs text-gray-500 font-mono">v{workflowMeta?.version || 1}</span>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={handleDuplicate}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-900 hover:bg-gray-800 border border-gray-700/60 rounded-xl text-xs font-medium text-gray-300 hover:text-white transition shadow-xs"
              title="Duplicate Workflow"
            >
              <Copy className="h-3.5 w-3.5" />
              Duplicate
            </button>

            <button 
              onClick={handleSave} 
              disabled={saving} 
              className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-800/80 hover:bg-gray-700 border border-gray-700 rounded-xl text-xs font-medium text-gray-200 transition shadow-xs"
            >
              {saveSuccess ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Save className="h-3.5 w-3.5" />}
              {saving ? 'Saving...' : saveSuccess ? 'Saved!' : 'Save Graph'}
            </button>

            <button
              onClick={handleExecute}
              disabled={executing}
              className="flex items-center gap-1.5 px-4 py-1.5 bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-700 hover:from-indigo-500 hover:to-purple-500 text-white rounded-xl text-xs font-semibold shadow-lg shadow-indigo-600/25 transition disabled:opacity-50"
            >
              {executing ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Play className="h-3.5 w-3.5 fill-current" />}
              {executing ? 'Launching...' : 'Execute Agent Chain'}
            </button>
          </div>
        </div>

        {/* 3-Column Editor Layout: Palette | Canvas | Config */}
        <div className="flex-1 flex overflow-hidden relative">
          <NodePalette />
          <WorkflowCanvas />
          <NodeConfigPanel />
        </div>
      </div>
    </ProtectedRoute>
  );
}

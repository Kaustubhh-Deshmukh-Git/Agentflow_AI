import { useWorkflowStore } from '../store/workflowStore';
import { Settings2, Trash2, Sliders, Bot, Mail, MessageSquare, Database, Disc as DiscordIcon } from 'lucide-react';

export default function NodeConfigPanel() {
  const { selectedNode, updateNodeData, nodes, edges, setWorkflow, workflowId, workflowMeta } = useWorkflowStore();

  if (!selectedNode) {
    return (
      <div className="w-80 bg-gray-950/80 border-l border-gray-800/80 p-6 flex flex-col h-full shrink-0 items-center justify-center text-center select-none z-10">
        <div className="w-12 h-12 rounded-2xl bg-gray-900 border border-gray-800 flex items-center justify-center mb-3 text-gray-500">
          <Sliders className="h-5 w-5" />
        </div>
        <h3 className="text-sm font-semibold text-gray-300">No Node Selected</h3>
        <p className="text-xs text-gray-500 mt-1 max-w-[200px]">
          Click any node on the visual canvas to configure parameters, actions, and credentials.
        </p>
      </div>
    );
  }

  const nodeType = selectedNode.data?.type || 'default';

  const handleChange = (e) => {
    updateNodeData(selectedNode.id, { [e.target.name]: e.target.value });
  };

  const handleConfigChange = (e) => {
    const currentConfig = selectedNode.data?.config || {};
    updateNodeData(selectedNode.id, {
      config: { ...currentConfig, [e.target.name]: e.target.value }
    });
  };

  const handleDeleteNode = () => {
    const updatedNodes = nodes.filter(n => n.id !== selectedNode.id);
    const updatedEdges = edges.filter(e => e.source !== selectedNode.id && e.target !== selectedNode.id);
    setWorkflow(workflowId, workflowMeta, updatedNodes, updatedEdges);
  };

  const config = selectedNode.data?.config || {};

  return (
    <div className="w-80 bg-gray-950/80 border-l border-gray-800/80 flex flex-col h-full shrink-0 select-none z-10">
      {/* Panel Header */}
      <div className="p-4 border-b border-gray-800/80 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Settings2 className="h-4 w-4 text-indigo-400" />
          <h3 className="text-xs font-semibold uppercase tracking-wider text-white">Configure Node</h3>
        </div>
        <button
          onClick={handleDeleteNode}
          className="p-1.5 rounded-lg text-gray-400 hover:text-rose-400 hover:bg-rose-500/10 transition"
          title="Delete Node"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>

      {/* Node Form Fields */}
      <div className="p-4 flex-1 overflow-y-auto space-y-4 text-xs">
        <div>
          <label className="block font-medium text-gray-400 mb-1">Node Title / Label</label>
          <input
            type="text"
            name="label"
            value={selectedNode.data?.label || ''}
            onChange={handleChange}
            className="w-full bg-gray-900 border border-gray-800 rounded-xl px-3 py-2 text-white focus:outline-hidden focus:border-indigo-500 transition"
          />
        </div>

        {/* AI Agent Node Fields */}
        {nodeType === 'ai' && (
          <div className="space-y-3 pt-2 border-t border-gray-800/60">
            <div className="flex items-center gap-2 text-indigo-400 font-semibold">
              <Bot className="h-4 w-4" /> AI Instructions
            </div>
            <div>
              <label className="block font-medium text-gray-400 mb-1">Prompt Template</label>
              <textarea
                name="prompt"
                value={selectedNode.data?.prompt || ''}
                onChange={handleChange}
                rows={4}
                className="w-full bg-gray-900 border border-gray-800 rounded-xl px-3 py-2 text-white focus:outline-hidden focus:border-indigo-500 transition resize-none"
                placeholder="e.g. Summarize the incident payload and extract key identifiers..."
              />
            </div>
          </div>
        )}

        {/* Gmail Node Fields */}
        {nodeType === 'gmail' && (
          <div className="space-y-3 pt-2 border-t border-gray-800/60">
            <div className="flex items-center gap-2 text-rose-400 font-semibold">
              <Mail className="h-4 w-4" /> Gmail Parameters
            </div>
            <div>
              <label className="block font-medium text-gray-400 mb-1">Action</label>
              <select
                name="action"
                value={selectedNode.data?.action || 'send_email'}
                onChange={handleChange}
                className="w-full bg-gray-900 border border-gray-800 rounded-xl px-3 py-2 text-white focus:outline-hidden"
              >
                <option value="send_email">Send Email</option>
                <option value="read_email">Read Latest Emails</option>
              </select>
            </div>
            <div>
              <label className="block font-medium text-gray-400 mb-1">Recipient (To)</label>
              <input
                type="text"
                name="to"
                value={config.to || ''}
                onChange={handleConfigChange}
                placeholder="ops@company.com"
                className="w-full bg-gray-900 border border-gray-800 rounded-xl px-3 py-2 text-white"
              />
            </div>
            <div>
              <label className="block font-medium text-gray-400 mb-1">Subject</label>
              <input
                type="text"
                name="subject"
                value={config.subject || ''}
                onChange={handleConfigChange}
                placeholder="Alert Notification"
                className="w-full bg-gray-900 border border-gray-800 rounded-xl px-3 py-2 text-white"
              />
            </div>
          </div>
        )}

        {/* Slack Node Fields */}
        {nodeType === 'slack' && (
          <div className="space-y-3 pt-2 border-t border-gray-800/60">
            <div className="flex items-center gap-2 text-sky-400 font-semibold">
              <MessageSquare className="h-4 w-4" /> Slack Parameters
            </div>
            <div>
              <label className="block font-medium text-gray-400 mb-1">Channel</label>
              <input
                type="text"
                name="channel"
                value={config.channel || ''}
                onChange={handleConfigChange}
                placeholder="general"
                className="w-full bg-gray-900 border border-gray-800 rounded-xl px-3 py-2 text-white"
              />
            </div>
            <div>
              <label className="block font-medium text-gray-400 mb-1">Message Text</label>
              <textarea
                name="text"
                value={config.text || ''}
                onChange={handleConfigChange}
                rows={3}
                placeholder="Automated message content..."
                className="w-full bg-gray-900 border border-gray-800 rounded-xl px-3 py-2 text-white resize-none"
              />
            </div>
          </div>
        )}

        {/* Discord Node Fields */}
        {nodeType === 'discord' && (
          <div className="space-y-3 pt-2 border-t border-gray-800/60">
            <div className="flex items-center gap-2 text-violet-400 font-semibold">
              <DiscordIcon className="h-4 w-4" /> Discord Parameters
            </div>
            <div>
              <label className="block font-medium text-gray-400 mb-1">Channel ID / Name</label>
              <input
                type="text"
                name="channelId"
                value={config.channelId || ''}
                onChange={handleConfigChange}
                placeholder="123456789"
                className="w-full bg-gray-900 border border-gray-800 rounded-xl px-3 py-2 text-white"
              />
            </div>
            <div>
              <label className="block font-medium text-gray-400 mb-1">Content</label>
              <textarea
                name="content"
                value={config.content || ''}
                onChange={handleConfigChange}
                rows={3}
                placeholder="🚨 Workflow notification payload"
                className="w-full bg-gray-900 border border-gray-800 rounded-xl px-3 py-2 text-white resize-none"
              />
            </div>
          </div>
        )}

        {/* Google Sheets Node Fields */}
        {nodeType === 'google-sheets' && (
          <div className="space-y-3 pt-2 border-t border-gray-800/60">
            <div className="flex items-center gap-2 text-emerald-400 font-semibold">
              <Database className="h-4 w-4" /> Google Sheets Parameters
            </div>
            <div>
              <label className="block font-medium text-gray-400 mb-1">Spreadsheet ID</label>
              <input
                type="text"
                name="spreadsheetId"
                value={config.spreadsheetId || ''}
                onChange={handleConfigChange}
                placeholder="1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms"
                className="w-full bg-gray-900 border border-gray-800 rounded-xl px-3 py-2 text-white"
              />
            </div>
            <div>
              <label className="block font-medium text-gray-400 mb-1">Sheet Range</label>
              <input
                type="text"
                name="range"
                value={config.range || ''}
                onChange={handleConfigChange}
                placeholder="Sheet1!A1:D"
                className="w-full bg-gray-900 border border-gray-800 rounded-xl px-3 py-2 text-white"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

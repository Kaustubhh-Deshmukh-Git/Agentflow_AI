import { GripVertical, Webhook, Bot, Mail, MessageSquare, Database, Disc as DiscordIcon } from 'lucide-react';

const nodeTypes = [
  { type: 'trigger', label: 'Webhook Trigger', icon: Webhook, color: 'text-amber-400', desc: 'Entry point for external events' },
  { type: 'ai', label: 'AI Agent', icon: Bot, color: 'text-indigo-400', desc: 'LLM reasoning & extraction' },
  { type: 'gmail', label: 'Gmail Send / Read', icon: Mail, color: 'text-rose-400', desc: 'OAuth mail integration' },
  { type: 'slack', label: 'Slack Message', icon: MessageSquare, color: 'text-sky-400', desc: 'Channel & bot notifications' },
  { type: 'discord', label: 'Discord Alert', icon: DiscordIcon, color: 'text-violet-400', desc: 'Server webhooks & messages' },
  { type: 'google-sheets', label: 'Google Sheets', icon: Database, color: 'text-emerald-400', desc: 'Append & query rows' },
];

export default function NodePalette() {
  const onDragStart = (event, nodeType, label) => {
    event.dataTransfer.setData('application/reactflow', nodeType);
    event.dataTransfer.setData('application/reactflow-label', label);
    event.dataTransfer.effectAllowed = 'move';
  };

  return (
    <div className="w-64 bg-gray-950/80 border-r border-gray-800/80 p-4 flex flex-col h-full overflow-y-auto shrink-0 z-10 select-none">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Node Palette</h3>
        <span className="text-[10px] text-gray-500 font-mono">Drag to canvas</span>
      </div>
      
      <div className="space-y-2.5">
        {nodeTypes.map((node) => {
          const Icon = node.icon;
          return (
            <div
              key={node.type}
              className="flex items-start gap-3 p-3 bg-gray-900/60 hover:bg-gray-900 border border-gray-800 hover:border-gray-700 rounded-xl cursor-grab active:cursor-grabbing transition-all hover:scale-[1.02] shadow-xs group"
              onDragStart={(event) => onDragStart(event, node.type, node.label)}
              draggable
            >
              <GripVertical className="h-4 w-4 text-gray-600 mt-0.5 group-hover:text-gray-400 transition" />
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <Icon className={`h-4 w-4 ${node.color} shrink-0`} />
                  <span className="text-xs font-semibold text-gray-200 truncate">{node.label}</span>
                </div>
                <p className="text-[10px] text-gray-500 mt-0.5 leading-tight">{node.desc}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

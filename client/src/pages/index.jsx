import Link from 'next/link';
import { useAuthStore } from '../store/authStore';
import { 
  Bot, 
  Sparkles, 
  Workflow, 
  ShieldCheck, 
  Zap, 
  ArrowRight, 
  Layers, 
  Play, 
  CheckCircle2, 
  MessageSquare, 
  Mail, 
  Database,
  Disc as DiscordIcon,
  ChevronRight,
  Sliders,
  Cpu,
  RefreshCw
} from 'lucide-react';

export default function LandingPage() {
  const user = useAuthStore((state) => state.user);

  const agentSteps = [
    {
      step: '01',
      name: 'Planner Agent',
      color: 'from-purple-500/20 to-purple-600/10 border-purple-500/30 text-purple-300',
      icon: Cpu,
      desc: 'Performs topological sort across nodes and emits execution confidence score.',
    },
    {
      step: '02',
      name: 'Execution Agent',
      color: 'from-blue-500/20 to-blue-600/10 border-blue-500/30 text-blue-300',
      icon: Zap,
      desc: 'Invokes real SaaS integrations (Gmail, Slack, Discord, Sheets) and LLM engines.',
    },
    {
      step: '03',
      name: 'Validation Agent',
      color: 'from-emerald-500/20 to-emerald-600/10 border-emerald-500/30 text-emerald-300',
      icon: CheckCircle2,
      desc: 'Asserts schema integrity and checks for missing parameters before downstream handoff.',
    },
    {
      step: '04',
      name: 'Recovery Agent',
      color: 'from-amber-500/20 to-amber-600/10 border-amber-500/30 text-amber-300',
      icon: RefreshCw,
      desc: 'Classifies failure root causes (rate limits, auth expiry) and triggers smart backoff.',
    },
    {
      step: '05',
      name: 'Monitoring Agent',
      color: 'from-cyan-500/20 to-cyan-600/10 border-cyan-500/30 text-cyan-300',
      icon: Sliders,
      desc: 'Streams live Socket.IO audit events and stores granular database execution logs.',
    },
  ];

  return (
    <div className="min-h-screen bg-[#090b10] text-gray-100 selection:bg-indigo-500 selection:text-white relative overflow-hidden">
      {/* Background ambient lighting */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-gradient-to-b from-indigo-600/20 via-purple-600/10 to-transparent blur-[120px] pointer-events-none" />

      {/* Navigation */}
      <header className="relative z-20 max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center shadow-lg shadow-indigo-500/30">
            <Bot className="h-6 w-6 text-white" />
          </div>
          <div className="flex flex-col">
            <span className="font-extrabold text-lg tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white via-indigo-200 to-indigo-400">
              Agentflow_AI
            </span>
            <span className="text-[10px] text-gray-500 font-mono uppercase tracking-widest">Multi-Agent Operations</span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {user ? (
            <Link
              href="/dashboard"
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-lg shadow-indigo-600/25 transition"
            >
              Open Console <ArrowRight className="h-4 w-4" />
            </Link>
          ) : (
            <>
              <Link
                href="/login"
                className="text-xs font-semibold text-gray-300 hover:text-white px-4 py-2 rounded-xl hover:bg-gray-900 transition"
              >
                Sign In
              </Link>
              <Link
                href="/register"
                className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-lg shadow-indigo-600/25 transition"
              >
                Get Started <ChevronRight className="h-3.5 w-3.5" />
              </Link>
            </>
          )}
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative z-10 max-w-5xl mx-auto px-6 pt-16 pb-24 text-center space-y-8">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-xs font-semibold shadow-inner">
          <Sparkles className="h-3.5 w-3.5" /> Next-Generation AI Agent Orchestration Platform
        </div>

        <h1 className="text-4xl sm:text-6xl md:text-7xl font-extrabold tracking-tight text-white leading-[1.1]">
          Turn Natural Language Into{' '}
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400">
            Autonomous Workflows
          </span>
        </h1>

        <p className="text-base sm:text-xl text-gray-400 max-w-3xl mx-auto leading-relaxed">
          Describe an automation in plain English. Watch our AI architect synthesize a visual React Flow graph, and execute it through a resilient chain of 5 cooperating agents.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
          <Link
            href={user ? "/workflows/builder" : "/register"}
            className="flex items-center gap-2 px-8 py-4 rounded-2xl bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-700 hover:from-indigo-500 hover:to-purple-500 text-white text-sm font-bold shadow-xl shadow-indigo-600/30 hover:scale-[1.02] transition-all"
          >
            <Sparkles className="h-5 w-5" />
            Build with AI Prompt
          </Link>
          <Link
            href={user ? "/dashboard" : "/login"}
            className="flex items-center gap-2 px-8 py-4 rounded-2xl bg-gray-900/80 hover:bg-gray-800 text-gray-200 border border-gray-700 text-sm font-bold transition hover:border-gray-600"
          >
            <Play className="h-4 w-4 fill-current text-indigo-400" />
            Operator Console
          </Link>
        </div>

        {/* Live Canvas Preview Card */}
        <div className="pt-12">
          <div className="relative rounded-3xl p-1 bg-gradient-to-b from-indigo-500/30 via-gray-800/40 to-transparent shadow-2xl">
            <div className="bg-gray-950 rounded-[22px] border border-gray-800/80 p-6 md:p-8 space-y-6 overflow-hidden">
              <div className="flex items-center justify-between pb-4 border-b border-gray-800 text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-rose-500/80"></div>
                  <div className="w-3 h-3 rounded-full bg-amber-500/80"></div>
                  <div className="w-3 h-3 rounded-full bg-emerald-500/80"></div>
                  <span className="ml-2 font-mono text-gray-400">Agentflow Canvas • Incident_Triage_Pipeline.graph</span>
                </div>
                <span className="font-mono text-emerald-400 flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span> Live Execution Active
                </span>
              </div>

              {/* Mock Flow Nodes Showcase */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-left">
                <div className="p-4 rounded-2xl bg-gray-900 border border-amber-500/30 shadow-lg">
                  <div className="text-[10px] uppercase font-bold text-amber-400 mb-1">Trigger</div>
                  <div className="font-semibold text-sm text-white flex items-center gap-2">
                    <Zap className="h-4 w-4 text-amber-400" /> Webhook Alert
                  </div>
                  <div className="text-[11px] text-gray-400 mt-2">HTTP POST /webhook/triage</div>
                </div>

                <div className="p-4 rounded-2xl bg-gray-900 border border-indigo-500/30 shadow-lg">
                  <div className="text-[10px] uppercase font-bold text-indigo-400 mb-1">Reasoning Agent</div>
                  <div className="font-semibold text-sm text-white flex items-center gap-2">
                    <Bot className="h-4 w-4 text-indigo-400" /> AI Error Classifier
                  </div>
                  <div className="text-[11px] text-gray-400 mt-2">GPT-4 / Gemini 1.5</div>
                </div>

                <div className="p-4 rounded-2xl bg-gray-900 border border-sky-500/30 shadow-lg">
                  <div className="text-[10px] uppercase font-bold text-sky-400 mb-1">Dispatch</div>
                  <div className="font-semibold text-sm text-white flex items-center gap-2">
                    <MessageSquare className="h-4 w-4 text-sky-400" /> Slack Channel
                  </div>
                  <div className="text-[11px] text-gray-400 mt-2">Broadcast to #ops-war-room</div>
                </div>

                <div className="p-4 rounded-2xl bg-gray-900 border border-emerald-500/30 shadow-lg">
                  <div className="text-[10px] uppercase font-bold text-emerald-400 mb-1">Storage</div>
                  <div className="font-semibold text-sm text-white flex items-center gap-2">
                    <Database className="h-4 w-4 text-emerald-400" /> Google Sheets
                  </div>
                  <div className="text-[11px] text-gray-400 mt-2">Append row with audit timestamp</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5-Agent Architecture Section */}
      <section className="relative z-10 max-w-7xl mx-auto px-6 py-24 border-t border-gray-800/60">
        <div className="text-center space-y-4 max-w-2xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight">
            5 Cooperating AI Agents
          </h2>
          <p className="text-sm md:text-base text-gray-400 leading-relaxed">
            Every workflow is decomposed, validated, executed, and healed through an explicit chain of specialized agents.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {agentSteps.map((agent) => {
            const Icon = agent.icon;
            return (
              <div
                key={agent.name}
                className={`p-6 rounded-2xl bg-gradient-to-b ${agent.color} border shadow-xl backdrop-blur-xs flex flex-col justify-between`}
              >
                <div>
                  <div className="text-xs font-mono font-bold text-gray-500 mb-3">{agent.step}</div>
                  <div className="p-2.5 rounded-xl bg-gray-950/40 w-fit mb-4">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="text-sm font-bold text-white mb-2">{agent.name}</h3>
                  <p className="text-xs text-gray-400 leading-relaxed">{agent.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Third-Party Integrations Showcase */}
      <section className="relative z-10 max-w-6xl mx-auto px-6 py-20 border-t border-gray-800/60 text-center space-y-12">
        <div>
          <h2 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
            Connect Your Operational Toolchain
          </h2>
          <p className="text-xs md:text-sm text-gray-400 mt-2">
            Encrypted OAuth connections with automatic token refreshing and error recovery.
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="p-6 rounded-2xl bg-gray-900/40 border border-gray-800 flex flex-col items-center gap-3">
            <Mail className="h-8 w-8 text-rose-400" />
            <span className="text-sm font-semibold text-white">Gmail</span>
            <span className="text-[10px] text-gray-500 font-mono">Send & Read Mail</span>
          </div>

          <div className="p-6 rounded-2xl bg-gray-900/40 border border-gray-800 flex flex-col items-center gap-3">
            <MessageSquare className="h-8 w-8 text-sky-400" />
            <span className="text-sm font-semibold text-white">Slack</span>
            <span className="text-[10px] text-gray-500 font-mono">Channels & Bots</span>
          </div>

          <div className="p-6 rounded-2xl bg-gray-900/40 border border-gray-800 flex flex-col items-center gap-3">
            <DiscordIcon className="h-8 w-8 text-violet-400" />
            <span className="text-sm font-semibold text-white">Discord</span>
            <span className="text-[10px] text-gray-500 font-mono">Servers & Webhooks</span>
          </div>

          <div className="p-6 rounded-2xl bg-gray-900/40 border border-gray-800 flex flex-col items-center gap-3">
            <Database className="h-8 w-8 text-emerald-400" />
            <span className="text-sm font-semibold text-white">Google Sheets</span>
            <span className="text-[10px] text-gray-500 font-mono">Append & Read Rows</span>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 max-w-7xl mx-auto px-6 py-12 border-t border-gray-800/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-gray-500 font-mono">
        <div>Agentflow_AI • Autonomous Agent Operations Platform</div>
        <div className="flex items-center gap-6">
          <span>AES-256-GCM Encrypted</span>
          <span>BullMQ Redis Queue</span>
          <span>Socket.IO Real-Time</span>
        </div>
      </footer>
    </div>
  );
}

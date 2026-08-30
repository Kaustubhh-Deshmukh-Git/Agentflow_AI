import { useState } from 'react';
import { useRouter } from 'next/router';
import ProtectedRoute from '../../components/ProtectedRoute';
import AppShell from '../../components/AppShell';
import api from '../../services/api';
import { Sparkles, Bot, ArrowRight, Wand2, Lightbulb, Loader2 } from 'lucide-react';

export default function WorkflowBuilder() {
  const [prompt, setPrompt] = useState('');
  const [generating, setGenerating] = useState(false);
  const router = useRouter();

  const presets = [
    {
      title: 'Incident Triage Bot',
      prompt: 'When a webhook alert is triggered, analyze the error with AI, post a summary to Slack #alerts, and send an urgent email to the on-call engineer.',
    },
    {
      title: 'Lead Enrichment Pipeline',
      prompt: 'Receive new form lead via webhook, extract company metadata with AI agent, append the lead to Google Sheets, and notify Discord server.',
    },
    {
      title: 'Email Summary Digest',
      prompt: 'Read latest incoming Gmail messages, synthesize action items with AI reasoning agent, and post the morning digest to Slack.',
    },
  ];

  const handleGenerate = async (e) => {
    if (e) e.preventDefault();
    if (!prompt.trim()) return;

    setGenerating(true);
    try {
      const { data } = await api.post('/workflows/generate', { prompt });
      router.push(`/workflows/${data._id}`);
    } catch (err) {
      console.error('Generation error:', err);
      alert('Failed to generate workflow from prompt.');
    } finally {
      setGenerating(false);
    }
  };

  return (
    <ProtectedRoute>
      <AppShell>
        <div className="p-6 md:p-12 max-w-4xl mx-auto space-y-10">
          {/* Header Banner */}
          <div className="text-center space-y-4 max-w-2xl mx-auto">
            <div className="inline-flex items-center justify-center p-3 rounded-2xl bg-gradient-to-tr from-indigo-600/30 to-purple-600/30 border border-indigo-500/30 shadow-lg shadow-indigo-500/10 mb-2">
              <Sparkles className="h-8 w-8 text-indigo-300" />
            </div>
            <h1 className="text-3xl md:text-5xl font-extrabold text-white tracking-tight">
              AI Workflow Generator
            </h1>
            <p className="text-sm md:text-base text-gray-400 leading-relaxed">
              Describe your operations automation in plain English. Our LLM architect will synthesize a visual React Flow graph ready for multi-agent execution.
            </p>
          </div>

          {/* Prompt Form */}
          <form onSubmit={handleGenerate} className="space-y-4">
            <div className="relative rounded-2xl overflow-hidden border border-gray-800 bg-gray-900/80 shadow-2xl focus-within:border-indigo-500 transition-all">
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="e.g. When a webhook is received, run an AI reasoning step to classify the severity, post a message to Slack #ops-channel, and append a row to Google Sheets."
                rows={5}
                className="w-full bg-transparent px-5 py-4 text-sm md:text-base text-white placeholder-gray-500 focus:outline-hidden resize-none leading-relaxed"
                disabled={generating}
              />

              <div className="flex items-center justify-between p-3 border-t border-gray-800/80 bg-gray-950/40">
                <div className="flex items-center gap-2 text-xs text-gray-500 font-mono">
                  <Bot className="h-4 w-4 text-indigo-400" />
                  Primary: OpenRouter / Gemini AI
                </div>

                <button
                  type="submit"
                  disabled={generating || !prompt.trim()}
                  className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-700 hover:from-indigo-500 hover:to-purple-500 text-white text-xs font-semibold shadow-lg shadow-indigo-600/25 transition disabled:opacity-50"
                >
                  {generating ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Synthesizing Graph...
                    </>
                  ) : (
                    <>
                      <Wand2 className="h-4 w-4" />
                      Generate Graph
                    </>
                  )}
                </button>
              </div>
            </div>
          </form>

          {/* Prompt Presets */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-gray-400">
              <Lightbulb className="h-4 w-4 text-amber-400" />
              Quick Templates
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {presets.map((preset) => (
                <button
                  key={preset.title}
                  type="button"
                  onClick={() => setPrompt(preset.prompt)}
                  className="text-left p-4 rounded-xl bg-gray-900/60 hover:bg-gray-900 border border-gray-800/80 hover:border-indigo-500/40 transition-all hover:scale-[1.02] shadow-xs group flex flex-col justify-between"
                >
                  <div>
                    <h3 className="text-xs font-semibold text-white group-hover:text-indigo-300 transition-colors">
                      {preset.title}
                    </h3>
                    <p className="text-[11px] text-gray-400 mt-1.5 line-clamp-3 leading-relaxed">
                      {preset.prompt}
                    </p>
                  </div>
                  <span className="text-[10px] text-indigo-400 font-semibold mt-3 flex items-center gap-1">
                    Use Template <ArrowRight className="h-3 w-3" />
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </AppShell>
    </ProtectedRoute>
  );
}

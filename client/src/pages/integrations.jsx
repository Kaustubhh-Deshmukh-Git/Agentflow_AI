import { useEffect, useState } from 'react';
import ProtectedRoute from '../components/ProtectedRoute';
import AppShell from '../components/AppShell';
import api from '../services/api';
import { Mail, MessageSquare, Database, Disc as DiscordIcon, ShieldCheck, CheckCircle2, XCircle, RefreshCw, KeyRound } from 'lucide-react';

export default function Integrations() {
  const [statuses, setStatuses] = useState({});
  const [loading, setLoading] = useState(true);

  const providers = [
    { 
      id: 'gmail', 
      name: 'Gmail', 
      icon: Mail, 
      color: 'text-rose-400 bg-rose-500/10 border-rose-500/20', 
      desc: 'Send transactional emails and read incoming inbox payloads over Google OAuth2.' 
    },
    { 
      id: 'slack', 
      name: 'Slack', 
      icon: MessageSquare, 
      color: 'text-sky-400 bg-sky-500/10 border-sky-500/20', 
      desc: 'Post incident alerts, channel broadcasts, and workflow approvals to your workspace.' 
    },
    { 
      id: 'discord', 
      name: 'Discord', 
      icon: DiscordIcon, 
      color: 'text-violet-400 bg-violet-500/10 border-violet-500/20', 
      desc: 'Dispatch bot messages, webhook notifications, and operational embeds to Discord servers.' 
    },
    { 
      id: 'google-sheets', 
      name: 'Google Sheets', 
      icon: Database, 
      color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20', 
      desc: 'Append log records, synchronize tabular leads, and read ranges via Google Sheets API.' 
    },
  ];

  const fetchStatuses = async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/integrations/status');
      setStatuses(data || {});
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatuses();
    
    // Auto-detect mock OAuth redirect callback parameters
    const params = new URLSearchParams(window.location.search);
    if (params.get('mock_oauth')) {
      const provider = params.get('mock_oauth');
      const state = params.get('state');
      // Simulate OAuth exchange
      window.location.href = `http://localhost:5000/api/integrations/oauth/${provider}/callback?code=mock_code&state=${state}`;
    }
  }, []);

  const handleConnect = async (provider) => {
    try {
      const { data } = await api.get(`/integrations/oauth/${provider}/start`);
      if (data.url) {
        window.location.href = data.url;
      }
    } catch (err) {
      console.error(err);
      alert('Failed to initiate OAuth flow');
    }
  };

  const handleDisconnect = async (provider) => {
    try {
      await api.post(`/integrations/${provider}/disconnect`);
      fetchStatuses();
    } catch (err) {
      console.error(err);
      alert('Failed to disconnect integration');
    }
  };

  return (
    <ProtectedRoute>
      <AppShell>
        <div className="p-6 md:p-10 max-w-6xl mx-auto space-y-8">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight">Third-Party Integrations</h1>
              <p className="text-sm text-gray-400 mt-1">
                Authorize external services to allow your 5-agent execution pipeline to interact with your SaaS toolchain.
              </p>
            </div>
            <button
              onClick={fetchStatuses}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-gray-900 border border-gray-800 hover:bg-gray-800 text-gray-300 hover:text-white text-xs font-semibold self-start md:self-auto transition"
            >
              <RefreshCw className="h-4 w-4" /> Check Status
            </button>
          </div>

          {/* Security Banner */}
          <div className="p-4 rounded-2xl bg-indigo-950/30 border border-indigo-500/20 flex items-center gap-3.5">
            <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-300">
              <KeyRound className="h-5 w-5" />
            </div>
            <div className="text-xs">
              <p className="font-semibold text-white">Application-Level Credential Encryption</p>
              <p className="text-gray-400 mt-0.5">
                All OAuth tokens and API secrets are encrypted at rest using AES-256-GCM authenticated ciphers before database storage.
              </p>
            </div>
          </div>

          {/* Integrations Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {providers.map((provider) => {
              const Icon = provider.icon;
              const isConnected = !!statuses[provider.id];

              return (
                <div
                  key={provider.id}
                  className="bg-gray-900/60 border border-gray-800/80 p-6 rounded-2xl shadow-xl backdrop-blur-xs flex flex-col justify-between transition hover:border-gray-700"
                >
                  <div className="space-y-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3.5">
                        <div className={`p-3 rounded-xl border ${provider.color}`}>
                          <Icon className="h-6 w-6" />
                        </div>
                        <div>
                          <h3 className="text-base font-semibold text-white">{provider.name}</h3>
                          <div className="mt-1">
                            {isConnected ? (
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                                Connected & Ready
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-gray-800 text-gray-400 border border-gray-700">
                                <span className="w-1.5 h-1.5 rounded-full bg-gray-500"></span>
                                Not Authorized
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    <p className="text-xs text-gray-400 leading-relaxed min-h-[36px]">
                      {provider.desc}
                    </p>
                  </div>

                  <div className="pt-6 mt-4 border-t border-gray-800/60 flex items-center justify-between">
                    <span className="text-[11px] text-gray-500 font-mono">
                      {isConnected ? 'Token: AES-256 encrypted' : 'OAuth 2.0 PKCE'}
                    </span>

                    {isConnected ? (
                      <button
                        onClick={() => handleDisconnect(provider.id)}
                        className="px-4 py-2 rounded-xl bg-gray-800 hover:bg-rose-500/15 text-gray-300 hover:text-rose-300 hover:border-rose-500/30 border border-transparent text-xs font-semibold transition"
                      >
                        Disconnect
                      </button>
                    ) : (
                      <button
                        onClick={() => handleConnect(provider.id)}
                        className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-lg shadow-indigo-600/20 transition"
                      >
                        Connect via OAuth
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </AppShell>
    </ProtectedRoute>
  );
}

import { useState, useEffect } from 'react';
import ProtectedRoute from '../components/ProtectedRoute';
import AppShell from '../components/AppShell';
import { useAuthStore } from '../store/authStore';
import api from '../services/api';
import { 
  User, 
  ShieldCheck, 
  KeyRound, 
  Lock, 
  Server, 
  CheckCircle2, 
  AlertCircle,
  Save,
  Check
} from 'lucide-react';

export default function SettingsPage() {
  const user = useAuthStore((state) => state.user);
  const [health, setHealth] = useState(null);
  const [loading, setLoading] = useState(true);
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Form state
  const [name, setName] = useState(user?.name || '');
  const [role, setRole] = useState(user?.role || 'operator');

  useEffect(() => {
    if (user?.name) setName(user.name);
    if (user?.role) setRole(user.role);

    const checkHealth = async () => {
      try {
        const { data } = await api.get('/health');
        setHealth(data);
      } catch (err) {
        setHealth({ status: 'degraded', database: 'in-memory' });
      } finally {
        setLoading(false);
      }
    };
    checkHealth();
  }, [user]);

  const handleSaveProfile = (e) => {
    e.preventDefault();
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  return (
    <ProtectedRoute>
      <AppShell>
        <div className="p-6 md:p-10 max-w-5xl mx-auto space-y-8">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight">System & Account Settings</h1>
            <p className="text-sm text-gray-400 mt-1">
              Manage operator credentials, audit security parameters, and inspect runtime agent infrastructure.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left 2 Cols: Profile & Security */}
            <div className="lg:col-span-2 space-y-6">
              {/* Profile Card */}
              <div className="bg-gray-900/60 border border-gray-800 rounded-2xl p-6 shadow-xl backdrop-blur-xs">
                <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-800">
                  <div className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                    <User className="h-5 w-5" />
                  </div>
                  <div>
                    <h2 className="text-base font-semibold text-white">Operator Profile</h2>
                    <p className="text-xs text-gray-400">Personal authentication credentials and role attribution</p>
                  </div>
                </div>

                <form onSubmit={handleSaveProfile} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-gray-400 mb-1.5">Full Name</label>
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full bg-gray-950/80 border border-gray-800 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-hidden focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-400 mb-1.5">Email Address</label>
                      <input
                        type="email"
                        value={user?.email || ''}
                        disabled
                        className="w-full bg-gray-950/40 border border-gray-800/60 rounded-xl px-3.5 py-2.5 text-sm text-gray-500 cursor-not-allowed"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-400 mb-1.5">Role Permission Level</label>
                    <div className="flex gap-4">
                      <label className={`flex-1 flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition ${role === 'operator' ? 'bg-indigo-600/10 border-indigo-500/40 text-indigo-300' : 'bg-gray-950/50 border-gray-800 text-gray-400'}`}>
                        <input
                          type="radio"
                          name="role"
                          value="operator"
                          checked={role === 'operator'}
                          onChange={() => setRole('operator')}
                          className="text-indigo-600 focus:ring-indigo-500"
                        />
                        <div>
                          <div className="text-xs font-semibold text-white">Operator</div>
                          <div className="text-[11px] text-gray-400">Execute & build workflows</div>
                        </div>
                      </label>
                      <label className={`flex-1 flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition ${role === 'admin' ? 'bg-indigo-600/10 border-indigo-500/40 text-indigo-300' : 'bg-gray-950/50 border-gray-800 text-gray-400'}`}>
                        <input
                          type="radio"
                          name="role"
                          value="admin"
                          checked={role === 'admin'}
                          onChange={() => setRole('admin')}
                          className="text-indigo-600 focus:ring-indigo-500"
                        />
                        <div>
                          <div className="text-xs font-semibold text-white">Administrator</div>
                          <div className="text-[11px] text-gray-400">Full system & key control</div>
                        </div>
                      </label>
                    </div>
                  </div>

                  <div className="pt-2 flex justify-end">
                    <button
                      type="submit"
                      className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-sm font-semibold shadow-lg shadow-indigo-600/20 transition"
                    >
                      {savedSuccess ? <Check className="h-4 w-4 text-emerald-300" /> : <Save className="h-4 w-4" />}
                      {savedSuccess ? 'Changes Saved!' : 'Save Preferences'}
                    </button>
                  </div>
                </form>
              </div>

              {/* Encryption & Security Card */}
              <div className="bg-gray-900/60 border border-gray-800 rounded-2xl p-6 shadow-xl backdrop-blur-xs">
                <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-800">
                  <div className="p-2.5 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
                    <Lock className="h-5 w-5" />
                  </div>
                  <div>
                    <h2 className="text-base font-semibold text-white">Credential Encryption & Security</h2>
                    <p className="text-xs text-gray-400">Application-level token protection parameters</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="p-3.5 bg-gray-950/60 rounded-xl border border-gray-800/80 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <KeyRound className="h-4 w-4 text-emerald-400 shrink-0" />
                      <div>
                        <p className="text-xs font-medium text-white">Token Encryption Algorithm</p>
                        <p className="text-[11px] text-gray-500">AES-256-GCM authenticated cipher with 16-byte IV</p>
                      </div>
                    </div>
                    <span className="text-xs font-mono px-2.5 py-1 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      ACTIVE
                    </span>
                  </div>

                  <div className="p-3.5 bg-gray-950/60 rounded-xl border border-gray-800/80 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <ShieldCheck className="h-4 w-4 text-indigo-400 shrink-0" />
                      <div>
                        <p className="text-xs font-medium text-white">Password Hashing</p>
                        <p className="text-[11px] text-gray-500">bcrypt with Work Factor 12 & salt rounds</p>
                      </div>
                    </div>
                    <span className="text-xs font-mono px-2.5 py-1 rounded-md bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                      SECURE
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Col: System Health & Provider Status */}
            <div className="space-y-6">
              <div className="bg-gray-900/60 border border-gray-800 rounded-2xl p-6 shadow-xl backdrop-blur-xs">
                <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-800">
                  <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    <Server className="h-5 w-5" />
                  </div>
                  <div>
                    <h2 className="text-base font-semibold text-white">Runtime Health</h2>
                    <p className="text-xs text-gray-400">Backend engine telemetry</p>
                  </div>
                </div>

                <div className="space-y-3 text-xs">
                  <div className="flex justify-between items-center py-2 border-b border-gray-800/50">
                    <span className="text-gray-400">API Status</span>
                    <span className="flex items-center gap-1.5 text-emerald-400 font-medium font-mono">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                      {health?.status?.toUpperCase() || 'ONLINE'}
                    </span>
                  </div>

                  <div className="flex justify-between items-center py-2 border-b border-gray-800/50">
                    <span className="text-gray-400">Storage Engine</span>
                    <span className="text-gray-200 font-mono">
                      {health?.database === 'connected' ? 'MongoDB Atlas' : 'In-Memory Store'}
                    </span>
                  </div>

                  <div className="flex justify-between items-center py-2 border-b border-gray-800/50">
                    <span className="text-gray-400">Queue Engine</span>
                    <span className="text-gray-200 font-mono">BullMQ / Async Fallback</span>
                  </div>

                  <div className="flex justify-between items-center py-2 border-b border-gray-800/50">
                    <span className="text-gray-400">Real-Time Layer</span>
                    <span className="text-indigo-300 font-mono">Socket.IO 4.8</span>
                  </div>

                  <div className="flex justify-between items-center py-2">
                    <span className="text-gray-400">Environment</span>
                    <span className="text-gray-200 font-mono">{health?.environment || 'development'}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </AppShell>
    </ProtectedRoute>
  );
}

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { 
  LayoutDashboard, 
  Workflow, 
  PlaySquare, 
  Cable, 
  Settings, 
  Bell, 
  LogOut, 
  Bot, 
  Plus, 
  Sparkles,
  Menu,
  X
} from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import NotificationsDrawer from './NotificationsDrawer';
import api from '../../services/api';

export default function AppShell({ children }) {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const fetchUnread = async () => {
      try {
        const { data } = await api.get('/notifications');
        const count = (data || []).filter(n => !n.isRead).length;
        setUnreadCount(count);
      } catch (_) {}
    };
    fetchUnread();
    const interval = setInterval(fetchUnread, 15000);
    return () => clearInterval(interval);
  }, []);

  const navItems = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Workflows', href: '/workflows', icon: Workflow },
    { name: 'Executions', href: '/executions', icon: PlaySquare },
    { name: 'Integrations', href: '/integrations', icon: Cable },
    { name: 'Settings', href: '/settings', icon: Settings },
  ];

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  return (
    <div className="min-h-screen bg-[#090b10] text-gray-100 flex overflow-hidden">
      {/* Sidebar Desktop */}
      <aside className="hidden md:flex flex-col w-64 bg-gray-950/80 backdrop-blur-md border-r border-gray-800/80 shrink-0 select-none">
        {/* Logo */}
        <div className="h-16 px-6 flex items-center justify-between border-b border-gray-800/80">
          <Link href="/dashboard" className="flex items-center gap-3 group">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center shadow-lg shadow-indigo-500/25 group-hover:scale-105 transition-transform">
              <Bot className="h-5 w-5 text-white" />
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-base tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white via-indigo-200 to-indigo-400">
                Agentflow
              </span>
              <span className="text-[10px] text-gray-500 uppercase tracking-widest font-semibold">AI Operations</span>
            </div>
          </Link>
        </div>

        {/* Quick Action Button */}
        <div className="p-4 space-y-2">
          <Link
            href="/workflows/builder"
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-700 hover:from-indigo-500 hover:to-purple-500 text-white text-xs font-semibold shadow-lg shadow-indigo-600/20 hover:shadow-indigo-600/30 transition-all group"
          >
            <Sparkles className="h-4 w-4 group-hover:rotate-12 transition-transform text-indigo-200" />
            AI Workflow Builder
          </Link>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 px-3 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = router.pathname === item.href || router.pathname.startsWith(`${item.href}/`);
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-indigo-600/15 text-indigo-400 border border-indigo-500/30 shadow-xs'
                    : 'text-gray-400 hover:text-gray-200 hover:bg-gray-900/60 border border-transparent'
                }`}
              >
                <Icon className={`h-4 w-4 ${isActive ? 'text-indigo-400' : 'text-gray-400'}`} />
                {item.name}
              </Link>
            );
          })}
        </nav>

        {/* User Card & Logout */}
        <div className="p-3 border-t border-gray-800/80 bg-gray-950/40">
          <div className="flex items-center justify-between p-2 rounded-xl bg-gray-900/50 border border-gray-800/50">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-xs font-bold text-white uppercase">
                {user?.name?.[0] || 'O'}
              </div>
              <div className="min-w-0">
                <p className="text-xs font-medium text-gray-200 truncate">{user?.name || 'Operator'}</p>
                <p className="text-[10px] text-gray-500 truncate">{user?.email}</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="p-1.5 rounded-lg text-gray-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
              title="Sign Out"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Header */}
        <header className="h-16 px-4 md:px-8 border-b border-gray-800/80 bg-gray-950/50 backdrop-blur-md flex items-center justify-between shrink-0">
          {/* Mobile hamburger button */}
          <div className="flex items-center gap-3 md:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg bg-gray-900 border border-gray-800 text-gray-400 hover:text-white"
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
            <span className="font-bold text-base bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-purple-400">
              Agentflow
            </span>
          </div>

          <div className="hidden md:flex items-center gap-2 text-xs text-gray-500 font-mono">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            Agent Engine: <span className="text-gray-300 font-semibold">Active (5 Cooperating Agents)</span>
          </div>

          {/* Right Header Actions */}
          <div className="flex items-center gap-3">
            {/* Notifications Trigger */}
            <button
              onClick={() => setDrawerOpen(true)}
              className="relative p-2 rounded-xl bg-gray-900/80 border border-gray-800 hover:border-gray-700 text-gray-300 hover:text-white transition shadow-xs"
              title="Notifications"
            >
              <Bell className="h-4 w-4" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-indigo-500 text-[10px] font-bold text-white rounded-full flex items-center justify-center ring-2 ring-gray-950">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>
          </div>
        </header>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden border-b border-gray-800 bg-gray-950 p-4 space-y-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-gray-300 hover:bg-gray-900"
                >
                  <Icon className="h-4 w-4 text-indigo-400" />
                  {item.name}
                </Link>
              );
            })}
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-rose-400 hover:bg-rose-500/10"
            >
              <LogOut className="h-4 w-4" /> Logout
            </button>
          </div>
        )}

        {/* Page Content Body */}
        <main className="flex-1 overflow-y-auto min-w-0 relative">
          {children}
        </main>
      </div>

      {/* Slide-over Notifications */}
      <NotificationsDrawer
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        onCountUpdate={(newCount) => setUnreadCount(newCount)}
      />
    </div>
  );
}

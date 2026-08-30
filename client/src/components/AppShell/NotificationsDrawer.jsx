import { useState, useEffect } from 'react';
import { X, CheckCircle2, AlertTriangle, AlertCircle, Info, Bell, Check } from 'lucide-react';
import api from '../../services/api';

export default function NotificationsDrawer({ isOpen, onClose, onCountUpdate }) {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/notifications');
      setNotifications(data || []);
      const unread = (data || []).filter(n => !n.isRead).length;
      if (onCountUpdate) onCountUpdate(unread);
    } catch (err) {
      console.error('Failed to fetch notifications:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchNotifications();
    }
  }, [isOpen]);

  const markAsRead = async (id) => {
    try {
      await api.patch(`/notifications/${id}/read`);
      setNotifications(prev => prev.map(n => n._id === id ? { ...n, isRead: true } : n));
      const unread = notifications.filter(n => n._id !== id && !n.isRead).length;
      if (onCountUpdate) onCountUpdate(unread);
    } catch (err) {
      console.error(err);
    }
  };

  const markAllAsRead = async () => {
    try {
      await api.patch('/notifications/read-all');
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      if (onCountUpdate) onCountUpdate(0);
    } catch (err) {
      console.error(err);
    }
  };

  if (!isOpen) return null;

  const getIcon = (type) => {
    switch (type) {
      case 'execution_completed':
        return <CheckCircle2 className="h-5 w-5 text-emerald-400" />;
      case 'execution_failed':
      case 'integration_error':
        return <AlertCircle className="h-5 w-5 text-rose-400" />;
      case 'execution_escalated':
        return <AlertTriangle className="h-5 w-5 text-amber-400" />;
      default:
        return <Info className="h-5 w-5 text-indigo-400" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-xs transition-opacity duration-300"
        onClick={onClose}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-gray-900 border-l border-gray-800 shadow-2xl flex flex-col">
          {/* Header */}
          <div className="p-4 border-b border-gray-800 flex items-center justify-between bg-gray-950/40">
            <div className="flex items-center gap-2">
              <Bell className="h-5 w-5 text-indigo-400" />
              <h2 className="text-base font-semibold text-white">Notifications</h2>
              <span className="ml-1 text-xs px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 font-medium">
                {notifications.filter(n => !n.isRead).length} new
              </span>
            </div>
            <div className="flex items-center gap-2">
              {notifications.some(n => !n.isRead) && (
                <button
                  onClick={markAllAsRead}
                  className="text-xs text-gray-400 hover:text-white flex items-center gap-1 px-2 py-1 rounded bg-gray-800 hover:bg-gray-700 transition"
                  title="Mark all as read"
                >
                  <Check className="h-3 w-3" /> Mark all read
                </button>
              )}
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-white p-1 rounded-lg hover:bg-gray-800 transition"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {loading && notifications.length === 0 ? (
              <div className="text-center py-12 text-gray-400 text-sm">Loading alerts...</div>
            ) : notifications.length === 0 ? (
              <div className="text-center py-16 text-gray-500">
                <Bell className="h-10 w-10 mx-auto mb-3 opacity-30 text-gray-400" />
                <p className="text-sm font-medium text-gray-300">No notifications yet</p>
                <p className="text-xs text-gray-500 mt-1">Timeline events and agent recovery triggers will appear here.</p>
              </div>
            ) : (
              notifications.map((n) => (
                <div
                  key={n._id}
                  onClick={() => !n.isRead && markAsRead(n._id)}
                  className={`p-3.5 rounded-xl border transition cursor-pointer ${
                    n.isRead 
                      ? 'bg-gray-900/50 border-gray-800 text-gray-400' 
                      : 'bg-gray-800/70 border-indigo-500/30 text-white shadow-lg shadow-indigo-950/20'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5 shrink-0">{getIcon(n.type)}</div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <p className={`text-sm font-medium truncate ${!n.isRead ? 'text-indigo-200' : 'text-gray-300'}`}>
                          {n.title}
                        </p>
                        <span className="text-[10px] text-gray-500 shrink-0 font-mono">
                          {n.createdAt ? new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                        </span>
                      </div>
                      <p className="text-xs text-gray-400 mt-1 line-clamp-2 leading-relaxed">
                        {n.message}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

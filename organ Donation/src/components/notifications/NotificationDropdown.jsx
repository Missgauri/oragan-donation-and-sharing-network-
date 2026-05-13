import React, { useState, useRef, useEffect } from 'react';
import {
  Bell, CheckCircle, AlertTriangle, HeartHandshake,
  Info, Trash2, CheckCheck, X, Loader2,
} from 'lucide-react';
import { useNotifications } from '../../context/NotificationContext';

// ── Type config ──────────────────────────────────────────────────────────────

const TYPE_CONFIG = {
  match: {
    icon:       <HeartHandshake size={16} />,
    iconBg:     'bg-blue-100 text-blue-600',
    badge:      'bg-blue-100 text-blue-700',
    label:      'Donor Match',
  },
  request_accepted: {
    icon:       <CheckCircle size={16} />,
    iconBg:     'bg-emerald-100 text-emerald-600',
    badge:      'bg-emerald-100 text-emerald-700',
    label:      'Request Accepted',
  },
  emergency: {
    icon:       <AlertTriangle size={16} />,
    iconBg:     'bg-red-100 text-red-600',
    badge:      'bg-red-100 text-red-700',
    label:      'Emergency Alert',
  },
  system: {
    icon:       <Info size={16} />,
    iconBg:     'bg-slate-100 text-slate-500',
    badge:      'bg-slate-100 text-slate-600',
    label:      'System',
  },
};

const DEFAULT_CONFIG = TYPE_CONFIG.system;

// ── Helpers ──────────────────────────────────────────────────────────────────

function timeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins  = Math.floor(diff / 60_000);
  const hours = Math.floor(diff / 3_600_000);
  const days  = Math.floor(diff / 86_400_000);

  if (mins  < 1)  return 'just now';
  if (mins  < 60) return `${mins}m ago`;
  if (hours < 24) return `${hours}h ago`;
  return `${days}d ago`;
}

// ── Notification item ────────────────────────────────────────────────────────

const NotificationItem = ({ notification }) => {
  const { markAsRead, deleteNotification } = useNotifications();
  const config = TYPE_CONFIG[notification.type] ?? DEFAULT_CONFIG;

  return (
    <div
      className={`
        group flex items-start gap-3 px-4 py-3 transition-colors cursor-default
        ${notification.is_read ? 'bg-white hover:bg-slate-50' : 'bg-blue-50/60 hover:bg-blue-50'}
      `}
    >
      {/* Type icon */}
      <div className={`shrink-0 w-8 h-8 rounded-full flex items-center justify-center mt-0.5 ${config.iconBg}`}>
        {config.icon}
      </div>

      {/* Body */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${config.badge}`}>
            {config.label}
          </span>
          {!notification.is_read && (
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0" aria-label="Unread" />
          )}
        </div>
        <p className="text-sm font-medium text-slate-800 mt-0.5 leading-snug">
          {notification.title}
        </p>
        <p className="text-xs text-slate-500 mt-0.5 line-clamp-2">
          {notification.message}
        </p>
        <p className="text-[10px] text-slate-400 mt-1">
          {timeAgo(notification.created_at)}
        </p>
      </div>

      {/* Actions — visible on hover */}
      <div className="shrink-0 flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        {!notification.is_read && (
          <button
            onClick={() => markAsRead(notification.id)}
            className="p-1 rounded text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 transition-colors"
            title="Mark as read"
            aria-label="Mark as read"
          >
            <CheckCheck size={13} />
          </button>
        )}
        <button
          onClick={() => deleteNotification(notification.id)}
          className="p-1 rounded text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors"
          title="Delete"
          aria-label="Delete notification"
        >
          <Trash2 size={13} />
        </button>
      </div>
    </div>
  );
};

// ── Main dropdown ────────────────────────────────────────────────────────────

/**
 * Bell button + dropdown panel.
 * Drop this anywhere in a layout's topbar.
 */
const NotificationDropdown = () => {
  const { notifications, unreadCount, loading, markAllAsRead } = useNotifications();
  const [open, setOpen] = useState(false);
  const containerRef = useRef(null);

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    const handler = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    const handler = (e) => { if (e.key === 'Escape') setOpen(false); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [open]);

  const hasUnread = unreadCount > 0;

  return (
    <div ref={containerRef} className="relative">
      {/* Bell button */}
      <button
        onClick={() => setOpen((v) => !v)}
        className="relative p-2 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
        aria-label={`Notifications${hasUnread ? ` — ${unreadCount} unread` : ''}`}
        aria-haspopup="true"
        aria-expanded={open}
      >
        <Bell size={18} />
        {hasUnread && (
          <span
            className="absolute top-1 right-1 min-w-[16px] h-4 px-0.5 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center leading-none"
            aria-hidden="true"
          >
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown panel */}
      {open && (
        <div
          role="dialog"
          aria-label="Notifications panel"
          className="
            absolute right-0 top-full mt-2
            w-[calc(100vw-2rem)] sm:w-80 md:w-96
            max-w-sm sm:max-w-none
            bg-white rounded-2xl shadow-2xl border border-slate-100
            overflow-hidden z-50
            animate-dropdown
          "
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-semibold text-slate-800">Notifications</h2>
              {hasUnread && (
                <span className="text-[10px] font-bold bg-red-100 text-red-600 px-1.5 py-0.5 rounded-full">
                  {unreadCount} new
                </span>
              )}
            </div>
            <div className="flex items-center gap-1">
              {hasUnread && (
                <button
                  onClick={markAllAsRead}
                  className="text-xs text-blue-600 hover:text-blue-800 font-medium px-2 py-1 rounded-lg hover:bg-blue-50 transition-colors"
                  title="Mark all as read"
                >
                  Mark all read
                </button>
              )}
              <button
                onClick={() => setOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:bg-slate-100 transition-colors"
                aria-label="Close notifications"
              >
                <X size={15} />
              </button>
            </div>
          </div>

          {/* Body */}
          <div className="max-h-[60vh] sm:max-h-[420px] overflow-y-auto divide-y divide-slate-50">
            {loading ? (
              <div className="flex items-center justify-center py-12 text-slate-400 gap-2">
                <Loader2 size={18} className="animate-spin" />
                <span className="text-sm">Loading…</span>
              </div>
            ) : notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-14 text-slate-400 gap-3">
                <Bell size={32} className="opacity-30" />
                <p className="text-sm font-medium">No notifications yet</p>
                <p className="text-xs text-slate-400">You'll see alerts here when something happens.</p>
              </div>
            ) : (
              notifications.map((n) => (
                <NotificationItem key={n.id} notification={n} />
              ))
            )}
          </div>

          {/* Footer */}
          {notifications.length > 0 && (
            <div className="px-4 py-2.5 border-t border-slate-100 bg-slate-50/60">
              <p className="text-[10px] text-slate-400 text-center">
                Showing last {notifications.length} notification{notifications.length !== 1 ? 's' : ''}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default NotificationDropdown;

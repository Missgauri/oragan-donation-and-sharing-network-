import React from 'react';
import { CheckCircle, AlertTriangle, HeartHandshake, Info, X } from 'lucide-react';
import { useNotifications } from '../../context/NotificationContext';

/**
 * Maps notification type → visual config (icon + colour scheme).
 */
const TYPE_CONFIG = {
  match: {
    icon:    <HeartHandshake size={18} />,
    wrapper: 'bg-blue-600 text-white',
    bar:     'bg-blue-400',
  },
  request_accepted: {
    icon:    <CheckCircle size={18} />,
    wrapper: 'bg-emerald-600 text-white',
    bar:     'bg-emerald-400',
  },
  emergency: {
    icon:    <AlertTriangle size={18} />,
    wrapper: 'bg-red-600 text-white',
    bar:     'bg-red-400',
  },
  system: {
    icon:    <Info size={18} />,
    wrapper: 'bg-slate-700 text-white',
    bar:     'bg-slate-500',
  },
};

const DEFAULT_CONFIG = TYPE_CONFIG.system;

/**
 * Individual toast card.
 */
const Toast = ({ toast }) => {
  const { dismissToast } = useNotifications();
  const config = TYPE_CONFIG[toast.type] ?? DEFAULT_CONFIG;

  return (
    <div
      role="alert"
      aria-live="assertive"
      className={`
        relative flex items-start gap-3 w-full sm:w-80 max-w-full
        rounded-xl shadow-2xl px-4 py-3.5 overflow-hidden
        animate-slide-in
        ${config.wrapper}
      `}
    >
      {/* Progress bar */}
      <span
        className={`absolute bottom-0 left-0 h-0.5 ${config.bar} animate-shrink-bar`}
        aria-hidden="true"
      />

      {/* Icon */}
      <span className="shrink-0 mt-0.5 opacity-90">{config.icon}</span>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold leading-snug truncate">{toast.title}</p>
        <p className="text-xs opacity-80 mt-0.5 line-clamp-2">{toast.message}</p>
      </div>

      {/* Dismiss */}
      <button
        onClick={() => dismissToast(toast.toastId)}
        className="shrink-0 p-0.5 rounded opacity-70 hover:opacity-100 transition-opacity"
        aria-label="Dismiss notification"
      >
        <X size={15} />
      </button>
    </div>
  );
};

/**
 * Fixed-position container that renders all active toasts.
 * Place this once near the root of your app (already done in main.jsx).
 */
const ToastContainer = () => {
  const { toasts } = useNotifications();

  if (!toasts.length) return null;

  return (
    <div
      aria-label="Notifications"
      className="fixed top-4 right-4 left-4 sm:left-auto z-[9999] flex flex-col gap-2 pointer-events-none"
    >
      {toasts.map((toast) => (
        <div key={toast.toastId} className="pointer-events-auto">
          <Toast toast={toast} />
        </div>
      ))}
    </div>
  );
};

export default ToastContainer;

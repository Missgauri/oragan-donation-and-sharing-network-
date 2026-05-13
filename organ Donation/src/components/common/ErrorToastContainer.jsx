/**
 * ErrorToastContainer
 *
 * Renders the global error/success/warning toast queue from ErrorContext.
 * Positioned bottom-right on desktop, bottom-full-width on mobile.
 * Place <ErrorToastContainer /> once in main.jsx.
 *
 * These are for API errors and user feedback — separate from the
 * notification ToastContainer which handles realtime organ/match alerts.
 */

import React, { useEffect, useRef } from 'react';
import { XCircle, CheckCircle, AlertTriangle, Info, X } from 'lucide-react';
import { useError, TOAST_TYPES } from '../../context/ErrorContext';

const TYPE_CONFIG = {
  [TOAST_TYPES.ERROR]: {
    Icon:  XCircle,
    bg:    'bg-red-600',
    bar:   'bg-red-400',
    label: 'Error',
  },
  [TOAST_TYPES.SUCCESS]: {
    Icon:  CheckCircle,
    bg:    'bg-emerald-600',
    bar:   'bg-emerald-400',
    label: 'Success',
  },
  [TOAST_TYPES.WARNING]: {
    Icon:  AlertTriangle,
    bg:    'bg-amber-500',
    bar:   'bg-amber-300',
    label: 'Warning',
  },
  [TOAST_TYPES.INFO]: {
    Icon:  Info,
    bg:    'bg-blue-600',
    bar:   'bg-blue-400',
    label: 'Info',
  },
};

// ── Individual toast ──────────────────────────────────────────────────────────

const ErrorToast = ({ toast }) => {
  const { dismiss } = useError();
  const config = TYPE_CONFIG[toast.type] ?? TYPE_CONFIG[TOAST_TYPES.INFO];
  const { Icon } = config;

  // Animate the progress bar shrinking over the toast duration
  const barRef = useRef(null);
  useEffect(() => {
    if (!barRef.current || toast.duration <= 0) return;
    // Start at 100%, animate to 0% over duration
    barRef.current.style.transition = `width ${toast.duration}ms linear`;
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        if (barRef.current) barRef.current.style.width = '0%';
      });
    });
  }, [toast.duration]);

  return (
    <div
      role="alert"
      aria-live={toast.type === TOAST_TYPES.ERROR ? 'assertive' : 'polite'}
      className={`
        relative flex items-start gap-3
        w-full sm:w-80 max-w-full
        rounded-xl shadow-xl overflow-hidden text-white
        animate-slide-in
        ${config.bg}
      `}
    >
      {/* Progress bar */}
      {toast.duration > 0 && (
        <span
          ref={barRef}
          className={`absolute bottom-0 left-0 h-0.5 w-full ${config.bar}`}
          aria-hidden="true"
        />
      )}

      {/* Icon */}
      <div className="shrink-0 pt-3.5 pl-4">
        <Icon size={17} aria-hidden="true" />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0 py-3 pr-2">
        {toast.title && (
          <p className="text-[10px] font-bold uppercase tracking-wide opacity-75 mb-0.5">
            {toast.title}
          </p>
        )}
        <p className="text-sm font-medium leading-snug">{toast.message}</p>
        {toast.action && (
          <button
            onClick={() => { toast.action.onClick(); dismiss(toast.id); }}
            className="mt-1.5 text-xs font-semibold underline underline-offset-2 opacity-90 hover:opacity-100"
          >
            {toast.action.label}
          </button>
        )}
      </div>

      {/* Dismiss */}
      <button
        onClick={() => dismiss(toast.id)}
        className="shrink-0 p-3 opacity-70 hover:opacity-100 transition-opacity"
        aria-label="Dismiss"
      >
        <X size={14} />
      </button>
    </div>
  );
};

// ── Container ─────────────────────────────────────────────────────────────────

const ErrorToastContainer = () => {
  const { toasts } = useError();
  if (!toasts.length) return null;

  return (
    <div
      aria-label="App notifications"
      className="
        fixed bottom-4 right-4 left-4
        sm:left-auto sm:w-80
        z-[9998]
        flex flex-col gap-2
        pointer-events-none
      "
    >
      {toasts.map((toast) => (
        <div key={toast.id} className="pointer-events-auto">
          <ErrorToast toast={toast} />
        </div>
      ))}
    </div>
  );
};

export default ErrorToastContainer;

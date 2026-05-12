/**
 * ErrorToast / ErrorToastContainer
 *
 * Renders the global error toast queue from ErrorContext.
 * Separate from the notification ToastContainer — these are for
 * API errors, network failures, and validation messages.
 *
 * Positioned bottom-right on desktop, bottom-full-width on mobile.
 * Place <ErrorToastContainer /> once in main.jsx.
 */

import React, { useEffect, useRef } from 'react';
import {
  XCircle, CheckCircle, AlertTriangle, Info, X,
} from 'lucide-react';
import { useError, TOAST_TYPES } from '../../context/ErrorContext';

// ── Config per type ───────────────────────────────────────────────────────────

const TYPE_CONFIG = {
  [TOAST_TYPES.ERROR]: {
    icon:    XCircle,
    bg:      'bg-red-600',
    bar:     'bg-red-400',
    ring:    'ring-red-500/30',
    label:   'Error',
  },
  [TOAST_TYPES.SUCCESS]: {
    icon:    CheckCircle,
    bg:      'bg-emerald-600',
    bar:     'bg-emerald-400',
    ring:    'ring-emerald-500/30',
    label:   'Success',
  },
  [TOAST_TYPES.WARNING]: {
    icon:    AlertTriangle,
    bg:      'bg-amber-500',
    bar:     'bg-amber-300',
    ring:    'ring-amber-500/30',
    label:   'Warning',
  },
  [TOAST_TYPES.INFO]: {
    icon:    Info,
    bg:      'bg-blue-600',
    bar:     'bg-blue-400',
    ring:    'ring-blue-500/30',
    label:   'Info',
  },
};

// ── Individual toast ──────────────────────────────────────────────────────────

const ErrorToast = ({ toast }) => {
  const { dismiss } = useError();
  const config      = TYPE_CONFIG[toast.type] ?? TYPE_CONFIG[TOAST_TYPES.INFO];
  const Icon        = config.icon;

  // Animate progress bar
  const barRef = useRef(null);
  useEffect(() => {
    if (!barRef.current || toast.duration <= 0) return;
    barRef.current.style.transition = `width ${toast.duration}ms linear`;
    // Trigger reflow then start shrink
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
        rounded-xl shadow-xl overflow-hidden
        text-white animate-slide-in
        ring-1 ${config.ring}
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
          <p className="text-xs font-bold uppercase tracking-wide opacity-80 mb-0.5">
            {toast.title}
          </p>
        )}
        <p className="text-sm font-medium leading-snug">{toast.message}</p>

        {/* Optional action button */}
        {toast.action && (
          <button
            onClick={() => { toast.action.onClick(); dismiss(toast.id); }}
            className="mt-1.5 text-xs font-semibold underline underline-offset-2 opacity-90 hover:opacity-100 transition-opacity"
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

export const ErrorToastContainer = () => {
  const { toasts } = useError();
  if (!toasts.length) return null;

  return (
    <div
      aria-label="Error notifications"
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

export default ErrorToast;

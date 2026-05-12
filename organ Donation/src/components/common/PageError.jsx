/**
 * PageError
 *
 * Full-page error state for when a critical data fetch fails
 * and the page cannot render at all.
 *
 * @param {string}   title    - Error heading
 * @param {string}   message  - Descriptive message
 * @param {Function} onRetry  - Retry callback
 * @param {boolean}  showHome - Show "Go Home" link (default true)
 */

import React from 'react';
import { AlertTriangle, RefreshCw, Home, WifiOff } from 'lucide-react';

const VARIANTS = {
  error:   { icon: AlertTriangle, iconBg: 'bg-red-50',    iconColor: 'text-red-500'   },
  offline: { icon: WifiOff,       iconBg: 'bg-slate-100', iconColor: 'text-slate-500' },
};

const PageError = ({
  title    = 'Failed to load',
  message  = 'Something went wrong. Please try again.',
  onRetry,
  showHome = true,
  variant  = 'error',
  className = '',
}) => {
  const { icon: Icon, iconBg, iconColor } = VARIANTS[variant] ?? VARIANTS.error;

  return (
    <div className={`flex flex-col items-center justify-center py-20 px-6 text-center ${className}`}>
      <div className={`w-16 h-16 ${iconBg} rounded-2xl flex items-center justify-center mb-5`}>
        <Icon size={30} className={iconColor} aria-hidden="true" />
      </div>

      <h2 className="text-lg font-bold text-slate-800 mb-2">{title}</h2>
      <p className="text-sm text-slate-500 max-w-sm leading-relaxed mb-6">{message}</p>

      <div className="flex items-center gap-3">
        {onRetry && (
          <button
            onClick={onRetry}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-700 hover:bg-blue-800 text-white text-sm font-semibold transition-colors"
          >
            <RefreshCw size={14} aria-hidden="true" /> Try Again
          </button>
        )}
        {showHome && (
          <a
            href="/"
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-sm font-medium hover:bg-slate-50 transition-colors"
          >
            <Home size={14} aria-hidden="true" /> Go Home
          </a>
        )}
      </div>
    </div>
  );
};

export default PageError;

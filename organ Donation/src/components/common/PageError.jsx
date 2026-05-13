/**
 * PageError
 *
 * Full-page error state for when a critical data fetch fails
 * and the page cannot render meaningful content.
 *
 * @param {string}   title    - Error heading
 * @param {string}   message  - Descriptive message
 * @param {Function} onRetry  - Retry callback (optional)
 * @param {boolean}  showHome - Show "Go Home" link (default true)
 * @param {string}   variant  - 'error' | 'offline' | 'empty'
 */

import React from 'react';
import { AlertTriangle, RefreshCw, Home, WifiOff, SearchX } from 'lucide-react';

const VARIANTS = {
  error:   { Icon: AlertTriangle, iconBg: 'bg-red-50',    iconColor: 'text-red-500'    },
  offline: { Icon: WifiOff,       iconBg: 'bg-slate-100', iconColor: 'text-slate-500'  },
  empty:   { Icon: SearchX,       iconBg: 'bg-blue-50',   iconColor: 'text-blue-400'   },
};

const PageError = ({
  title    = 'Failed to load',
  message  = 'Something went wrong. Please try again.',
  onRetry,
  showHome = true,
  variant  = 'error',
  className = '',
}) => {
  const { Icon, iconBg, iconColor } = VARIANTS[variant] ?? VARIANTS.error;

  return (
    <div className={`flex flex-col items-center justify-center py-20 px-6 text-center ${className}`}>
      <div className={`w-16 h-16 ${iconBg} rounded-2xl flex items-center justify-center mb-5`}>
        <Icon size={30} className={iconColor} aria-hidden="true" />
      </div>
      <h2 className="text-lg font-bold text-slate-800 mb-2">{title}</h2>
      <p className="text-sm text-slate-500 max-w-sm leading-relaxed mb-6">{message}</p>
      <div className="flex items-center gap-3 flex-wrap justify-center">
        {onRetry && (
          <button
            onClick={onRetry}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-700 hover:bg-blue-800 text-white text-sm font-semibold transition-colors"
          >
            <RefreshCw size={14} /> Try Again
          </button>
        )}
        {showHome && (
          <a
            href="/"
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-sm font-medium hover:bg-slate-50 transition-colors"
          >
            <Home size={14} /> Go Home
          </a>
        )}
      </div>
    </div>
  );
};

export default PageError;

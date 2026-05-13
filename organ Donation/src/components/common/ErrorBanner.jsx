import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

/**
 * ErrorBanner
 *
 * Reusable error state component for dashboard pages.
 *
 * @param {string}   message  - error message to display
 * @param {Function} onRetry  - retry callback
 * @param {boolean}  inline   - compact inline variant (default false = full banner)
 */
const ErrorBanner = ({ message, onRetry, inline = false }) => {
  if (inline) {
    return (
      <div className="flex items-center gap-2 text-xs text-amber-700 bg-amber-50 border border-amber-100 rounded-xl px-3 py-2">
        <AlertTriangle size={13} className="shrink-0" aria-hidden="true" />
        <span className="flex-1">{message || 'Using demo data — database unavailable.'}</span>
        {onRetry && (
          <button
            onClick={onRetry}
            className="flex items-center gap-1 font-semibold hover:text-amber-900 transition-colors"
            aria-label="Retry"
          >
            <RefreshCw size={11} /> Retry
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="flex items-start gap-3 bg-amber-50 border border-amber-100 rounded-2xl px-5 py-4">
      <AlertTriangle size={16} className="text-amber-500 shrink-0 mt-0.5" aria-hidden="true" />
      <div className="flex-1">
        <p className="text-sm font-semibold text-amber-800">Using demo data</p>
        <p className="text-xs text-amber-700 mt-0.5">
          {message || 'Could not connect to the database. Run the SQL setup files to enable live data.'}
        </p>
      </div>
      {onRetry && (
        <button
          onClick={onRetry}
          className="flex items-center gap-1.5 text-xs font-semibold text-amber-700 hover:text-amber-900 bg-amber-100 hover:bg-amber-200 px-3 py-1.5 rounded-lg transition-colors shrink-0"
          aria-label="Retry loading data"
        >
          <RefreshCw size={12} aria-hidden="true" /> Retry
        </button>
      )}
    </div>
  );
};

export default ErrorBanner;

/**
 * ErrorBoundary
 *
 * React class component that catches unhandled render errors and
 * displays a friendly fallback UI instead of a blank screen.
 *
 * Usage:
 *   <ErrorBoundary>
 *     <MyComponent />
 *   </ErrorBoundary>
 *
 *   // With custom fallback:
 *   <ErrorBoundary fallback={<p>Something broke</p>}>
 *     <MyComponent />
 *   </ErrorBoundary>
 *
 *   // Section-level (non-fatal):
 *   <ErrorBoundary level="section">
 *     <DashboardWidget />
 *   </ErrorBoundary>
 */

import React from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
    this.handleReset = this.handleReset.bind(this);
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({ errorInfo });
    // Log to console in development
    if (import.meta.env.DEV) {
      console.error('[ErrorBoundary] Caught error:', error, errorInfo);
    }
    // In production you'd send to an error tracking service here
    // e.g. Sentry.captureException(error, { extra: errorInfo });
  }

  handleReset() {
    this.setState({ hasError: false, error: null, errorInfo: null });
  }

  render() {
    const { hasError, error } = this.state;
    const { children, fallback, level = 'page' } = this.props;

    if (!hasError) return children;

    // Custom fallback provided
    if (fallback) {
      return typeof fallback === 'function'
        ? fallback({ error, reset: this.handleReset })
        : fallback;
    }

    // Section-level — compact inline error
    if (level === 'section') {
      return (
        <div className="flex items-center gap-3 bg-red-50 border border-red-100 rounded-2xl px-5 py-4 my-4">
          <AlertTriangle size={16} className="text-red-500 shrink-0" aria-hidden="true" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-red-700">Something went wrong</p>
            <p className="text-xs text-red-600 mt-0.5 truncate">
              {error?.message || 'An unexpected error occurred in this section.'}
            </p>
          </div>
          <button
            onClick={this.handleReset}
            className="flex items-center gap-1.5 text-xs font-semibold text-red-700 bg-red-100 hover:bg-red-200 px-3 py-1.5 rounded-lg transition-colors shrink-0"
          >
            <RefreshCw size={12} /> Retry
          </button>
        </div>
      );
    }

    // Page-level — full screen fallback
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <div className="bg-white rounded-2xl shadow-lg border border-slate-100 w-full max-w-md p-8 text-center">
          {/* Icon */}
          <div className="w-16 h-16 bg-red-50 rounded-2xl flex items-center justify-center mx-auto mb-5">
            <AlertTriangle size={32} className="text-red-500" aria-hidden="true" />
          </div>

          <h1 className="text-xl font-bold text-slate-800 mb-2">
            Something went wrong
          </h1>
          <p className="text-sm text-slate-500 mb-6 leading-relaxed">
            An unexpected error occurred. This has been logged and our team will look into it.
          </p>

          {/* Error detail in dev */}
          {import.meta.env.DEV && error?.message && (
            <div className="bg-slate-50 rounded-xl px-4 py-3 mb-6 text-left">
              <p className="text-xs font-mono text-red-600 break-all">{error.message}</p>
            </div>
          )}

          <div className="flex gap-3">
            <button
              onClick={this.handleReset}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-blue-700 hover:bg-blue-800 text-white text-sm font-semibold transition-colors"
            >
              <RefreshCw size={15} /> Try Again
            </button>
            <a
              href="/"
              className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-sm font-medium hover:bg-slate-50 transition-colors"
            >
              <Home size={15} /> Go Home
            </a>
          </div>
        </div>
      </div>
    );
  }
}

export default ErrorBoundary;

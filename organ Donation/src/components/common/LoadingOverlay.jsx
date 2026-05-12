/**
 * LoadingOverlay
 *
 * Full-page semi-transparent loading overlay.
 * Use for blocking operations like form submissions.
 *
 * @param {boolean} visible  - Show/hide the overlay
 * @param {string}  message  - Loading message
 */

import React from 'react';
import { Heart } from 'lucide-react';

const LoadingOverlay = ({ visible = false, message = 'Loading…' }) => {
  if (!visible) return null;

  return (
    <div
      role="status"
      aria-label={message}
      aria-live="polite"
      className="fixed inset-0 z-[9990] flex flex-col items-center justify-center bg-white/75 backdrop-blur-sm"
    >
      <div className="flex flex-col items-center gap-4">
        {/* Pulsing heart */}
        <div className="relative">
          <div className="w-14 h-14 rounded-full bg-red-50 flex items-center justify-center">
            <Heart size={28} className="text-red-500 animate-pulse" fill="currentColor" aria-hidden="true" />
          </div>
          <span className="absolute inset-0 rounded-full border-2 border-red-200 animate-ping opacity-50" />
        </div>
        <p className="text-sm font-medium text-slate-600">{message}</p>
      </div>
    </div>
  );
};

export default LoadingOverlay;

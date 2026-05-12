import React from 'react';
import { Heart } from 'lucide-react';

const SIZES = {
  sm: { ring: 'w-5 h-5 border-2',  heart: 14 },
  md: { ring: 'w-9 h-9 border-3',  heart: 20 },
  lg: { ring: 'w-14 h-14 border-4', heart: 30 },
};

/**
 * Loader component
 *
 * @param {string}  size     - sm | md | lg
 * @param {string}  variant  - spinner | pulse | heartbeat
 * @param {string}  label    - accessible screen-reader label
 * @param {boolean} fullPage - centers in full viewport
 */
const Loader = ({
  size = 'md',
  variant = 'spinner',
  label = 'Loading...',
  fullPage = false,
  className = '',
}) => {
  const s = SIZES[size] || SIZES.md;

  const icon = variant === 'heartbeat' ? (
    <Heart
      size={s.heart}
      className="text-red-500 animate-pulse"
      fill="currentColor"
      aria-hidden="true"
    />
  ) : variant === 'pulse' ? (
    <div
      className={`${s.ring} rounded-full border-blue-200 border-t-blue-600 animate-spin`}
      aria-hidden="true"
    />
  ) : (
    <div
      className={`${s.ring} rounded-full border-slate-200 border-t-blue-600 animate-spin`}
      aria-hidden="true"
    />
  );

  const content = (
    <div
      role="status"
      aria-label={label}
      className={`flex flex-col items-center justify-center gap-3 ${className}`}
    >
      {icon}
      {label && (
        <p className="text-sm text-slate-500">{label}</p>
      )}
      <span className="sr-only">{label}</span>
    </div>
  );

  if (fullPage) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/80 backdrop-blur-sm">
        {content}
      </div>
    );
  }

  return content;
};

export default Loader;

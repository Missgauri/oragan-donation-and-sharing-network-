import React from 'react';

const VARIANTS = {
  default:  'bg-slate-100 text-slate-700',
  primary:  'bg-blue-100 text-blue-700',
  success:  'bg-green-100 text-green-700',
  warning:  'bg-yellow-100 text-yellow-700',
  danger:   'bg-red-100 text-red-700',
  critical: 'bg-red-100 text-red-700 border border-red-300',
  info:     'bg-sky-100 text-sky-700',
};

const SIZES = {
  sm: 'text-xs px-2 py-0.5',
  md: 'text-xs px-2.5 py-1',
  lg: 'text-sm px-3 py-1',
};

/**
 * Badge component
 *
 * @param {string}  variant - default | primary | success | warning | danger | critical | info
 * @param {string}  size    - sm | md | lg
 * @param {boolean} dot     - shows a colored dot before text
 * @param {boolean} pill    - fully rounded (default) vs slightly rounded
 */
const Badge = ({
  children,
  variant = 'default',
  size = 'md',
  dot = false,
  pill = true,
  className = '',
  ...props
}) => (
  <span
    className={`
      inline-flex items-center gap-1.5 font-semibold
      ${pill ? 'rounded-full' : 'rounded'}
      ${VARIANTS[variant] || VARIANTS.default}
      ${SIZES[size] || SIZES.md}
      ${className}
    `}
    {...props}
  >
    {dot && (
      <span
        aria-hidden="true"
        className={`w-1.5 h-1.5 rounded-full ${
          variant === 'success'  ? 'bg-green-500' :
          variant === 'danger' || variant === 'critical' ? 'bg-red-500' :
          variant === 'warning'  ? 'bg-yellow-500' :
          variant === 'primary'  ? 'bg-blue-500' :
          'bg-slate-400'
        }`}
      />
    )}
    {children}
  </span>
);

export default Badge;

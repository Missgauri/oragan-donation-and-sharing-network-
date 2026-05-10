import React from 'react';
import { Loader2 } from 'lucide-react';

const VARIANTS = {
  primary:   'bg-blue-700 hover:bg-blue-800 text-white shadow-sm disabled:bg-blue-300',
  secondary: 'bg-teal-600 hover:bg-teal-700 text-white shadow-sm disabled:bg-teal-300',
  danger:    'bg-red-600 hover:bg-red-700 text-white shadow-sm disabled:bg-red-300',
  outline:   'border-2 border-blue-700 text-blue-700 hover:bg-blue-50 disabled:opacity-50',
  ghost:     'text-slate-600 hover:bg-slate-100 disabled:opacity-50',
};

const SIZES = {
  sm: 'px-3 py-1.5 text-sm rounded-md gap-1.5',
  md: 'px-4 py-2 text-sm rounded-lg gap-2',
  lg: 'px-6 py-3 text-base rounded-lg gap-2',
};

/**
 * Button component
 *
 * @param {string}    variant   - primary | secondary | danger | outline | ghost
 * @param {string}    size      - sm | md | lg
 * @param {boolean}   loading   - shows spinner and disables button
 * @param {boolean}   fullWidth - stretches to full container width
 * @param {ReactNode} leftIcon  - icon before label
 * @param {ReactNode} rightIcon - icon after label
 */
const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  fullWidth = false,
  leftIcon,
  rightIcon,
  className = '',
  disabled,
  type = 'button',
  ...props
}) => {
  return (
    <button
      type={type}
      disabled={disabled || loading}
      aria-busy={loading}
      className={`
        inline-flex items-center justify-center font-medium
        transition-all duration-200 cursor-pointer
        focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
        disabled:cursor-not-allowed
        ${VARIANTS[variant] || VARIANTS.primary}
        ${SIZES[size] || SIZES.md}
        ${fullWidth ? 'w-full' : ''}
        ${className}
      `}
      {...props}
    >
      {loading ? (
        <Loader2 size={16} className="animate-spin" aria-hidden="true" />
      ) : leftIcon ? (
        <span aria-hidden="true">{leftIcon}</span>
      ) : null}
      {children}
      {!loading && rightIcon && <span aria-hidden="true">{rightIcon}</span>}
    </button>
  );
};

export default Button;

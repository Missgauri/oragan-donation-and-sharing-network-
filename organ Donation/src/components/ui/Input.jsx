import React, { forwardRef } from 'react';

/**
 * Input component
 *
 * @param {string}    label       - visible label text
 * @param {string}    error       - error message shown below input
 * @param {string}    hint        - helper text shown below input
 * @param {ReactNode} leftIcon    - icon inside left of input
 * @param {ReactNode} rightIcon   - icon inside right of input
 * @param {boolean}   required    - marks field as required
 * @param {string}    id          - links label to input (auto-generated if omitted)
 */
const Input = forwardRef(({
  label,
  error,
  hint,
  leftIcon,
  rightIcon,
  required,
  id,
  className = '',
  type = 'text',
  ...props
}, ref) => {
  const inputId = id || `input-${label?.toLowerCase().replace(/\s+/g, '-')}`;

  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label
          htmlFor={inputId}
          className="text-sm font-medium text-slate-700"
        >
          {label}
          {required && <span className="text-red-500 ml-1" aria-hidden="true">*</span>}
        </label>
      )}

      <div className="relative flex items-center">
        {leftIcon && (
          <span className="absolute left-3 text-slate-400 pointer-events-none" aria-hidden="true">
            {leftIcon}
          </span>
        )}

        <input
          ref={ref}
          id={inputId}
          type={type}
          required={required}
          aria-invalid={!!error}
          aria-describedby={error ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined}
          className={`
            w-full border rounded-lg bg-white text-slate-800 text-sm
            placeholder:text-slate-400
            transition-all duration-150
            focus:outline-none focus:ring-2 focus:ring-offset-0
            disabled:bg-slate-50 disabled:text-slate-400 disabled:cursor-not-allowed
            ${leftIcon  ? 'pl-10' : 'pl-3.5'}
            ${rightIcon ? 'pr-10' : 'pr-3.5'}
            py-2.5
            ${error
              ? 'border-red-400 focus:border-red-400 focus:ring-red-200'
              : 'border-slate-300 focus:border-blue-500 focus:ring-blue-100'
            }
            ${className}
          `}
          {...props}
        />

        {rightIcon && (
          <span className="absolute right-3 text-slate-400 pointer-events-none" aria-hidden="true">
            {rightIcon}
          </span>
        )}
      </div>

      {error && (
        <p id={`${inputId}-error`} role="alert" className="text-xs text-red-500 flex items-center gap-1">
          {error}
        </p>
      )}
      {hint && !error && (
        <p id={`${inputId}-hint`} className="text-xs text-slate-400">{hint}</p>
      )}
    </div>
  );
});

Input.displayName = 'Input';
export default Input;

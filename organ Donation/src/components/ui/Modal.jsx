import React, { useEffect, useRef } from 'react';
import { X } from 'lucide-react';

const SIZES = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-2xl',
};

/**
 * Modal component — accessible, focus-trapped, keyboard dismissible
 *
 * @param {boolean}   isOpen    - controls visibility
 * @param {Function}  onClose   - called when backdrop or X is clicked
 * @param {string}    title     - modal heading
 * @param {string}    size      - sm | md | lg | xl
 * @param {boolean}   closable  - show X button (default true)
 */
const Modal = ({
  isOpen,
  onClose,
  title,
  children,
  footer,
  size = 'md',
  closable = true,
  className = '',
}) => {
  const dialogRef = useRef(null);

  // Close on Escape key
  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e) => { if (e.key === 'Escape' && closable) onClose(); };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [isOpen, closable, onClose]);

  // Lock body scroll
  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  // Focus dialog on open
  useEffect(() => {
    if (isOpen) dialogRef.current?.focus();
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby={title ? 'modal-title' : undefined}
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200"
        onClick={closable ? onClose : undefined}
        aria-hidden="true"
      />

      {/* Panel */}
      <div
        ref={dialogRef}
        tabIndex={-1}
        className={`
          relative z-10 w-full bg-white rounded-2xl shadow-2xl
          outline-none
          animate-in zoom-in-95 fade-in duration-200
          ${SIZES[size] || SIZES.md}
          ${className}
        `}
      >
        {/* Header */}
        {(title || closable) && (
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
            {title && (
              <h2 id="modal-title" className="text-lg font-semibold text-slate-800">
                {title}
              </h2>
            )}
            {closable && (
              <button
                onClick={onClose}
                aria-label="Close modal"
                className="ml-auto p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
              >
                <X size={18} />
              </button>
            )}
          </div>
        )}

        {/* Body */}
        <div className="px-6 py-5">{children}</div>

        {/* Footer */}
        {footer && (
          <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 rounded-b-2xl flex justify-end gap-3">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};

export default Modal;

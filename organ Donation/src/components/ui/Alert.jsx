import React, { useState } from 'react';
import { CheckCircle, AlertTriangle, XCircle, Info, X } from 'lucide-react';

const VARIANTS = {
  success: {
    wrapper: 'bg-green-50 border-green-200 text-green-800',
    icon:    <CheckCircle size={18} className="text-green-500 shrink-0 mt-0.5" />,
  },
  warning: {
    wrapper: 'bg-yellow-50 border-yellow-200 text-yellow-800',
    icon:    <AlertTriangle size={18} className="text-yellow-500 shrink-0 mt-0.5" />,
  },
  danger: {
    wrapper: 'bg-red-50 border-red-200 text-red-800',
    icon:    <XCircle size={18} className="text-red-500 shrink-0 mt-0.5" />,
  },
  info: {
    wrapper: 'bg-blue-50 border-blue-200 text-blue-800',
    icon:    <Info size={18} className="text-blue-500 shrink-0 mt-0.5" />,
  },
};

/**
 * Alert component
 *
 * @param {string}    variant    - success | warning | danger | info
 * @param {string}    title      - bold heading (optional)
 * @param {boolean}   dismissible - shows X button to close
 * @param {ReactNode} action     - optional action button/link
 */
const Alert = ({
  children,
  variant = 'info',
  title,
  dismissible = false,
  action,
  className = '',
}) => {
  const [visible, setVisible] = useState(true);
  const config = VARIANTS[variant] || VARIANTS.info;

  if (!visible) return null;

  return (
    <div
      role="alert"
      className={`
        flex gap-3 border rounded-lg px-4 py-3 text-sm
        ${config.wrapper}
        ${className}
      `}
    >
      {config.icon}

      <div className="flex-1 min-w-0">
        {title && <p className="font-semibold mb-0.5">{title}</p>}
        <div className="leading-relaxed">{children}</div>
        {action && <div className="mt-2">{action}</div>}
      </div>

      {dismissible && (
        <button
          onClick={() => setVisible(false)}
          aria-label="Dismiss alert"
          className="shrink-0 p-0.5 rounded hover:bg-black/10 transition-colors"
        >
          <X size={16} />
        </button>
      )}
    </div>
  );
};

export default Alert;

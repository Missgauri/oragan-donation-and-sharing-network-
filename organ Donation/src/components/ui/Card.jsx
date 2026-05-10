import React from 'react';

/**
 * Card component — composable with Card.Header, Card.Body, Card.Footer
 *
 * @param {string}  variant  - default | glass | flat | bordered
 * @param {boolean} hoverable - adds hover lift effect
 * @param {string}  padding   - none | sm | md | lg
 */

const VARIANTS = {
  default:  'bg-white shadow-md border border-slate-100',
  glass:    'bg-white/80 backdrop-blur-md border border-white/30 shadow-lg',
  flat:     'bg-slate-50 border border-slate-200',
  bordered: 'bg-white border-2 border-blue-200',
};

const PADDING = {
  none: '',
  sm:   'p-3',
  md:   'p-5',
  lg:   'p-8',
};

const Card = ({
  children,
  variant = 'default',
  hoverable = false,
  padding = 'md',
  className = '',
  ...props
}) => (
  <div
    className={`
      rounded-xl overflow-hidden
      ${VARIANTS[variant] || VARIANTS.default}
      ${PADDING[padding]}
      ${hoverable ? 'transition-transform duration-200 hover:-translate-y-1 hover:shadow-lg cursor-pointer' : ''}
      ${className}
    `}
    {...props}
  >
    {children}
  </div>
);

Card.Header = ({ children, className = '' }) => (
  <div className={`px-5 py-4 border-b border-slate-100 ${className}`}>
    {children}
  </div>
);

Card.Body = ({ children, className = '' }) => (
  <div className={`p-5 ${className}`}>
    {children}
  </div>
);

Card.Footer = ({ children, className = '' }) => (
  <div className={`px-5 py-4 border-t border-slate-100 bg-slate-50/50 ${className}`}>
    {children}
  </div>
);

export default Card;

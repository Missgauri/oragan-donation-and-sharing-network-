import React from 'react';

/**
 * Modal
 * Generic backdrop + content wrapper.
 * Click outside (backdrop) to close.
 *
 * @param {{ onClose: Function, children: React.ReactNode }} props
 */
const Modal = ({ onClose, children }) => {
  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content glass-panel" onClick={(e) => e.stopPropagation()}>
        {children}
      </div>
    </div>
  );
};

export default Modal;

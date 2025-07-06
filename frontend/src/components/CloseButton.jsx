import React from "react";

const CloseButton = ({ onClose, ariaLabel = "Fechar modal" }) => {
  return (
    <span
      onClick={onClose}
      aria-label={ariaLabel}
      role="button"
      tabIndex="0"
      className="absolute top-4 right-4 text-2xl text-white hover:text-red-300 focus:text-red-300 cursor-pointer z-50"
      style={{ lineHeight: '0.5' }}
      onKeyDown={(e) => e.key === 'Enter' && onClose()}
    >
      ×
    </span>
  );
};

export default CloseButton;
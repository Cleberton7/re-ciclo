import React from "react";
import "../pages/styles/modal.css";
import CloseButton from "../components/CloseButton";

const Modal = ({ isOpen, onClose, children, size = "medium" }) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div 
        className={`modal-content modal-${size}`} 
        onClick={(e) => e.stopPropagation()}
      >
        <CloseButton onClose={onClose} />
        <div className="modal-inner-content">
          {children}
        </div>
      </div>
    </div>
  );
};

export default Modal;
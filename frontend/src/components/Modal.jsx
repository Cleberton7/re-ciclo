import React from "react";
import "../pages/styles/modal.css";

const Modal = ({ isOpen, onClose, children }) => {
  if (!isOpen) return null; // Se o modal não estiver aberto, não renderiza nada

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="close-btn" onClick={onClose}>X</button>
        {children}
      </div>
    </div>
  );
};

export default Modal;

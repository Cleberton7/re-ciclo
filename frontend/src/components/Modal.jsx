import React from "react";
import CloseButton from "../components/CloseButton";

const Modal = ({ isOpen, onClose, children, size = "medium" }) => {
  if (!isOpen) return null;

  // Mapeamento dos tamanhos para classes Tailwind
  const sizeClasses = {
    small: "max-w-[400px]",
    medium: "max-w-[900px]",
    large: "max-w-[1200px]",
    "form-coleta": "max-w-[600px]",
  };

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-[1000] overflow-hidden"
      onClick={onClose}
    >
      <div
        className={`relative bg-gradient-to-br from-green-600 to-green-900 rounded-xl shadow-lg max-h-[90vh] overflow-y-auto m-5 w-[calc(100%-40px)] ${sizeClasses[size] || sizeClasses.medium}`}
        style={{ 
          background: 'linear-gradient(135deg, var(--tw-gradient-from), var(--tw-gradient-to))',
          '--tw-gradient-from': '#009952',
          '--tw-gradient-to': '#004d26',
        }}onClick={(e) => e.stopPropagation()}
      >
        <CloseButton onClose={onClose} />
        <div className="p-5 max-w-full box-border">{children}</div>
      </div>
    </div>
  );
};

export default Modal;
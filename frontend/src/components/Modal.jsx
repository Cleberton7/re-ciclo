import "../pages/styles/modal.css";
import CloseButton from "../components/CloseButton";

const Modal = ({ isOpen, onClose, children }) => {
  if (!isOpen) return null; // Se o modal não estiver aberto, não renderiza nada

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <CloseButton onClose={onClose} />
        {children}
      </div>
    </div>
  );
};

export default Modal;

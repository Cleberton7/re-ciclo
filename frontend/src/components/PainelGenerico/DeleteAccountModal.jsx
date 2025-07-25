import React from 'react';
import { ClipLoader } from "react-spinners";
import './Styles/DeleteAccountModal.css'; 

const DeleteAccountModal = ({ showDeleteModal, setShowDeleteModal, handleDeleteAccount, deletingAccount }) => {
  if (!showDeleteModal) return null;

  return (
    <div className="modal-overlay">
      <div className="delete-modal">
        <h3>Confirmar Exclusão de Conta</h3>
        <p>Tem certeza que deseja excluir sua conta permanentemente? Todos os seus dados serão removidos.</p>
        
        <div className="modal-buttons">
          <button 
            onClick={handleDeleteAccount} 
            disabled={deletingAccount}
            className="confirm-delete-button"
          >
            {deletingAccount ? <ClipLoader color="#fff" size={18} /> : 'Confirmar Exclusão'}
          </button>
          <button 
            onClick={() => setShowDeleteModal(false)} 
            disabled={deletingAccount}
            className="cancel-delete-button"
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteAccountModal;
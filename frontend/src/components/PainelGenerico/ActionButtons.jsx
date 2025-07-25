import React from 'react';
import { ClipLoader } from "react-spinners";
import './Styles/ActionButtons.css';

const ActionButtons = ({ 
  editing, 
  handleEdit, 
  handleSave, 
  handleCancel, 
  saving, 
  setShowDeleteModal,
  tipoUsuario 
}) => {
  if (tipoUsuario === 'admGeral') return null;

  return (
    <div className="action-buttons">
      {!editing ? (
        <>
          <button onClick={handleEdit} className="edit-button">
            Editar Dados
          </button>
          <button 
            onClick={() => setShowDeleteModal(true)}
            className="delete-account-button"
          >
            Excluir Conta
          </button>
        </>
      ) : (
        <>
          <button onClick={handleSave} disabled={saving} className="save-button">
            {saving ? <ClipLoader color="#fff" size={18} /> : 'Salvar Alterações'}
          </button>
          <button onClick={handleCancel} disabled={saving} className="cancel-button">
            Cancelar
          </button>
        </>
      )}
    </div>
  );
};

export default ActionButtons;

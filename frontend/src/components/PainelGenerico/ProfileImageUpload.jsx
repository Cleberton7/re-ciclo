import React from 'react';
import { ClipLoader } from "react-spinners";
import './Styles/ProfileImageUpload.css'; 

const ProfileImageUpload = ({ imagePreview, editing, handleImageChange, handleRemoveImage, tipoUsuario }) => {
  return (
    <div className="image-upload">
      <div className="image-preview">
        {imagePreview ? (
          <img 
            src={imagePreview} 
            alt="Preview" 
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = '/imagem-padrao.jpg';
            }}
          />
        ) : (
          <div className="image-placeholder">
            {tipoUsuario === 'empresa' ? 'Logo da Empresa' : 'Foto de Perfil'}
          </div>
        )}
      </div>
      {editing && (
        <div className="upload-controls">
          <label htmlFor="image-upload" className="upload-button">
            {imagePreview ? 'Alterar Imagem' : 'Selecionar Imagem'}
          </label>
          <input
            id="image-upload"
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            style={{ display: 'none' }}
          />
          {imagePreview && (
            <button 
              onClick={handleRemoveImage}
              className="remove-image-button"
            >
              Remover Imagem
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default ProfileImageUpload;
import React, { useState } from 'react';
import '../pages/styles/ModalColeta.css';

const ModalColeta = ({ coleta, onClose, onSave, isEdit }) => {
  const [formData, setFormData] = useState({
    tipoMaterial: coleta?.tipoMaterial || 'eletrônicos',
    quantidade: coleta?.quantidade || '',
    endereco: coleta?.endereco || '',
    observacoes: coleta?.observacoes || '',
    imagem: null
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleFileChange = (e) => {
    setFormData({
      ...formData,
      imagem: e.target.files[0]
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <h2>{isEdit ? 'Editar Coleta' : 'Nova Solicitação'}</h2>
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Tipo de Material:</label>
            <select
              name="tipoMaterial"
              value={formData.tipoMaterial}
              onChange={handleChange}
              required
            >
              <option value="eletrônicos">Eletrônicos</option>
              <option value="metais">Metais</option>
              <option value="plásticos">Plásticos</option>
              <option value="vidro">Vidro</option>
              <option value="papel">Papel</option>
            </select>
          </div>

          <div className="form-group">
            <label>Quantidade (kg):</label>
            <input
              type="number"
              name="quantidade"
              value={formData.quantidade}
              onChange={handleChange}
              min="1"
              required
            />
          </div>

          <div className="form-group">
            <label>Endereço:</label>
            <input
              type="text"
              name="endereco"
              value={formData.endereco}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Observações:</label>
            <textarea
              name="observacoes"
              value={formData.observacoes}
              onChange={handleChange}
              rows="3"
            />
          </div>

          <div className="form-group">
            <label>Imagem (opcional):</label>
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
            />
          </div>

          <div className="form-actions">
            <button type="button" onClick={onClose}>
              Cancelar
            </button>
            <button type="submit">
              {isEdit ? 'Salvar' : 'Criar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ModalColeta;
import React from 'react';
import { IMaskInput } from 'react-imask';
import './Styles/ProfileInfoSection.css';

const ProfileInfoSection = ({ 
  tipoUsuario, 
  dados, 
  tempDados, 
  editing, 
  setTempDados 
}) => {
  return (
    <div className="dados-section">
      <h3>Informações {tipoUsuario === 'empresa' ? 'da Empresa' : tipoUsuario === 'centro' ? 'do Centro de Reciclagem' : 'Pessoais'}</h3>
      
      <div className="info-row">
        <span>Email:</span>
        <strong>{dados.email}</strong>
      </div>

      <div className="info-row">
        <span>{tipoUsuario === "empresa" || tipoUsuario === "centro" ? "CNPJ" : "CPF"}:</span>
        <strong>{dados.documento}</strong>
      </div>

      <div className="info-row">
        <span>{tipoUsuario === "empresa" ? "Razão Social" : tipoUsuario === "centro" ? "Nome Fantasia" : "Nome"}:</span>
        {editing ? (
          <input
            type="text"
            value={tempDados[tipoUsuario === "empresa" ? "razaoSocial" : tipoUsuario === "centro" ? "nomeFantasia" : "nome"] || ''}
            onChange={(e) => setTempDados(prev => ({
              ...prev,
              [tipoUsuario === "empresa" ? "razaoSocial" : tipoUsuario === "centro" ? "nomeFantasia" : "nome"]: e.target.value
            }))}
          />
        ) : (
          <strong>{dados.nomeExibido}</strong>
        )}
      </div>

      <div className="info-row">
        <span>Telefone:</span>
        {editing ? (
          <IMaskInput
            mask={[
              { mask: '(00) 0000-0000' },
              { mask: '(00) 00000-0000' }
            ]}
            name="telefone"
            value={tempDados.telefone || ''}
            onAccept={(value) => setTempDados(prev => ({ ...prev, telefone: value }))}
          />
        ) : (
          <strong>{dados.telefone || 'Não informado'}</strong>
        )}
      </div>

      {tipoUsuario === "empresa" && (
        <div className="info-row">
          <span> Esta empresa aceita resíduos da comunidade?</span>
          {editing ? (
            <input
              type="checkbox"
              id="recebeResiduoComunidade"
              name="recebeResiduoComunidade"
              checked={tempDados.recebeResiduoComunidade || false}
              onChange={(e) =>
                setTempDados({ ...tempDados, recebeResiduoComunidade: e.target.checked })
              }
            />
          ) : (
            <strong>{dados.recebeResiduoComunidade ? 'Sim' : 'Não'}</strong>
          )}
        </div>
      )}
    </div>
  );
};

export default ProfileInfoSection;
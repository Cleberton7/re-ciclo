import React from 'react';
import { IMaskInput } from 'react-imask';
import './Styles/ProfileInfoSection.css';


const TIPOS_MATERIAIS_OPTIONS = [
  'Telefonia e Acessórios',
  'Informática',
  'Eletrodoméstico',
  'Pilhas e Baterias',
  'Outros Eletroeletrônicos'
];

const ProfileInfoSection = ({ 
  tipoUsuario, 
  dados, 
  tempDados, 
  editing, 
  setTempDados,
  handleInputChange,
}) => {
  
  // Função para verificar se deve mostrar tipos de materiais
  const mostrarTiposMateriais = 
    (tipoUsuario === 'empresa' && tempDados.recebeResiduoComunidade) || 
    tipoUsuario === 'centro';

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
            name={tipoUsuario === "empresa" ? "razaoSocial" : tipoUsuario === "centro" ? "nomeFantasia" : "nome"}
            value={tempDados[tipoUsuario === "empresa" ? "razaoSocial" : tipoUsuario === "centro" ? "nomeFantasia" : "nome"] || ''}
            onChange={handleInputChange}
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
          <span>Esta empresa aceita resíduos da comunidade?</span>
          {editing ? (
            <input
              type="checkbox"
              name="recebeResiduoComunidade"
              checked={tempDados.recebeResiduoComunidade || false}
              onChange={handleInputChange}
            />
          ) : (
            <strong>{dados.recebeResiduoComunidade ? 'Sim' : 'Não'}</strong>
          )}
        </div>
      )}

      {mostrarTiposMateriais && (
        <div className="info-row tipos-materiais-row">
          <span>Tipos de materiais que recebe:</span>
          {editing ? (
            <div className="materiais-checkbox-group">
              {TIPOS_MATERIAIS_OPTIONS.map((material) => ( // ✅ Usando a constante local
                <label key={material} className="checkbox-label">
                  <input
                    type="checkbox"
                    name={`tipoMaterial-${material}`}
                    checked={tempDados.tiposMateriais?.includes(material) || false}
                    onChange={handleInputChange}
                  />
                  {material}
                </label>
              ))}
            </div>
          ) : (
            <div className="materiais-list">
              {dados.tiposMateriais && dados.tiposMateriais.length > 0 ? (
                dados.tiposMateriais.join(', ')
              ) : (
                'Nenhum material selecionado'
              )}
            </div>
          )}
        </div>
      )}

      {/* Campos específicos para centro */}
      {tipoUsuario === "centro" && (
        <>
          <div className="info-row">
            <span>Veículo:</span>
            {editing ? (
              <input
                type="text"
                name="veiculo"
                value={tempDados.veiculo || ''}
                onChange={handleInputChange}
              />
            ) : (
              <strong>{dados.veiculo || 'Não informado'}</strong>
            )}
          </div>

          <div className="info-row">
            <span>Capacidade de Coleta:</span>
            {editing ? (
              <input
                type="text"
                name="capacidadeColeta"
                value={tempDados.capacidadeColeta || ''}
                onChange={handleInputChange}
              />
            ) : (
              <strong>{dados.capacidadeColeta || 'Não informado'}</strong>
            )}
          </div>
        </>
      )}

      <div className="info-row">
        <span>Endereço:</span>
        {editing ? (
          <input
            type="text"
            name="endereco"
            value={tempDados.endereco || ''}
            onChange={handleInputChange}
          />
        ) : (
          <strong>{dados.endereco || 'Não informado'}</strong>
        )}
      </div>
    </div>
  );
};

export default ProfileInfoSection;
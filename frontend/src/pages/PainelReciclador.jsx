import React from 'react';
import './styles/painelReciclador.css';

const PainelReciclador = () => {
  return (
    <div className="dashboard-container">
      <section className="resumo-operacional">
        <h2>RESUMO OPERACIONAL</h2>
        <p>- Total de coletas hoje: <strong>3</strong></p>
        <p>- Resíduos prioritários: <strong>Eletrônicos (80%)</strong></p>
      </section>

      <section className="solicitacoes">
        <h2>SOLICITAÇÕES DISPONÍVEIS</h2>
        <div className="filtros">
          <span>Filtros:</span>
          <select>
            <option>Tipo de resíduo</option>
            <option>Eletrônicos</option>
            <option>Metais</option>
          </select>
          <select>
            <option>Distância</option>
            <option>Até 5km</option>
            <option>Até 10km</option>
          </select>
          <select>
            <option>Urgência</option>
            <option>Alta</option>
            <option>Média</option>
            <option>Baixa</option>
          </select>
        </div>

        <div className="cards">
          <div className="card">
            <h3>Empresa X</h3>
            <p>50kg de placas eletrônicas (2km)</p>
            <button>Aceitar Coleta</button>
          </div>
          {/* Adicione mais cards aqui se quiser */}
        </div>
      </section>

      <section className="rotas-agendadas">
        <h2>ROTAS AGENDADAS</h2>
        <div className="mapa-placeholder">[Mapa integrado aqui]</div>
        <div className="timeline">
          <p>🕘 Empresa A - 9h</p>
          <p>🕚 Empresa B - 11h</p>
        </div>
      </section>
    </div>
  );
};

export default PainelReciclador;

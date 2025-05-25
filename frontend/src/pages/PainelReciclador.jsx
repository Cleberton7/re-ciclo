// Atualize o PainelReciclador.js com:
import { useState, useEffect } from 'react';
import { getSolicitacoesColeta } from '../services/coletaService';
import PainelGenerico from '../pages/PainelGenerico';
import "./styles/containerPrincipal.css"
import "./styles/PainelReciclador.css"

const PainelReciclador = () => {
  const [solicitacoes, setSolicitacoes] = useState([]);
  const [filtros, setFiltros] = useState({
    tipoResiduo: '',
    distancia: '',
    urgencia: ''
  });

  useEffect(() => {
    const carregarSolicitacoes = async () => {
      try {
        const solicitacoes = await getSolicitacoesColeta(filtros);
        setSolicitacoes(solicitacoes);
      } catch (error) {
        console.error("Erro ao carregar solicitações:", error);
      }
    };
    carregarSolicitacoes();
  }, [filtros]);



  return (
    <div id="containerPrincipal">
      <PainelGenerico tipoUsuario="coletor" />

      <div className="dashboard-container">
        <section className="resumo-operacional">
          <h2>RESUMO OPERACIONAL</h2>
          <p>- Total de coletas hoje: <strong>{solicitacoes.length}</strong></p>
        </section>

        <section className="solicitacoes">
          <h2>SOLICITAÇÕES DISPONÍVEIS</h2>
          <div className="filtros">
            <select onChange={(e) => setFiltros({...filtros, tipoResiduo: e.target.value})}>
              <option value="">Todos os tipos</option>
              <option value="eletronicos">Eletrônicos</option>
              <option value="metais">Metais</option>
            </select>
          </div>

          <div className="cards">
            {solicitacoes.map((solicitacao) => (
              <div key={solicitacao.id} className="card">
                <h3>{solicitacao.empresa}</h3>
                <p>{solicitacao.material} ({solicitacao.distancia})</p>
                <button>Aceitar Coleta</button>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};
export default PainelReciclador;
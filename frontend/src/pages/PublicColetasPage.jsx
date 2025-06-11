import React, { useState, useEffect } from "react";
import { 
  getDadosPublicosColetas, 
  getRankingEmpresas,
  getEstatisticasPublicas,
  getDistribuicaoMateriais
} from "../services/publicColetasService";
import RankingEmpresas from "../components/RankingEmpresas";
import GraficoColetas from "../components/GraficoColetas";
import ColetaPublicCard from "../components/ColetaPublicCard";
import FilterBar from "../components/FilterBarPublic";
import "./styles/PublicColetasPage.css";

const PublicColetasPage = () => {
  const [coletas, setColetas] = useState([]);
  const [ranking, setRanking] = useState([]);
  const [estatisticas, setEstatisticas] = useState({
    totalColetado: 0,
    empresasAtivas: 0,
    impactoAmbiental: 0
  });
  const [distribuicao, setDistribuicao] = useState([]);
  const [filters, setFilters] = useState({
    tipoMaterial: "",
    periodo: "mensal"
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);

        
        const [coletasData, rankingData, estatisticasData, distribuicaoData] = 
          await Promise.all([
            getDadosPublicosColetas(filters).catch(e => {
              console.error('Erro em coletas:', e);
              return [];
            }),
            getRankingEmpresas(filters.periodo).catch(e => {
              console.error('Erro em ranking:', e);
              return [];
            }),
            getEstatisticasPublicas().catch(e => {
              console.error('Erro em estatísticas:', e);
              return {
                totalColetado: 0,
                empresasAtivas: 0,
                impactoAmbiental: 0
              };
            }),
            getDistribuicaoMateriais().catch(e => {
              console.error('Erro em distribuição:', e);
              return [];
            })
          ]);
        
        setColetas(coletasData);
        setRanking(rankingData);
        setEstatisticas(estatisticasData);
        setDistribuicao(distribuicaoData);
      } catch (err) {
        console.error("Erro completo:", err);
        setError(err.message || "Erro ao carregar dados");
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
  }, [filters]);


  const formatImpactoAmbiental = (kg) => {
    const toneladas = kg / 1000;
    return `${toneladas.toLocaleString('pt-BR')} toneladas de CO₂ evitadas`;
  };

  return (
    <div className="public-coletas-container">
      <header className="public-coletas-header">
        <h1>Dados Públicos de Coleta Seletiva</h1>
        <p>Visualize as coletas realizadas e o impacto ambiental positivo</p>
      </header>

      {error && (
        <div className="error-message">
          <p>{error}</p>
          <button onClick={() => window.location.reload()}>Tentar novamente</button>
        </div>
      )}

      <section className="public-filters-section">
        <FilterBar 
          filters={filters}
          onChange={setFilters}
          role="public"
        />
      </section>

      <section className="public-stats-section">
        <div className="stats-grid">
          <div className="stats-card total-coletas">
            <h3>Total Coletado</h3>
            <p>{estatisticas.totalColetado.toLocaleString('pt-BR')}</p>
            <small>kg de materiais recicláveis</small>
          </div>
          <div className="stats-card empresas-ativas">
            <h3>Empresas Participantes</h3>
            <p>{estatisticas.empresasAtivas}</p>
            <small>contribuindo com a reciclagem</small>
          </div>
          <div className="stats-card impacto-ambiental">
            <h3>Impacto Ambiental</h3>
            <p>{formatImpactoAmbiental(estatisticas.impactoAmbiental)}</p>
          </div>
        </div>
      </section>

      <section className="public-graph-section">
        <h2>Distribuição por Tipo de Material</h2>
        {loading ? (
          <div className="graph-placeholder">Carregando gráfico...</div>
        ) : distribuicao.length > 0 ? (
          <div className="background-color-grafico" >
            <GraficoColetas dados={distribuicao} />
          </div>
          
        ) : (
          <div className="nenhum-dado">Nenhum dado disponível</div>
        )}
      </section>

      <section className="public-ranking-section">
        <h2>Ranking de Empresas Mais Sustentáveis</h2>
        {loading ? (
          <div className="ranking-placeholder">Carregando ranking...</div>
        ) : ranking.length > 0 ? (
          <RankingEmpresas ranking={ranking} />
        ) : (
          <div className="nenhum-dado">Nenhum ranking disponível</div>
        )}
      </section>

      <section className="public-coletas-list">
        <h2>Últimas Coletas Registradas</h2>
        {loading ? (
          <div className="loading-message">Carregando dados de coletas...</div>
        ) : coletas.length === 0 ? (
          <div className="nenhuma-coleta">
            <p>Nenhuma coleta encontrada com os filtros selecionados</p>
          </div>
        ) : (
          <div className="coletas-public-grid">
            {coletas.map((coleta) => (
              <ColetaPublicCard
                key={coleta._id}
                coleta={coleta}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default PublicColetasPage;
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
import FilterBarPublic from "../components/FilterBarPublic";
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

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const [
          coletasData, 
          rankingData, 
          estatisticasData,
          distribuicaoData
        ] = await Promise.all([
          getDadosPublicosColetas(filters),
          getRankingEmpresas(filters.periodo),
          getEstatisticasPublicas(),
          getDistribuicaoMateriais()
        ]);
        
        setColetas(coletasData);
        setRanking(rankingData);
        setEstatisticas(estatisticasData);
        setDistribuicao(distribuicaoData);
      } catch (error) {
        console.error("Erro ao carregar dados públicos:", error);
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
  }, [filters]);

  return (
    <div className="public-coletas-container" id="containerPrincipal">
      <header className="public-coletas-header">
        <h1>Dados Públicos de Coleta Seletiva</h1>
        <p>Visualize as coletas realizadas e o impacto ambiental positivo</p>
      </header>

      <section className="public-filters-section">
        <FilterBarPublic 
          filters={filters}
          onChange={setFilters}
          disabled={loading}
        />
      </section>

      <section className="public-stats-section">
        <div className="stats-grid">
          <div className="stats-card total-coletas">
            <h3>Total Coletado</h3>
            <p>{estatisticas.totalColetado.toLocaleString()}</p>
            <small>kg de materiais recicláveis</small>
          </div>
          <div className="stats-card empresas-ativas">
            <h3>Empresas Participantes</h3>
            <p>{estatisticas.empresasAtivas}</p>
            <small>contribuindo com a reciclagem</small>
          </div>
          <div className="stats-card materiais-reciclados">
            <h3>Tipos de Materiais</h3>
            <p>{distribuicao.length}</p>
            <small>diferentes categorias</small>
          </div>
        </div>
      </section>

      <section className="public-graph-section">
        <h2>Distribuição por Tipo de Material</h2>
        {loading ? (
          <div className="graph-placeholder">Carregando gráfico...</div>
        ) : (
          <GraficoColetas dados={distribuicao} />
        )}
      </section>

      <section className="public-ranking-section">
        <h2>Ranking de Empresas Mais Sustentáveis</h2>
        {loading ? (
          <div className="ranking-placeholder">Carregando ranking...</div>
        ) : (
          <RankingEmpresas ranking={ranking} />
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
            {coletas.slice(0, 6).map((coleta) => (
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
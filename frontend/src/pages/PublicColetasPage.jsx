import React, { useState, useMemo } from "react";
import usePublicColetasData from "../hooks/usePublicColetasData";
import RankingEmpresas from "../components/RankingEmpresas";
import GraficoColetas from "../components/GraficoColetas";
import GraficoEvolucaoColetas from "../components/GraficoEvolucaoColetas";
import GraficoImpactoAmbiental from "../components/GraficoImpactoAmbiental";
import GraficoRankingEmpresas from "../components/GraficoRankingEmpresas";
import ColetaPublicCard from "../components/ColetaPublicCard";
import FilterBar from "../components/FilterBarPublic";
import "./styles/PublicColetasPage.css";

const PublicColetasPage = () => {
  const [tipoMaterial, setTipoMaterial] = useState("");
  const [periodo, setPeriodo] = useState("total");

  // Memorizar objeto filters para evitar loop infinito
  const filters = useMemo(() => ({
    tipoMaterial,
    periodo
  }), [tipoMaterial, periodo]);

  const {
    coletas,
    ranking,
    estatisticas,
    distribuicao,
    evolucao,
    loading,
    error,
  } = usePublicColetasData(filters);

  const getPeriodoTexto = (periodo) => {
    const now = new Date();
    let startDate;

    switch (periodo) {
      case "mensal":
        startDate = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
        break;
      case "trimestral":
        startDate = new Date(now.getFullYear(), now.getMonth() - 3, now.getDate());
        break;
      case "anual":
        startDate = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());
        break;
      case "total":
      default:
        return "Exibindo todos os dados disponíveis";
    }

    return `De ${startDate.toLocaleDateString("pt-BR")} até ${now.toLocaleDateString("pt-BR")}`;
  };

  const formatImpactoAmbiental = (kg) => {
    const toneladas = (Number(kg) || 0) / 1000;
    return `${toneladas.toLocaleString("pt-BR")} toneladas de CO₂ evitadas`;
  };

  return (
    <div className="public-coletas-container" id="containerPrincipal">
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
          filters={{ tipoMaterial, periodo }} 
          onChange={({ tipoMaterial, periodo }) => {
            setTipoMaterial(tipoMaterial);
            setPeriodo(periodo);
          }} 
          role="public" 
        />
        <p className="periodo-info">{getPeriodoTexto(periodo)}</p>
      </section>

      <section className="public-stats-section">
        <div className="stats-grid">
          <div className="stats-card total-coletas">
            <h3>Total Coletado</h3>
            <p>{(Number(estatisticas?.totalColetado) || 0).toLocaleString("pt-BR")}</p>
            <small>kg de materiais recicláveis</small>
          </div>
          <div className="stats-card empresas-ativas">
            <h3>Empresas Participantes</h3>
            <p>{(Number(estatisticas?.empresasAtivas) || 0).toLocaleString("pt-BR")}</p>
            <small>contribuindo com a reciclagem</small>
          </div>
          <div className="stats-card impacto-ambiental">
            <h3>Impacto Ambiental</h3>
            <p>{formatImpactoAmbiental(estatisticas?.impactoAmbiental)}</p>
          </div>
        </div>
      </section>

      <section className="public-graph-section">
        <h2>Distribuição por Tipo de Material</h2>
        {loading ? (
          <div className="graph-placeholder">Carregando gráfico...</div>
        ) : distribuicao.length > 0 ? (
          <GraficoColetas dados={distribuicao} />
        ) : (
          <div className="nenhum-dado">Nenhum dado disponível</div>
        )}
      </section>

      <section className="public-graph-section">
        <h2>Ranking de Empresas</h2>
        {loading ? (
          <div className="graph-placeholder">Carregando gráfico...</div>
        ) : ranking.length > 0 ? (
          <GraficoRankingEmpresas ranking={ranking} />
        ) : (
          <div className="nenhum-dado">Nenhum dado disponível</div>
        )}
      </section>

      <section className="public-graph-section">
        <h2>Evolução das Coletas</h2>
        {loading ? (
          <div className="graph-placeholder">Carregando gráfico...</div>
        ) : evolucao.length > 0 ? (
          <GraficoEvolucaoColetas dados={evolucao} />
        ) : (
          <div className="nenhum-dado">Nenhum dado disponível</div>
        )}
      </section>

      <section className="public-graph-section">
        <h2>Impacto Ambiental</h2>
        <GraficoImpactoAmbiental 
          impactoAtual={estatisticas?.impactoAmbiental || 0} 
          meta={10000} 
        />
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
              <ColetaPublicCard key={coleta._id} coleta={coleta} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default PublicColetasPage;

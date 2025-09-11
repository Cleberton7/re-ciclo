import { useState, useEffect } from "react";
import axios from "axios";

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const initialEstatisticas = {
  totalColetado: 0,
  empresasAtivas: 0,
  impactoAmbiental: 0,
};

export default function usePublicColetasData(filters = { tipoMaterial: "", periodo: "total" }) {
  const [coletas, setColetas] = useState([]);
  const [ranking, setRanking] = useState([]);
  const [estatisticas, setEstatisticas] = useState(initialEstatisticas);
  const [distribuicao, setDistribuicao] = useState([]);
  const [evolucao, setEvolucao] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      setError(null);

      try {
        const params = {
          tipoMaterial: filters.tipoMaterial,
          periodo: filters.periodo,
          limit: 6
        };

        const [
          coletasRes,
          rankingRes,
          estatisticasRes,
          distribuicaoRes,
          evolucaoRes,
        ] = await Promise.all([
          axios.get(`${API_BASE}/public/coletas`, { params }),
          axios.get(`${API_BASE}/public/ranking`, { params: { periodo: filters.periodo } }),
          axios.get(`${API_BASE}/public/estatisticas`),
          axios.get(`${API_BASE}/public/distribuicao`, { params: { periodo: filters.periodo } }),
          axios.get(`${API_BASE}/public/evolucao`, { params: { periodo: filters.periodo } }),
        ]);

        setColetas(coletasRes.data?.data || []);
        setRanking(rankingRes.data?.data || []);
        setEstatisticas(estatisticasRes.data?.data || initialEstatisticas);
        setDistribuicao(distribuicaoRes.data?.data || []);
        setEvolucao(evolucaoRes.data?.data || []);
      } catch (err) {
        console.error("Erro ao carregar dados públicos:", err);
        setError(err.message || "Erro ao carregar dados");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [filters]);

  return {
    coletas,
    ranking,
    estatisticas,
    distribuicao,
    evolucao,
    loading,
    error,
  };
}
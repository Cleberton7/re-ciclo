import React, { useState, useEffect } from 'react';
import { Map, AdvancedMarker } from '@vis.gl/react-google-maps';
import axios from 'axios';
import { getEmpresasPublicas, getCentrosReciclagemPublicos } from '../services/publicDataServices';
import GraficoColetas from './GraficoColetas';
import RankingEmpresas from './RankingEmpresas';
import Pin from '../components/Pin';
import "../pages/styles/content.css";

const center = { lat: -3.7657, lng: -49.6725 };

const Content = () => {
  const [marcadores, setMarcadores] = useState([]);
  const [dadosGrafico, setDadosGrafico] = useState([]);
  const [rankingEmpresas, setRankingEmpresas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        console.log("Iniciando busca de dados...");
        
        // 1. Buscar dados das APIs
        const [empresasData, centrosData, graficoRes, rankingRes] = await Promise.all([
          getEmpresasPublicas().catch(e => {
            console.error("Erro ao buscar empresas:", e);
            return [];
          }),
          getCentrosReciclagemPublicos().catch(e => {
            console.error("Erro ao buscar centros:", e);
            return [];
          }),
          axios.get(`${import.meta.env.VITE_API_URL}/public/coletas`).catch(e => {
            console.error("Erro ao buscar dados do gráfico:", e);
            return { data: { data: [] } };
          }),
          axios.get(`${import.meta.env.VITE_API_URL}/public/ranking`).catch(e => {
            console.error("Erro ao buscar ranking:", e);
            return { data: { data: [] } };
          })
        ]);

        console.log("Dados recebidos:", {
          empresas: empresasData,
          centros: centrosData
        });

        // 2. Processar os marcadores
        const processarMarcadores = (itens, tipo) => {
          if (!Array.isArray(itens)) {
            console.warn(`Dados de ${tipo} não são um array:`, itens);
            return [];
          }

          return itens
            .map(item => {
              try {
                // Verificar se o item tem a estrutura mínima necessária
                if (!item || typeof item !== 'object') {
                  console.warn(`Item inválido do tipo ${tipo}:`, item);
                  return null;
                }

                // Verificar localização
                if (!item.localizacao || typeof item.localizacao !== 'object') {
                  console.warn(`Item do tipo ${tipo} sem localização:`, item);
                  return null;
                }

                const lat = parseFloat(item.localizacao.lat);
                const lng = parseFloat(item.localizacao.lng);

                if (isNaN(lat) || isNaN(lng)) {
                  console.warn(`Coordenadas inválidas para ${tipo} ${item._id}:`, item.localizacao);
                  return null;
                }

                // Verificar se as coordenadas estão dentro de limites razoáveis para o Brasil
                if (lat < -33 || lat > 5 || lng < -74 || lng > -34) {
                  console.warn(`Coordenadas fora do Brasil para ${tipo} ${item._id}:`, lat, lng);
                  return null;
                }

                return {
                  position: { lat, lng },
                  tipo,
                  nome: tipo === 'empresa' 
                    ? item.nomeFantasia || item.razaoSocial || "Empresa"
                    : item.nomeFantasia || item.nome || "Centro de Reciclagem",
                  endereco: item.endereco || "Endereço não informado",
                  telefone: formatarTelefone(item.telefone),
                  email: item.email || "Não informado",
                  cnpj: formatarCNPJ(item.cnpj),
                  id: `${tipo}-${item._id || Math.random().toString(36).substr(2, 9)}`
                };
              } catch (error) {
                console.error(`Erro ao processar item do tipo ${tipo}:`, error, item);
                return null;
              }
            })
            .filter(Boolean);
        };

        // Funções auxiliares de formatação
        const formatarTelefone = (telefone) => {
          if (!telefone) return "Não informado";
          const cleaned = telefone.replace(/\D/g, '');
          if (cleaned.length === 11) {
            return cleaned.replace(/^(\d{2})(\d{5})(\d{4})$/, "($1) $2-$3");
          }
          if (cleaned.length === 10) {
            return cleaned.replace(/^(\d{2})(\d{4})(\d{4})$/, "($1) $2-$3");
          }
          return telefone;
        };

        const formatarCNPJ = (cnpj) => {
          if (!cnpj) return "Não informado";
          return cnpj.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, "$1.$2.$3/$4-$5");
        };

        // Processar todos os marcadores
        const marcadoresEmpresas = processarMarcadores(empresasData, 'empresa');
        const marcadoresCentros = processarMarcadores(centrosData, 'centro');
        const todosMarcadores = [...marcadoresEmpresas, ...marcadoresCentros];

        console.log("Marcadores processados:", todosMarcadores);
        console.log(`Total de marcadores válidos: ${todosMarcadores.length}`);

        setMarcadores(todosMarcadores);
        setDadosGrafico(graficoRes.data?.data || []);
        setRankingEmpresas(rankingRes.data?.data || []);
        setError(null);

      } catch (err) {
        console.error("Erro ao carregar dados:", err);
        setError("Erro ao carregar dados. Tente recarregar a página.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <div className='content' id="containerPrincipal">
      {/* Seção Esquerda (Gráfico e Ranking) */}
      <div className='left-section'>
        <div className='containerRanked'>
          <div className='section-title'>Ranking das empresas</div>
          <div className='ranking-wrapper'>
            {error ? (
              <div className="error-message">{error}</div>
            ) : loading ? (
              <div className="loading-message">Carregando ranking...</div>
            ) : (
              <RankingEmpresas
                ranking={rankingEmpresas}
                compactMode={true}
                hideTitle={true}
              />
            )}
          </div>
        </div>

        <div className='containerGraphic'>
          <div className='section-title'>Distribuição por Material</div>
          <div className='grafico-wrapper'>
            {error ? (
              <div className="error-message">{error}</div>
            ) : loading ? (
              <div className="loading-message">Carregando gráfico...</div>
            ) : dadosGrafico.length > 0 ? (
              <GraficoColetas
                dados={dadosGrafico}
                compactMode={true}
              />
            ) : (
              <div className="no-data-message">
                Nenhum dado disponível para exibir
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mapa (Seção Direita) */}
      <div className='containerMaps'>
        <div className='section-title'>Localização das Empresas e Centros</div>
        <div className='map-wrapper'>
          {error ? (
            <div className="error-message">{error}</div>
          ) : loading ? (
            <div className="loading-message">Carregando mapa...</div>
          ) : marcadores.length === 0 ? (
            <div className="no-data-message">
              Nenhuma localização disponível para exibir
            </div>
          ) : (
            <Map
              className="mapa"
              defaultCenter={center}
              defaultZoom={12}
              mapId={import.meta.env.VITE_GOOGLE_MAPS_MAP_ID}
              gestureHandling={'greedy'}
            >
              {marcadores.map((marcador) => (
                <AdvancedMarker 
                  key={marcador.id} 
                  position={marcador.position}
                >
                  <Pin
                    tipo={marcador.tipo}
                    nome={marcador.nome}
                    endereco={marcador.endereco}
                    telefone={marcador.telefone}
                    email={marcador.email}
                    cnpj={marcador.cnpj}
                  />
                </AdvancedMarker>
              ))}
            </Map>
          )}
        </div>
      </div>
    </div>
  );
};

export default Content;
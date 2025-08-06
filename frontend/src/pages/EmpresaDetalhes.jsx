import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { FaEnvelope, FaPhone, FaMapMarkerAlt, FaIdCard } from 'react-icons/fa';
import { Map, AdvancedMarker, useMap } from '@vis.gl/react-google-maps';
import Pin from '../components/Pin';
import { getEmpresaPublicaPorId } from '../services/publicDataServices';
import { BASE_URL } from '../config/config';
import VoltarLink from '../components/VoltarLink';
import './styles/empresaDetalhes.css';
import './styles/containerPrincipal.css';

const EmpresaDetalhes = () => {
  const { id } = useParams();
  const [empresa, setEmpresa] = useState(null);
  const [error, setError] = useState(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [mapError, setMapError] = useState(null);

  // Debug: Verifica se as variáveis de ambiente estão carregadas
  console.debug('[DEBUG] Variáveis de ambiente:', {
    apiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY ? '***' : 'NÃO ENCONTRADA',
    mapId: import.meta.env.VITE_GOOGLE_MAPS_MAP_ID || 'NÃO DEFINIDA'
  });

useEffect(() => {
  let isMounted = true;

  const fetchEmpresa = async () => {
    try {
      const data = await getEmpresaPublicaPorId(id);
      
      console.log('Dados completos:', data); // Debug adicional

      if (!isMounted) return;

      // Acesse as coordenadas corretamente (dentro de localizacao)
      const latitude = data.localizacao?.lat;
      const longitude = data.localizacao?.lng;

      console.log('Coordenadas extraídas:', { latitude, longitude }); // Debug

      const coordsValidas = (
        latitude !== undefined && 
        longitude !== undefined &&
        !isNaN(parseFloat(latitude)) && 
        !isNaN(parseFloat(longitude))
      );

      if (!coordsValidas) {
        console.warn('Coordenadas ausentes ou inválidas');
      }

      setEmpresa({
        ...data,
        latitude: coordsValidas ? parseFloat(latitude) : null,
        longitude: coordsValidas ? parseFloat(longitude) : null
      });

    } catch (err) {
      console.error("Erro detalhado:", err);
      if (isMounted) setError('Empresa não encontrada');
    }
  };

  fetchEmpresa();

  return () => { isMounted = false };
}, [id]);

  if (error) return <p className="empresa-erro">{error}</p>;
  if (!empresa) return <p className="empresa-carregando">Carregando...</p>;

  // Debug: Verifica os dados antes da renderização
  console.debug('[DEBUG] Dados para renderização:', {
    nome: empresa.nomeFantasia,
    coordenadas: {
      lat: empresa.latitude,
      lng: empresa.longitude,
      parsed: {
        lat: parseFloat(empresa.latitude),
        lng: parseFloat(empresa.longitude)
      }
    },
    temCoordenadas: empresa.latitude && empresa.longitude
  });

  const imagemUrl = empresa.imagemPerfil 
    ? `${BASE_URL}/uploads/${empresa.imagemPerfil}` 
    : null;

  const formatarCNPJ = (cnpj) =>
    cnpj?.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, "$1.$2.$3/$4-$5");

  const formatarTelefone = (telefone) => {
    const cleaned = telefone?.replace(/\D/g, '');
    if (!cleaned) return "Não informado";
    if (cleaned.length === 11) return cleaned.replace(/^(\d{2})(\d{5})(\d{4})$/, "($1) $2-$3");
    if (cleaned.length === 10) return cleaned.replace(/^(\d{2})(\d{4})(\d{4})$/, "($1) $2-$3");
    return telefone;
  };

  const MapDebugger = () => {
    const map = useMap();
    
    useEffect(() => {
      if (map) {
        console.debug('[DEBUG] Instância do mapa criada:', map);
        setMapLoaded(true);
      }
    }, [map]);

    return null;
  };

  return (
    <div className="empresa-detalhes-container" id="containerPrincipal">
      <VoltarLink to="/empresas">Voltar para Empresas</VoltarLink>

      <div className="empresa-card-detalhado">
        {imagemUrl && (
          <div
            className="empresa-imagem"
            style={{ backgroundImage: `url(${imagemUrl})` }}
          />
        )}
        <div className="empresa-info">
          <h2>{empresa.nomeFantasia || empresa.razaoSocial}</h2>
          <p><FaEnvelope /> {empresa.email || 'Não informado'}</p>
          <p><FaPhone /> {formatarTelefone(empresa.telefone)}</p>
          <p><FaMapMarkerAlt /> {empresa.endereco || 'Endereço não informado'}</p>
          <p><FaIdCard /> {empresa.cnpj ? formatarCNPJ(empresa.cnpj) : 'CNPJ não informado'}</p>
          
          {empresa.aceitaResiduos && (
            <p className="empresa-recebe"><strong>✔️ Recebe resíduos da comunidade</strong></p>
          )}

          {empresa.latitude && empresa.longitude && (
            <div className="mapa-empresa-detalhes">
              {!mapLoaded && !mapError && (
                <p className="mapa-carregando">Carregando mapa...</p>
              )}
              {mapError && (
                <p className="mapa-erro">Erro ao carregar o mapa: {mapError}</p>
              )}
              
              <Map
                defaultCenter={{
                  lat: parseFloat(empresa.latitude),
                  lng: parseFloat(empresa.longitude),
                }}
                defaultZoom={18}
                mapId={import.meta.env.VITE_GOOGLE_MAPS_MAP_ID}
            
                gestureHandling="greedy"
                onLoad={() => console.debug('[DEBUG] Mapa carregado com sucesso')}
                onError={(err) => {
                  console.error('[ERRO] No carregamento do mapa:', err);
                  setMapError(err.message);
                }}
              >
                <MapDebugger />
                <AdvancedMarker
                  position={{
                    lat: parseFloat(empresa.latitude),
                    lng: parseFloat(empresa.longitude),
                  }}
                >
                  <Pin
                    nome={empresa.nomeFantasia}
                    tipo="empresa"
                    telefone={empresa.telefone}
                    email={empresa.email}
                    endereco={empresa.endereco}
                    recebeResiduoComunidade={empresa.aceitaResiduos}
                  />
                </AdvancedMarker>
              </Map>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EmpresaDetalhes;
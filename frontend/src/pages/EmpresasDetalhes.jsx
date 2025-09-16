import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { FaEnvelope, FaPhone, FaMapMarkerAlt, FaIdCard, FaRecycle } from 'react-icons/fa';
import { Map, AdvancedMarker, useMap } from '@vis.gl/react-google-maps';
import Pin from '../components/Pin';
import VoltarLink from '../components/VoltarLink';
import { BASE_URL } from '../config/config';
import { getEmpresaPublicaPorId, getCentroPublicoPorId } from '../services/publicDataServices';
import './styles/empresaDetalhes.css';
import './styles/containerPrincipal.css';

const EmpresasDetalhes = ({ tipo }) => {
  const { id } = useParams();
  const [item, setItem] = useState(null);
  const [error, setError] = useState(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [mapError, setMapError] = useState(null);

  useEffect(() => {
    let isMounted = true;

    const fetchData = async () => {
      try {
        const data = tipo === 'empresa' 
          ? await getEmpresaPublicaPorId(id) 
          : await getCentroPublicoPorId(id);

        if (!isMounted) return;

        const latitude = data.localizacao?.lat;
        const longitude = data.localizacao?.lng;
        const coordsValidas = latitude !== undefined && longitude !== undefined && !isNaN(parseFloat(latitude)) && !isNaN(parseFloat(longitude));

        setItem({
          ...data,
          latitude: coordsValidas ? parseFloat(latitude) : null,
          longitude: coordsValidas ? parseFloat(longitude) : null,
          tiposMateriais: data.tiposMateriais || [] // ✅ Garantir array vazio
        });

      } catch (err) {
        if (isMounted) setError(`${tipo === 'empresa' ? 'Empresa' : 'Centro'} não encontrado`);
      }
    };

    fetchData();
    return () => { isMounted = false };
  }, [id, tipo]);

  if (error) return <p className="empresa-erro">{error}</p>;
  if (!item) return <p className="empresa-carregando">Carregando...</p>;

  const imagemUrl = item.imagemPerfil ? `${BASE_URL}/uploads/${item.imagemPerfil}` : null;

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
    useEffect(() => { if (map) setMapLoaded(true); }, [map]);
    return null;
  };

  // Verificar se deve mostrar tipos de materiais
  const mostrarTiposMateriais = 
    (tipo === 'empresa' && item.recebeResiduoComunidade) || 
    tipo === 'centro';

  return (
    <div className="empresa-detalhes-container" id="containerPrincipal">
      <VoltarLink to={tipo === 'empresa' ? "/empresas" : "/centros"}>Voltar</VoltarLink>

      <div className="empresa-card-detalhado">
        {imagemUrl && (
          <div 
            className="empresa-imagem" 
            style={{ 
              backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.6), rgba(0, 0, 0, 0.7)), url(${imagemUrl})` 
            }} 
          />
        )}
        
        <div className="empresa-info">
          <h2>{item.nomeFantasia || item.nome || item.razaoSocial}</h2>
          
          <div className="empresa-info-item">
            <FaEnvelope className="empresa-info-icon" />
            <span>{item.email || 'Não informado'}</span>
          </div>

          <div className="empresa-info-item">
            <FaPhone className="empresa-info-icon" />
            <span>{formatarTelefone(item.telefone)}</span>
          </div>

          <div className="empresa-info-item">
            <FaMapMarkerAlt className="empresa-info-icon" />
            <span>{item.endereco || 'Endereço não informado'}</span>
          </div>

          <div className="empresa-info-item">
            <FaIdCard className="empresa-info-icon" />
            <span>{item.cnpj ? formatarCNPJ(item.cnpj) : 'CNPJ não informado'}</span>
          </div>

          {tipo === 'empresa' && (
            <div className="empresa-info-item">
              <FaRecycle className="empresa-info-icon" />
              <span>
                <strong>Recebe resíduos da comunidade:</strong> 
                {item.recebeResiduoComunidade ? ' Sim' : ' Não'}
              </span>
            </div>
          )}

          {/* ✅ Seção de Tipos de Materiais */}
          {mostrarTiposMateriais && item.tiposMateriais && item.tiposMateriais.length > 0 && (
            <div className="empresa-materiais-section">
              <div className="empresa-materiais-header">
                <FaRecycle className="empresa-materiais-icon" />
                <h3>Materiais Aceitos</h3>
              </div>
              <div className="empresa-materiais-list">
                {item.tiposMateriais.map((material, index) => (
                  <div key={index} className="empresa-material-item">
                    <span className="empresa-material-bullet">•</span>
                    <span className="empresa-material-text">{material}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {mostrarTiposMateriais && (!item.tiposMateriais || item.tiposMateriais.length === 0) && (
            <div className="empresa-materiais-section">
              <div className="empresa-materiais-header">
                <FaRecycle className="empresa-materiais-icon" />
                <h3>Materiais Aceitos</h3>
              </div>
              <p className="empresa-sem-materiais">Nenhum material específico informado</p>
            </div>
          )}

          {item.latitude && item.longitude && (
            <div className="mapa-empresa-detalhes">
              <h3>Localização</h3>
              {!mapLoaded && !mapError && <p className="mapa-carregando">Carregando mapa...</p>}
              {mapError && <p className="mapa-erro">Erro ao carregar o mapa: {mapError}</p>}
              <Map
                defaultCenter={{ lat: item.latitude, lng: item.longitude }}
                defaultZoom={18}
                mapId={import.meta.env.VITE_GOOGLE_MAPS_MAP_ID}
                gestureHandling="greedy"
                onLoad={() => console.debug('Mapa carregado')}
                onError={(err) => setMapError(err.message)}
              >
                <MapDebugger />
                <AdvancedMarker position={{ lat: item.latitude, lng: item.longitude }}>
                  <Pin
                    nome={item.nomeFantasia || item.nome || item.razaoSocial}
                    tipo={tipo}
                    telefone={item.telefone}
                    email={item.email}
                    endereco={item.endereco}
                    recebeResiduoComunidade={tipo === 'empresa' ? item.recebeResiduoComunidade : false}
                    tiposMateriais={item.tiposMateriais} 
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

export default EmpresasDetalhes;
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { FaEnvelope, FaPhone, FaMapMarkerAlt, FaIdCard } from 'react-icons/fa';
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
          longitude: coordsValidas ? parseFloat(longitude) : null
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

  return (
    <div className="empresa-detalhes-container" id="containerPrincipal">
      <VoltarLink to={tipo === 'empresa' ? "/empresas" : "/centros"}>Voltar</VoltarLink>

      <div className="empresa-card-detalhado">
        {imagemUrl && <div className="empresa-imagem" style={{ backgroundImage: `url(${imagemUrl})` }} />}
        <div className="empresa-info">
          <h2>{item.nomeFantasia || item.nome || item.razaoSocial}</h2>
          <p><FaEnvelope /> {item.email || 'Não informado'}</p>
          <p><FaPhone /> {formatarTelefone(item.telefone)}</p>
          <p><FaMapMarkerAlt /> {item.endereco || 'Endereço não informado'}</p>
          <p><FaIdCard /> {item.cnpj ? formatarCNPJ(item.cnpj) : 'CNPJ não informado'}</p>

          {tipo === 'empresa' && item.aceitaResiduos && (
            <p className="empresa-recebe"><strong>✔️ Recebe resíduos da comunidade</strong></p>
          )}

          {item.latitude && item.longitude && (
            <div className="mapa-empresa-detalhes">
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
                    recebeResiduoComunidade={tipo === 'empresa' ? item.aceitaResiduos : false}
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

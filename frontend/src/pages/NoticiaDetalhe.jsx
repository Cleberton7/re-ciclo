import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { buscarNoticiaPorSlug } from '../services/noticiaService';
import { BASE_URL } from '../config/config.js';
import VoltarLink from '../components/VoltarLink';
import "./styles/containerPrincipal.css";
import "./styles/noticiaDetalhe.css";
import ImagemPadrão from '../image/ErrroSite.png';

const NoticiaDetalhe = () => {
  const { slug } = useParams();
  const [noticia, setNoticia] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const buscarNoticia = async () => {
      setLoading(true);
      setError('');
      try {
        const noticiaEncontrada = await buscarNoticiaPorSlug(slug);
        
        if (noticiaEncontrada) {
          const noticiaFormatada = {
            ...noticiaEncontrada,
            image: noticiaEncontrada.image 
              ? noticiaEncontrada.image.startsWith('http') 
                ? noticiaEncontrada.image 
                : `${BASE_URL}${noticiaEncontrada.image}`
              : null
          };
          setNoticia(noticiaFormatada);
        } else {
          setError('Notícia não encontrada.');
        }
      } catch (err) {
        console.error(err);
        setError('Erro ao carregar a notícia.');
      } finally {
        setLoading(false);
      }
    };

    buscarNoticia();
  }, [slug]);

  if (loading) return (
    <div className="noticia-detalhe-container" id='containerPrincipal'>
      <div className="loading-message">Carregando notícia...</div>
    </div>
  );

  if (error) return (
    <div className="noticia-detalhe-container" id='containerPrincipal'>
      <div className="error-message">{error}</div>
      <Link to="/noticiasEventos" className="back-link">← Voltar para Notícias</Link>
    </div>
  );

  return (
    <div className="noticia-detalhe-container" id='containerPrincipal'>
      <VoltarLink to="/noticiasEventos">Voltar para Notícias</VoltarLink>

      {noticia && (
        <>
          <h1>{noticia.title}</h1>
          <div className="imagem-noticia-detalhe">
            <img 
              src={noticia.image || {ImagemPadrão}} 
              alt={noticia.title}
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = {ImagemPadrão};
              }}
            />
          </div>
          <p>{noticia.content}</p>

          {noticia.tags && noticia.tags.length > 0 && (
            <p className="tags">
              <strong>Tags:</strong> {noticia.tags.join(', ')}
            </p>
          )}
        </>
      )}
    </div>
  );
};

export default NoticiaDetalhe;

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { listarNoticias } from '../services/noticiaService';
import { BASE_URL } from '../config/config.js';
import "./styles/containerPrincipal.css";
import "./styles/eventosNoticias.css";

const NoticiasEventos = () => {
  const [noticias, setNoticias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const carregarNoticias = async () => {
      try {
        const data = await listarNoticias();
        const noticiasFormatadas = data.map(noticia => ({
          ...noticia,
          image: noticia.image 
            ? noticia.image.startsWith('http') 
              ? noticia.image 
              : `${BASE_URL}${noticia.image}`
            : null,
          slug: noticia.slug || noticia._id
        }));
        setNoticias(noticiasFormatadas);
      } catch (err) {
        console.error('Erro ao carregar notícias:', err);
        setError('Erro ao carregar notícias. Tente recarregar a página.');
      } finally {
        setLoading(false);
      }
    };

    carregarNoticias();
  }, []);

  return (
    <div className="noticias-container" id='containerPrincipal'>
      <h1 className="noticias-title">Eventos e Notícias</h1>

      <div className="noticias-list">
        {loading && (
          <div className="noticias-loading">Carregando notícias...</div>
        )}

        {error && (
          <div className="noticias-error">{error}</div>
        )}

        {!loading && noticias.length === 0 && (
          <div className="noticias-empty">Nenhuma notícia disponível no momento.</div>
        )}

        {!loading && noticias.map(noticia => (
          <article key={noticia._id} className="noticias-item">
            <Link to={`/noticia/${noticia.slug}`} className="noticias-link">
              <div className="noticias-image-container">
                <img 
                  src={noticia.image || '/imagem-padrao.jpg'}
                  alt={noticia.title}
                  className="noticias-image"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = '/imagem-padrao.jpg';
                  }}
                />
              </div>
              <h2 className="noticias-item-title">{noticia.title}</h2>
              <p className="noticias-item-content">{noticia.content.substring(0, 150)}...</p>
            </Link>
            {noticia.tags && noticia.tags.length > 0 && (
              <p className="noticias-tags">
                <strong>Tags:</strong> {noticia.tags.join(', ')}
              </p>
            )}
          </article>
        ))}
      </div>
    </div>
  );
};

export default NoticiasEventos;

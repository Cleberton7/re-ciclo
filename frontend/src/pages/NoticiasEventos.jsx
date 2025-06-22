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
    <div className="noticias-publicas-container" id='containerPrincipal'>
      <h1>Eventos e Notícias</h1>

      <div className="lista-noticias">
        {loading && (
          <div className="loading-message">Carregando notícias...</div>
        )}

        {error && (
          <div className="error-message">{error}</div>
        )}

        {!loading && noticias.length === 0 && (
          <div className="empty-message">Nenhuma notícia disponível no momento.</div>
        )}

        {!loading && noticias.map(noticia => (
          <article key={noticia._id} className="noticia-item">
            <Link to={`/noticia/${noticia.slug}`}>
              <div className="imagem-noticia-container">
                <img 
                  src={noticia.image || '/imagem-padrao.jpg'}
                  alt={noticia.title}
                  className="imagem-noticia"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = '/imagem-padrao.jpg';
                  }}
                />
              </div>
              <h2>{noticia.title}</h2>
              <p>{noticia.content.substring(0, 150)}...</p>
            </Link>
            {noticia.tags && noticia.tags.length > 0 && (
              <p className="tags">
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

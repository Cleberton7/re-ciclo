import React, { useState, useEffect } from 'react';
import { listarNoticias } from '../services/noticiaService';
import "./styles/containerPrincipal.css";
import "./styles/eventosNoticias.css";

const NoticiasEventos = () => {
  const [noticias, setNoticias] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    carregarNoticias();
  }, []);

  const carregarNoticias = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await listarNoticias();
      // Verifica e corrige URLs de imagem se necessário
      const noticiasFormatadas = data.map(noticia => ({
        ...noticia,
        image: noticia.image 
          ? noticia.image.startsWith('http') 
            ? noticia.image 
            : `http://localhost:5000${noticia.image}`
          : null
      }));
      setNoticias(noticiasFormatadas);
    } catch (err) {
      console.error('Erro ao carregar notícias:', err);
      setError('Erro ao carregar notícias. Tente recarregar a página.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="noticias-publicas-container" id='containerPrincipal'>
      <h1>Eventos</h1>

      {loading && <p>Carregando notícias...</p>}
      {error && <p className="error-message">{error}</p>}

      {!loading && noticias.length === 0 && (
        <p>Nenhuma notícia disponível no momento.</p>
      )}

      <div className="lista-noticias">
        {noticias.map(noticia => (
          <article key={noticia._id} className="noticia-item">
            <h2>{noticia.title}</h2>
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
            <p>{noticia.content}</p>
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
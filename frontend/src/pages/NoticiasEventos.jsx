import React, { useState, useEffect } from 'react';
import { listarNoticias } from '../services/noticiaService';
import "./styles/containerPrincipal.css"
import "./styles/eventosNoticias.css"


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
      setNoticias(data);
    } catch {
      setError('Erro ao carregar notícias.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="noticias-publicas-container">
      <h1>Notícias</h1>

      {loading && <p>Carregando notícias...</p>}
      {error && <p className="error-message">{error}</p>}

      {!loading && noticias.length === 0 && <p>Nenhuma notícia disponível no momento.</p>}

      <div className="lista-noticias">
        {noticias.map(noticia => (
          <article key={noticia._id} className="noticia-item">
            <h2>{noticia.title}</h2>
            {noticia.image && (
              <img src={noticia.image} alt={noticia.title} />
            )}
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

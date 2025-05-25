import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { listarNoticias } from '../services/noticiaService';
import "./styles/containerPrincipal.css";
import "./styles/noticiaDetalhe.css";

const NoticiaDetalhe = () => {
  const { id } = useParams();
  const [noticia, setNoticia] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

    useEffect(() => {
    const buscarNoticia = async () => {
        setLoading(true);
        setError('');
        try {
        const data = await listarNoticias();
        const encontrada = data.find(item => item._id === id);

        if (encontrada) {
            const noticiaFormatada = {
            ...encontrada,
            image: encontrada.image 
                ? encontrada.image.startsWith('http') 
                ? encontrada.image 
                : `http://localhost:5000${encontrada.image}`
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
    }, [id]);

  if (loading) return <p>Carregando...</p>;
  if (error) return <p className="error-message">{error}</p>;

  return (
    <div className="noticia-detalhe-container" id='containerPrincipal'>
      <Link to="/noticiasEventos">← Voltar para Notícias</Link>

      {noticia && (
        <>
          <h1>{noticia.title}</h1>
          <div className="imagem-noticia-detalhe">
            <img 
              src={noticia.image || '/imagem-padrao.jpg'} 
              alt={noticia.title}
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
        </>
      )}
    </div>
  );
};

export default NoticiaDetalhe;

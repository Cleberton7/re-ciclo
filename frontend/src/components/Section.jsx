import React, { useState, useEffect, useCallback } from 'react';
import "../pages/styles/section.css";
import "../pages/styles/containerPrincipal.css";
import { Link } from 'react-router-dom';
import { listarNoticias } from '../services/noticiaService';
import { BASE_URL } from '../config/config.js';

const Section = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [noticias, setNoticias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const itemsPerPage = 4;

  useEffect(() => {
    const carregarNoticias = async () => {
      try {
        const data = await listarNoticias();

        const noticiasFormatadas = data.map(noticia => {
          if (noticia.image && !noticia.image.startsWith('http')) {
            return {
              ...noticia,
              image: `${BASE_URL}${noticia.image}`
            };
          }
          return noticia;
        });

        setNoticias(noticiasFormatadas);
        setLoading(false);
      } catch (err) {
        console.error('Erro ao carregar notícias:', err);
        setError('Erro ao carregar notícias');
        setLoading(false);
      }
    };

    carregarNoticias();
  }, []);

  const totalPages = Math.ceil(noticias.length / itemsPerPage);

  const nextSlide = useCallback(() => {
    setCurrentIndex((prevIndex) => (prevIndex + itemsPerPage) % noticias.length);
  }, [noticias.length, itemsPerPage]);

  const prevSlide = useCallback(() => {
    setCurrentIndex((prevIndex) =>
      (prevIndex - itemsPerPage + noticias.length) % noticias.length
    );
  }, [noticias.length, itemsPerPage]);

  useEffect(() => {
    if (noticias.length > 0) {
      const interval = setInterval(nextSlide, 5000);
      return () => clearInterval(interval);
    }
  }, [noticias.length, nextSlide]);

  const getVisibleNoticias = () => {
    if (noticias.length === 0) return [];
    const endIndex = currentIndex + itemsPerPage;
    if (endIndex <= noticias.length) {
      return noticias.slice(currentIndex, endIndex);
    }
    return [
      ...noticias.slice(currentIndex),
      ...noticias.slice(0, endIndex % noticias.length)
    ];
  };

  const visibleNoticias = getVisibleNoticias();

  const handleIndicadorClick = (pageIndex) => {
    setCurrentIndex(pageIndex * itemsPerPage);
  };

  if (loading) {
    return (
      <div className="section" id="containerPrincipal">
        <div id="textSection">Notícias e Eventos</div>
        <div className="loading">Carregando notícias...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="section" id="containerPrincipal">
        <div id="textSection">Notícias e Eventos</div>
        <div className="error">{error}</div>
      </div>
    );
  }

  if (noticias.length === 0) {
    return (
      <div className="section" id="containerPrincipal">
        <div id="textSection">Notícias e Eventos</div>
        <div className="no-news">Nenhuma notícia disponível no momento</div>
      </div>
    );
  }

  return (
    <section className="section" id="containerPrincipal">
      <Link to="/NoticiasEventos">
        <div id="textSection">Notícias e Eventos</div>
      </Link>

      <div id="containerSection" className="carousel-multiple">
        <button
          className="carousel-btn prev"
          onClick={prevSlide}
          aria-label="Notícias anteriores"
        >
          {/* SVG seta esquerda igual Swiper */}
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
            width="20"
            height="20"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        <div className="carousel-items-container">
          {visibleNoticias.map((noticia) => (
            <div key={noticia._id} className="carousel-item">
              <div className="carousel-image-container">
                <img
                  src={noticia.image || '/imagem-padrao.jpg'}
                  alt={noticia.title}
                  className="carousel-image"
                  onError={(e) => {
                    console.error(`Falha ao carregar: ${noticia.image}`);
                    e.target.src = '/imagem-padrao.jpg';
                  }}
                />
              </div>
              <div className="carousel-content">
                <h3>{noticia.title}</h3>
                <p>{noticia.content.substring(0, 100)}...</p>
                <Link
                  to={`/noticia/${noticia.slug}`}
                  className="carousel-link"
                  aria-label={`Ler mais sobre ${noticia.title}`}
                >
                  Leia mais
                </Link>
              </div>
            </div>
          ))}
        </div>

        <button
          className="carousel-btn next"
          onClick={nextSlide}
          aria-label="Próximas notícias"
        >
          {/* SVG seta direita igual Swiper */}
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
            width="20"
            height="20"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      {/* Indicadores (pontos) */}
      <div className="section-indicadores">
        {Array.from({ length: totalPages }).map((_, i) => (
          <button
            key={i}
            className={`section-indicador ${Math.floor(currentIndex / itemsPerPage) === i ? 'ativo' : ''}`}
            onClick={() => handleIndicadorClick(i)}
            aria-label={`Ir para página ${i + 1}`}
          />
        ))}
      </div>
    </section>
  );
};

export default Section;

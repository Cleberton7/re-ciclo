import React, { useState, useEffect } from 'react';
import "../pages/styles/section.css";
import "../pages/styles/containerPrincipal.css";
import { Link } from 'react-router-dom';

const Section = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const noticias = [
    { title: "Notícia 1", content: "Conteúdo da notícia 1" },
    { title: "Notícia 2", content: "Conteúdo da notícia 2" },
    { title: "Notícia 3", content: "Conteúdo da notícia 3" },
    { title: "Notícia 4", content: "Conteúdo da notícia 4" },
    { title: "Notícia 5", content: "Conteúdo da notícia 5" },
    { title: "Notícia 6", content: "Conteúdo da notícia 6" },
    { title: "Notícia 7", content: "Conteúdo da notícia 7" },
    { title: "Notícia 8", content: "Conteúdo da notícia 8" }
  ];
  const itemsPerPage = 4;

  const nextSlide = () => {
    setCurrentIndex((prevIndex) => (prevIndex + itemsPerPage) % noticias.length);
  };

  const prevSlide = () => {
    setCurrentIndex((prevIndex) => (prevIndex - itemsPerPage + noticias.length) % noticias.length);
  };

    // Auto-slide
    useEffect(() => {
      const interval = setInterval(nextSlide, 4000);
      return () => clearInterval(interval);
    }, []);
  
    // Notícias que serão exibidas no slide atual
    const visibleNoticias = noticias.slice(
      currentIndex,
      currentIndex + itemsPerPage
    ).length === itemsPerPage
      ? noticias.slice(currentIndex, currentIndex + itemsPerPage)
      : [
          ...noticias.slice(currentIndex),
          ...noticias.slice(0, (currentIndex + itemsPerPage) % noticias.length)
        ];
  
    return (
      <div className="section" id="containerPrincipal">
        <div id="textSection">Notícias e Eventos</div>
        <div id="containerSection" className="carousel-multiple">
          <button className="carousel-btn prev" onClick={prevSlide}>
            &lt;
          </button>
          <div className="carousel-items-container">
            {visibleNoticias.map((noticia, index) => (
              <div key={index} className="carousel-item">
                <h3>{noticia.title}</h3>
                <p>{noticia.content}</p>
              </div>
            ))}
          </div>
          <button className="carousel-btn next" onClick={nextSlide}>
            &gt;
          </button>
        </div>
      </div>
    );
  };
  
  export default Section;
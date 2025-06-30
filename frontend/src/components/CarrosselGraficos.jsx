import React, { useState, useRef } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation } from 'swiper/modules'; // remova Pagination daqui
import 'swiper/css';
import 'swiper/css/navigation';
import GraficoColetas from './GraficoColetas';
import GraficoEvolucaoColetas from './GraficoEvolucaoColetas';
import GraficoImpactoAmbiental from './GraficoImpactoAmbiental';
import GraficoRankingEmpresas from './GraficoRankingEmpresas';
import '../pages/styles/carrosselGraficos.css';

const CarrosselGraficos = ({ 
  distribuicao = [], 
  ranking = [], 
  evolucao = [], 
  impactoAmbiental = 0 
}) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const swiperRef = useRef(null);

  const graficos = [
    {
      id: 1,
      titulo: "Distribuição por Material",
      componente: <GraficoColetas dados={distribuicao} compactMode={true} />
    },
    {
      id: 2,
      titulo: "Ranking de Empresas",
      componente: <GraficoRankingEmpresas ranking={ranking} compactMode={true} />
    },
    {
      id: 3,
      titulo: "Evolução das Coletas",
      componente: <GraficoEvolucaoColetas dados={evolucao} compactMode={true} />
    },
    {
      id: 4,
      titulo: "Impacto Ambiental",
      componente: (
        <GraficoImpactoAmbiental 
          impactoAtual={impactoAmbiental} 
          meta={10000} 
          compactMode={true}
        />
      )
    }
  ];

  const handleIndicadorClick = (index) => {
    setActiveIndex(index);
    if (swiperRef.current) {
      swiperRef.current.slideTo(index);
    }
  };

  return (
    <div className="carrossel-graficos-container">
      
      <Swiper
        modules={[Navigation]}   
        spaceBetween={20}
        slidesPerView={1}
        navigation
        onSlideChange={(swiper) => setActiveIndex(swiper.activeIndex)}
        onSwiper={(swiper) => (swiperRef.current = swiper)}
        className="graficos-swiper"
      >
        {graficos.map((grafico) => (
          <SwiperSlide key={grafico.id}>
            <div className="slide-container">
              <h4 className="grafico-titulo">{grafico.titulo}</h4>
              <div className="grafico-wrapper">
                {grafico.componente}
              </div>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
      
      {/* Indicadores customizados */}
      <div className="carrossel-indicadores">
        {graficos.map((_, index) => (
          <button
            key={index}
            className={`indicador ${index === activeIndex ? 'ativo' : ''}`}
            onClick={() => handleIndicadorClick(index)}
            aria-label={`Ir para gráfico ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
};

export default CarrosselGraficos;

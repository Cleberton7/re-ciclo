import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import "./styles/Home.css";
import "./styles/containerPrincipal.css"
import Content from '../components/Content.jsx';
import Section from '../components/Section.jsx';

const Home = () => {
  const location = useLocation();

  useEffect(() => {
    if (location.state?.scrollToMapa) {
      const mapa = document.querySelector("#content .map-wrapper");
      if (mapa) {
        mapa.scrollIntoView({ behavior: "smooth" });
      }
    }
  }, [location.state]);

  return (
    <div className='layouHome'>
      <div id='content'>
        <Content />
      </div>
      <div id='section'>
        <Section />
      </div>
    </div>
  );
};

export default Home;

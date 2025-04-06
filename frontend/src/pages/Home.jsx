import React from 'react';
import "./styles/Home.css";
import Content from '../components/Content.jsx';
import Section from '../components/Section.jsx';
import { LoadScript } from "@react-google-maps/api";

const Home = () => {
  return (
    <LoadScript googleMapsApiKey={import.meta.env.VITE_GOOGLE_MAPS_KEY}>
      <div className='layouHome'>
        <div id='content'>
          <Content />
        </div>
        <div id='section'>
          <Section />
        </div>
      </div>
    </LoadScript>
  );
};

export default Home;

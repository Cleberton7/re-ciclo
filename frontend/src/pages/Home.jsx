import React from 'react';
import "./styles/Home.css";
import "./styles/containerPrincipal.css"
import Content from '../components/Content.jsx';
import Section from '../components/Section.jsx';
import Layout from "../components/Layout";

const Home = () => {
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

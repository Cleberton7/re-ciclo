import React from 'react';
import "./styles/Home.css";
import Content from '../components/content.jsx'
import Section from '../components/section.jsx';

const Home = () => {
  return (
    <div className='layouHome'>
     
      <div id='content'>
        <Content/>
      </div>

        <div id='section'>
        <Section/>
      </div>
    </div>
  );
};

export default Home;

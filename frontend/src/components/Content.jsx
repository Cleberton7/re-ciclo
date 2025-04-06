import React from 'react';
import "../pages/styles/content.css";



const Content = () => {
  return (
    <div className='content'> 
        <div className='containerRanked'> 
          <div id='textRanked'> Ranking das empresas </div>
          <div id='rankedEmpresa'> Ranked empresas </div>
        </div>
        <div className='containerGraphic'> 
          <div id='textGraph'> Grafico de coletas </div>
          <div id='graphic'> Grafico </div>
        </div>
        
        <div className='containerMaps'> 
          <div id='textLoc'> Localização/empresas </div>
          <div id='maps'> Maps</div>
        </div> 
    </div>
  );
};

export default Content;

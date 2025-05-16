import React from 'react';
import "./styles/containerPrincipal.css"
import "./styles/recicle.css"

const Recicle = () => {
  return (
    <div className='containerRecicle' id="containerPrincipal">
      <h3>Lixo eletrônico, você sabia das suas problemáticas?
      </h3>
      
      <h2>
        Como nos afeta?
      </h2>
        <p>
          O lixo eletrônico, pode ter vários impactos negativos tanto no meio ambiente, quanto na saúde humana.
          
        </p>
        <p>
        Muitos dispositivos eletrônicos contém substancias tóxicas como chumbio, mercúrio, cádmio e bromo.
        
        </p>
        <p>
          Quando esses dispositivos são descartados inadequadamente, esses produtos químos podem vazar e contaminar o solo e as águas.
        </p>
      <h2>
        Como agir?
      </h2>
      <h1>
        Evite Desperdício
      </h1>
      <p>Compre apenas o necessário, opte por produtos recicláveis e com certificaçõies ambientais</p>
      <h1>
        Repare ou doe
      </h1>
      <p>Procure um centro de coleta ou reciclagem na sua cidade.</p>
      
    </div>
  );
};

export default Recicle;

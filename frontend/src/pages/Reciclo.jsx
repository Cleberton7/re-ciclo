import React from 'react';
import "./styles/containerPrincipal.css";
import "./styles/PageReciclo.css";
import imgLixoEletronico from "../image/lixoEletronico.jpeg";
import imgReciclagem from "../image/eventoEciclo-escolas.jpeg";
import imgConsumo from "../image/recicle-o-seu-lixo.jpg";

const Reciclo = () => {
  return (
    <div className='recycle-page' id="containerPrincipal">
      <h3 className="recycle-page__title">Lixo Eletrônico: O Desafio Invisível da Era Digital</h3>
      
      <div className="recycle-page__section">
        <h2 className="recycle-page__section-title">O Impacto do Lixo Eletrônico</h2>
        
        <div className="recycle-page__paragraph">
          <img 
            src={imgLixoEletronico} 
            alt="Montanha de lixo eletrônico" 
            className="recycle-page__hero-image" 
          />
          <p>
            A cada ano, o mundo produz aproximadamente <strong>53 milhões de toneladas</strong> de lixo eletrônico - equivalente a 350 navios de cruzeiro do tamanho do Queen Mary 2. Menos de 20% disso é reciclado formalmente.
          </p>
        </div>
        
        <div className="recycle-page__stats-container">
          <div className="recycle-page__stat-card">
            <div className="recycle-page__stat-number">+53 mi</div>
            <p>Toneladas de e-lixo geradas anualmente</p>
          </div>
          <div className="recycle-page__stat-card">
            <div className="recycle-page__stat-number">7%</div>
            <p>É a taxa de reciclagem no Brasil</p>
          </div>
          <div className="recycle-page__stat-card">
            <div className="recycle-page__stat-number">+1000</div>
            <p>Substâncias tóxicas encontradas</p>
          </div>
        </div>
        
        <h3 className="recycle-page__item-title">Riscos para a Saúde e Meio Ambiente</h3>
        <p>
          Dispositivos eletrônicos contêm substâncias perigosas como chumbo (causa danos neurológicos), mercúrio (tóxico para rins e sistema nervoso), cádmio (causa problemas ósseos e renais) e retardantes de chama bromados (disruptores endócrinos).
        </p>
        <p>
          Quando descartados incorretamente, esses contaminantes vazam para o solo e lençóis freáticos. Um único monitor CRT pode contaminar até <strong>80.000 litros de água</strong> com chumbo.
        </p>
      </div>
      
      <div className="recycle-page__section">
        <h2 className="recycle-page__section-title">Soluções e Boas Práticas</h2>
        
        <div className="recycle-page__action-item">
          <h3 className="recycle-page__item-title">Consumo Consciente</h3>
          <div className="recycle-page__solution-card">
            <img src={imgConsumo} alt="Consumo consciente" className="recycle-page__hero-image" />
            <div>
              <p>
                <strong>Estenda a vida útil</strong> dos seus dispositivos. Um smartphone médio poderia ter sua vida útil estendida em 2-3 anos com cuidados básicos, reduzindo significativamente seu impacto ambiental.
              </p>
              <p>
                Prefira produtos com <strong>certificações ambientais</strong> como EPEAT, Energy Star ou selo verde.
              </p>
            </div>
          </div>
        </div>
        
        <div className="recycle-page__action-item">
          <h3 className="recycle-page__item-title">Descarte Adequado</h3>
          <div className="recycle-page__solution-card">
            <img src={imgReciclagem} alt="Centro de reciclagem" className="recycle-page__hero-image" />
            <div>
              <p>
                <strong>Pontos de coleta</strong> garantem que metais valiosos como ouro, prata e cobre sejam recuperados (uma tonelada de placas de circuito contém 800x mais ouro que uma tonelada de minério).
              </p>
              <p>
                Muitos fabricantes e varejistas oferecem <strong>programas de take-back</strong>. Verifique no site do fabricante.
              </p>
            </div>
          </div>
        </div>
        
        <div className="recycle-page__action-item">
          <h3 className="recycle-page__item-title">Nosso Compromisso</h3>
          <p>
            Nossa empresa já reciclou mais de <strong>15 toneladas</strong> de lixo eletrônico, desviando esses materiais de aterros sanitários e recuperando materiais valiosos. Oferecemos:
          </p>
          <ul>
            <li>Coleta gratuita para grandes volumes</li>
            <li>Certificado de destinação ambiental correta</li>
            <li>Dados transparentes sobre o processo de reciclagem</li>
            <li>Educação ambiental para comunidades</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Reciclo;
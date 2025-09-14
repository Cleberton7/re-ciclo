import React from 'react';
import { useNavigate } from "react-router-dom";
import "./styles/containerPrincipal.css";
import "./styles/PageReciclo.css";
import imgLixoEletronico from "../image/lixoEletronico.jpeg";
import imgReciclagem from "../image/eventoEciclo-escolas.jpeg";
import imgConsumo from "../image/recicle-o-seu-lixo.jpg";


const Reciclo = () => {
    const navigate = useNavigate();
  return (
    <div className='recycle-page' id="containerPrincipal">

      {/* Introdução */}
      <section className="recycle-page__intro">
        <h1 className="recycle-page__main-title">REEE: Conectando Consciência e Destinação Correta</h1>
        <p>
          Nossa plataforma conecta pessoas, empresas e centros de reciclagem, criando uma rede confiável para garantir que resíduos eletrônicos sejam reutilizados, reciclados ou descartados de forma ambientalmente adequada. 
          Aprenda sobre os impactos do lixo eletrônico, soluções práticas e como você pode contribuir.
        </p>
      </section>

      {/* Seção: Impacto do Lixo Eletrônico */}
      <section className="recycle-page__section recycle-page__section--impacto">
        <h2 className="recycle-page__section-title">O Desafio Invisível do Lixo Eletrônico</h2>
        <div className="recycle-page__paragraph">
          <img 
            src={imgLixoEletronico} 
            alt="Montanha de lixo eletrônico" 
            className="recycle-page__hero-image" 
          />
          <p>
            A cada ano, o mundo produz aproximadamente <strong>53 milhões de toneladas</strong> de lixo eletrônico – equivalente a centenas de navios de cruzeiro. Menos de 20% desse volume é reciclado formalmente.
          </p>
        </div>
        <div className="recycle-page__stats-container">
          <div className="recycle-page__stat-card">
            <div className="recycle-page__stat-number">+53 mi</div>
            <p>Toneladas de e-lixo geradas anualmente</p>
          </div>
          <div className="recycle-page__stat-card">
            <div className="recycle-page__stat-number">7%</div>
            <p>Taxa de reciclagem no Brasil</p>
          </div>
          <div className="recycle-page__stat-card">
            <div className="recycle-page__stat-number">+1000</div>
            <p>Substâncias tóxicas presentes em equipamentos eletrônicos</p>
          </div>
        </div>

        <h3 className="recycle-page__item-title">Riscos à Saúde e ao Meio Ambiente</h3>
        <p>
          Dispositivos eletrônicos contêm chumbo, mercúrio, cádmio e retardantes de chama bromados, que podem afetar rins, sistema nervoso e ossos. O descarte inadequado contamina solo e lençóis freáticos. Um único monitor CRT pode poluir até <strong>80.000 litros de água</strong>.
        </p>
      </section>

      {/* Seção: Soluções e Boas Práticas */}
      <section className="recycle-page__section recycle-page__section--solucoes">
        <h2 className="recycle-page__section-title">Soluções e Boas Práticas</h2>

        <div className="recycle-page__action-item">
          <h3 className="recycle-page__item-title">Consumo Consciente</h3>
          <div className="recycle-page__solution-card">
            <img src={imgConsumo} alt="Consumo consciente" className="recycle-page__hero-image" />
            <div>
              <p><strong>Estenda a vida útil</strong> dos seus dispositivos, reduzindo impacto ambiental.</p>
              <p>Prefira produtos com <strong>certificações ambientais</strong> como EPEAT ou Energy Star.</p>
            </div>
          </div>
        </div>

        <div className="recycle-page__action-item">
          <h3 className="recycle-page__item-title">Descarte e Reciclagem</h3>
          <div className="recycle-page__solution-card">
            <img src={imgReciclagem} alt="Centro de reciclagem" className="recycle-page__hero-image" />
            <div>
              <p>
                <strong>Pontos de coleta certificados</strong> garantem que metais valiosos sejam recuperados e que os resíduos perigosos sejam tratados corretamente.
              </p>
              <p>
                Muitos fabricantes oferecem <strong>programas de take-back</strong> para devolução de equipamentos antigos.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Seção: Nosso Compromisso */}
      <section className="recycle-page__section recycle-page__section--compromisso">
        <h2 className="recycle-page__section-title">Nosso Compromisso</h2>
        <p>
          A plataforma foi desenvolvida para conectar geradores de resíduos (pessoas e empresas) a centros de reciclagem confiáveis, garantindo rastreabilidade, segurança e destinação correta de REEE. Nosso objetivo é que cada equipamento seja encaminhado para:
        </p>
        <ul>
          <li>Reciclagem responsável, reaproveitando materiais valiosos.</li>
          <li>Reutilização sempre que possível, prolongando o ciclo de vida do equipamento.</li>
          <li>Descarte seguro, evitando impactos ambientais e riscos à saúde.</li>
        </ul>
        <p>
          Além disso, promovemos educação ambiental, conscientizando comunidades sobre os impactos do e-lixo e a importância do consumo consciente.
        </p>
      </section>

      {/* Seção: Como Funciona */}
      <section className="recycle-page__section recycle-page__section--como-funciona">
        <h2 className="recycle-page__section-title">Como Funciona</h2>
        <div className="recycle-page__timeline">
          <div className="recycle-page__timeline-step">
            <span className="recycle-page__timeline-icon">🛠️</span>
            <p>Você registra sua empresa, acessando o painel voce pode fazer sua solicitacão de coleta de seus equipamentos eletreletrônico na plataforma.</p>
          </div>
          <div className="recycle-page__timeline-step">
            <span className="recycle-page__timeline-icon">♻️</span>
            <p>Um centro de reciclagem certificado e registrado na plataforma recebe e processa corretamente os resíduos.</p>
          </div>
          <div className="recycle-page__timeline-step">
            <span className="recycle-page__timeline-icon">📄</span>
            <p>Você acompanha o processo e recebe comprovante de destinação segura.</p>
          </div>
        </div>
      </section>

      {/* Chamada final */}
      <section className="recycle-page__section recycle-page__section--acao">
        <h2 className="recycle-page__section-title">Participe!</h2>
        <p>
          Seja parte da mudança: registre seus equipamentos, recicle, reutilize e ajude a proteger o meio ambiente.
        </p>
          <button
                className="btn-primary"
                onClick={() =>
                  navigate("/", { state: { scrollToMapa: true } })
                }
              >
                Encontre um ponto de coleta
              </button>

                </section>
    </div>
  );
};

export default Reciclo;

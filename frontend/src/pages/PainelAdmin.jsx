import React from 'react';
import { useNavigate } from 'react-router-dom';
import "./styles/containerPrincipal.css";
import "./styles/painelAdmin.css"

const PainelAdm = () => {
  const navigate = useNavigate();

  const handleAcessarNoticias = () => {
    navigate("/painelNoticias");
  };

  return (
    <div className="container-principal" id='containerPainelAdmin'>
      <h1>Bem-vindo ao Painel do Administrador</h1>
      
      <div className="card-opcao" onClick={handleAcessarNoticias}>
        <h2>Gerenciar Eventos e Notícias</h2>
        <p>Clique aqui para acessar a área de gerenciamento de eventos e notícias.</p>
      </div>
    </div>
  );
};

export default PainelAdm;

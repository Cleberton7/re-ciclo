import React from 'react';
import { useNavigate } from 'react-router-dom';
import "../styles/containerPrincipal.css";
import "./styles/painelAdmin.css";
import VoltarLink from '../../components/VoltarLink';

const PainelAdm = () => {
  const navigate = useNavigate();

  return (
    <div className="containerPainelAdmin" id='containerPrincipal'>

    <VoltarLink to="/home">Voltar</VoltarLink>
      <div >
        <h1 className="titulo-painel">Painel do Administrador</h1>
        <p className="subtitulo">Gerencie os recursos da plataforma abaixo:</p>

        {/* === Seção: Usuários === */}
        <h2 className="titulo-secao">👥 Gestão de Usuários</h2>
        <div className="grid-opcoes">
          <div className="card-opcao" onClick={() => navigate("/painelUsuarios")}>
            <h3>Editar Usuários</h3>
            <p>Atualize informações de usuários cadastrados.</p>
          </div>
          <div className="card-opcao" onClick={() => navigate("/permissoes")}>
            <h3>Gerenciar Permissões</h3>
            <p>Defina níveis de acesso e papéis dos usuários.</p>
          </div>
        </div>

        {/* === Seção: Conteúdo === */}
        <h2 className="titulo-secao">📰 Conteúdo e Eventos</h2>
        <div className="grid-opcoes">
          <div className="card-opcao" onClick={() => navigate("/painelNoticias")}>
            <h3>Eventos e Notícias</h3>
            <p>Gerencie notícias e eventos do sistema.</p>
          </div>
          <div className="card-opcao" onClick={() => navigate("/banners")}>
            <h3>Banners e Destaques</h3>
            <p>Atualize as imagens em destaque da página inicial.</p>
          </div>
        </div>

        {/* === Seção: Sistema e Coletas === */}
        <h2 className="titulo-secao">⚙️ Sistema e Coletas</h2>
        <div className="grid-opcoes">
          <div className="card-opcao" onClick={() => navigate("/painelColetas")}>
            <h3>Gerenciar Coletas</h3>
            <p>Acompanhe as coletas e seus status.</p>
          </div>
          <div className="card-opcao" onClick={() => navigate("/solicitacoesPendentes")}>
            <h3>Solicitações Pendentes</h3>
            <p>Analise e aprove pedidos de coleta e cadastro.</p>
          </div>
          <div className="card-opcao" onClick={() => navigate("/gerenciarPontosColeta")}>
            <h3>Pontos de Coleta</h3>
            <p>Adicione, edite ou remova locais de coleta.</p>
          </div>
          <div className="card-opcao" onClick={() => navigate("/empresasGeradoras")}>
            <h3>Empresas Geradoras</h3>
            <p>Gerencie empresas que geram resíduos eletrônicos.</p>
          </div>
        </div>
      </div>
      
    </div>
  );
};

export default PainelAdm;

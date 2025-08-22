import { Routes, Route, Navigate } from "react-router-dom";
import Home from "../pages/Home";
import Contatos from "../pages/Contatos";
import Empresas from "../pages/Empresas";
import Reciclo from "../pages/Reciclo";
import Eventos from "../pages/NoticiasEventos";
import PublicColetasPage from "../pages/PublicColetasPage";
import PainelEmpresa from "../pages/PainelEmpresa";
import EmpresasDetalhes from "../pages/EmpresasDetalhes";
import PainelReciclador from "../pages/PainelReciclador";
import PainelPessoa from "../pages/PainelPessoa";
import PainelNoticias from "../pages/admin/PainelNoticias";
import PainelAdm from "../pages/admin/PainelAdmin";
import NoticiasEventos from '../pages/NoticiasEventos';
import NoticiaDetalhe from '../pages/NoticiaDetalhe';
import Layout from "../components/Layout";
import ProtectedRoute from "./ProtectedRoute";
import EmailVerificationPage from '../pages/EmailVerificationPage';
import PasswordResetPage from '../pages/PasswordResetPage';
import UnauthorizedPage from '../pages/UnauthorizedPage';
import EmailNotVerifiedPage from '../pages/EmailNotVerifiedPage';
import PainelUsuarios from '../pages/admin/PainelUsuarios';
import EditarUsuarioForm from '../pages/admin/EditarUsuarioForm';
import Permissoes from '../pages/admin/Permissoes';
import SolicitacoesPendentes from '../pages/admin/SolicitacoesPendentes';
import GerenciarPontosColeta from '../pages/admin/GerenciarPontosColeta';
import EmpresasGeradoras from '../pages/admin/EmpresasGeradoras';
import PainelColetas from '../pages/admin/PainelColetas';
import Banners from '../pages/admin/Banners';
import CadastroUsuarioAdm from '../pages/admin/CadastroUsuarioAdm';

const AppRoutes = () => {
  return (
    <Routes>
      {/* Rotas COM layout */}
      <Route element={<Layout />}>
        <Route path="/" element={<Home />} />
        <Route path="/empresas" element={<Empresas />} />
        <Route path="/reciclo" element={<Reciclo />} />
        <Route path="/publicColetasPage" element={<PublicColetasPage />} />
        <Route path="/eventos" element={<Eventos />} />
        <Route path="/contatos" element={<Contatos />} />
        <Route path="/noticia/:slug" element={<NoticiaDetalhe />} />
        <Route path="/noticiasEventos" element={<NoticiasEventos />} />
        <Route path="/unauthorized" element={<UnauthorizedPage />} />
        <Route path="/email-not-verified" element={<EmailNotVerifiedPage />} />
        <Route path="/empresas/:id" element={<EmpresasDetalhes tipo="empresa" />} />
        <Route path="/centros/:id" element={<EmpresasDetalhes tipo="centro" />} />

        

      </Route>

      {/* Rotas protegidas */}
      <Route
        path="/painelEmpresa"
        element={
          <ProtectedRoute 
            element={<PainelEmpresa />} 
            requiredRole="empresa" 
            redirectPath="/unauthorized"
          />
        }
      />
      <Route
        path="/painelReciclador"
        element={
          <ProtectedRoute 
            element={<PainelReciclador />} 
            requiredRole="centro" 
            redirectPath="/unauthorized"
          />
        }
      />
      <Route
        path="/painelPessoa"
        element={
          <ProtectedRoute 
            element={<PainelPessoa />} 
            requiredRole="pessoa" 
            redirectPath="/unauthorized"
          />
        }
      />

      {/* Rotas de administração */}
      <Route
        path="/painelAdmin"
        element={
          <ProtectedRoute 
            element={<PainelAdm />} 
            requiredRole="adminGeral" 
            redirectPath="/unauthorized"
          />
        }
      />
      <Route
        path="/painelNoticias"
        element={
          <ProtectedRoute 
            element={<PainelNoticias />} 
            requiredRole="adminGeral" 
            redirectPath="/unauthorized"
          />
        }
      />
      <Route 
        path="/cadastro-usuario-adm" 
        element={
          <ProtectedRoute 
            element={<CadastroUsuarioAdm />} 
            requiredRole="adminGeral" 
            redirectPath="/unauthorized"
          />
        }
      />
      
      <Route path="/editarUsuarioForm" element={
        <ProtectedRoute 
            element={<EditarUsuarioForm />}
            requiredRole="adminGeral" 
            redirectPath="/unauthorized"
          />
        } 
      />
      <Route path="/painelUsuarios" element={
        <ProtectedRoute
            element={<PainelUsuarios />}
            requiredRole="adminGeral"
            redirectPath="/unauthorized"
          />
        }
      />

      <Route path="/permissoes" element={        
        <ProtectedRoute 
            element={<Permissoes />}
            requiredRole="adminGeral" 
            redirectPath="/unauthorized"
          />
        } 
      />

      <Route path="/solicitacoesPendentes" element={
        <ProtectedRoute
            element={<SolicitacoesPendentes />}
            requiredRole="adminGeral" 
            redirectPath="/unauthorized"
          />
        }
      />

      <Route path="/gerenciarPontosColeta" element={
        <ProtectedRoute
            element={<GerenciarPontosColeta />}
            requiredRole="adminGeral" 
            redirectPath="/unauthorized"
          />
        }
      />
      <Route path="/empresasGeradoras" element={
        <ProtectedRoute
            element={<EmpresasGeradoras />}
            requiredRole="adminGeral" 
            redirectPath="/unauthorized"
          />
        }
      />
      <Route path="/painelColetas" element={
        <ProtectedRoute
            element={<PainelColetas />}
            requiredRole="adminGeral" 
            redirectPath="/unauthorized"                            
          />
        }   
      />
 
      <Route path="/banners" element={
        <ProtectedRoute
            element={<Banners />}    
            requiredRole="adminGeral"
            redirectPath="/unauthorized"
          />
        }
      />
      
      {/* Rotas de autenticação */}
      <Route path="/verificar-email" element={<EmailVerificationPage />} />
      <Route path="/recuperar-senha" element={<PasswordResetPage />} />

      {/* Redirecionamentos */}
      <Route path="/login" element={<Navigate to="/" replace />} />
      <Route path="/register" element={<Navigate to="/" replace />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default AppRoutes;
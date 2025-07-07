import { Routes, Route, Navigate } from "react-router-dom";
import Home from "../pages/Home";
import Contatos from "../pages/Contatos";
import Empresas from "../pages/Empresas";
import Recicle from "../pages/Recicle";
import Eventos from "../pages/NoticiasEventos";
import Coletas from "../pages/Coletas";
import PublicColetasPage from "../pages/PublicColetasPage";
import PainelEmpresa from "../pages/PainelEmpresa";
import PainelReciclador from "../pages/PainelReciclador";
import PainelPessoa from "../pages/PainelPessoa";
import PainelNoticias from "../pages/PainelNoticias";
import PainelAdm from "../pages/PainelAdmin";
import NoticiasEventos from '../pages/NoticiasEventos';
import NoticiaDetalhe from '../pages/NoticiaDetalhe';
import Layout from "../components/Layout";
import ProtectedRoute from "./ProtectedRoute";
import EmailVerificationPage from '../pages/EmailVerificationPage';
import PasswordResetPage from '../pages/PasswordResetPage';
import UnauthorizedPage from '../pages/UnauthorizedPage';
import EmailNotVerifiedPage from '../pages/EmailNotVerifiedPage';

const AppRoutes = () => {
  return (
    <Routes>
      {/* Rotas COM layout */}
      <Route element={<Layout />}>
        <Route path="/" element={<Home />} />
        <Route path="/empresas" element={<Empresas />} />
        <Route path="/recicle" element={<Recicle />} />
        <Route path="/coletas" element={<Coletas />} />
        <Route path="/publicColetasPage" element={<PublicColetasPage />} />
        <Route path="/eventos" element={<Eventos />} />
        <Route path="/contatos" element={<Contatos />} />
        <Route path="/noticia/:slug" element={<NoticiaDetalhe />} />
        <Route path="/noticiasEventos" element={<NoticiasEventos />} />
        <Route path="/unauthorized" element={<UnauthorizedPage />} />
        <Route path="/email-not-verified" element={<EmailNotVerifiedPage />} />
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
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
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

const AppRoutes = () => {
  return (
    <Router>
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
        </Route>

        {/* Rotas SEM layout */}
        <Route
          path="/painelEmpresa"
          element={<ProtectedRoute element={<PainelEmpresa />} role="empresa" />}
        />
        <Route
          path="/painelReciclador"
          element={<ProtectedRoute element={<PainelReciclador />} role="coletor" />}
        />
        <Route
          path="/painelPessoa"
          element={<ProtectedRoute element={<PainelPessoa />} role="pessoa" />}
        />
        <Route
          path="/painelAdmin"
          element={<ProtectedRoute element={<PainelAdm />} role="adminGeral" />}
        />
        <Route
          path="/painelNoticias"
          element={<ProtectedRoute element={<PainelNoticias />} role="adminGeral" />}
        />

        {/* Redirecionamentos */}
        <Route path="/login" element={<Navigate to="/" />} />
        <Route path="/register" element={<Navigate to="/" />} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
};

export default AppRoutes;

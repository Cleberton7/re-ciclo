import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Home from "../pages/Home";
import Contatos from "../pages/Contatos";
import Empresas from "../pages/Empresas";
import Recicle from "../pages/Recicle";
import Eventos from "../pages/Eventos";
import Coletas from "../pages/Coletas";
import PainelEmpresa from "../pages/PainelEmpresa";
import PainelReciclador from "../pages/PainelReciclador";
import PainelPessoa from "../pages/PainelPessoa";

import Layout from "../components/Layout";

// Função para proteger rotas específicas
const ProtectedRoute = ({ element, role, redirectPath = "/" }) => {
  const userRole = localStorage.getItem("role");
  if (!userRole || (role && userRole !== role)) {
    return <Navigate to={redirectPath} />;
  }
  return element;
};

const AppRoutes = () => {
  return (
    <Router>
      <Routes>

        {/* Rotas com Layout (header + footer) */}
        <Route element={<Layout />}>
          <Route path="/" element={<Home />} />
          <Route path="/empresas" element={<Empresas />} />
          <Route path="/recicle" element={<Recicle />} />
          <Route path="/coletas" element={<Coletas />} />
          <Route path="/eventos" element={<Eventos />} />
          <Route path="/contatos" element={<Contatos />} />
        </Route>

        {/* Rotas SEM Layout (sem header/footer) */}
        <Route
          path="/painelEmpresa"
          element={<ProtectedRoute element={<PainelEmpresa />} role="empresa" />}
        />
        <Route
          path="/painelReciclador"
          element={<ProtectedRoute element={<PainelReciclador />} role="reciclador" />}
        />
        <Route
          path="/painelPessoa"
          element={<ProtectedRoute element={<PainelPessoa />} role="pessoa" />}
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

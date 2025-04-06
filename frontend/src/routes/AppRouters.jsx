import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Home from "../pages/Home";
import Contatos from "../pages/Contatos";
import Empresas from "../pages/Empresas";
import Recicle from "../pages/Recicle";
import Eventos from "../pages/Eventos";
import Coletas from "../pages/Coletas";

import Layout from "../components/Layout";
const AppRoutes = () => {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/empresas" element={<Empresas />} />
          <Route path="/recicle" element={<Recicle />} />
          <Route path="/coletas" element={<Coletas />} />
          <Route path="/eventos" element={<Eventos />} />
          <Route path="/contatos" element={<Contatos />} />

          {/* Se alguém acessar /login ou /register, redireciona para Home */}
          <Route path="/login" element={<Navigate to="/" />} />
          <Route path="/register" element={<Navigate to="/" />} />

          {/* Rota de erro para qualquer outra URL inválida */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </Layout>
    </Router>
  );
};

export default AppRoutes;


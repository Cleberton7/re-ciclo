import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import Modal from "../components/modal";
import Login from "../pages/Login";
import Register from "../pages/Register";
import "../pages/styles/navHeader.css";
import { FiMenu, FiX } from "react-icons/fi";
import LogoCapa from "../assets/logoCapa.png";
import { useAuth } from "../contexts/authFunctions";

const NavHeader = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { isLoggedIn, userName, role, logout } = useAuth();

  const [activeModal, setActiveModal] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);

  const openModal = (type) => {
    setActiveModal(type);
    setMenuOpen(false);
  };

  const closeModal = () => {
    setActiveModal(null);
  };

  const handleLoginSuccess = (nome, role) => {
    console.log("Login bem-sucedido, nome e role:", { nome, role });
    closeModal();
  };

  const switchToLogin = () => {
    setActiveModal('login');
  };

  const switchToRegister = () => {
    setActiveModal('register');
  };

  const handlePerfilClick = () => {
    if (role === "empresa") {
      navigate("/painelEmpresa");
    } else if (role === "coletor") {
      navigate("/painelReciclador");
    } else if (role ==="admGeral"){
      navigate("/PainelAdm")
    }else{
      navigate("/painelPessoa");
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <>
      <div className="header-background">
        <div className="header" id="containerPrincipal">
          <div id="logo">
            <img src={LogoCapa} alt="Logo da empresa" className="logo-img" />
          </div>

          <div className="menu-toggle" onClick={() => setMenuOpen(!menuOpen)}>
            {menuOpen ? <FiX size={24} color="white" /> : <FiMenu size={24} color="white" />}
          </div>

          <div id="nav" className={menuOpen ? "open" : ""}>
            {[{ path: "/", label: "Home" }, { path: "/empresas", label: "Empresas Parceiras" }, { path: "/recicle", label: "Recicle" }, { path: "/coletas", label: "Coletas" }, { path: "/eventos", label: "Eventos" }, { path: "/contatos", label: "Contatos" }]
              .map(({ path, label }) => (
                <Link 
                  key={path} 
                  to={path} 
                  className={`menu ${location.pathname === path ? "active" : ""}`} 
                  onClick={() => setMenuOpen(false)}
                >
                  {label}
                </Link>
              ))}
          </div>

          <div id="loginRegister">
            {isLoggedIn ? (
              <div className="perfil-log">
                <div id="perfil" onClick={handlePerfilClick}>Olá, {userName}</div>
                <div id="loggout" onClick={handleLogout}>Sair</div>
              </div>
            ) : (
              <>
                <div id="entrar" onClick={() => openModal("login")}>Entrar</div>
                <div id="registrar" onClick={() => openModal("register")}>Registrar</div>
              </>
            )}
          </div>
        </div>
      </div>

      <Modal isOpen={activeModal !== null} onClose={closeModal}>
        {activeModal === 'login' ? (
          <Login 
            onLoginSuccess={handleLoginSuccess} 
            onRegisterClick={switchToRegister} 
          />
        ) : (
          <Register onLoginClick={switchToLogin} />
        )}
      </Modal>
    </>
  );
};

export default NavHeader;
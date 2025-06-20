import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import Modal from "../components/Modal";
import Login from "../pages/Login";
import Register from "../pages/Register";
import "../pages/styles/navHeader.css";
import { FiMenu, FiX } from "react-icons/fi";
import LogoCapa from "../assets/logoCapa.png";
import useAuth from "../hooks/useAuth";

const NavHeader = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { isLoggedIn, userName, role, userData, logout,loading } = useAuth();

  const [activeModal, setActiveModal] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);

  const openModal = (type) => {
    setActiveModal(type);
    setMenuOpen(false);
  };

  const closeModal = () => {
    setActiveModal(null);
  };

  const handleLoginSuccess = () => {
    closeModal();
    navigate("/");
  };

  const switchToLogin = () => setActiveModal('login');
  const switchToRegister = () => setActiveModal('register');

  const handlePerfilClick = () => {
    if (!userData) return;

    switch (role) {
      case "empresa":
        navigate("/painelEmpresa");
        break;
      case "centro":
        navigate("/painelReciclador");
        break;
      case "adminGeral":
        navigate("/painelAdmin");
        break;
      default:
        navigate("/painelPessoa");
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/");
    setMenuOpen(false);
  };

  const navLinks = [
    { path: "/", label: "Home" },
    { path: "/empresas", label: "Empresas Parceiras" },
    { path: "/recicle", label: "Recicle" },
    { path: "/publicColetasPage", label: "Coletas" },
    { path: "/eventos", label: "Eventos" },
    { path: "/contatos", label: "Contatos" }
  ];

  return (
    <>
      <div className="header-background">
        <div className="header" id="containerPrincipal">
          <div id="logo">
            <img 
              src={LogoCapa} 
              alt="Logo da empresa" 
              className="logo-img" 
              onClick={() => navigate("/")}
              style={{ cursor: "pointer" }}
            />
          </div>

          <button 
            className="menu-toggle" 
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Menu"
          >
            {menuOpen ? <FiX size={24} /> : <FiMenu size={24} />}
          </button>

          <div id="nav" className={menuOpen ? "open" : ""}>
            {navLinks.map(({ path, label }) => (
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
                <div 
                  id="perfil" 
                  onClick={handlePerfilClick}
                  style={{ cursor: "pointer" }}
                  title={userData?.email}
                >
                  {loading ? (
                    'Carregando...'
                  ) : (
                    `Olá, ${userName || userData?.nome || userData?.email || 'Usuário'}`
                  )}
                </div>
                <div 
                  id="loggout" 
                  onClick={handleLogout}
                  style={{ cursor: "pointer" }}
                >
                  Sair
                </div>
              </div>
            ) : (
              <>
                <div 
                  id="entrar" 
                  onClick={() => openModal("login")}
                  style={{ cursor: "pointer" }}
                >
                  Entrar
                </div>
                <div 
                  id="registrar" 
                  onClick={() => openModal("register")}
                  style={{ cursor: "pointer" }}
                >
                  Registrar
                </div>
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

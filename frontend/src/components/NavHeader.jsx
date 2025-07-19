import React, { useState, useEffect, useRef } from "react";
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
  const { isLoggedIn, userName, role, userData, logout, loading } = useAuth();
  const menuRef = useRef(null);
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

  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (menuOpen && menuRef.current && !menuRef.current.contains(e.target)) {
        const menuButton = document.querySelector('.nav-header-menu-toggle');
        if (menuButton && !menuButton.contains(e.target)) {
          setMenuOpen(false);
        }
      }
    };

    if (!menuOpen) {
      const nav = menuRef.current;
      if (nav && nav.contains(document.activeElement)) {
        document.activeElement.blur();
      }
    }

    const handleEscape = (e) => {
      if (e.key === 'Escape') setMenuOpen(false);
    };

    document.addEventListener('mousedown', handleOutsideClick);
    document.addEventListener('keydown', handleEscape);

    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [menuOpen]);

  const navLinks = [
    { path: "/", label: "Home" },
    { path: "/empresas", label: "Empresas Parceiras" },
    { path: "/reciclo", label: "Re-ciclo" },
    { path: "/publicColetasPage", label: "Coletas" },
    { path: "/eventos", label: "Eventos" },
    { path: "/contatos", label: "Contatos" }
  ];

  return (
    <>
      <div className="nav-header-background">
        <div className="nav-header" id="containerPrincipal">
          <div className="nav-header-logo">
            <img 
              src={LogoCapa} 
              alt="Logo da empresa" 
              className="nav-header-logo-img" 
              onClick={() => navigate("/")}
            />
          </div>

          <button 
            className={`nav-header-menu-toggle ${menuOpen ? 'active' : ''}`}
            onClick={() => setMenuOpen(!menuOpen)}
            aria-expanded={menuOpen}
            aria-label="Menu"
          >
            {menuOpen ? <FiX size={24} /> : <FiMenu size={24} />}
          </button>

          <div 
            ref={menuRef}
            className={`nav-header-nav ${menuOpen ? "open" : ""}`}
          >
            {navLinks.map(({ path, label }) => (
              <Link 
                key={path} 
                to={path} 
                className={`nav-header-link ${location.pathname === path ? "active" : ""}`}
                onClick={() => setMenuOpen(false)}
                aria-current={location.pathname === path ? "page" : undefined}
              >
                {label}
              </Link>
            ))}
          </div>

          <div className="nav-header-auth">
            {isLoggedIn ? (
              <div className="nav-header-profile">
                <div 
                  className="nav-header-profile-name"
                  onClick={handlePerfilClick}
                  title={userData?.email}
                >
                  {loading ? 'Carregando...' : `Olá, ${userName || userData?.nome || userData?.email || 'Usuário'}`}
                </div>
                <div 
                  className="nav-header-logout"
                  onClick={handleLogout}
                >
                  Sair
                </div>
              </div>
            ) : (
              <>
                <div 
                  className="nav-header-login"
                  onClick={() => openModal("login")}
                >
                  Entrar
                </div>
                <div 
                  className="nav-header-register"
                  onClick={() => openModal("register")}
                >
                  Registrar
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {menuOpen && (
        <div 
          className="nav-header-overlay"
          onClick={() => setMenuOpen(false)}
          role="presentation"
        />
      )}

      <Modal isOpen={activeModal !== null} onClose={closeModal} size="medium">
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
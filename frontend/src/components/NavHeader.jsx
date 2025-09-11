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
    { path: "/", label: "Início" },
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
                {/* Menu Dropdown Moderno */}
                <div className="profile-dropdown">
                  <div className="profile-trigger">
                    <div className="profile-avatar">
                      {userName?.charAt(0) || userData?.nome?.charAt(0) || 'U'}
                    </div>
                    <span className="profile-name">
                      {userName || userData?.nome || 'Usuário'}
                    </span>
                    <svg className="dropdown-arrow" width="12" height="7" viewBox="0 0 12 7" fill="none">
                      <path d="M1 1L6 6L11 1" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                    </svg>
                  </div>
                  
                  <div className="dropdown-menu">
                    <div className="dropdown-header">
                      <div className="dropdown-avatar">
                        {userName?.charAt(0) || userData?.nome?.charAt(0) || 'U'}
                      </div>
                      <div className="dropdown-user-info"
                        onClick={handlePerfilClick}>
                        <div className="dropdown-user-name">
                          {userName || userData?.nome || 'Usuário'}
                        </div>
                        <div className="dropdown-user-email" title={userData?.email}>
                          {userData?.email || ''}
                        </div>
                      </div>
                    </div>
                    
                    <div className="dropdown-divider"></div>
                    
                    <div 
                      className="dropdown-item"
                      onClick={handlePerfilClick}
                    >
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                        <path d="M13.5 14V12.5C13.5 11.837 13.2366 11.2011 12.7678 10.7322C12.2989 10.2634 11.663 10 11 10H5C4.33696 10 3.70107 10.2634 3.23223 10.7322C2.76339 11.2011 2.5 11.837 2.5 12.5V14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                        <path d="M8 7.5C9.38071 7.5 10.5 6.38071 10.5 5C10.5 3.61929 9.38071 2.5 8 2.5C6.61929 2.5 5.5 3.61929 5.5 5C5.5 6.38071 6.61929 7.5 8 7.5Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                      </svg>
                      <span>Acessar Painel</span>
                    </div>
                    
                    <div className="dropdown-divider"></div>
                    
                    <div 
                      className="dropdown-item logout-item"
                      onClick={handleLogout}
                    >
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                        <path d="M6 14H3.33333C2.97971 14 2.64057 13.8595 2.39052 13.6095C2.14048 13.3594 2 13.0203 2 12.6667V3.33333C2 2.97971 2.14048 2.64057 2.39052 2.39052C2.64057 2.14048 2.97971 2 3.33333 2H6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                        <path d="M10.6667 11.3333L14 8L10.6667 4.66667" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                        <path d="M14 8H6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                      </svg>
                      <span>Sair</span>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div 
                className="nav-header-empresa-btn"
                onClick={() => openModal("login")}
              >
                Área da Empresa
              </div>
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
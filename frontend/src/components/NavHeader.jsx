import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import Modal from "../components/modal";
import Login from "../pages/Login";
import Register from "../pages/Register";
import "../pages/styles/navHeader.css";
import { FiMenu, FiX } from "react-icons/fi";
import LogoCapa from "../assets/logoCapa.png";

const NavHeader = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false); // Estado para controlar o login

  const openModal = (type) => {
    setModalType(type);
    setIsModalOpen(true);
    setMenuOpen(false); // Fecha menu ao abrir modal
  };

  useEffect(() => {
    if (location.pathname === "/login") {
      openModal("login");
    } else if (location.pathname === "/register") {
      openModal("register");
    }
  }, [location.pathname]);

  // Função para alternar o estado de login
  const handleLoginSuccess = () => {
    setIsLoggedIn(true); // Define como logado
    setIsModalOpen(false); // Fecha o modal de login
  };

  // Função para fazer o logout
  const handleLogout = () => {
    setIsLoggedIn(false); // Define como deslogado
    navigate("/"); // Redireciona para a página inicial (ou outra página)
  };

  return (
    <>
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
              <div key={path} className={`menu ${location.pathname === path ? "active" : ""}`} onClick={() => setMenuOpen(false)}>
                <Link to={path}>{label}</Link>
              </div>
            ))}
        </div>

        <div id="loginRegister">
          {isLoggedIn ? (
            <div id="perfil" onClick={() => navigate("/perfil")}>Perfil</div> // Redireciona para o perfil
          ) : (
            <>
              <div id="entrar" onClick={() => openModal("login")}>Entrar</div>
              <div id="registrar" onClick={() => openModal("register")}>Registrar</div>
            </>
          )}
        </div>
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
        {modalType === "login" ? <Login onLoginSuccess={handleLoginSuccess} /> : <Register />}
      </Modal>
    </>
  );
};

export default NavHeader;

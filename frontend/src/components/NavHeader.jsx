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

  const [isModalOpen, setIsModalOpen

  ] = useState(false);
  const [modalType, setModalType] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false); // Estado para controlar o login
  const [userName, setUserName] = useState(""); // <-- Novo estado

  const openModal = (type) => {
    setModalType(type);
    setIsModalOpen(true);
    setMenuOpen(false); // Fecha menu ao abrir modal
  };

  useEffect(() => {
    // Recupera nome e token do localStorage
    const token = localStorage.getItem("token");
    const nome = localStorage.getItem("nome");
  
    if (token && nome) {
      setIsLoggedIn(true);
      setUserName(nome);
    }
  
    if (location.pathname === "/login") {
      openModal("login");
    } else if (location.pathname === "/register") {
      openModal("register");
    }
  }, [location.pathname]);
  

  // Função para alternar o estado de login
  const handleLoginSuccess = (nome) => {
    setIsLoggedIn(true);
    setUserName(nome); // <-- Salva o nome
    setIsModalOpen(false);
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
                <div key={path} className={`menu ${location.pathname === path ? "active" : ""}`} onClick={() => setMenuOpen(false)}>
                  <Link to={path}>{label}</Link>
                </div>
              ))}
          </div>

          <div id="loginRegister">
            {isLoggedIn ? (
              <div className="perfil-log" onClick={() => navigate("/perfil")}>
                <div id="perfil">Olá, {userName}</div> {/* <-- Nome do usuário aqui */}
                <div id="loggout" onClick={() => {
                  setIsLoggedIn(false);
                  setUserName("");

                  // Limpa localStorage
                  localStorage.removeItem("token");
                  localStorage.removeItem("nome");

                  navigate("/");
                }}>
                  Sair
                </div>

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

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
        {modalType === "login" ? <Login onLoginSuccess={handleLoginSuccess} /> : <Register />}
      </Modal>
    </>
  );
};

export default NavHeader;

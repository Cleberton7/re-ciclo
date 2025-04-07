import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import Modal from "../components/modal";
import Login from "../pages/Login";
import Register from "../pages/Register";
import "../pages/styles/navHeader.css";
import { FiMenu, FiX } from "react-icons/fi";
import LogoCapa from "../assets/logoCapa.png";

const NavHeader = () => {
  const location = useLocation();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);

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

  return (
    <>
      <div className="header">
        <div id="logo">
          <img src={LogoCapa} alt="Logo da empresa" className="logo-img" />
        </div>

        <div className="menu-toggle" onClick={() => setMenuOpen(!menuOpen)}>
          {menuOpen ? <FiX size={24} color="white" /> : <FiMenu size={24} color="white" />}
        </div>

        <div id="nav" className={menuOpen ? "open" : ""}>
          {[
            { path: "/", label: "Home" },
            { path: "/empresas", label: "Empresas Parceiras" },
            { path: "/recicle", label: "Recicle" },
            { path: "/coletas", label: "Coletas" },
            { path: "/eventos", label: "Eventos" },
            { path: "/contatos", label: "Contatos" },
          ].map(({ path, label }) => (
            <div
              key={path}
              className={`menu ${location.pathname === path ? "active" : ""}`}
              onClick={() => setMenuOpen(false)}
            >
              <Link to={path}>{label}</Link>
            </div>
          ))}
        </div>

        <div id="loginRegister">
          <div id="entrar" onClick={() => openModal("login")}>Entrar</div>
          <div id="registrar" onClick={() => openModal("register")}>Registrar</div>
        </div>
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
        {modalType === "login" ? <Login /> : <Register />}
      </Modal>
    </>
  );
};

export default NavHeader;

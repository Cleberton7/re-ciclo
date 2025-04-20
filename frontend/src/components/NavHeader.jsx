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
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userName, setUserName] = useState("");  // Nome do usuário (nome fantasia ou nome real)
  //const [userRole, setUserRole] = useState(""); // Tipo de usuário (empresa ou pessoa física)

  const openModal = (type) => {
    setModalType(type);
    setIsModalOpen(true);
    setMenuOpen(false);
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    const nome = localStorage.getItem("nome");
    //const role = localStorage.getItem("role");
  
    if (token && nome) {
      setIsLoggedIn(true);
      setUserName(nome);
      //setUserRole(role);
    }
  }, [location.pathname]);
  

  const handleLoginSuccess = (nome, role) => {
    console.log("Login bem-sucedido, nome e role:", { nome, role }); // Console após o login bem-sucedido

    setIsLoggedIn(true);
    setUserName(nome);
    //setUserRole(role);
    setIsModalOpen(false);

    // Armazene o nome e o tipo de usuário no localStorage
    localStorage.setItem("nome", nome);
    localStorage.setItem("role", role);

    // Console para verificar os dados salvos no localStorage
    console.log("Dados salvos no localStorage:", { nome, role });
  };

  const handlePerfilClick = () => {
    const role = localStorage.getItem("role"); // Aqui você recupera o tipo de usuário

    // Redireciona para o painel adequado com base no tipo de usuário
    if (role === "empresa") {
      navigate("/painelEmpresa");
    } else if (role === "reciclador") {
      navigate("/painelReciclador");
    } else {
      navigate("/painelPessoa"); // Ou outro painel de acordo com o papel do usuário
    }
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setUserName("");
    //setUserRole("");
    localStorage.removeItem("token");
    localStorage.removeItem("nome");
    localStorage.removeItem("role");
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
                <div key={path} className={`menu ${location.pathname === path ? "active" : ""}`} onClick={() => setMenuOpen(false)}>
                  <Link to={path}>{label}</Link>
                </div>
              ))}
          </div>

          <div id="loginRegister">
            {isLoggedIn ? (
              <div className="perfil-log">
                <div id="perfil" onClick={handlePerfilClick}>Olá, {userName}</div> {/* Nome ou nome fantasia */}
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

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
        {modalType === "login" ? <Login onLoginSuccess={handleLoginSuccess} /> : <Register />}
      </Modal>
    </>
  );
};

export default NavHeader;

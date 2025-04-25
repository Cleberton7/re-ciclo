// src/contexts/AuthContext.jsx
import React, { createContext, useState, useEffect } from "react";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userName, setUserName] = useState("");
  const [role, setRole] = useState("");

  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    const storedUserName = localStorage.getItem("nome");
    const storedRole = localStorage.getItem("role");

    if (storedToken && storedUserName && storedRole) {
      setIsLoggedIn(true);
      setUserName(storedUserName);
      setRole(storedRole);
    }
  }, []);

  const login = (nome, tipoUsuario, token) => {
    setIsLoggedIn(true);
    setUserName(nome);
    setRole(tipoUsuario);

    localStorage.setItem("token", token);
    localStorage.setItem("nome", nome);
    localStorage.setItem("role", tipoUsuario);
  };

  const logout = () => {
    setIsLoggedIn(false);
    setUserName("");
    setRole("");

    localStorage.removeItem("token");
    localStorage.removeItem("nome");
    localStorage.removeItem("role");
  };

  return (
    <AuthContext.Provider value={{ isLoggedIn, userName, role, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export { AuthContext }; // exporta o contexto para uso externo

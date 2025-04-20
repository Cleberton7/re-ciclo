import React from 'react';
import "../pages/styles/footer.css";
import "../pages/styles/containerPrincipal.css"
import { Link } from 'react-router-dom';


const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-content">
        <div className="footer-section">
          <h4>Contato</h4>
          <p>Email: re-cicletucurui@recicle.org.br</p>
          <p>Telefone: (94) 99246-8727</p>
        </div>

        <div className="footer-section">
          <h4>Links Úteis</h4>
          <Link to="/sobre">Sobre nós</Link>
          <Link to="/contatos">Contato  </Link>
        </div>

        <div className="footer-section">
          <h4>Redes Sociais</h4>
          <a href="https://instagram.com" target="_blank">Instagram</a>
          <a href="https://facebook.com" target="_blank">Facebook</a>
        </div>
      </div>

      <div className="footer-copy">
        © 2025 Projeto Re-cicle Tucuruí. Todos os direitos reservados.
      </div>
    </footer>

  );
};

export default Footer;

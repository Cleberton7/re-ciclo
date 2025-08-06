import React from 'react';
import { Link } from 'react-router-dom';
import { FaArrowLeft } from 'react-icons/fa';
import '../pages/styles/voltarLink.css';

const VoltarLink = ({ to = '/', children = 'Voltar' }) => {
  return (
    <Link to={to} className="voltar-link">
      <FaArrowLeft />
      {children}
    </Link>
  );
};

export default VoltarLink;

import React, { useEffect, useState } from 'react';
import { getEmpresasParceiras } from '../services/empresaParceiraService';
import { getCentrosReciclagem } from '../services/centroReciclagemService';
import "./styles/containerPrincipal.css";
import "./styles/dashboardEmpresa.css";

const Empresas = () => {
  const [empresas, setEmpresas] = useState([]);
  const [centros, setCentros] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const empresasData = await getEmpresasParceiras();
        const centrosData = await getCentrosReciclagem();
        setEmpresas(empresasData);
        setCentros(centrosData);
      } catch (error) {
        console.error("Erro ao buscar dados", error);
      }
    };
    fetchData();
  }, []);

  return (
    <div className='containerEmpresas'>
      <h1>Bem-vindo à tela de empresas</h1>

      <div className="secao">
        <h2>Empresas Parceiras</h2>
        <div className="cardsContainer">
          {empresas.map(empresa => (
            <div key={empresa._id} className="cardEmpresa">
              <h3>{empresa.nomeFantasia || empresa.nome}</h3>
              <p>Email: {empresa.email}</p>
              <p>Endereço: {empresa.endereco}</p>
              <p>CNPJ: {empresa.cnpj}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="secao">
        <h2>Centros de Reciclagem e Coletas</h2>
        <div className="cardsContainer">
          {centros.map(centro => (
            <div key={centro._id} className="cardEmpresa">
              <h3>{centro.nomeFantasia || centro.nome}</h3>
              <p>Email: {centro.email}</p>
              <p>Endereço: {centro.endereco}</p>
              <p>CNPJ: {centro.cnpj}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Empresas;

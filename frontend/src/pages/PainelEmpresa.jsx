import React, { useState } from "react";
import "./styles/painelEmpresa.css";

const PainelEmpresa = () => {
  const [residuos, setResiduos] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [novoResiduo, setNovoResiduo] = useState({
    tipo: "",
    quantidade: "",
    data: "",
    foto: null,
  });

  const adicionarResiduo = () => {
    setResiduos([...residuos, novoResiduo]);
    setNovoResiduo({ tipo: "", quantidade: "", data: "", foto: null });
    setShowModal(false);
  };

  return (
    <div className="painel-container">
      <h1>Dados da Empresa</h1>
      <form className="form-empresa">
        <input type="text" placeholder="Nome da Empresa" />
        <input type="text" placeholder="CNPJ" />
        <input type="text" placeholder="Endereço" />
        <input type="text" placeholder="Telefone" />
      </form>

      <h2>Resíduos Disponíveis para Coleta</h2>
      <button onClick={() => setShowModal(true)}>Adicionar Resíduo</button>

      <table className="tabela-residuos">
        <thead>
          <tr>
            <th>Tipo</th>
            <th>Quantidade</th>
            <th>Data</th>
          </tr>
        </thead>
        <tbody>
          {residuos.map((res, index) => (
            <tr key={index}>
              <td>{res.tipo}</td>
              <td>{res.quantidade}</td>
              <td>{res.data}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <button className="fechar-modal" onClick={() => setShowModal(false)}>×</button>
            <h3>Adicionar Resíduo</h3>
            <select
              value={novoResiduo.tipo}
              onChange={(e) => setNovoResiduo({ ...novoResiduo, tipo: e.target.value })}
            >
              <option value="">Selecione o tipo</option>
              <option value="Eletrônicos">Eletrônicos</option>
              <option value="Metais">Metais</option>
              <option value="Plásticos">Plásticos</option>
            </select>
            <input
              type="text"
              placeholder="Quantidade (kg/unidades)"
              value={novoResiduo.quantidade}
              onChange={(e) => setNovoResiduo({ ...novoResiduo, quantidade: e.target.value })}
            />
            <input
              type="date"
              value={novoResiduo.data}
              onChange={(e) => setNovoResiduo({ ...novoResiduo, data: e.target.value })}
            />
            <input
              type="file"
              onChange={(e) => setNovoResiduo({ ...novoResiduo, foto: e.target.files[0] })}
            />
            <button onClick={adicionarResiduo}>Solicitar Coleta</button>
          </div>

        </div>
      )}
    </div>
  );
};

export default PainelEmpresa;

import React, { useEffect, useState } from "react";
import PainelGenerico from "./PainelGenerico";
import CloseButton from "../components/CloseButton";
import "./styles/painelEmpresa.css";
import "./styles/containerPrincipal.css";
import {
  criarSolicitacaoColeta,
  getSolicitacoesColeta,
} from "../services/coletaService";

const PainelEmpresa = () => {
  const [residuos, setResiduos] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);

  const [novoResiduo, setNovoResiduo] = useState({
    tipoMaterial: "",
    quantidade: "",
    endereco: "",
    observacoes: "",
  });

  const carregarResiduos = async () => {
    try {
      const dados = await getSolicitacoesColeta();
      setResiduos(dados.data || dados);
    } catch (error) {
      console.error("Erro ao carregar resíduos:", error.message);
    }
  };

  useEffect(() => {
    carregarResiduos();
  }, []);

  const adicionarResiduo = async () => {
    setLoading(true);
    try {
      const dados = {
        tipoMaterial: novoResiduo.tipoMaterial,
        quantidade: Number(novoResiduo.quantidade),
        endereco: novoResiduo.endereco,
        observacoes: novoResiduo.observacoes,
      };

      await criarSolicitacaoColeta(dados);
      setNovoResiduo({
        tipoMaterial: "",
        quantidade: "",
        endereco: "",
        observacoes: "",
      });
      setShowModal(false);
      carregarResiduos();
    } catch (error) {
      alert("Erro ao adicionar resíduo: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const formularioInvalido =
    !novoResiduo.tipoMaterial ||
    !novoResiduo.quantidade ||
    !novoResiduo.endereco;

  return (
    <div id="containerPrincipal">
      <PainelGenerico tipoUsuario="empresa" />
      <div className="container-container">
        <h2>Resíduos Disponíveis para Coleta</h2>
        <button onClick={() => setShowModal(true)}>Adicionar Resíduo</button>

        <table className="tabela-residuos">
          <thead>
            <tr>
              <th>Tipo</th>
              <th>Quantidade</th>
              <th>Endereço</th>
              <th>Status</th>
              <th>Data Solicitação</th>
            </tr>
          </thead>
          <tbody>
            {residuos.length === 0 && (
              <tr>
                <td colSpan="5" style={{ textAlign: "center" }}>
                  Nenhum resíduo disponível
                </td>
              </tr>
            )}
            {residuos.map((res) => (
              <tr key={res._id}>
                <td>{res.tipoMaterial}</td>
                <td>{res.quantidade}</td>
                <td>{res.endereco}</td>
                <td>{res.status}</td>
                <td>
                  {res.createdAt
                    ? new Date(res.createdAt).toLocaleDateString()
                    : "-"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {showModal && (
          <div className="modal-overlay" onClick={() => setShowModal(false)}>
            <div className="modal" onClick={(e) => e.stopPropagation()}>
             <CloseButton onClose={() => setShowModal(false)} />
              <h3>Adicionar Resíduo</h3>
              <select
                value={novoResiduo.tipoMaterial}
                onChange={(e) =>
                  setNovoResiduo({
                    ...novoResiduo,
                    tipoMaterial: e.target.value,
                  })
                }
              >
                <option value="" disabled>
                  Selecione o tipo
                </option>
                <option value="eletrônicos">Eletrônicos</option>
                <option value="metais">Metais</option>
                <option value="plásticos">Plásticos</option>
              </select>
              <input
                type="number"
                placeholder="Quantidade (kg/unidades)"
                value={novoResiduo.quantidade}
                onChange={(e) =>
                  setNovoResiduo({
                    ...novoResiduo,
                    quantidade: e.target.value,
                  })
                }
              />
              <input
                type="text"
                placeholder="Endereço"
                value={novoResiduo.endereco}
                onChange={(e) =>
                  setNovoResiduo({
                    ...novoResiduo,
                    endereco: e.target.value,
                  })
                }
              />
              <textarea
                placeholder="Observações (opcional)"
                value={novoResiduo.observacoes}
                onChange={(e) =>
                  setNovoResiduo({
                    ...novoResiduo,
                    observacoes: e.target.value,
                  })
                }
                rows={3}
              />
              <button
                onClick={adicionarResiduo}
                disabled={formularioInvalido || loading}
              >
                {loading ? "Enviando..." : "Solicitar Coleta"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PainelEmpresa;

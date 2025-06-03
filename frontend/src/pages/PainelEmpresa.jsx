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
  const [imagem, setImagem] = useState(null);

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
      const formData = new FormData();
      formData.append("tipoMaterial", novoResiduo.tipoMaterial);
      formData.append("quantidade", novoResiduo.quantidade);
      formData.append("endereco", novoResiduo.endereco);
      formData.append("observacoes", novoResiduo.observacoes);
      if (imagem) {
        formData.append("imagem", imagem);
      }

      await criarSolicitacaoColeta(formData);
      setNovoResiduo({
        tipoMaterial: "",
        quantidade: "",
        endereco: "",
        observacoes: "",
      });
      setImagem(null);
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
              <th>Imagem</th>
            </tr>
          </thead>
          <tbody>
            {residuos.length === 0 && (
              <tr>
                <td colSpan="6" style={{ textAlign: "center" }}>
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
            <td>
              {res.imagem ? (
                <img
                  src={res.imagem}
                  alt={`Resíduo de ${res.tipoMaterial}`}
                  className="imagem-residuo"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = "/imagem-padrao.jpg";
                  }}
                />
              ) : (
                <span className="sem-imagem">-</span>
              )}
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

              <label>Tipo de Material:</label>
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

              <label>Quantidade:</label>
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

              <label>Endereço:</label>
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

              <label>Observações:</label>
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

              <label>Imagem:</label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setImagem(e.target.files[0])}
                name="imagem" // Campo deve ser "imagem" (igual ao backend)
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

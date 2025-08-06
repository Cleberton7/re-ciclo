import React, { useEffect, useState } from "react";
import PainelGenerico from "../components/PainelGenerico/PainelGenerico";
import Modal from "../components/Modal";
import { ClipLoader } from "react-spinners";
import {
  criarSolicitacaoColeta,
  getSolicitacoesColetaPessoa,
  deletarSolicitacaoColeta
} from "../services/coletaService";

const PainelPessoa = () => {
  const [residuos, setResiduos] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [globalLoading, setGlobalLoading] = useState(false);
  const [novoResiduo, setNovoResiduo] = useState({
    tipoMaterial: "eletronicos",
    quantidade: "",
    endereco: "",
    observacoes: "",
  });

  const carregarResiduos = async () => {
    setGlobalLoading(true);
    try {
      const dados = await getSolicitacoesColetaPessoa();
      const sorted = dados.sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
      );
      setResiduos(sorted);
    } catch (error) {
      console.error("Erro ao carregar resíduos:", error.message);
    } finally {
      setGlobalLoading(false);
    }
  };

  useEffect(() => {
    carregarResiduos();
  }, []);

  const resetForm = () => {
    setNovoResiduo({
      tipoMaterial: "eletronicos",
      quantidade: "",
      endereco: "",
      observacoes: "",
    });
  };

  const adicionarResiduo = async () => {
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("tipoMaterial", novoResiduo.tipoMaterial);
      formData.append("quantidade", novoResiduo.quantidade);
      formData.append("endereco", novoResiduo.endereco);
      formData.append("observacoes", novoResiduo.observacoes || "");
      formData.append("privacidade", "privada");

      const response = await criarSolicitacaoColeta(formData);
      if (response.success) {
        resetForm();
        setShowModal(false);
        await carregarResiduos();
      } else {
        throw new Error(response.message || "Erro ao criar solicitação");
      }
    } catch (error) {
      alert(`Erro ao adicionar: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };
  const cancelarSolicitacao = async (id) => {
    const confirmacao = window.confirm("Tem certeza que deseja cancelar esta solicitação?");
    if (!confirmacao) return;

    setGlobalLoading(true);
    try {
      await deletarSolicitacaoColeta(id);
      await carregarResiduos();
    } catch (error) {
      alert(`Erro ao cancelar solicitação: ${error.message}`);
    } finally {
      setGlobalLoading(false);
    }
  };
  const formularioInvalido =
    !novoResiduo.tipoMaterial || !novoResiduo.quantidade || !novoResiduo.endereco;;

  return (
    <div id="containerPrincipal">
      <PainelGenerico tipoUsuario="pessoa" />

      <div className="container-container">
        <h2>Meus Resíduos</h2>

        <button onClick={() => setShowModal(true)} className="btn-adicionar">
          Informar Resíduo
        </button>

        {globalLoading ? (
          <div className="loading-table">
            <ClipLoader color="#009951" size={30} />
            <p>Carregando resíduos...</p>
          </div>
        ) : (
          <table className="tabela-residuos">
            <thead>
              <tr>
                <th>Tipo</th>
                <th>Quantidade</th>
                <th>Observações</th>
                <th>Status</th>
                <th>Data</th>
                <th>Ações</th> 
              </tr>
            </thead>
            <tbody>
              {residuos.length === 0 ? (
                <tr>
                  <td colSpan="5" className="nenhum-residuo">
                    Nenhum resíduo informado
                  </td>
                </tr>
              ) : (
                residuos.map((res) => (
                  <tr key={res._id}>
                    <td>{res.tipoMaterial}</td>
                    <td>{res.quantidade} kg</td>
                    <td>{res.observacoes || "-"}</td>
                    <td>
                      <span className={`status-badge ${res.status}`}>
                        {res.status}
                      </span>
                    </td>
                    <td>{new Date(res.createdAt).toLocaleDateString("pt-BR")}</td>
                    <td>
                      {res.status === "pendente" && (
                        <button
                          onClick={() => cancelarSolicitacao(res._id)}
                          className="btn-cancelar"
                          disabled={globalLoading}
                        >
                          Cancelar
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </div>

      <Modal
        isOpen={showModal}
        onClose={() => !loading && setShowModal(false)}
        size="form-coleta"
      >
        <div className="form-modal-content text-white">
          <h3 className="text-xl font-semibold mb-4">Informar Resíduo</h3>

          <label className="block mb-1">Tipo de Material:</label>
          <select
            value={novoResiduo.tipoMaterial}
            onChange={(e) =>
              setNovoResiduo({ ...novoResiduo, tipoMaterial: e.target.value })
            }
            disabled={loading}
            className="w-full p-2 rounded text-black mb-3"
          >
            <option value="eletronicos">Eletrônicos</option>
            <option value="outros">Outros</option>
          </select>

          <label className="block mb-1">Quantidade (kg):</label>
          <input
            type="number"
            placeholder="Quantidade estimada"
            value={novoResiduo.quantidade}
            onChange={(e) =>
              setNovoResiduo({ ...novoResiduo, quantidade: e.target.value })
            }
            disabled={loading}
            min="1"
            className="w-full p-2 rounded text-black mb-3"
          />
          <label className="block mb-1">Endereço:</label>
          <input
            type="text"
            placeholder="Endereço para coleta"
            value={novoResiduo.endereco}
            onChange={(e) =>
              setNovoResiduo({ ...novoResiduo, endereco: e.target.value })
            }
            disabled={loading}
            className="w-full p-2 rounded text-black mb-3"
          />

          <label className="block mb-1">Observações:</label>
          <textarea
            placeholder="Ex: Precisa agendar horário"
            value={novoResiduo.observacoes}
            onChange={(e) =>
              setNovoResiduo({ ...novoResiduo, observacoes: e.target.value })
            }
            rows={3}
            disabled={loading}
            className="w-full p-2 rounded text-black mb-4"
          />

          <button
            onClick={adicionarResiduo}
            disabled={formularioInvalido || loading}
            className="btn-enviar"
          >
            {loading ? "Enviando..." : "Informar Resíduo"}
          </button>
        </div>
      </Modal>
    </div>
  );
};

export default PainelPessoa;

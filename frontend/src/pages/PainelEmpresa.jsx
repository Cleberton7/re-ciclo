import React, { useEffect, useState } from "react";
import { ClipLoader } from "react-spinners";
import PainelGenerico from "./PainelGenerico";
import Modal from "../components/Modal";
import "./styles/painelEmpresa.css";
import "./styles/containerPrincipal.css";
import {
  criarSolicitacaoColeta,
  getSolicitacoesColeta,
  atualizarSolicitacaoColeta,
  deletarSolicitacaoColeta,
} from "../services/coletaService";

const PainelEmpresa = () => {
  const [residuos, setResiduos] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [imagem, setImagem] = useState(null);
  const [globalLoading, setGlobalLoading] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  const [novoResiduo, setNovoResiduo] = useState({
    tipoMaterial: "eletronicos", 
    outros: "", 
    quantidade: "",
    endereco: "",
    observacoes: "",
  });

  // Função para formatar o tipoMaterial exibido
  const formatarTipoMaterial = (tipo, outros) => {
    if (!tipo) return "Desconhecido";

    const tipoLimpo = tipo.split("//")[0].trim().toLowerCase();

    if (tipoLimpo === "outros" && outros) {
      return `Outros (${outros})`;
    }

    switch (tipoLimpo) {
      case "eletronicos":
      case "eletrônicos":
        return "Eletrônicos";
      case "metais":
        return "Metais";
      case "plasticos":
      case "plásticos":
        return "Plásticos";
      case "outros":
        return "Outros";
      default:
        return tipoLimpo.charAt(0).toUpperCase() + tipoLimpo.slice(1);
    }
  };

  const carregarResiduos = async () => {
    setGlobalLoading(true);
    try {
      const dados = await getSolicitacoesColeta();
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

  const adicionarResiduo = async () => {
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("tipoMaterial", novoResiduo.tipoMaterial);
      if (novoResiduo.tipoMaterial === "outros" && novoResiduo.outros) {
        formData.append("outros", novoResiduo.outros);
      }
      formData.append("quantidade", novoResiduo.quantidade);
      formData.append("endereco", novoResiduo.endereco);
      formData.append("observacoes", novoResiduo.observacoes || "");
      if (imagem) {
        formData.append("imagem", imagem);
      }
      formData.append("privacidade", "publica");

      const response = await criarSolicitacaoColeta(formData);
      if (response.success) {
        resetForm();
        setShowModal(false);
        await carregarResiduos();
      } else {
        throw new Error(response.message || "Erro ao criar solicitação");
      }
    } catch (error) {
      console.error("Erro:", error);
      alert(`Erro ao adicionar: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const editarResiduo = (residuo) => {
    setEditingId(residuo._id);
    setEditMode(true);
    setNovoResiduo({
      tipoMaterial: residuo.tipoMaterial,
      quantidade: residuo.quantidade,
      endereco: residuo.endereco,
      observacoes: residuo.observacoes || "",
      outros: residuo.outros || ""
    });
    setImagem(residuo.imagem || null);
    setShowModal(true);
  };

  const atualizarResiduo = async () => {
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("tipoMaterial", novoResiduo.tipoMaterial);
      if (novoResiduo.tipoMaterial === "outros" && novoResiduo.outros) {
        formData.append("outros", novoResiduo.outros);
      }
      formData.append("quantidade", novoResiduo.quantidade);
      formData.append("endereco", novoResiduo.endereco);
      formData.append("observacoes", novoResiduo.observacoes);
      if (imagem instanceof File) formData.append("imagem", imagem);

      await atualizarSolicitacaoColeta(editingId, formData);
      resetForm();
      setShowModal(false);
      setEditingId(null);
      setEditMode(false);
      await carregarResiduos();
    } catch (error) {
      alert(`Erro ao atualizar: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleDeletarResiduo = async (id) => {
    const confirmacao = window.confirm(
      "Tem certeza que deseja excluir esta solicitação?"
    );
    if (!confirmacao) return;

    setDeletingId(id);
    try {
      await deletarSolicitacaoColeta(id);
      await carregarResiduos();
    } catch (error) {
      alert(error.message);
    } finally {
      setDeletingId(null);
    }
  };

  const resetForm = () => {
    setNovoResiduo({
      tipoMaterial: "eletronicos",
      outros: "",
      quantidade: "",
      endereco: "",
      observacoes: "",
    });
    setImagem(null);
  };

  const cancelarEdicao = () => {
    resetForm();
    setShowModal(false);
    setEditingId(null);
    setEditMode(false);
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
        <button
          onClick={() => {
            setEditMode(false);
            setShowModal(true);
          }}
          className="btn-adicionar"
        >
          Adicionar Resíduo
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
                <th>Endereço</th>
                <th>Status</th>
                <th>Data</th>
                <th>Imagem</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {residuos.length === 0 ? (
                <tr>
                  <td colSpan="7" className="nenhum-residuo">
                    Nenhum resíduo disponível
                  </td>
                </tr>
              ) : (
                residuos.map((res) => (
                  <tr key={res._id}>
                    <td>{formatarTipoMaterial(res.tipoMaterial, res.outros)}</td>
                    <td>{res.quantidade} kg</td>
                    <td>{res.endereco}</td>
                    <td>
                      <span className={`status-badge ${res.status}`}>
                        {res.status}
                      </span>
                    </td>
                    <td>{new Date(res.createdAt).toLocaleDateString("pt-BR")}</td>
                    <td>
                      <div className="imagem-container">
                        {res.imagem ? (
                          <img
                            src={res.imagem}
                            alt={`Resíduo de ${res.tipoMaterial}`}
                            className="imagem-residuo"
                          />
                        ) : (
                          <span className="sem-imagem">-</span>
                        )}
                      </div>
                    </td>
                    <td>
                      <div className="acoes-container">
                        {res.status === "pendente" && (
                          <>
                            <button
                              onClick={() => editarResiduo(res)}
                              className="btn-editar"
                              title="Editar solicitação"
                              disabled={!!deletingId}
                            >
                              Editar
                            </button>
                            <button
                              onClick={() => handleDeletarResiduo(res._id)}
                              className="btn-deletar"
                              title="Excluir solicitação"
                              disabled={!!deletingId}
                            >
                              {deletingId === res._id ? (
                                <ClipLoader color="#fff" size={14} />
                              ) : (
                                "Excluir"
                              )}
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
        <Modal
          isOpen={showModal}
          onClose={() => !loading && cancelarEdicao()}
          size="form-coleta"
        >
          <div className="form-modal-content">
            <h3>{editMode ? "Editar Resíduo" : "Adicionar Resíduo"}</h3>

            <label>Tipo de Material:</label>
            <select
              value={novoResiduo.tipoMaterial}
              onChange={(e) =>
                setNovoResiduo({ ...novoResiduo, tipoMaterial: e.target.value })
              }
              disabled={loading}
            >
              <option value="eletronicos">Eletrônicos</option>
              <option value="outros">Outros</option>
            </select>

            {/* Campo "Especificar" (aparece apenas se "Outros" for selecionado) */}
            {novoResiduo.tipoMaterial === "outros" && (
              <div className="outros-container">
                <label>Especificar (opcional):</label>
                <input
                  type="text"
                  placeholder="Ex: Baterias, Cabos, etc."
                  value={novoResiduo.outros}
                  onChange={(e) =>
                    setNovoResiduo({ ...novoResiduo, outros: e.target.value })
                  }
                  disabled={loading}
                />
              </div>
            )}

            <label>Quantidade (kg):</label>
            <input
              type="number"
              placeholder="Quantidade em kg"
              value={novoResiduo.quantidade}
              onChange={(e) =>
                setNovoResiduo({ ...novoResiduo, quantidade: e.target.value })
              }
              disabled={loading}
              min="1"
            />

            <label>Endereço:</label>
            <input
              type="text"
              placeholder="Endereço completo"
              value={novoResiduo.endereco}
              onChange={(e) =>
                setNovoResiduo({ ...novoResiduo, endereco: e.target.value })
              }
              disabled={loading}
            />

            <label>Observações:</label>
            <textarea
              placeholder="Detalhes adicionais (opcional)"
              value={novoResiduo.observacoes}
              onChange={(e) =>
                setNovoResiduo({ ...novoResiduo, observacoes: e.target.value })
              }
              rows={3}
              disabled={loading}
            />

            <label>Imagem (opcional):</label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files[0];
                if (file && file.size > 5 * 1024 * 1024) {
                  alert("A imagem deve ser menor que 5MB");
                  return;
                }
                setImagem(file);
              }}
              name="imagem"
              disabled={loading}
            />

            {imagem && (
              <div className="image-preview">
                <img
                  src={imagem instanceof File ? URL.createObjectURL(imagem) : imagem}
                  alt="Preview"
                  className="preview-image"
                />
                <button type="button" onClick={() => setImagem(null)} disabled={loading}>
                  Remover
                </button>
              </div>
            )}

            <button
              onClick={editMode ? atualizarResiduo : adicionarResiduo}
              disabled={formularioInvalido || loading}
              className="btn-enviar"
            >
              {loading ? "Enviando..." : editMode ? "Atualizar Solicitação" : "Solicitar Coleta"}
            </button>
          </div>
        </Modal>

        {deletingId && (
          <div className="overlay-loading">
            <ClipLoader color="#dc3545" size={30} />
            <p>Excluindo solicitação...</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PainelEmpresa;

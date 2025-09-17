import React, { useEffect, useState } from "react";
import { ClipLoader } from "react-spinners";
import PainelGenerico from "../components/PainelGenerico/PainelGenerico";
import Modal from "../components/Modal";
import ComprovanteColeta from "../components/ComprovanteColeta";
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
  const [globalLoading, setGlobalLoading] = useState(false);
  const [imagem, setImagem] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [comprovanteVisivel, setComprovanteVisivel] = useState(false);
  const [residuoSelecionado, setResiduoSelecionado] = useState(null);

  const [novoResiduo, setNovoResiduo] = useState({
    tipoMaterial: "telefonia",
    outros: "",
    quantidade: "",
    endereco: "",
    observacoes: "",
  });

  // Função para formatar o tipoMaterial
  const formatarTipoMaterial = (tipo, outros) => {
    if (!tipo) return "Desconhecido";
    const tipoLimpo = tipo.split("//")[0].trim().toLowerCase();
    if (tipoLimpo === "outros" && outros) return `Outros (${outros})`;

    switch (tipoLimpo) {
      case "telefonia":
        return "Telefonia e Acessórios";
      case "informatica":
        return "Informática";
      case "eletrodomesticos":
        return "Eletrodomésticos";
      case "pilhas_baterias":
        return "Pilhas e Baterias";
      case "outros":
        return "Outros Eletroeletrônicos";
      default:
        return tipoLimpo.charAt(0).toUpperCase() + tipoLimpo.slice(1);
    }
  };

  // Formata código de rastreamento
  const formatarCodigoRastreamento = (codigo) => {
    if (!codigo) return "-";
    return `${codigo.slice(0, 4)}.${codigo.slice(4, 6)}.${codigo.slice(6, 8)}-${codigo.slice(9)}`;
  };

  // Carregar resíduos
  const carregarResiduos = async () => {
    setGlobalLoading(true);
    try {
      const dados = await getSolicitacoesColeta();
      setResiduos(dados.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
    } catch (error) {
      console.error("Erro ao carregar resíduos:", error.message);
    } finally {
      setGlobalLoading(false);
    }
  };

  useEffect(() => {
    carregarResiduos();
  }, []);

  // Adicionar resíduo
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
      if (imagem) formData.append("imagem", imagem);
      formData.append("privacidade", "publica");

      const response = await criarSolicitacaoColeta(formData);
      if (response.success) {
        resetForm();
        setShowModal(false);
        await carregarResiduos();
        alert(
          response.data?.codigoRastreamento
            ? `Solicitação criada! Código: ${formatarCodigoRastreamento(response.data.codigoRastreamento)}`
            : "Solicitação criada com sucesso!"
        );
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

  // Editar resíduo
  const editarResiduo = (residuo) => {
    if (residuo.status !== "pendente") return;
    setEditingId(residuo._id);
    setEditMode(true);
    setNovoResiduo({
      tipoMaterial: residuo.tipoMaterial,
      quantidade: residuo.quantidade,
      endereco: residuo.endereco,
      observacoes: residuo.observacoes || "",
      outros: residuo.outros || "",
    });
    setImagem(residuo.imagem || null);
    setShowModal(true);
  };

  // Atualizar resíduo
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

  // Deletar/cancelar resíduo
  const handleDeletarResiduo = async (id) => {
    if (!window.confirm("Tem certeza que deseja cancelar esta solicitação?")) return;
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
    setNovoResiduo({ tipoMaterial: "telefonia", outros: "", quantidade: "", endereco: "", observacoes: "" });
    setImagem(null);
  };

  const cancelarEdicao = () => {
    resetForm();
    setShowModal(false);
    setEditingId(null);
    setEditMode(false);
  };

  const visualizarComprovante = (residuo) => {
    setResiduoSelecionado(residuo);
    setComprovanteVisivel(true);
  };

  const formularioInvalido = !novoResiduo.tipoMaterial || !novoResiduo.quantidade || !novoResiduo.endereco;
  return (
    <div id="containerPrincipal">
      <PainelGenerico tipoUsuario="empresa" />
      <div className="container-container">
        <h2>Resíduos Disponíveis para Coleta</h2>
        <button onClick={() => { setEditMode(false); setShowModal(true); }} className="btn-adicionar">
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
                <th>Cod</th>
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
                <tr><td colSpan="8" className="nenhum-residuo">Nenhum resíduo disponível</td></tr>
              ) : (
                residuos.map((res) => (
                  <tr key={res._id}>
                    <td className="codigo-rastreamento">{formatarCodigoRastreamento(res.codigoRastreamento)}</td>
                    <td>{formatarTipoMaterial(res.tipoMaterial, res.outros)}</td>
                    <td>{res.quantidade} kg</td>
                    <td>{res.endereco}</td>
                    <td>
                      <span className={`status-badge ${res.status}`}>
                        {res.status.charAt(0).toUpperCase() + res.status.slice(1)}
                      </span>
                    </td>
                    <td>{new Date(res.createdAt).toLocaleDateString("pt-BR")}</td>
                    <td>
                      <div className="imagem-container">
                        {res.imagem ? <img src={res.imagem} alt={`Resíduo ${res.tipoMaterial}`} className="imagem-residuo"/> : <span className="sem-imagem">-</span>}
                      </div>
                    </td>
                    <td>
                      <div className="acoes-container">
                        <button onClick={() => visualizarComprovante(res)} className="btn-comprovante" title="Ver comprovante">Comprovante</button>

                        {res.status === "pendente" && (
                          <>
                            <button onClick={() => editarResiduo(res)} className="btn-editar" disabled={!!deletingId}>Editar</button>
                            <button onClick={() => handleDeletarResiduo(res._id)} className="btn-deletar" disabled={!!deletingId}>
                              {deletingId === res._id ? <ClipLoader color="#fff" size={14}/> : "Cancelar"}
                            </button>
                          </>
                        )}

                        {["aceita","retirada","concluída","cancelada"].includes(res.status) && (
                          <span className="info-status">Nenhuma ação disponível</span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}

        {/* Modal adicionar/editar */}
        <Modal isOpen={showModal} onClose={() => !loading && cancelarEdicao()} size="form-coleta">
          <div className="form-modal-content">
            <h3>{editMode ? "Editar Resíduo" : "Adicionar Resíduo"}</h3>

            <label>Tipo de Material:</label>
            <select value={novoResiduo.tipoMaterial} onChange={(e) => setNovoResiduo({ ...novoResiduo, tipoMaterial: e.target.value })} disabled={loading}>
              <option value="telefonia">Telefonia e Acessórios</option>
              <option value="informatica">Informática</option>
              <option value="eletrodomesticos">Eletrodomésticos</option>
              <option value="pilhas_baterias">Pilhas e Baterias</option>
              <option value="outros">Outros Eletroeletrônicos</option>
            </select>

            {novoResiduo.tipoMaterial === "outros" && (
              <div className="outros-container">
                <label>Especificar (opcional):</label>
                <input type="text" placeholder="Ex: Câmeras, Brinquedos eletrônicos" value={novoResiduo.outros} onChange={(e) => setNovoResiduo({ ...novoResiduo, outros: e.target.value })} disabled={loading}/>
              </div>
            )}

            <label>Quantidade (kg):</label>
            <input type="number" placeholder="Quantidade em kg" value={novoResiduo.quantidade} onChange={(e) => setNovoResiduo({ ...novoResiduo, quantidade: e.target.value })} disabled={loading} min="1"/>

            <label>Endereço:</label>
            <input type="text" placeholder="Endereço completo" value={novoResiduo.endereco} onChange={(e) => setNovoResiduo({ ...novoResiduo, endereco: e.target.value })} disabled={loading}/>

            <label>Observações:</label>
            <textarea placeholder="Detalhes adicionais (opcional)" value={novoResiduo.observacoes} onChange={(e) => setNovoResiduo({ ...novoResiduo, observacoes: e.target.value })} rows={3} disabled={loading}/>

            <label>Imagem (opcional):</label>
            <input type="file" accept="image/*" onChange={(e) => {
              const file = e.target.files[0];
              if (file && file.size > 5 * 1024 * 1024) { alert("A imagem deve ser menor que 5MB"); return; }
              setImagem(file);
            }} disabled={loading}/>

            {imagem && (
              <div className="image-preview">
                <img src={imagem instanceof File ? URL.createObjectURL(imagem) : imagem} alt="Preview" className="preview-image"/>
                <button type="button" onClick={() => setImagem(null)} disabled={loading}>Remover</button>
              </div>
            )}

            <button onClick={editMode ? atualizarResiduo : adicionarResiduo} disabled={formularioInvalido || loading} className="btn-enviar">
              {loading ? "Enviando..." : editMode ? "Atualizar Solicitação" : "Solicitar Coleta"}
            </button>
          </div>
        </Modal>

        {/* Modal comprovante */}
        <Modal isOpen={comprovanteVisivel} onClose={() => setComprovanteVisivel(false)} size="comprovante">
          {residuoSelecionado && (
            <ComprovanteColeta 
              residuo={residuoSelecionado} 
              onClose={() => setComprovanteVisivel(false)}
              formatarTipoMaterial={formatarTipoMaterial}
              formatarCodigoRastreamento={formatarCodigoRastreamento}
            />
          )}
        </Modal>

        {deletingId && (
          <div className="overlay-loading">
            <ClipLoader color="#dc3545" size={30} />
            <p>Cancelando solicitação...</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PainelEmpresa;

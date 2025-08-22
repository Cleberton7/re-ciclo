import React, { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import authService from "../services/authService";

const DefinirSenhaPrimeiroAcessoPage = () => {
  const [senha, setSenha] = useState("");
  const [confirmSenha, setConfirmSenha] = useState("");
  const [erro, setErro] = useState("");
  const [sucesso, setSucesso] = useState("");
  const [tipoUsuario, setTipoUsuario] = useState(""); // empresa ou centro
  const [loading, setLoading] = useState(true);

  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get("token");

  useEffect(() => {
    if (!token) {
      setErro("Token não fornecido.");
      setLoading(false);
      return;
    }

    // Consultar backend para pegar tipo de usuário
    const fetchTipoUsuario = async () => {
      try {
        const response = await authService.verifyToken({ token });
        if (response.user) {
          setTipoUsuario(response.user.tipoUsuario); 
        }
      } catch (err) {
        setErro("Token inválido ou expirado.");
      } finally {
        setLoading(false);
      }
    };

    fetchTipoUsuario();
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErro("");
    if (senha !== confirmSenha) {
      setErro("As senhas não coincidem.");
      return;
    }

    try {
      await authService.resetPassword(token, senha);
      setSucesso("Senha criada com sucesso! Você será redirecionado para login...");
      setTimeout(() => navigate("/login"), 3000);
    } catch (err) {
      setErro(err.response?.data?.mensagem || "Erro ao criar senha.");
    }
  };

  if (loading) return <p>Carregando...</p>;

  return (
    <div className="max-w-md mx-auto mt-16 p-6 border rounded shadow">
      <h1 className="text-2xl font-bold mb-4">
        Criar senha para {tipoUsuario === "empresa" ? "Empresa" : tipoUsuario === "centro" ? "Centro" : "usuário"}
      </h1>

      {erro && <p className="text-red-500 mb-4">{erro}</p>}
      {sucesso && <p className="text-green-500 mb-4">{sucesso}</p>}

      {!sucesso && (
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <input
            type="password"
            placeholder="Nova senha"
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
            required
            className="p-2 border rounded"
          />
          <input
            type="password"
            placeholder="Confirme a senha"
            value={confirmSenha}
            onChange={(e) => setConfirmSenha(e.target.value)}
            required
            className="p-2 border rounded"
          />
          <button
            type="submit"
            className="bg-green-600 text-white p-2 rounded hover:bg-green-700"
          >
            Criar senha
          </button>
        </form>
      )}
    </div>
  );
};

export default DefinirSenhaPrimeiroAcessoPage;

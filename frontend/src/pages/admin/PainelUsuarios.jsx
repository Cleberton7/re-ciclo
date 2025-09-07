import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Modal from '../../components/Modal';
import EditarUsuarioForm from './EditarUsuarioForm';
import { getTodosUsuarios } from '../../services/usersServices';
import { FaMapMarkerAlt } from "react-icons/fa";
import avatar from '../../image/avatar.png';

const PainelUsuarios = () => {
  const [usuarios, setUsuarios] = useState([]);
  const [usuarioSelecionado, setUsuarioSelecionado] = useState(null);
  const [modalAberto, setModalAberto] = useState(false);

  useEffect(() => {
    buscarUsuarios();
  }, []);

  const buscarUsuarios = async () => {
    try {
      const data = await getTodosUsuarios();
      setUsuarios(data);
    } catch (error) {
      console.error('Erro ao buscar usuários:', error);
    }
  };

  const handleEditar = (usuario) => {
    setUsuarioSelecionado(usuario);
    setModalAberto(true);
  };

  const handleDeletar = async (id) => {
    if (window.confirm("Tem certeza que deseja excluir este usuário?")) {
      try {
        await axios.delete(`/api/usuarios/${id}`);
        buscarUsuarios();
      } catch (error) {
        console.error('Erro ao excluir usuário:', error);
      }
    }
  };

  const handleFecharModal = () => {
    setModalAberto(false);
    setUsuarioSelecionado(null);
  };

  const getImagemUsuario = (imagemPerfil) => {
    if (!imagemPerfil) {
      console.log('Sem imagem de perfil, usando avatar padrão');
      return avatar;
    }
    
    // Verifica se a imagem já é uma URL completa
    if (imagemPerfil.startsWith('http')) {
      console.log('URL completa:', imagemPerfil);
      return imagemPerfil;
    }
    
    // Remove barras invertidas extras que podem vir do backend
    const caminhoNormalizado = imagemPerfil.replace(/\\/g, '/');
    
    // Se a VITE_API_URL já inclui /api, não precisamos adicionar novamente
    // Vamos usar o caminho diretamente sem adicionar /api/
    const urlFinal = `${import.meta.env.VITE_API_URL}/${caminhoNormalizado}`;
    
    console.log('Tentando carregar imagem:', urlFinal);
    return urlFinal;
  };

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-8 text-green-800 text-center">
        Gerenciar Usuários
      </h1>

      <div className="overflow-x-auto shadow-md rounded-lg">
        <table className="w-full text-sm text-left">
          <thead className="bg-green-700 text-white">
            <tr>
              <th className="p-4">Imagem</th>
              <th className="p-4">Tipo</th>
              <th className="p-4">Nome/Razão</th>
              <th className="p-4">Email</th>
              <th className="p-4">Telefone</th>
              <th className="p-4 text-center">Localização</th>
              <th className="p-4 text-center">Ações</th>
            </tr>
          </thead>
          <tbody>
            {usuarios.map((usuario) => (
              <tr key={usuario._id} className="border-b hover:bg-green-50">
                <td className="p-4">
                  <img
                    src={getImagemUsuario(usuario.imagemPerfil)}
                    alt="Perfil"
                    className="w-12 h-12 rounded-full object-cover border border-gray-300"
                    onError={(e) => {
                      if (e.currentTarget.src !== avatar) {
                        console.warn(
                          "Erro ao carregar imagem do usuário, usando avatar:",
                          usuario.imagemPerfil,
                          "URL tentada:",
                          e.currentTarget.src
                        );
                        e.currentTarget.src = avatar;
                      }
                    }}
                  />
                </td>
                <td className="p-4">{usuario.tipoUsuario}</td>
                <td className="p-4">
                  {usuario.razaoSocial || usuario.nomeFantasia || usuario.nome}
                </td>
                <td className="p-4">{usuario.email}</td>
                <td className="p-4">{usuario.telefone}</td>
                <td className="p-4 text-center">
                  {usuario.localizacao?.lat && usuario.localizacao?.lng ? (
                    <a
                      href={`https://www.google.com/maps?q=${usuario.localizacao.lat},${usuario.localizacao.lng}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-green-700 hover:text-green-900"
                      title="Ver no mapa"
                    >
                      <FaMapMarkerAlt size={20} />
                    </a>
                  ) : (
                    <span className="text-gray-400 italic">Não informado</span>
                  )}
                </td>
                <td className="p-4 flex gap-2 justify-center">
                  <button
                    className="bg-yellow-500 text-white px-3 py-1 rounded hover:bg-yellow-600"
                    onClick={() => handleEditar(usuario)}
                  >
                    Editar
                  </button>
                  <button
                    className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700"
                    onClick={() => handleDeletar(usuario._id)}
                  >
                    Excluir
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Modal isOpen={modalAberto} onClose={handleFecharModal} size="large">
        {usuarioSelecionado && (
          <EditarUsuarioForm
            usuario={usuarioSelecionado}
            onClose={handleFecharModal}
            onAtualizar={buscarUsuarios}
          />
        )}
      </Modal>
    </div>
  );
};

export default PainelUsuarios;
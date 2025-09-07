import React, { useEffect, useState } from 'react';
import axios from 'axios';

const EditarUsuarioForm = ({ usuario, onClose, onAtualizar }) => {
  const [form, setForm] = useState({
    nome: '',
    razaoSocial: '',
    nomeFantasia: '',
    email: '',
    telefone: '',
    senha: '',
    cnpj: '',
    cpf: '',
    
  });

  useEffect(() => {
    if (usuario) {
      setForm({
        nome: usuario.nome || '',
        razaoSocial: usuario.razaoSocial || '',
        nomeFantasia: usuario.nomeFantasia || '',
        email: usuario.email || '',
        telefone: usuario.telefone || '',
        senha: '',
        cnpj: usuario.cnpj || '',
        cpf: usuario.cpf || '',
     
      });
    }
  }, [usuario]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const dadosAtualizados = { ...form };
      if (!dadosAtualizados.senha) delete dadosAtualizados.senha;

      await axios.put(`/api/usuarios/${usuario._id}`, dadosAtualizados);
      onAtualizar();
      onClose();
    } catch (error) {
      console.error('Erro ao atualizar usuário:', error);
    }
  };

  const renderCamposEspecificos = () => {
    switch (usuario.tipoUsuario) {
      case 'empresa':
        return (
          <>
            <Input label="Razão Social" name="razaoSocial" value={form.razaoSocial} onChange={handleChange} />
            <Input label="Nome Fantasia" name="nomeFantasia" value={form.nomeFantasia} onChange={handleChange} />
            <Input label="CNPJ" name="cnpj" value={form.cnpj} onChange={handleChange} />
          </>
        );
      case 'centro':
        return (
          <>
            <Input label="Nome Fantasia" name="nomeFantasia" value={form.nomeFantasia} onChange={handleChange} />
            <Input label="CNPJ" name="cnpj" value={form.cnpj} onChange={handleChange} />
          </>
        );
      case 'pessoa':
        return <Input label="CPF" name="cpf" value={form.cpf} onChange={handleChange} />;
      default:
        return null;
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 p-4 bg-white rounded shadow-md">
      {renderCamposEspecificos()}
      {usuario.tipoUsuario === 'pessoa' && (
        <Input label="Nome" name="nome" value={form.nome} onChange={handleChange} />
      )}
      <Input label="Email" name="email" value={form.email} onChange={handleChange} />
      <Input label="Telefone" name="telefone" value={form.telefone} onChange={handleChange} />
      <Input label="Senha (opcional)" name="senha" value={form.senha} onChange={handleChange} type="password" />

      <div className="flex justify-end gap-4 pt-4">
        <button
          type="button"
          onClick={onClose}
          className="bg-gray-300 text-gray-800 px-4 py-2 rounded hover:bg-gray-400"
        >
          Cancelar
        </button>
        <button
          type="submit"
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
        >
          Salvar
        </button>
      </div>
    </form>
  );
};

const Input = ({ label, name, value, onChange, type = 'text' }) => (
  <div>
    <label className="block text-gray-700 mb-1">{label}</label>
    <input
      type={type}
      name={name}
      value={value}
      onChange={onChange}
      className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-green-500"
    />
  </div>
);

export default EditarUsuarioForm;

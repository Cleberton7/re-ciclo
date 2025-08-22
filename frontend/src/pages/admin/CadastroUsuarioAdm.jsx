import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { registerUser } from '../../services/authService';
import { IMaskInput } from 'react-imask';
import '../../pages/styles/register.css';
import VoltarLink from '../../components/VoltarLink';

const CadastroUsuarioAdm = () => {
  const navigate = useNavigate();
  const [userType, setUserType] = useState('empresa');
  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    senha: '',
    confirmarSenha: '',
    cpf: '',
    telefone: '',
    endereco: '',
    nomeFantasia: '',
    razaoSocial: '',
    cnpj: '',
    tipoUsuario: 'empresa'
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleAccept = (value, name) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    if (formData.senha !== formData.confirmarSenha) {
      setError('As senhas não coincidem');
      setLoading(false);
      return;
    }

    try {
      const userData = {
        email: formData.email,
        senha: formData.senha,
        telefone: formData.telefone,
        endereco: formData.endereco,
        tipoUsuario: userType,
      };

      if (userType === 'pessoa' || userType === 'adminGeral') {
        userData.nome = formData.nome;
        userData.cpf = formData.cpf;
      } else if (userType === 'empresa') {
        userData.razaoSocial = formData.razaoSocial;
        userData.cnpj = formData.cnpj;
        userData.recebeResiduoComunidade = formData.recebeResiduoComunidade || false;
      } else if (userType === 'centro') {
        userData.nomeFantasia = formData.nomeFantasia;
        userData.cnpj = formData.cnpj;
      }

      await registerUser(userData);
      setSuccess('Usuário cadastrado com sucesso!');
      setTimeout(() => navigate('/painelUsuarios'), 2000);
    } catch (err) {
      setError(err.response?.data?.mensagem || err.message || 'Erro ao cadastrar usuário');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-container">
      <VoltarLink to="/painelAdmin">Voltar</VoltarLink>
      <div className="register-right">
        <h2 className="register-title">Cadastro pelo Admin</h2>
        <p className="register-subtitle">Cadastre empresas, centros ou outros usuários</p>

        {error && <div className="register-error-message">{error}</div>}
        {success && <div className="register-success-message">{success}</div>}

        <form className="register-form" onSubmit={handleSubmit}>
          <select
            value={userType}
            onChange={(e) => setUserType(e.target.value)}
            className="register-form-select"
            required
          >
            <option value="empresa">Empresa</option>
            <option value="centro">Centro/Coletor</option>
            <option value="pessoa">Pessoa</option>
            <option value="adminGeral">Administrador</option>
          </select>

          <div className="register-form-fields">
            {userType === 'pessoa' && (
              <>
                <input
                  type="text"
                  name="nome"
                  placeholder="Nome Completo *"
                  value={formData.nome}
                  onChange={handleChange}
                  required
                />
                <IMaskInput
                  mask="000.000.000-00"
                  name="cpf"
                  placeholder="CPF *"
                  value={formData.cpf}
                  onAccept={(value) => handleAccept(value, 'cpf')}
                  required
                />
              </>
            )}

            {userType === 'empresa' && (
              <input
                type="text"
                name="razaoSocial"
                placeholder="Razão Social *"
                value={formData.razaoSocial}
                onChange={handleChange}
                required
              />
            )}
            {userType === 'empresa' && (
                <label>
                    <input
                    type="checkbox"
                    name="recebeResiduoComunidade"
                    checked={formData.recebeResiduoComunidade || false}
                    onChange={(e) =>
                        setFormData(prev => ({ ...prev, recebeResiduoComunidade: e.target.checked }))
                    }
                    />
                    Aceita receber resíduos da comunidade
                </label>
            )}


            {userType === 'centro' && (
              <input
                type="text"
                name="nomeFantasia"
                placeholder="Nome Fantasia *"
                value={formData.nomeFantasia}
                onChange={handleChange}
                required
              />
            )}

            {(userType === 'empresa' || userType === 'centro') && (
              <IMaskInput
                mask="00.000.000/0000-00"
                name="cnpj"
                placeholder="CNPJ *"
                value={formData.cnpj}
                onAccept={(value) => handleAccept(value, 'cnpj')}
                required
              />
            )}

            <IMaskInput
              mask={[
                { mask: '(00) 0000-0000' },
                { mask: '(00) 00000-0000' }
              ]}                    
              name="telefone"
              placeholder="Telefone *"
              value={formData.telefone}
              onAccept={(value) => handleAccept(value, 'telefone')}
              required
            />

            <input
              type="text"
              name="endereco"
              placeholder="Endereço"
              value={formData.endereco}
              onChange={handleChange}
            />

            <input
              type="email"
              name="email"
              placeholder="Email *"
              value={formData.email}
              onChange={handleChange}
              required
            />

            <input
              type="password"
              name="senha"
              placeholder="Senha *"
              value={formData.senha}
              onChange={handleChange}
              required
              minLength="6"
            />
            <input
              type="password"
              name="confirmarSenha"
              placeholder="Confirmar Senha *"
              value={formData.confirmarSenha}
              onChange={handleChange}
              required
              minLength="6"
            />
          </div>

          <button 
            type="submit" 
            disabled={loading} 
            className="register-submit-button"
          >
            {loading ? 'Cadastrando...' : 'Cadastrar Usuário'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default CadastroUsuarioAdm;

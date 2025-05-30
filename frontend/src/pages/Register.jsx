import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { registerUser } from '../services/authService';
import { IMaskInput } from 'react-imask';
import './styles/register.css';
import Logo from '../assets/logo.png';

const Register = ({ onLoginClick }) => {
  const navigate = useNavigate();
  const [userType, setUserType] = useState('pessoa');
  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    senha: '',
    cpf: '',
    telefone: '',
    endereco: '',
    nomeFantasia: '',
    razaoSocial: '',
    cnpj: '',
    tipoUsuario: 'pessoa'
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAccept = (value, name) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

const handleSubmit = async (e) => {
  e.preventDefault();
  setError('');
  setLoading(true);

  try {
    // Preparar dados para envio
    const userData = {
      email: formData.email,
      senha: formData.senha,
      telefone: formData.telefone,
      endereco: formData.endereco,
      tipoUsuario: userType,
    };

    // Adicionar campos específicos
    if (userType === 'pessoa' || userType === 'adminGeral') {
      userData.nome = formData.nome;
      userData.cpf = formData.cpf;
    } else if (userType === 'empresa') {
      userData.razaoSocial = formData.razaoSocial;
      userData.cnpj = formData.cnpj;
    } else if (userType === 'coletor') {
      userData.nomeFantasia = formData.nomeFantasia;
      userData.cnpj = formData.cnpj;
    }

    console.log("Dados enviados para registro:", userData);
    const response = await registerUser(userData);
    
    if (response && response.token) {
      setSuccess(true);
      setTimeout(() => navigate('/login'), 2000);
    } else {
      throw new Error('Resposta inválida do servidor');
    }
  } catch (err) {
    console.error('Erro ao cadastrar:', err);
    
    // Tratar erros de validação do backend
    if (err.response?.data?.erros) {
      setError(err.response.data.erros.join(', '));
    } else {
      setError(err.response?.data?.mensagem || err.message || 'Erro ao cadastrar');
    }
  } finally {
    setLoading(false);
  }
};

  return (
    <div className="register-modal-content">
      <div className="register-left">
        <div className="logo-placeholder">
          <img src={Logo} alt="Logo da empresa" className="logo-img" />
        </div>
      </div>

      <div className="register-right">
        <div id="text-register">
          <h2>Cadastro</h2>
          <p className="register-subtitle">Selecione seu tipo de cadastro</p>
        </div>

        {error && <div className="error-message">{error}</div>}
        {success && <div className="success-message">Cadastro realizado com sucesso! Redirecionando...</div>}

        <div id="form-register">
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <select
                value={userType}
                onChange={(e) => setUserType(e.target.value)}
                className="form-select"
                required
              >
                <option value="pessoa">Pessoa Física</option>
                <option value="empresa">Empresa</option>
                <option value="coletor">Coletor</option>
              </select>
            </div>

            <div className="form-fields">
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
                </>
              )}

              {userType === 'empresa' && (
                <>
                  <input
                    type="text"
                    name="razaoSocial"
                    placeholder="Razão Social *"
                    value={formData.razaoSocial}
                    onChange={handleChange}
                    required
                  />
                  <IMaskInput
                    mask="00.000.000/0000-00"
                    name="cnpj"
                    placeholder="CNPJ *"
                    value={formData.cnpj}
                    onAccept={(value) => handleAccept(value, 'cnpj')}
                    required
                  />
                  <IMaskInput
                    mask={[
                      { mask: '(00) 0000-0000' },
                      { mask: '(00) 00000-0000' }
                    ]}
                    name="telefone"
                    placeholder="Telefone Comercial *"
                    value={formData.telefone}
                    onAccept={(value) => handleAccept(value, 'telefone')}
                    required
                  />
                </>
              )}

              {userType === 'coletor' && (
                <>
                  <input
                    type="text"
                    name="nomeFantasia"
                    placeholder="Nome Fantasia *"
                    value={formData.nomeFantasia}
                    onChange={handleChange}
                    required
                  />
                  <IMaskInput
                    mask="00.000.000/0000-00"
                    name="cnpj"
                    placeholder="CNPJ *"
                    value={formData.cnpj}
                    onAccept={(value) => handleAccept(value, 'cnpj')}
                    required
                  />
                  <IMaskInput
                    mask={[
                      { mask: '(00) 0000-0000' },
                      { mask: '(00) 00000-0000' }
                    ]}
                    name="telefone"
                    placeholder="Telefone Comercial *"
                    value={formData.telefone}
                    onAccept={(value) => handleAccept(value, 'telefone')}
                    required
                  />
                </>
              )}

              {/* Endereço para todos */}
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
            </div>

            <button type="submit" disabled={loading}>
              {loading ? 'Carregando...' : 'Cadastrar'}
            </button>
          </form>
        </div>

        <div className="login-link">
          Já tem uma conta? <span onClick={onLoginClick}>Faça login</span>
        </div>
      </div>
    </div>
  );
};

export default Register;

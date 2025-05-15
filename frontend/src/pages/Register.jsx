import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { registerUser } from '../services/authService';
import { IMaskInput } from 'react-imask';
import './styles/register.css';

const Register = () => {
  const navigate = useNavigate();
  const [userType, setUserType] = useState('pessoa');
  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    senha: '',
    cpf: '',
    endereco: '',
    nomeFantasia: '',
    cnpj: '',
    tipoUsuario: 'pessoa'
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

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
  
    try {
      // Prepara os dados sem tipoEmpresa
      const userData = {
        nome: userType === 'pessoa' ? formData.nome : formData.nomeFantasia,
        email: formData.email,
        senha: formData.senha,
        tipoUsuario: userType,
        ...(userType === 'pessoa' && { 
          cpf: formData.cpf.replace(/\D/g, '') 
        }),
        ...((userType === 'empresa' || userType === 'coletor') && { 
          cnpj: formData.cnpj.replace(/\D/g, ''),
          nomeFantasia: formData.nomeFantasia || formData.nome
        }),
        ...(formData.endereco && { endereco: formData.endereco })
      };
  
      await registerUser(userData);
      setSuccess(true);
      setTimeout(() => navigate('/login'), 3000);
    } catch (err) {
      setError(err.response?.data?.mensagem || err.message || 'Erro ao cadastrar');
    }
  };
  return (
    <div className="register-container">
      <div className="register-card">
        <h2>Criar Conta</h2>
        <p className="register-subtitle">Selecione seu tipo de cadastro</p>
        
        {error && <div className="error-message">{error}</div>}
        {success && <div className="success-message">Cadastro realizado com sucesso!</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Tipo de Conta *</label>
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

          <div className="form-columns">
            <div className="form-left">
              {userType === 'pessoa' ? (
                <>
                  <div className="form-group">
                    <label>Nome Completo *</label>
                    <input
                      type="text"
                      name="nome"
                      value={formData.nome}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>CPF *</label>
                    <IMaskInput
                      mask="000.000.000-00"
                      name="cpf"
                      value={formData.cpf}
                      onAccept={(value) => handleAccept(value, 'cpf')}
                      className="form-control"
                      required
                    />
                  </div>
                </>
              ) : (
                <>
                  <div className="form-group">
                    <label>{userType === 'empresa' ? 'Razão Social *' : 'Nome Fantasia *'}</label>
                    <input
                      type="text"
                      name="nomeFantasia"
                      value={formData.nomeFantasia}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>CNPJ *</label>
                    <IMaskInput
                      mask="00.000.000/0000-00"
                      name="cnpj"
                      value={formData.cnpj}
                      onAccept={(value) => handleAccept(value, 'cnpj')}
                      className="form-control"
                      required={userType !== 'pessoa'}
                    />
                  </div>
                </>
              )}
            </div>

            <div className="form-right">
              <div className="form-group">
                <label>Email *</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>
              
              <div className="form-group">
                <label>Senha *</label>
                <input
                  type="password"
                  name="senha"
                  value={formData.senha}
                  onChange={handleChange}
                  required
                  minLength="6"
                />
              </div>
              
              <div className="form-group">
                <label>Endereço</label>
                <input
                  type="text"
                  name="endereco"
                  value={formData.endereco}
                  onChange={handleChange}
                />
              </div>
            </div>
          </div>

          <button type="submit" className="submit-btn">
            Criar Conta
          </button>
        </form>
      </div>
    </div>
  );
};

export default Register;
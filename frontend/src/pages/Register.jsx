import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { registerUser } from '../services/authService';
import { IMaskInput } from 'react-imask';
import './styles/register.css';
import Logo from '../assets/logo.png';
import Modal from '../components/Modal';

const Register = ({ onLoginClick }) => {
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
    tipoUsuario: 'empresa',
    recebeResiduoComunidade: false,
    tiposMateriais: []
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  // Opções de tipos de materiais
  const tiposMateriaisOptions = [
    'Telefonia e Acessórios',
    'Informática',
    'Eletrodoméstico',
    'Pilhas e Baterias',
    'Outros Eletroeletrônicos'
  ];

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (type === 'checkbox') {
      if (name === 'recebeResiduoComunidade') {
        setFormData(prev => ({ 
          ...prev, 
          [name]: checked,
          // Limpa os tipos de materiais se desmarcar o recebimento
          ...(checked === false && { tiposMateriais: [] })
        }));
      } else {
        // Lógica para os checkboxes de tipos de materiais
        setFormData(prev => {
          const updatedTiposMateriais = checked
            ? [...prev.tiposMateriais, value]
            : prev.tiposMateriais.filter(item => item !== value);
            
          return { ...prev, tiposMateriais: updatedTiposMateriais };
        });
      }
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleAccept = (value, name) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
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
        tiposMateriais: formData.tiposMateriais
      };

      if (userType === 'pessoa' || userType === 'adminGeral') {
        userData.nome = formData.nome;
        userData.cpf = formData.cpf;
      } else if (userType === 'empresa') {
        userData.razaoSocial = formData.razaoSocial;
        userData.cnpj = formData.cnpj;
        userData.recebeResiduoComunidade = formData.recebeResiduoComunidade;
      } else if (userType === 'centro') {
        userData.nomeFantasia = formData.nomeFantasia;
        userData.cnpj = formData.cnpj;
      }

      const response = await registerUser(userData);
      
      if (response && response.token) {
        setSuccess(true);
        setTimeout(() => navigate('/login'), 2000);
      } else {
        throw new Error('Resposta inválida do servidor');
      }
    } catch (err) {
      setError(err.response?.data?.erros?.join(', ') || err.response?.data?.mensagem || err.message || 'Erro ao cadastrar');
    } finally {
      setLoading(false);
    }
  };

  // Verifica se deve mostrar os tipos de materiais
  const mostrarTiposMateriais = 
    userType === 'centro' || 
    (userType === 'empresa' && formData.recebeResiduoComunidade);

  return (
    <div className="register-container">
      <div className="register-left">
        <img src={Logo} alt="Logo da empresa" className="register-logo-img" />
      </div>

      <div className="register-right">
        <h2 className="register-title">Cadastro</h2>
        <p className="register-subtitle">Selecione seu tipo de cadastro</p>

        {error && <div className="register-error-message">{error}</div>}
        {success && <div className="register-success-message">Cadastro realizado com sucesso! Redirecionando...</div>}

        <form className="register-form" onSubmit={handleSubmit}>
          <select
            value={userType}
            onChange={(e) => setUserType(e.target.value)}
            className="register-form-select"
            required
          >
            {/*<option value="pessoa">Pessoa Física</option>*/}
            <option value="empresa">Empresa</option>
            <option value="centro">Centro</option>
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
            
            {userType === 'empresa' && (
              <div className="register-checkbox-container">
                <input
                  type="checkbox"
                  id="recebeResiduoComunidade"
                  name="recebeResiduoComunidade"
                  checked={formData.recebeResiduoComunidade}
                  onChange={handleChange}
                />
                <label htmlFor="recebeResiduoComunidade">
                  Esta empresa aceita resíduos da comunidade?
                </label>
              </div>
            )}

            {mostrarTiposMateriais && (
              <div className="register-materiais-container">
                <p className="register-materiais-title">Tipos de materiais que recebe:</p>
                {tiposMateriaisOptions.map((material) => (
                  <div key={material} className="register-checkbox-container">
                    <input
                      type="checkbox"
                      id={material}
                      name="tiposMateriais"
                      value={material}
                      checked={formData.tiposMateriais.includes(material)}
                      onChange={handleChange}
                    />
                    <label htmlFor={material}>{material}</label>
                  </div>
                ))}
              </div>
            )}

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
            {loading ? 'Carregando...' : 'Cadastrar'}
          </button>
        </form>

        <div className="register-login-link">
          Já tem uma conta? <span onClick={onLoginClick}>Faça login</span>
        </div>
      </div>
    </div>
  );
};

export default Register;
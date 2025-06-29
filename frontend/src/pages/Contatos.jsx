import React, { useState, useEffect } from "react";
import axios from "axios";
import "./styles/containerPrincipal.css";
import "./styles/contatos.css";
import ReCAPTCHA from "react-google-recaptcha";

import logoFacebook from "../assets/facebook.png";
import logoInstagram from "../assets/instagram.png";
import logoWhatsapp from "../assets/whatsapp.png";
import logoLinkedin from "../assets/linkedin.png";
import logoX from "../assets/twitter.png";
import logoEmail from "../assets/o-email.png";
import logoTelefone from "../assets/celular.png";
import logoEndereco from "../assets/endereco-residencial.png";
import recicleImagem from "../image/cotato-imagem.png";
import contatoImagem from "../image/contat.png";

const Contatos = () => {
  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    telefone: '',
    uf: '',
    cidade: '',
    assunto: '',
    mensagem: ''
  });
  const [uf, setUf] = useState("");
  const [cidade, setCidade] = useState("");
  const [estados, setEstados] = useState([]);
  const [cidades, setCidades] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState({ 
    success: null, 
    message: '',
    code:''
  });
  const [recaptchaToken, setRecaptchaToken] = useState(null);



  useEffect(() => {
    axios
      .get("https://servicodados.ibge.gov.br/api/v1/localidades/estados")
      .then((response) => {
        const estadosOrdenados = response.data.sort((a, b) =>
          a.nome.localeCompare(b.nome)
        );
        setEstados(estadosOrdenados);
      })
      .catch((error) => {
        console.error("Erro ao buscar estados:", error);
      });
  }, []);

  useEffect(() => {
    if (uf) {
      axios
        .get(
          `https://servicodados.ibge.gov.br/api/v1/localidades/estados/${uf}/municipios`
        )
        .then((response) => {
          const cidadesOrdenadas = response.data.sort((a, b) =>
            a.nome.localeCompare(b.nome)
          );
          setCidades(cidadesOrdenadas);
        })
        .catch((error) => {
          console.error("Erro ao buscar cidades:", error);
        });
    } else {
      setCidades([]);
    }
  }, [uf]);
  const handleRecaptchaChange = (token) => {
    console.log('Token reCAPTCHA:', recaptchaToken);

    setRecaptchaToken(token);
  };
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  const handleSelectChange = (e) => {
    const { name, value } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    if (name === 'uf') {
      setUf(value);
      setCidade('');
    }
  };
  const resetForm = () => {
    setFormData({
      nome: '',
      email: '',
      telefone: '',
      uf: '',
      cidade: '',
      assunto: '',
      mensagem: ''
    });
    setUf('');
    setCidade('');
    setRecaptchaToken(null);
    if (window.grecaptcha) window.grecaptcha.reset();
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!recaptchaToken) {
      setSubmitStatus({ 
        success: false, 
        message: 'Por favor, complete o reCAPTCHA',
        code: 'RECAPTCHA_REQUIRED'
      });
      return;
    }

    setIsSubmitting(true);
    setSubmitStatus({ success: null, message: '', code: '' });

    try {

      const response = await axios.post(`${import.meta.env.VITE_API_URL}/contato`, {

        ...formData,
        recaptchaToken
      }, {
        headers: {
          'Content-Type': 'application/json'
        },
        timeout: 10000 // 10 segundos de timeout
      });

      if (response.data.success) {
        setSubmitStatus({ 
          success: true, 
          message: 'Mensagem enviada com sucesso! Em breve retornaremos.',
          code: 'SUCCESS'
        });
        resetForm();
      }
    } catch (error) {
  console.error('Erro completo no envio:', error);

  if (error.response) {
    // O backend respondeu com status fora da faixa 2xx
    console.error('Resposta do backend:', error.response.data);
  } else if (error.request) {
    // Requisição foi feita, mas sem resposta do backend
    console.error('Requisição feita mas sem resposta:', error.request);
  } else {
    // Erro ao configurar a requisição
    console.error('Erro ao configurar requisição:', error.message);
  }

  // Abaixo seu código para mostrar mensagem amigável pro usuário
  let errorMessage = 'Erro ao enviar mensagem. Por favor, tente novamente mais tarde.';
  let errorCode = 'UNKNOWN_ERROR';

  if (error.response) {
    if (error.response.status === 429) {
      errorMessage = error.response.data?.message || 'Muitas tentativas seguidas. Por favor, aguarde 15 minutos.';
      errorCode = 'RATE_LIMIT_EXCEEDED';
    } else if (error.response.data?.code) {
      errorCode = error.response.data.code;
      errorMessage = error.response.data.message || errorMessage;
    }
  } else if (error.code === 'ECONNABORTED') {
    errorMessage = 'Tempo de conexão esgotado. Verifique sua internet.';
    errorCode = 'CONNECTION_TIMEOUT';
  }

  setSubmitStatus({ 
    success: false, 
    message: errorMessage,
    code: errorCode
  });
}
 finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container" id="containerPrincipal">
      <h3>
        Dê um destino correto ao seu lixo eletrônico! Entre em contato conosco
        e faça parte da mudança para um planeta mais sustentável.
      </h3>

      {/* Redes Sociais */}
      <div className="containerContatos">
        <div className="tituloCompartilhe">Compartilhe</div>
        <div className="iconesRedes">
          <a href="#" aria-label="Facebook">
            <img src={logoFacebook} alt="Facebook" className="imagemComTexto" />
          </a>
          <a href="#" aria-label="Instagram">
            <img src={logoInstagram} alt="Instagram" className="imagemComTexto" />
          </a>
          <a href="#" aria-label="WhatsApp">
            <img src={logoWhatsapp} alt="WhatsApp" className="imagemComTexto" />
          </a>
          <a href="#" aria-label="LinkedIn">
            <img src={logoLinkedin} alt="LinkedIn" className="imagemComTexto" />
          </a>
          <a href="#" aria-label="Twitter">
            <img src={logoX} alt="Twitter" className="imagemComTexto" />
          </a>
        </div>
      </div>

      {/* Formulário */}
      <div className="containerFormulario" >
        <div className="imagemFormularioContainer">
          <img
            src={recicleImagem}
            alt="Pessoas reciclando"
            className="imagemFormulario"
          />
        </div>

        <div className="formulario">
          <h4>Utilize o formulário para contato</h4>
          <h1>Em breve retornaremos</h1>

          <form className="formularioContato" onSubmit={handleSubmit}>
            <div className="inputGroup">
              <input
                type="text"
                name="nome"
                placeholder="Nome"
                value={formData.nome}
                onChange={handleChange}
                required
                className="inputLarge"
              />
            </div>

            <div className="inputGroup">
              <input
                type="email"
                name="email"
                placeholder="Email"
                value={formData.email}
                onChange={handleChange}
                required
                className="inputLarge"
              />
            </div>

            <div className="inputGroup">
              <input
                type="tel"
                name="telefone"
                placeholder="Telefone/Celular"
                value={formData.telefone}
                onChange={handleChange}
                required
                className="inputLarge"
              />
            </div>

            <div className="selectGroup">
              <div className="selectContainer">
                <select
                  name="uf"
                  value={formData.uf}
                  onChange={handleSelectChange}
                  required
                  className="selectUF"
                >
                  <option value="">Estado (UF)</option>
                  {estados.map((estado) => (
                    <option key={estado.id} value={estado.sigla}>
                      {estado.sigla}
                    </option>
                  ))}
                </select>

                <select
                  name="cidade"
                  value={formData.cidade}
                  onChange={handleSelectChange}
                  disabled={!formData.uf}
                  required
                  className="selectCidade"
                >
                  <option value="">Cidade</option>
                  {cidades.map((cidade) => (
                    <option key={cidade.id} value={cidade.nome}>
                      {cidade.nome}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="inputGroup">
              <input
                type="text"
                name="assunto"
                placeholder="Assunto"
                value={formData.assunto}
                onChange={handleChange}
                required
                className="inputLarge"
              />
            </div>

            <div className="inputGroup">
              <textarea
                name="mensagem"
                placeholder="Mensagem"
                value={formData.mensagem}
                onChange={handleChange}
                required
                className="inputLarge"
              ></textarea>
            </div>

            <div className="recaptcha-container">
              <ReCAPTCHA
                sitekey={import.meta.env.VITE_RECAPTCHA_SITE_KEY}
                onChange={handleRecaptchaChange}
              />
            </div>

            {submitStatus.message && (
              <div 
                className={`feedback-message ${submitStatus.success ? 'success' : 'error'}`}
                data-code={submitStatus.code || ''}
              >
                {submitStatus.message}
              </div>
            )}

            <button 
              type="submit" 
              className="submitButton"
              disabled={isSubmitting || !recaptchaToken}
            >
              {isSubmitting ? (
                <>
                  <span className="spinner"></span>
                  Enviando...
                </>
              ) : (
                'Enviar Mensagem'
              )}
            </button>
          </form>
        </div>
      </div>

      {/* Outros Contatos */}
      <div className="containerOutrosContatos">
        <div id="outrosContatos">
          <div className="contatoItem">
            <div className="iconeContato">
              <img src={logoTelefone} alt="Ícone de telefone" />
            </div>
            <div className="textoContato">
              <div className="tituloContato">Telefone</div>
              <div className="infoContato">(94) 98207-8802</div>
            </div>
          </div>

          <div className="contatoItem">
            <div className="iconeContato">
              <img src={logoEmail} alt="Ícone de e-mail" />
            </div>
            <div className="textoContato">
              <div className="tituloContato">E-mail</div>
              <div className="infoContato">
                re-cicletucurui@recicle.org.br
              </div>
            </div>
          </div>

          <div className="contatoItem">
            <div className="iconeContato">
              <img src={logoEndereco} alt="Ícone de endereço" />
            </div>
            <div className="textoContato">
              <div className="tituloContato">Endereço</div>
              <div className="infoContato">
                Rua Exemplo, 123 - Centro, Tucuruí - PA
              </div>
            </div>
          </div>
        </div>

        <div id="Imagem">
          <img src={contatoImagem} alt="Localização da empresa" />
        </div>
      </div>
    </div>
  );
};

export default Contatos;

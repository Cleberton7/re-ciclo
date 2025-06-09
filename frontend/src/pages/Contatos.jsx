import React, { useState, useEffect } from "react";
import axios from "axios";
import "./styles/containerPrincipal.css";
import "./styles/contatos.css";
import logoFacebook from "../assets/facebook.png";
import logoInstagram from "../assets/instagram.png";
import logoWhatsapp from "../assets/whatsapp.png";
import logoLinkedin from "../assets/linkedin.png";
import logoX from "../assets/twitter.png";
import logoEmail from "../assets/o-email.png";
import logoTelefone from "../assets/celular.png";
import logoEndereço from "../assets/endereco-residencial.png";
import recicleImagem from "../image/cotato-imagem.png";
//import  contatoImagem from "../image/contato-imagem.png";
import  contatoImagem from "../image/contat.png"; 

const Contatos = () => {
  const [uf, setUf] = useState("");
  const [cidade, setCidade] = useState("");
  const [estados, setEstados] = useState([]);
  const [cidades, setCidades] = useState([]);

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
  const handleSubmit = (e) => {
    e.preventDefault();
    // Lógica para enviar o formulário
  };
  return (
    <div className="container" id="containerPrincipal">
      <h3>Dê um destino correto ao seu lixo eletrônico! Entre em contato conosco e faça parte da mudança para um planeta mais sustentável.</h3>

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

      <div className="containerFormulario">
        <div className="formularioTexto">
          <h4>Utilize o formulário para contato</h4>
          <h1>Em breve retornaremos</h1>

          <form className="formularioContato" onSubmit={handleSubmit}>
            <input type="text" placeholder="Nome" required />
            <input type="email" placeholder="Email" required />
            <input type="tel" placeholder="Telefone/Celular" required />

            <div className="selectContainer">
              <select 
                value={uf} 
                onChange={(e) => setUf(e.target.value)}
                required
              >
                <option value="">Selecione o estado (UF)</option>
                {estados.map((estado) => (
                  <option key={estado.id} value={estado.sigla}>
                    {estado.nome} ({estado.sigla})
                  </option>
                ))}
              </select>

              <select
                value={cidade}
                onChange={(e) => setCidade(e.target.value)}
                disabled={!uf}
                required
              >
                <option value="">Selecione a cidade</option>
                {cidades.map((cidade) => (
                  <option key={cidade.id} value={cidade.nome}>
                    {cidade.nome}
                  </option>
                ))}
              </select>
            </div>

            <input type="text" placeholder="Assunto" required />
            <textarea placeholder="Mensagem" required></textarea>
            <button type="submit">Enviar Mensagem</button>
          </form>
        </div>

        <div className="imagemFormularioContainer">
          <img
            src={recicleImagem}
            alt="Pessoas reciclando"
            className="imagemFormulario"
          />
        </div>
      </div>

      <div className="containerOutrosContatos">
        <div id="Imagem">
          <img src={contatoImagem} alt="Localização da empresa" />
        </div>

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
              <div className="infoContato">re-cicletucurui@recicle.org.br</div>
            </div>
          </div>

          <div className="contatoItem">
            <div className="iconeContato">
              <img src={logoEndereço} alt="Ícone de endereço" />
            </div>
            <div className="textoContato">
              <div className="tituloContato">Endereço</div>
              <div className="infoContato">Rua Exemplo, 123 - Centro, Tucuruí - PA</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contatos;

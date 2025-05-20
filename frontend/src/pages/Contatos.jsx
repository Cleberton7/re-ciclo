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


const Contatos = () => {
  const [uf, setUf] = useState("");
  const [cidade, setCidade] = useState("");
  const [estados, setEstados] = useState([]);
  const [cidades, setCidades] = useState([]);

  useEffect(() => {
    // Buscar estados no carregamento inicial
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
      // Buscar cidades ao selecionar estado
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

  return (
    <div className="container" id="containerPrincipal">
      <h3>Fale Conosco</h3>

      <div className="containerContatos">
        <div className="tituloCompartilhe">Compartilhe</div>
        <div className="iconesRedes">
          <img src={logoFacebook} alt="Logo do Facebook" className="imagemComTexto" />
          <img src={logoInstagram} alt="Logo do Instagram" className="imagemComTexto" />
          <img src={logoWhatsapp} alt="Logo do Whatsapp" className="imagemComTexto" />
          <img src={logoLinkedin} alt="Logo do LinkedIn" className="imagemComTexto" />
          <img src={logoX} alt="Logo do X" className="imagemComTexto" />
        </div>
      </div>

      <div className="containerFormulario">
        <div className="formularioTexto">
          <h4>Utilize o formulário para contato</h4>
          <h1>Em breve retornaremos</h1>

          <form className="formularioContato">
            <input type="text" placeholder="Nome" />
            <input type="email" placeholder="Email" />
            <input type="tel" placeholder="Telefone/Celular" />

            <div className="selectContainer">
              <select value={uf} onChange={(e) => setUf(e.target.value)}>
                <option value="">Selecione o estado (UF)</option>
                {estados.map((estado) => (
                  <option key={estado.id} value={estado.id}>
                    {estado.nome} ({estado.sigla})
                  </option>
                ))}
              </select>

              <select
                value={cidade}
                onChange={(e) => setCidade(e.target.value)}
                disabled={!uf}
              >
                <option value="">Selecione a cidade</option>
                {cidades.map((cidade) => (
                  <option key={cidade.id} value={cidade.nome}>
                    {cidade.nome}
                  </option>
                ))}
              </select>
            </div>

            <input type="text" placeholder="Assunto" />
            <textarea placeholder="Mensagem"></textarea>
            <button type="submit">Enviar</button>
          </form>
        </div>

        <div className="imagemFormularioContainer">
          <img
            src="/caminho/para/sua-imagem.jpg"
            alt="Imagem decorativa"
            className="imagemFormulario"
          />
        </div>
      </div>

      <div className="containerOutrosContatos">
        <div id="Imagem">
          <img src="/caminho/para/imagem-grande.jpg" alt="Imagem decorativa" />
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
              <div className="infoContato"> numemo, bairro , cidade</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contatos;

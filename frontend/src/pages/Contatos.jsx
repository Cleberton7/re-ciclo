import React, { useState } from "react";
import "./styles/containerPrincipal.css";
import "./styles/contatos.css";
import logoFacebook from "../assets/facebook.png";
import logoInstagram from "../assets/instagram.png";
import logoWhatsapp from "../assets/whatsapp.png";
import logoLinkedin from "../assets/linkedin.png";
import logoX from "../assets/twitter.png";

const Contatos = () => {
  const [uf, setUf] = useState("");
  const [cidade, setCidade] = useState("");

  const estados = [
    "AC", "AL", "AP", "AM", "BA", "CE", "DF", "ES", "GO", "MA",
    "MT", "MS", "MG", "PA", "PB", "PR", "PE", "PI", "RJ", "RN",
    "RS", "RO", "RR", "SC", "SP", "SE", "TO",
  ];

  // Exemplo fixo de cidades para alguns estados
  const cidadesPorEstado = {
    PA: ["Tucuruí", "Belém", "Marabá", "Santarém"],
    SP: ["São Paulo", "Campinas", "Santos"],
    RJ: ["Rio de Janeiro", "Niterói", "Petrópolis"],
  };

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
                {estados.map((sigla) => (
                  <option key={sigla} value={sigla}>
                    {sigla}
                  </option>
                ))}
              </select>

              <select value={cidade} onChange={(e) => setCidade(e.target.value)} disabled={!uf}>
                <option value="">Selecione a cidade</option>
                {cidadesPorEstado[uf]?.map((cidade) => (
                  <option key={cidade} value={cidade}>
                    {cidade}
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
              <img src="/caminho/do/icone-telefone.png" alt="Ícone de telefone" />
            </div>
            <div className="textoContato">
              <div className="tituloContato">Telefone</div>
              <div className="infoContato">(94) 98207-8802</div>
            </div>
          </div>

          <div className="contatoItem">
            <div className="iconeContato">
              <img src="/caminho/do/icone-email.png" alt="Ícone de e-mail" />
            </div>
            <div className="textoContato">
              <div className="tituloContato">E-mail</div>
              <div className="infoContato">contato@exemplo.com</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contatos;

// src/components/ComprovanteColeta.jsx
import React, { useRef, useState } from "react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import "../pages/styles/comprovanteColeta.css";
import { formatarTipoMaterial, formatarCodigoRastreamento, formatDate } from "../utils/helpers";

const ComprovanteColeta = ({ residuo, onClose }) => {
  const comprovanteRef = useRef(null);
  const [generandoPdf, setGenerandoPdf] = useState(false);
  const [imprimindo, setImprimindo] = useState(false);

  // Aguarda carregar todas as imagens dentro do container (resolve mesmo se der erro)
  const waitForImages = (container) =>
    new Promise((resolve) => {
      const imgs = container ? container.querySelectorAll("img") : [];
      if (!imgs || imgs.length === 0) return resolve();
      let count = 0;
      const total = imgs.length;
      const done = () => {
        count++;
        if (count >= total) resolve();
      };
      imgs.forEach((img) => {
        if (img.complete) return done();
        img.addEventListener("load", done, { once: true });
        img.addEventListener("error", done, { once: true });
      });
    });

  // Baixar PDF (html2canvas + jsPDF). Suporta multi-page.
  const handleDownloadPDF = async () => {
    const element = comprovanteRef.current;
    if (!element) return;
    setGenerandoPdf(true);

    try {
      await waitForImages(element);

      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        allowTaint: false,
        scrollY: -window.scrollY,
      });

      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", "a4");
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();

      const imgProps = pdf.getImageProperties(imgData);
      const imgWidth = pdfWidth;
      const imgHeight = (imgProps.height * imgWidth) / imgProps.width;

      let heightLeft = imgHeight;
      let position = 0;

      pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
      heightLeft -= pdfHeight;

      while (heightLeft > 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
        heightLeft -= pdfHeight;
      }

      const safeCode = residuo?.codigoRastreamento
        ? residuo.codigoRastreamento.replace(/[^a-z0-9\-_.]/gi, "")
        : Date.now();
      pdf.save(`comprovante-${safeCode}.pdf`);
    } catch (err) {
      console.error("Erro ao gerar PDF:", err);
      alert(
        "Não foi possível gerar o PDF automaticamente. Tente usar Ctrl+P ou verifique as imagens com CORS habilitado."
      );
    } finally {
      setGenerandoPdf(false);
    }
  };

  // Imprimir
  const handlePrint = async () => {
    const element = comprovanteRef.current;
    if (!element) return;
    setImprimindo(true);

    try {
      await waitForImages(element);

      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        allowTaint: false,
        scrollY: -window.scrollY,
      });

      const imgData = canvas.toDataURL("image/png");
      const printWindow = window.open("", "_blank");
      if (!printWindow) {
        alert("Impressão bloqueada. Permita popups e tente novamente.");
        return;
      }

      printWindow.document.write(`
        <html>
          <head>
            <title>Imprimir Comprovante</title>
            <style>
              body { margin: 0; padding: 0; display:flex; align-items:center; justify-content:center; }
              img { max-width: 100%; height: auto; display: block; }
            </style>
          </head>
          <body>
            <img src="${imgData}" onload="window.focus(); window.print();">
          </body>
        </html>
      `);
      printWindow.document.close();
    } catch (err) {
      console.error("Erro ao imprimir:", err);
      alert("Erro ao preparar impressão. Tente usar Ctrl+P.");
    } finally {
      setImprimindo(false);
    }
  };

  return (
    <div className="comprovante-container">
      <div ref={comprovanteRef} className="comprovante-conteudo comprovante-box">
        {/* Cabeçalho */}
        <div className="header">
          <div className="logo">♻️ Re-ciclo Tucuruí</div>
          <div className="codigo">
            <span className="label">Código:</span>{" "}
            {formatarCodigoRastreamento(residuo?.codigoRastreamento)}
          </div>
        </div>

        <h2>📄 Comprovante de Coleta</h2>

        {/* Dados básicos */}
        <div className="detalhes">
          <div className="linha">
            <span className="label">Tipo:</span>{" "}
            {formatarTipoMaterial(residuo?.tipoMaterial, residuo?.outros)}
          </div>
          <div className="linha">
            <span className="label">Quantidade:</span> {residuo?.quantidade} kg
          </div>
          <div className="linha">
            <span className="label">Endereço:</span> {residuo?.endereco}
          </div>
          <div className="linha">
            <span className="label">Status:</span> {residuo?.status}
          </div>
          <div className="linha">
            <span className="label">Data da Solicitação:</span>{" "}
            {residuo?.createdAt ? formatDate(residuo.createdAt) : "-"}
          </div>

          {residuo?.observacoes && (
            <div className="linha">
              <span className="label">Observações:</span> {residuo.observacoes}
            </div>
          )}

          {residuo?.imagem && (
            <div className="linha">
              <span className="label">Imagem do Resíduo:</span>
              <img src={residuo.imagem} alt="Resíduo" className="imagem-residuo" />
            </div>
          )}
        </div>

        {/* Extra: reciclador */}
        {(residuo?.status === "aceita" || residuo?.status === "concluida") && (
          <div className="detalhes">
            <h3>📦 Detalhes da Coleta</h3>

            {residuo?.dataColeta && (
              <div className="linha">
                <span className="label">Data da Coleta:</span>{" "}
                {formatDate(residuo.dataColeta)}
              </div>
            )}
            {residuo?.dataConclusao && (
              <div className="linha">
                <span className="label">Data da Conclusão:</span>{" "}
                {formatDate(residuo.dataConclusao)}
              </div>
            )}
            {residuo?.responsavelColeta && (
              <div className="linha">
                <span className="label">Responsável pela Coleta:</span>{" "}
                {residuo.responsavelColeta}
              </div>
            )}
            {residuo?.materiaisSeparados && (
              <div className="linha">
                <span className="label">Materiais Separados:</span>
                <ul>
                  {Object.entries(residuo.materiaisSeparados).map(([tipo, dados]) => (
                    <li key={tipo}>
                      {formatarTipoMaterial(tipo)}: {dados.quantidade} kg
                      {dados.componentes && ` (Comp.: ${dados.componentes})`}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        <div className="rodape">
          Este comprovante confirma a solicitação/coleta de resíduos eletrônicos registrada no sistema.
        </div>
      </div>

      {/* Botões */}
      <div className="comprovante-acoes">
        <button
          onClick={handleDownloadPDF}
          className="btn-imprimir"
          disabled={generandoPdf}
          title="Baixar PDF"
        >
          {generandoPdf ? "Gerando PDF..." : "Baixar PDF"}
        </button>

        <button
          onClick={handlePrint}
          className="btn-imprimir-outline"
          disabled={imprimindo}
          title="Imprimir"
        >
          {imprimindo ? "Preparando impressão..." : "Imprimir"}
        </button>

        <button onClick={onClose} className="btn-fechar" title="Fechar">
          Fechar
        </button>
      </div>
    </div>
  );
};

export default ComprovanteColeta;

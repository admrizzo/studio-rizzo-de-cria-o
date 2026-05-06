import { toPng } from "html-to-image";
import { jsPDF } from "jspdf";
import { Property, BrandConfig } from "@/types/property";

export const downloadElementAsPng = async (element: HTMLElement, filename: string) => {
  const dataUrl = await toPng(element, { quality: 0.95, pixelRatio: 2 });
  const link = document.createElement("a");
  link.download = `${filename}.png`;
  link.href = dataUrl;
  link.click();
};

export const generatePropertyPdf = async (property: Property, brand: BrandConfig) => {
  const pdf = new jsPDF("landscape", "mm", "a4");
  const pageW = pdf.internal.pageSize.getWidth();
  const pageH = pdf.internal.pageSize.getHeight();

  // Title page
  pdf.setFillColor(26, 26, 46);
  pdf.rect(0, 0, pageW, pageH, "F");
  pdf.setTextColor(255, 255, 255);
  pdf.setFontSize(32);
  pdf.text(property.titulo, pageW / 2, pageH / 2 - 20, { align: "center" });
  pdf.setFontSize(24);
  pdf.setTextColor(233, 69, 96);
  pdf.text(
    new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(property.preco),
    pageW / 2, pageH / 2 + 10, { align: "center" }
  );
  pdf.setFontSize(14);
  pdf.setTextColor(180, 180, 180);
  pdf.text(`${property.bairro}, ${property.cidade} - ${property.estado}`, pageW / 2, pageH / 2 + 25, { align: "center" });
  pdf.text(brand.nome, pageW / 2, pageH - 20, { align: "center" });

  // Details page
  pdf.addPage();
  pdf.setFillColor(245, 245, 250);
  pdf.rect(0, 0, pageW, pageH, "F");
  pdf.setTextColor(30, 30, 30);
  pdf.setFontSize(22);
  pdf.text("Detalhes do Imóvel", 20, 30);
  pdf.setFontSize(14);
  const details = [
    `Tipo: ${property.tipo}`,
    `Endereço: ${property.endereco}`,
    `Bairro: ${property.bairro} - ${property.cidade}/${property.estado}`,
    `Área: ${property.area}m²`,
    `Quartos: ${property.quartos}`,
    `Banheiros: ${property.banheiros}`,
    `Vagas: ${property.vagas}`,
    "",
    property.descricao,
  ];
  let y = 50;
  details.forEach((line) => {
    pdf.text(line, 20, y);
    y += 10;
  });

  // Photo pages - load images
  for (const foto of property.fotos) {
    try {
      const img = await loadImage(foto);
      pdf.addPage();
      pdf.setFillColor(0, 0, 0);
      pdf.rect(0, 0, pageW, pageH, "F");
      const ratio = Math.min(pageW / img.width, pageH / img.height) * 0.9;
      const w = img.width * ratio;
      const h = img.height * ratio;
      pdf.addImage(img, "JPEG", (pageW - w) / 2, (pageH - h) / 2, w, h);
    } catch {
      // skip failed images
    }
  }

  // CTA page
  pdf.addPage();
  pdf.setFillColor(26, 26, 46);
  pdf.rect(0, 0, pageW, pageH, "F");
  pdf.setTextColor(255, 255, 255);
  pdf.setFontSize(28);
  pdf.text(brand.nome, pageW / 2, pageH / 2 - 10, { align: "center" });
  pdf.setFontSize(16);
  pdf.text(`WhatsApp: ${brand.contato}`, pageW / 2, pageH / 2 + 10, { align: "center" });

  pdf.save(`${property.titulo.replace(/\s+/g, "_")}.pdf`);
};

const loadImage = (src: string): Promise<HTMLImageElement> =>
  new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });

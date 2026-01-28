import jsPDF from "jspdf";
import webmarcasLogo from "@/assets/webmarcas-logo.png";

interface VerificationPdfData {
  hash: string;
  registro?: {
    id: string;
    nome_ativo?: string;
    tipo_ativo?: string;
    arquivo_nome?: string;
    created_at: string;
  };
  blockchain?: {
    network: string;
    method: string;
    methodDescription: string;
    tx_hash: string;
    confirmed_at: string;
    block_number: number | null;
    confirmations: number | null;
    bitcoin_anchored: boolean;
  };
}

// Premium color palette (same as certificate)
const colors = {
  primary: { r: 10, g: 61, b: 110 },
  secondary: { r: 45, g: 55, b: 72 },
  accent: { r: 0, g: 102, b: 204 },
  muted: { r: 100, g: 116, b: 139 },
  light: { r: 148, g: 163, b: 184 },
  background: { r: 248, g: 250, b: 252 },
  sectionBg: { r: 241, g: 245, b: 249 },
  border: { r: 203, g: 213, b: 225 },
  success: { r: 34, g: 197, b: 94 },
  successBg: { r: 240, g: 253, b: 244 },
  gold: { r: 180, g: 140, b: 20 },
  goldBg: { r: 254, g: 252, b: 243 },
  blue: { r: 59, g: 130, b: 246 },
  blueBg: { r: 239, g: 246, b: 255 },
};

// Generate QR Code as data URL
async function generateQRCodeDataURL(text: string, size: number = 150): Promise<string> {
  const url = `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(text)}&format=png&margin=0`;
  
  try {
    const response = await fetch(url);
    const blob = await response.blob();
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  } catch (error) {
    console.error("Error generating QR code:", error);
    return "";
  }
}

// Load image as data URL
async function loadImageAsDataURL(src: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.drawImage(img, 0, 0);
        resolve(canvas.toDataURL("image/png"));
      } else {
        reject(new Error("Could not get canvas context"));
      }
    };
    img.onerror = reject;
    img.src = src;
  });
}

// Format date helper
function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleString("pt-BR", {
    dateStyle: "long",
    timeStyle: "short"
  });
}

// Draw section title
function drawSectionTitle(pdf: jsPDF, title: string, x: number, y: number, width: number): number {
  pdf.setTextColor(colors.primary.r, colors.primary.g, colors.primary.b);
  pdf.setFontSize(10);
  pdf.setFont("helvetica", "bold");
  pdf.text(title, x, y);
  
  pdf.setDrawColor(colors.accent.r, colors.accent.g, colors.accent.b);
  pdf.setLineWidth(0.3);
  pdf.line(x, y + 1.5, x + width, y + 1.5);
  
  return y + 6;
}

// Draw data row
function drawDataRow(pdf: jsPDF, label: string, value: string, x: number, y: number, labelWidth: number = 40): void {
  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(9);
  pdf.setTextColor(colors.muted.r, colors.muted.g, colors.muted.b);
  pdf.text(label, x, y);
  
  pdf.setFont("helvetica", "bold");
  pdf.setTextColor(colors.secondary.r, colors.secondary.g, colors.secondary.b);
  pdf.text(value || "Não informado", x + labelWidth, y);
}

export async function generateVerificationPDF(data: VerificationPdfData): Promise<Blob> {
  const verificationUrl = `${window.location.origin}/verificar/${data.hash}`;
  
  const [qrCodeDataUrl, logoDataUrl] = await Promise.all([
    generateQRCodeDataURL(verificationUrl, 120),
    loadImageAsDataURL(webmarcasLogo).catch(() => ""),
  ]);

  const pdf = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const margin = 18;
  const contentWidth = pageWidth - margin * 2;

  // White background
  pdf.setFillColor(255, 255, 255);
  pdf.rect(0, 0, pageWidth, pageHeight, "F");

  // Subtle watermark
  pdf.setTextColor(248, 248, 250);
  pdf.setFontSize(50);
  pdf.setFont("helvetica", "bold");
  
  const centerX = pageWidth / 2;
  const centerY = pageHeight / 2;
  
  for (let i = 0; i < 2; i++) {
    const yOffset = (i - 0.5) * 100;
    pdf.text("WEBMARCAS", centerX, centerY + yOffset, {
      align: "center",
      angle: 45,
    });
  }

  // Border
  pdf.setDrawColor(colors.border.r, colors.border.g, colors.border.b);
  pdf.setLineWidth(0.5);
  pdf.rect(12, 12, pageWidth - 24, pageHeight - 24);

  // ===== HEADER =====
  let y = margin + 4;
  
  const logoSize = 14;
  if (logoDataUrl) {
    try {
      pdf.addImage(logoDataUrl, "PNG", margin, y - 2, logoSize, logoSize);
    } catch (e) {
      console.error("Error adding logo:", e);
    }
  }
  
  const textStartX = logoDataUrl ? margin + logoSize + 4 : margin;
  pdf.setTextColor(colors.primary.r, colors.primary.g, colors.primary.b);
  pdf.setFontSize(20);
  pdf.setFont("helvetica", "bold");
  pdf.text("WEBMARCAS", textStartX, y + 4);
  
  pdf.setFontSize(8);
  pdf.setFont("helvetica", "normal");
  pdf.setTextColor(colors.muted.r, colors.muted.g, colors.muted.b);
  pdf.text("Uma empresa WebPatentes", textStartX, y + 9);

  pdf.setFontSize(7);
  pdf.setTextColor(colors.light.r, colors.light.g, colors.light.b);
  pdf.text("www.webmarcas.net", pageWidth - margin, y, { align: "right" });
  pdf.text("ola@webmarcas.net", pageWidth - margin, y + 4, { align: "right" });

  y += 14;
  pdf.setDrawColor(colors.accent.r, colors.accent.g, colors.accent.b);
  pdf.setLineWidth(0.8);
  pdf.line(margin, y, pageWidth - margin, y);

  y += 12;

  // ===== TITLE =====
  pdf.setTextColor(colors.primary.r, colors.primary.g, colors.primary.b);
  pdf.setFontSize(16);
  pdf.setFont("helvetica", "bold");
  pdf.text("COMPROVANTE DE VERIFICAÇÃO PÚBLICA", pageWidth / 2, y, { align: "center" });
  
  y += 6;
  pdf.setFontSize(11);
  pdf.setFont("helvetica", "normal");
  pdf.setTextColor(colors.muted.r, colors.muted.g, colors.muted.b);
  pdf.text("Registro em Blockchain", pageWidth / 2, y, { align: "center" });

  y += 6;
  
  const now = new Date().toLocaleString("pt-BR", {
    dateStyle: "long",
    timeStyle: "short"
  });
  pdf.setFontSize(8);
  pdf.setTextColor(colors.light.r, colors.light.g, colors.light.b);
  pdf.text(`Verificado em: ${now}`, pageWidth / 2, y, { align: "center" });

  y += 12;

  // ===== STATUS SECTION =====
  pdf.setFillColor(colors.successBg.r, colors.successBg.g, colors.successBg.b);
  pdf.setDrawColor(colors.success.r, colors.success.g, colors.success.b);
  pdf.setLineWidth(0.5);
  pdf.roundedRect(margin, y - 1, contentWidth, 18, 2, 2, "FD");
  
  pdf.setTextColor(colors.success.r, colors.success.g, colors.success.b);
  pdf.setFontSize(14);
  pdf.setFont("helvetica", "bold");
  pdf.text("✔ REGISTRO CONFIRMADO", pageWidth / 2, y + 7, { align: "center" });
  
  pdf.setFontSize(9);
  pdf.setFont("helvetica", "normal");
  pdf.text("Prova de existência válida e imutável em blockchain pública", pageWidth / 2, y + 13, { align: "center" });

  y += 24;

  // ===== HASH SECTION =====
  y = drawSectionTitle(pdf, "HASH SHA-256 (IMPRESSÃO DIGITAL)", margin, y, 70);
  
  pdf.setFillColor(colors.background.r, colors.background.g, colors.background.b);
  pdf.setDrawColor(colors.border.r, colors.border.g, colors.border.b);
  pdf.setLineWidth(0.2);
  pdf.roundedRect(margin, y - 1, contentWidth, 12, 1.5, 1.5, "FD");
  
  pdf.setFont("courier", "normal");
  pdf.setFontSize(7);
  pdf.setTextColor(colors.primary.r, colors.primary.g, colors.primary.b);
  pdf.text(data.hash, margin + 4, y + 6);

  y += 18;

  // ===== BLOCKCHAIN INFO =====
  if (data.blockchain) {
    y = drawSectionTitle(pdf, "DADOS DA BLOCKCHAIN", margin, y, 50);
    
    pdf.setFillColor(colors.sectionBg.r, colors.sectionBg.g, colors.sectionBg.b);
    pdf.roundedRect(margin, y - 1, contentWidth, 26, 1.5, 1.5, "F");
    
    const colWidth = (contentWidth - 4) / 2;
    
    // Row 1
    drawDataRow(pdf, "Método:", data.blockchain.methodDescription || data.blockchain.method, margin + 4, y + 5, 24);
    drawDataRow(pdf, "Blockchain:", data.blockchain.bitcoin_anchored ? "Bitcoin" : data.blockchain.network, margin + colWidth + 8, y + 5, 26);
    
    // Row 2
    drawDataRow(pdf, "Status:", "Confirmado", margin + 4, y + 12, 24);
    if (data.blockchain.confirmed_at) {
      drawDataRow(pdf, "Confirmado em:", formatDate(data.blockchain.confirmed_at), margin + colWidth + 8, y + 12, 32);
    }
    
    // Row 3
    if (data.blockchain.block_number) {
      drawDataRow(pdf, "Bloco:", data.blockchain.block_number.toString(), margin + 4, y + 19, 24);
    }
    if (data.blockchain.confirmations) {
      drawDataRow(pdf, "Confirmações:", data.blockchain.confirmations.toString(), margin + colWidth + 8, y + 19, 32);
    }

    y += 32;
  }

  // ===== REGISTRO INFO =====
  if (data.registro) {
    y = drawSectionTitle(pdf, "DADOS DO REGISTRO", margin, y, 45);
    
    pdf.setFillColor(colors.sectionBg.r, colors.sectionBg.g, colors.sectionBg.b);
    pdf.roundedRect(margin, y - 1, contentWidth, 14, 1.5, 1.5, "F");
    
    const colWidth = (contentWidth - 4) / 2;
    
    drawDataRow(pdf, "ID do Registro:", data.registro.id.slice(0, 8) + "...", margin + 4, y + 5, 28);
    drawDataRow(pdf, "Registrado em:", formatDate(data.registro.created_at), margin + colWidth + 8, y + 5, 30);

    y += 20;
  }

  // ===== INDEPENDENCE NOTICE =====
  pdf.setFillColor(colors.blueBg.r, colors.blueBg.g, colors.blueBg.b);
  pdf.setDrawColor(colors.blue.r, colors.blue.g, colors.blue.b);
  pdf.setLineWidth(0.3);
  pdf.roundedRect(margin, y - 1, contentWidth, 16, 1.5, 1.5, "FD");
  
  pdf.setFontSize(8);
  pdf.setFont("helvetica", "bold");
  pdf.setTextColor(colors.blue.r, colors.blue.g, colors.blue.b);
  pdf.text("VERIFICAÇÃO INDEPENDENTE", margin + 4, y + 5);
  
  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(7);
  pdf.setTextColor(colors.secondary.r, colors.secondary.g, colors.secondary.b);
  
  const independenceText = "Esta verificação utiliza o protocolo público OpenTimestamps, ancorado na blockchain do Bitcoin. A WebMarcas não controla nem pode alterar este resultado.";
  const lines = pdf.splitTextToSize(independenceText, contentWidth - 8);
  lines.forEach((line: string, index: number) => {
    if (index < 2) {
      pdf.text(line, margin + 4, y + 10 + (index * 3.5));
    }
  });

  y += 22;

  // ===== LEGAL DISCLAIMER =====
  pdf.setFillColor(colors.goldBg.r, colors.goldBg.g, colors.goldBg.b);
  pdf.setDrawColor(colors.gold.r, colors.gold.g, colors.gold.b);
  pdf.setLineWidth(0.3);
  pdf.roundedRect(margin, y - 1, contentWidth, 18, 1.5, 1.5, "FD");
  
  pdf.setFontSize(8);
  pdf.setFont("helvetica", "bold");
  pdf.setTextColor(colors.gold.r, colors.gold.g, colors.gold.b);
  pdf.text("AVISO LEGAL", margin + 4, y + 4);
  
  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(6);
  pdf.setTextColor(120, 100, 60);
  
  const disclaimerText = "Este certificado NÃO SUBSTITUI o registro de marca, patente ou direito autoral junto ao INPI. A prova de anterioridade em blockchain é um elemento técnico complementar, não constituindo, por si só, direito de propriedade intelectual conforme Art. 411 do CPC.";
  const disclaimerLines = pdf.splitTextToSize(disclaimerText, contentWidth - 8);
  disclaimerLines.forEach((line: string, index: number) => {
    if (index < 3) {
      pdf.text(line, margin + 4, y + 9 + (index * 3));
    }
  });

  y += 24;

  // ===== VERIFICATION QR SECTION =====
  const qrBoxHeight = 30;
  const qrSize = 24;
  
  pdf.setFillColor(colors.sectionBg.r, colors.sectionBg.g, colors.sectionBg.b);
  pdf.setDrawColor(colors.border.r, colors.border.g, colors.border.b);
  pdf.setLineWidth(0.2);
  pdf.roundedRect(margin, y - 1, contentWidth, qrBoxHeight, 1.5, 1.5, "FD");
  
  pdf.setFontSize(9);
  pdf.setFont("helvetica", "bold");
  pdf.setTextColor(colors.primary.r, colors.primary.g, colors.primary.b);
  pdf.text("VERIFIQUE ONLINE", margin + 4, y + 5);
  
  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(7);
  pdf.setTextColor(colors.muted.r, colors.muted.g, colors.muted.b);
  pdf.text("Escaneie o QR Code ou acesse:", margin + 4, y + 11);
  
  pdf.setFontSize(7);
  pdf.setFont("helvetica", "bold");
  pdf.setTextColor(colors.accent.r, colors.accent.g, colors.accent.b);
  pdf.text(verificationUrl, margin + 4, y + 17);
  
  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(6.5);
  pdf.setTextColor(colors.muted.r, colors.muted.g, colors.muted.b);
  pdf.text("Ou em: opentimestamps.org", margin + 4, y + 23);
  
  // QR Code
  if (qrCodeDataUrl) {
    try {
      const qrX = pageWidth - margin - qrSize - 4;
      const qrY = y + (qrBoxHeight - qrSize) / 2;
      pdf.addImage(qrCodeDataUrl, "PNG", qrX, qrY, qrSize, qrSize);
    } catch (e) {
      console.error("Error adding QR code:", e);
    }
  }

  // ===== FOOTER =====
  const footerY = pageHeight - 22;
  
  pdf.setDrawColor(colors.border.r, colors.border.g, colors.border.b);
  pdf.setLineWidth(0.3);
  pdf.line(margin, footerY, pageWidth - margin, footerY);
  
  pdf.setTextColor(colors.muted.r, colors.muted.g, colors.muted.b);
  pdf.setFontSize(7);
  pdf.setFont("helvetica", "normal");
  pdf.text("WebMarcas • Uma empresa WebPatentes", pageWidth / 2, footerY + 5, { align: "center" });
  
  pdf.setFontSize(6.5);
  pdf.setTextColor(colors.light.r, colors.light.g, colors.light.b);
  pdf.text("www.webmarcas.net • ola@webmarcas.net • (11) 91112-0225", pageWidth / 2, footerY + 9, { align: "center" });
  
  pdf.setFontSize(6);
  pdf.text(`Documento gerado automaticamente • ${now}`, pageWidth / 2, footerY + 13, { align: "center" });

  return pdf.output("blob");
}

export async function downloadVerificationPDF(data: VerificationPdfData): Promise<void> {
  const blob = await generateVerificationPDF(data);
  
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `verificacao-webmarcas-${data.hash.slice(0, 16)}.pdf`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

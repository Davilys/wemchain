import { supabase } from "@/integrations/supabase/client";
import jsPDF from "jspdf";
import webmarcasLogo from "@/assets/webmarcas-logo.png";

interface CertificateData {
  title: string;
  subtitle: string;
  emissionDate: string;
  registrationDate: string;
  confirmationDate: string;
  holder: {
    name: string;
    document: string;
  };
  asset: {
    name: string;
    type: string;
    fileName: string;
  };
  technical: {
    hash: string;
    method: string;
    network: string;
    txHash: string;
    blockNumber?: number;
    registroId: string;
  };
  legal: {
    validity: string;
    disclaimer: string;
    verification: string;
  };
  footer: {
    company: string;
    contact: string;
    certificateId: string;
  };
}

// Premium color palette
const colors = {
  primary: { r: 10, g: 61, b: 110 },      // #0a3d6e - Dark elegant blue
  secondary: { r: 45, g: 55, b: 72 },      // #2d3748 - Dark gray-blue
  accent: { r: 0, g: 102, b: 204 },        // #0066cc - Refined blue
  muted: { r: 100, g: 116, b: 139 },       // #64748b - Muted gray
  light: { r: 148, g: 163, b: 184 },       // #94a3b8 - Light gray
  background: { r: 248, g: 250, b: 252 },  // #f8fafc - Near white
  sectionBg: { r: 241, g: 245, b: 249 },   // #f1f5f9 - Light gray bg
  border: { r: 203, g: 213, b: 225 },      // #cbd5e1 - Soft border
  gold: { r: 180, g: 140, b: 20 },         // Gold accent for legal
  goldBg: { r: 254, g: 252, b: 243 },      // Light gold background
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

// Load image as data URL for embedding in PDF
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

// Helper to draw section title with elegant underline
function drawSectionTitle(pdf: jsPDF, title: string, x: number, y: number, width: number): number {
  pdf.setTextColor(colors.primary.r, colors.primary.g, colors.primary.b);
  pdf.setFontSize(10);
  pdf.setFont("helvetica", "bold");
  pdf.text(title, x, y);
  
  // Elegant thin underline
  pdf.setDrawColor(colors.accent.r, colors.accent.g, colors.accent.b);
  pdf.setLineWidth(0.3);
  pdf.line(x, y + 1.5, x + width, y + 1.5);
  
  return y + 6;
}

// Helper to draw data row
function drawDataRow(pdf: jsPDF, label: string, value: string, x: number, y: number, labelWidth: number = 40): void {
  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(9);
  pdf.setTextColor(colors.muted.r, colors.muted.g, colors.muted.b);
  pdf.text(label, x, y);
  
  pdf.setFont("helvetica", "bold");
  pdf.setTextColor(colors.secondary.r, colors.secondary.g, colors.secondary.b);
  pdf.text(value || "Não informado", x + labelWidth, y);
}

export async function generateCertificatePDF(registroId: string): Promise<Blob> {
  const { data: sessionData } = await supabase.auth.getSession();
  if (!sessionData.session) {
    throw new Error("Usuário não autenticado");
  }

  const response = await supabase.functions.invoke("generate-certificate", {
    body: { registroId },
  });

  if (response.error) {
    throw new Error(response.error.message || "Erro ao gerar certificado");
  }

  const { certificateData } = response.data as { certificateData: CertificateData };

  // Generate QR Code and load logo
  const verificationUrl = `https://webmarcas.net/verificar/${registroId}`;
  const [qrCodeDataUrl, logoDataUrl] = await Promise.all([
    generateQRCodeDataURL(verificationUrl, 120),
    loadImageAsDataURL(webmarcasLogo).catch(() => ""),
  ]);

  // Create PDF
  const pdf = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const margin = 18;
  const contentWidth = pageWidth - margin * 2;

  // ===== CLEAN WHITE BACKGROUND =====
  pdf.setFillColor(255, 255, 255);
  pdf.rect(0, 0, pageWidth, pageHeight, "F");

  // ===== SUBTLE WATERMARK =====
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

  // ===== SINGLE ELEGANT BORDER =====
  pdf.setDrawColor(colors.border.r, colors.border.g, colors.border.b);
  pdf.setLineWidth(0.5);
  pdf.rect(12, 12, pageWidth - 24, pageHeight - 24);

  // ===== PREMIUM HEADER WITH LOGO =====
  let y = margin + 4;
  
  // Add logo if available
  const logoSize = 14;
  if (logoDataUrl) {
    try {
      pdf.addImage(logoDataUrl, "PNG", margin, y - 2, logoSize, logoSize);
    } catch (e) {
      console.error("Error adding logo:", e);
    }
  }
  
  // Company name - elegant dark blue (positioned after logo)
  const textStartX = logoDataUrl ? margin + logoSize + 4 : margin;
  pdf.setTextColor(colors.primary.r, colors.primary.g, colors.primary.b);
  pdf.setFontSize(20);
  pdf.setFont("helvetica", "bold");
  pdf.text("WEBMARCAS", textStartX, y + 4);
  
  // Tagline
  pdf.setFontSize(8);
  pdf.setFont("helvetica", "normal");
  pdf.setTextColor(colors.muted.r, colors.muted.g, colors.muted.b);
  pdf.text("Uma empresa WebPatentes", textStartX, y + 9);

  // Contact info on right - smaller and muted
  pdf.setFontSize(7);
  pdf.setTextColor(colors.light.r, colors.light.g, colors.light.b);
  pdf.text("www.webmarcas.net", pageWidth - margin, y, { align: "right" });
  pdf.text("ola@webmarcas.net", pageWidth - margin, y + 4, { align: "right" });
  pdf.text("(11) 91112-0225", pageWidth - margin, y + 8, { align: "right" });

  // Accent line under header
  y += 14;
  pdf.setDrawColor(colors.accent.r, colors.accent.g, colors.accent.b);
  pdf.setLineWidth(0.8);
  pdf.line(margin, y, pageWidth - margin, y);

  y += 12;

  // ===== CERTIFICATE TITLE =====
  pdf.setTextColor(colors.primary.r, colors.primary.g, colors.primary.b);
  pdf.setFontSize(16);
  pdf.setFont("helvetica", "bold");
  pdf.text("CERTIFICADO DE PROVA DE ANTERIORIDADE", pageWidth / 2, y, { align: "center" });
  
  y += 6;
  pdf.setFontSize(11);
  pdf.setFont("helvetica", "normal");
  pdf.setTextColor(colors.muted.r, colors.muted.g, colors.muted.b);
  pdf.text("Registro Imutável em Blockchain", pageWidth / 2, y, { align: "center" });

  y += 8;
  
  // Emission date - small and centered
  pdf.setFontSize(8);
  pdf.setTextColor(colors.light.r, colors.light.g, colors.light.b);
  pdf.text(`Emitido em: ${certificateData.emissionDate}`, pageWidth / 2, y, { align: "center" });

  y += 12;

  // ===== HOLDER SECTION =====
  y = drawSectionTitle(pdf, "IDENTIFICAÇÃO DO TITULAR", margin, y, 55);
  
  // Light background for data
  pdf.setFillColor(colors.sectionBg.r, colors.sectionBg.g, colors.sectionBg.b);
  pdf.roundedRect(margin, y - 1, contentWidth, 14, 1.5, 1.5, "F");
  
  drawDataRow(pdf, "Nome / Razão Social:", certificateData.holder.name, margin + 4, y + 4, 38);
  drawDataRow(pdf, "CPF / CNPJ:", certificateData.holder.document, margin + 4, y + 10, 38);

  y += 18;

  // ===== ASSET SECTION =====
  y = drawSectionTitle(pdf, "ATIVO REGISTRADO", margin, y, 45);
  
  pdf.setFillColor(colors.sectionBg.r, colors.sectionBg.g, colors.sectionBg.b);
  pdf.roundedRect(margin, y - 1, contentWidth, 20, 1.5, 1.5, "F");
  
  drawDataRow(pdf, "Nome do Ativo:", certificateData.asset.name, margin + 4, y + 4, 32);
  drawDataRow(pdf, "Tipo:", certificateData.asset.type, margin + 4, y + 10, 32);
  drawDataRow(pdf, "Data do Registro:", certificateData.registrationDate, margin + 4, y + 16, 32);

  y += 24;

  // ===== TECHNICAL DATA SECTION =====
  y = drawSectionTitle(pdf, "DADOS TÉCNICOS DO REGISTRO", margin, y, 65);

  // Hash box - elegant with subtle border
  pdf.setFillColor(colors.background.r, colors.background.g, colors.background.b);
  pdf.setDrawColor(colors.border.r, colors.border.g, colors.border.b);
  pdf.setLineWidth(0.2);
  pdf.roundedRect(margin, y - 1, contentWidth, 14, 1.5, 1.5, "FD");
  
  pdf.setTextColor(colors.muted.r, colors.muted.g, colors.muted.b);
  pdf.setFontSize(7);
  pdf.setFont("helvetica", "bold");
  pdf.text("Hash SHA-256 (Impressão Digital do Arquivo)", margin + 4, y + 3);
  
  pdf.setFont("courier", "normal");
  pdf.setFontSize(6.5);
  pdf.setTextColor(colors.primary.r, colors.primary.g, colors.primary.b);
  pdf.text(certificateData.technical.hash, margin + 4, y + 9);

  y += 17;

  // Technical details - two columns
  const colWidth = (contentWidth - 4) / 2;
  
  pdf.setFillColor(colors.sectionBg.r, colors.sectionBg.g, colors.sectionBg.b);
  pdf.roundedRect(margin, y - 1, colWidth, 12, 1.5, 1.5, "F");
  pdf.roundedRect(margin + colWidth + 4, y - 1, colWidth, 12, 1.5, 1.5, "F");
  
  // Left column
  pdf.setTextColor(colors.muted.r, colors.muted.g, colors.muted.b);
  pdf.setFontSize(8);
  pdf.setFont("helvetica", "normal");
  pdf.text("Método:", margin + 4, y + 4);
  pdf.setFont("helvetica", "bold");
  pdf.setTextColor(colors.secondary.r, colors.secondary.g, colors.secondary.b);
  pdf.text(certificateData.technical.method, margin + 4, y + 9);
  
  // Right column
  pdf.setTextColor(colors.muted.r, colors.muted.g, colors.muted.b);
  pdf.setFont("helvetica", "normal");
  pdf.text("Blockchain:", margin + colWidth + 8, y + 4);
  pdf.setFont("helvetica", "bold");
  pdf.setTextColor(colors.secondary.r, colors.secondary.g, colors.secondary.b);
  pdf.text(certificateData.technical.network, margin + colWidth + 8, y + 9);

  y += 15;

  // Confirmation date
  pdf.setFillColor(colors.sectionBg.r, colors.sectionBg.g, colors.sectionBg.b);
  pdf.roundedRect(margin, y - 1, contentWidth, 8, 1.5, 1.5, "F");
  drawDataRow(pdf, "Data de Confirmação:", certificateData.confirmationDate, margin + 4, y + 4, 38);

  y += 11;

  // TX Hash box
  pdf.setFillColor(colors.background.r, colors.background.g, colors.background.b);
  pdf.setDrawColor(colors.border.r, colors.border.g, colors.border.b);
  pdf.setLineWidth(0.2);
  pdf.roundedRect(margin, y - 1, contentWidth, 12, 1.5, 1.5, "FD");
  
  pdf.setTextColor(colors.muted.r, colors.muted.g, colors.muted.b);
  pdf.setFontSize(7);
  pdf.setFont("helvetica", "bold");
  pdf.text("ID da Transação / Prova:", margin + 4, y + 3);
  
  pdf.setFont("courier", "normal");
  pdf.setFontSize(5.5);
  pdf.setTextColor(colors.primary.r, colors.primary.g, colors.primary.b);
  
  const txHashDisplay = certificateData.technical.txHash.length > 95 
    ? certificateData.technical.txHash.substring(0, 95) + "..."
    : certificateData.technical.txHash;
  pdf.text(txHashDisplay, margin + 4, y + 8);

  y += 16;

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
  
  const disclaimerLines = pdf.splitTextToSize(certificateData.legal.disclaimer, contentWidth - 8);
  disclaimerLines.forEach((line: string, index: number) => {
    if (index < 3) {
      pdf.text(line, margin + 4, y + 9 + (index * 3));
    }
  });

  y += 21;

  // ===== VERIFICATION SECTION WITH QR CODE =====
  const qrBoxHeight = 30;
  const qrSize = 24;
  
  pdf.setFillColor(colors.sectionBg.r, colors.sectionBg.g, colors.sectionBg.b);
  pdf.setDrawColor(colors.border.r, colors.border.g, colors.border.b);
  pdf.setLineWidth(0.2);
  pdf.roundedRect(margin, y - 1, contentWidth, qrBoxHeight, 1.5, 1.5, "FD");
  
  const textAreaWidth = contentWidth - qrSize - 14;
  
  pdf.setFontSize(9);
  pdf.setFont("helvetica", "bold");
  pdf.setTextColor(colors.primary.r, colors.primary.g, colors.primary.b);
  pdf.text("VERIFICAÇÃO INDEPENDENTE", margin + 4, y + 5);
  
  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(7);
  pdf.setTextColor(colors.muted.r, colors.muted.g, colors.muted.b);
  
  const verificationText = "Este certificado pode ser verificado através do protocolo OpenTimestamps ou em nosso portal de verificação pública.";
  const verifyLines = pdf.splitTextToSize(verificationText, textAreaWidth);
  verifyLines.forEach((line: string, index: number) => {
    if (index < 2) {
      pdf.text(line, margin + 4, y + 11 + (index * 3.5));
    }
  });
  
  pdf.setFontSize(7);
  pdf.setFont("helvetica", "bold");
  pdf.setTextColor(colors.accent.r, colors.accent.g, colors.accent.b);
  pdf.text(`ID: ${certificateData.technical.registroId}`, margin + 4, y + 21);
  
  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(6.5);
  pdf.setTextColor(colors.muted.r, colors.muted.g, colors.muted.b);
  pdf.text("webmarcas.net/verificar-registro", margin + 4, y + 26);
  
  // QR Code on right
  if (qrCodeDataUrl) {
    try {
      const qrX = pageWidth - margin - qrSize - 4;
      const qrY = y + (qrBoxHeight - qrSize) / 2;
      pdf.addImage(qrCodeDataUrl, "PNG", qrX, qrY, qrSize, qrSize);
    } catch (e) {
      console.error("Error adding QR code:", e);
      pdf.setDrawColor(colors.border.r, colors.border.g, colors.border.b);
      pdf.setFillColor(255, 255, 255);
      const qrX = pageWidth - margin - qrSize - 4;
      const qrY = y + (qrBoxHeight - qrSize) / 2;
      pdf.roundedRect(qrX, qrY, qrSize, qrSize, 1, 1, "FD");
      pdf.setFontSize(6);
      pdf.setTextColor(colors.light.r, colors.light.g, colors.light.b);
      pdf.text("QR Code", qrX + qrSize/2, qrY + qrSize/2, { align: "center" });
    }
  }

  // ===== MINIMALIST FOOTER =====
  const footerY = pageHeight - 22;
  
  // Simple elegant line
  pdf.setDrawColor(colors.border.r, colors.border.g, colors.border.b);
  pdf.setLineWidth(0.3);
  pdf.line(margin, footerY, pageWidth - margin, footerY);
  
  // Company info - centered and muted
  pdf.setTextColor(colors.muted.r, colors.muted.g, colors.muted.b);
  pdf.setFontSize(7);
  pdf.setFont("helvetica", "normal");
  pdf.text("WebMarcas • Uma empresa WebPatentes", pageWidth / 2, footerY + 5, { align: "center" });
  
  pdf.setFontSize(6.5);
  pdf.setTextColor(colors.light.r, colors.light.g, colors.light.b);
  pdf.text("www.webmarcas.net • ola@webmarcas.net • (11) 91112-0225", pageWidth / 2, footerY + 9, { align: "center" });
  
  pdf.setFontSize(6);
  pdf.text(`Documento gerado automaticamente • ID: ${certificateData.footer.certificateId}`, pageWidth / 2, footerY + 13, { align: "center" });

  return pdf.output("blob");
}

export async function downloadCertificate(registroId: string): Promise<void> {
  try {
    const blob = await generateCertificatePDF(registroId);
    
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `certificado-webmarcas-${registroId}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    await supabase.from("audit_logs").insert({
      user_id: (await supabase.auth.getUser()).data.user?.id,
      action_type: "certificado_downloaded",
      metadata: {
        registro_id: registroId,
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error("Error downloading certificate:", error);
    throw error;
  }
}

export async function checkCertificateEligibility(registroId: string): Promise<{
  eligible: boolean;
  reason?: string;
  status?: string;
}> {
  const { data: registro, error } = await supabase
    .from("registros")
    .select("status, hash_sha256, transacoes_blockchain(*)")
    .eq("id", registroId)
    .single();

  if (error || !registro) {
    return { eligible: false, reason: "Registro não encontrado" };
  }

  if (registro.status !== "confirmado") {
    return {
      eligible: false,
      reason: "Certificado disponível apenas para registros confirmados",
      status: registro.status,
    };
  }

  if (!registro.hash_sha256) {
    return { eligible: false, reason: "Registro sem hash válido" };
  }

  const txData = registro.transacoes_blockchain;
  if (!txData || (Array.isArray(txData) && txData.length === 0)) {
    return { eligible: false, reason: "Registro sem transação blockchain confirmada" };
  }

  return { eligible: true };
}

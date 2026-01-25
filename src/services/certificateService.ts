import { supabase } from "@/integrations/supabase/client";
import jsPDF from "jspdf";

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

// Generate QR Code as data URL using a simple QR library approach
async function generateQRCodeDataURL(text: string, size: number = 150): Promise<string> {
  // Use QR Server API for simplicity
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

export async function generateCertificatePDF(registroId: string): Promise<Blob> {
  // Fetch certificate data from edge function
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

  // Generate QR Code for verification
  const verificationUrl = `https://webmarcas.net/verificar/${registroId}`;
  const qrCodeDataUrl = await generateQRCodeDataURL(verificationUrl, 120);

  // Generate PDF using jsPDF
  const pdf = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const margin = 15;
  const contentWidth = pageWidth - margin * 2;

  // ===== BACKGROUND & WATERMARK =====
  // Light gray background
  pdf.setFillColor(252, 252, 253);
  pdf.rect(0, 0, pageWidth, pageHeight, "F");

  // Watermark - diagonal text
  pdf.setTextColor(240, 240, 245);
  pdf.setFontSize(60);
  pdf.setFont("helvetica", "bold");
  
  // Rotate and add watermark
  const centerX = pageWidth / 2;
  const centerY = pageHeight / 2;
  
  // Add multiple watermarks
  for (let i = 0; i < 3; i++) {
    const yOffset = (i - 1) * 80;
    pdf.text("WEBMARCAS", centerX, centerY + yOffset, {
      align: "center",
      angle: 45,
    });
  }

  // ===== DECORATIVE BORDER =====
  // Outer border
  pdf.setDrawColor(0, 100, 180);
  pdf.setLineWidth(1.5);
  pdf.rect(8, 8, pageWidth - 16, pageHeight - 16);
  
  // Inner border
  pdf.setDrawColor(0, 128, 255);
  pdf.setLineWidth(0.5);
  pdf.rect(11, 11, pageWidth - 22, pageHeight - 22);

  // Corner decorations
  const cornerSize = 15;
  pdf.setDrawColor(0, 100, 180);
  pdf.setLineWidth(1);
  
  // Top-left corner
  pdf.line(8, 8 + cornerSize, 8, 8);
  pdf.line(8, 8, 8 + cornerSize, 8);
  
  // Top-right corner
  pdf.line(pageWidth - 8 - cornerSize, 8, pageWidth - 8, 8);
  pdf.line(pageWidth - 8, 8, pageWidth - 8, 8 + cornerSize);
  
  // Bottom-left corner
  pdf.line(8, pageHeight - 8 - cornerSize, 8, pageHeight - 8);
  pdf.line(8, pageHeight - 8, 8 + cornerSize, pageHeight - 8);
  
  // Bottom-right corner
  pdf.line(pageWidth - 8 - cornerSize, pageHeight - 8, pageWidth - 8, pageHeight - 8);
  pdf.line(pageWidth - 8, pageHeight - 8 - cornerSize, pageWidth - 8, pageHeight - 8);

  // ===== HEADER / LETTERHEAD =====
  // Header background gradient effect
  pdf.setFillColor(0, 80, 160);
  pdf.rect(margin, margin, contentWidth, 28, "F");
  
  // Gradient overlay
  pdf.setFillColor(0, 100, 200);
  pdf.rect(margin, margin, contentWidth * 0.7, 28, "F");

  // Company name
  pdf.setTextColor(255, 255, 255);
  pdf.setFontSize(22);
  pdf.setFont("helvetica", "bold");
  pdf.text("WEBMARCAS", margin + 8, margin + 12);

  // Tagline
  pdf.setFontSize(9);
  pdf.setFont("helvetica", "normal");
  pdf.text("Uma empresa WebPatentes • Registro em Blockchain", margin + 8, margin + 19);

  // Contact info on the right
  pdf.setFontSize(8);
  pdf.text("www.webmarcas.net", pageWidth - margin - 8, margin + 10, { align: "right" });
  pdf.text("ola@webmarcas.net", pageWidth - margin - 8, margin + 15, { align: "right" });
  pdf.text("(11) 91112-0225", pageWidth - margin - 8, margin + 20, { align: "right" });

  let y = margin + 38;

  // ===== CERTIFICATE TITLE =====
  pdf.setFillColor(245, 248, 255);
  pdf.roundedRect(margin, y - 4, contentWidth, 22, 3, 3, "F");
  
  pdf.setTextColor(0, 60, 120);
  pdf.setFontSize(16);
  pdf.setFont("helvetica", "bold");
  pdf.text("CERTIFICADO DE PROVA DE ANTERIORIDADE", pageWidth / 2, y + 6, { align: "center" });
  
  pdf.setFontSize(11);
  pdf.setFont("helvetica", "normal");
  pdf.setTextColor(60, 80, 120);
  pdf.text("Registro Imutável em Blockchain", pageWidth / 2, y + 14, { align: "center" });

  y += 30;

  // ===== EMISSION INFO =====
  pdf.setFontSize(9);
  pdf.setTextColor(100, 110, 130);
  pdf.text(`Emitido em: ${certificateData.emissionDate}`, pageWidth / 2, y, { align: "center" });
  
  y += 10;

  // ===== HOLDER SECTION =====
  pdf.setFillColor(0, 80, 160);
  pdf.rect(margin, y, contentWidth, 7, "F");
  pdf.setTextColor(255, 255, 255);
  pdf.setFontSize(10);
  pdf.setFont("helvetica", "bold");
  pdf.text("IDENTIFICAÇÃO DO TITULAR", margin + 4, y + 5);
  
  y += 12;
  
  pdf.setFillColor(250, 251, 255);
  pdf.rect(margin, y - 3, contentWidth, 16, "F");
  
  pdf.setTextColor(30, 40, 60);
  pdf.setFontSize(10);
  pdf.setFont("helvetica", "normal");
  pdf.text(`Nome / Razão Social:`, margin + 4, y + 2);
  pdf.setFont("helvetica", "bold");
  pdf.text(certificateData.holder.name || "Não informado", margin + 50, y + 2);
  
  pdf.setFont("helvetica", "normal");
  pdf.text(`CPF / CNPJ:`, margin + 4, y + 9);
  pdf.setFont("helvetica", "bold");
  pdf.text(certificateData.holder.document || "Não informado", margin + 50, y + 9);

  y += 20;

  // ===== ASSET SECTION =====
  pdf.setFillColor(0, 80, 160);
  pdf.rect(margin, y, contentWidth, 7, "F");
  pdf.setTextColor(255, 255, 255);
  pdf.setFontSize(10);
  pdf.setFont("helvetica", "bold");
  pdf.text("ATIVO REGISTRADO", margin + 4, y + 5);
  
  y += 12;
  
  pdf.setFillColor(250, 251, 255);
  pdf.rect(margin, y - 3, contentWidth, 23, "F");
  
  pdf.setTextColor(30, 40, 60);
  pdf.setFontSize(10);
  pdf.setFont("helvetica", "normal");
  
  pdf.text(`Nome do Ativo:`, margin + 4, y + 2);
  pdf.setFont("helvetica", "bold");
  pdf.text(certificateData.asset.name, margin + 40, y + 2);
  
  pdf.setFont("helvetica", "normal");
  pdf.text(`Tipo:`, margin + 4, y + 9);
  pdf.setFont("helvetica", "bold");
  pdf.text(certificateData.asset.type, margin + 40, y + 9);
  
  pdf.setFont("helvetica", "normal");
  pdf.text(`Data do Registro:`, margin + 4, y + 16);
  pdf.setFont("helvetica", "bold");
  pdf.text(certificateData.registrationDate, margin + 40, y + 16);

  y += 28;

  // ===== TECHNICAL DATA SECTION =====
  pdf.setFillColor(0, 80, 160);
  pdf.rect(margin, y, contentWidth, 7, "F");
  pdf.setTextColor(255, 255, 255);
  pdf.setFontSize(10);
  pdf.setFont("helvetica", "bold");
  pdf.text("DADOS TÉCNICOS DO REGISTRO", margin + 4, y + 5);
  
  y += 12;

  // Hash box
  pdf.setFillColor(240, 245, 255);
  pdf.setDrawColor(0, 100, 180);
  pdf.setLineWidth(0.3);
  pdf.roundedRect(margin, y - 3, contentWidth, 18, 2, 2, "FD");
  
  pdf.setTextColor(60, 80, 120);
  pdf.setFontSize(9);
  pdf.setFont("helvetica", "bold");
  pdf.text("Hash SHA-256 (Impressão Digital do Arquivo)", margin + 4, y + 2);
  
  pdf.setFont("courier", "normal");
  pdf.setFontSize(7);
  pdf.setTextColor(0, 60, 120);
  pdf.text(certificateData.technical.hash, margin + 4, y + 10);

  y += 22;

  // Technical details grid - 2 columns side by side
  const colWidth = (contentWidth - 4) / 2;
  
  pdf.setFillColor(250, 251, 255);
  pdf.rect(margin, y - 3, colWidth, 18, "F");
  pdf.rect(margin + colWidth + 4, y - 3, colWidth, 18, "F");
  
  pdf.setTextColor(30, 40, 60);
  pdf.setFontSize(9);
  
  // Left column - Método
  pdf.setFont("helvetica", "normal");
  pdf.text("Método:", margin + 4, y + 2);
  pdf.setFont("helvetica", "bold");
  pdf.text(certificateData.technical.method, margin + 4, y + 8);
  
  // Left column - Blockchain
  pdf.setFont("helvetica", "normal");
  pdf.text("Blockchain:", margin + 4, y + 14);
  
  // Right column - Network
  pdf.setFont("helvetica", "bold");
  pdf.text(certificateData.technical.network, margin + colWidth + 8, y + 8);
  
  // Right column - Data de Confirmação
  pdf.setFont("helvetica", "normal");
  pdf.text("Confirmado em:", margin + colWidth + 8, y + 2);

  y += 22;

  // Confirmation date full width
  pdf.setFillColor(245, 250, 255);
  pdf.rect(margin, y - 3, contentWidth, 10, "F");
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(9);
  pdf.setTextColor(30, 40, 60);
  pdf.text(`Data de Confirmação: ${certificateData.confirmationDate}`, margin + 4, y + 4);

  y += 14;

  // TX Hash box
  pdf.setFillColor(240, 245, 255);
  pdf.setDrawColor(0, 100, 180);
  pdf.roundedRect(margin, y - 3, contentWidth, 16, 2, 2, "FD");
  
  pdf.setTextColor(60, 80, 120);
  pdf.setFontSize(8);
  pdf.setFont("helvetica", "bold");
  pdf.text("ID da Transação / Prova:", margin + 4, y + 2);
  
  pdf.setFont("courier", "normal");
  pdf.setFontSize(6);
  pdf.setTextColor(0, 60, 120);
  
  // Truncate TX hash to fit
  const txHashDisplay = certificateData.technical.txHash.length > 85 
    ? certificateData.technical.txHash.substring(0, 85) + "..."
    : certificateData.technical.txHash;
  pdf.text(txHashDisplay, margin + 4, y + 9);

  y += 20;

  // ===== LEGAL DISCLAIMER =====
  pdf.setFillColor(255, 250, 230);
  pdf.setDrawColor(200, 160, 50);
  pdf.setLineWidth(0.5);
  pdf.roundedRect(margin, y - 2, contentWidth, 26, 2, 2, "FD");
  
  pdf.setFontSize(9);
  pdf.setFont("helvetica", "bold");
  pdf.setTextColor(150, 100, 0);
  pdf.text("AVISO LEGAL IMPORTANTE", margin + 4, y + 4);
  
  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(6.5);
  pdf.setTextColor(100, 80, 30);
  
  const disclaimerLines = pdf.splitTextToSize(certificateData.legal.disclaimer, contentWidth - 8);
  disclaimerLines.forEach((line: string, index: number) => {
    if (index < 3) {
      pdf.text(line, margin + 4, y + 10 + (index * 4.5));
    }
  });

  y += 30;

  // ===== VERIFICATION SECTION WITH QR CODE =====
  const qrBoxHeight = 42;
  const qrSize = 34;
  
  pdf.setFillColor(235, 245, 255);
  pdf.setDrawColor(0, 100, 180);
  pdf.roundedRect(margin, y - 2, contentWidth, qrBoxHeight, 2, 2, "FD");
  
  // Text content on the left side (leave space for QR on right)
  const textAreaWidth = contentWidth - qrSize - 12;
  
  pdf.setFontSize(10);
  pdf.setFont("helvetica", "bold");
  pdf.setTextColor(0, 60, 120);
  pdf.text("VERIFICAÇÃO INDEPENDENTE", margin + 4, y + 5);
  
  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(7.5);
  pdf.setTextColor(40, 60, 100);
  
  const verificationText = "Este certificado pode ser verificado de forma independente através do protocolo OpenTimestamps ou em nosso portal de verificação pública.";
  const verifyLines = pdf.splitTextToSize(verificationText, textAreaWidth);
  verifyLines.forEach((line: string, index: number) => {
    if (index < 3) {
      pdf.text(line, margin + 4, y + 12 + (index * 4));
    }
  });
  
  pdf.setFontSize(7);
  pdf.setFont("helvetica", "bold");
  pdf.setTextColor(0, 80, 160);
  pdf.text(`ID: ${certificateData.technical.registroId}`, margin + 4, y + 28);
  
  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(6.5);
  pdf.setTextColor(60, 80, 120);
  pdf.text("webmarcas.net/verificar-registro", margin + 4, y + 34);
  
  // Add QR Code on the right - properly sized and positioned
  if (qrCodeDataUrl) {
    try {
      const qrX = pageWidth - margin - qrSize - 4;
      const qrY = y + (qrBoxHeight - qrSize) / 2;
      pdf.addImage(qrCodeDataUrl, "PNG", qrX, qrY, qrSize, qrSize);
    } catch (e) {
      console.error("Error adding QR code:", e);
      // Fallback: draw placeholder box
      pdf.setDrawColor(0, 100, 180);
      pdf.setFillColor(255, 255, 255);
      const qrX = pageWidth - margin - qrSize - 4;
      const qrY = y + (qrBoxHeight - qrSize) / 2;
      pdf.roundedRect(qrX, qrY, qrSize, qrSize, 2, 2, "FD");
      pdf.setFontSize(6);
      pdf.setTextColor(100, 100, 100);
      pdf.text("QR Code", qrX + qrSize/2, qrY + qrSize/2, { align: "center" });
    }
  }

  y += qrBoxHeight + 6;

  // ===== FOOTER =====
  const footerY = pageHeight - 20;
  
  // Footer line
  pdf.setDrawColor(0, 80, 160);
  pdf.setLineWidth(0.5);
  pdf.line(margin, footerY - 8, pageWidth - margin, footerY - 8);
  
  // Seal/badge area
  pdf.setFillColor(0, 80, 160);
  pdf.circle(pageWidth / 2, footerY - 2, 8, "F");
  pdf.setTextColor(255, 255, 255);
  pdf.setFontSize(6);
  pdf.setFont("helvetica", "bold");
  pdf.text("✓", pageWidth / 2, footerY, { align: "center" });
  
  // Footer text
  pdf.setTextColor(80, 90, 110);
  pdf.setFontSize(7);
  pdf.setFont("helvetica", "normal");
  pdf.text("WebMarcas • Uma empresa WebPatentes • www.webmarcas.net • ola@webmarcas.net • (11) 91112-0225", pageWidth / 2, footerY + 8, { align: "center" });
  
  pdf.setFontSize(6);
  pdf.setTextColor(120, 130, 150);
  pdf.text(`Documento gerado automaticamente • ID: ${certificateData.footer.certificateId}`, pageWidth / 2, footerY + 12, { align: "center" });

  // Generate blob
  return pdf.output("blob");
}

export async function downloadCertificate(registroId: string): Promise<void> {
  try {
    const blob = await generateCertificatePDF(registroId);
    
    // Create download link
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `certificado-webmarcas-${registroId}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    // Log download
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
      reason: "Registro ainda não confirmado",
      status: registro.status,
    };
  }

  if (!registro.hash_sha256) {
    return { eligible: false, reason: "Hash SHA-256 não disponível" };
  }

  const txData = registro.transacoes_blockchain?.[0];
  if (!txData) {
    return { eligible: false, reason: "Dados de blockchain não disponíveis" };
  }

  return { eligible: true, status: registro.status };
}

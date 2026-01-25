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

  // Generate PDF using jsPDF
  const pdf = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const margin = 20;
  const contentWidth = pageWidth - margin * 2;
  let y = margin;

  // Helper function to add text with word wrap
  const addWrappedText = (
    text: string,
    x: number,
    startY: number,
    maxWidth: number,
    lineHeight: number,
    align: "left" | "center" | "right" = "left"
  ): number => {
    const lines = pdf.splitTextToSize(text, maxWidth);
    lines.forEach((line: string, index: number) => {
      let textX = x;
      if (align === "center") {
        textX = pageWidth / 2;
      } else if (align === "right") {
        textX = pageWidth - margin;
      }
      pdf.text(line, textX, startY + index * lineHeight, { align });
    });
    return startY + lines.length * lineHeight;
  };

  // Header - Logo area (simplified without actual image)
  pdf.setFillColor(59, 130, 246); // Primary blue
  pdf.rect(0, 0, pageWidth, 35, "F");

  pdf.setTextColor(255, 255, 255);
  pdf.setFontSize(24);
  pdf.setFont("helvetica", "bold");
  pdf.text("WebMarcas", pageWidth / 2, 18, { align: "center" });
  pdf.setFontSize(10);
  pdf.setFont("helvetica", "normal");
  pdf.text(certificateData.subtitle, pageWidth / 2, 28, { align: "center" });

  y = 50;

  // Title
  pdf.setTextColor(30, 41, 59); // Dark blue-gray
  pdf.setFontSize(18);
  pdf.setFont("helvetica", "bold");
  pdf.text(certificateData.title, pageWidth / 2, y, { align: "center" });
  y += 15;

  // Emission date
  pdf.setFontSize(10);
  pdf.setFont("helvetica", "normal");
  pdf.setTextColor(100, 116, 139);
  pdf.text(`Emitido em: ${certificateData.emissionDate}`, pageWidth / 2, y, {
    align: "center",
  });
  y += 15;

  // Divider
  pdf.setDrawColor(203, 213, 225);
  pdf.line(margin, y, pageWidth - margin, y);
  y += 10;

  // Section: Titular
  pdf.setFontSize(12);
  pdf.setFont("helvetica", "bold");
  pdf.setTextColor(30, 41, 59);
  pdf.text("IDENTIFICAÇÃO DO TITULAR", margin, y);
  y += 8;

  pdf.setFontSize(10);
  pdf.setFont("helvetica", "normal");
  pdf.text(`Nome/Razão Social: ${certificateData.holder.name}`, margin, y);
  y += 6;
  pdf.text(`CPF/CNPJ: ${certificateData.holder.document || "Não informado"}`, margin, y);
  y += 12;

  // Section: Ativo
  pdf.setFontSize(12);
  pdf.setFont("helvetica", "bold");
  pdf.text("ATIVO REGISTRADO", margin, y);
  y += 8;

  pdf.setFontSize(10);
  pdf.setFont("helvetica", "normal");
  pdf.text(`Nome do Ativo: ${certificateData.asset.name}`, margin, y);
  y += 6;
  pdf.text(`Tipo: ${certificateData.asset.type}`, margin, y);
  y += 6;
  pdf.text(`Arquivo: ${certificateData.asset.fileName}`, margin, y);
  y += 6;
  pdf.text(`Data do Registro: ${certificateData.registrationDate}`, margin, y);
  y += 12;

  // Section: Dados Técnicos
  pdf.setFontSize(12);
  pdf.setFont("helvetica", "bold");
  pdf.text("DADOS TÉCNICOS DO REGISTRO", margin, y);
  y += 8;

  pdf.setFontSize(10);
  pdf.setFont("helvetica", "normal");

  // Hash SHA-256 (with box)
  pdf.setFillColor(248, 250, 252);
  pdf.setDrawColor(203, 213, 225);
  pdf.roundedRect(margin, y - 4, contentWidth, 16, 2, 2, "FD");
  pdf.setFontSize(9);
  pdf.text("Hash SHA-256:", margin + 3, y + 2);
  pdf.setFont("courier", "normal");
  pdf.setFontSize(7);
  pdf.text(certificateData.technical.hash, margin + 3, y + 9);
  y += 20;

  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(10);
  pdf.text(`Método de Timestamp: ${certificateData.technical.method}`, margin, y);
  y += 6;
  pdf.text(`Blockchain: ${certificateData.technical.network}`, margin, y);
  y += 6;
  pdf.text(`Data de Confirmação: ${certificateData.confirmationDate}`, margin, y);
  y += 6;
  
  // TX Hash
  pdf.text("ID da Transação/Prova:", margin, y);
  y += 5;
  pdf.setFontSize(7);
  pdf.setFont("courier", "normal");
  pdf.text(certificateData.technical.txHash, margin, y);
  y += 6;
  
  if (certificateData.technical.blockNumber) {
    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(10);
    pdf.text(`Bloco: ${certificateData.technical.blockNumber}`, margin, y);
    y += 6;
  }

  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(10);
  pdf.text(`ID Interno: ${certificateData.technical.registroId}`, margin, y);
  y += 15;

  // Section: Validade Técnica
  pdf.setFontSize(12);
  pdf.setFont("helvetica", "bold");
  pdf.text("VALIDADE TÉCNICA", margin, y);
  y += 8;

  pdf.setFontSize(9);
  pdf.setFont("helvetica", "normal");
  pdf.setTextColor(71, 85, 105);
  y = addWrappedText(certificateData.legal.validity, margin, y, contentWidth, 5);
  y += 10;

  // Section: Aviso Legal (highlighted box)
  pdf.setFillColor(254, 249, 195); // Yellow background
  pdf.setDrawColor(234, 179, 8);
  const disclaimerLines = pdf.splitTextToSize(certificateData.legal.disclaimer, contentWidth - 6);
  const disclaimerHeight = disclaimerLines.length * 4.5 + 12;
  pdf.roundedRect(margin, y - 4, contentWidth, disclaimerHeight, 2, 2, "FD");

  pdf.setFontSize(10);
  pdf.setFont("helvetica", "bold");
  pdf.setTextColor(133, 77, 14);
  pdf.text("AVISO LEGAL IMPORTANTE", margin + 3, y + 2);
  y += 8;

  pdf.setFontSize(8);
  pdf.setFont("helvetica", "normal");
  y = addWrappedText(certificateData.legal.disclaimer, margin + 3, y, contentWidth - 6, 4.5);
  y += 10;

  // Section: Verificação Independente
  pdf.setTextColor(30, 41, 59);
  pdf.setFontSize(12);
  pdf.setFont("helvetica", "bold");
  pdf.text("VERIFICAÇÃO INDEPENDENTE", margin, y);
  y += 8;

  pdf.setFontSize(9);
  pdf.setFont("helvetica", "normal");
  pdf.setTextColor(71, 85, 105);
  y = addWrappedText(certificateData.legal.verification, margin, y, contentWidth, 5);
  y += 5;

  // Footer
  const footerY = pageHeight - 25;
  pdf.setDrawColor(203, 213, 225);
  pdf.line(margin, footerY - 5, pageWidth - margin, footerY - 5);

  pdf.setFontSize(9);
  pdf.setFont("helvetica", "normal");
  pdf.setTextColor(100, 116, 139);
  pdf.text(certificateData.footer.company, pageWidth / 2, footerY, {
    align: "center",
  });
  pdf.text(certificateData.footer.contact, pageWidth / 2, footerY + 5, {
    align: "center",
  });

  pdf.setFontSize(8);
  pdf.text(`ID: ${certificateData.footer.certificateId}`, pageWidth / 2, footerY + 10, {
    align: "center",
  });

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

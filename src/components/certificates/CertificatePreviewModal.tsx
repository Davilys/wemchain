import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Download, 
  Loader2, 
  Shield, 
  CheckCircle2, 
  Hash, 
  Calendar,
  Clock,
  X
} from "lucide-react";
import { formatDocumentForDisplay } from "@/lib/documentFormatters";
import { TIPO_ATIVO_LABELS } from "@/pages/NovoRegistro";

interface CertificatePreviewData {
  id: string;
  nome_ativo: string;
  tipo_ativo: string;
  arquivo_nome: string;
  hash_sha256: string;
  created_at: string;
  holder_name?: string;
  holder_document?: string;
  timestamp_method?: string;
  network?: string;
  confirmed_at?: string;
}

interface CertificatePreviewModalProps {
  open: boolean;
  onClose: () => void;
  onDownload: () => Promise<void>;
  data: CertificatePreviewData | null;
  isDownloading?: boolean;
}

export function CertificatePreviewModal({
  open,
  onClose,
  onDownload,
  data,
  isDownloading = false,
}: CertificatePreviewModalProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getMethodLabel = (method?: string) => {
    switch (method) {
      case "OPEN_TIMESTAMP":
        return "OpenTimestamps (Bitcoin)";
      case "BYTESTAMP":
        return "ByteStamp";
      default:
        return "Sistema WebMarcas";
    }
  };

  const handleDownload = async () => {
    await onDownload();
  };

  if (!data) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-display flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            Preview do Certificado
          </DialogTitle>
          <DialogDescription className="font-body">
            Confira os dados antes de baixar o certificado em PDF
          </DialogDescription>
        </DialogHeader>

        {/* Certificate Preview Content */}
        <div className="space-y-4 py-4">
          {/* Status Badge */}
          <div className="flex items-center justify-center gap-2">
            <Badge className="bg-success/10 text-success border-success/20">
              <CheckCircle2 className="h-3 w-3 mr-1" />
              Registro Confirmado
            </Badge>
            <Badge variant="outline">
              <Clock className="h-3 w-3 mr-1" />
              {getMethodLabel(data.timestamp_method)}
            </Badge>
          </div>

          {/* Header Section - Simulated Paper */}
          <div className="bg-muted/30 rounded-lg p-4 border border-border">
            <div className="text-center border-b border-border pb-3 mb-3">
              <h3 className="font-display text-lg font-bold text-foreground">
                CERTIFICADO DE PROVA DE ANTERIORIDADE
              </h3>
              <p className="font-body text-sm text-muted-foreground">
                Registro Imutável em Blockchain
              </p>
            </div>

            {/* Holder Info */}
            {(data.holder_name || data.holder_document) && (
              <div className="bg-background rounded-md p-3 mb-3 border">
                <p className="font-body text-xs text-muted-foreground mb-1">
                  Titular do Registro
                </p>
                <p className="font-body text-sm font-medium text-foreground">
                  {data.holder_name || "Não informado"}
                </p>
                {data.holder_document && (
                  <p className="font-body text-xs text-muted-foreground">
                    {formatDocumentForDisplay(data.holder_document)}
                  </p>
                )}
              </div>
            )}

            {/* Asset Info */}
            <div className="grid grid-cols-2 gap-3 mb-3">
              <div className="bg-background rounded-md p-3 border">
                <p className="font-body text-xs text-muted-foreground mb-1">
                  Nome do Ativo
                </p>
                <p className="font-body text-sm font-medium text-foreground truncate">
                  {data.nome_ativo}
                </p>
              </div>
              <div className="bg-background rounded-md p-3 border">
                <p className="font-body text-xs text-muted-foreground mb-1">
                  Tipo
                </p>
                <p className="font-body text-sm font-medium text-foreground">
                  {TIPO_ATIVO_LABELS[data.tipo_ativo] || data.tipo_ativo?.replace("_", " ")}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 mb-3">
              <div className="bg-background rounded-md p-3 border">
                <p className="font-body text-xs text-muted-foreground mb-1">
                  Arquivo Registrado
                </p>
                <p className="font-body text-sm font-medium text-foreground truncate">
                  {data.arquivo_nome}
                </p>
              </div>
              <div className="bg-background rounded-md p-3 border">
                <p className="font-body text-xs text-muted-foreground mb-1 flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  Data do Registro
                </p>
                <p className="font-body text-sm font-medium text-foreground">
                  {formatDate(data.created_at)}
                </p>
              </div>
            </div>

            {/* Hash Section */}
            <div className="bg-primary/5 rounded-md p-3 border border-primary/20">
              <p className="font-body text-xs text-muted-foreground mb-1 flex items-center gap-1">
                <Hash className="h-3 w-3" />
                Hash SHA-256 (Impressão Digital)
              </p>
              <code className="font-mono text-[10px] text-primary break-all block">
                {data.hash_sha256}
              </code>
            </div>

            {/* Confirmation Info */}
            {data.confirmed_at && (
              <div className="mt-3 bg-success/5 rounded-md p-3 border border-success/20">
                <p className="font-body text-xs text-muted-foreground mb-1">
                  Confirmado em Blockchain
                </p>
                <p className="font-body text-sm font-medium text-success">
                  {formatDate(data.confirmed_at)}
                </p>
                <p className="font-body text-xs text-muted-foreground mt-1">
                  Rede: {data.network === "opentimestamps" ? "Bitcoin" : data.network}
                </p>
              </div>
            )}
          </div>

          {/* Legal Notice */}
          <div className="bg-amber-50 dark:bg-amber-950/20 rounded-lg p-3 border border-amber-200 dark:border-amber-800">
            <p className="font-body text-xs text-amber-800 dark:text-amber-200">
              <strong>Aviso Legal:</strong> Este certificado NÃO SUBSTITUI o registro de marca 
              junto ao INPI. A prova de anterioridade em blockchain é um elemento técnico 
              complementar conforme Art. 411 do CPC.
            </p>
          </div>
        </div>

        <DialogFooter className="flex gap-2 sm:gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            className="flex-1 font-body"
          >
            <X className="h-4 w-4 mr-2" />
            Fechar
          </Button>
          <Button
            onClick={handleDownload}
            disabled={isDownloading}
            className="flex-1 bg-primary text-primary-foreground font-body"
          >
            {isDownloading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Gerando PDF...
              </>
            ) : (
              <>
                <Download className="h-4 w-4 mr-2" />
                Baixar PDF
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

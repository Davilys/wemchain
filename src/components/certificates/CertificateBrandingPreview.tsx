import { cn } from "@/lib/utils";
import { Shield, Award, FileCheck } from "lucide-react";

interface CertificateBrandingPreviewProps {
  logoUrl?: string | null;
  displayName: string;
  documentNumber: string;
  primaryColor: string;
  secondaryColor: string;
}

export function CertificateBrandingPreview({
  logoUrl,
  displayName,
  documentNumber,
  primaryColor,
  secondaryColor,
}: CertificateBrandingPreviewProps) {
  return (
    <div className="w-full aspect-[1/1.4] bg-white rounded-xl border shadow-lg overflow-hidden relative">
      {/* Watermark */}
      <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] pointer-events-none">
        <span className="text-6xl font-bold rotate-45 text-gray-900">
          {displayName.split(" ")[0] || "EMPRESA"}
        </span>
      </div>

      {/* Border */}
      <div 
        className="absolute inset-2 border-2 rounded-lg pointer-events-none"
        style={{ borderColor: `${primaryColor}30` }}
      />

      <div className="relative h-full flex flex-col p-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            {logoUrl ? (
              <img 
                src={logoUrl} 
                alt="Logo" 
                className="h-8 w-8 object-contain rounded"
              />
            ) : (
              <div 
                className="h-8 w-8 rounded flex items-center justify-center"
                style={{ backgroundColor: `${primaryColor}20` }}
              >
                <Shield className="h-4 w-4" style={{ color: primaryColor }} />
              </div>
            )}
            <div>
              <p 
                className="text-[10px] font-bold leading-tight"
                style={{ color: primaryColor }}
              >
                {displayName || "Nome da Empresa"}
              </p>
              <p className="text-[7px] text-gray-500 leading-tight">
                {documentNumber || "00.000.000/0001-00"}
              </p>
            </div>
          </div>
        </div>

        {/* Accent line */}
        <div 
          className="h-0.5 w-full mb-3"
          style={{ backgroundColor: secondaryColor }}
        />

        {/* Title */}
        <div className="text-center mb-3">
          <p 
            className="text-[8px] font-bold uppercase tracking-wide"
            style={{ color: primaryColor }}
          >
            Certificado de Prova de Anterioridade
          </p>
          <p className="text-[6px] text-gray-500">
            Registro Imutável em Blockchain
          </p>
        </div>

        {/* Content blocks */}
        <div className="flex-1 space-y-2">
          {/* Holder section */}
          <div 
            className="p-2 rounded"
            style={{ backgroundColor: `${primaryColor}08` }}
          >
            <p 
              className="text-[6px] font-bold mb-1"
              style={{ color: primaryColor }}
            >
              TITULAR
            </p>
            <div className="h-1.5 w-20 bg-gray-200 rounded" />
            <div className="h-1.5 w-16 bg-gray-200 rounded mt-1" />
          </div>

          {/* Asset section */}
          <div 
            className="p-2 rounded"
            style={{ backgroundColor: `${primaryColor}08` }}
          >
            <p 
              className="text-[6px] font-bold mb-1"
              style={{ color: primaryColor }}
            >
              ATIVO REGISTRADO
            </p>
            <div className="h-1.5 w-24 bg-gray-200 rounded" />
            <div className="h-1.5 w-14 bg-gray-200 rounded mt-1" />
          </div>

          {/* Hash section */}
          <div className="p-2 rounded bg-gray-50 border border-gray-100">
            <p className="text-[5px] text-gray-500 mb-1">HASH SHA-256</p>
            <div className="h-1 w-full bg-gray-200 rounded" />
          </div>

          {/* Technical data */}
          <div className="grid grid-cols-2 gap-1">
            <div 
              className="p-1.5 rounded"
              style={{ backgroundColor: `${primaryColor}08` }}
            >
              <div className="h-1 w-8 bg-gray-200 rounded" />
              <div className="h-1.5 w-10 bg-gray-300 rounded mt-1" />
            </div>
            <div 
              className="p-1.5 rounded"
              style={{ backgroundColor: `${primaryColor}08` }}
            >
              <div className="h-1 w-8 bg-gray-200 rounded" />
              <div className="h-1.5 w-10 bg-gray-300 rounded mt-1" />
            </div>
          </div>
        </div>

        {/* QR Code placeholder */}
        <div className="flex items-end justify-between mt-2">
          <div className="flex-1">
            <p 
              className="text-[6px] font-medium"
              style={{ color: primaryColor }}
            >
              VERIFICAÇÃO
            </p>
            <div className="h-1 w-20 bg-gray-200 rounded mt-0.5" />
          </div>
          <div 
            className="h-10 w-10 rounded border-2"
            style={{ borderColor: `${secondaryColor}50` }}
          >
            <div className="h-full w-full bg-gradient-to-br from-gray-100 to-gray-200 rounded-sm flex items-center justify-center">
              <span className="text-[5px] text-gray-400">QR</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div 
          className="mt-2 pt-2 border-t text-center"
          style={{ borderColor: `${primaryColor}20` }}
        >
          <p className="text-[6px] text-gray-400">
            Emitido via <span className="font-medium">WebMarcas</span>
          </p>
        </div>
      </div>

      {/* Badge overlay */}
      <div 
        className={cn(
          "absolute top-2 right-2 px-1.5 py-0.5 rounded text-[5px] font-bold text-white shadow-sm"
        )}
        style={{ backgroundColor: secondaryColor }}
      >
        PREVIEW
      </div>
    </div>
  );
}

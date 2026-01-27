import { Shield, CheckCircle2, Clock, Award, FileText, Lock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import webmarcasLogo from "@/assets/webmarcas-logo.png";

export function CertificatePreview() {
  return (
    <div className="relative group">
      {/* Glow effect behind certificate */}
      <div className="absolute inset-0 bg-primary/20 rounded-2xl blur-2xl opacity-50 group-hover:opacity-75 transition-opacity duration-500" />
      
      {/* Certificate Card */}
      <Card className="relative bg-card border-border/50 shadow-2xl overflow-hidden animate-fade-in">
        <CardContent className="p-0">
          {/* Certificate Header */}
          <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent border-b border-primary/20 p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <img 
                  src={webmarcasLogo} 
                  alt="WebMarcas" 
                  className="h-8 w-8 object-contain"
                />
                <div>
                  <h4 className="font-display text-sm font-bold text-foreground">WebMarcas</h4>
                  <p className="font-body text-[10px] text-muted-foreground">Uma empresa WebPatentes</p>
                </div>
              </div>
              <Badge className="bg-success/10 text-success border-success/20 text-[10px] px-2 py-0.5">
                <CheckCircle2 className="h-2.5 w-2.5 mr-1" />
                Verificado
              </Badge>
            </div>
          </div>

          {/* Certificate Body */}
          <div className="p-4 space-y-4">
            {/* Premium Badge + Title */}
            <div className="text-center border-b border-border/50 pb-4">
              <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 mb-3">
                <Shield className="h-3 w-3 text-primary" />
                <span className="text-[10px] font-semibold text-primary">Prova de Anterioridade</span>
              </div>
              <h3 className="font-display text-base font-extrabold text-foreground tracking-tight">
                Certificado de Registro em <span className="text-primary">Blockchain</span>
              </h3>
            </div>

            {/* Asset Info */}
            <div className="bg-muted/30 rounded-lg p-3 space-y-2">
              <div className="flex items-center gap-2">
                <FileText className="h-3.5 w-3.5 text-primary" />
                <span className="text-xs font-semibold text-foreground">Ativo Registrado</span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-[10px]">
                <div>
                  <p className="text-muted-foreground">Nome</p>
                  <p className="font-medium text-foreground truncate">Logo Empresa XYZ</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Tipo</p>
                  <p className="font-medium text-foreground">Logotipo</p>
                </div>
              </div>
            </div>

            {/* Hash Section */}
            <div className="bg-gradient-to-r from-primary/10 to-primary/5 rounded-lg p-3 border border-primary/20">
              <div className="flex items-center gap-2 mb-2">
                <Lock className="h-3.5 w-3.5 text-primary" />
                <span className="text-xs font-semibold text-foreground">Hash SHA-256</span>
              </div>
              <code className="text-[8px] text-muted-foreground font-mono break-all leading-relaxed block">
                a7b9c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6...
              </code>
            </div>

            {/* Blockchain Info */}
            <div className="flex items-center justify-between text-[10px] pt-2 border-t border-border/30">
              <div className="flex items-center gap-1.5">
                <Clock className="h-3 w-3 text-muted-foreground" />
                <span className="text-muted-foreground">27/01/2026 • 14:32</span>
              </div>
              <Badge variant="outline" className="text-[9px] px-2 py-0.5 border-primary/30 text-primary">
                OpenTimestamps
              </Badge>
            </div>
          </div>

          {/* Certificate Footer */}
          <div className="bg-muted/20 border-t border-border/30 p-3 text-center">
            <p className="text-[9px] text-muted-foreground">
              Documento verificável em <span className="text-primary font-medium">webmarcas.net/verificar</span>
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Floating decorations */}
      <div className="absolute -top-3 -right-3 w-16 h-16 bg-primary/10 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      <div className="absolute -bottom-3 -left-3 w-12 h-12 bg-primary/5 rounded-full blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
    </div>
  );
}

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
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Loader2, Shield, ChevronDown, ChevronUp, ExternalLink } from "lucide-react";
import { useConsent } from "@/hooks/useConsent";
import { toast } from "@/hooks/use-toast";
import ReactMarkdown from "react-markdown";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

interface ConsentModalProps {
  open: boolean;
  onComplete: () => void;
}

export function ConsentModal({ open, onComplete }: ConsentModalProps) {
  const { documents, acceptDocument, consentStatus } = useConsent();
  const [accepted, setAccepted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [expandedDoc, setExpandedDoc] = useState<string | null>(null);

  const termsDoc = documents.find((d) => d.document_type === "terms_of_use");
  const privacyDoc = documents.find((d) => d.document_type === "privacy_policy");
  const blockchainDoc = documents.find((d) => d.document_type === "blockchain_policy");

  const handleAcceptAll = async () => {
    if (!accepted) return;
    
    setLoading(true);
    try {
      if (!consentStatus.terms_of_use) {
        await acceptDocument("terms_of_use");
      }
      if (!consentStatus.privacy_policy) {
        await acceptDocument("privacy_policy");
      }
      if (!consentStatus.blockchain_policy) {
        await acceptDocument("blockchain_policy");
      }

      toast({
        title: "Termos aceitos",
        description: "Você pode utilizar a plataforma normalmente.",
      });

      onComplete();
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível registrar seu aceite. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const toggleDocument = (docType: string) => {
    setExpandedDoc(expandedDoc === docType ? null : docType);
  };

  const documentItems = [
    { type: "terms_of_use", doc: termsDoc, label: "Termos de Uso", href: "/termos-de-uso" },
    { type: "privacy_policy", doc: privacyDoc, label: "Política de Privacidade", href: "/politica-privacidade" },
    { type: "blockchain_policy", doc: blockchainDoc, label: "Política de Blockchain", href: "/politica-blockchain" },
  ];

  return (
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogContent className="max-w-lg max-h-[85vh] bg-card border-border">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <Shield className="h-5 w-5 text-primary" />
            </div>
            <div>
              <DialogTitle className="font-display text-xl">
                Termos e Políticas
              </DialogTitle>
              <DialogDescription className="font-body">
                Para continuar, aceite nossos termos
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-2 py-2">
          {documentItems.map(({ type, doc, label, href }) => (
            <Collapsible key={type} open={expandedDoc === type}>
              <div className="rounded-lg border border-border bg-muted/30 overflow-hidden">
                <div className="flex items-center justify-between p-3">
                  <span className="text-sm font-medium">{label}</span>
                  <div className="flex items-center gap-1">
                    <a
                      href={href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-muted-foreground hover:text-primary flex items-center gap-1 px-2 py-1 rounded hover:bg-muted transition-colors"
                    >
                      <ExternalLink className="h-3 w-3" />
                      Nova aba
                    </a>
                    <CollapsibleTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 px-2 text-xs"
                        onClick={() => toggleDocument(type)}
                      >
                        {expandedDoc === type ? (
                          <>
                            <ChevronUp className="h-3 w-3 mr-1" />
                            Ocultar
                          </>
                        ) : (
                          <>
                            <ChevronDown className="h-3 w-3 mr-1" />
                            Ver aqui
                          </>
                        )}
                      </Button>
                    </CollapsibleTrigger>
                  </div>
                </div>
                <CollapsibleContent>
                  <ScrollArea className="h-48 border-t border-border">
                    <div className="p-4 prose prose-invert prose-sm max-w-none">
                      {doc?.content ? (
                        <ReactMarkdown>{doc.content}</ReactMarkdown>
                      ) : (
                        <p className="text-muted-foreground text-sm">Carregando...</p>
                      )}
                    </div>
                  </ScrollArea>
                </CollapsibleContent>
              </div>
            </Collapsible>
          ))}
        </div>

        <div className="flex items-start gap-3 p-4 rounded-lg bg-primary/5 border border-primary/20">
          <Checkbox
            id="accept-all"
            checked={accepted}
            onCheckedChange={(checked) => setAccepted(checked as boolean)}
            className="mt-0.5"
          />
          <label
            htmlFor="accept-all"
            className="text-sm font-body leading-relaxed cursor-pointer"
          >
            Li e aceito os <strong>Termos de Uso</strong>, a <strong>Política de Privacidade</strong> e a <strong>Política de Blockchain</strong>
          </label>
        </div>

        <DialogFooter>
          <Button
            onClick={handleAcceptAll}
            disabled={!accepted || loading}
            className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Salvando...
              </>
            ) : (
              "Confirmar e Continuar"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

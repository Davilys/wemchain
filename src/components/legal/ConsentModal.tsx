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
import { Loader2, FileText, Shield, Link2 } from "lucide-react";
import { useConsent } from "@/hooks/useConsent";
import { toast } from "@/hooks/use-toast";
import ReactMarkdown from "react-markdown";

interface ConsentModalProps {
  open: boolean;
  onComplete: () => void;
}

export function ConsentModal({ open, onComplete }: ConsentModalProps) {
  const { documents, acceptDocument, consentStatus } = useConsent();
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [privacyAccepted, setPrivacyAccepted] = useState(false);
  const [blockchainAccepted, setBlockchainAccepted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<"terms" | "privacy" | "blockchain">("terms");

  const termsDoc = documents.find((d) => d.document_type === "terms_of_use");
  const privacyDoc = documents.find((d) => d.document_type === "privacy_policy");
  const blockchainDoc = documents.find((d) => d.document_type === "blockchain_policy");

  const handleAcceptAll = async () => {
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

  const currentDoc = step === "terms" ? termsDoc : step === "privacy" ? privacyDoc : blockchainDoc;
  const currentAccepted = step === "terms" ? termsAccepted : step === "privacy" ? privacyAccepted : blockchainAccepted;
  const setCurrentAccepted = step === "terms" ? setTermsAccepted : step === "privacy" ? setPrivacyAccepted : setBlockchainAccepted;

  const handleNext = () => {
    if (step === "terms") setStep("privacy");
    else if (step === "privacy") setStep("blockchain");
    else handleAcceptAll();
  };

  const canProceed = currentAccepted;
  const isLastStep = step === "blockchain";

  const StepIcon = step === "terms" ? FileText : step === "privacy" ? Shield : Link2;

  return (
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogContent className="max-w-2xl max-h-[90vh] bg-card border-border">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <StepIcon className="h-5 w-5 text-primary" />
            </div>
            <div>
              <DialogTitle className="font-display text-xl">
                {currentDoc?.title || "Termos e Políticas"}
              </DialogTitle>
              <DialogDescription className="font-body">
                {step === "terms" && "Passo 1 de 3 - Termos de Uso"}
                {step === "privacy" && "Passo 2 de 3 - Política de Privacidade"}
                {step === "blockchain" && "Passo 3 de 3 - Política de Blockchain"}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <ScrollArea className="max-h-[50vh] pr-4">
          <div className="prose prose-invert prose-sm max-w-none">
            {currentDoc?.content ? (
              <ReactMarkdown>{currentDoc.content}</ReactMarkdown>
            ) : (
              <p className="text-muted-foreground">Carregando documento...</p>
            )}
          </div>
        </ScrollArea>

        <div className="flex items-start gap-3 p-4 rounded-lg bg-muted/50 border border-border">
          <Checkbox
            id={`accept-${step}`}
            checked={currentAccepted}
            onCheckedChange={(checked) => setCurrentAccepted(checked as boolean)}
          />
          <label
            htmlFor={`accept-${step}`}
            className="text-sm font-body leading-relaxed cursor-pointer"
          >
            Li e aceito {step === "terms" && "os Termos de Uso"}
            {step === "privacy" && "a Política de Privacidade"}
            {step === "blockchain" && "a Política de Registro em Blockchain"}
          </label>
        </div>

        <DialogFooter className="flex gap-2">
          {step !== "terms" && (
            <Button
              variant="outline"
              onClick={() => setStep(step === "blockchain" ? "privacy" : "terms")}
              disabled={loading}
            >
              Voltar
            </Button>
          )}
          <Button
            onClick={handleNext}
            disabled={!canProceed || loading}
            className="bg-primary text-primary-foreground hover:bg-primary/90"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Salvando...
              </>
            ) : isLastStep ? (
              "Confirmar e Continuar"
            ) : (
              "Próximo"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

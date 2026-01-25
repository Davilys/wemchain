import { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { 
  Loader2, 
  Hash, 
  Link2, 
  CheckCircle2, 
  FileText,
  Shield,
  ArrowRight,
  Clock,
  AlertTriangle
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "@/hooks/use-toast";

interface ProcessStep {
  id: string;
  label: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  status: "pending" | "active" | "completed" | "error";
}

export default function Processando() {
  const { id } = useParams<{ id: string }>();
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState(0);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [processingError, setProcessingError] = useState<string | null>(null);
  const [timestampMethod, setTimestampMethod] = useState<string | null>(null);

  const [steps, setSteps] = useState<ProcessStep[]>([
    { id: "hash", label: "Gerando Hash", description: "Criando impressão digital SHA-256", icon: Hash, status: "active" },
    { id: "prepare", label: "Preparando Timestamp", description: "Configurando dados", icon: Link2, status: "pending" },
    { id: "timestamp", label: "Registrando Timestamp", description: "Enviando para serviço de prova", icon: Shield, status: "pending" },
    { id: "confirm", label: "Confirmando", description: "Aguardando confirmação", icon: Clock, status: "pending" },
    { id: "certificate", label: "Gerando Certificado", description: "Criando certificado digital", icon: FileText, status: "pending" }
  ]);

  const updateStep = useCallback((stepIndex: number, status: ProcessStep["status"]) => {
    setSteps(prevSteps => prevSteps.map((step, i) => ({
      ...step,
      status: i < stepIndex ? "completed" : i === stepIndex ? status : "pending"
    })));
    setCurrentStepIndex(stepIndex);
    setProgress(Math.min(((stepIndex + 1) / 5) * 100, 100));
  }, []);

  const processRegistro = useCallback(async (registroId: string) => {
    try {
      updateStep(0, "active");
      await new Promise(r => setTimeout(r, 1000));
      updateStep(0, "completed");
      updateStep(1, "active");
      await new Promise(r => setTimeout(r, 800));
      updateStep(1, "completed");
      updateStep(2, "active");
      
      const response = await supabase.functions.invoke('process-registro', { body: { registroId } });
      if (response.error) throw new Error(response.error.message || "Erro ao processar");
      
      setTimestampMethod(response.data.method);
      updateStep(2, "completed");
      updateStep(3, "active");
      await new Promise(r => setTimeout(r, 1000));
      updateStep(3, "completed");
      updateStep(4, "active");
      await new Promise(r => setTimeout(r, 800));
      updateStep(4, "completed");
      setProgress(100);
      
      toast({ title: "Registro concluído!", description: response.data.method === "OPEN_TIMESTAMP" ? "Timestamp via OpenTimestamps" : "Timestamp criado" });
    } catch (error: any) {
      setProcessingError(error.message);
      setSteps(prev => prev.map((s, i) => ({ ...s, status: i === currentStepIndex ? "error" : s.status })));
      toast({ title: "Erro", description: error.message, variant: "destructive" });
    }
  }, [updateStep, currentStepIndex]);

  useEffect(() => {
    if (!authLoading && !user) { navigate("/login"); return; }
    if (id && user) {
      supabase.from("registros").select("*, transacoes_blockchain (*)").eq("id", id).single()
        .then(({ data, error }) => {
          if (error || !data) { navigate("/dashboard"); return; }
          if (data.status === "confirmado" && data.transacoes_blockchain?.length > 0) { navigate(`/certificado/${id}`); return; }
          if (data.status === "pendente") processRegistro(id);
          setLoading(false);
        });
    }
  }, [id, user, authLoading, navigate, processRegistro]);

  if (authLoading || loading) return <div className="min-h-screen bg-background flex items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;

  const allCompleted = steps.every(step => step.status === "completed");
  const hasError = processingError !== null;

  return (
    <div className="min-h-screen bg-gradient-hero flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        <Card className="border-border bg-card shadow-2xl">
          <CardContent className="pt-8 pb-10 px-6 md:px-10">
            <div className="text-center mb-10">
              <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
                {hasError ? <AlertTriangle className="h-10 w-10 text-destructive" /> : allCompleted ? <CheckCircle2 className="h-10 w-10 text-success" /> : <Loader2 className="h-10 w-10 text-primary animate-spin" />}
              </div>
              <h1 className="font-display text-2xl md:text-3xl font-bold text-foreground mb-2">
                {hasError ? "Erro no Processamento" : allCompleted ? "Registro Concluído!" : "Processando seu Registro"}
              </h1>
              <p className="font-body text-muted-foreground">
                {hasError ? processingError : allCompleted ? (timestampMethod === "OPEN_TIMESTAMP" ? "Registrado via OpenTimestamps (Bitcoin)" : "Registrado com sucesso") : "Aguarde enquanto registramos seu arquivo"}
              </p>
            </div>
            <div className="mb-10">
              <div className="flex justify-between text-sm mb-2"><span className="font-body text-muted-foreground">Progresso</span><span className="font-body font-medium text-foreground">{Math.round(progress)}%</span></div>
              <Progress value={progress} className="h-3" />
            </div>
            <div className="space-y-4 mb-10">
              {steps.map((step) => (
                <div key={step.id} className={cn("flex items-center gap-4 p-4 rounded-xl transition-all", step.status === "active" && "bg-primary/5 border border-primary/20", step.status === "completed" && "bg-success/5 border border-success/20", step.status === "error" && "bg-destructive/5 border border-destructive/20", step.status === "pending" && "bg-muted/30 border border-transparent opacity-50")}>
                  <div className={cn("h-12 w-12 rounded-full flex items-center justify-center flex-shrink-0", step.status === "active" && "bg-primary/10", step.status === "completed" && "bg-success/10", step.status === "error" && "bg-destructive/10", step.status === "pending" && "bg-muted")}>
                    {step.status === "completed" ? <CheckCircle2 className="h-6 w-6 text-success" /> : step.status === "active" ? <Loader2 className="h-6 w-6 text-primary animate-spin" /> : step.status === "error" ? <AlertTriangle className="h-6 w-6 text-destructive" /> : <step.icon className="h-6 w-6 text-muted-foreground" />}
                  </div>
                  <div className="flex-1"><p className={cn("font-body font-medium", step.status === "pending" ? "text-muted-foreground" : "text-foreground")}>{step.label}</p><p className="font-body text-sm text-muted-foreground">{step.description}</p></div>
                  {step.status === "completed" && <CheckCircle2 className="h-5 w-5 text-success flex-shrink-0" />}
                </div>
              ))}
            </div>
            {allCompleted && <Button onClick={() => navigate(`/certificado/${id}`)} className="w-full bg-primary text-primary-foreground hover:bg-primary/90 font-body font-semibold py-6">Ver Certificado<ArrowRight className="ml-2 h-5 w-5" /></Button>}
            {hasError && <div className="space-y-3"><Button onClick={() => { setProcessingError(null); setSteps(p => p.map(s => ({ ...s, status: "pending" as const }))); setProgress(0); if (id) processRegistro(id); }} className="w-full bg-primary text-primary-foreground hover:bg-primary/90 font-body font-semibold py-6">Tentar Novamente</Button><Button variant="outline" onClick={() => navigate("/dashboard")} className="w-full font-body py-6">Voltar para o Dashboard</Button></div>}
            {!allCompleted && !hasError && <p className="text-center font-body text-sm text-muted-foreground">Por favor, não feche esta página.</p>}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

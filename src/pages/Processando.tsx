import { useEffect, useState } from "react";
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
  Clock
} from "lucide-react";
import { cn } from "@/lib/utils";

interface ProcessStep {
  id: string;
  label: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  status: "pending" | "active" | "completed";
}

export default function Processando() {
  const { id } = useParams<{ id: string }>();
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  
  const [registro, setRegistro] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState(0);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  const [steps, setSteps] = useState<ProcessStep[]>([
    {
      id: "hash",
      label: "Gerando Hash",
      description: "Criando impressão digital do arquivo",
      icon: Hash,
      status: "active"
    },
    {
      id: "prepare",
      label: "Preparando Transação",
      description: "Configurando dados para blockchain",
      icon: Link2,
      status: "pending"
    },
    {
      id: "blockchain",
      label: "Registrando na Blockchain",
      description: "Gravando hash na rede Polygon",
      icon: Shield,
      status: "pending"
    },
    {
      id: "confirm",
      label: "Confirmando",
      description: "Aguardando confirmações da rede",
      icon: Clock,
      status: "pending"
    },
    {
      id: "certificate",
      label: "Gerando Certificado",
      description: "Criando certificado digital",
      icon: FileText,
      status: "pending"
    }
  ]);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/login");
      return;
    }

    if (id && user) {
      fetchRegistro();
    }
  }, [id, user, authLoading, navigate]);

  const fetchRegistro = async () => {
    try {
      const { data, error } = await supabase
        .from("registros")
        .select(`
          *,
          transacoes_blockchain (*)
        `)
        .eq("id", id)
        .single();

      if (error) throw error;
      if (!data) {
        navigate("/dashboard");
        return;
      }

      setRegistro(data);

      // If already confirmed, redirect to certificate
      if (data.status === "confirmado" && data.transacoes_blockchain) {
        navigate(`/certificado/${id}`);
        return;
      }

      // Simulate processing steps (in production, this would be real-time updates)
      simulateProcessing();
    } catch (error) {
      console.error("Erro ao buscar registro:", error);
      navigate("/dashboard");
    } finally {
      setLoading(false);
    }
  };

  const simulateProcessing = () => {
    // This simulates the processing steps
    // In production, you would poll the backend or use realtime subscriptions
    const stepDurations = [2000, 2500, 3000, 2000, 1500];
    let totalDuration = 0;
    let accumulatedProgress = 0;

    stepDurations.forEach((duration, index) => {
      setTimeout(() => {
        setSteps(prevSteps => 
          prevSteps.map((step, i) => ({
            ...step,
            status: i < index + 1 ? "completed" : i === index + 1 ? "active" : "pending"
          }))
        );
        setCurrentStepIndex(index + 1);
      }, totalDuration);

      // Progress animation
      const startProgress = accumulatedProgress;
      const endProgress = ((index + 1) / stepDurations.length) * 100;
      const progressDuration = duration;
      const steps = 20;
      const progressPerStep = (endProgress - startProgress) / steps;
      const stepInterval = progressDuration / steps;

      for (let i = 0; i <= steps; i++) {
        setTimeout(() => {
          setProgress(startProgress + (progressPerStep * i));
        }, totalDuration + (stepInterval * i));
      }

      accumulatedProgress = endProgress;
      totalDuration += duration;
    });

    // After all steps complete, navigate to payment (or certificate in demo)
    setTimeout(() => {
      // In production, navigate to payment page
      // For demo, we'll show a completion state
      setSteps(prevSteps => 
        prevSteps.map(step => ({ ...step, status: "completed" as const }))
      );
      setProgress(100);
    }, totalDuration);
  };

  const handleContinue = () => {
    // Navigate to payment or certificate
    navigate(`/certificado/${id}`);
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const allCompleted = steps.every(step => step.status === "completed");

  return (
    <div className="min-h-screen bg-gradient-hero flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        <Card className="border-border bg-card shadow-2xl">
          <CardContent className="pt-8 pb-10 px-6 md:px-10">
            {/* Header */}
            <div className="text-center mb-10">
              <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
                {allCompleted ? (
                  <CheckCircle2 className="h-10 w-10 text-success" />
                ) : (
                  <Loader2 className="h-10 w-10 text-primary animate-spin" />
                )}
              </div>
              <h1 className="font-display text-2xl md:text-3xl font-bold text-foreground mb-2">
                {allCompleted ? "Registro Concluído!" : "Processando seu Registro"}
              </h1>
              <p className="font-body text-muted-foreground">
                {allCompleted 
                  ? "Seu arquivo foi registrado com sucesso na blockchain" 
                  : "Aguarde enquanto registramos seu arquivo na blockchain"}
              </p>
            </div>

            {/* Progress Bar */}
            <div className="mb-10">
              <div className="flex justify-between text-sm mb-2">
                <span className="font-body text-muted-foreground">Progresso</span>
                <span className="font-body font-medium text-foreground">{Math.round(progress)}%</span>
              </div>
              <Progress value={progress} className="h-3" />
            </div>

            {/* Steps */}
            <div className="space-y-4 mb-10">
              {steps.map((step, index) => (
                <div 
                  key={step.id}
                  className={cn(
                    "flex items-center gap-4 p-4 rounded-xl transition-all",
                    step.status === "active" && "bg-primary/5 border border-primary/20",
                    step.status === "completed" && "bg-success/5 border border-success/20",
                    step.status === "pending" && "bg-muted/30 border border-transparent opacity-50"
                  )}
                >
                  <div className={cn(
                    "h-12 w-12 rounded-full flex items-center justify-center flex-shrink-0",
                    step.status === "active" && "bg-primary/10",
                    step.status === "completed" && "bg-success/10",
                    step.status === "pending" && "bg-muted"
                  )}>
                    {step.status === "completed" ? (
                      <CheckCircle2 className="h-6 w-6 text-success" />
                    ) : step.status === "active" ? (
                      <Loader2 className="h-6 w-6 text-primary animate-spin" />
                    ) : (
                      <step.icon className="h-6 w-6 text-muted-foreground" />
                    )}
                  </div>
                  <div className="flex-1">
                    <p className={cn(
                      "font-body font-medium",
                      step.status === "pending" ? "text-muted-foreground" : "text-foreground"
                    )}>
                      {step.label}
                    </p>
                    <p className="font-body text-sm text-muted-foreground">
                      {step.description}
                    </p>
                  </div>
                  {step.status === "completed" && (
                    <CheckCircle2 className="h-5 w-5 text-success flex-shrink-0" />
                  )}
                </div>
              ))}
            </div>

            {/* Action Button */}
            {allCompleted && (
              <Button
                onClick={handleContinue}
                className="w-full bg-primary text-primary-foreground hover:bg-primary/90 font-body font-semibold py-6"
              >
                Ver Certificado
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            )}

            {/* Info Text */}
            {!allCompleted && (
              <p className="text-center font-body text-sm text-muted-foreground">
                Por favor, não feche esta página. O processo leva poucos segundos.
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
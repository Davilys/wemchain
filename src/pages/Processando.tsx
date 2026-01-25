import { useEffect, useState, useCallback, useRef } from "react";
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
  AlertTriangle,
  RefreshCw
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

type RegistroStatus = 'pendente' | 'processando' | 'confirmado' | 'falhou';

interface StatusResponse {
  registroId: string;
  status: RegistroStatus;
  hash_sha256: string | null;
  error_message: string | null;
  confirmed_at: string | null;
  transaction: {
    id: string;
    txHash: string;
    network: string;
    method: string;
    confirmedAt: string;
  } | null;
}

const POLLING_INTERVAL_MS = 2000; // Poll every 2 seconds
const MAX_POLLING_TIME_MS = 120000; // Max 2 minutes of polling

export default function Processando() {
  const { id } = useParams<{ id: string }>();
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState(0);
  const [processingError, setProcessingError] = useState<string | null>(null);
  const [timestampMethod, setTimestampMethod] = useState<string | null>(null);
  const [isRetrying, setIsRetrying] = useState(false);
  
  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startTimeRef = useRef<number>(Date.now());
  const hasStartedProcessing = useRef<boolean>(false);

  const [steps, setSteps] = useState<ProcessStep[]>([
    { id: "hash", label: "Gerando Hash", description: "Criando impressão digital SHA-256", icon: Hash, status: "pending" },
    { id: "prepare", label: "Preparando Timestamp", description: "Configurando dados", icon: Link2, status: "pending" },
    { id: "timestamp", label: "Registrando Timestamp", description: "Enviando para blockchain", icon: Shield, status: "pending" },
    { id: "confirm", label: "Confirmando", description: "Aguardando confirmação", icon: Clock, status: "pending" },
    { id: "certificate", label: "Gerando Certificado", description: "Criando certificado digital", icon: FileText, status: "pending" }
  ]);

  const updateStepsFromStatus = useCallback((status: RegistroStatus) => {
    setSteps(prevSteps => {
      switch (status) {
        case 'pendente':
          return prevSteps.map((step, i) => ({
            ...step,
            status: i === 0 ? "active" as const : "pending" as const
          }));
        case 'processando':
          return prevSteps.map((step, i) => ({
            ...step,
            status: i < 2 ? "completed" as const : i === 2 ? "active" as const : "pending" as const
          }));
        case 'confirmado':
          return prevSteps.map(step => ({ ...step, status: "completed" as const }));
        case 'falhou':
          return prevSteps.map((step, i) => ({
            ...step,
            status: i < 2 ? "completed" as const : i === 2 ? "error" as const : "pending" as const
          }));
        default:
          return prevSteps;
      }
    });

    // Update progress based on status
    switch (status) {
      case 'pendente':
        setProgress(10);
        break;
      case 'processando':
        setProgress(50);
        break;
      case 'confirmado':
        setProgress(100);
        break;
      case 'falhou':
        setProgress(40);
        break;
    }
  }, []);

  const stopPolling = useCallback(() => {
    if (pollingRef.current) {
      clearInterval(pollingRef.current);
      pollingRef.current = null;
    }
  }, []);

  const pollStatus = useCallback(async (registroId: string): Promise<StatusResponse | null> => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return null;

      const response = await supabase.functions.invoke('get-registro-status', {
        body: null,
        headers: {
          'Content-Type': 'application/json',
        },
      });

      // The function expects query params, but invoke doesn't support that well
      // So we need to call it differently
      const functionUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/get-registro-status?registroId=${registroId}`;
      const res = await fetch(functionUrl, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!res.ok) {
        console.error('[POLLING] Failed to get status:', res.status);
        return null;
      }

      return await res.json() as StatusResponse;
    } catch (error) {
      console.error('[POLLING] Error:', error);
      return null;
    }
  }, []);

  const startProcessing = useCallback(async (registroId: string) => {
    if (hasStartedProcessing.current) return;
    hasStartedProcessing.current = true;

    try {
      // Update steps to show we're starting
      updateStepsFromStatus('pendente');
      
      // Call process-registro to initiate processing
      const response = await supabase.functions.invoke('process-registro', {
        body: { registroId }
      });

      if (response.error) {
        throw new Error(response.error.message || "Erro ao iniciar processamento");
      }

      const data = response.data;
      
      // Handle immediate response based on status
      if (data.status === 'confirmado') {
        setTimestampMethod(data.method);
        updateStepsFromStatus('confirmado');
        toast({
          title: "Registro concluído!",
          description: data.method === "OPEN_TIMESTAMP" 
            ? "Timestamp registrado via OpenTimestamps (Bitcoin)" 
            : "Timestamp registrado com sucesso"
        });
        return;
      }

      if (data.status === 'falhou') {
        setProcessingError(data.error || 'Erro desconhecido');
        updateStepsFromStatus('falhou');
        toast({
          title: "Erro no processamento",
          description: data.error,
          variant: "destructive"
        });
        return;
      }

      // Start polling for status updates
      startTimeRef.current = Date.now();
      updateStepsFromStatus('processando');

      pollingRef.current = setInterval(async () => {
        const elapsed = Date.now() - startTimeRef.current;
        
        // Check if we've exceeded max polling time
        if (elapsed > MAX_POLLING_TIME_MS) {
          stopPolling();
          setProcessingError('Tempo limite de processamento excedido. Verifique o status mais tarde.');
          updateStepsFromStatus('falhou');
          return;
        }

        const statusData = await pollStatus(registroId);
        
        if (!statusData) return;

        updateStepsFromStatus(statusData.status);

        if (statusData.status === 'confirmado') {
          stopPolling();
          setTimestampMethod(statusData.transaction?.method || null);
          toast({
            title: "Registro concluído!",
            description: statusData.transaction?.method === "OPEN_TIMESTAMP" 
              ? "Timestamp registrado via OpenTimestamps (Bitcoin)" 
              : "Timestamp registrado com sucesso"
          });
        } else if (statusData.status === 'falhou') {
          stopPolling();
          setProcessingError(statusData.error_message || 'Erro no processamento');
          toast({
            title: "Erro no processamento",
            description: statusData.error_message,
            variant: "destructive"
          });
        }
      }, POLLING_INTERVAL_MS);

    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      setProcessingError(errorMessage);
      updateStepsFromStatus('falhou');
      toast({
        title: "Erro",
        description: errorMessage,
        variant: "destructive"
      });
    }
  }, [updateStepsFromStatus, pollStatus, stopPolling]);

  const handleRetry = useCallback(async () => {
    if (!id) return;
    
    setIsRetrying(true);
    setProcessingError(null);
    hasStartedProcessing.current = false;
    
    setSteps(prev => prev.map(s => ({ ...s, status: "pending" as const })));
    setProgress(0);
    
    await startProcessing(id);
    setIsRetrying(false);
  }, [id, startProcessing]);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/login");
      return;
    }

    if (id && user) {
      // Check current status first
      supabase
        .from("registros")
        .select("*, transacoes_blockchain (*)")
        .eq("id", id)
        .single()
        .then(({ data, error }) => {
          if (error || !data) {
            navigate("/dashboard");
            return;
          }

          // Check if already confirmed
          const hasTransaction = Array.isArray(data.transacoes_blockchain) 
            ? data.transacoes_blockchain.length > 0 
            : data.transacoes_blockchain !== null;
          
          if (data.status === "confirmado" && hasTransaction) {
            navigate(`/certificado/${id}`);
            return;
          }

          setLoading(false);

          // If status is pendente, start processing
          if (data.status === "pendente") {
            startProcessing(id);
          } else if (data.status === "processando") {
            // Resume polling
            updateStepsFromStatus('processando');
            hasStartedProcessing.current = true;
            startTimeRef.current = Date.now();
            
            pollingRef.current = setInterval(async () => {
              const statusData = await pollStatus(id);
              if (!statusData) return;
              
              updateStepsFromStatus(statusData.status);
              
              if (statusData.status === 'confirmado') {
                stopPolling();
                setTimestampMethod(statusData.transaction?.method || null);
              } else if (statusData.status === 'falhou') {
                stopPolling();
                setProcessingError(statusData.error_message || 'Erro no processamento');
              }
            }, POLLING_INTERVAL_MS);
          } else if (data.status === "falhou") {
            updateStepsFromStatus('falhou');
            setProcessingError(data.error_message || 'Erro no processamento anterior');
          }
        });
    }

    return () => {
      stopPolling();
    };
  }, [id, user, authLoading, navigate, startProcessing, updateStepsFromStatus, pollStatus, stopPolling]);

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const allCompleted = steps.every(step => step.status === "completed");
  const hasError = processingError !== null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        <Card className="border-border bg-card/95 backdrop-blur-sm shadow-2xl">
          <CardContent className="pt-8 pb-10 px-6 md:px-10">
            {/* Header */}
            <div className="text-center mb-10">
              <div className={cn(
                "h-20 w-20 rounded-full flex items-center justify-center mx-auto mb-6 transition-all duration-300",
                hasError ? "bg-destructive/10" : allCompleted ? "bg-green-500/10" : "bg-primary/10"
              )}>
                {hasError ? (
                  <AlertTriangle className="h-10 w-10 text-destructive" />
                ) : allCompleted ? (
                  <CheckCircle2 className="h-10 w-10 text-green-500" />
                ) : (
                  <Loader2 className="h-10 w-10 text-primary animate-spin" />
                )}
              </div>
              <h1 className="font-display text-2xl md:text-3xl font-bold text-foreground mb-2">
                {hasError ? "Erro no Processamento" : allCompleted ? "Registro Concluído!" : "Processando seu Registro"}
              </h1>
              <p className="font-body text-muted-foreground">
                {hasError 
                  ? processingError 
                  : allCompleted 
                    ? (timestampMethod === "OPEN_TIMESTAMP" 
                        ? "Registrado via OpenTimestamps (Bitcoin blockchain)" 
                        : "Registrado com sucesso") 
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
              {steps.map((step) => (
                <div 
                  key={step.id} 
                  className={cn(
                    "flex items-center gap-4 p-4 rounded-xl transition-all duration-300",
                    step.status === "active" && "bg-primary/5 border border-primary/20",
                    step.status === "completed" && "bg-green-500/5 border border-green-500/20",
                    step.status === "error" && "bg-destructive/5 border border-destructive/20",
                    step.status === "pending" && "bg-muted/30 border border-transparent opacity-50"
                  )}
                >
                  <div className={cn(
                    "h-12 w-12 rounded-full flex items-center justify-center flex-shrink-0 transition-all duration-300",
                    step.status === "active" && "bg-primary/10",
                    step.status === "completed" && "bg-green-500/10",
                    step.status === "error" && "bg-destructive/10",
                    step.status === "pending" && "bg-muted"
                  )}>
                    {step.status === "completed" ? (
                      <CheckCircle2 className="h-6 w-6 text-green-500" />
                    ) : step.status === "active" ? (
                      <Loader2 className="h-6 w-6 text-primary animate-spin" />
                    ) : step.status === "error" ? (
                      <AlertTriangle className="h-6 w-6 text-destructive" />
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
                    <p className="font-body text-sm text-muted-foreground">{step.description}</p>
                  </div>
                  {step.status === "completed" && (
                    <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0" />
                  )}
                </div>
              ))}
            </div>

            {/* Actions */}
            {allCompleted && (
              <Button 
                onClick={() => navigate(`/certificado/${id}`)} 
                className="w-full bg-primary text-primary-foreground hover:bg-primary/90 font-body font-semibold py-6"
              >
                Ver Certificado
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            )}

            {hasError && (
              <div className="space-y-3">
                <Button 
                  onClick={handleRetry}
                  disabled={isRetrying}
                  className="w-full bg-primary text-primary-foreground hover:bg-primary/90 font-body font-semibold py-6"
                >
                  {isRetrying ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Processando...
                    </>
                  ) : (
                    <>
                      <RefreshCw className="mr-2 h-5 w-5" />
                      Tentar Novamente
                    </>
                  )}
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => navigate("/dashboard")} 
                  className="w-full font-body py-6"
                >
                  Voltar para o Dashboard
                </Button>
              </div>
            )}

            {!allCompleted && !hasError && (
              <p className="text-center font-body text-sm text-muted-foreground">
                Por favor, não feche esta página. O status é atualizado automaticamente.
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

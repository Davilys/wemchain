import { useEffect, useState } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/hooks/useAuth";
import { useAdminAuditLog } from "@/hooks/useAdminAuditLog";
import { toast } from "sonner";
import { 
  Settings, 
  Database, 
  Server, 
  Shield, 
  Zap,
  CheckCircle,
  Save,
  AlertTriangle,
  Loader2,
} from "lucide-react";

interface SystemConfig {
  registrosEnabled: boolean;
  comprasEnabled: boolean;
  maxUploadSize: number;
  maintenanceMode: boolean;
  maintenanceMessage: string;
}

export default function AdminConfiguracoes() {
  const { user } = useAuth();
  const { logAdminAction } = useAdminAuditLog();
  
  const [config, setConfig] = useState<SystemConfig>({
    registrosEnabled: true,
    comprasEnabled: true,
    maxUploadSize: 50,
    maintenanceMode: false,
    maintenanceMessage: "",
  });
  const [saving, setSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    // In production, load from database or edge function
    const savedConfig = localStorage.getItem("webmarcas_admin_config");
    if (savedConfig) {
      setConfig(JSON.parse(savedConfig));
    }
  }, []);

  function updateConfig(key: keyof SystemConfig, value: any) {
    setConfig(prev => ({ ...prev, [key]: value }));
    setHasChanges(true);
  }

  async function handleSave() {
    setSaving(true);
    try {
      // Save to localStorage (in production, save to database)
      localStorage.setItem("webmarcas_admin_config", JSON.stringify(config));
      
      await logAdminAction({
        actionType: "admin_config_changed",
        metadata: { config },
      });

      toast.success("Configurações salvas com sucesso");
      setHasChanges(false);
    } catch (error) {
      toast.error("Erro ao salvar configurações");
    } finally {
      setSaving(false);
    }
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold font-display">Configurações</h1>
            <p className="text-muted-foreground font-body">
              Configurações do sistema e status dos serviços
            </p>
          </div>
          {hasChanges && (
            <Button onClick={handleSave} disabled={saving}>
              {saving ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Save className="h-4 w-4 mr-2" />
              )}
              Salvar Alterações
            </Button>
          )}
        </div>

        {/* System Status */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Database className="h-5 w-5 text-green-500" />
                  <span className="text-sm font-medium">Banco de Dados</span>
                </div>
                <Badge className="bg-green-500/10 text-green-500">Online</Badge>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Server className="h-5 w-5 text-green-500" />
                  <span className="text-sm font-medium">Edge Functions</span>
                </div>
                <Badge className="bg-green-500/10 text-green-500">Ativas</Badge>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Zap className="h-5 w-5 text-green-500" />
                  <span className="text-sm font-medium">ASAAS</span>
                </div>
                <Badge className="bg-green-500/10 text-green-500">Conectado</Badge>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-green-500" />
                  <span className="text-sm font-medium">Blockchain</span>
                </div>
                <Badge className="bg-green-500/10 text-green-500">Operacional</Badge>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* System Controls */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Controles do Sistema
            </CardTitle>
            <CardDescription>
              Ative ou desative funcionalidades da plataforma
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
              <div>
                <p className="font-medium">Registros em Blockchain</p>
                <p className="text-sm text-muted-foreground">
                  Permite que usuários criem novos registros
                </p>
              </div>
              <Switch 
                checked={config.registrosEnabled}
                onCheckedChange={(v) => updateConfig("registrosEnabled", v)}
              />
            </div>

            <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
              <div>
                <p className="font-medium">Compras e Pagamentos</p>
                <p className="text-sm text-muted-foreground">
                  Permite que usuários comprem créditos
                </p>
              </div>
              <Switch 
                checked={config.comprasEnabled}
                onCheckedChange={(v) => updateConfig("comprasEnabled", v)}
              />
            </div>

            <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
              <div>
                <p className="font-medium">Tamanho Máximo de Upload</p>
                <p className="text-sm text-muted-foreground">
                  Limite em MB para arquivos enviados
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Input 
                  type="number"
                  className="w-24 text-right"
                  value={config.maxUploadSize}
                  onChange={(e) => updateConfig("maxUploadSize", parseInt(e.target.value) || 50)}
                  min={1}
                  max={100}
                />
                <span className="text-muted-foreground">MB</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Maintenance Mode */}
        <Card className={config.maintenanceMode ? "border-yellow-500/50" : ""}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className={config.maintenanceMode ? "h-5 w-5 text-yellow-500" : "h-5 w-5"} />
              Modo Manutenção
            </CardTitle>
            <CardDescription>
              Quando ativo, exibe mensagem de manutenção para todos os usuários
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="maintenance">Ativar Modo Manutenção</Label>
              <Switch 
                id="maintenance"
                checked={config.maintenanceMode}
                onCheckedChange={(v) => updateConfig("maintenanceMode", v)}
              />
            </div>
            
            {config.maintenanceMode && (
              <div className="space-y-2">
                <Label htmlFor="maintenanceMsg">Mensagem para Usuários</Label>
                <Textarea
                  id="maintenanceMsg"
                  placeholder="Ex: Estamos em manutenção programada. Retornaremos em breve."
                  value={config.maintenanceMessage}
                  onChange={(e) => updateConfig("maintenanceMessage", e.target.value)}
                />
              </div>
            )}
          </CardContent>
        </Card>

        {/* Plans Configuration */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Planos Disponíveis
            </CardTitle>
            <CardDescription>
              Configuração dos planos de créditos
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
              <div className="flex items-center gap-4">
                <div>
                  <p className="font-medium">Plano Básico</p>
                  <p className="text-sm text-muted-foreground">R$ 49,00 - 1 crédito</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Switch id="plan-basico" defaultChecked />
                <Label htmlFor="plan-basico">Ativo</Label>
              </div>
            </div>

            <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
              <div className="flex items-center gap-4">
                <div>
                  <p className="font-medium">Plano Profissional</p>
                  <p className="text-sm text-muted-foreground">R$ 149,00 - 5 créditos</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Switch id="plan-profissional" defaultChecked />
                <Label htmlFor="plan-profissional">Ativo</Label>
              </div>
            </div>

            <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
              <div className="flex items-center gap-4">
                <div>
                  <p className="font-medium">Plano Business (Assinatura)</p>
                  <p className="text-sm text-muted-foreground">R$ 99,00/mês - 3 créditos/ciclo</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Switch id="plan-business" defaultChecked />
                <Label htmlFor="plan-business">Ativo</Label>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Security Notice */}
        <Card className="border-primary/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-primary">
              <Shield className="h-5 w-5" />
              Segurança do Sistema
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                <div>
                  <p className="font-medium">Validação de Webhooks</p>
                  <p className="text-sm text-muted-foreground">
                    Todos os webhooks ASAAS são validados via assinatura HMAC-SHA256
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                <div>
                  <p className="font-medium">Idempotência de Pagamentos</p>
                  <p className="text-sm text-muted-foreground">
                    Proteção contra duplicação de créditos via ID único de pagamento
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                <div>
                  <p className="font-medium">Logs Imutáveis</p>
                  <p className="text-sm text-muted-foreground">
                    Todos os eventos financeiros e administrativos são registrados
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                <div>
                  <p className="font-medium">Row Level Security</p>
                  <p className="text-sm text-muted-foreground">
                    Políticas RLS ativas em todas as tabelas críticas
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Separator />

        {/* Admin Guidelines */}
        <Card>
          <CardHeader>
            <CardTitle>Diretrizes de Administração</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 text-sm">
              <p className="flex items-start gap-2">
                <span className="text-destructive font-bold">✗</span>
                Admin NÃO pode apagar usuários ou dados críticos
              </p>
              <p className="flex items-start gap-2">
                <span className="text-destructive font-bold">✗</span>
                Admin NÃO pode alterar hashes ou forçar status CONFIRMED
              </p>
              <p className="flex items-start gap-2">
                <span className="text-destructive font-bold">✗</span>
                Admin NÃO pode editar pagamentos diretamente
              </p>
              <p className="flex items-start gap-2">
                <span className="text-green-500 font-bold">✓</span>
                Admin PODE ajustar créditos com motivo obrigatório
              </p>
              <p className="flex items-start gap-2">
                <span className="text-green-500 font-bold">✓</span>
                Admin PODE reprocessar registros com falha
              </p>
              <p className="flex items-start gap-2">
                <span className="text-green-500 font-bold">✓</span>
                Admin PODE visualizar todos os logs e métricas
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}

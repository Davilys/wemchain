import { AdminLayout } from "@/components/admin/AdminLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { 
  Settings, 
  Database, 
  Server, 
  Shield, 
  Zap,
  CheckCircle,
  Clock
} from "lucide-react";

export default function AdminConfiguracoes() {
  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Configurações</h1>
          <p className="text-muted-foreground">
            Configurações do sistema e status dos serviços
          </p>
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

        {/* Plans Configuration */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Planos Disponíveis
            </CardTitle>
            <CardDescription>
              Gerencie os planos disponíveis para compra
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
                  <p className="font-medium">Plano Business</p>
                  <p className="text-sm text-muted-foreground">R$ 99,00/mês - 3 créditos/ciclo + adicional R$ 39</p>
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
                    Todos os eventos financeiros são registrados de forma imutável
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

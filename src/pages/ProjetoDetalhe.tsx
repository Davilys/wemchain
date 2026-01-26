import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useCredits } from "@/hooks/useCredits";
import { useProjects, Project, ProjectLog } from "@/hooks/useProjects";
import { CreateProjectModal } from "@/components/projects/CreateProjectModal";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  ArrowLeft,
  Loader2,
  Plus,
  FileText,
  Building2,
  User,
  Mail,
  Calendar,
  Coins,
  Edit,
  History,
  AlertTriangle,
  Eye,
  Info,
  Crown,
} from "lucide-react";
import { toast } from "sonner";

interface Registro {
  id: string;
  nome_ativo: string;
  tipo_ativo: string;
  status: string;
  created_at: string;
  hash_sha256: string | null;
}

export default function ProjetoDetalhe() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { credits } = useCredits();
  const { projects, loading: projectsLoading, updateProject, getProjectLogs } = useProjects();

  const [project, setProject] = useState<Project | null>(null);
  const [registros, setRegistros] = useState<Registro[]>([]);
  const [logs, setLogs] = useState<ProjectLog[]>([]);
  const [dataLoading, setDataLoading] = useState(true);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("registros");

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/login");
    }
  }, [user, authLoading, navigate]);

  // Buscar projeto diretamente do banco se não estiver na lista
  useEffect(() => {
    const loadProject = async () => {
      if (!id || !user) return;
      
      // Primeiro tenta da lista em cache
      const foundProject = projects.find((p) => p.id === id);
      if (foundProject) {
        setProject(foundProject);
        return;
      }
      
      // Se a lista de projetos ainda está carregando, espera
      if (projectsLoading) return;
      
      // Se não encontrou na lista e não está carregando, busca direto do banco
      try {
        const { data, error } = await supabase
          .from("projects")
          .select("*")
          .eq("id", id)
          .eq("owner_user_id", user.id)
          .maybeSingle();
        
        if (error) throw error;
        if (data) {
          // Buscar contagem de registros
          const { count } = await supabase
            .from("registros")
            .select("*", { count: "exact", head: true })
            .eq("project_id", data.id);
          
          setProject({ ...data, registros_count: count || 0 } as Project);
        }
      } catch (error) {
        console.error("Error loading project:", error);
      }
    };

    loadProject();
  }, [projects, projectsLoading, id, user]);

  // Buscar registros e logs do projeto
  useEffect(() => {
    const fetchData = async () => {
      if (!id || !user) return;

      setDataLoading(true);
      try {
        // Buscar registros do projeto
        const { data: registrosData, error: registrosError } = await supabase
          .from("registros")
          .select("id, nome_ativo, tipo_ativo, status, created_at, hash_sha256")
          .eq("project_id", id)
          .order("created_at", { ascending: false });

        if (registrosError) throw registrosError;
        setRegistros(registrosData || []);

        // Buscar logs do projeto
        const logsData = await getProjectLogs(id);
        setLogs(logsData);
      } catch (error) {
        console.error("Error fetching project data:", error);
        toast.error("Erro ao carregar dados do projeto");
      } finally {
        setDataLoading(false);
      }
    };

    fetchData();
  }, [id, user]); // Removido getProjectLogs das dependências

  const handleEditProject = async (data: any) => {
    if (project) {
      await updateProject(project.id, data);
      setEditModalOpen(false);
    }
  };

  const handleNewRegistro = () => {
    if (project) {
      navigate(`/novo-registro?projectId=${project.id}`);
    }
  };

  const formatDocument = (doc: string, type: "CPF" | "CNPJ") => {
    const numbers = doc.replace(/\D/g, "");
    if (type === "CPF") {
      return numbers
        .replace(/(\d{3})(\d)/, "$1.$2")
        .replace(/(\d{3})(\d)/, "$1.$2")
        .replace(/(\d{3})(\d{1,2})/, "$1-$2");
    }
    return numbers
      .replace(/(\d{2})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d)/, "$1/$2")
      .replace(/(\d{4})(\d{1,2})/, "$1-$2");
  };

  const getStatusBadge = (status: string) => {
    const config: Record<string, { label: string; className: string }> = {
      confirmado: { label: "Confirmado", className: "bg-green-500/10 text-green-600 border-green-500/20" },
      pendente: { label: "Pendente", className: "bg-yellow-500/10 text-yellow-600 border-yellow-500/20" },
      processando: { label: "Processando", className: "bg-blue-500/10 text-blue-600 border-blue-500/20" },
      falhou: { label: "Falhou", className: "bg-red-500/10 text-red-600 border-red-500/20" },
    };
    const style = config[status] || config.pendente;
    return <Badge className={style.className}>{style.label}</Badge>;
  };

  const getActionLabel = (actionType: string) => {
    const labels: Record<string, string> = {
      project_created: "Projeto criado",
      project_updated: "Projeto atualizado",
      project_archived: "Projeto arquivado",
      project_unarchived: "Projeto reativado",
      registro_created: "Registro criado",
    };
    return labels[actionType] || actionType;
  };

  if (dataLoading || authLoading || projectsLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  if (!project) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <AlertTriangle className="h-12 w-12 text-warning mx-auto mb-4" />
          <p className="text-muted-foreground mb-4">Projeto não encontrado</p>
          <Button asChild>
            <Link to="/projetos">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar aos Projetos
            </Link>
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header Fixo */}
        <div className="flex items-start gap-4">
          <Button variant="ghost" size="icon" asChild className="h-9 w-9 mt-1">
            <Link to="/projetos">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-1">
              <div
                className={`h-12 w-12 rounded-xl flex items-center justify-center ${
                  project.document_type === "CNPJ"
                    ? "bg-blue-500/10"
                    : "bg-purple-500/10"
                }`}
              >
                {project.document_type === "CNPJ" ? (
                  <Building2 className="h-6 w-6 text-blue-500" />
                ) : (
                  <User className="h-6 w-6 text-purple-500" />
                )}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="font-display text-2xl font-bold text-foreground">
                    {project.name}
                  </h1>
                  {project.status === "archived" && (
                    <Badge variant="secondary">Arquivado</Badge>
                  )}
                </div>
                <p className="text-sm text-muted-foreground">
                  {project.document_type}:{" "}
                  {formatDocument(project.document_number, project.document_type)}
                </p>
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => setEditModalOpen(true)}>
              <Edit className="h-4 w-4 mr-1" />
              Editar
            </Button>
          </div>
        </div>

        {/* Aviso sobre titular */}
        <Card className="border-amber-500/30 bg-amber-500/5">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-amber-500/10 flex items-center justify-center flex-shrink-0">
                <Info className="h-5 w-5 text-amber-500" />
              </div>
              <p className="text-sm text-muted-foreground flex-1">
                Os registros deste projeto serão feitos em nome de <strong className="text-foreground">{project.name}</strong>.
              </p>
              <Badge className="bg-primary/10 text-primary border-primary/20 text-xs">
                <Coins className="h-3 w-3 mr-1" />
                {credits?.available_credits || 0} créditos
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* CTA Principal */}
        <Button 
          onClick={handleNewRegistro} 
          size="lg" 
          className="w-full sm:w-auto bg-amber-500 hover:bg-amber-600 text-white h-14 text-base font-semibold"
        >
          <Plus className="h-5 w-5 mr-2" />
          Registrar novo arquivo para este cliente
        </Button>

        {/* Stats Compactos */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <Card>
            <CardContent className="p-3">
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-purple-500" />
                <span className="text-xs text-muted-foreground">Registros</span>
              </div>
              <p className="text-xl font-bold mt-1">{registros.length}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-3">
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">E-mail</span>
              </div>
              <p className="text-xs font-medium mt-1 truncate">
                {project.email || "Não informado"}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-3">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">Criado em</span>
              </div>
              <p className="text-xs font-medium mt-1">
                {format(new Date(project.created_at), "dd/MM/yyyy", { locale: ptBR })}
              </p>
            </CardContent>
          </Card>
          <Card className="border-primary/20 bg-primary/5">
            <CardContent className="p-3">
              <div className="flex items-center gap-2">
                <Coins className="h-4 w-4 text-primary" />
                <span className="text-xs text-muted-foreground">Seus Créditos</span>
              </div>
              <p className="text-xl font-bold mt-1 text-primary">{credits?.available_credits || 0}</p>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="registros">
              <FileText className="h-4 w-4 mr-2" />
              Registros ({registros.length})
            </TabsTrigger>
            <TabsTrigger value="dados">
              <User className="h-4 w-4 mr-2" />
              Dados do Titular
            </TabsTrigger>
            <TabsTrigger value="historico">
              <History className="h-4 w-4 mr-2" />
              Histórico
            </TabsTrigger>
          </TabsList>

          <TabsContent value="registros" className="mt-4">
            <Card>
              <CardContent className="p-0">
                {registros.length === 0 ? (
                  <div className="text-center py-12">
                    <FileText className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
                    <p className="text-muted-foreground mb-4">
                      Nenhum registro neste projeto ainda
                    </p>
                    <Button onClick={handleNewRegistro} className="bg-amber-500 hover:bg-amber-600 text-white">
                      <Plus className="h-4 w-4 mr-2" />
                      Criar Primeiro Registro
                    </Button>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Nome do Ativo</TableHead>
                          <TableHead className="hidden sm:table-cell">Tipo</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead className="hidden sm:table-cell">Data</TableHead>
                          <TableHead className="text-right">Ações</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {registros.map((registro) => (
                          <TableRow key={registro.id}>
                            <TableCell className="font-medium">
                              {registro.nome_ativo}
                            </TableCell>
                            <TableCell className="capitalize hidden sm:table-cell">
                              {registro.tipo_ativo.replace("_", " ")}
                            </TableCell>
                            <TableCell>{getStatusBadge(registro.status)}</TableCell>
                            <TableCell className="hidden sm:table-cell">
                              {format(new Date(registro.created_at), "dd/MM/yyyy", {
                                locale: ptBR,
                              })}
                            </TableCell>
                            <TableCell className="text-right">
                              <Button
                                variant="ghost"
                                size="sm"
                                asChild
                              >
                                <Link to={`/certificado/${registro.id}`}>
                                  <Eye className="h-4 w-4 mr-1" />
                                  Ver
                                </Link>
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="dados" className="mt-4">
            <Card>
              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Nome do Titular</p>
                    <p className="font-medium">{project.name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Tipo de Pessoa</p>
                    <p className="font-medium">
                      {project.document_type === "CNPJ" ? "Pessoa Jurídica" : "Pessoa Física"}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">
                      {project.document_type}
                    </p>
                    <p className="font-medium">
                      {formatDocument(project.document_number, project.document_type)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">E-mail</p>
                    <p className="font-medium">{project.email || "Não informado"}</p>
                  </div>
                  {project.notes && (
                    <div className="md:col-span-2">
                      <p className="text-sm text-muted-foreground mb-1">Observações</p>
                      <p className="font-medium">{project.notes}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="historico" className="mt-4">
            <Card>
              <CardContent className="p-0">
                {logs.length === 0 ? (
                  <div className="text-center py-12">
                    <History className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
                    <p className="text-muted-foreground">Nenhuma ação registrada ainda</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Ação</TableHead>
                          <TableHead>Data/Hora</TableHead>
                          <TableHead className="hidden sm:table-cell">Detalhes</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {logs.map((log) => (
                          <TableRow key={log.id}>
                            <TableCell className="font-medium">
                              {getActionLabel(log.action_type)}
                            </TableCell>
                            <TableCell>
                              {format(new Date(log.created_at), "dd/MM/yyyy HH:mm", {
                                locale: ptBR,
                              })}
                            </TableCell>
                            <TableCell className="text-muted-foreground text-sm hidden sm:table-cell">
                              {log.details ? JSON.stringify(log.details) : "-"}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Edit Modal */}
      <CreateProjectModal
        open={editModalOpen}
        onOpenChange={setEditModalOpen}
        onSubmit={handleEditProject}
        initialData={{
          name: project.name,
          document_type: project.document_type,
          document_number: project.document_number,
          email: project.email || "",
          notes: project.notes || "",
        }}
        isEditing
      />
    </DashboardLayout>
  );
}

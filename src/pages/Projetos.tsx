import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/hooks/useAuth";
import { useCredits } from "@/hooks/useCredits";
import { useBusinessPlan } from "@/hooks/useBusinessPlan";
import { useProjects, Project, CreateProjectData } from "@/hooks/useProjects";
import { CreateProjectModal } from "@/components/projects/CreateProjectModal";
import { ProjectCard } from "@/components/projects/ProjectCard";
import {
  FolderPlus,
  Search,
  Loader2,
  Coins,
  FolderOpen,
  Building2,
  User,
  AlertTriangle,
  ArrowLeft,
  Crown,
} from "lucide-react";
import { Link } from "react-router-dom";

export default function Projetos() {
  const { user, loading: authLoading } = useAuth();
  const { credits } = useCredits();
  const { isBusinessPlan, loading: businessLoading } = useBusinessPlan();
  const { projects, loading: projectsLoading, createProject, updateProject, archiveProject, unarchiveProject } = useProjects();
  const navigate = useNavigate();

  const [searchTerm, setSearchTerm] = useState("");
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [activeTab, setActiveTab] = useState<"active" | "archived">("active");

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/login");
    }
  }, [user, authLoading, navigate]);

  // Se não tem plano Business, mostrar mensagem
  if (!businessLoading && !isBusinessPlan) {
    return (
      <DashboardLayout>
        <div className="max-w-2xl mx-auto py-12">
          <Card className="border-warning/30 bg-warning/5">
            <CardContent className="p-8 text-center">
              <Crown className="h-16 w-16 text-warning mx-auto mb-4" />
              <h2 className="text-2xl font-bold mb-2">Plano Business Necessário</h2>
              <p className="text-muted-foreground mb-6">
                A aba Projetos está disponível exclusivamente para assinantes do Plano Business.
                Com ela, você pode registrar arquivos em nome de terceiros (clientes), gerenciar titulares e
                organizar seus registros por projeto.
              </p>
              <div className="flex justify-center gap-4">
                <Button variant="outline" asChild>
                  <Link to="/dashboard">
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Voltar
                  </Link>
                </Button>
                <Button asChild className="bg-warning text-warning-foreground hover:bg-warning/90">
                  <Link to="/checkout?plan=BUSINESS">
                    <Crown className="h-4 w-4 mr-2" />
                    Assinar Plano Business
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    );
  }

  const loading = authLoading || businessLoading || projectsLoading;

  const filteredProjects = projects.filter((project) => {
    const matchesSearch =
      project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.document_number.includes(searchTerm);
    const matchesTab =
      activeTab === "active"
        ? project.status === "active"
        : project.status === "archived";
    return matchesSearch && matchesTab;
  });

  const activeCount = projects.filter((p) => p.status === "active").length;
  const archivedCount = projects.filter((p) => p.status === "archived").length;
  const totalRegistros = projects.reduce((acc, p) => acc + (p.registros_count || 0), 0);

  const handleCreateProject = async (data: CreateProjectData) => {
    await createProject(data);
  };

  const handleEditProject = async (data: CreateProjectData) => {
    if (editingProject) {
      await updateProject(editingProject.id, data);
      setEditingProject(null);
    }
  };

  const handleOpenProject = (project: Project) => {
    navigate(`/projetos/${project.id}`);
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-display text-2xl font-bold text-foreground">
                Projetos
              </h1>
              <Badge variant="secondary" className="bg-warning/10 text-warning border-warning/20">
                <Crown className="h-3 w-3 mr-1" />
                Business
              </Badge>
            </div>
            <p className="font-body text-sm text-muted-foreground">
              Gerencie seus clientes e registre arquivos em nome de terceiros
            </p>
          </div>
          <Button onClick={() => setCreateModalOpen(true)}>
            <FolderPlus className="h-4 w-4 mr-2" />
            Novo Projeto
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <FolderOpen className="h-5 w-5 text-primary" />
                <span className="text-sm text-muted-foreground">Projetos Ativos</span>
              </div>
              <p className="text-2xl font-bold mt-1">{activeCount}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Building2 className="h-5 w-5 text-blue-500" />
                <span className="text-sm text-muted-foreground">Total de Registros</span>
              </div>
              <p className="text-2xl font-bold mt-1">{totalRegistros}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Coins className="h-5 w-5 text-yellow-500" />
                <span className="text-sm text-muted-foreground">Seus Créditos</span>
              </div>
              <p className="text-2xl font-bold mt-1">{credits?.available_credits || 0}</p>
            </CardContent>
          </Card>
        </div>

        {/* Info Banner */}
        <Card className="border-primary/20 bg-primary/5">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
              <div className="text-sm">
                <p className="font-medium text-foreground mb-1">
                  Como funciona o Plano Business
                </p>
                <p className="text-muted-foreground">
                  Cada projeto representa um cliente (titular) para quem você fará registros.
                  Todos os registros consomem créditos da <strong>sua conta</strong>, não do cliente.
                  O titular do projeto será automaticamente definido como autor principal nos registros.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Search & Tabs */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por nome ou documento..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>
              <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "active" | "archived")}>
                <TabsList>
                  <TabsTrigger value="active">
                    Ativos ({activeCount})
                  </TabsTrigger>
                  <TabsTrigger value="archived">
                    Arquivados ({archivedCount})
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          </CardHeader>
          <CardContent>
            {filteredProjects.length === 0 ? (
              <div className="text-center py-12">
                <FolderOpen className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
                <p className="text-muted-foreground mb-4">
                  {searchTerm
                    ? "Nenhum projeto encontrado com esse termo"
                    : activeTab === "active"
                    ? "Você ainda não tem projetos. Crie o primeiro!"
                    : "Nenhum projeto arquivado"}
                </p>
                {!searchTerm && activeTab === "active" && (
                  <Button onClick={() => setCreateModalOpen(true)}>
                    <FolderPlus className="h-4 w-4 mr-2" />
                    Criar Primeiro Projeto
                  </Button>
                )}
              </div>
            ) : (
              <div className="space-y-3">
                {filteredProjects.map((project) => (
                  <ProjectCard
                    key={project.id}
                    project={project}
                    onOpen={handleOpenProject}
                    onEdit={setEditingProject}
                    onArchive={(p) => archiveProject(p.id)}
                    onUnarchive={(p) => unarchiveProject(p.id)}
                  />
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Create Modal */}
      <CreateProjectModal
        open={createModalOpen}
        onOpenChange={setCreateModalOpen}
        onSubmit={handleCreateProject}
      />

      {/* Edit Modal */}
      {editingProject && (
        <CreateProjectModal
          open={!!editingProject}
          onOpenChange={(open) => !open && setEditingProject(null)}
          onSubmit={handleEditProject}
          initialData={{
            name: editingProject.name,
            document_type: editingProject.document_type,
            document_number: editingProject.document_number,
            email: editingProject.email || "",
            notes: editingProject.notes || "",
          }}
          isEditing
        />
      )}
    </DashboardLayout>
  );
}

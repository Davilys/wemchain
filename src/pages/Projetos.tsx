import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/hooks/useAuth";
import { useCredits } from "@/hooks/useCredits";
import { useBusinessPlan } from "@/hooks/useBusinessPlan";
import { useProjects, Project, CreateProjectData } from "@/hooks/useProjects";
import { CreateProjectModal } from "@/components/projects/CreateProjectModal";
import { ProjectCard } from "@/components/projects/ProjectCard";
import { AnimatedList } from "@/components/ui/AnimatedList";
import {
  FolderPlus,
  Search,
  Loader2,
  Coins,
  FolderOpen,
  Building2,
  ArrowLeft,
  Crown,
  Users,
  FileText,
  Info,
  Handshake,
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
  const [isPartner, setIsPartner] = useState(false);
  const [partnerLoading, setPartnerLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/login");
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (user) {
      supabase.from("profiles").select("is_partner").eq("user_id", user.id).maybeSingle().then(({ data }) => {
        setIsPartner(data?.is_partner || false);
        setPartnerLoading(false);
      });
    } else {
      setPartnerLoading(false);
    }
  }, [user]);

  // Parceiros não têm acesso a projetos
  if (!partnerLoading && isPartner) {
    return (
      <DashboardLayout>
        <div className="max-w-2xl mx-auto py-12">
          <Card className="border-warning/30 bg-warning/5">
            <CardContent className="p-8 text-center">
              <Handshake className="h-16 w-16 text-warning mx-auto mb-4" />
              <h2 className="text-2xl font-bold mb-2">Feature não disponível</h2>
              <p className="text-muted-foreground mb-6">
                A funcionalidade de Projetos não está disponível para contas de parceria. 
                Você pode registrar seus arquivos diretamente pelo Dashboard.
              </p>
              <Button variant="outline" asChild>
                <Link to="/dashboard">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Voltar ao Dashboard
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    );
  }

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
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h1 className="font-display text-2xl font-bold text-foreground">
                Projetos
              </h1>
              <Badge className="bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20 text-xs">
                <Users className="h-3 w-3 mr-1" />
                Seus clientes
              </Badge>
            </div>
            <p className="font-body text-sm text-muted-foreground max-w-lg">
              Crie projetos para registrar arquivos em nome de seus clientes usando seus créditos.
            </p>
          </div>
          <Button onClick={() => setCreateModalOpen(true)} size="lg" className="bg-amber-500 hover:bg-amber-600 text-white">
            <FolderPlus className="h-4 w-4 mr-2" />
            + Criar projeto (cliente)
          </Button>
        </div>

        {/* Stats Cards */}
        <AnimatedList className="grid grid-cols-1 sm:grid-cols-3 gap-4" staggerDelay={0.08}>
          <Card className="border-amber-500/20 bg-amber-500/5">
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <FolderOpen className="h-5 w-5 text-amber-500" />
                <span className="text-sm text-muted-foreground">Projetos Ativos</span>
              </div>
              <p className="text-2xl font-bold mt-1">{activeCount}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-purple-500" />
                <span className="text-sm text-muted-foreground">Total de Registros</span>
              </div>
              <p className="text-2xl font-bold mt-1">{totalRegistros}</p>
            </CardContent>
          </Card>
          <Card className="border-primary/20 bg-primary/5">
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Coins className="h-5 w-5 text-primary" />
                <span className="text-sm text-muted-foreground">Seus Créditos</span>
              </div>
              <p className="text-2xl font-bold mt-1 text-primary">{credits?.available_credits || 0}</p>
            </CardContent>
          </Card>
        </AnimatedList>

        {/* Info Banner */}
        <Card className="border-primary/20 bg-primary/5">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <Info className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
              <div className="text-sm">
                <p className="font-medium text-foreground mb-1">
                  Como funciona
                </p>
                <p className="text-muted-foreground">
                  Cada projeto representa um <strong>cliente (titular)</strong> para quem você fará registros.
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
                    ? "Você ainda não tem projetos. Crie o primeiro para começar a registrar para seus clientes!"
                    : "Nenhum projeto arquivado"}
                </p>
                {!searchTerm && activeTab === "active" && (
                  <Button onClick={() => setCreateModalOpen(true)} className="bg-amber-500 hover:bg-amber-600 text-white">
                    <FolderPlus className="h-4 w-4 mr-2" />
                    Criar Primeiro Projeto
                  </Button>
                )}
              </div>
            ) : (
              <AnimatedList className="space-y-3" staggerDelay={0.05}>
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
              </AnimatedList>
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

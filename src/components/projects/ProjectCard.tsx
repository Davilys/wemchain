import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Building2,
  User,
  FileText,
  MoreVertical,
  Edit,
  Archive,
  ArchiveRestore,
  FolderOpen,
} from "lucide-react";
import { Project } from "@/hooks/useProjects";

interface ProjectCardProps {
  project: Project;
  onOpen: (project: Project) => void;
  onEdit: (project: Project) => void;
  onArchive: (project: Project) => void;
  onUnarchive: (project: Project) => void;
}

export function ProjectCard({
  project,
  onOpen,
  onEdit,
  onArchive,
  onUnarchive,
}: ProjectCardProps) {
  const formatDocument = (doc: string, type: "CPF" | "CNPJ") => {
    const numbers = doc.replace(/\D/g, "");
    if (type === "CPF") {
      return `***.***.${numbers.slice(6, 9)}-**`;
    }
    return `**.***.${numbers.slice(5, 8)}/${numbers.slice(8, 12)}-**`;
  };

  return (
    <Card
      className={`group transition-all hover:shadow-md ${
        project.status === "archived" ? "opacity-60" : ""
      }`}
    >
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3 flex-1 min-w-0">
            <div
              className={`h-10 w-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                project.document_type === "CNPJ"
                  ? "bg-blue-500/10"
                  : "bg-purple-500/10"
              }`}
            >
              {project.document_type === "CNPJ" ? (
                <Building2 className="h-5 w-5 text-blue-500" />
              ) : (
                <User className="h-5 w-5 text-purple-500" />
              )}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-medium text-foreground truncate">
                  {project.name}
                </h3>
                {project.status === "archived" && (
                  <Badge variant="secondary" className="text-xs">
                    Arquivado
                  </Badge>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                <span>
                  {project.document_type}:{" "}
                  {formatDocument(project.document_number, project.document_type)}
                </span>
                <span className="flex items-center gap-1">
                  <FileText className="h-3 w-3" />
                  {project.registros_count || 0} registros
                </span>
                <span>
                  Criado em{" "}
                  {format(new Date(project.created_at), "dd/MM/yyyy", {
                    locale: ptBR,
                  })}
                </span>
              </div>

              {project.email && (
                <p className="text-xs text-muted-foreground mt-1 truncate">
                  {project.email}
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onOpen(project)}
              className="hidden sm:flex"
            >
              <FolderOpen className="h-4 w-4 mr-1" />
              Abrir
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48 bg-popover border">
                <DropdownMenuItem onClick={() => onOpen(project)}>
                  <FolderOpen className="h-4 w-4 mr-2" />
                  Abrir Projeto
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onEdit(project)}>
                  <Edit className="h-4 w-4 mr-2" />
                  Editar Dados
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                {project.status === "archived" ? (
                  <DropdownMenuItem onClick={() => onUnarchive(project)}>
                    <ArchiveRestore className="h-4 w-4 mr-2" />
                    Reativar Projeto
                  </DropdownMenuItem>
                ) : (
                  <DropdownMenuItem
                    onClick={() => onArchive(project)}
                    className="text-warning"
                  >
                    <Archive className="h-4 w-4 mr-2" />
                    Arquivar Projeto
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

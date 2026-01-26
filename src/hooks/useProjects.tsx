import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { toast } from "sonner";

export interface Project {
  id: string;
  owner_user_id: string;
  name: string;
  document_type: "CPF" | "CNPJ";
  document_number: string;
  email: string | null;
  notes: string | null;
  status: "active" | "archived";
  created_at: string;
  updated_at: string;
  registros_count?: number;
}

export interface CreateProjectData {
  name: string;
  document_type: "CPF" | "CNPJ";
  document_number: string;
  email?: string;
  notes?: string;
}

export interface ProjectLog {
  id: string;
  project_id: string;
  user_id: string;
  action_type: string;
  details: Record<string, unknown> | null;
  created_at: string;
}

interface UseProjectsReturn {
  projects: Project[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  createProject: (data: CreateProjectData) => Promise<Project | null>;
  updateProject: (id: string, data: Partial<CreateProjectData>) => Promise<boolean>;
  archiveProject: (id: string) => Promise<boolean>;
  unarchiveProject: (id: string) => Promise<boolean>;
  getProjectLogs: (projectId: string) => Promise<ProjectLog[]>;
  logProjectAction: (projectId: string, actionType: string, details?: Record<string, unknown>) => Promise<void>;
}

export function useProjects(): UseProjectsReturn {
  const { user } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProjects = useCallback(async () => {
    if (!user) {
      setProjects([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from("projects")
        .select("*")
        .eq("owner_user_id", user.id)
        .order("created_at", { ascending: false });

      if (fetchError) throw fetchError;

      // Buscar contagem de registros para cada projeto
      const projectsWithCount = await Promise.all(
        (data || []).map(async (project) => {
          const { count } = await supabase
            .from("registros")
            .select("*", { count: "exact", head: true })
            .eq("project_id", project.id);

          return {
            ...project,
            registros_count: count || 0,
          } as Project;
        })
      );

      setProjects(projectsWithCount);
    } catch (err) {
      console.error("Error fetching projects:", err);
      setError(err instanceof Error ? err.message : "Erro ao buscar projetos");
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  const createProject = async (data: CreateProjectData): Promise<Project | null> => {
    if (!user) {
      toast.error("Usuário não autenticado");
      return null;
    }

    try {
      const { data: newProject, error: createError } = await supabase
        .from("projects")
        .insert({
          owner_user_id: user.id,
          name: data.name,
          document_type: data.document_type,
          document_number: data.document_number.replace(/\D/g, ""),
          email: data.email || null,
          notes: data.notes || null,
        })
        .select()
        .single();

      if (createError) throw createError;

      // Registrar log
      await logProjectAction(newProject.id, "project_created", {
        name: data.name,
        document_type: data.document_type,
      });

      toast.success("Projeto criado com sucesso!");
      await fetchProjects();
      return newProject as Project;
    } catch (err) {
      console.error("Error creating project:", err);
      toast.error("Erro ao criar projeto");
      return null;
    }
  };

  const updateProject = async (id: string, data: Partial<CreateProjectData>): Promise<boolean> => {
    if (!user) return false;

    try {
      const updateData: Record<string, unknown> = {};
      if (data.name !== undefined) updateData.name = data.name;
      if (data.document_type !== undefined) updateData.document_type = data.document_type;
      if (data.document_number !== undefined) updateData.document_number = data.document_number.replace(/\D/g, "");
      if (data.email !== undefined) updateData.email = data.email || null;
      if (data.notes !== undefined) updateData.notes = data.notes || null;

      const { error: updateError } = await supabase
        .from("projects")
        .update(updateData)
        .eq("id", id);

      if (updateError) throw updateError;

      await logProjectAction(id, "project_updated", updateData);
      toast.success("Projeto atualizado!");
      await fetchProjects();
      return true;
    } catch (err) {
      console.error("Error updating project:", err);
      toast.error("Erro ao atualizar projeto");
      return false;
    }
  };

  const archiveProject = async (id: string): Promise<boolean> => {
    if (!user) return false;

    try {
      const { error: archiveError } = await supabase
        .from("projects")
        .update({ status: "archived" })
        .eq("id", id);

      if (archiveError) throw archiveError;

      await logProjectAction(id, "project_archived", {});
      toast.success("Projeto arquivado");
      await fetchProjects();
      return true;
    } catch (err) {
      console.error("Error archiving project:", err);
      toast.error("Erro ao arquivar projeto");
      return false;
    }
  };

  const unarchiveProject = async (id: string): Promise<boolean> => {
    if (!user) return false;

    try {
      const { error: unarchiveError } = await supabase
        .from("projects")
        .update({ status: "active" })
        .eq("id", id);

      if (unarchiveError) throw unarchiveError;

      await logProjectAction(id, "project_unarchived", {});
      toast.success("Projeto reativado");
      await fetchProjects();
      return true;
    } catch (err) {
      console.error("Error unarchiving project:", err);
      toast.error("Erro ao reativar projeto");
      return false;
    }
  };

  const getProjectLogs = async (projectId: string): Promise<ProjectLog[]> => {
    try {
      const { data, error: logsError } = await supabase
        .from("project_logs")
        .select("*")
        .eq("project_id", projectId)
        .order("created_at", { ascending: false })
        .limit(50);

      if (logsError) throw logsError;
      return (data || []) as ProjectLog[];
    } catch (err) {
      console.error("Error fetching project logs:", err);
      return [];
    }
  };

  const logProjectAction = async (
    projectId: string,
    actionType: string,
    details?: Record<string, unknown>
  ): Promise<void> => {
    if (!user) return;

    try {
      await supabase.from("project_logs").insert({
        project_id: projectId,
        user_id: user.id,
        action_type: actionType,
        details: details || null,
      } as any);
    } catch (err) {
      console.error("Error logging project action:", err);
    }
  };

  return {
    projects,
    loading,
    error,
    refetch: fetchProjects,
    createProject,
    updateProject,
    archiveProject,
    unarchiveProject,
    getProjectLogs,
    logProjectAction,
  };
}

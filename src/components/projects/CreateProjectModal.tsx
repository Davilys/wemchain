import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, Building2, User } from "lucide-react";
import { CreateProjectData } from "@/hooks/useProjects";

interface CreateProjectModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: CreateProjectData) => Promise<void>;
  initialData?: Partial<CreateProjectData>;
  isEditing?: boolean;
}

export function CreateProjectModal({
  open,
  onOpenChange,
  onSubmit,
  initialData,
  isEditing = false,
}: CreateProjectModalProps) {
  const [formData, setFormData] = useState<CreateProjectData>({
    name: initialData?.name || "",
    document_type: initialData?.document_type || "CPF",
    document_number: initialData?.document_number || "",
    email: initialData?.email || "",
    notes: initialData?.notes || "",
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!formData.name.trim() || !formData.document_number.trim()) {
      return;
    }

    setLoading(true);
    try {
      await onSubmit(formData);
      if (!isEditing) {
        setFormData({
          name: "",
          document_type: "CPF",
          document_number: "",
          email: "",
          notes: "",
        });
      }
      onOpenChange(false);
    } finally {
      setLoading(false);
    }
  };

  const formatDocument = (value: string, type: "CPF" | "CNPJ") => {
    const numbers = value.replace(/\D/g, "");
    if (type === "CPF") {
      return numbers
        .slice(0, 11)
        .replace(/(\d{3})(\d)/, "$1.$2")
        .replace(/(\d{3})(\d)/, "$1.$2")
        .replace(/(\d{3})(\d{1,2})/, "$1-$2");
    }
    return numbers
      .slice(0, 14)
      .replace(/(\d{2})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d)/, "$1/$2")
      .replace(/(\d{4})(\d{1,2})/, "$1-$2");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Editar Projeto" : "Criar Novo Projeto"}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Atualize os dados do titular/cliente deste projeto."
              : "Crie um projeto para registrar arquivos em nome de um cliente ou terceiro. Os créditos utilizados serão da sua conta."}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nome do Titular (Cliente) *</Label>
            <Input
              id="name"
              placeholder="Nome completo ou Razão Social"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="document_type">Tipo de Pessoa *</Label>
            <Select
              value={formData.document_type}
              onValueChange={(value: "CPF" | "CNPJ") =>
                setFormData({
                  ...formData,
                  document_type: value,
                  document_number: "",
                })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="CPF">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    Pessoa Física (CPF)
                  </div>
                </SelectItem>
                <SelectItem value="CNPJ">
                  <div className="flex items-center gap-2">
                    <Building2 className="h-4 w-4" />
                    Pessoa Jurídica (CNPJ)
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="document_number">
              {formData.document_type === "CPF" ? "CPF" : "CNPJ"} *
            </Label>
            <Input
              id="document_number"
              placeholder={
                formData.document_type === "CPF"
                  ? "000.000.000-00"
                  : "00.000.000/0000-00"
              }
              value={formatDocument(formData.document_number, formData.document_type)}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  document_number: e.target.value.replace(/\D/g, ""),
                })
              }
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">E-mail do Titular (opcional)</Label>
            <Input
              id="email"
              type="email"
              placeholder="email@exemplo.com"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Observações (opcional)</Label>
            <Textarea
              id="notes"
              placeholder="Informações adicionais sobre o projeto ou cliente..."
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              rows={3}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={loading || !formData.name.trim() || !formData.document_number.trim()}
          >
            {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            {isEditing ? "Salvar Alterações" : "Criar Projeto"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { UserPlus, ArrowLeft } from "lucide-react";
import { 
  formatDocument, 
  getDocumentPlaceholder, 
  getDocumentMaxLength 
} from "@/lib/documentFormatters";

export interface Author {
  id: string;
  name: string;
  email: string;
  document_type: "CPF" | "CNPJ";
  document_number: string;
  role: "PRIMARY" | "COAUTHOR";
  display_order: number;
}

interface AddAuthorModalProps {
  open: boolean;
  onClose: () => void;
  onAdd: (author: Omit<Author, "id" | "display_order">) => void;
}

export function AddAuthorModal({ open, onClose, onAdd }: AddAuthorModalProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [documentType, setDocumentType] = useState<"CPF" | "CNPJ">("CPF");
  const [documentNumber, setDocumentNumber] = useState("");

  const handleDocumentChange = (value: string) => {
    setDocumentNumber(formatDocument(value, documentType));
  };

  const handleDocumentTypeChange = (type: "CPF" | "CNPJ") => {
    setDocumentType(type);
    setDocumentNumber("");
  };

  const resetForm = () => {
    setName("");
    setEmail("");
    setDocumentType("CPF");
    setDocumentNumber("");
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim() || !email.trim() || !documentNumber.trim()) {
      return;
    }

    onAdd({
      name: name.trim(),
      email: email.trim(),
      document_type: documentType,
      document_number: documentNumber.replace(/\D/g, ""),
      role: "COAUTHOR",
    });

    resetForm();
    onClose();
  };

  const isValidEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const isValidDocument = () => {
    const numbers = documentNumber.replace(/\D/g, "");
    return documentType === "CPF" ? numbers.length === 11 : numbers.length === 14;
  };

  const isFormValid = name.trim() && isValidEmail(email) && isValidDocument();

  const placeholder = getDocumentPlaceholder(documentType);
  const maxLength = getDocumentMaxLength(documentType);

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-display flex items-center gap-2">
            <UserPlus className="h-5 w-5 text-primary" />
            Novo Coautor
          </DialogTitle>
          <DialogDescription className="font-body">
            Adicione um coautor para este registro de propriedade.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="author-name" className="font-body font-medium">
              Nome Completo *
            </Label>
            <Input
              id="author-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Nome completo do coautor"
              className="font-body"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="author-email" className="font-body font-medium">
              E-mail *
            </Label>
            <Input
              id="author-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="email@exemplo.com"
              className="font-body"
              required
            />
          </div>

          <div className="space-y-2">
            <Label className="font-body font-medium">
              Tipo de Documento *
            </Label>
            <Select
              value={documentType}
              onValueChange={(v) => handleDocumentTypeChange(v as "CPF" | "CNPJ")}
            >
              <SelectTrigger className="font-body">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="CPF">CPF</SelectItem>
                <SelectItem value="CNPJ">CNPJ</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="author-document" className="font-body font-medium">
              Número do Documento *
            </Label>
            <Input
              id="author-document"
              value={documentNumber}
              onChange={(e) => handleDocumentChange(e.target.value)}
              placeholder={placeholder}
              className="font-body"
              maxLength={maxLength}
              required
            />
          </div>

          <DialogFooter className="flex gap-2 sm:gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              className="flex-1 font-body"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar
            </Button>
            <Button
              type="submit"
              disabled={!isFormValid}
              className="flex-1 bg-primary text-primary-foreground font-body"
            >
              <UserPlus className="h-4 w-4 mr-2" />
              Adicionar
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

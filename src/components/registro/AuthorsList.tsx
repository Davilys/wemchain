import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { 
  UserPlus, 
  Trash2, 
  ArrowUpDown,
  User,
  Users,
  Mail,
  ShieldCheck
} from "lucide-react";
import { AddAuthorModal, Author } from "./AddAuthorModal";

interface AuthorsListProps {
  authors: Author[];
  onAuthorsChange: (authors: Author[]) => void;
  readOnly?: boolean;
  primaryAuthor: Omit<Author, "id" | "display_order"> | null;
}

export function AuthorsList({ 
  authors, 
  onAuthorsChange, 
  readOnly = false,
  primaryAuthor
}: AuthorsListProps) {
  const [showAddModal, setShowAddModal] = useState(false);

  const handleAddAuthor = (newAuthor: Omit<Author, "id" | "display_order">) => {
    const author: Author = {
      ...newAuthor,
      id: crypto.randomUUID(),
      display_order: authors.length,
    };
    onAuthorsChange([...authors, author]);
  };

  const handleRemoveAuthor = (authorId: string) => {
    const author = authors.find(a => a.id === authorId);
    if (author?.role === "PRIMARY") return; // Não pode remover autor principal
    
    const newAuthors = authors
      .filter(a => a.id !== authorId)
      .map((a, index) => ({ ...a, display_order: index }));
    onAuthorsChange(newAuthors);
  };

  const handleSwapOrder = (authorId: string) => {
    const authorIndex = authors.findIndex(a => a.id === authorId);
    if (authorIndex <= 0) return; // Já é o primeiro ou não encontrado
    
    const newAuthors = [...authors];
    [newAuthors[authorIndex - 1], newAuthors[authorIndex]] = [
      newAuthors[authorIndex],
      newAuthors[authorIndex - 1],
    ];
    
    // Atualizar display_order
    const reordered = newAuthors.map((a, index) => ({ ...a, display_order: index }));
    onAuthorsChange(reordered);
  };

  // Combinar autor principal com coautores
  const allAuthors: Author[] = primaryAuthor 
    ? [
        { 
          ...primaryAuthor, 
          id: "primary-author", 
          display_order: 0 
        },
        ...authors.filter(a => a.role !== "PRIMARY")
      ]
    : authors;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Users className="h-5 w-5 text-primary" />
          <h3 className="font-display font-semibold text-foreground">Autores</h3>
        </div>
        {!readOnly && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setShowAddModal(true)}
            className="font-body"
          >
            <UserPlus className="h-4 w-4 mr-2" />
            Adicionar coautor
          </Button>
        )}
      </div>

      {allAuthors.length === 0 ? (
        <div className="text-center py-8 border border-dashed border-border rounded-lg">
          <User className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
          <p className="font-body text-sm text-muted-foreground">
            Nenhum autor adicionado ainda
          </p>
        </div>
      ) : (
        <div className="border border-border rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/30">
                <TableHead className="font-body font-medium">Nome</TableHead>
                <TableHead className="font-body font-medium">E-mail</TableHead>
                <TableHead className="font-body font-medium">Tipo</TableHead>
                {!readOnly && (
                  <TableHead className="font-body font-medium text-right">Ações</TableHead>
                )}
              </TableRow>
            </TableHeader>
            <TableBody>
              {allAuthors.map((author, index) => (
                <TableRow key={author.id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                        {author.role === "PRIMARY" ? (
                          <ShieldCheck className="h-4 w-4 text-primary" />
                        ) : (
                          <User className="h-4 w-4 text-muted-foreground" />
                        )}
                      </div>
                      <span className="font-body font-medium text-foreground">
                        {author.name}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <Mail className="h-3 w-3" />
                      <span className="font-body text-sm">{author.email}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={author.role === "PRIMARY" ? "default" : "secondary"}
                      className={author.role === "PRIMARY" 
                        ? "bg-primary/10 text-primary border-primary/20" 
                        : ""}
                    >
                      {author.role === "PRIMARY" ? "Autor principal" : "Coautor"}
                    </Badge>
                  </TableCell>
                  {!readOnly && (
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        {index > 0 && (
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8"
                                  onClick={() => handleSwapOrder(author.id)}
                                >
                                  <ArrowUpDown className="h-4 w-4" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>Trocar ordem</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        )}
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                                onClick={() => handleRemoveAuthor(author.id)}
                                disabled={author.role === "PRIMARY"}
                              >
                                <Trash2 
                                  className={`h-4 w-4 ${
                                    author.role === "PRIMARY" 
                                      ? "text-muted-foreground/50" 
                                      : "text-destructive"
                                  }`} 
                                />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>
                                {author.role === "PRIMARY" 
                                  ? "Autor principal não pode ser removido" 
                                  : "Remover coautor"}
                              </p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </div>
                    </TableCell>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <AddAuthorModal
        open={showAddModal}
        onClose={() => setShowAddModal(false)}
        onAdd={handleAddAuthor}
      />
    </div>
  );
}

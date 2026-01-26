import { Link } from "react-router-dom";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Coins, AlertCircle } from "lucide-react";

interface NoCreditModalProps {
  open: boolean;
  onClose: () => void;
}

export function NoCreditModal({ open, onClose }: NoCreditModalProps) {
  return (
    <AlertDialog open={open} onOpenChange={onClose}>
      <AlertDialogContent className="max-w-md">
        <AlertDialogHeader className="text-center sm:text-center">
          <div className="mx-auto mb-4 h-14 w-14 rounded-full bg-warning/10 flex items-center justify-center">
            <AlertCircle className="h-7 w-7 text-warning" />
          </div>
          <AlertDialogTitle className="font-display text-xl">
            Você não possui créditos disponíveis
          </AlertDialogTitle>
          <AlertDialogDescription className="font-body text-sm text-muted-foreground">
            Para realizar este Registro de Propriedade em Blockchain, você precisa adquirir créditos. 
            Registros adicionais custam R$ 39,00 cada.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="p-4 rounded-lg bg-muted/50 border border-border/50 my-4">
          <p className="font-body text-xs text-muted-foreground text-center">
            <strong className="text-foreground">1 crédito = 1 Registro de Propriedade</strong>
            <br />
            Seu arquivo será registrado em blockchain pública com prova de anterioridade.
          </p>
        </div>

        <AlertDialogFooter className="flex-col sm:flex-row gap-2">
          <AlertDialogCancel 
            onClick={onClose}
            className="font-body"
          >
            Cancelar
          </AlertDialogCancel>
          <AlertDialogAction asChild>
            <Link 
              to="/checkout" 
              className="inline-flex items-center justify-center gap-2 bg-primary text-primary-foreground hover:bg-primary/90 font-body font-medium"
            >
              <Coins className="h-4 w-4" />
              Comprar créditos
            </Link>
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

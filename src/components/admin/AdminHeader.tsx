import { Bell, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useAuth } from "@/hooks/useAuth";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

export function AdminHeader() {
  const { user, signOut } = useAuth();

  const userInitials = user?.email?.slice(0, 2).toUpperCase() || "AD";

  return (
    <header className="h-16 border-b border-border bg-card flex items-center justify-between px-6">
      <div className="flex items-center gap-4">
        <Badge variant="outline" className="gap-2 px-3 py-1 border-primary/50">
          <ShieldCheck className="h-4 w-4 text-primary" />
          <span className="text-primary font-semibold">Modo Administrador</span>
        </Badge>
      </div>

      <div className="flex items-center gap-3">
        <ThemeToggle />

        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          <span className="absolute top-1 right-1 h-2 w-2 bg-destructive rounded-full" />
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="gap-2 px-2">
              <Avatar className="h-8 w-8 ring-2 ring-primary/50">
                <AvatarFallback className="bg-primary text-primary-foreground font-body text-sm">
                  {userInitials}
                </AvatarFallback>
              </Avatar>
              <span className="hidden md:inline font-body text-sm">
                {user?.email}
              </span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem className="font-body">
              Meu Perfil
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem 
              onClick={signOut}
              className="text-destructive font-body"
            >
              Sair
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}

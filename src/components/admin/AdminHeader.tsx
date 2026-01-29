import { Bell, ShieldCheck, User, LayoutDashboard, ArrowRightLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useAuth } from "@/hooks/useAuth";
import { Link } from "react-router-dom";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { SidebarTrigger } from "@/components/ui/sidebar";

export function AdminHeader() {
  const { user, signOut } = useAuth();

  const userInitials = user?.email?.slice(0, 2).toUpperCase() || "AD";

  return (
    <header className="h-16 border-b border-border bg-card flex items-center justify-between px-4 sm:px-6 shadow-sm">
      <div className="flex items-center gap-2 sm:gap-4">
        <SidebarTrigger className="lg:hidden" />
        
        {/* Premium Admin Badge */}
        <div className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20">
          <ShieldCheck className="h-4 w-4 text-primary" />
          <span className="text-sm text-primary font-semibold">Modo Administrador</span>
        </div>
      </div>

      <div className="flex items-center gap-2 sm:gap-3">
        {/* Switch to User Dashboard Button */}
        <Link to="/dashboard">
          <Button 
            variant="outline" 
            size="sm"
            className="gap-2 border-primary/30 hover:bg-primary/10 hover:border-primary/50"
          >
            <ArrowRightLeft className="h-4 w-4" />
            <span className="hidden md:inline">Painel Usuário</span>
            <LayoutDashboard className="h-4 w-4 md:hidden" />
          </Button>
        </Link>

        <ThemeToggle />

        <Button variant="ghost" size="icon" className="relative hover:bg-muted/50">
          <Bell className="h-5 w-5" />
          <span className="absolute top-1 right-1 h-2 w-2 bg-destructive rounded-full animate-pulse" />
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="gap-2 px-2 hover:bg-muted/50">
              <Avatar className="h-8 w-8 ring-2 ring-primary/30">
                <AvatarFallback className="bg-primary/10 text-primary font-body text-sm font-semibold">
                  {userInitials}
                </AvatarFallback>
              </Avatar>
              <span className="hidden md:inline font-body text-sm">
                {user?.email}
              </span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48 bg-card border-border shadow-lg z-50">
            <DropdownMenuItem asChild className="font-body cursor-pointer">
              <Link to="/conta" className="flex items-center">
                <User className="h-4 w-4 mr-2" />
                Meu Perfil
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild className="font-body cursor-pointer">
              <Link to="/dashboard" className="flex items-center">
                <LayoutDashboard className="h-4 w-4 mr-2" />
                Painel Usuário
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator className="bg-border/50" />
            <DropdownMenuItem 
              onClick={signOut}
              className="text-destructive font-body cursor-pointer"
            >
              Sair
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}

import { Link } from "react-router-dom";
import { Menu, Coins, LogOut, User, Settings, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useAuth } from "@/hooks/useAuth";
import { useCredits } from "@/hooks/useCredits";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import webmarcasLogo from "@/assets/webmarcas-logo.png";

interface DashboardHeaderProps {
  onToggleSidebar: () => void;
}

export function DashboardHeader({ onToggleSidebar }: DashboardHeaderProps) {
  const { user, signOut } = useAuth();
  const { credits, loading: creditsLoading } = useCredits();

  const userInitials = user?.email?.slice(0, 2).toUpperCase() || "US";

  return (
    <header className="h-16 border-b border-border bg-card/95 backdrop-blur-sm sticky top-0 z-40 flex items-center justify-between px-4 md:px-6">
      {/* Left: Menu + Logo */}
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          onClick={onToggleSidebar}
          className="lg:hidden h-9 w-9"
        >
          <Menu className="h-5 w-5" />
        </Button>

        <Link to="/dashboard" className="flex items-center gap-3">
          <img 
            src={webmarcasLogo} 
            alt="WebMarcas" 
            className="h-8 w-auto"
          />
          <div className="hidden sm:block">
            <span className="text-xs text-muted-foreground font-body">
              Prova de Anterioridade em Blockchain
            </span>
          </div>
        </Link>
      </div>

      {/* Right: Credits + Theme + User */}
      <div className="flex items-center gap-2 md:gap-3">
        {/* Credits - Always Visible */}
        <Link 
          to="/creditos"
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-primary/10 border border-primary/20 hover:bg-primary/15 transition-colors"
        >
          <Coins className="h-4 w-4 text-primary" />
          <span className="font-body font-semibold text-primary text-sm">
            {creditsLoading ? "..." : credits?.available_credits || 0}
          </span>
          <span className="hidden sm:inline text-xs text-muted-foreground">
            créditos
          </span>
        </Link>

        {/* Buy Credits Button */}
        <Button 
          asChild 
          size="sm" 
          className="hidden md:flex bg-primary text-primary-foreground hover:bg-primary/90 font-body font-medium h-8 px-3 text-xs"
        >
          <Link to="/checkout">
            Comprar créditos
          </Link>
        </Button>

        {/* Theme Toggle */}
        <ThemeToggle />

        {/* User Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="gap-2 px-2 h-9">
              <Avatar className="h-7 w-7">
                <AvatarFallback className="bg-muted text-muted-foreground font-body text-xs">
                  {userInitials}
                </AvatarFallback>
              </Avatar>
              <ChevronDown className="h-3 w-3 text-muted-foreground hidden sm:block" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <div className="px-2 py-1.5 text-xs text-muted-foreground font-body truncate">
              {user?.email}
            </div>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild className="font-body text-sm cursor-pointer">
              <Link to="/perfil" className="flex items-center gap-2">
                <User className="h-4 w-4" />
                Meu Perfil
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild className="font-body text-sm cursor-pointer">
              <Link to="/configuracoes" className="flex items-center gap-2">
                <Settings className="h-4 w-4" />
                Configurações
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem 
              onClick={signOut}
              className="text-destructive font-body text-sm cursor-pointer"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Sair
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}

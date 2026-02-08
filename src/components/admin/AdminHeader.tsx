import { Bell, ShieldCheck, User, LayoutDashboard, ArrowRightLeft, Menu, LogOut, Settings } from "lucide-react";
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
import { SidebarTrigger, useSidebar } from "@/components/ui/sidebar";
import webmarcasLogo from "@/assets/webmarcas-logo.png";

export function AdminHeader() {
  const { user, signOut } = useAuth();
  const sidebar = useSidebar();

  const userInitials = user?.email?.slice(0, 2).toUpperCase() || "AD";

  return (
    <header className="h-14 md:h-16 border-b border-border/50 bg-card/95 backdrop-blur-sm flex items-center justify-between px-3 sm:px-4 md:px-6 shadow-sm sticky top-0 z-40">
      <div className="flex items-center gap-2 sm:gap-4">
        {/* Mobile: Logo + Menu trigger */}
        <div className="flex items-center gap-2 lg:hidden">
          <SidebarTrigger className="h-9 w-9 rounded-xl border border-border/50 bg-muted/30 hover:bg-muted" />
          
          <Link to="/admin/dashboard" className="flex items-center gap-2">
            <div className="relative">
              <img 
                src={webmarcasLogo} 
                alt="WebMarcas" 
                className="h-8 w-8 object-contain"
              />
              <ShieldCheck className="absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 text-primary bg-background rounded-full" />
            </div>
            <span className="text-sm font-bold text-foreground hidden xs:block">
              <span>Admin</span>
            </span>
          </Link>
        </div>
        
        {/* Desktop: Premium Admin Badge */}
        <div className="hidden lg:flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20">
          <ShieldCheck className="h-4 w-4 text-primary" />
          <span className="text-sm text-primary font-semibold">Modo Administrador</span>
        </div>
      </div>

      <div className="flex items-center gap-1.5 sm:gap-2 md:gap-3">
        {/* Switch to User Dashboard Button */}
        <Link to="/dashboard">
          <Button 
            variant="outline" 
            size="sm"
            className="gap-1.5 border-primary/30 hover:bg-primary/10 hover:border-primary/50 h-8 md:h-9 px-2 md:px-3 text-xs md:text-sm"
          >
            <ArrowRightLeft className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Painel Usuário</span>
            <LayoutDashboard className="h-3.5 w-3.5 sm:hidden" />
          </Button>
        </Link>

        <ThemeToggle />

        {/* Notifications */}
        <Button variant="ghost" size="icon" className="relative hover:bg-muted/50 h-8 w-8 md:h-9 md:w-9 rounded-xl">
          <Bell className="h-4 w-4 md:h-5 md:w-5" />
          <span className="absolute top-1.5 right-1.5 h-2 w-2 bg-destructive rounded-full animate-pulse ring-2 ring-background" />
        </Button>

        {/* User Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="gap-1.5 px-1.5 hover:bg-muted/50 h-8 md:h-9 rounded-xl">
              <Avatar className="h-7 w-7 md:h-8 md:w-8 ring-2 ring-primary/30 transition-all hover:ring-primary/50">
                <AvatarFallback className="bg-gradient-to-br from-primary/20 to-primary/10 text-primary font-body text-xs md:text-sm font-semibold">
                  {userInitials}
                </AvatarFallback>
              </Avatar>
              <span className="hidden lg:inline font-body text-sm max-w-[120px] truncate">
                {user?.email}
              </span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56 bg-card/95 backdrop-blur-xl border-border/50 shadow-xl rounded-xl z-50">
            {/* User info */}
            <div className="px-3 py-2.5 border-b border-border/50">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                  <ShieldCheck className="h-4 w-4 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-primary">Administrador</p>
                  <p className="text-xs text-muted-foreground truncate">
                    {user?.email}
                  </p>
                </div>
              </div>
            </div>
            
            <div className="py-1.5">
              <DropdownMenuItem asChild className="font-body cursor-pointer rounded-lg mx-1.5 px-2.5">
                <Link to="/conta" className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-slate-500/10 flex items-center justify-center">
                    <User className="h-3.5 w-3.5 text-slate-600 dark:text-slate-400" />
                  </div>
                  Meu Perfil
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild className="font-body cursor-pointer rounded-lg mx-1.5 px-2.5">
                <Link to="/dashboard" className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-blue-500/10 flex items-center justify-center">
                    <LayoutDashboard className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
                  </div>
                  Painel Usuário
                </Link>
              </DropdownMenuItem>
            </div>
            
            <DropdownMenuSeparator className="bg-border/50" />
            <div className="p-1.5">
              <DropdownMenuItem 
                onClick={signOut}
                className="text-destructive font-body cursor-pointer rounded-lg px-2.5 hover:bg-destructive/10"
              >
                <div className="w-7 h-7 rounded-lg bg-destructive/10 flex items-center justify-center mr-2">
                  <LogOut className="h-3.5 w-3.5" />
                </div>
                Sair da Conta
              </DropdownMenuItem>
            </div>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}

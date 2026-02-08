import { Bell, ShieldCheck, User, LayoutDashboard, ArrowRightLeft, LogOut, Settings, Sparkles } from "lucide-react";
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
import webmarcasLogo from "@/assets/webmarcas-logo.png";

export function AdminHeader() {
  const { user, signOut } = useAuth();

  const userInitials = user?.email?.slice(0, 2).toUpperCase() || "AD";

  return (
    <header className="h-14 md:h-16 border-b border-border/30 bg-card/80 backdrop-blur-xl flex items-center justify-between px-3 sm:px-4 md:px-6 sticky top-0 z-40">
      {/* Subtle gradient line at bottom */}
      <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
      
      <div className="flex items-center gap-2 sm:gap-4">
        {/* Mobile: Logo + Menu trigger */}
        <div className="flex items-center gap-2.5 lg:hidden">
          <SidebarTrigger className="h-10 w-10 rounded-xl border border-border/40 bg-muted/30 hover:bg-muted/60 transition-colors" />
          
          <Link to="/admin/dashboard" className="flex items-center gap-2.5 group">
            <div className="relative">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20 flex items-center justify-center overflow-hidden group-hover:border-primary/40 transition-colors">
                <img 
                  src={webmarcasLogo} 
                  alt="WebMarcas" 
                  className="h-6 w-6 object-contain"
                />
              </div>
              <ShieldCheck className="absolute -bottom-0.5 -right-0.5 h-4 w-4 text-primary bg-background rounded-full border border-primary/30" />
            </div>
            <div className="hidden xs:block">
              <span className="text-sm font-bold text-foreground tracking-tight">
                Admin
              </span>
              <div className="flex items-center gap-1">
                <Sparkles className="h-2.5 w-2.5 text-primary" />
                <span className="text-[10px] text-primary font-semibold">Premium</span>
              </div>
            </div>
          </Link>
        </div>
        
        {/* Desktop: Premium Admin Badge */}
        <div className="hidden lg:flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-primary/15 to-primary/5 border border-primary/25 shadow-sm">
          <ShieldCheck className="h-4 w-4 text-primary" />
          <span className="text-sm text-primary font-bold">Administrador</span>
        </div>
      </div>

      <div className="flex items-center gap-1.5 sm:gap-2">
        {/* Switch to User Dashboard Button */}
        <Link to="/dashboard">
          <Button 
            variant="outline" 
            size="sm"
            className="gap-1.5 border-primary/30 bg-primary/5 hover:bg-primary/10 hover:border-primary/50 h-9 px-2.5 md:px-3 text-xs md:text-sm rounded-xl font-semibold"
          >
            <ArrowRightLeft className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Usuário</span>
            <LayoutDashboard className="h-3.5 w-3.5 sm:hidden" />
          </Button>
        </Link>

        <ThemeToggle />

        {/* Notifications */}
        <Button variant="ghost" size="icon" className="relative hover:bg-muted/50 h-9 w-9 rounded-xl">
          <Bell className="h-4.5 w-4.5" />
          <span className="absolute top-2 right-2 h-2 w-2 bg-destructive rounded-full animate-pulse ring-2 ring-background" />
        </Button>

        {/* User Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="gap-1.5 px-1.5 hover:bg-muted/50 h-9 rounded-xl">
              <Avatar className="h-8 w-8 ring-2 ring-primary/30 transition-all hover:ring-primary/50 shadow-sm">
                <AvatarFallback className="bg-gradient-to-br from-primary/30 via-primary/20 to-primary/10 text-primary font-body text-xs font-bold">
                  {userInitials}
                </AvatarFallback>
              </Avatar>
              <span className="hidden lg:inline font-body text-sm max-w-[100px] truncate font-medium">
                {user?.email?.split('@')[0]}
              </span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-60 bg-card/95 backdrop-blur-2xl border-border/30 shadow-2xl rounded-2xl z-50 p-1.5">
            {/* Admin info header */}
            <div className="px-3 py-3 mb-1.5 rounded-xl bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/30 to-primary/10 flex items-center justify-center">
                  <ShieldCheck className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-primary">Administrador</p>
                  <p className="text-xs text-muted-foreground truncate">
                    {user?.email}
                  </p>
                </div>
              </div>
            </div>
            
            <div className="space-y-0.5">
              <DropdownMenuItem asChild className="font-body cursor-pointer rounded-xl h-11 px-3">
                <Link to="/conta" className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-slate-500/20 to-slate-500/10 flex items-center justify-center">
                    <User className="h-4 w-4 text-slate-600 dark:text-slate-400" />
                  </div>
                  <span className="font-medium">Meu Perfil</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild className="font-body cursor-pointer rounded-xl h-11 px-3">
                <Link to="/dashboard" className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-500/20 to-blue-500/10 flex items-center justify-center">
                    <LayoutDashboard className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  </div>
                  <span className="font-medium">Painel Usuário</span>
                </Link>
              </DropdownMenuItem>
            </div>
            
            <DropdownMenuSeparator className="bg-border/30 my-2" />
            <DropdownMenuItem 
              onClick={signOut}
              className="text-destructive font-body cursor-pointer rounded-xl h-11 px-3 hover:bg-destructive/10"
            >
              <div className="w-8 h-8 rounded-xl bg-destructive/10 flex items-center justify-center mr-3">
                <LogOut className="h-4 w-4" />
              </div>
              <span className="font-medium">Sair da Conta</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}

import { Link } from "react-router-dom";
import { LogOut, User, Settings, ChevronDown, ShieldCheck, ArrowRightLeft, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useAuth } from "@/hooks/useAuth";
import { useAdminPermissions } from "@/hooks/useAdminPermissions";
import { HeaderCreditBadge } from "@/components/credits/HeaderCreditBadge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import webmarcasLogo from "@/assets/webmarcas-logo.png";

export function DashboardHeader() {
  const { user, signOut } = useAuth();
  const { isAdmin, loading: adminLoading } = useAdminPermissions();

  const userInitials = user?.email?.slice(0, 2).toUpperCase() || "US";

  return (
    <header className="h-14 md:h-16 border-b border-border/50 bg-card/95 backdrop-blur-sm sticky top-0 z-40 flex items-center justify-between px-3 md:px-6 shadow-sm">
      {/* Left: Logo */}
      <div className="flex items-center gap-2 md:gap-3">
        <Link to="/dashboard" className="flex items-center gap-2.5 lg:hidden group">
          <div className="relative">
            <img 
              src={webmarcasLogo} 
              alt="WebMarcas" 
              className="h-8 w-8 object-contain transition-transform group-hover:scale-105"
            />
            <Sparkles className="absolute -top-1 -right-1 h-3 w-3 text-primary animate-pulse" />
          </div>
          <div className="hidden xs:block">
            <span className="text-sm font-bold text-foreground">
              Web<span className="text-primary">Marcas</span>
            </span>
          </div>
        </Link>

        {/* Premium Badge - visible on desktop */}
        <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20">
          <User className="h-3.5 w-3.5 text-primary" />
          <span className="text-xs font-semibold text-primary">Área do Cliente</span>
        </div>
      </div>

      {/* Right: Credits + Admin Switch + Theme + User */}
      <div className="flex items-center gap-1.5 md:gap-3">
        {/* Credits Badge - Always Visible */}
        <HeaderCreditBadge showBuyButton={true} />

        {/* Admin Panel Switch - Only visible for admins */}
        {!adminLoading && isAdmin && (
          <Link to="/admin/dashboard" className="hidden sm:block">
            <Button 
              variant="outline" 
              size="sm"
              className="gap-2 border-primary/30 hover:bg-primary/10 hover:border-primary/50 h-8 md:h-9 text-xs md:text-sm"
            >
              <ArrowRightLeft className="h-3.5 w-3.5" />
              <span className="hidden md:inline">Painel Admin</span>
              <ShieldCheck className="h-3.5 w-3.5 md:hidden" />
            </Button>
          </Link>
        )}

        {/* Theme Toggle */}
        <ThemeToggle />

        {/* User Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="gap-1.5 px-1.5 h-8 md:h-9 hover:bg-muted/50 rounded-xl">
              <Avatar className="h-7 w-7 md:h-8 md:w-8 ring-2 ring-primary/20 transition-all hover:ring-primary/40">
                <AvatarFallback className="bg-gradient-to-br from-primary/20 to-primary/10 text-primary font-body text-xs font-semibold">
                  {userInitials}
                </AvatarFallback>
              </Avatar>
              <ChevronDown className="h-3 w-3 text-muted-foreground hidden sm:block" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-52 bg-card/95 backdrop-blur-xl border-border/50 shadow-xl rounded-xl z-50">
            {/* User email */}
            <div className="px-3 py-2.5 border-b border-border/50">
              <p className="text-xs text-muted-foreground">Logado como</p>
              <p className="text-sm font-medium text-foreground truncate mt-0.5">
                {user?.email}
              </p>
            </div>
            
            <div className="py-1.5">
              <DropdownMenuItem asChild className="font-body text-sm cursor-pointer rounded-lg mx-1.5 px-2.5">
                <Link to="/creditos" className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-yellow-500/10 flex items-center justify-center">
                    <User className="h-3.5 w-3.5 text-yellow-600 dark:text-yellow-400" />
                  </div>
                  Meus Créditos
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild className="font-body text-sm cursor-pointer rounded-lg mx-1.5 px-2.5">
                <Link to="/conta" className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-slate-500/10 flex items-center justify-center">
                    <Settings className="h-3.5 w-3.5 text-slate-600 dark:text-slate-400" />
                  </div>
                  Minha Conta
                </Link>
              </DropdownMenuItem>
              
              {/* Admin Panel Link in Menu - Only for admins */}
              {!adminLoading && isAdmin && (
                <>
                  <DropdownMenuSeparator className="bg-border/50 my-1.5" />
                  <DropdownMenuItem asChild className="font-body text-sm cursor-pointer rounded-lg mx-1.5 px-2.5">
                    <Link to="/admin/dashboard" className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center">
                        <ShieldCheck className="h-3.5 w-3.5 text-primary" />
                      </div>
                      Painel Admin
                    </Link>
                  </DropdownMenuItem>
                </>
              )}
            </div>
            
            <DropdownMenuSeparator className="bg-border/50" />
            <div className="p-1.5">
              <DropdownMenuItem 
                onClick={signOut}
                className="text-destructive font-body text-sm cursor-pointer rounded-lg px-2.5 hover:bg-destructive/10"
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

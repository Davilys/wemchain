import { Link } from "react-router-dom";
import { LogOut, User, Settings, ChevronDown, ShieldCheck, ArrowRightLeft, Sparkles, Crown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useAuth } from "@/hooks/useAuth";
import { useAdminPermissions } from "@/hooks/useAdminPermissions";
import { useBusinessPlan } from "@/hooks/useBusinessPlan";
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
  const { isBusinessPlan } = useBusinessPlan();

  const userInitials = user?.email?.slice(0, 2).toUpperCase() || "US";

  return (
    <header className="h-14 md:h-16 border-b border-border/30 bg-card/80 backdrop-blur-xl sticky top-0 z-40 flex items-center justify-between px-3 md:px-6">
      {/* Subtle bottom glow line */}
      <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-border/50 to-transparent" />
      
      {/* Left: Logo */}
      <div className="flex items-center gap-2 md:gap-3">
        <Link to="/dashboard" className="flex items-center gap-2.5 lg:hidden group">
          <div className="relative">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20 flex items-center justify-center overflow-hidden group-hover:border-primary/40 transition-colors">
              <img 
                src={webmarcasLogo} 
                alt="WebMarcas" 
                className="h-6 w-6 object-contain"
              />
            </div>
            <Sparkles className="absolute -top-1 -right-1 h-3.5 w-3.5 text-primary animate-pulse" />
          </div>
          <div className="hidden xs:block">
            <span className="text-sm font-bold text-foreground tracking-tight">
              Web<span className="text-primary">Marcas</span>
            </span>
          </div>
        </Link>

        {/* Plan Badge - visible on desktop */}
        <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-full bg-gradient-to-r from-primary/10 to-primary/5 border border-primary/20">
          {isBusinessPlan ? (
            <>
              <Crown className="h-3.5 w-3.5 text-amber-500" />
              <span className="text-xs font-semibold text-amber-600 dark:text-amber-400">Business</span>
            </>
          ) : (
            <>
              <User className="h-3.5 w-3.5 text-primary" />
              <span className="text-xs font-semibold text-primary">Área do Cliente</span>
            </>
          )}
        </div>
      </div>

      {/* Right: Credits + Admin Switch + Theme + User */}
      <div className="flex items-center gap-1.5 md:gap-2">
        {/* Credits Badge - Always Visible */}
        <HeaderCreditBadge showBuyButton={true} />

        {/* Admin Panel Switch - Only visible for admins */}
        {!adminLoading && isAdmin && (
          <Link to="/admin/dashboard" className="hidden sm:block">
            <Button 
              variant="outline" 
              size="sm"
              className="gap-2 border-primary/30 bg-primary/5 hover:bg-primary/10 hover:border-primary/50 h-8 md:h-9 text-xs md:text-sm rounded-xl"
            >
              <ArrowRightLeft className="h-3.5 w-3.5" />
              <span className="hidden md:inline">Admin</span>
              <ShieldCheck className="h-3.5 w-3.5 md:hidden" />
            </Button>
          </Link>
        )}

        {/* Theme Toggle */}
        <ThemeToggle />

        {/* User Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="gap-1.5 px-1.5 h-9 hover:bg-muted/50 rounded-xl">
              <Avatar className="h-8 w-8 ring-2 ring-primary/20 transition-all hover:ring-primary/40 shadow-sm">
                <AvatarFallback className="bg-gradient-to-br from-primary/30 via-primary/20 to-primary/10 text-primary font-body text-xs font-bold">
                  {userInitials}
                </AvatarFallback>
              </Avatar>
              <ChevronDown className="h-3 w-3 text-muted-foreground hidden sm:block" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56 bg-card/95 backdrop-blur-2xl border-border/30 shadow-2xl rounded-2xl z-50 p-1.5">
            {/* User email header */}
            <div className="px-3 py-3 mb-1.5 rounded-xl bg-gradient-to-br from-muted/50 to-muted/30">
              <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10 ring-2 ring-primary/20">
                  <AvatarFallback className="bg-gradient-to-br from-primary/30 to-primary/10 text-primary font-bold">
                    {userInitials}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-muted-foreground">Conectado como</p>
                  <p className="text-sm font-semibold text-foreground truncate">
                    {user?.email}
                  </p>
                </div>
              </div>
            </div>
            
            <div className="space-y-0.5">
              <DropdownMenuItem asChild className="font-body text-sm cursor-pointer rounded-xl h-11 px-3">
                <Link to="/creditos" className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-yellow-500/20 to-yellow-500/10 flex items-center justify-center">
                    <User className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
                  </div>
                  <span className="font-medium">Meus Créditos</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild className="font-body text-sm cursor-pointer rounded-xl h-11 px-3">
                <Link to="/conta" className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-slate-500/20 to-slate-500/10 flex items-center justify-center">
                    <Settings className="h-4 w-4 text-slate-600 dark:text-slate-400" />
                  </div>
                  <span className="font-medium">Configurações</span>
                </Link>
              </DropdownMenuItem>
              
              {/* Admin Panel Link - Only for admins */}
              {!adminLoading && isAdmin && (
                <>
                  <DropdownMenuSeparator className="bg-border/30 my-2" />
                  <DropdownMenuItem asChild className="font-body text-sm cursor-pointer rounded-xl h-11 px-3">
                    <Link to="/admin/dashboard" className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center">
                        <ShieldCheck className="h-4 w-4 text-primary" />
                      </div>
                      <span className="font-medium">Painel Admin</span>
                    </Link>
                  </DropdownMenuItem>
                </>
              )}
            </div>
            
            <DropdownMenuSeparator className="bg-border/30 my-2" />
            <DropdownMenuItem 
              onClick={signOut}
              className="text-destructive font-body text-sm cursor-pointer rounded-xl h-11 px-3 hover:bg-destructive/10"
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

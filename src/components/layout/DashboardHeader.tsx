import { Link } from "react-router-dom";
import { LogOut, User, Settings, ChevronDown, ShieldCheck, ArrowRightLeft } from "lucide-react";
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
    <header className="h-16 border-b border-border bg-card sticky top-0 z-40 flex items-center justify-between px-4 md:px-6 shadow-sm">
      {/* Left: Logo */}
      <div className="flex items-center gap-3">
        <Link to="/dashboard" className="flex items-center gap-3 lg:hidden">
          <img 
            src={webmarcasLogo} 
            alt="WebMarcas" 
            className="h-8 w-auto"
          />
        </Link>

        {/* Premium Badge - visible on desktop */}
        <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20">
          <User className="h-3.5 w-3.5 text-primary" />
          <span className="text-xs font-semibold text-primary">Área do Cliente</span>
        </div>
      </div>

      {/* Right: Credits + Admin Switch + Theme + User */}
      <div className="flex items-center gap-2 md:gap-3">
        {/* Credits Badge - Always Visible */}
        <HeaderCreditBadge showBuyButton={true} />

        {/* Admin Panel Switch - Only visible for admins */}
        {!adminLoading && isAdmin && (
          <Link to="/admin/dashboard">
            <Button 
              variant="outline" 
              size="sm"
              className="gap-2 border-primary/30 hover:bg-primary/10 hover:border-primary/50"
            >
              <ArrowRightLeft className="h-4 w-4" />
              <span className="hidden md:inline">Painel Admin</span>
              <ShieldCheck className="h-4 w-4 md:hidden" />
            </Button>
          </Link>
        )}

        {/* Theme Toggle */}
        <ThemeToggle />

        {/* User Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="gap-2 px-2 h-9 hover:bg-muted/50">
              <Avatar className="h-8 w-8 ring-2 ring-primary/20">
                <AvatarFallback className="bg-primary/10 text-primary font-body text-xs font-semibold">
                  {userInitials}
                </AvatarFallback>
              </Avatar>
              <ChevronDown className="h-3 w-3 text-muted-foreground hidden sm:block" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48 bg-card border-border shadow-lg z-50">
            <div className="px-2 py-1.5 text-xs text-muted-foreground font-body truncate">
              {user?.email}
            </div>
            <DropdownMenuSeparator className="bg-border" />
            <DropdownMenuItem asChild className="font-body text-sm cursor-pointer">
              <Link to="/creditos" className="flex items-center gap-2">
                <User className="h-4 w-4" />
                Meus Créditos
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild className="font-body text-sm cursor-pointer">
              <Link to="/configuracoes" className="flex items-center gap-2">
                <Settings className="h-4 w-4" />
                Configurações
              </Link>
            </DropdownMenuItem>
            {/* Admin Panel Link in Menu - Only for admins */}
            {!adminLoading && isAdmin && (
              <>
                <DropdownMenuSeparator className="bg-border" />
                <DropdownMenuItem asChild className="font-body text-sm cursor-pointer">
                  <Link to="/admin/dashboard" className="flex items-center gap-2 text-primary">
                    <ShieldCheck className="h-4 w-4" />
                    Painel Admin
                  </Link>
                </DropdownMenuItem>
              </>
            )}
            <DropdownMenuSeparator className="bg-border" />
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
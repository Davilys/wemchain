import { Link, useLocation } from "react-router-dom";
import { 
  LayoutDashboard,
  FileText,
  Plus,
  Coins,
  Award,
  LogOut,
  Home,
  Shield,
  FolderOpen,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { useCredits } from "@/hooks/useCredits";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import webmarcasLogo from "@/assets/webmarcas-logo.png";

interface DashboardMobileNavProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const menuItems = [
  {
    title: "Dashboard",
    url: "/dashboard",
    icon: LayoutDashboard,
    color: "text-blue-500",
    bgColor: "bg-blue-500/10",
  },
  {
    title: "Novo Registro",
    url: "/novo-registro",
    icon: Plus,
    color: "text-green-500",
    bgColor: "bg-green-500/10",
  },
  {
    title: "Meus Registros",
    url: "/meus-registros",
    icon: FileText,
    color: "text-purple-500",
    bgColor: "bg-purple-500/10",
  },
  {
    title: "Projetos",
    url: "/projetos",
    icon: FolderOpen,
    color: "text-amber-500",
    bgColor: "bg-amber-500/10",
  },
  {
    title: "Créditos",
    url: "/creditos",
    icon: Coins,
    color: "text-yellow-500",
    bgColor: "bg-yellow-500/10",
  },
  {
    title: "Certificados",
    url: "/meus-registros?status=confirmado",
    icon: Award,
    color: "text-orange-500",
    bgColor: "bg-orange-500/10",
  },
];

export function DashboardMobileNav({ open, onOpenChange }: DashboardMobileNavProps) {
  const location = useLocation();
  const { signOut } = useAuth();
  const { credits, loading: creditsLoading } = useCredits();

  const isActive = (url: string) => {
    if (url.includes("?")) {
      return location.pathname + location.search === url;
    }
    return location.pathname === url;
  };

  const handleLinkClick = () => {
    onOpenChange(false);
  };

  const handleSignOut = () => {
    signOut();
    onOpenChange(false);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent 
        side="left" 
        className="w-[85vw] max-w-[320px] p-0 bg-card border-r border-border/50"
      >
        {/* Header */}
        <SheetHeader className="p-4 border-b border-border/50 bg-muted/30">
          <Link 
            to="/dashboard" 
            onClick={handleLinkClick}
            className="flex items-center gap-3"
          >
            <div className="relative h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/20 overflow-hidden">
              <img 
                src={webmarcasLogo} 
                alt="WebMarcas" 
                className="h-7 w-7 object-contain"
              />
              <Shield className="absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 text-primary bg-card rounded-full" />
            </div>
            <div>
              <SheetTitle className="text-lg font-bold text-foreground text-left">
                Web<span className="text-primary">Marcas</span>
              </SheetTitle>
              <p className="text-xs text-muted-foreground font-medium">
                Área do Cliente
              </p>
            </div>
          </Link>
        </SheetHeader>

        {/* Content */}
        <div className="flex flex-col h-[calc(100vh-80px)] overflow-y-auto">
          {/* Credits Card */}
          <div className="p-4 border-b border-border/50">
            <Link 
              to="/creditos" 
              onClick={handleLinkClick}
              className="flex items-center justify-between p-4 rounded-xl bg-gradient-to-br from-primary/15 to-primary/5 border border-primary/20 hover:border-primary/40 transition-all"
            >
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center">
                  <Coins className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground font-medium">Saldo disponível</p>
                  <p className="text-2xl font-bold text-primary">
                    {creditsLoading ? "..." : credits?.available_credits || 0}
                  </p>
                </div>
              </div>
              <span className="text-xs text-primary font-medium">Ver →</span>
            </Link>
          </div>

          {/* Navigation Menu */}
          <nav className="flex-1 p-4">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-3 mb-3">
              Menu Principal
            </p>
            <ul className="space-y-1">
              {menuItems.map((item) => (
                <li key={item.url}>
                  <Link
                    to={item.url}
                    onClick={handleLinkClick}
                    className={`flex items-center gap-3 px-3 py-3.5 rounded-xl text-sm font-medium transition-all ${
                      isActive(item.url)
                        ? "bg-primary/10 border border-primary/20"
                        : "hover:bg-muted/50 border border-transparent"
                    }`}
                  >
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center transition-all ${
                      isActive(item.url) ? item.bgColor : "bg-muted"
                    }`}>
                      <item.icon className={`h-5 w-5 ${
                        isActive(item.url) ? item.color : "text-muted-foreground"
                      }`} />
                    </div>
                    <span className={
                      isActive(item.url) ? "text-foreground" : "text-muted-foreground"
                    }>
                      {item.title}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>

            {/* Quick Link to Site */}
            <div className="mt-6 pt-4 border-t border-border/50">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-3 mb-3">
                Acesso Rápido
              </p>
              <Link
                to="/"
                onClick={handleLinkClick}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-all"
              >
                <Home className="h-4 w-4" />
                Voltar ao Site
              </Link>
            </div>
          </nav>

          {/* Bottom Actions */}
          <div className="p-4 border-t border-border/50 bg-muted/30 mt-auto space-y-2">
            <Button 
              asChild 
              className="w-full bg-primary text-primary-foreground hover:bg-primary/90 rounded-xl h-12 font-semibold"
            >
              <Link to="/checkout" onClick={handleLinkClick}>
                <Coins className="h-4 w-4 mr-2" />
                Comprar Créditos
              </Link>
            </Button>
            <Button 
              variant="ghost" 
              onClick={handleSignOut}
              className="w-full justify-start text-destructive hover:text-destructive hover:bg-destructive/10 rounded-xl h-11"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Sair da conta
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}

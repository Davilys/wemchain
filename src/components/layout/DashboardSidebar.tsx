import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  FileText,
  Coins,
  Award,
  ChevronLeft,
  ChevronRight,
  Shield,
  FolderOpen,
  Crown,
  Settings,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useBusinessPlan } from "@/hooks/useBusinessPlan";
import webmarcasLogo from "@/assets/webmarcas-logo.png";

interface DashboardSidebarProps {
  collapsed: boolean;
  onToggle?: () => void;
}

export function DashboardSidebar({ collapsed, onToggle }: DashboardSidebarProps) {
  const location = useLocation();
  const { isBusinessPlan } = useBusinessPlan();

  const isActive = (url: string) => {
    if (url.includes("?")) {
      return location.pathname + location.search === url;
    }
    return location.pathname === url || location.pathname.startsWith(url + "/");
  };

  // Menu items na ordem definida
  const menuItems = [
    {
      title: "Dashboard",
      url: "/dashboard",
      icon: LayoutDashboard,
      color: "text-blue-500",
      bgColor: "bg-blue-500/10",
      show: true,
    },
    {
      title: "Projetos",
      url: "/projetos",
      icon: FolderOpen,
      color: "text-amber-500",
      bgColor: "bg-amber-500/10",
      isBusiness: true,
      show: isBusinessPlan, // Só aparece para Business
    },
    {
      title: "Meus Registros",
      url: "/meus-registros",
      icon: FileText,
      color: "text-purple-500",
      bgColor: "bg-purple-500/10",
      show: true,
    },
    {
      title: "Créditos",
      url: "/creditos",
      icon: Coins,
      color: "text-yellow-500",
      bgColor: "bg-yellow-500/10",
      show: true,
    },
    {
      title: "Certificados",
      url: "/meus-registros?status=confirmado",
      icon: Award,
      color: "text-green-500",
      bgColor: "bg-green-500/10",
      show: true,
    },
    {
      title: "Configurações",
      url: "/conta",
      icon: Settings,
      color: "text-slate-500",
      bgColor: "bg-slate-500/10",
      show: true,
    },
  ];

  const visibleMenuItems = menuItems.filter(item => item.show);

  return (
    <aside
      className={cn(
        "hidden lg:flex flex-col border-r border-border bg-card transition-all duration-300 relative shadow-sm",
        collapsed ? "w-16" : "w-60"
      )}
    >
      {/* Logo Header */}
      {!collapsed && (
        <div className="p-4 border-b border-border/50">
          <Link to="/dashboard" className="flex items-center gap-3">
            <div className="relative">
              <img 
                src={webmarcasLogo} 
                alt="WebMarcas" 
                className="h-9 w-9 object-contain"
              />
              <Shield className="absolute -bottom-1 -right-1 h-3.5 w-3.5 text-primary bg-background rounded-full" />
            </div>
            <div>
              <span className="text-base font-bold text-foreground tracking-tight">
                Web<span className="text-primary">Marcas</span>
              </span>
              <p className="text-[10px] text-muted-foreground font-medium">
                Registro em Blockchain
              </p>
            </div>
          </Link>
        </div>
      )}

      {/* Toggle Button */}
      <Button
        variant="ghost"
        size="icon"
        onClick={onToggle}
        className="absolute -right-3 top-6 h-6 w-6 rounded-full border border-border/50 bg-card shadow-sm z-10 hover:bg-muted"
      >
        {collapsed ? (
          <ChevronRight className="h-3 w-3" />
        ) : (
          <ChevronLeft className="h-3 w-3" />
        )}
      </Button>

      {/* Business Badge */}
      {!collapsed && isBusinessPlan && (
        <div className="px-3 pt-4">
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-amber-500/10 border border-amber-500/20">
            <Crown className="h-4 w-4 text-amber-500" />
            <span className="text-xs font-medium text-amber-600 dark:text-amber-400">Plano Business</span>
          </div>
        </div>
      )}

      {/* Menu Items */}
      <nav className="flex-1 py-4 px-2">
        <ul className="space-y-1">
          {visibleMenuItems.map((item) => (
            <li key={item.url}>
              <Link
                to={item.url}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-xl font-body text-sm transition-all duration-200",
                  isActive(item.url)
                    ? "bg-primary/10 border border-primary/20"
                    : "hover:bg-muted/50 border border-transparent"
                )}
                title={collapsed ? item.title : undefined}
              >
                <div className={cn(
                  "w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 transition-all relative",
                  isActive(item.url) ? item.bgColor : "bg-muted"
                )}>
                  <item.icon className={cn(
                    "h-4 w-4",
                    isActive(item.url) ? item.color : "text-muted-foreground"
                  )} />
                  {"isBusiness" in item && item.isBusiness && (
                    <Crown className="absolute -top-1 -right-1 h-3 w-3 text-amber-500" />
                  )}
                </div>
                {!collapsed && (
                  <span className={cn(
                    "truncate font-medium",
                    isActive(item.url) ? "text-foreground" : "text-muted-foreground"
                  )}>
                    {item.title}
                  </span>
                )}
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      {/* Bottom CTA - Only when expanded */}
      {!collapsed && (
        <div className="p-3 border-t border-border/50">
          <Link
            to="/checkout"
            className="flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl bg-primary text-primary-foreground font-body text-sm font-semibold hover:bg-primary/90 transition-all btn-premium"
          >
            <Coins className="h-4 w-4" />
            Comprar Créditos
          </Link>
        </div>
      )}
    </aside>
  );
}

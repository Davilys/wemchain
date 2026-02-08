import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  FileText,
  Plus,
  FolderOpen,
  Crown,
  User,
} from "lucide-react";
import { useBusinessPlan } from "@/hooks/useBusinessPlan";

export function DashboardBottomNav() {
  const location = useLocation();
  const { isBusinessPlan } = useBusinessPlan();

  const isActive = (url: string) => {
    if (url.includes("?")) {
      return location.pathname + location.search === url;
    }
    return location.pathname === url || location.pathname.startsWith(url + "/");
  };

  // Menu items - Projetos só aparece para Business
  const menuItems = [
    {
      title: "Início",
      url: "/dashboard",
      icon: LayoutDashboard,
      show: true,
    },
    {
      title: "Projetos",
      url: "/projetos",
      icon: FolderOpen,
      isBusiness: true,
      show: isBusinessPlan,
    },
    {
      title: "Novo",
      url: "/novo-registro",
      icon: Plus,
      isMain: true,
      show: true,
    },
    {
      title: "Registros",
      url: "/meus-registros",
      icon: FileText,
      show: true,
    },
    {
      title: "Conta",
      url: "/conta",
      icon: User,
      show: true,
    },
  ];

  const visibleItems = menuItems.filter(item => item.show);

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 lg:hidden">
      {/* Gradient overlay for seamless blend */}
      <div className="absolute inset-0 bg-gradient-to-t from-background via-background/95 to-transparent -top-4 pointer-events-none" />
      
      {/* Main nav container */}
      <div className="relative bg-card/98 backdrop-blur-xl border-t border-border/40 shadow-[0_-4px_20px_-4px_rgba(0,0,0,0.1)] dark:shadow-[0_-4px_20px_-4px_rgba(0,0,0,0.3)]">
        <div className="flex items-center justify-around px-1 py-2 max-w-md mx-auto safe-area-bottom">
          {visibleItems.map((item) => {
            const active = isActive(item.url);
            
            // Main action button (Novo Registro)
            if ("isMain" in item && item.isMain) {
              return (
                <Link
                  key={item.url}
                  to={item.url}
                  className="flex flex-col items-center justify-center -mt-6 group"
                >
                  <div className="relative">
                    {/* Glow effect */}
                    <div className="absolute inset-0 rounded-full bg-primary/40 blur-lg scale-110 group-hover:scale-125 transition-transform" />
                    {/* Button */}
                    <div className="relative w-14 h-14 rounded-full bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center shadow-lg shadow-primary/25 border-[3px] border-background ring-2 ring-primary/20 group-hover:scale-105 transition-transform">
                      <item.icon className="h-6 w-6 text-primary-foreground" strokeWidth={2.5} />
                    </div>
                  </div>
                  <span className="text-[10px] font-semibold text-primary mt-1.5 tracking-tight">
                    {item.title}
                  </span>
                </Link>
              );
            }

            return (
              <Link
                key={item.url}
                to={item.url}
                className={cn(
                  "flex flex-col items-center justify-center py-1.5 px-3 min-w-[56px] transition-all duration-200 group"
                )}
              >
                <div className={cn(
                  "relative w-10 h-10 rounded-2xl flex items-center justify-center transition-all duration-200",
                  active 
                    ? "bg-primary/15 scale-105" 
                    : "bg-transparent group-hover:bg-muted/60"
                )}>
                  <item.icon className={cn(
                    "h-5 w-5 transition-all duration-200",
                    active 
                      ? "text-primary" 
                      : "text-muted-foreground group-hover:text-foreground"
                  )} strokeWidth={active ? 2.5 : 2} />
                  
                  {/* Business badge */}
                  {"isBusiness" in item && item.isBusiness && (
                    <div className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-amber-100 dark:bg-amber-900/50 flex items-center justify-center border border-amber-300 dark:border-amber-700">
                      <Crown className="h-2.5 w-2.5 text-amber-600 dark:text-amber-400" />
                    </div>
                  )}
                  
                  {/* Active indicator dot */}
                  {active && (
                    <div className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-primary" />
                  )}
                </div>
                <span className={cn(
                  "text-[10px] font-medium mt-0.5 transition-colors duration-200 tracking-tight",
                  active 
                    ? "text-primary font-semibold" 
                    : "text-muted-foreground group-hover:text-foreground"
                )}>
                  {item.title}
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}

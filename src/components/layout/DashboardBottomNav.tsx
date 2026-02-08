import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
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
      {/* Premium gradient overlay */}
      <div className="absolute inset-0 -top-8 bg-gradient-to-t from-background via-background/98 to-transparent pointer-events-none" />
      
      {/* Glass morphism container */}
      <div className="relative mx-2 mb-2 rounded-2xl bg-card/80 backdrop-blur-2xl border border-border/30 shadow-[0_-8px_32px_-8px_rgba(0,0,0,0.15)] dark:shadow-[0_-8px_32px_-8px_rgba(0,0,0,0.4)]">
        {/* Subtle top glow */}
        <div className="absolute inset-x-0 -top-px h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
        
        <div className="flex items-center justify-around px-2 py-2.5 max-w-md mx-auto">
          {visibleItems.map((item) => {
            const active = isActive(item.url);
            
            // Main action button (Novo Registro)
            if ("isMain" in item && item.isMain) {
              return (
                <Link
                  key={item.url}
                  to={item.url}
                  className="flex flex-col items-center justify-center -mt-8 group"
                >
                  <motion.div 
                    className="relative"
                    whileTap={{ scale: 0.92 }}
                    transition={{ type: "spring", stiffness: 400, damping: 17 }}
                  >
                    {/* Outer glow ring */}
                    <div className="absolute inset-0 rounded-full bg-gradient-to-br from-primary/50 to-primary/20 blur-xl scale-150 opacity-60 group-hover:opacity-80 transition-opacity" />
                    
                    {/* Main button */}
                    <div className="relative w-16 h-16 rounded-full bg-gradient-to-br from-primary via-primary to-primary/80 flex items-center justify-center shadow-xl shadow-primary/30 border-4 border-background ring-2 ring-primary/30">
                      <div className="absolute inset-1 rounded-full bg-gradient-to-br from-white/20 to-transparent" />
                      <item.icon className="h-7 w-7 text-primary-foreground relative z-10" strokeWidth={2.5} />
                    </div>
                  </motion.div>
                  <span className="text-[11px] font-bold text-primary mt-2 tracking-tight">
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
                  "flex flex-col items-center justify-center py-1 px-2 min-w-[60px] transition-all duration-300 group"
                )}
              >
                <motion.div 
                  className={cn(
                    "relative w-11 h-11 rounded-2xl flex items-center justify-center transition-all duration-300",
                    active 
                      ? "bg-gradient-to-br from-primary/20 to-primary/10 shadow-lg shadow-primary/10" 
                      : "bg-transparent group-hover:bg-muted/50"
                  )}
                  whileTap={{ scale: 0.9 }}
                  transition={{ type: "spring", stiffness: 400, damping: 17 }}
                >
                  {/* Active state inner glow */}
                  {active && (
                    <div className="absolute inset-0 rounded-2xl ring-1 ring-primary/30" />
                  )}
                  
                  <item.icon className={cn(
                    "h-5 w-5 transition-all duration-300 relative z-10",
                    active 
                      ? "text-primary" 
                      : "text-muted-foreground group-hover:text-foreground"
                  )} strokeWidth={active ? 2.5 : 2} />
                  
                  {/* Business badge */}
                  {"isBusiness" in item && item.isBusiness && (
                    <div className="absolute -top-1 -right-1 w-4.5 h-4.5 rounded-full bg-gradient-to-br from-amber-400 to-amber-500 flex items-center justify-center shadow-lg shadow-amber-500/30 border-2 border-background">
                      <Crown className="h-2.5 w-2.5 text-white" />
                    </div>
                  )}
                </motion.div>
                
                <span className={cn(
                  "text-[10px] font-semibold mt-1 transition-colors duration-300 tracking-tight",
                  active 
                    ? "text-primary" 
                    : "text-muted-foreground group-hover:text-foreground"
                )}>
                  {item.title}
                </span>
                
                {/* Active indicator bar */}
                {active && (
                  <motion.div 
                    className="absolute bottom-0.5 w-6 h-0.5 rounded-full bg-gradient-to-r from-primary/60 via-primary to-primary/60"
                    layoutId="activeTab"
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  />
                )}
              </Link>
            );
          })}
        </div>
      </div>
      
      {/* Safe area padding */}
      <div className="h-safe-area-inset-bottom bg-background" />
    </nav>
  );
}

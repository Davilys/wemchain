import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  FileText,
  Plus,
  Coins,
  FolderOpen,
} from "lucide-react";

const menuItems = [
  {
    title: "Início",
    url: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Registros",
    url: "/meus-registros",
    icon: FileText,
  },
  {
    title: "Novo",
    url: "/novo-registro",
    icon: Plus,
    isMain: true,
  },
  {
    title: "Projetos",
    url: "/projetos",
    icon: FolderOpen,
  },
  {
    title: "Créditos",
    url: "/creditos",
    icon: Coins,
  },
];

export function DashboardBottomNav() {
  const location = useLocation();

  const isActive = (url: string) => {
    if (url.includes("?")) {
      return location.pathname + location.search === url;
    }
    return location.pathname === url || location.pathname.startsWith(url + "/");
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 lg:hidden bg-card/95 backdrop-blur-md border-t border-border/50 safe-area-bottom">
      <div className="flex items-center justify-around px-2 py-1">
        {menuItems.map((item) => {
          const active = isActive(item.url);
          
          if ("isMain" in item && item.isMain) {
            return (
              <Link
                key={item.url}
                to={item.url}
                className="flex flex-col items-center justify-center -mt-5"
              >
                <div className="w-14 h-14 rounded-full bg-primary flex items-center justify-center shadow-lg shadow-primary/30 border-4 border-background">
                  <item.icon className="h-6 w-6 text-primary-foreground" />
                </div>
                <span className="text-[10px] font-medium text-primary mt-1">
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
                "flex flex-col items-center justify-center py-2 px-2 min-w-[50px] transition-colors",
                active ? "text-primary" : "text-muted-foreground"
              )}
            >
              <div className={cn(
                "w-9 h-9 rounded-xl flex items-center justify-center transition-all",
                active ? "bg-primary/15" : "bg-transparent"
              )}>
                <item.icon className={cn(
                  "h-5 w-5 transition-colors",
                  active ? "text-primary" : "text-muted-foreground"
                )} />
              </div>
              <span className={cn(
                "text-[9px] font-medium mt-0.5 transition-colors",
                active ? "text-primary" : "text-muted-foreground"
              )}>
                {item.title}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

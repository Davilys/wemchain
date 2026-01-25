import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  FileText,
  Plus,
  Coins,
  Award,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface DashboardSidebarProps {
  collapsed: boolean;
  onToggle?: () => void;
}

const menuItems = [
  {
    title: "Dashboard",
    url: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Novo Registro",
    url: "/novo-registro",
    icon: Plus,
  },
  {
    title: "Registros de Propriedade",
    url: "/meus-registros",
    icon: FileText,
  },
  {
    title: "Créditos",
    url: "/creditos",
    icon: Coins,
  },
  {
    title: "Certificados",
    url: "/meus-registros?status=confirmado",
    icon: Award,
  },
];

export function DashboardSidebar({ collapsed, onToggle }: DashboardSidebarProps) {
  const location = useLocation();

  const isActive = (url: string) => {
    if (url.includes("?")) {
      return location.pathname + location.search === url;
    }
    return location.pathname === url;
  };

  return (
    <aside
      className={cn(
        "hidden lg:flex flex-col border-r border-border bg-card/50 transition-all duration-300 relative",
        collapsed ? "w-16" : "w-56"
      )}
    >
      {/* Toggle Button */}
      <Button
        variant="ghost"
        size="icon"
        onClick={onToggle}
        className="absolute -right-3 top-6 h-6 w-6 rounded-full border border-border bg-card shadow-sm z-10 hover:bg-muted"
      >
        {collapsed ? (
          <ChevronRight className="h-3 w-3" />
        ) : (
          <ChevronLeft className="h-3 w-3" />
        )}
      </Button>

      {/* Menu Items */}
      <nav className="flex-1 py-6 px-3">
        <ul className="space-y-1">
          {menuItems.map((item) => (
            <li key={item.url}>
              <Link
                to={item.url}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg font-body text-sm transition-all duration-200",
                  isActive(item.url)
                    ? "bg-primary/10 text-primary font-medium"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                )}
                title={collapsed ? item.title : undefined}
              >
                <item.icon className={cn(
                  "h-5 w-5 flex-shrink-0",
                  isActive(item.url) ? "text-primary" : ""
                )} />
                {!collapsed && (
                  <span className="truncate">{item.title}</span>
                )}
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      {/* Bottom CTA - Only when expanded */}
      {!collapsed && (
        <div className="p-3 border-t border-border">
          <Link
            to="/checkout"
            className="flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-primary text-primary-foreground font-body text-sm font-medium hover:bg-primary/90 transition-colors"
          >
            <Plus className="h-4 w-4" />
            Registros de Propriedade
          </Link>
        </div>
      )}
    </aside>
  );
}

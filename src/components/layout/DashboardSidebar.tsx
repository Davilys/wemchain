import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  FileText,
  Upload,
  CreditCard,
  Settings,
  LogOut,
  Shield,
  Users,
  BarChart3,
  FolderOpen,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import webmarcasLogo from "@/assets/webmarcas-logo.png";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";

interface DashboardSidebarProps {
  collapsed?: boolean;
}

const mainMenuItems = [
  {
    title: "Dashboard",
    url: "/dashboard",
    icon: LayoutDashboard,
    color: "text-blue-400",
    bgColor: "bg-blue-400/10",
  },
  {
    title: "Meus Registros",
    url: "/meus-registros",
    icon: FileText,
    color: "text-purple-400",
    bgColor: "bg-purple-400/10",
  },
  {
    title: "Novo Registro",
    url: "/novo-registro",
    icon: Upload,
    color: "text-green-400",
    bgColor: "bg-green-400/10",
  },
  {
    title: "Documentos",
    url: "/documentos",
    icon: FolderOpen,
    color: "text-yellow-400",
    bgColor: "bg-yellow-400/10",
  },
  {
    title: "Pagamentos",
    url: "/pagamentos",
    icon: CreditCard,
    color: "text-orange-400",
    bgColor: "bg-orange-400/10",
  },
];

const secondaryMenuItems = [
  {
    title: "Relatórios",
    url: "/relatorios",
    icon: BarChart3,
    color: "text-cyan-400",
    bgColor: "bg-cyan-400/10",
  },
  {
    title: "Clientes",
    url: "/clientes",
    icon: Users,
    color: "text-pink-400",
    bgColor: "bg-pink-400/10",
  },
  {
    title: "Configurações",
    url: "/configuracoes",
    icon: Settings,
    color: "text-gray-400",
    bgColor: "bg-gray-400/10",
  },
];

export function DashboardSidebar({ collapsed }: DashboardSidebarProps) {
  const location = useLocation();
  const { signOut } = useAuth();

  const isActive = (path: string) => location.pathname === path;

  return (
    <Sidebar
      className={cn(
        "border-r border-sidebar-border bg-sidebar transition-all duration-300",
        collapsed ? "w-16" : "w-64"
      )}
    >
      <SidebarHeader className="p-4 border-b border-sidebar-border">
        <Link to="/" className="flex items-center gap-3">
          <img 
            src={webmarcasLogo} 
            alt="WebMarcas" 
            className="h-10 w-10 object-contain"
          />
          {!collapsed && (
            <div>
              <span className="font-display text-lg font-bold text-sidebar-foreground">
                WebMarcas
              </span>
              <p className="text-xs text-sidebar-foreground/60 font-body">
                Painel do Cliente
              </p>
            </div>
          )}
        </Link>
      </SidebarHeader>

      <SidebarContent className="p-2">
        <SidebarGroup>
          <SidebarGroupLabel className="text-sidebar-foreground/50 font-body text-xs uppercase tracking-wider px-3 mb-2">
            {!collapsed && "Principal"}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainMenuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={isActive(item.url)}
                    className={cn(
                      "w-full justify-start gap-3 px-3 py-2.5 rounded-lg transition-all",
                      isActive(item.url)
                        ? "bg-sidebar-accent text-sidebar-accent-foreground"
                        : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
                    )}
                  >
                    <Link to={item.url}>
                      <div className={cn("p-1.5 rounded-md", item.bgColor)}>
                        <item.icon className={cn("h-4 w-4", item.color)} />
                      </div>
                      {!collapsed && (
                        <span className="font-body font-medium">{item.title}</span>
                      )}
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup className="mt-6">
          <SidebarGroupLabel className="text-sidebar-foreground/50 font-body text-xs uppercase tracking-wider px-3 mb-2">
            {!collapsed && "Administração"}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {secondaryMenuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={isActive(item.url)}
                    className={cn(
                      "w-full justify-start gap-3 px-3 py-2.5 rounded-lg transition-all",
                      isActive(item.url)
                        ? "bg-sidebar-accent text-sidebar-accent-foreground"
                        : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
                    )}
                  >
                    <Link to={item.url}>
                      <div className={cn("p-1.5 rounded-md", item.bgColor)}>
                        <item.icon className={cn("h-4 w-4", item.color)} />
                      </div>
                      {!collapsed && (
                        <span className="font-body font-medium">{item.title}</span>
                      )}
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-4 border-t border-sidebar-border">
        <Button
          variant="ghost"
          onClick={signOut}
          className={cn(
            "w-full justify-start gap-3 text-destructive hover:text-destructive hover:bg-destructive/10",
            collapsed && "justify-center"
          )}
        >
          <LogOut className="h-4 w-4" />
          {!collapsed && <span className="font-body">Sair</span>}
        </Button>
      </SidebarFooter>
    </Sidebar>
  );
}

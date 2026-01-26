import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Users,
  Coins,
  FileCheck,
  CreditCard,
  CalendarSync,
  ScrollText,
  Settings,
  LogOut,
  ShieldCheck,
  Activity,
  Award,
  LucideIcon,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useAdminPermissions } from "@/hooks/useAdminPermissions";
import { Permission, hasAnyPermission } from "@/lib/adminPermissions";
import { RoleBadge } from "./RoleBadge";
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

interface MenuItem {
  title: string;
  url: string;
  icon: LucideIcon;
  permissions: Permission[];
  color: string;
  bgColor: string;
}

const iconMap: Record<string, LucideIcon> = {
  LayoutDashboard,
  Users,
  Coins,
  FileCheck,
  CreditCard,
  CalendarSync,
  ScrollText,
  Settings,
  Activity,
  Award,
};

const mainMenuItems: MenuItem[] = [
  {
    title: "Visão Geral",
    url: "/admin",
    icon: LayoutDashboard,
    permissions: [],
    color: "text-blue-400",
    bgColor: "bg-blue-400/10",
  },
  {
    title: "Usuários",
    url: "/admin/usuarios",
    icon: Users,
    permissions: ["users.view"],
    color: "text-purple-400",
    bgColor: "bg-purple-400/10",
  },
  {
    title: "Créditos",
    url: "/admin/creditos",
    icon: Coins,
    permissions: ["credits.view"],
    color: "text-yellow-400",
    bgColor: "bg-yellow-400/10",
  },
  {
    title: "Registros Blockchain",
    url: "/admin/registros",
    icon: FileCheck,
    permissions: ["registros.view"],
    color: "text-green-400",
    bgColor: "bg-green-400/10",
  },
  {
    title: "Certificados",
    url: "/admin/certificados",
    icon: Award,
    permissions: ["certificates.view"],
    color: "text-cyan-400",
    bgColor: "bg-cyan-400/10",
  },
];

const financeMenuItems: MenuItem[] = [
  {
    title: "Pagamentos",
    url: "/admin/pagamentos",
    icon: CreditCard,
    permissions: ["payments.view"],
    color: "text-orange-400",
    bgColor: "bg-orange-400/10",
  },
  {
    title: "Assinaturas",
    url: "/admin/assinaturas",
    icon: CalendarSync,
    permissions: ["subscriptions.view"],
    color: "text-pink-400",
    bgColor: "bg-pink-400/10",
  },
];

const systemMenuItems: MenuItem[] = [
  {
    title: "Monitoramento",
    url: "/admin/monitoramento",
    icon: Activity,
    permissions: ["config.view"],
    color: "text-emerald-400",
    bgColor: "bg-emerald-400/10",
  },
  {
    title: "Logs e Auditoria",
    url: "/admin/logs",
    icon: ScrollText,
    permissions: ["logs.view"],
    color: "text-pink-400",
    bgColor: "bg-pink-400/10",
  },
  {
    title: "Configurações",
    url: "/admin/configuracoes",
    icon: Settings,
    permissions: ["config.view"],
    color: "text-gray-400",
    bgColor: "bg-gray-400/10",
  },
];

export function AdminSidebar() {
  const location = useLocation();
  const { signOut } = useAuth();
  const { role, can, canAny } = useAdminPermissions();

  const isActive = (path: string) => {
    if (path === "/admin") {
      return location.pathname === "/admin";
    }
    return location.pathname.startsWith(path);
  };

  // Filtrar itens baseado nas permissões do usuário
  const filterMenuItems = (items: MenuItem[]) => {
    return items.filter(item => {
      if (item.permissions.length === 0) return true;
      return canAny(item.permissions);
    });
  };

  const renderMenuItems = (items: MenuItem[]) => {
    const filteredItems = filterMenuItems(items);
    
    if (filteredItems.length === 0) return null;

    return (
      <SidebarMenu>
        {filteredItems.map((item) => (
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
                <span className="font-medium">{item.title}</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        ))}
      </SidebarMenu>
    );
  };

  const filteredFinanceItems = filterMenuItems(financeMenuItems);
  const filteredSystemItems = filterMenuItems(systemMenuItems);

  return (
    <Sidebar className="w-64 border-r border-sidebar-border bg-sidebar">
      <SidebarHeader className="p-4 border-b border-sidebar-border">
        <Link to="/admin" className="flex items-center gap-3">
          <div className="relative">
            <img 
              src={webmarcasLogo} 
              alt="WebMarcas" 
              className="h-10 w-10 object-contain"
            />
            <ShieldCheck className="absolute -bottom-1 -right-1 h-4 w-4 text-primary bg-background rounded-full" />
          </div>
          <div>
            <span className="text-lg font-bold text-sidebar-foreground tracking-tight">
              <span>Web</span>
              <span className="text-primary">Marcas</span>
            </span>
            <p className="text-xs text-primary font-semibold">
              Painel Admin
            </p>
          </div>
        </Link>
        {role && (
          <div className="mt-3">
            <RoleBadge role={role} size="sm" />
          </div>
        )}
      </SidebarHeader>

      <SidebarContent className="p-2">
        <SidebarGroup>
          <SidebarGroupLabel className="text-sidebar-foreground/50 text-xs uppercase tracking-wider px-3 mb-2">
            Principal
          </SidebarGroupLabel>
          <SidebarGroupContent>
            {renderMenuItems(mainMenuItems)}
          </SidebarGroupContent>
        </SidebarGroup>

        {filteredFinanceItems.length > 0 && (
          <SidebarGroup className="mt-4">
            <SidebarGroupLabel className="text-sidebar-foreground/50 text-xs uppercase tracking-wider px-3 mb-2">
              Financeiro
            </SidebarGroupLabel>
            <SidebarGroupContent>
              {renderMenuItems(financeMenuItems)}
            </SidebarGroupContent>
          </SidebarGroup>
        )}

        {filteredSystemItems.length > 0 && (
          <SidebarGroup className="mt-4">
            <SidebarGroupLabel className="text-sidebar-foreground/50 text-xs uppercase tracking-wider px-3 mb-2">
              Sistema
            </SidebarGroupLabel>
            <SidebarGroupContent>
              {renderMenuItems(systemMenuItems)}
            </SidebarGroupContent>
          </SidebarGroup>
        )}
      </SidebarContent>

      <SidebarFooter className="p-4 border-t border-sidebar-border space-y-2">
        <Link to="/dashboard">
          <Button
            variant="outline"
            className="w-full justify-start gap-3"
          >
            <LayoutDashboard className="h-4 w-4" />
            <span>Voltar ao Dashboard</span>
          </Button>
        </Link>
        <Button
          variant="ghost"
          onClick={signOut}
          className="w-full justify-start gap-3 text-destructive hover:text-destructive hover:bg-destructive/10"
        >
          <LogOut className="h-4 w-4" />
          <span>Sair</span>
        </Button>
      </SidebarFooter>
    </Sidebar>
  );
}

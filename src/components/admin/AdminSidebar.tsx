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
  ChevronRight,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useAdminPermissions } from "@/hooks/useAdminPermissions";
import { Permission } from "@/lib/adminPermissions";
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
  useSidebar,
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

const mainMenuItems: MenuItem[] = [
  {
    title: "Visão Geral",
    url: "/admin/dashboard",
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
    title: "Registros",
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
    title: "Logs",
    url: "/admin/logs",
    icon: ScrollText,
    permissions: ["logs.view"],
    color: "text-pink-400",
    bgColor: "bg-pink-400/10",
  },
  {
    title: "Config",
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
  const { role, canAny } = useAdminPermissions();
  const { state, isMobile, setOpenMobile } = useSidebar();
  const isCollapsed = state === "collapsed";

  const isActive = (path: string) => {
    if (path === "/admin/dashboard") {
      return location.pathname === "/admin/dashboard";
    }
    return location.pathname.startsWith(path);
  };

  // Filter items based on user permissions
  const filterMenuItems = (items: MenuItem[]) => {
    return items.filter(item => {
      if (item.permissions.length === 0) return true;
      return canAny(item.permissions);
    });
  };

  const handleLinkClick = () => {
    if (isMobile) {
      setOpenMobile(false);
    }
  };

  const renderMenuItems = (items: MenuItem[]) => {
    const filteredItems = filterMenuItems(items);
    
    if (filteredItems.length === 0) return null;

    return (
      <SidebarMenu>
        {filteredItems.map((item) => {
          const active = isActive(item.url);
          return (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton
                asChild
                isActive={active}
                className={cn(
                  "w-full justify-start gap-3 px-3 py-2.5 rounded-xl transition-all duration-200",
                  active
                    ? "bg-primary/10 border border-primary/20 text-foreground"
                    : "text-muted-foreground hover:bg-muted/50 hover:text-foreground border border-transparent"
                )}
              >
                <Link to={item.url} onClick={handleLinkClick}>
                  <div className={cn(
                    "p-1.5 rounded-lg transition-colors",
                    active ? item.bgColor : "bg-muted"
                  )}>
                    <item.icon className={cn(
                      "h-4 w-4",
                      active ? item.color : "text-muted-foreground"
                    )} />
                  </div>
                  <span className="font-medium text-sm">{item.title}</span>
                  {active && (
                    <ChevronRight className="h-3.5 w-3.5 ml-auto text-primary" />
                  )}
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          );
        })}
      </SidebarMenu>
    );
  };

  const filteredFinanceItems = filterMenuItems(financeMenuItems);
  const filteredSystemItems = filterMenuItems(systemMenuItems);

  return (
    <Sidebar 
      className="w-64 border-r border-sidebar-border bg-sidebar"
      collapsible="icon"
    >
      <SidebarHeader className="p-4 border-b border-sidebar-border/50">
        <Link 
          to="/admin/dashboard" 
          className="flex items-center gap-3"
          onClick={handleLinkClick}
        >
          <div className="relative flex-shrink-0">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/20 overflow-hidden">
              <img 
                src={webmarcasLogo} 
                alt="WebMarcas" 
                className="h-7 w-7 object-contain"
              />
            </div>
            <ShieldCheck className="absolute -bottom-1 -right-1 h-4 w-4 text-primary bg-background rounded-full border border-primary/20" />
          </div>
          {!isCollapsed && (
            <div>
              <span className="text-lg font-bold text-sidebar-foreground tracking-tight">
                <span>Web</span>
                <span className="text-primary">Marcas</span>
              </span>
              <p className="text-xs text-primary font-semibold">
                Painel Admin
              </p>
            </div>
          )}
        </Link>
        {!isCollapsed && role && (
          <div className="mt-3">
            <RoleBadge role={role} size="sm" />
          </div>
        )}
      </SidebarHeader>

      <SidebarContent className="p-2 overflow-y-auto">
        <SidebarGroup>
          <SidebarGroupLabel className="text-sidebar-foreground/50 text-[10px] uppercase tracking-wider px-3 mb-2 font-semibold">
            Principal
          </SidebarGroupLabel>
          <SidebarGroupContent>
            {renderMenuItems(mainMenuItems)}
          </SidebarGroupContent>
        </SidebarGroup>

        {filteredFinanceItems.length > 0 && (
          <SidebarGroup className="mt-4">
            <SidebarGroupLabel className="text-sidebar-foreground/50 text-[10px] uppercase tracking-wider px-3 mb-2 font-semibold">
              Financeiro
            </SidebarGroupLabel>
            <SidebarGroupContent>
              {renderMenuItems(financeMenuItems)}
            </SidebarGroupContent>
          </SidebarGroup>
        )}

        {filteredSystemItems.length > 0 && (
          <SidebarGroup className="mt-4">
            <SidebarGroupLabel className="text-sidebar-foreground/50 text-[10px] uppercase tracking-wider px-3 mb-2 font-semibold">
              Sistema
            </SidebarGroupLabel>
            <SidebarGroupContent>
              {renderMenuItems(systemMenuItems)}
            </SidebarGroupContent>
          </SidebarGroup>
        )}
      </SidebarContent>

      <SidebarFooter className="p-3 border-t border-sidebar-border/50 space-y-2">
        <Link to="/dashboard" onClick={handleLinkClick}>
          <Button
            variant="outline"
            className="w-full justify-start gap-3 h-10 rounded-xl text-sm"
          >
            <LayoutDashboard className="h-4 w-4" />
            {!isCollapsed && <span>Voltar ao Dashboard</span>}
          </Button>
        </Link>
        <Button
          variant="ghost"
          onClick={() => {
            handleLinkClick();
            signOut();
          }}
          className="w-full justify-start gap-3 h-10 rounded-xl text-destructive hover:text-destructive hover:bg-destructive/10 text-sm"
        >
          <LogOut className="h-4 w-4" />
          {!isCollapsed && <span>Sair</span>}
        </Button>
      </SidebarFooter>
    </Sidebar>
  );
}

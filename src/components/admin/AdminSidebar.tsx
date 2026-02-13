import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
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
  Handshake,
  LucideIcon,
  ChevronRight,
  Sparkles,
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
  glowColor: string;
}

const mainMenuItems: MenuItem[] = [
  {
    title: "Visão Geral",
    url: "/admin/dashboard",
    icon: LayoutDashboard,
    permissions: [],
    color: "text-blue-400",
    bgColor: "bg-blue-400/15",
    glowColor: "shadow-blue-400/20",
  },
  {
    title: "Usuários",
    url: "/admin/usuarios",
    icon: Users,
    permissions: ["users.view"],
    color: "text-purple-400",
    bgColor: "bg-purple-400/15",
    glowColor: "shadow-purple-400/20",
  },
  {
    title: "Créditos",
    url: "/admin/creditos",
    icon: Coins,
    permissions: ["credits.view"],
    color: "text-yellow-400",
    bgColor: "bg-yellow-400/15",
    glowColor: "shadow-yellow-400/20",
  },
  {
    title: "Registros",
    url: "/admin/registros",
    icon: FileCheck,
    permissions: ["registros.view"],
    color: "text-green-400",
    bgColor: "bg-green-400/15",
    glowColor: "shadow-green-400/20",
  },
  {
    title: "Certificados",
    url: "/admin/certificados",
    icon: Award,
    permissions: ["certificates.view"],
    color: "text-cyan-400",
    bgColor: "bg-cyan-400/15",
    glowColor: "shadow-cyan-400/20",
  },
  {
    title: "Parcerias",
    url: "/admin/parcerias",
    icon: Handshake,
    permissions: ["config.edit"],
    color: "text-teal-400",
    bgColor: "bg-teal-400/15",
    glowColor: "shadow-teal-400/20",
  },
];

const financeMenuItems: MenuItem[] = [
  {
    title: "Pagamentos",
    url: "/admin/pagamentos",
    icon: CreditCard,
    permissions: ["payments.view"],
    color: "text-orange-400",
    bgColor: "bg-orange-400/15",
    glowColor: "shadow-orange-400/20",
  },
  {
    title: "Assinaturas",
    url: "/admin/assinaturas",
    icon: CalendarSync,
    permissions: ["subscriptions.view"],
    color: "text-pink-400",
    bgColor: "bg-pink-400/15",
    glowColor: "shadow-pink-400/20",
  },
];

const systemMenuItems: MenuItem[] = [
  {
    title: "Monitoramento",
    url: "/admin/monitoramento",
    icon: Activity,
    permissions: ["config.view"],
    color: "text-emerald-400",
    bgColor: "bg-emerald-400/15",
    glowColor: "shadow-emerald-400/20",
  },
  {
    title: "Logs",
    url: "/admin/logs",
    icon: ScrollText,
    permissions: ["logs.view"],
    color: "text-rose-400",
    bgColor: "bg-rose-400/15",
    glowColor: "shadow-rose-400/20",
  },
  {
    title: "Configurações",
    url: "/admin/configuracoes",
    icon: Settings,
    permissions: ["config.view"],
    color: "text-slate-400",
    bgColor: "bg-slate-400/15",
    glowColor: "shadow-slate-400/20",
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
      <SidebarMenu className="space-y-1">
        {filteredItems.map((item) => {
          const active = isActive(item.url);
          return (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton
                asChild
                isActive={active}
                className={cn(
                  "w-full justify-start gap-3 px-3 py-3 rounded-xl transition-all duration-200",
                  active
                    ? "bg-gradient-to-r from-primary/15 to-primary/5 border border-primary/25 shadow-lg shadow-primary/10"
                    : "text-muted-foreground hover:bg-muted/40 hover:text-foreground border border-transparent"
                )}
              >
                <Link to={item.url} onClick={handleLinkClick}>
                  <motion.div 
                    className={cn(
                      "p-2 rounded-xl transition-all",
                      active ? `${item.bgColor} shadow-lg ${item.glowColor}` : "bg-muted/50"
                    )}
                    whileTap={{ scale: 0.95 }}
                  >
                    <item.icon className={cn(
                      "h-4 w-4",
                      active ? item.color : "text-muted-foreground"
                    )} />
                  </motion.div>
                  <span className={cn(
                    "font-medium text-sm",
                    active ? "text-foreground" : "text-muted-foreground"
                  )}>
                    {item.title}
                  </span>
                  {active && (
                    <ChevronRight className="h-4 w-4 ml-auto text-primary" />
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
      className="w-64 border-r border-sidebar-border/50 bg-gradient-to-b from-sidebar to-sidebar/95"
      collapsible="icon"
    >
      <SidebarHeader className="p-4 border-b border-sidebar-border/30">
        <Link 
          to="/admin/dashboard" 
          className="flex items-center gap-3 group"
          onClick={handleLinkClick}
        >
          <div className="relative flex-shrink-0">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center border border-primary/25 overflow-hidden shadow-lg shadow-primary/10 group-hover:shadow-primary/20 transition-shadow">
              <img 
                src={webmarcasLogo} 
                alt="WebMarcas" 
                className="h-7 w-7 object-contain"
              />
            </div>
            <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-primary flex items-center justify-center border-2 border-background shadow-lg">
              <ShieldCheck className="h-3 w-3 text-primary-foreground" />
            </div>
          </div>
          {!isCollapsed && (
            <div>
              <span className="text-lg font-bold text-sidebar-foreground tracking-tight">
                <span>Web</span>
                <span className="text-primary">Marcas</span>
              </span>
              <div className="flex items-center gap-1.5">
                <Sparkles className="h-3 w-3 text-primary" />
                <span className="text-xs text-primary font-bold">
                  Admin Panel
                </span>
              </div>
            </div>
          )}
        </Link>
        {!isCollapsed && role && (
          <div className="mt-3">
            <RoleBadge role={role} size="sm" />
          </div>
        )}
      </SidebarHeader>

      <SidebarContent className="p-3 overflow-y-auto">
        <SidebarGroup>
          <SidebarGroupLabel className="text-sidebar-foreground/40 text-[10px] uppercase tracking-widest px-3 mb-2 font-bold flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-blue-400" />
            Principal
          </SidebarGroupLabel>
          <SidebarGroupContent>
            {renderMenuItems(mainMenuItems)}
          </SidebarGroupContent>
        </SidebarGroup>

        {filteredFinanceItems.length > 0 && (
          <SidebarGroup className="mt-6">
            <SidebarGroupLabel className="text-sidebar-foreground/40 text-[10px] uppercase tracking-widest px-3 mb-2 font-bold flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-orange-400" />
              Financeiro
            </SidebarGroupLabel>
            <SidebarGroupContent>
              {renderMenuItems(financeMenuItems)}
            </SidebarGroupContent>
          </SidebarGroup>
        )}

        {filteredSystemItems.length > 0 && (
          <SidebarGroup className="mt-6">
            <SidebarGroupLabel className="text-sidebar-foreground/40 text-[10px] uppercase tracking-widest px-3 mb-2 font-bold flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              Sistema
            </SidebarGroupLabel>
            <SidebarGroupContent>
              {renderMenuItems(systemMenuItems)}
            </SidebarGroupContent>
          </SidebarGroup>
        )}
      </SidebarContent>

      <SidebarFooter className="p-3 border-t border-sidebar-border/30 space-y-2">
        <Link to="/dashboard" onClick={handleLinkClick}>
          <Button
            variant="outline"
            className="w-full justify-start gap-3 h-11 rounded-xl text-sm border-border/50 hover:bg-muted/50 font-medium"
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
          className="w-full justify-start gap-3 h-11 rounded-xl text-destructive hover:text-destructive hover:bg-destructive/10 text-sm font-medium"
        >
          <LogOut className="h-4 w-4" />
          {!isCollapsed && <span>Sair</span>}
        </Button>
      </SidebarFooter>
    </Sidebar>
  );
}

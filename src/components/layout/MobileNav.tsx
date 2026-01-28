import { Link, useLocation } from "react-router-dom";
import { 
  Home, 
  Star, 
  HelpCircle, 
  DollarSign, 
  Search, 
  User, 
  LogOut, 
  Coins, 
  Shield,
  LayoutDashboard,
  FileText,
  Plus,
  Award,
  FolderOpen,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { useCredits } from "@/hooks/useCredits";
import { useLanguage } from "@/contexts/LanguageContext";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import webmarcasLogo from "@/assets/webmarcas-logo.png";

interface MobileNavProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function MobileNav({ open, onOpenChange }: MobileNavProps) {
  const location = useLocation();
  const { user, signOut, loading } = useAuth();
  const { credits, loading: creditsLoading } = useCredits();
  const { t } = useLanguage();

  const publicLinks = [
    { href: "/", label: t("nav.home"), icon: Home },
    { href: "/vantagens", label: t("nav.advantages"), icon: Star },
    { href: "/como-funciona", label: t("nav.howItWorks"), icon: HelpCircle },
    { href: "/servicos", label: t("nav.pricing"), icon: DollarSign },
    { href: "/verificar-registro", label: t("nav.verify"), icon: Search },
  ];

  const dashboardLinks = [
    { href: "/dashboard", label: t("nav.dashboard"), icon: LayoutDashboard },
    { href: "/novo-registro", label: t("nav.register"), icon: Plus },
    { href: "/meus-registros", label: t("nav.myRecords"), icon: FileText },
    { href: "/projetos", label: "Projetos", icon: FolderOpen },
    { href: "/creditos", label: t("nav.myCredits"), icon: Coins },
    { href: "/meus-registros?status=confirmado", label: "Certificados", icon: Award },
  ];

  const isActive = (path: string) => {
    if (path.includes("?")) {
      return location.pathname + location.search === path;
    }
    return location.pathname === path;
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
          <div className="flex items-center gap-3">
            <div className="relative h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/20 overflow-hidden">
              <img 
                src={webmarcasLogo} 
                alt="WebMarcas" 
                className="h-7 w-7 object-contain"
              />
            </div>
            <div>
              <SheetTitle className="text-lg font-bold text-foreground text-left">
                Web<span className="text-primary">Marcas</span>
              </SheetTitle>
              <p className="text-xs text-muted-foreground font-medium">
                Registro em Blockchain
              </p>
            </div>
          </div>
        </SheetHeader>

        {/* Content */}
        <div className="flex flex-col h-[calc(100vh-80px)] overflow-y-auto">
          {/* User Credits Card (if logged in) */}
          {user && (
            <div className="p-4 border-b border-border/50">
              <Link 
                to="/creditos" 
                onClick={handleLinkClick}
                className="flex items-center justify-between p-4 rounded-xl bg-gradient-to-br from-primary/15 to-primary/5 border border-primary/20 hover:border-primary/40 transition-all"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
                    <Coins className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground font-medium">{t("nav.myCredits")}</p>
                    <p className="text-xl font-bold text-primary">
                      {creditsLoading ? "..." : credits?.available_credits || 0}
                    </p>
                  </div>
                </div>
                <span className="text-xs text-primary font-medium">→</span>
              </Link>
            </div>
          )}

          {/* Navigation Links */}
          <nav className="flex-1 p-4">
            {/* Public links or Dashboard links based on context */}
            <div className="space-y-1">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-3 mb-2">
                {user ? "Menu Principal" : "Navegação"}
              </p>
              {(user ? dashboardLinks : publicLinks).map((link) => (
                <Link
                  key={link.href}
                  to={link.href}
                  onClick={handleLinkClick}
                  className={`flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium transition-all ${
                    isActive(link.href)
                      ? "bg-primary/10 text-primary border border-primary/20"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                  }`}
                >
                  <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${
                    isActive(link.href) ? "bg-primary/20" : "bg-muted"
                  }`}>
                    <link.icon className={`h-4 w-4 ${
                      isActive(link.href) ? "text-primary" : "text-muted-foreground"
                    }`} />
                  </div>
                  {link.label}
                </Link>
              ))}
            </div>

            {/* Public links when logged in */}
            {user && (
              <div className="mt-6 space-y-1">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-3 mb-2">
                  Site
                </p>
                {publicLinks.slice(0, 3).map((link) => (
                  <Link
                    key={link.href}
                    to={link.href}
                    onClick={handleLinkClick}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                      isActive(link.href)
                        ? "bg-primary/10 text-primary"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                    }`}
                  >
                    <link.icon className="h-4 w-4" />
                    {link.label}
                  </Link>
                ))}
              </div>
            )}
          </nav>

          {/* Bottom Actions */}
          <div className="p-4 border-t border-border/50 bg-muted/30 mt-auto space-y-2">
            {loading ? (
              <div className="h-12 bg-muted animate-pulse rounded-xl" />
            ) : user ? (
              <>
                <Button 
                  asChild 
                  className="w-full bg-primary text-primary-foreground hover:bg-primary/90 rounded-xl h-12 font-semibold"
                >
                  <Link to="/checkout" onClick={handleLinkClick}>
                    <Coins className="h-4 w-4 mr-2" />
                    {t("nav.myCredits")}
                  </Link>
                </Button>
                <Button 
                  variant="ghost" 
                  onClick={handleSignOut}
                  className="w-full justify-start text-destructive hover:text-destructive hover:bg-destructive/10 rounded-xl h-11"
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  {t("nav.logout")}
                </Button>
              </>
            ) : (
              <>
                <Button 
                  asChild 
                  className="w-full bg-primary text-primary-foreground hover:bg-primary/90 rounded-xl h-12 font-semibold"
                >
                  <Link to="/verificar-registro" onClick={handleLinkClick}>
                    <Shield className="h-4 w-4 mr-2" />
                    {t("nav.verify")}
                  </Link>
                </Button>
                <Button 
                  variant="outline" 
                  asChild 
                  className="w-full rounded-xl h-11 border-border/50"
                >
                  <Link to="/login" onClick={handleLinkClick}>
                    <User className="h-4 w-4 mr-2" />
                    {t("nav.login")}
                  </Link>
                </Button>
              </>
            )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}

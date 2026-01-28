import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, User, LogOut, ChevronDown, Shield, Coins } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { useCredits } from "@/hooks/useCredits";
import { useLanguage } from "@/contexts/LanguageContext";
import { ThemeToggle } from "@/components/ThemeToggle";
import { LanguageSelector } from "@/components/LanguageSelector";
import { MobileNav } from "./MobileNav";
import webmarcasLogo from "@/assets/webmarcas-logo.png";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const { user, signOut, loading } = useAuth();
  const { credits, loading: creditsLoading } = useCredits();
  const { t } = useLanguage();

  const navLinks = [
    { href: "/", label: t("nav.home") },
    { href: "/vantagens", label: t("nav.advantages") },
    { href: "/como-funciona", label: t("nav.howItWorks") },
    { href: "/servicos", label: t("nav.pricing") },
    { href: "/verificar-registro", label: t("nav.verify") },
  ];

  const isActive = (path: string) => location.pathname === path;

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  return (
    <header 
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled 
          ? "bg-background/95 backdrop-blur-xl border-b border-border/50 shadow-sm" 
          : "bg-transparent"
      }`}
    >
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 md:gap-3 group">
            <div className="relative h-9 w-9 md:h-10 md:w-10 rounded-full bg-primary/10 flex items-center justify-center border border-primary/20 group-hover:border-primary/40 transition-colors overflow-hidden">
              <img 
                src={webmarcasLogo} 
                alt="WebMarcas" 
                className="h-6 w-6 md:h-7 md:w-7 object-contain"
              />
            </div>
            <span className="text-lg md:text-xl font-bold text-foreground tracking-tight">
              <span className="text-foreground">Web</span>
              <span className="text-primary">Marcas</span>
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                to={link.href}
                className={`px-3 xl:px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  isActive(link.href)
                    ? "text-primary"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Right side buttons */}
          <div className="hidden md:flex items-center gap-3">
            {/* Language selector */}
            <LanguageSelector />

            {/* Theme Toggle */}
            <ThemeToggle />

            {loading ? (
              <div className="h-10 w-24 bg-muted/50 animate-pulse rounded-xl" />
            ) : user ? (
              <>
                {/* Credits Display for Logged-in Users */}
                <Link 
                  to="/creditos"
                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-primary/10 border border-primary/20 hover:bg-primary/15 transition-colors"
                >
                  <Coins className="h-4 w-4 text-primary" />
                  <span className="font-body font-bold text-primary text-sm">
                    {creditsLoading ? "..." : credits?.available_credits || 0}
                  </span>
                  <span className="hidden lg:inline text-xs text-muted-foreground">
                    {t("nav.credits")}
                  </span>
                </Link>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="gap-2 text-muted-foreground hover:text-foreground">
                      <User className="h-4 w-4" />
                      <span className="hidden lg:inline">{t("nav.login")}</span>
                      <ChevronDown className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48 bg-card border-border">
                    <DropdownMenuItem asChild>
                      <Link to="/dashboard" className="cursor-pointer">
                        {t("nav.dashboard")}
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link to="/creditos" className="cursor-pointer">
                        <Coins className="h-4 w-4 mr-2" />
                        {t("nav.myCredits")}
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link to="/meus-registros" className="cursor-pointer">
                        {t("nav.myRecords")}
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={signOut} className="text-destructive cursor-pointer">
                      <LogOut className="h-4 w-4 mr-2" />
                      {t("nav.logout")}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <>
                <Button variant="ghost" size="sm" asChild className="font-medium text-muted-foreground hover:text-foreground">
                  <Link to="/login">{t("nav.login")}</Link>
                </Button>
                <Button size="sm" asChild className="bg-primary text-primary-foreground hover:bg-primary/90 font-semibold rounded-xl px-5">
                  <Link to="/verificar-registro">
                    {t("nav.verify")}
                  </Link>
                </Button>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="flex items-center gap-2 md:hidden">
            <LanguageSelector />
            <ThemeToggle />
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="p-2 rounded-xl hover:bg-muted/50 transition-colors text-foreground"
              aria-label="Menu"
            >
              <Menu className="h-6 w-6" />
            </button>
          </div>
        </div>

        {/* Mobile Navigation Sheet */}
        <MobileNav open={mobileMenuOpen} onOpenChange={setMobileMenuOpen} />
      </div>
    </header>
  );
}

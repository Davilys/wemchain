import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X, User, LogOut, ChevronDown, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { ThemeToggle } from "@/components/ThemeToggle";
import webmarcasLogo from "@/assets/webmarcas-logo.png";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const navLinks = [
  { href: "/", label: "Início" },
  { href: "/vantagens", label: "Vantagens" },
  { href: "/como-funciona", label: "Como Funciona" },
  { href: "/servicos", label: "Preços" },
  { href: "/verificar-registro", label: "Verificar" },
];

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const { user, signOut, loading } = useAuth();

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
          ? "bg-background/95 backdrop-blur-xl border-b border-border shadow-lg" 
          : "bg-transparent"
      }`}
    >
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 md:gap-3 group">
            <div className="relative h-9 w-9 md:h-11 md:w-11 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center border border-primary/20 group-hover:border-primary/40 transition-colors">
              <img 
                src={webmarcasLogo} 
                alt="WebMarcas" 
                className="h-6 w-6 md:h-8 md:w-8 object-contain"
              />
            </div>
            <span className="font-display text-lg md:text-xl font-bold text-foreground">
              WebMarcas
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                to={link.href}
                className={`px-3 xl:px-4 py-2 rounded-lg text-sm font-medium font-body transition-all duration-200 ${
                  isActive(link.href)
                    ? "text-primary bg-primary/10"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Right side buttons */}
          <div className="hidden md:flex items-center gap-2 lg:gap-3">
            {/* Language selector */}
            <Button variant="ghost" size="sm" className="font-body text-muted-foreground hover:text-foreground px-2">
              BR
            </Button>

            {/* Theme Toggle */}
            <ThemeToggle />

            {loading ? (
              <div className="h-10 w-24 bg-muted/50 animate-pulse rounded-xl" />
            ) : user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="gap-2 font-body border-border/50 hover:border-primary/50">
                    <User className="h-4 w-4" />
                    <span className="hidden lg:inline">Minha Conta</span>
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48 bg-card border-border">
                  <DropdownMenuItem asChild>
                    <Link to="/dashboard" className="cursor-pointer font-body">
                      Dashboard
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/meus-registros" className="cursor-pointer font-body">
                      Meus Registros
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={signOut} className="text-destructive cursor-pointer font-body">
                    <LogOut className="h-4 w-4 mr-2" />
                    Sair
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <>
                <Button variant="ghost" size="sm" asChild className="font-body font-medium text-muted-foreground hover:text-foreground">
                  <Link to="/login">Área do Cliente</Link>
                </Button>
                <Button size="sm" asChild className="bg-primary text-primary-foreground hover:bg-primary/90 font-body font-semibold rounded-xl shadow-lg glow-cyan">
                  <Link to="/verificar" className="flex items-center gap-2">
                    <Shield className="h-4 w-4" />
                    <span className="hidden lg:inline">Consultar Marca</span>
                    <span className="lg:hidden">Consultar</span>
                  </Link>
                </Button>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="flex items-center gap-2 md:hidden">
            <ThemeToggle />
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl hover:bg-muted/50 transition-colors text-foreground"
              aria-label="Menu"
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-border animate-fade-in bg-background/95 backdrop-blur-xl -mx-4 px-4">
            <nav className="flex flex-col gap-1">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  to={link.href}
                  className={`px-4 py-3 rounded-xl text-sm font-medium font-body transition-colors ${
                    isActive(link.href)
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                  }`}
                >
                  {link.label}
                </Link>
              ))}
              <div className="border-t border-border pt-4 mt-3 flex flex-col gap-2">
                {user ? (
                  <>
                    <Button variant="outline" asChild className="justify-start font-body rounded-xl">
                      <Link to="/dashboard">
                        <User className="h-4 w-4 mr-2" />
                        Dashboard
                      </Link>
                    </Button>
                    <Button variant="ghost" onClick={signOut} className="justify-start text-destructive font-body rounded-xl">
                      <LogOut className="h-4 w-4 mr-2" />
                      Sair
                    </Button>
                  </>
                ) : (
                  <>
                    <Button variant="outline" asChild className="font-body rounded-xl">
                      <Link to="/login">
                        Área do Cliente
                      </Link>
                    </Button>
                    <Button asChild className="bg-primary text-primary-foreground font-body font-semibold rounded-xl shadow-lg">
                      <Link to="/verificar">
                        <Shield className="h-4 w-4 mr-2" />
                        Consultar Marca
                      </Link>
                    </Button>
                  </>
                )}
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}

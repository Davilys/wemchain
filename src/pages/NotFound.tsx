import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Home, ArrowLeft, Search } from "lucide-react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: Usuário tentou acessar rota inexistente:", location.pathname);
  }, [location.pathname]);

  return (
    <Layout showFooter={false}>
      <div className="flex min-h-[calc(100vh-5rem)] items-center justify-center bg-gradient-hero relative overflow-hidden">
        {/* Background effects */}
        <div className="absolute inset-0 bg-gradient-radial" />
        <div className="absolute top-1/4 left-1/4 w-[400px] h-[400px] bg-destructive/5 rounded-full blur-[100px]" />
        <div className="absolute bottom-1/4 right-1/4 w-[300px] h-[300px] bg-primary/5 rounded-full blur-[80px]" />
        
        <div className="text-center px-4 relative z-10 animate-fade-up">
          <div className="h-24 w-24 rounded-full bg-destructive/10 flex items-center justify-center mx-auto mb-6">
            <Search className="h-12 w-12 text-destructive" />
          </div>
          <h1 className="font-display text-6xl font-bold text-foreground mb-4">404</h1>
          <p className="font-body text-xl text-muted-foreground mb-2">
            Página não encontrada
          </p>
          <p className="font-body text-sm text-muted-foreground mb-8 max-w-md mx-auto">
            A página que você está procurando não existe ou foi movida para outro endereço.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild variant="outline" size="lg" className="font-body">
              <Link to="/">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Voltar
              </Link>
            </Button>
            <Button asChild size="lg" className="bg-primary text-primary-foreground font-body">
              <Link to="/">
                <Home className="mr-2 h-4 w-4" />
                Ir para Início
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default NotFound;

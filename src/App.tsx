import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import { AuthProvider } from "@/hooks/useAuth";
import Home from "./pages/Home";
import ComoFunciona from "./pages/ComoFunciona";
import Servicos from "./pages/Servicos";
import Vantagens from "./pages/Vantagens";
import Verificar from "./pages/Verificar";
import Login from "./pages/Login";
import Cadastro from "./pages/Cadastro";
import Dashboard from "./pages/Dashboard";
import NovoRegistro from "./pages/NovoRegistro";
import Processando from "./pages/Processando";
import Certificado from "./pages/Certificado";
import VerificarRegistro from "./pages/VerificarRegistro";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AuthProvider>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/como-funciona" element={<ComoFunciona />} />
              <Route path="/servicos" element={<Servicos />} />
              <Route path="/vantagens" element={<Vantagens />} />
              <Route path="/verificar" element={<Verificar />} />
              <Route path="/verificar-registro" element={<VerificarRegistro />} />
              <Route path="/login" element={<Login />} />
              <Route path="/cadastro" element={<Cadastro />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/novo-registro" element={<NovoRegistro />} />
              <Route path="/processando/:id" element={<Processando />} />
              <Route path="/certificado/:id" element={<Certificado />} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;

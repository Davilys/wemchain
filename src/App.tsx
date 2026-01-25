import { Toaster } from "@/components/ui/toaster";
import AdminHomologacao from "./pages/admin/AdminHomologacao";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import { AuthProvider } from "@/hooks/useAuth";
import Home from "./pages/Home";
import ComoFunciona from "./pages/ComoFunciona";
import Creditos from "./pages/Creditos";
import Servicos from "./pages/Servicos";
import Vantagens from "./pages/Vantagens";
import Verificar from "./pages/Verificar";
import Login from "./pages/Login";
import Cadastro from "./pages/Cadastro";
import Dashboard from "./pages/Dashboard";
import NovoRegistro from "./pages/NovoRegistro";
import MeusRegistros from "./pages/MeusRegistros";
import Checkout from "./pages/Checkout";
import Processando from "./pages/Processando";
import Certificado from "./pages/Certificado";
import VerificarRegistro from "./pages/VerificarRegistro";
import TermosDeUso from "./pages/TermosDeUso";
import PoliticaPrivacidade from "./pages/PoliticaPrivacidade";
import PoliticaBlockchain from "./pages/PoliticaBlockchain";
import Privacidade from "./pages/Privacidade";
import NotFound from "./pages/NotFound";
// Admin pages
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminUsuarios from "./pages/admin/AdminUsuarios";
import AdminCreditos from "./pages/admin/AdminCreditos";
import AdminRegistros from "./pages/admin/AdminRegistros";
import AdminPagamentos from "./pages/admin/AdminPagamentos";
import AdminAssinaturas from "./pages/admin/AdminAssinaturas";
import AdminLogs from "./pages/admin/AdminLogs";
import AdminConfiguracoes from "./pages/admin/AdminConfiguracoes";
import AdminMonitoramento from "./pages/admin/AdminMonitoramento";

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
              <Route path="/termos-de-uso" element={<TermosDeUso />} />
              <Route path="/politica-privacidade" element={<PoliticaPrivacidade />} />
              <Route path="/politica-blockchain" element={<PoliticaBlockchain />} />
              <Route path="/privacidade" element={<Privacidade />} />
              <Route path="/login" element={<Login />} />
              <Route path="/cadastro" element={<Cadastro />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/novo-registro" element={<NovoRegistro />} />
              <Route path="/meus-registros" element={<MeusRegistros />} />
              <Route path="/checkout" element={<Checkout />} />
              <Route path="/creditos" element={<Creditos />} />
              <Route path="/processando/:id" element={<Processando />} />
              <Route path="/certificado/:id" element={<Certificado />} />
              {/* Admin Routes */}
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="/admin/usuarios" element={<AdminUsuarios />} />
              <Route path="/admin/creditos" element={<AdminCreditos />} />
              <Route path="/admin/registros" element={<AdminRegistros />} />
              <Route path="/admin/pagamentos" element={<AdminPagamentos />} />
              <Route path="/admin/assinaturas" element={<AdminAssinaturas />} />
              <Route path="/admin/logs" element={<AdminLogs />} />
              <Route path="/admin/configuracoes" element={<AdminConfiguracoes />} />
              <Route path="/admin/monitoramento" element={<AdminMonitoramento />} />
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

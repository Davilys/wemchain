import { ReactNode } from "react";
import { useLocation } from "react-router-dom";
import { Header } from "./Header";
import { Footer } from "./Footer";
import { WhatsAppButton } from "@/components/WhatsAppButton";
import { DashboardLayout } from "./DashboardLayout";

interface LayoutProps {
  children: ReactNode;
  showFooter?: boolean;
}

const dashboardRoutes = ["/dashboard", "/novo-registro", "/meus-registros", "/creditos", "/checkout", "/certificado", "/processando"];

export function Layout({ children, showFooter = true }: LayoutProps) {
  const location = useLocation();
  const isDashboardRoute = dashboardRoutes.some(route => location.pathname.startsWith(route));

  // Use DashboardLayout for authenticated routes
  if (isDashboardRoute) {
    return <DashboardLayout>{children}</DashboardLayout>;
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 pt-16 md:pt-20">
        {children}
      </main>
      {showFooter && <Footer />}
      <WhatsAppButton />
    </div>
  );
}

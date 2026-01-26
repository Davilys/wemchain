import { ReactNode, useState } from "react";
import { DashboardSidebar } from "./DashboardSidebar";
import { DashboardHeader } from "./DashboardHeader";
import { DashboardMobileNav } from "./DashboardMobileNav";
import { ConsentGuard } from "@/components/legal/ConsentGuard";

interface DashboardLayoutProps {
  children: ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <ConsentGuard>
      <div className="min-h-screen flex w-full bg-background">
        <DashboardSidebar 
          collapsed={sidebarCollapsed} 
          onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
        />
        <div className="flex-1 flex flex-col min-h-screen">
          <DashboardHeader 
            onToggleSidebar={() => setMobileMenuOpen(true)} 
          />
          <main className="flex-1 p-4 md:p-6 overflow-auto">
            {children}
          </main>
        </div>
        
        {/* Mobile Navigation Sheet */}
        <DashboardMobileNav 
          open={mobileMenuOpen} 
          onOpenChange={setMobileMenuOpen}
        />
      </div>
    </ConsentGuard>
  );
}

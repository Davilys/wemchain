import { ReactNode, useState } from "react";
import { DashboardSidebar } from "./DashboardSidebar";
import { DashboardHeader } from "./DashboardHeader";
import { SidebarProvider } from "@/components/ui/sidebar";
import { ConsentGuard } from "@/components/legal/ConsentGuard";

interface DashboardLayoutProps {
  children: ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  return (
    <ConsentGuard>
      <SidebarProvider>
        <div className="min-h-screen flex w-full bg-background">
          <DashboardSidebar collapsed={sidebarCollapsed} />
          <div className="flex-1 flex flex-col min-h-screen">
            <DashboardHeader 
              onToggleSidebar={() => setSidebarCollapsed(!sidebarCollapsed)} 
            />
            <main className="flex-1 p-6 overflow-auto">
              {children}
            </main>
          </div>
        </div>
      </SidebarProvider>
    </ConsentGuard>
  );
}

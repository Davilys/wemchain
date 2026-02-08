import { ReactNode, useState } from "react";
import { DashboardSidebar } from "./DashboardSidebar";
import { DashboardHeader } from "./DashboardHeader";
import { DashboardBottomNav } from "./DashboardBottomNav";
import { ConsentGuard } from "@/components/legal/ConsentGuard";
import { PageTransition } from "@/components/ui/PageTransition";

interface DashboardLayoutProps {
  children: ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  return (
    <ConsentGuard>
      <div className="min-h-screen flex w-full bg-background">
        <DashboardSidebar 
          collapsed={sidebarCollapsed} 
          onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
        />
        <div className="flex-1 flex flex-col min-h-screen overflow-x-hidden">
          <DashboardHeader />
          <main className="flex-1 p-3 sm:p-4 md:p-6 overflow-auto pb-24 lg:pb-6">
            <PageTransition variant="fadeUp">
              {children}
            </PageTransition>
          </main>
        </div>
        
        {/* Bottom Navigation - Mobile Only */}
        <DashboardBottomNav />
      </div>
    </ConsentGuard>
  );
}

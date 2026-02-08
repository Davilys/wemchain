import { ReactNode } from "react";
import { AdminSidebar } from "./AdminSidebar";
import { AdminHeader } from "./AdminHeader";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AdminGuard } from "./AdminGuard";
import { PageTransition } from "@/components/ui/PageTransition";

interface AdminLayoutProps {
  children: ReactNode;
}

export function AdminLayout({ children }: AdminLayoutProps) {
  return (
    <AdminGuard>
      <SidebarProvider>
        <div className="min-h-screen flex w-full bg-background">
          <AdminSidebar />
          <div className="flex-1 flex flex-col min-h-screen overflow-x-hidden">
            <AdminHeader />
            <main className="flex-1 p-3 sm:p-4 md:p-6 overflow-auto">
              <PageTransition variant="fadeUp">
                {children}
              </PageTransition>
            </main>
          </div>
        </div>
      </SidebarProvider>
    </AdminGuard>
  );
}

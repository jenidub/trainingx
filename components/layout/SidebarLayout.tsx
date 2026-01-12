import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/layout/AppSidebar";

interface SidebarLayoutProps {
  children: React.ReactNode;
}

export function SidebarLayout({ children }: SidebarLayoutProps) {
  const style = {
    "--sidebar-width": "13.2rem",
    "--sidebar-width-icon": "3rem",
  };

  return (
    <SidebarProvider style={style as React.CSSProperties}>
      <div className="bg-white flex min-h-screen w-full">
        <AppSidebar />
        <div className="flex flex-col flex-1">
          {/* Mobile sidebar trigger - only visible on small screens */}
          <div className="md:hidden fixed bottom-4 left-4 z-50">
            <SidebarTrigger className="h-12 w-12 rounded-full bg-blue-500 text-white shadow-lg hover:bg-blue-600 hover:shadow-xl transition-all duration-200 border-0" />
          </div>
          <main id="main-content" className="flex-1">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}

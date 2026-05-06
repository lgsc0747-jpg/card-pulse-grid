import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { NotificationBell } from "@/components/NotificationBell";

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <div className="h-screen flex w-full overflow-hidden">
        <AppSidebar />
        <div className="flex-1 flex flex-col min-w-0 h-screen">
          <header className="h-11 flex items-center border-b border-border/30 px-3 sm:px-5 bg-background/70 backdrop-blur-2xl sticky top-0 z-10">
            <SidebarTrigger className="mr-2 -ml-1 h-8 w-8 rounded-lg" />
            <div className="flex-1" />
            <NotificationBell />
          </header>
          <main
            className="flex-1 overflow-y-auto overflow-x-hidden overscroll-contain touch-pan-y"
            style={{ WebkitOverflowScrolling: "touch" as any }}
          >
            <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-10 py-5 sm:py-6 lg:py-8">
              {children}
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}

import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { SidebarClassic } from "@/components/sidebar/sidebar-classic";
import { AppHeader } from "@/components/AppHeader";

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <SidebarClassic />
      <SidebarInset>
        <AppHeader />
        <div className="flex flex-1 flex-col px-4 py-4 md:px-6 md:py-6">
          {children}
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}

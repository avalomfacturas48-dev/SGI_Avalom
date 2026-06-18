import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { SidebarClassic } from "@/components/sidebar/sidebar-classic";

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <SidebarClassic />
      <SidebarInset>{children}</SidebarInset>
    </SidebarProvider>
  );
}

import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { SidebarClassic } from "@/components/sidebar/sidebar-classic";
import { Separator } from "@/components/ui/separator";
import { Building2 } from "lucide-react";

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <SidebarClassic />
      <SidebarInset>
        <header className="flex md:hidden sticky top-0 z-20 h-12 shrink-0 items-center gap-2 bg-background border-b px-4">
          <SidebarTrigger />
          <Separator orientation="vertical" className="h-5" />
          <Building2 className="size-4 text-primary" />
          <span className="text-sm font-semibold">SGI Avalom</span>
        </header>
        <div className="flex flex-1 flex-col px-4 py-4 md:px-6 md:py-6">
          {children}
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}

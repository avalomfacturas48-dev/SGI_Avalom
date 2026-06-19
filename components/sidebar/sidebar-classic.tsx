"use client";

import { Building2 } from "lucide-react";
import { usePathname } from "next/navigation";
import Link from "next/link";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  SidebarSeparator,
} from "@/components/ui/sidebar";
import { LogoutButton } from "@/components/sidebar/logout-button";
import { ModeToggle } from "@/components/sidebar/mode-toggle";
import { UserCard } from "@/components/sidebar/user-card";
import { navSections } from "@/lib/nav-data";
import { useUser } from "@/lib/UserContext";

export function SidebarClassic() {
  const pathname = usePathname();
  const { user } = useUser();

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <div className="flex items-center gap-2.5 px-1 py-2 overflow-hidden">
          <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Building2 className="size-5 shrink-0" />
          </div>
          <div className="grid leading-tight group-data-[collapsible=icon]:hidden flex-1 min-w-0">
            <span className="text-sm font-semibold">Avalom</span>
            <span className="text-xs text-muted-foreground">
              Gestión de alquileres
            </span>
          </div>
        </div>
      </SidebarHeader>

      <SidebarSeparator />

      <SidebarContent>
        {navSections.map((section) => {
          const filtered = section.items.filter((item) =>
            item.allowedRoles.includes(user?.usu_rol ?? "")
          );
          if (!filtered.length) return null;

          return (
            <SidebarGroup key={section.label}>
              <SidebarGroupLabel>{section.label}</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {filtered.map((item) => {
                    const isActive =
                      pathname === item.href ||
                      pathname.startsWith(item.href + "/");
                    return (
                      <SidebarMenuItem key={item.title}>
                        <SidebarMenuButton
                          asChild
                          isActive={isActive}
                          tooltip={item.title}
                        >
                          <Link href={item.href}>
                            <item.icon />
                            <span>{item.title}</span>
                          </Link>
                        </SidebarMenuButton>
                        {item.badge ? (
                          <SidebarMenuBadge>{item.badge}</SidebarMenuBadge>
                        ) : null}
                      </SidebarMenuItem>
                    );
                  })}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          );
        })}
      </SidebarContent>

      <SidebarFooter className="gap-2">
        <ModeToggle />
        <LogoutButton />
        <SidebarSeparator className="mx-0" />
        <UserCard />
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  );
}

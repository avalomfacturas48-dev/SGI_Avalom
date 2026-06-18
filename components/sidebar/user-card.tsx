"use client";

import { useUser } from "@/lib/UserContext";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { SidebarMenuButton } from "@/components/ui/sidebar";

const roleLabel: Record<string, string> = {
  A: "Administrador",
  J: "Jefe",
  E: "Empleado",
  R: "Recepción",
};

export function UserCard() {
  const { user } = useUser();

  const initials = user
    ? `${user.usu_nombre?.[0] ?? ""}${user.usu_papellido?.[0] ?? ""}`.toUpperCase()
    : "U";

  return (
    <SidebarMenuButton
      size="lg"
      tooltip={`${user?.usu_nombre ?? ""} ${user?.usu_papellido ?? ""}`}
      className="cursor-default hover:bg-sidebar-accent/50"
    >
      <Avatar className="h-8 w-8 rounded-lg shrink-0">
        <AvatarFallback className="rounded-lg bg-primary/15 text-primary text-xs font-bold">
          {initials}
        </AvatarFallback>
      </Avatar>
      <div className="flex flex-col leading-tight min-w-0">
        <span className="text-sm font-semibold truncate">
          {user?.usu_nombre} {user?.usu_papellido}
        </span>
        <span className="text-[11px] text-sidebar-foreground/60 truncate">
          {roleLabel[user?.usu_rol ?? ""] ?? user?.usu_rol}
        </span>
      </div>
    </SidebarMenuButton>
  );
}

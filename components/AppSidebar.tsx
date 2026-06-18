"use client";

import { useState, useEffect } from "react";
import {
  LayoutDashboard,
  BookUser,
  Users,
  Building2,
  LineChart,
  FilePen,
  Receipt,
  FileText,
  LogOut,
  Moon,
  Sun,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  SidebarSeparator,
} from "@/components/ui/sidebar";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useUser } from "@/lib/UserContext";
import { useTheme } from "next-themes";
import cookie from "js-cookie";

interface NavItemDef {
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  allowedRoles: string[];
}

const navItems: NavItemDef[] = [
  {
    href: "/homePage",
    icon: LayoutDashboard,
    title: "Inicio",
    allowedRoles: ["A", "J", "E", "R"],
  },
  {
    href: "/mantClient",
    icon: BookUser,
    title: "Clientes",
    allowedRoles: ["A", "J", "E"],
  },
  {
    href: "/mantUser",
    icon: Users,
    title: "Usuarios",
    allowedRoles: ["A", "J", "E"],
  },
  {
    href: "/mantBuild",
    icon: Building2,
    title: "Edificios",
    allowedRoles: ["A", "J", "E"],
  },
  {
    href: "/mantRent",
    icon: FilePen,
    title: "Alquileres",
    allowedRoles: ["A", "J", "E"],
  },
  {
    href: "/accounting",
    icon: LineChart,
    title: "Contabilidad",
    allowedRoles: ["A", "J", "E", "R"],
  },
  {
    href: "/expenses",
    icon: Receipt,
    title: "Gastos",
    allowedRoles: ["A", "J", "E", "R"],
  },
  {
    href: "/reports",
    icon: FileText,
    title: "Reportes",
    allowedRoles: ["A", "J", "E", "R"],
  },
];

const roleLabel: Record<string, string> = {
  A: "Administrador",
  J: "Jefe",
  E: "Empleado",
  R: "Recepción",
};

export function AppSidebar() {
  const [mounted, setMounted] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(true);

  const { user, logout } = useUser();
  const router = useRouter();
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    setMounted(true);
    const saved = cookie.get("theme");
    if (saved) {
      setTheme(saved);
      setIsDarkMode(saved === "dark");
    } else {
      setTheme("dark");
      setIsDarkMode(true);
      cookie.set("theme", "dark", { expires: 365 });
    }
  }, [setTheme]);

  useEffect(() => {
    setIsDarkMode(theme === "dark");
  }, [theme]);

  if (!mounted) return null;

  const toggleTheme = () => {
    const next = isDarkMode ? "light" : "dark";
    setTheme(next);
    setIsDarkMode(!isDarkMode);
    cookie.set("theme", next, { expires: 365 });
  };

  const handleLogout = () => {
    logout();
    router.push("/");
  };

  const initials = user
    ? `${user.usu_nombre?.[0] ?? ""}${user.usu_papellido?.[0] ?? ""}`.toUpperCase()
    : "U";

  return (
    <Sidebar collapsible="icon">
      {/* Brand */}
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild tooltip="SGI Avalom">
              <Link href="/homePage">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-sidebar-primary/15">
                  <LayoutDashboard className="h-4 w-4 text-sidebar-primary" />
                </div>
                <div className="flex flex-col leading-none">
                  <span className="font-bold text-sm">SGI Avalom</span>
                  <span className="text-[11px] text-sidebar-foreground/60">
                    Gestión de alquileres
                  </span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      {/* Navigation */}
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems
                .filter((item) =>
                  item.allowedRoles.includes(user?.usu_rol ?? "")
                )
                .map(({ href, icon: Icon, title }) => {
                  const isActive =
                    pathname === href || pathname.startsWith(href + "/");
                  return (
                    <SidebarMenuItem key={href}>
                      <SidebarMenuButton
                        asChild
                        isActive={isActive}
                        tooltip={title}
                      >
                        <Link href={href}>
                          <Icon />
                          <span>{title}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      {/* Footer */}
      <SidebarFooter>
        <SidebarMenu>
          {/* Theme toggle */}
          <SidebarMenuItem>
            <SidebarMenuButton
              tooltip={isDarkMode ? "Cambiar a modo claro" : "Cambiar a modo oscuro"}
              onClick={toggleTheme}
            >
              {isDarkMode ? <Moon /> : <Sun />}
              <span>{isDarkMode ? "Modo oscuro" : "Modo claro"}</span>
            </SidebarMenuButton>
          </SidebarMenuItem>

          {/* Logout */}
          <SidebarMenuItem>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <SidebarMenuButton
                  tooltip="Cerrar sesión"
                  className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                >
                  <LogOut />
                  <span>Cerrar sesión</span>
                </SidebarMenuButton>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>¿Cerrar sesión?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Tu sesión será cerrada. Tendrás que volver a iniciar sesión
                    para acceder al sistema.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleLogout}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    Cerrar sesión
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </SidebarMenuItem>
        </SidebarMenu>

        <SidebarSeparator />

        {/* User info */}
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              size="lg"
              tooltip={`${user?.usu_nombre ?? ""} ${user?.usu_papellido ?? ""}`}
              className="cursor-default hover:bg-sidebar-accent/50"
            >
              <Avatar className="h-8 w-8 rounded-lg shrink-0">
                <AvatarFallback className="rounded-lg bg-sidebar-primary/15 text-sidebar-primary text-xs font-bold">
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
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  );
}

import {
  LayoutDashboard,
  BookUser,
  Users,
  Building2,
  FilePen,
  PlusCircle,
  LineChart,
  Receipt,
  FileText,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

export interface NavItem {
  title: string;
  icon: LucideIcon;
  href: string;
  badge?: number;
  allowedRoles: string[];
}

export interface NavSection {
  label: string;
  items: NavItem[];
}

export const navSections: NavSection[] = [
  {
    label: "General",
    items: [
      {
        title: "Inicio",
        icon: LayoutDashboard,
        href: "/homePage",
        allowedRoles: ["A", "J", "E", "R"],
      },
    ],
  },
  {
    label: "Gestión",
    items: [
      {
        title: "Clientes",
        icon: BookUser,
        href: "/mantClient",
        allowedRoles: ["A", "J", "E"],
      },
      {
        title: "Usuarios",
        icon: Users,
        href: "/mantUser",
        allowedRoles: ["A", "J", "E"],
      },
      {
        title: "Edificios",
        icon: Building2,
        href: "/mantBuild",
        allowedRoles: ["A", "J", "E"],
      },
      {
        title: "Alquileres",
        icon: FilePen,
        href: "/mantRent",
        allowedRoles: ["A", "J", "E"],
      },
      {
        title: "Nuevo Alquiler",
        icon: PlusCircle,
        href: "/newRent",
        allowedRoles: ["A", "J", "E"],
      },
    ],
  },
  {
    label: "Finanzas",
    items: [
      {
        title: "Contabilidad",
        icon: LineChart,
        href: "/accounting",
        allowedRoles: ["A", "J", "E", "R"],
      },
      {
        title: "Gastos",
        icon: Receipt,
        href: "/expenses",
        allowedRoles: ["A", "J", "E", "R"],
      },
      {
        title: "Reportes",
        icon: FileText,
        href: "/reports",
        allowedRoles: ["A", "J", "E", "R"],
      },
    ],
  },
];

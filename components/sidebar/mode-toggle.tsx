"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { SidebarMenuButton } from "@/components/ui/sidebar";
import cookie from "js-cookie";

export function ModeToggle() {
  const { theme, setTheme } = useTheme();
  const [isDark, setIsDark] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const saved = cookie.get("theme");
    if (saved) {
      setTheme(saved);
      setIsDark(saved === "dark");
    } else {
      setTheme("dark");
      setIsDark(true);
      cookie.set("theme", "dark", { expires: 365 });
    }
  }, [setTheme]);

  useEffect(() => {
    setIsDark(theme === "dark");
  }, [theme]);

  if (!mounted) return null;

  const toggle = () => {
    const next = isDark ? "light" : "dark";
    setTheme(next);
    setIsDark(!isDark);
    cookie.set("theme", next, { expires: 365 });
  };

  return (
    <SidebarMenuButton
      tooltip={isDark ? "Cambiar a modo claro" : "Cambiar a modo oscuro"}
      onClick={toggle}
    >
      {isDark ? <Moon /> : <Sun />}
      <span>{isDark ? "Modo oscuro" : "Modo claro"}</span>
    </SidebarMenuButton>
  );
}

"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { navSections } from "@/lib/nav-data";

function useCurrentPage() {
  const pathname = usePathname();
  for (const section of navSections) {
    for (const item of section.items) {
      if (pathname === item.href) {
        return { title: item.title, href: item.href, isSubPage: false };
      }
      if (pathname.startsWith(item.href + "/")) {
        return { title: item.title, href: item.href, isSubPage: true };
      }
    }
  }
  return null;
}

export function AppHeader() {
  const page = useCurrentPage();

  return (
    <header className="flex sticky top-0 z-20 h-12 shrink-0 items-center gap-2 bg-background border-b px-4">
      <SidebarTrigger />
      <Separator orientation="vertical" className="h-5" />
      <nav className="flex items-center gap-1.5 text-sm">
        <Link
          href="/homePage"
          className="text-muted-foreground hover:text-foreground transition-colors"
        >
          Inicio
        </Link>
        {page && (
          <>
            <ChevronRight className="size-3.5 text-muted-foreground/60" />
            {page.isSubPage ? (
              <Link
                href={page.href}
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                {page.title}
              </Link>
            ) : (
              <span className="font-medium text-foreground">{page.title}</span>
            )}
          </>
        )}
      </nav>
    </header>
  );
}

"use client";

import { memo } from "react";
import { Button } from "@/components/ui/button";
import { Plus, Settings, Sparkles } from "lucide-react";
import { BreadcrumbResponsive } from "@/components/breadcrumbResponsive";

interface ExpensesHeaderProps {
  onNewExpense: () => void;
  onManageServices: () => void;
}

export const ExpensesHeader = memo(function ExpensesHeader({ onNewExpense, onManageServices }: ExpensesHeaderProps) {
  return (
    <div className="space-y-4 animate-in fade-in slide-in-from-top-4 duration-500">
      <BreadcrumbResponsive
        items={[
          { label: "Inicio", href: "/homePage" },
          { label: "Gastos", href: "/expenses" },
        ]}
      />

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
              Gestión de Gastos
            </h1>
            <Sparkles className="size-6 text-purple-500 animate-pulse" />
          </div>
          <p className="text-sm text-muted-foreground">
            Administra y controla los gastos de tus propiedades de manera eficiente
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={onManageServices}
            className="transition-all hover:scale-105 hover:shadow-md"
          >
            <Settings className="mr-2 size-4" />
            Gestionar Servicios
          </Button>
          <Button 
            size="sm" 
            onClick={onNewExpense}
            className="bg-gradient-to-r from-primary to-purple-600 transition-all hover:scale-105 hover:shadow-lg"
          >
            <Plus className="mr-2 size-4" />
            Nuevo Gasto
          </Button>
        </div>
      </div>
    </div>
  );
});

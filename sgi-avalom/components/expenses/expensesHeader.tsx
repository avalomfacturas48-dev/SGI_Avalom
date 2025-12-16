"use client";

import { Button } from "@/components/ui/button";
import { Plus, Settings } from "lucide-react";
import { BreadcrumbResponsive } from "@/components/breadcrumbResponsive";

interface ExpensesHeaderProps {
  onNewExpense: () => void;
  onManageServices: () => void;
}

export function ExpensesHeader({ onNewExpense, onManageServices }: ExpensesHeaderProps) {
  return (
    <div className="space-y-4">
      <BreadcrumbResponsive
        items={[
          { label: "Inicio", href: "/homePage" },
          { label: "Gastos", href: "/expenses" },
        ]}
      />

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Gestión de Gastos</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Administra y controla los gastos de tus propiedades
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" onClick={onManageServices}>
            <Settings className="mr-2 size-4" />
            Gestionar Servicios
          </Button>
          <Button size="sm" onClick={onNewExpense}>
            <Plus className="mr-2 size-4" />
            Nuevo Gasto
          </Button>
        </div>
      </div>
    </div>
  );
}

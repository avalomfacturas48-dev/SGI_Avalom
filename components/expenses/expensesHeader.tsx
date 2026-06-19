"use client";

import { memo } from "react";
import { Button } from "@/components/ui/button";
import { Plus, Settings } from "lucide-react";

interface ExpensesHeaderProps {
  onNewExpense: () => void;
  onManageServices: () => void;
}

export const ExpensesHeader = memo(function ExpensesHeader({ onNewExpense, onManageServices }: ExpensesHeaderProps) {
  return (
    <div className="flex justify-end gap-2">
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
  );
});

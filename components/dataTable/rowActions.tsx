"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface RowActionButtonProps {
  label: string;
  icon: React.ReactNode;
  onClick?: () => void;
  /** Si se indica, el botón navega a esta ruta en lugar de ejecutar onClick. */
  href?: string;
  variant?: "ghost" | "destructive";
  className?: string;
  disabled?: boolean;
}

/**
 * Botón de acción por fila para las tablas. Reemplaza el menú desplegable
 * (DropdownMenu) que anidaba diálogos y rompía el manejo de foco de Radix,
 * impidiendo editar en los modales. Cada acción abre directamente su diálogo
 * o navega a su ruta.
 */
export const RowActionButton: React.FC<RowActionButtonProps> = ({
  label,
  icon,
  onClick,
  href,
  variant = "ghost",
  className,
  disabled,
}) => {
  const classes = cn(
    "h-8 w-8",
    variant === "destructive" &&
      "text-destructive hover:text-destructive hover:bg-destructive/10",
    className
  );

  if (href && !disabled) {
    return (
      <Button
        asChild
        variant="ghost"
        size="icon"
        title={label}
        aria-label={label}
        className={classes}
      >
        <Link href={href} onClick={(e) => e.stopPropagation()}>
          {icon}
        </Link>
      </Button>
    );
  }

  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      title={label}
      aria-label={label}
      className={classes}
      disabled={disabled}
      onClick={(e) => {
        e.stopPropagation();
        onClick?.();
      }}
    >
      {icon}
    </Button>
  );
};

/** Contenedor flex para alinear los botones de acción de una fila. */
export const RowActions: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => <div className="flex items-center justify-end gap-1">{children}</div>;

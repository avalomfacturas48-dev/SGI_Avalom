import type React from "react";

/** Clases para combinar con `cn()` en una fila clicable. */
export const clickableRowClass =
  "cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset";

/**
 * Props para que una fila (o tarjeta) abra su detalle con clic, Enter o
 * Espacio. Los botones internos deben usar `stopPropagation` (RowActionButton
 * ya lo hace). No se activa si el usuario estaba seleccionando texto.
 */
export function clickableRowProps(onActivate: () => void, label?: string) {
  return {
    tabIndex: 0,
    "aria-label": label,
    onClick: () => {
      if (typeof window !== "undefined" && window.getSelection()?.toString()) return;
      onActivate();
    },
    onKeyDown: (e: React.KeyboardEvent<HTMLElement>) => {
      if (e.target !== e.currentTarget) return;
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        onActivate();
      }
    },
  };
}

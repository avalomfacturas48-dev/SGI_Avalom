"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { useWindowWidth } from "@react-hook/window-size";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";

interface ManageActionsProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  titleButton?: string;
  title: string;
  description: string;
  variant?:
    | "link"
    | "default"
    | "destructive"
    | "outline"
    | "secondary"
    | "ghost"
    | "green"
    | null
    | undefined;
  classn?: string;
  icon?: React.ReactNode;
  FormComponent: React.ReactNode;
  disabled?: boolean;
  /**
   * Cuando es true no se renderiza el botón disparador y el diálogo queda
   * controlado únicamente por `open`/`onOpenChange`. Útil para abrir el modal
   * desde un item de menú (DropdownMenuItem) sin anidar el Dialog dentro del
   * menú, lo que rompería el manejo de foco de Radix.
   */
  hideTrigger?: boolean;
}

const ManageActions: React.FC<ManageActionsProps> = ({
  open: openProp,
  onOpenChange,
  titleButton,
  title,
  description,
  variant,
  classn,
  icon,
  FormComponent,
  disabled,
  hideTrigger,
}) => {
  const [openInternal, setOpenInternal] = useState(false);
  const onlyWidth = useWindowWidth();
  const isDesktop = onlyWidth >= 768;

  const open = onOpenChange !== undefined ? !!openProp : openInternal;
  const setOpen = onOpenChange !== undefined ? onOpenChange : setOpenInternal;

  if (isDesktop) {
    return (
      <Dialog open={open} onOpenChange={setOpen}>
        {!hideTrigger && (
          <DialogTrigger asChild>
            <Button variant={variant} disabled={disabled} className={classn}>
              {icon && <span className="mr-2">{icon}</span>}
              {titleButton}
            </Button>
          </DialogTrigger>
        )}
        <DialogContent className="sm:max-w-[425px] md:max-w-xl lg:max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{title}</DialogTitle>
            <DialogDescription>{description}</DialogDescription>
          </DialogHeader>
          {FormComponent}
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      {!hideTrigger && (
        <DrawerTrigger asChild>
          <Button variant={variant} disabled={disabled} className={classn}>
            {icon && <span className="mr-2">{icon}</span>}
            {titleButton}
          </Button>
        </DrawerTrigger>
      )}
      <DrawerContent className="flex flex-col h-[85vh]">
        <DrawerHeader>
          <DrawerTitle>{title}</DrawerTitle>
          <DrawerDescription>{description}</DrawerDescription>
        </DrawerHeader>
        <ScrollArea className="flex-1 px-4">{FormComponent}</ScrollArea>
        <DrawerFooter>
          <DrawerClose asChild>
            <Button variant="secondary">Cerrar</Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
};

export default ManageActions;

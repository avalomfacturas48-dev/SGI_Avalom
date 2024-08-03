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
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import PropertyManager from "./propertyManager";

interface ManageActionsProps<T> {
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
    | "nuevo"
    | null
    | undefined;
  classn?: string;
  icon?: React.ReactNode;
  propId: number;
  onSuccess?: () => void;
}

const ManageActionsProperty = <T,>({
  titleButton,
  title,
  description,
  variant,
  classn,
  icon,
  propId,
}: ManageActionsProps<T>) => {
  const [open, setOpen] = useState(false);

  const toggleOpen = (event: React.MouseEvent) => {
    event.stopPropagation();
    setOpen((prevOpen) => !prevOpen);
  };

  const handleSuccess = () => {
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant={variant} className={classn} onClick={toggleOpen}>
          {titleButton}
          {icon}
        </Button>
      </DialogTrigger>
      <DialogContent className="md:max-w-xl lg:max-w-3xl">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <ScrollArea className="md:max-h-[500px] lg:max-h-[600px] xl:max-h-[700px] rounded-md">
          <PropertyManager propertyId={propId} />
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

export default ManageActionsProperty;

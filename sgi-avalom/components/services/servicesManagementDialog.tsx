"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { ServicesTable } from "@/components/services/servicesTable";
import { ServiceFormDialog } from "@/components/services/serviceFormDialog";
import type { AvaServicio } from "@/lib/types/entities";
import type { ServiceFormValues } from "@/lib/schemas/expenseSchemas";

interface ServicesManagementDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  services: AvaServicio[];
  onCreateService: (data: ServiceFormValues) => Promise<void>;
  onUpdateService: (id: string, data: ServiceFormValues) => Promise<void>;
  onDeleteService: (id: string) => Promise<void>;
}

export function ServicesManagementDialog({
  open,
  onOpenChange,
  services,
  onCreateService,
  onUpdateService,
  onDeleteService,
}: ServicesManagementDialogProps) {
  const [formOpen, setFormOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedService, setSelectedService] = useState<AvaServicio | null>(null);
  const [serviceToDelete, setServiceToDelete] = useState<AvaServicio | null>(null);

  const handleNewService = () => {
    setSelectedService(null);
    setFormOpen(true);
  };

  const handleEdit = (service: AvaServicio) => {
    setSelectedService(service);
    setFormOpen(true);
  };

  const handleDelete = (service: AvaServicio) => {
    setServiceToDelete(service);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (serviceToDelete) {
      await onDeleteService(serviceToDelete.ser_id);
      setDeleteDialogOpen(false);
      setServiceToDelete(null);
    }
  };

  const handleSubmitService = async (data: ServiceFormValues) => {
    if (selectedService) {
      await onUpdateService(selectedService.ser_id, data);
    } else {
      await onCreateService(data);
    }
  };

  const existingCodes = services.filter((s) => s.ser_id !== selectedService?.ser_id).map((s) => s.ser_codigo);

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Gestión de Servicios</DialogTitle>
            <DialogDescription>Administra los servicios disponibles para asociar con los gastos</DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="flex justify-end gap-2">
              <Button size="sm" onClick={handleNewService}>
                <Plus className="mr-2 size-4" />
                Nuevo Servicio
              </Button>
            </div>

            <ServicesTable services={services} onEdit={handleEdit} onDelete={handleDelete} />
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cerrar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ServiceFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        service={selectedService}
        onSubmit={handleSubmitService}
        existingCodes={existingCodes}
      />

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción eliminará el servicio "{serviceToDelete?.ser_nombre}". 
              <br />
              <br />
              <strong>Nota:</strong> No se puede eliminar un servicio que está siendo utilizado en gastos registrados. 
              Si este servicio tiene gastos asociados, la eliminación será rechazada.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmDelete} className="bg-destructive hover:bg-destructive/90">
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

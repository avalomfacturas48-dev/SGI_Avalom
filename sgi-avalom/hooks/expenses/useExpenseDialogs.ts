"use client";

import { useState, useCallback } from "react";
import type { AvaGasto } from "@/lib/types/entities";

export const useExpenseDialogs = () => {
  const [formOpen, setFormOpen] = useState(false);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [cancellationOpen, setCancellationOpen] = useState(false);
  const [servicesOpen, setServicesOpen] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState<AvaGasto | null>(null);

  const handleNewExpense = useCallback(() => {
    setSelectedExpense(null);
    setFormOpen(true);
  }, []);

  const handleManageServices = useCallback(() => {
    setServicesOpen(true);
  }, []);

  const handleViewDetails = useCallback((expense: AvaGasto) => {
    setSelectedExpense(expense);
    setDetailsOpen(true);
  }, []);

  const handleEdit = useCallback((expense: AvaGasto) => {
    setSelectedExpense(expense);
    setDetailsOpen(false);
    setFormOpen(true);
  }, []);

  const handleCancel = useCallback((expense: AvaGasto) => {
    // Validar que el gasto no esté ya anulado
    const isAlreadyCancelled = expense.gas_estado === "D" || (expense.ava_anulaciongasto && expense.ava_anulaciongasto.length > 0);
    
    if (isAlreadyCancelled) {
      // No abrir el diálogo si ya está anulado
      return;
    }
    
    setSelectedExpense(expense);
    setDetailsOpen(false);
    setCancellationOpen(true);
  }, []);

  const closeForm = useCallback(() => {
    setFormOpen(false);
    setSelectedExpense(null);
  }, []);

  const closeDetails = useCallback(() => {
    setDetailsOpen(false);
    setSelectedExpense(null);
  }, []);

  const closeCancellation = useCallback(() => {
    setCancellationOpen(false);
    setSelectedExpense(null);
  }, []);

  const closeServices = useCallback(() => {
    setServicesOpen(false);
  }, []);

  return {
    formOpen,
    detailsOpen,
    cancellationOpen,
    servicesOpen,
    selectedExpense,
    setFormOpen,
    setDetailsOpen,
    setCancellationOpen,
    setServicesOpen,
    handleNewExpense,
    handleManageServices,
    handleViewDetails,
    handleEdit,
    handleCancel,
    closeForm,
    closeDetails,
    closeCancellation,
    closeServices,
  };
};


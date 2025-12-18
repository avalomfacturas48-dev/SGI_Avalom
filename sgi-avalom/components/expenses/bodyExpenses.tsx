"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardHeader } from "@/components/ui/card";
import { ExpensesHeader } from "@/components/expenses/expensesHeader";
import { StatisticsCards } from "@/components/expenses/statisticsCards";
import { ExpensesTable } from "@/components/expenses/expensesTable";
import { ExpenseFormDialog } from "@/components/expenses/expenseFormDialog";
import { ExpenseDetailsDialog } from "@/components/expenses/expenseDetailsDialog";
import { ExpenseCancellationDialog } from "@/components/expenses/expenseCancellationDialog";
import { ServicesManagementDialog } from "@/components/services/servicesManagementDialog";
import { Skeleton } from "@/components/ui/skeleton";
import { useExpenses } from "@/hooks/expenses/useExpenses";
import { useExpenseStatisticsAPI } from "@/hooks/expenses/useExpenseStatisticsAPI";
import { useExpenseStaticData } from "@/hooks/expenses/useExpenseStaticData";
import { useServices } from "@/hooks/expenses/useServices";
import { useExpenseDialogs } from "@/hooks/expenses/useExpenseDialogs";
import { useExpensePagination } from "@/hooks/expenses/useExpensePagination";
import useExpensesStore from "@/lib/zustand/expensesStore";
import type { ExpenseFormValues, CancellationFormValues, ServiceFormValues } from "@/lib/schemas/expenseSchemas";

const BodyExpenses: React.FC = () => {
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [tipoFilter, setTipoFilter] = useState<string>("all");
  const [estadoFilter, setEstadoFilter] = useState<string>("all");

  // Hooks personalizados
  const {
    servicios,
    edificios,
    propiedades,
    isLoading: isLoadingStaticData,
    fetchStaticData,
  } = useExpenseStaticData();

  const {
    currentPage,
    pageSize,
    totalPages,
    totalRecords,
    handlePageChange,
    handlePageSizeChange,
    resetPagination,
    updatePagination,
  } = useExpensePagination();

  const {
    isLoading: isLoadingExpenses,
    fetchExpenses,
    fetchAllExpenses,
    createExpense,
    updateExpense,
    cancelExpense,
  } = useExpenses();

  const {
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
  } = useExpenseDialogs();

  const { createService, updateService, deleteService } = useServices({
    onSuccess: fetchStaticData,
  });

  // Estadísticas desde API
  const { statistics, fetchStatistics } = useExpenseStatisticsAPI();

  // Cargar gastos paginados con filtros
  const loadExpenses = useCallback(async () => {
    const estado = estadoFilter === "all" ? undefined : estadoFilter;
    const tipo = tipoFilter === "all" ? undefined : tipoFilter;
    const result = await fetchExpenses(currentPage, pageSize, estado, tipo);
    if (result?.pagination) {
      updatePagination(result.pagination);
    }
  }, [currentPage, pageSize, estadoFilter, tipoFilter, fetchExpenses, updatePagination]);

  // Cargar datos estáticos solo al montar el componente
  useEffect(() => {
    const initializeData = async () => {
      setIsInitialLoading(true);
      await Promise.all([fetchStaticData(), fetchStatistics(), loadExpenses()]);
      setIsInitialLoading(false);
    };
    initializeData();
  }, []);

  // Resetear a página 1 cuando cambian los filtros
  useEffect(() => {
    if (!isInitialLoading && currentPage !== 1) {
      handlePageChange(1);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [estadoFilter, tipoFilter]);
  
  // Recargar gastos cuando cambia la paginación, tamaño de página o filtros
  useEffect(() => {
    if (!isInitialLoading) {
      loadExpenses();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, pageSize, estadoFilter, tipoFilter]);

  const handleSubmitExpense = useCallback(
    async (data: ExpenseFormValues) => {
      try {
        if (selectedExpense) {
          await updateExpense(selectedExpense.gas_id, data);
        } else {
          await createExpense(data);
        }
        resetPagination();
        await Promise.all([fetchStaticData(), fetchStatistics(), loadExpenses()]);
        setFormOpen(false);
      } catch (error) {
        // El error ya se maneja en el hook
      }
    },
    [selectedExpense, createExpense, updateExpense, resetPagination, fetchStaticData, fetchStatistics, loadExpenses]
  );

  const handleConfirmCancellation = useCallback(
    async (data: CancellationFormValues) => {
      if (!selectedExpense) return;
      try {
        await cancelExpense(selectedExpense.gas_id, data);
        // Solo recargar datos si la anulación fue exitosa
        await Promise.all([fetchStaticData(), fetchStatistics(), loadExpenses()]);
        setCancellationOpen(false);
      } catch (error) {
        // El error ya se maneja en el hook useExpenses
        // No cerrar el diálogo si hay error para que el usuario vea el mensaje
        // El error se propaga para que el diálogo pueda manejarlo
        throw error;
      }
    },
    [selectedExpense, cancelExpense, fetchStaticData, fetchStatistics, loadExpenses]
  );

  const handleCreateService = useCallback(
    async (data: ServiceFormValues) => {
      await createService(data);
    },
    [createService]
  );

  const handleUpdateService = useCallback(
    async (id: string, data: ServiceFormValues) => {
      await updateService(id, data);
    },
    [updateService]
  );

  const handleDeleteService = useCallback(
    async (id: string) => {
      await deleteService(id);
    },
    [deleteService]
  );

  // Obtener gastos del store para la tabla
  const { expenses } = useExpensesStore();

  return (
    <div className="container mx-auto space-y-6 p-6">
      {isInitialLoading ? (
        <div className="space-y-6">
          <div className="space-y-4 animate-pulse">
            <Skeleton className="h-10 w-[300px]" />
            <Skeleton className="h-5 w-[450px]" />
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {[...Array(4)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardHeader className="space-y-2">
                  <Skeleton className="h-4 w-[120px]" />
                  <Skeleton className="h-8 w-[160px]" />
                </CardHeader>
              </Card>
            ))}
          </div>
          <Card className="p-6">
            <Skeleton className="mb-4 h-10 w-full" />
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          </Card>
        </div>
      ) : (
        <>
          <ExpensesHeader
            onNewExpense={handleNewExpense}
            onManageServices={handleManageServices}
          />

          <StatisticsCards statistics={statistics} />

          <div className="rounded-lg border bg-card p-6 relative">
            {isLoadingExpenses && (
              <div className="absolute inset-0 bg-background/50 backdrop-blur-sm z-10 flex items-center justify-center rounded-lg">
                <div className="flex items-center gap-2 bg-card px-4 py-2 rounded-lg shadow-lg border">
                  <div className="size-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                  <span className="text-sm font-medium">Cargando gastos...</span>
                </div>
              </div>
            )}
            <ExpensesTable 
              data={expenses} 
              onViewDetails={handleViewDetails} 
              onEdit={handleEdit} 
              onCancel={handleCancel}
              currentPage={currentPage}
              pageSize={pageSize}
              totalPages={totalPages}
              totalRecords={totalRecords}
              onPageChange={handlePageChange}
              onPageSizeChange={handlePageSizeChange}
              tipoFilter={tipoFilter}
              estadoFilter={estadoFilter}
              onTipoFilterChange={setTipoFilter}
              onEstadoFilterChange={setEstadoFilter}
            />
          </div>

          <ExpenseFormDialog
            open={formOpen}
            onOpenChange={setFormOpen}
            expense={selectedExpense}
            servicios={servicios}
            edificios={edificios}
            propiedades={propiedades}
            onSubmit={handleSubmitExpense}
          />

          <ExpenseDetailsDialog
            open={detailsOpen}
            onOpenChange={setDetailsOpen}
            expense={selectedExpense}
            onEdit={handleEdit}
            onCancel={handleCancel}
          />

          <ExpenseCancellationDialog
            open={cancellationOpen}
            onOpenChange={setCancellationOpen}
            expense={selectedExpense}
            onConfirm={handleConfirmCancellation}
          />

          <ServicesManagementDialog
            open={servicesOpen}
            onOpenChange={setServicesOpen}
            services={servicios}
            onCreateService={handleCreateService}
            onUpdateService={handleUpdateService}
            onDeleteService={handleDeleteService}
          />
        </>
      )}
    </div>
  );
};

export default BodyExpenses;


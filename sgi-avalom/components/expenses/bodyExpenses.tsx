"use client";

import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import cookie from "js-cookie";
import { toast } from "sonner";
import { Card, CardHeader } from "@/components/ui/card";
import { ExpensesHeader } from "@/components/expenses/expensesHeader";
import { StatisticsCards } from "@/components/expenses/statisticsCards";
import { ExpensesTable } from "@/components/expenses/expensesTable";
import { ExpenseFormDialog } from "@/components/expenses/expenseFormDialog";
import { ExpenseDetailsDialog } from "@/components/expenses/expenseDetailsDialog";
import { ExpenseCancellationDialog } from "@/components/expenses/expenseCancellationDialog";
import { ServicesManagementDialog } from "@/components/services/servicesManagementDialog";
import { ExportExpenses } from "@/components/expenses/exportExpenses";
import { Skeleton } from "@/components/ui/skeleton";
import useExpensesStore from "@/lib/zustand/expensesStore";
import type { AvaGasto, AvaServicio, AvaEdificio, AvaPropiedad } from "@/lib/types/entities";
import type { ExpenseFormValues, CancellationFormValues, ServiceFormValues } from "@/lib/schemas/expenseSchemas";
import type { ExpenseStatistics } from "@/lib/types/forms";

const BodyExpenses: React.FC = () => {
  const { expenses, setExpenses } = useExpensesStore();
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingExpenses, setIsLoadingExpenses] = useState(false);
  const [servicios, setServicios] = useState<AvaServicio[]>([]);
  const [edificios, setEdificios] = useState<AvaEdificio[]>([]);
  const [propiedades, setPropiedades] = useState<AvaPropiedad[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const [statistics, setStatistics] = useState<ExpenseStatistics>({
    totalMesActual: "0",
    totalAnioActual: "0",
    totalTransacciones: 0,
    porcentajeServicios: 0,
    porcentajeMantenimiento: 0,
    cantidadServicios: 0,
    cantidadMantenimiento: 0,
    cambioMesAnterior: 0,
  });

  const [formOpen, setFormOpen] = useState(false);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [cancellationOpen, setCancellationOpen] = useState(false);
  const [servicesOpen, setServicesOpen] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState<AvaGasto | null>(null);

  // Cargar datos estáticos solo una vez
  const fetchStaticData = useCallback(async () => {
    try {
      const token = cookie.get("token");
      if (!token) return;

      const [serviciosRes, edificiosRes, propiedadesRes, allExpensesRes] = await Promise.all([
        axios.get("/api/expenses/servicios", {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get("/api/building", {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get("/api/property", {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get("/api/expenses", {
          params: { estado: "A" },
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      setServicios(serviciosRes.data.data);
      setEdificios(edificiosRes.data.data);
      setPropiedades(propiedadesRes.data.data);
      calculateStatistics(allExpensesRes.data.data);
    } catch (error) {
      console.error("Error al cargar datos estáticos:", error);
      toast.error("No se pudieron cargar los datos");
    }
  }, []);

  // Cargar gastos paginados
  const fetchExpenses = useCallback(async () => {
    setIsLoadingExpenses(true);
    try {
      const token = cookie.get("token");
      if (!token) return;

      const expensesRes = await axios.get("/api/expenses", {
        params: {
          page: currentPage,
          limit: pageSize,
          estado: "A",
        },
        headers: { Authorization: `Bearer ${token}` },
      });

      setExpenses(expensesRes.data.data);

      if (expensesRes.data.pagination) {
        setTotalPages(expensesRes.data.pagination.totalPages || 1);
        setTotalRecords(expensesRes.data.pagination.total || 0);
      }
    } catch (error) {
      console.error("Error al cargar gastos:", error);
      toast.error("No se pudieron cargar los gastos");
    } finally {
      setIsLoadingExpenses(false);
    }
  }, [currentPage, pageSize]);

  const calculateStatistics = (gastos: AvaGasto[]) => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1;
    const lastMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear;

    const gastosActivos = gastos.filter((g) => g.gas_estado === "A");

    const mesActualGastos = gastosActivos.filter((g) => {
      const fecha = new Date(g.gas_fecha);
      return fecha.getMonth() === currentMonth && fecha.getFullYear() === currentYear;
    });

    const mesAnteriorGastos = gastosActivos.filter((g) => {
      const fecha = new Date(g.gas_fecha);
      return fecha.getMonth() === lastMonth && fecha.getFullYear() === lastMonthYear;
    });

    const anioActualGastos = gastosActivos.filter((g) => {
      const fecha = new Date(g.gas_fecha);
      return fecha.getFullYear() === currentYear;
    });

    const totalMesActual = mesActualGastos.reduce((sum, g) => sum + parseFloat(g.gas_monto), 0);
    const totalMesAnterior = mesAnteriorGastos.reduce((sum, g) => sum + parseFloat(g.gas_monto), 0);
    const totalAnioActual = anioActualGastos.reduce((sum, g) => sum + parseFloat(g.gas_monto), 0);

    const servicios = gastosActivos.filter((g) => g.gas_tipo === "S");
    const mantenimientos = gastosActivos.filter((g) => g.gas_tipo === "M");

    const cambioMesAnterior =
      totalMesAnterior > 0 ? ((totalMesActual - totalMesAnterior) / totalMesAnterior) * 100 : 0;

    setStatistics({
      totalMesActual: totalMesActual.toString(),
      totalAnioActual: totalAnioActual.toString(),
      totalTransacciones: gastosActivos.length,
      porcentajeServicios: gastosActivos.length > 0 ? (servicios.length / gastosActivos.length) * 100 : 0,
      porcentajeMantenimiento: gastosActivos.length > 0 ? (mantenimientos.length / gastosActivos.length) * 100 : 0,
      cantidadServicios: servicios.length,
      cantidadMantenimiento: mantenimientos.length,
      cambioMesAnterior,
    });
  };

  // Cargar datos estáticos solo al montar el componente
  useEffect(() => {
    const initializeData = async () => {
      setIsLoading(true);
      await fetchStaticData();
      await fetchExpenses();
      setIsLoading(false);
    };
    initializeData();
  }, []);

  // Recargar solo gastos cuando cambia la paginación
  useEffect(() => {
    fetchExpenses();
  }, [currentPage, pageSize, fetchExpenses]);

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
    setSelectedExpense(expense);
    setDetailsOpen(false);
    setCancellationOpen(true);
  }, []);

  const handlePageChange = useCallback((newPage: number) => {
    setCurrentPage(newPage);
  }, []);

  const handlePageSizeChange = useCallback((newPageSize: number) => {
    setPageSize(newPageSize);
    setCurrentPage(1);
  }, []);

  const handleSubmitExpense = useCallback(async (data: ExpenseFormValues) => {
    try {
      const token = cookie.get("token");
      if (!token) return;

      if (selectedExpense) {
        await axios.put(`/api/expenses/${selectedExpense.gas_id}`, data, {
          headers: { Authorization: `Bearer ${token}` },
        });
        toast.success("Gasto actualizado exitosamente");
      } else {
        await axios.post("/api/expenses", data, {
          headers: { Authorization: `Bearer ${token}` },
        });
        toast.success("Gasto creado exitosamente");
      }

      setCurrentPage(1);
      await Promise.all([fetchStaticData(), fetchExpenses()]);
      setFormOpen(false);
    } catch (error) {
      console.error("Error al guardar gasto:", error);
      toast.error("Error al guardar el gasto");
    }
  }, [selectedExpense, fetchStaticData, fetchExpenses]);

  const handleConfirmCancellation = useCallback(async (data: CancellationFormValues) => {
    try {
      const token = cookie.get("token");
      if (!token || !selectedExpense) return;

      await axios.post(`/api/expenses/${selectedExpense.gas_id}/cancel`, data, {
        headers: { Authorization: `Bearer ${token}` },
      });

      toast.success("Gasto anulado exitosamente");
      await Promise.all([fetchStaticData(), fetchExpenses()]);
      setCancellationOpen(false);
    } catch (error) {
      console.error("Error al anular gasto:", error);
      toast.error("Error al anular el gasto");
    }
  }, [selectedExpense, fetchStaticData, fetchExpenses]);

  const handleCreateService = useCallback(async (data: ServiceFormValues) => {
    try {
      const token = cookie.get("token");
      if (!token) return;

      await axios.post("/api/expenses/servicios", data, {
        headers: { Authorization: `Bearer ${token}` },
      });

      toast.success("Servicio creado exitosamente");
      await fetchStaticData();
    } catch (error) {
      console.error("Error al crear servicio:", error);
      toast.error("Error al crear el servicio");
    }
  }, [fetchStaticData]);

  const handleUpdateService = useCallback(async (id: string, data: ServiceFormValues) => {
    try {
      const token = cookie.get("token");
      if (!token) return;

      await axios.put(`/api/expenses/servicios/${id}`, data, {
        headers: { Authorization: `Bearer ${token}` },
      });

      toast.success("Servicio actualizado exitosamente");
      await fetchStaticData();
    } catch (error) {
      console.error("Error al actualizar servicio:", error);
      toast.error("Error al actualizar el servicio");
    }
  }, [fetchStaticData]);

  const handleDeleteService = useCallback(async (id: string) => {
    try {
      const token = cookie.get("token");
      if (!token) return;

      await axios.delete(`/api/expenses/servicios/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      toast.success("Servicio eliminado exitosamente");
      await fetchStaticData();
    } catch (error) {
      console.error("Error al eliminar servicio:", error);
      toast.error("Error al eliminar el servicio");
    }
  }, [fetchStaticData]);

  return (
    <div className="container mx-auto space-y-6 p-6">
      {isLoading ? (
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
            <div className="mb-4 flex justify-end">
              <ExportExpenses expenses={expenses} />
            </div>
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


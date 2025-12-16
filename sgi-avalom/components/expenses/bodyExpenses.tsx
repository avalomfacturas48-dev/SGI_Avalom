"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import cookie from "js-cookie";
import { toast } from "sonner";
import { Card } from "@/components/ui/card";
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
  const [servicios, setServicios] = useState<AvaServicio[]>([]);
  const [edificios, setEdificios] = useState<AvaEdificio[]>([]);
  const [propiedades, setPropiedades] = useState<AvaPropiedad[]>([]);
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

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const token = cookie.get("token");
      if (!token) return;

      const [expensesRes, serviciosRes, edificiosRes, propiedadesRes] = await Promise.all([
        axios.get("/api/expenses", {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get("/api/expenses/servicios", {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get("/api/building", {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get("/api/property", {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      setExpenses(expensesRes.data.data);
      setServicios(serviciosRes.data.data);
      setEdificios(edificiosRes.data.data);
      setPropiedades(propiedadesRes.data.data);

      // Calculate statistics
      calculateStatistics(expensesRes.data.data);
    } catch (error) {
      console.error("Error al cargar datos:", error);
      toast.error("No se pudieron cargar los datos");
    } finally {
      setIsLoading(false);
    }
  };

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

  useEffect(() => {
    fetchData();
  }, []);

  const handleNewExpense = () => {
    setSelectedExpense(null);
    setFormOpen(true);
  };

  const handleManageServices = () => {
    setServicesOpen(true);
  };

  const handleViewDetails = (expense: AvaGasto) => {
    setSelectedExpense(expense);
    setDetailsOpen(true);
  };

  const handleEdit = (expense: AvaGasto) => {
    setSelectedExpense(expense);
    setDetailsOpen(false);
    setFormOpen(true);
  };

  const handleCancel = (expense: AvaGasto) => {
    setSelectedExpense(expense);
    setDetailsOpen(false);
    setCancellationOpen(true);
  };

  const handleSubmitExpense = async (data: ExpenseFormValues) => {
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

      fetchData();
      setFormOpen(false);
    } catch (error) {
      console.error("Error al guardar gasto:", error);
      toast.error("Error al guardar el gasto");
    }
  };

  const handleConfirmCancellation = async (data: CancellationFormValues) => {
    try {
      const token = cookie.get("token");
      if (!token || !selectedExpense) return;

      await axios.post(`/api/expenses/${selectedExpense.gas_id}/cancel`, data, {
        headers: { Authorization: `Bearer ${token}` },
      });

      toast.success("Gasto anulado exitosamente");
      fetchData();
      setCancellationOpen(false);
    } catch (error) {
      console.error("Error al anular gasto:", error);
      toast.error("Error al anular el gasto");
    }
  };

  const handleCreateService = async (data: ServiceFormValues) => {
    try {
      const token = cookie.get("token");
      if (!token) return;

      await axios.post("/api/expenses/servicios", data, {
        headers: { Authorization: `Bearer ${token}` },
      });

      toast.success("Servicio creado exitosamente");
      fetchData();
    } catch (error) {
      console.error("Error al crear servicio:", error);
      toast.error("Error al crear el servicio");
    }
  };

  const handleUpdateService = async (id: string, data: ServiceFormValues) => {
    try {
      const token = cookie.get("token");
      if (!token) return;

      await axios.put(`/api/expenses/servicios/${id}`, data, {
        headers: { Authorization: `Bearer ${token}` },
      });

      toast.success("Servicio actualizado exitosamente");
      fetchData();
    } catch (error) {
      console.error("Error al actualizar servicio:", error);
      toast.error("Error al actualizar el servicio");
    }
  };

  const handleDeleteService = async (id: string) => {
    try {
      const token = cookie.get("token");
      if (!token) return;

      await axios.delete(`/api/expenses/servicios/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      toast.success("Servicio eliminado exitosamente");
      fetchData();
    } catch (error) {
      console.error("Error al eliminar servicio:", error);
      toast.error("Error al eliminar el servicio");
    }
  };

  return (
    <div className="container mx-auto space-y-6 p-6">
      {isLoading ? (
        <>
          <div className="space-y-4">
            <Skeleton className="h-8 w-[250px]" />
            <Skeleton className="h-4 w-[400px]" />
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-[120px]" />
            ))}
          </div>
          <Skeleton className="h-[400px]" />
        </>
      ) : (
        <>
          <ExpensesHeader
            onNewExpense={handleNewExpense}
            onManageServices={handleManageServices}
          />

          <StatisticsCards statistics={statistics} />

          <div className="rounded-lg border bg-card p-6">
            <div className="mb-4 flex justify-end">
              <ExportExpenses expenses={expenses} />
            </div>
            <ExpensesTable data={expenses} onViewDetails={handleViewDetails} onEdit={handleEdit} onCancel={handleCancel} />
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


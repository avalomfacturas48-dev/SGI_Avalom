"use client";

import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import cookie from "js-cookie";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { DataTable } from "@/components/dataTable/data-table";
import { columnsClient } from "@/components/mantClient/columnsClient";
import ManageActions from "@/components/dataTable/manageActions";
import ClienteForm from "@/components/mantClient/clienteFormProps";
import { Skeleton } from "@/components/ui/skeleton";
import useClientStore from "@/lib/zustand/clientStore";

const BodyMantClient: React.FC = () => {
  const { clients, setClients } = useClientStore((state) => ({
    clients: state.clients,
    setClients: state.setClients,
  }));
  const [isLoading, setIsLoading] = useState(true);
  const [openNew, setOpenNew] = useState(false);

  // Estado de paginación servidor
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [total, setTotal] = useState(0);

  // Búsqueda con debounce
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 400);
    return () => clearTimeout(t);
  }, [search]);

  const fetchClients = useCallback(async () => {
    setIsLoading(true);
    try {
      const token = cookie.get("token");
      if (!token) return;

      const params: Record<string, string> = {
        page: String(page),
        limit: String(pageSize),
      };
      if (debouncedSearch) params.search = debouncedSearch;

      const response = await axios.get("/api/client", {
        params,
        headers: { Authorization: `Bearer ${token}` },
      });

      setClients(response.data.data);
      if (response.data.pagination) {
        setTotal(response.data.pagination.total);
      }
    } catch (err) {
      console.error("Error al buscar clientes:", err);
      toast.error("No se pudo cargar la lista de clientes");
    } finally {
      setIsLoading(false);
    }
  }, [page, pageSize, debouncedSearch, setClients]);

  useEffect(() => {
    fetchClients();
  }, [fetchClients]);

  const handleSearchChange = (val: string) => {
    setSearch(val);
    setPage(1);
  };

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-6">
      {isLoading && clients.length === 0 ? (
        <>
          <div className="flex justify-end">
            <Skeleton className="h-9 w-32" />
          </div>
          <Card>
            <CardContent className="p-0">
              <div className="flex items-center px-6 py-4 border-b">
                <Skeleton className="h-8 w-64" />
              </div>
              {[...Array(6)].map((_, i) => (
                <div key={i} className="flex items-center gap-6 px-6 py-4 border-b last:border-0">
                  <Skeleton className="h-5 w-[180px]" />
                  <Skeleton className="h-5 w-[120px]" />
                  <Skeleton className="h-5 w-[150px]" />
                  <Skeleton className="ml-auto h-8 w-8 rounded-full" />
                </div>
              ))}
            </CardContent>
          </Card>
        </>
      ) : (
        <>
          <div className="flex justify-end">
            <ManageActions
              variant="default"
              titleButton="Nuevo Cliente"
              icon={<Plus className="mr-2 h-4 w-4" />}
              title="Nuevo Cliente"
              description="Ingresa un nuevo cliente"
              open={openNew}
              onOpenChange={setOpenNew}
              FormComponent={
                <ClienteForm
                  action="create"
                  onSuccess={() => {
                    setOpenNew(false);
                    setPage(1);
                    fetchClients();
                  }}
                />
              }
            />
          </div>

          <Card>
            <CardContent>
              <DataTable
                columns={columnsClient}
                data={clients}
                searchValue={search}
                onSearchChange={handleSearchChange}
                serverPagination={{
                  total,
                  page,
                  pageSize,
                  onPageChange: setPage,
                  onPageSizeChange: (size) => {
                    setPageSize(size);
                    setPage(1);
                  },
                }}
                renderMobileCard={(cliente, actions) => (
                  <Card className="hover:bg-muted/50 transition-colors">
                    <CardContent className="p-4 space-y-3">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="font-semibold">
                            {cliente.cli_nombre} {cliente.cli_papellido}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {cliente.cli_cedula}
                          </p>
                        </div>
                        <div onClick={(e) => e.stopPropagation()}>{actions}</div>
                      </div>
                      {cliente.cli_correo && (
                        <div className="border-t pt-3 text-sm">
                          <span className="text-muted-foreground">Correo: </span>
                          <span>{cliente.cli_correo}</span>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )}
              />
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
};

export default BodyMantClient;

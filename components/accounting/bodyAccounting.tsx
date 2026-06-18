"use client";

import React, { useEffect, useState, useCallback } from "react";
import useRentalStore from "@/lib/zustand/rentalStore";
import axios from "axios";
import cookie from "js-cookie";
import { Card, CardHeader, CardTitle, CardContent } from "../ui/card";
import { DataTable } from "./data_table_filter";
import { columns } from "./columnsAccounting";
import { BreadcrumbResponsive } from "@/components/breadcrumbResponsive";
import { Skeleton } from "../ui/skeleton";
import { RentalSummaryCards } from "../shared/RentalSummaryCards";

const BodyAccounting: React.FC = () => {
  const { rentals, setRentals } = useRentalStore();
  const [statusFilter, setStatusFilter] = useState<string[]>(["A"]);
  const [propertyTypeFilter, setPropertyTypeFilter] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Estado de paginación servidor
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [total, setTotal] = useState(0);
  const [counts, setCounts] = useState({ active: 0, finished: 0, canceled: 0 });

  // Búsqueda con debounce
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 400);
    return () => clearTimeout(t);
  }, [search]);

  const fetchRentals = useCallback(async () => {
    const token = cookie.get("token");
    if (!token) return;
    setIsLoading(true);
    try {
      const params: Record<string, string> = {
        page: String(page),
        limit: String(pageSize),
      };
      if (debouncedSearch) params.search = debouncedSearch;
      if (statusFilter.length > 0) params.status = statusFilter.join(",");
      if (propertyTypeFilter.length > 0)
        params.propertyType = propertyTypeFilter.join(",");

      const response = await axios.get("/api/accounting", {
        params,
        headers: { Authorization: `Bearer ${token}` },
      });

      setRentals(response.data.data);
      if (response.data.pagination) {
        setTotal(response.data.pagination.total);
      }
      if (response.data.counts) {
        setCounts(response.data.counts);
      }
    } catch (error) {
      console.error("Error al buscar alquileres:", error);
    } finally {
      setIsLoading(false);
    }
  }, [page, pageSize, debouncedSearch, statusFilter, propertyTypeFilter, setRentals]);

  useEffect(() => {
    fetchRentals();
  }, [fetchRentals]);

  const handleStatusChange = (val: string[]) => {
    setStatusFilter(val);
    setPage(1);
  };
  const handlePropertyTypeChange = (val: string[]) => {
    setPropertyTypeFilter(val);
    setPage(1);
  };
  const handleSearchChange = (val: string) => {
    setSearch(val);
    setPage(1);
  };

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-6">
      {isLoading && rentals.length === 0 ? (
        <>
          <Card className="border shadow-lg">
            <CardHeader>
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="space-y-2">
                  <Skeleton className="h-4 w-40" />
                  <Skeleton className="h-8 w-44" />
                  <Skeleton className="h-4 w-80" />
                </div>
              </div>
            </CardHeader>
          </Card>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[...Array(3)].map((_, i) => (
              <Card key={i}>
                <CardHeader className="space-y-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-8 w-12" />
                </CardHeader>
              </Card>
            ))}
          </div>
          <Card className="border shadow-lg">
            <CardContent className="p-0">
              <div className="flex items-center px-6 py-4 border-b">
                <Skeleton className="h-8 w-64" />
              </div>
              {[...Array(6)].map((_, i) => (
                <div key={i} className="flex items-center gap-6 px-6 py-4 border-b last:border-0">
                  <Skeleton className="h-5 w-[180px]" />
                  <Skeleton className="h-5 w-[120px]" />
                  <Skeleton className="h-5 w-[150px]" />
                  <Skeleton className="h-5 w-[100px]" />
                  <Skeleton className="ml-auto h-8 w-8 rounded-full" />
                </div>
              ))}
            </CardContent>
          </Card>
        </>
      ) : (
        <>
          <Card className="border shadow-lg">
            <CardHeader>
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <BreadcrumbResponsive
                    items={[
                      { label: "Inicio", href: "/homePage" },
                      { label: "Contabilidad" },
                    ]}
                  />
                  <CardTitle className="text-xl sm:text-2xl text-primary font-bold mt-2">
                    Contabilidad
                  </CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">
                    Registra pagos, depósitos y anulaciones. Abre un alquiler
                    para ver su historial de movimientos.
                  </p>
                </div>
              </div>
            </CardHeader>
          </Card>

          <RentalSummaryCards
            activeCount={counts.active}
            finishedCount={counts.finished}
            canceledCount={counts.canceled}
          />

          <Card className="border shadow-lg">
            <CardContent className="p-3 sm:p-6">
              <DataTable
                columns={columns}
                data={rentals}
                statusFilter={statusFilter}
                propertyTypeFilter={propertyTypeFilter}
                onStatusChange={handleStatusChange}
                onPropertyTypeChange={handlePropertyTypeChange}
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
              />
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
};

export default BodyAccounting;

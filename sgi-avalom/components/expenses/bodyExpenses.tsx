"use client";

import React, { useEffect, useState } from "react";
import useExpensesStore from "@/lib/zustand/expensesStore";
import axios from "axios";
import cookie from "js-cookie";
import { ModeToggle } from "../modeToggle";
import { Card, CardHeader, CardTitle, CardContent } from "../ui/card";
import { BreadcrumbResponsive } from "@/components/breadcrumbResponsive";
import { Skeleton } from "../ui/skeleton";

const BodyExpenses: React.FC = () => {
  const { expenses, setExpenses } = useExpensesStore();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchExpenses = async () => {
      const token = cookie.get("token");
      if (!token) {
        console.error("No hay token disponible");
        return;
      }

      try {
        const response = await axios.get("/api/expenses", {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });
        setExpenses(response.data.data);
      } catch (error) {
        console.error("Error al buscar gastos: " + error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchExpenses();
  }, [setExpenses]);

  return (
    <div className="mx-auto p-4 space-y-8">
      {isLoading ? (
        <>
          <div className="space-y-4 mb-3">
            <div className="h-4 w-40 sm:w-56 rounded-md bg-muted animate-pulse" />
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4 sm:gap-8">
              <div className="w-60 h-8 rounded-md bg-muted animate-pulse" />
              <div className="flex flex-wrap gap-2">
                {[...Array(4)].map((_, i) => (
                  <Skeleton
                    key={i}
                    className="h-8 w-[120px] rounded-md bg-muted animate-pulse"
                  />
                ))}
              </div>
            </div>
          </div>
          <div className="space-y-4">
            {[...Array(8)].map((_, index) => (
              <div
                key={index}
                className="flex flex-col sm:flex-row items-center sm:justify-between gap-4 sm:gap-8 m-10"
              >
                <Skeleton className="w-full sm:w-[200px] h-[30px] rounded-full" />
                <Skeleton className="w-full sm:w-[100px] h-[30px] rounded-full" />
                <Skeleton className="w-full sm:w-[150px] h-[30px] rounded-full" />
              </div>
            ))}
          </div>
        </>
      ) : (
        <>
          <Card className="flex flex-col sm:flex-row justify-between items-center">
            <CardHeader>
              <BreadcrumbResponsive
                items={[
                  { label: "Inicio", href: "/homePage" },
                  { label: "Gastos" },
                ]}
              />
              <CardTitle className="text-2xl text-primary font-bold mb-4 sm:mb-0">
                Gastos
              </CardTitle>
            </CardHeader>
            <div className="flex flex-wrap justify-center gap-2 p-4">
              <ModeToggle />
            </div>
          </Card>
          <Card>
            <CardContent>
              {/* Aquí irá la tabla de gastos */}
              <div className="p-4 text-center text-muted-foreground">
                Tabla de gastos - Por implementar
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
};

export default BodyExpenses;


"use client";

import type React from "react";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { BreadcrumbResponsive } from "@/components/breadcrumbResponsive";
import { FileText, TrendingUp, Receipt, Users as UsersIcon, FileSignature, Building } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

// Reportes Generales
import { BuildingsReportCard } from "./reportCards/buildingsReportCard";
import { ClientsReportCard } from "./reportCards/clientsReportCard";
import { RentalReportCard } from "./reportCards/rentalReportCard";
import { UsersReportCard } from "./reportCards/usersReportCard";
import { ContractCard } from "./reportCards/contractCard";

// Reportes de Gastos
import { ServicesReportCard } from "./reportCards/servicesReportCard";
import { MaintenanceReportCard } from "./reportCards/maintenanceReportCard";
import { AllExpensesReportCard } from "./reportCards/allExpensesReportCard";
import { ProfitLossReportCard } from "./reportCards/profitLossReportCard";

const BodyReports: React.FC = () => {
  return (
    <div className="mx-auto p-4 space-y-6 max-w-7xl">
      {/* Header */}
      <Card className="border shadow-lg bg-gradient-to-r from-primary/5 to-primary/10">
        <CardHeader>
          <div className="flex flex-col gap-4">
            <BreadcrumbResponsive
              items={[{ label: "Inicio", href: "/homePage" }, { label: "Reportes" }]}
            />
            <div>
              <CardTitle className="text-3xl text-primary font-bold flex items-center gap-3">
                <FileText className="h-8 w-8" />
                Centro de Reportes
              </CardTitle>
              <CardDescription className="text-base mt-2">
                Genera reportes detallados en PDF organizados por categoría
              </CardDescription>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Acordeón de Reportes */}
      <Accordion type="multiple" className="space-y-4">
        
        {/* 1. REPORTE CONTABLE - Separado */}
        <AccordionItem value="contable" className="border rounded-lg shadow-sm bg-card">
          <AccordionTrigger className="px-6 py-4 hover:no-underline">
            <div className="flex items-center gap-3 w-full">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-primary/20 to-primary/10">
                <TrendingUp className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1 text-left">
                <h3 className="text-lg font-bold">Reporte Contable</h3>
                <p className="text-sm text-muted-foreground">
                  Análisis completo de ingresos, gastos y rentabilidad
                </p>
              </div>
            </div>
          </AccordionTrigger>
          <AccordionContent className="px-6 pb-6">
            <ProfitLossReportCard />
          </AccordionContent>
        </AccordionItem>

        {/* 2. REPORTES EJECUTIVOS */}
        <AccordionItem value="ejecutivos" className="border rounded-lg shadow-sm bg-card">
          <AccordionTrigger className="px-6 py-4 hover:no-underline">
            <div className="flex items-center gap-3 w-full">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <Building className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1 text-left">
                <h3 className="text-lg font-bold">Reportes Ejecutivos</h3>
                <p className="text-sm text-muted-foreground">
                  Reportes de edificios, propiedades y alquileres
                </p>
              </div>
            </div>
          </AccordionTrigger>
          <AccordionContent className="px-6 pb-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <BuildingsReportCard />
              <RentalReportCard />
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* 3. REPORTES DE GASTOS */}
        <AccordionItem value="gastos" className="border rounded-lg shadow-sm bg-card">
          <AccordionTrigger className="px-6 py-4 hover:no-underline">
            <div className="flex items-center gap-3 w-full">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-500/10">
                <Receipt className="h-5 w-5 text-orange-600" />
              </div>
              <div className="flex-1 text-left">
                <h3 className="text-lg font-bold">Reportes de Gastos</h3>
                <p className="text-sm text-muted-foreground">
                  Análisis detallado de servicios, mantenimientos y gastos generales
                </p>
              </div>
            </div>
          </AccordionTrigger>
          <AccordionContent className="px-6 pb-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <ServicesReportCard />
              <MaintenanceReportCard />
              <AllExpensesReportCard />
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* 4. REPORTES ADMINISTRATIVOS */}
        <AccordionItem value="administrativos" className="border rounded-lg shadow-sm bg-card">
          <AccordionTrigger className="px-6 py-4 hover:no-underline">
            <div className="flex items-center gap-3 w-full">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500/10">
                <UsersIcon className="h-5 w-5 text-blue-600" />
              </div>
              <div className="flex-1 text-left">
                <h3 className="text-lg font-bold">Reportes Administrativos</h3>
                <p className="text-sm text-muted-foreground">
                  Información de clientes y usuarios del sistema
                </p>
              </div>
            </div>
          </AccordionTrigger>
          <AccordionContent className="px-6 pb-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <ClientsReportCard />
              <UsersReportCard />
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* 5. DOCUMENTOS LEGALES */}
        <AccordionItem value="documentos" className="border rounded-lg shadow-sm bg-card">
          <AccordionTrigger className="px-6 py-4 hover:no-underline">
            <div className="flex items-center gap-3 w-full">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-500/10">
                <FileSignature className="h-5 w-5 text-green-600" />
              </div>
              <div className="flex-1 text-left">
                <h3 className="text-lg font-bold">Generación de Documentos</h3>
                <p className="text-sm text-muted-foreground">
                  Contratos y documentos legales de arrendamiento
                </p>
              </div>
            </div>
          </AccordionTrigger>
          <AccordionContent className="px-6 pb-6">
            <ContractCard />
          </AccordionContent>
        </AccordionItem>

      </Accordion>

      {/* Footer con estadísticas */}
      <Card className="border-dashed">
        <CardHeader>
          <div className="text-center space-y-2">
            <p className="text-sm text-muted-foreground">
              <span className="font-semibold text-primary">11 tipos de reportes</span> disponibles
            </p>
            <p className="text-xs text-muted-foreground">
              Los reportes se generan en formato PDF y se descargan automáticamente
            </p>
          </div>
        </CardHeader>
      </Card>
    </div>
  );
};

export default BodyReports;

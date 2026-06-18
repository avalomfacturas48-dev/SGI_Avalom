"use client";

import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import ActivityCards from "@/components/homePage/activityCards";
import { PendingPaymentsOverview } from "./pendingPaymentsOverview";
import { ExpensesSummaryCards } from "./expensesSummaryCards";
import ProfitLossChart from "./profitLossChart";
import { BreadcrumbResponsive } from "../breadcrumbResponsive";
import { formatCurrencyNoDecimals } from "@/utils/currencyConverter";
import { useHomePage } from "@/hooks/homePage/useHomePage";
import { QuickActions } from "./quickActions";

const BodyHomePage: React.FC = () => {
  const {
    overview,
    revenue,
    expensesSummary,
    profitLoss,
    profitLossTotals,
    pending,
    loading,
  } = useHomePage();

  const monthlyRevenue = revenue?.[revenue.length - 1]?.total ?? 0;

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-6">
      {/* Header */}
      <Card className="border shadow-sm">
        <CardHeader>
          <BreadcrumbResponsive
            items={[
              { label: "Inicio", href: "/homePage" },
              { label: "Dashboard" },
            ]}
          />
          <CardTitle className="text-xl sm:text-2xl text-primary font-bold">
            Dashboard
          </CardTitle>
        </CardHeader>
      </Card>

      {/* Acciones Rápidas */}
      <QuickActions />

      {/* KPIs + Gastos compactos (misma zona visual) */}
      <div className="space-y-3">
        <ActivityCards
          loading={loading}
          formatCurrency={formatCurrencyNoDecimals}
          totalProperties={overview?.totalProperties}
          totalClients={overview?.totalClients}
          activeRentals={overview?.activeRentals}
          monthlyRevenue={monthlyRevenue}
        />
        <ExpensesSummaryCards
          data={expensesSummary}
          loading={loading}
          formatCurrency={formatCurrencyNoDecimals}
          compact
        />
      </div>

      {/* Gráfico Ganancias y Pérdidas */}
      <ProfitLossChart
        data={profitLoss ?? []}
        totals={profitLossTotals}
        loading={loading}
      />

      {/* Pagos Pendientes */}
      <PendingPaymentsOverview data={pending} loading={loading} />
    </div>
  );
};

export default BodyHomePage;

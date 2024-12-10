"use client";

import { useState } from "react";
import { DateRange } from "react-day-picker";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DatePickerWithRange } from "@/components/ui/date-picker-with-range";
import { MonthsBetween } from "@/components/mantRent/edit/MonthsBetween";

export function DateRangeCalculator() {
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: new Date(),
    to: new Date(),
  });

  return (
    <div className="w-full max-w-4xl mx-auto px-4 space-y-8">
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="text-center">
            Selecciona un Rango de Fechas
          </CardTitle>
        </CardHeader>
        <CardContent className="flex justify-center">
          <DatePickerWithRange date={dateRange} onDateChange={setDateRange} />
        </CardContent>
      </Card>
      <MonthsBetween dateRange={dateRange} />
    </div>
  );
}

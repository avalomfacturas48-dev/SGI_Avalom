"use client";

import { useEffect, useState } from "react";
import { DateRange } from "react-day-picker";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getMonthsBetween, formatDateRange } from "@/utils/dateUtils";

interface MonthsBetweenProps {
  dateRange: DateRange | undefined;
}

export function MonthsBetween({ dateRange }: MonthsBetweenProps) {
  const [months, setMonths] = useState<{ start: Date; end: Date }[]>([]);

  useEffect(() => {
    if (dateRange?.from && dateRange?.to) {
      setMonths(getMonthsBetween(dateRange.from, dateRange.to));
    } else {
      setMonths([]);
    }
  }, [dateRange]);

  if (months.length === 0) return null;

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-center">Meses entre las fechas</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {months.map((month, index) => (
            <div
              key={index}
              className="bg-primary/10 hover:bg-primary/20 text-primary rounded-lg p-4 text-center shadow-md transition-all duration-300 ease-in-out transform hover:scale-105"
            >
              <p className="text-lg font-semibold mb-2">Mes {index + 1}</p>
              <p className="text-sm">
                {formatDateRange(month.start, month.end)}
              </p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

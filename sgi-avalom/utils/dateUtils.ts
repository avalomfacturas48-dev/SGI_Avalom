import { format, addMonths, isSameDay, isAfter } from "date-fns";

export function getMonthsBetween(
  startDate: Date,
  endDate: Date
): { start: Date; end: Date }[] {
  const months: { start: Date; end: Date }[] = [];
  let currentStart = startDate;
  let currentEnd = addMonths(currentStart, 1);

  while (isSameDay(currentEnd, endDate) || isAfter(endDate, currentEnd)) {
    months.push({ start: currentStart, end: currentEnd });
    currentStart = currentEnd;
    currentEnd = addMonths(currentStart, 1);
  }

  if (isAfter(endDate, currentStart)) {
    months.push({ start: currentStart, end: endDate });
  }

  return months;
}

export function formatDateRange(start: Date, end: Date): string {
  return `${format(start, "dd/MM/yyyy")} - ${format(end, "dd/MM/yyyy")}`;
}

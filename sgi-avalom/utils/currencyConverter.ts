export const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("es-CR", {
    style: "currency",
    currency: "CRC",
    minimumFractionDigits: 2,
    maximumFractionDigits: 5,
  }).format(amount);
};

export const parseCurrency = (value: string): number =>
  parseFloat(value.replace(/[^\d.-]/g, "")) || 0;

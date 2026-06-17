import { useState, useEffect } from "react";
import axios from "axios";
import cookie from "js-cookie";
import { toast } from "sonner";
import usePaymentStore from "@/lib/zustand/monthlyPaymentStore";

export const usePayment = (alqmId: string | undefined) => {
  const { selectedMonthlyRent, selectMonthlyRent, setPayments } =
    usePaymentStore();
  const [isLoading, setIsLoading] = useState(true);

  const fetchRental = async () => {
    try {
      setIsLoading(true);
      const token = cookie.get("token");
      if (!token) throw new Error("Token no disponible");

      const response = await axios.get(
        `/api/accounting/monthlyrent/${alqmId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response?.data?.success) {
        selectMonthlyRent(response.data.data);
        setPayments(response.data.data.ava_pagos || []);
      } else {
        throw new Error(
          response?.data?.error || "Error al cargar alquiler mensual."
        );
      }
    } catch (error: any) {
      toast.error("Error", {
        description: error.message || "Error al cargar el alquiler mensual.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (alqmId) {
      fetchRental();
    }
  }, [alqmId]);

  return {
    isLoading,
    selectedMonthlyRent,
    fetchRental,
  };
};

import { useState, useEffect } from "react";
import axios from "axios";
import useDepositStore from "@/lib/zustand/useDepositStore";

export const usePayment = (depoId: string | undefined) => {
  const { selectedDeposit, setSelectedDeposit, setPayments } =
    useDepositStore();
  const [isLoading, setIsLoading] = useState(true);

  const fetchRental = async () => {
    try {
      setIsLoading(true);

      const response = await axios.get(`/api/accounting/deposit/${depoId}`);

      if (response?.data?.success) {
        setSelectedDeposit(response.data.data);
        setPayments(response.data.data.ava_pagos || []);
      } else {
        throw new Error(response?.data?.error || "Error al cargar el deposito");
      }
    } catch (error: any) {
      throw new Error(error.message ? error.message : error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (depoId) {
      fetchRental();
    }
  }, [depoId]);

  return {
    isLoading,
    selectedDeposit,
    fetchRental,
  };
};

import { create } from "zustand";
import { AvaDeposito, AvaPago, AvaAnulacionPago } from "@/lib/types";

interface DepositState {
  selectedDeposit: AvaDeposito | null;
  setSelectedDeposit: (deposit: AvaDeposito | null) => void;

  payments: AvaPago[];
  setPayments: (payments: AvaPago[]) => void;
  addPayment: (payment: AvaPago) => void;
  updatePayment: (updatedPayment: AvaPago) => void;
  deletePayment: (pag_id: string) => void;

  annulments: AvaAnulacionPago[];
  setAnnulments: (annulments: AvaAnulacionPago[]) => void;
  addAnnulment: (annulment: AvaAnulacionPago) => void;
  updateAnnulment: (updatedAnnulment: AvaAnulacionPago) => void;
  deleteAnnulment: (anp_id: string) => void;
}

const useDepositStore = create<DepositState>((set) => ({
  selectedDeposit: null,
  payments: [],
  annulments: [],

  setSelectedDeposit: (deposit) => set({ selectedDeposit: deposit }),

  setPayments: (payments) => set({ payments }),

  addPayment: (payment) =>
    set((state) => ({
      payments: [...state.payments, payment],
    })),

  updatePayment: (updatedPayment) =>
    set((state) => ({
      payments: state.payments.map((payment) =>
        payment.pag_id === updatedPayment.pag_id ? updatedPayment : payment
      ),
    })),

  deletePayment: (pag_id) =>
    set((state) => ({
      payments: state.payments.filter((payment) => payment.pag_id !== pag_id),
    })),

  setAnnulments: (annulments) => set({ annulments }),

  addAnnulment: (annulment) =>
    set((state) => ({
      annulments: [...state.annulments, annulment],
    })),

  updateAnnulment: (updatedAnnulment) =>
    set((state) => ({
      annulments: state.annulments.map((annulment) =>
        annulment.anp_id === updatedAnnulment.anp_id
          ? updatedAnnulment
          : annulment
      ),
    })),

  deleteAnnulment: (anp_id) =>
    set((state) => ({
      annulments: state.annulments.filter(
        (annulment) => annulment.anp_id !== anp_id
      ),
    })),
}));

export default useDepositStore;

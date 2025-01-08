import { create } from "zustand";
import { AvaPago, AvaAnulacionPago } from "@/lib/types";

interface PaymentState {
  selectedMonthlyRentId: string | null;
  payments: AvaPago[];
  setPayments: (payments: AvaPago[]) => void;
  addPayment: (payment: AvaPago) => void;
  updatePayment: (updatedPayment: AvaPago) => void;
  deletePayment: (pag_id: string) => void;

  addAnulacionPago: (pag_id: string, anulacion: AvaAnulacionPago) => void;
  updateAnulacionPago: (pag_id: string, updatedAnulacion: AvaAnulacionPago) => void;
  deleteAnulacionPago: (pag_id: string, anp_id: string) => void;

  selectMonthlyRent: (alqm_id: string | null) => void;
}

const usePaymentStore = create<PaymentState>((set) => ({
  selectedMonthlyRentId: null,
  payments: [],

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

  addAnulacionPago: (pag_id, anulacion) =>
    set((state) => ({
      payments: state.payments.map((payment) =>
        payment.pag_id === pag_id
          ? {
              ...payment,
              ava_anulacionpago: [...(payment.ava_anulacionpago || []), anulacion],
            }
          : payment
      ),
    })),

  updateAnulacionPago: (pag_id, updatedAnulacion) =>
    set((state) => ({
      payments: state.payments.map((payment) =>
        payment.pag_id === pag_id
          ? {
              ...payment,
              ava_anulacionpago: (payment.ava_anulacionpago || []).map((anulacion) =>
                anulacion.anp_id === updatedAnulacion.anp_id ? updatedAnulacion : anulacion
              ),
            }
          : payment
      ),
    })),

  deleteAnulacionPago: (pag_id, anp_id) =>
    set((state) => ({
      payments: state.payments.map((payment) =>
        payment.pag_id === pag_id
          ? {
              ...payment,
              ava_anulacionpago: (payment.ava_anulacionpago || []).filter(
                (anulacion) => anulacion.anp_id !== anp_id
              ),
            }
          : payment
      ),
    })),

  selectMonthlyRent: (alqm_id) => set({ selectedMonthlyRentId: alqm_id }),
}));

export default usePaymentStore;

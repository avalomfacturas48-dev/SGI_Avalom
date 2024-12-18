import { create } from "zustand";
import { AvaAlquiler, AvaAlquilerMensual } from "@/lib/types";

interface RentalState {
  selectedRental: AvaAlquiler | null;
  monthlyRents: AvaAlquilerMensual[];
  isLoading: boolean;

  setSelectedRental: (rental: AvaAlquiler | null) => void;
  setMonthlyRents: (rents: AvaAlquilerMensual[]) => void;

  addMonthlyRent: (rent: AvaAlquilerMensual) => void;
  updateMonthlyRent: (updatedRent: AvaAlquilerMensual) => void;
  deleteMonthlyRent: (alqm_id: string) => { success: boolean; message: string };

  resetRentalState: () => void;
}

const useRentalStore = create<RentalState>((set) => ({
  selectedRental: null,
  monthlyRents: [],
  isLoading: false,

  setSelectedRental: (rental) =>
    set({
      selectedRental: rental,
      monthlyRents: rental?.ava_alquilermensual || [],
    }),

  setMonthlyRents: (rents) => set({ monthlyRents: rents }),

  addMonthlyRent: (rent) =>
    set((state) => ({ monthlyRents: [...state.monthlyRents, rent] })),

  updateMonthlyRent: (updatedRent) =>
    set((state) => ({
      monthlyRents: state.monthlyRents.map((rent) =>
        rent.alqm_id === updatedRent.alqm_id ? updatedRent : rent
      ),
    })),

  deleteMonthlyRent: (alqm_id) => {
    let result = { success: false, message: "" };
    set((state) => {
      const rentToDelete = state.monthlyRents.find(
        (rent) => rent.alqm_id === alqm_id
      );

      if (rentToDelete?.ava_pago?.length) {
        result = {
          success: false,
          message:
            "No se puede eliminar un alquiler mensual con pagos relacionados.",
        };
        return state;
      }

      result = {
        success: true,
        message: "Alquiler mensual eliminado correctamente.",
      };

      return {
        monthlyRents: state.monthlyRents.filter(
          (rent) => rent.alqm_id !== alqm_id
        ),
      };
    });
    return result;
  },

  resetRentalState: () =>
    set({
      selectedRental: null,
      monthlyRents: [],
    }),
}));

export default useRentalStore;

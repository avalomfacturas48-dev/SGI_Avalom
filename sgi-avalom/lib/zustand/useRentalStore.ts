import { create } from "zustand";
import { AvaAlquiler, AvaAlquilerMensual } from "@/lib/types";
import { addMonths, endOfMonth, format, isValid, parseISO } from "date-fns";
import { convertToUTC, safeParseISO } from "@/utils/dateUtils";
import { toDate } from "date-fns-tz";

interface RentalState {
  selectedRental: AvaAlquiler | null;
  monthlyRents: AvaAlquilerMensual[];
  createMonthlyRents: AvaAlquilerMensual[];
  isLoading: boolean;

  setSelectedRental: (rental: AvaAlquiler | null) => void;
  setMonthlyRents: (rents: AvaAlquilerMensual[]) => void;
  setCreateMonthlyRents: (rents: AvaAlquilerMensual[]) => void;

  addMonthlyRent: (rent: AvaAlquilerMensual) => void;
  updateMonthlyRent: (updatedRent: AvaAlquilerMensual) => void;
  deleteMonthlyRent: (alqm_id: string) => { success: boolean; message: string };

  addCreateMonthlyRent: (rent: AvaAlquilerMensual) => void;
  updateCreateMonthlyRent: (updatedRent: AvaAlquilerMensual) => void;
  deleteCreateMonthlyRent: (alqm_id: string) => {
    success: boolean;
    message: string;
  };

  validateRentDates: (
    startDate: string,
    endDate: string,
    alqm_identificador: string
  ) => boolean;
  calculateNextDates: () => { startDate: string; endDate: string };
  validateCreateRentDates: (
    startDate: string,
    endDate: string,
    alqm_identificador: string
  ) => boolean;
  calculateCreateNextDates: () => { startDate: string; endDate: string };

  setLoadingState: (loading: boolean) => void;
  resetRentalState: () => void;
}

const useRentalStore = create<RentalState>((set, get) => ({
  selectedRental: null,
  monthlyRents: [],
  createMonthlyRents: [],
  isLoading: true,

  setSelectedRental: (rental) =>
    set({
      selectedRental: rental,
      monthlyRents: rental?.ava_alquilermensual || [],
    }),

  setMonthlyRents: (rents) => set({ monthlyRents: rents }),

  setCreateMonthlyRents: (rents) => set({ createMonthlyRents: rents }),

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

  addCreateMonthlyRent: (rent) =>
    set((state) => ({
      createMonthlyRents: [...state.createMonthlyRents, rent],
    })),

  updateCreateMonthlyRent: (updatedRent) =>
    set((state) => ({
      createMonthlyRents: state.createMonthlyRents.map((rent) =>
        rent.alqm_id === updatedRent.alqm_id ? updatedRent : rent
      ),
    })),

  deleteCreateMonthlyRent: (alqm_id) => {
    let result = { success: false, message: "" };
    set((state) => {
      const rentToDelete = state.createMonthlyRents.find(
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
        createMonthlyRents: state.createMonthlyRents.filter(
          (rent) => rent.alqm_id !== alqm_id
        ),
      };
    });
    return result;
  },

  validateRentDates: (startDate, endDate, alqm_identificador) => {
    const { monthlyRents } = get();

    // Validar entrada
    if (!startDate || !endDate) {
      console.error("Fechas de entrada están vacías o nulas.", {
        startDate,
        endDate,
      });
      return false;
    }

    // Normalizar y validar fechas ingresadas
    const newStartDate = safeParseISO(convertToUTC(startDate));
    const newEndDate = safeParseISO(convertToUTC(endDate));

    if (!newStartDate || !newEndDate) {
      console.error("Fechas ingresadas no son válidas.", {
        newStartDate,
        newEndDate,
      });
      return false;
    }

    for (const rent of monthlyRents) {
      // Ignorar el alquiler que estamos modificando
      if (rent.alqm_identificador === alqm_identificador) {
        continue;
      }
      // Validar y normalizar fechas de alquiler existente
      const rentStartDate = safeParseISO(rent.alqm_fechainicio);
      const rentEndDate = safeParseISO(rent.alqm_fechafin);
      console.log("rentStartDate", rentStartDate);
      console.log("rentEndDate", rentEndDate);
      console.log("newStartDate", newStartDate);
      console.log("newEndDate", newEndDate);

      if (!rentStartDate || !rentEndDate) {
        console.error(
          `Fechas inválidas en el alquiler ${rent.alqm_identificador}:`,
          { rentStartDate, rentEndDate }
        );
        continue; // Ignorar alquiler con fechas inválidas
      }

      // Comparar rangos
      if (
        (newStartDate >= rentStartDate && newStartDate < rentEndDate) || // Inicio dentro del rango
        (newEndDate > rentStartDate && newEndDate <= rentEndDate) || // Fin dentro del rango
        (newStartDate <= rentStartDate && newEndDate >= rentEndDate) // Engloba el rango
      ) {
        console.error(
          `Conflicto detectado con el alquiler ${rent.alqm_identificador}.`
        );
        return false;
      }
    }

    return true;
  },

  calculateNextDates: () => {
    const { monthlyRents } = get();

    if (monthlyRents.length === 0) {
      const todayUTC = new Date();

      const todayCR = toDate(todayUTC, { timeZone: "America/Costa_Rica" });
      const endOfNextMonthCR = toDate(endOfMonth(addMonths(todayCR, 1)), {
        timeZone: "America/Costa_Rica",
      });

      return {
        startDate: format(todayCR, "yyyy-MM-dd"),
        endDate: format(endOfNextMonthCR, "yyyy-MM-dd"),
      };
    }

    const lastRent = monthlyRents[monthlyRents.length - 1];
    const lastEndDateUTC = safeParseISO(lastRent.alqm_fechafin);

    if (!lastEndDateUTC) {
      console.error(
        `Error al procesar la última fecha de fin del alquiler (${lastRent.alqm_fechafin}).`
      );
      const todayUTC = new Date();
      return {
        startDate: format(todayUTC, "yyyy-MM-dd"),
        endDate: format(endOfMonth(addMonths(todayUTC, 1)), "yyyy-MM-dd"),
      };
    }

    // Convertir última fecha al horario de Costa Rica
    const lastEndDateCR = toDate(lastEndDateUTC, {
      timeZone: "America/Costa_Rica",
    });

    // Obtener el día exacto del primer alquiler mensual
    const firstRent = monthlyRents[0];
    const firstStartDateUTC = safeParseISO(firstRent.alqm_fechainicio);
    const firstStartDateCR = firstStartDateUTC
      ? toDate(firstStartDateUTC, { timeZone: "America/Costa_Rica" })
      : new Date();
    const dayOfMonth = firstStartDateCR.getDate();

    // La fecha de inicio del nuevo alquiler es la misma que la fecha final del último alquiler
    const nextStartDateCR = lastEndDateCR;

    // Calcular la fecha de fin del nuevo alquiler respetando el día inicial del primer alquiler
    const potentialEndDateCR = addMonths(nextStartDateCR, 1);
    let nextEndDateCR: Date;

    if (potentialEndDateCR.getDate() < dayOfMonth) {
      // Si el mes siguiente no tiene el mismo día, tomar el último día del mes
      nextEndDateCR = toDate(endOfMonth(potentialEndDateCR), {
        timeZone: "America/Costa_Rica",
      });
    } else {
      // Si el mes tiene el día exacto, usarlo
      nextEndDateCR = new Date(
        potentialEndDateCR.getFullYear(),
        potentialEndDateCR.getMonth(),
        dayOfMonth
      );
    }

    // Convertir a UTC para guardar en la base de datos
    return {
      startDate: convertToUTC(nextStartDateCR.toISOString()),
      endDate: convertToUTC(nextEndDateCR.toISOString()),
    };
  },

  validateCreateRentDates: (startDate, endDate, alqm_identificador) => {
    const { createMonthlyRents } = get();

    // Validar entrada
    if (!startDate || !endDate) {
      console.error("Fechas de entrada están vacías o nulas.", {
        startDate,
        endDate,
      });
      return false;
    }

    // Normalizar y validar fechas ingresadas
    const newStartDate = safeParseISO(convertToUTC(startDate));
    const newEndDate = safeParseISO(convertToUTC(endDate));

    if (!newStartDate || !newEndDate) {
      console.error("Fechas ingresadas no son válidas.", {
        newStartDate,
        newEndDate,
      });
      return false;
    }

    for (const rent of createMonthlyRents) {
      if (rent.alqm_identificador === alqm_identificador) {
        continue; // Ignorar el alquiler con el alqm_id especificado
      }
      // Validar y normalizar fechas de alquiler existente
      const rentStartDate = safeParseISO(rent.alqm_fechainicio);
      const rentEndDate = safeParseISO(rent.alqm_fechafin);

      if (!rentStartDate || !rentEndDate) {
        console.error(
          `Fechas inválidas en el alquiler ${rent.alqm_identificador}:`,
          { rentStartDate, rentEndDate }
        );
        continue; // Ignorar alquiler con fechas inválidas
      }

      // Comparar rangos
      if (
        (newStartDate >= rentStartDate && newStartDate < rentEndDate) || // Inicio dentro del rango
        (newEndDate > rentStartDate && newEndDate <= rentEndDate) || // Fin dentro del rango
        (newStartDate <= rentStartDate && newEndDate >= rentEndDate) // Engloba el rango
      ) {
        console.error(
          `Conflicto detectado con el alquiler ${rent.alqm_identificador}.`
        );
        return false;
      }
    }

    return true;
  },

  calculateCreateNextDates: () => {
    const { createMonthlyRents } = get();

    if (createMonthlyRents.length === 0) {
      const todayUTC = new Date();

      const todayCR = toDate(todayUTC, { timeZone: "America/Costa_Rica" });
      const endOfNextMonthCR = toDate(endOfMonth(addMonths(todayCR, 1)), {
        timeZone: "America/Costa_Rica",
      });

      return {
        startDate: format(todayCR, "yyyy-MM-dd"),
        endDate: format(endOfNextMonthCR, "yyyy-MM-dd"),
      };
    }

    const lastRent = createMonthlyRents[createMonthlyRents.length - 1];
    const lastEndDateUTC = safeParseISO(lastRent.alqm_fechafin);

    if (!lastEndDateUTC) {
      console.error(
        `Error al procesar la última fecha de fin del alquiler (${lastRent.alqm_fechafin}).`
      );
      const todayUTC = new Date();
      return {
        startDate: format(todayUTC, "yyyy-MM-dd"),
        endDate: format(endOfMonth(addMonths(todayUTC, 1)), "yyyy-MM-dd"),
      };
    }

    // Convertir última fecha al horario de Costa Rica
    const lastEndDateCR = toDate(lastEndDateUTC, {
      timeZone: "America/Costa_Rica",
    });

    // Obtener el día exacto del primer alquiler mensual
    const firstRent = createMonthlyRents[0];
    const firstStartDateUTC = safeParseISO(firstRent.alqm_fechainicio);
    const firstStartDateCR = firstStartDateUTC
      ? toDate(firstStartDateUTC, { timeZone: "America/Costa_Rica" })
      : new Date();
    const dayOfMonth = firstStartDateCR.getDate();

    // La fecha de inicio del nuevo alquiler es la misma que la fecha final del último alquiler
    const nextStartDateCR = lastEndDateCR;

    // Calcular la fecha de fin del nuevo alquiler respetando el día inicial del primer alquiler
    const potentialEndDateCR = addMonths(nextStartDateCR, 1);
    let nextEndDateCR: Date;

    if (potentialEndDateCR.getDate() < dayOfMonth) {
      // Si el mes siguiente no tiene el mismo día, tomar el último día del mes
      nextEndDateCR = toDate(endOfMonth(potentialEndDateCR), {
        timeZone: "America/Costa_Rica",
      });
    } else {
      // Si el mes tiene el día exacto, usarlo
      nextEndDateCR = new Date(
        potentialEndDateCR.getFullYear(),
        potentialEndDateCR.getMonth(),
        dayOfMonth
      );
    }

    // Convertir a UTC para guardar en la base de datos
    return {
      startDate: convertToUTC(nextStartDateCR.toISOString()),
      endDate: convertToUTC(nextEndDateCR.toISOString()),
    };
  },

  setLoadingState: (loading) => set({ isLoading: loading }),

  resetRentalState: () =>
    set({
      selectedRental: null,
      monthlyRents: [],
      createMonthlyRents: [],
    }),
}));

export default useRentalStore;

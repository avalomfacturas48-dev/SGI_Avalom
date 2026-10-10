import { create } from "zustand";
import axios from "axios";
import { AvaTipoPropiedad } from "@/lib/types";

interface TypeStore {
  types: AvaTipoPropiedad[];
  setTypes: (types: AvaTipoPropiedad[]) => void;
  fetchTypes: () => Promise<void>;
}

const useTypeStore = create<TypeStore>((set) => ({
  types: [],
  setTypes: (types) => set({ types }),
  fetchTypes: async () => {
    try {
      const headers = {
        "Content-Type": "application/json",
      };
      const response = await axios.get("/api/propertytypes", { headers });
      set({ types: response.data.data });
    } catch (error) {
      console.error("Error al obtener tipos de propiedad:", error);
    }
  },
}));

export default useTypeStore;

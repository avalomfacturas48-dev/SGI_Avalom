import { create } from "zustand";
import axios from "axios";
import { AvaTipoPropiedad } from "@/lib/types";
import cookie from "js-cookie";

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
      const token = cookie.get("token");
      if (!token) {
        throw new Error("No hay token disponible");
      }
      const headers = {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      };
      const response = await axios.get("/api/propertytypes", { headers });
      set({ types: response.data });
    } catch (error) {
      console.error("Error al obtener tipos de propiedad:", error);
    }
  },
}));

export default useTypeStore;

import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import axios from "axios";
import React from "react";

jest.mock("axios");

const pushMock = jest.fn();
jest.mock("next/navigation", () => ({
  useRouter: () => ({ push: pushMock }),
}));

// Rol del usuario en sesión (lo entrega UserContext desde /api/me)
let currentRole = "J";
jest.mock("@/lib/UserContext", () => ({
  useUser: () => ({ user: { usu_rol: currentRole }, loaded: true }),
}));

const setRentalsMock = jest.fn();
jest.mock("@/lib/zustand/rentalStore", () => ({
  __esModule: true,
  default: () => ({
    rentals: [{ alq_id: "7", alq_estado: "A" }],
    setRentals: setRentalsMock,
  }),
}));

// La tabla simulada expone la fila para probar el clic
jest.mock("@/components/mantRent/data_table_filter", () => ({
  DataTable: ({ data, onRowClick }: any) => (
    <div data-testid="datatable">
      DataTable con {data?.length ?? 0} filas
      <button onClick={() => onRowClick?.(data[0])}>fila</button>
    </div>
  ),
}));

import BodyRent from "@/components/mantRent/bodyRent";

describe("BodyRent", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    currentRole = "J";
    (axios.get as jest.Mock).mockResolvedValue({
      data: { data: [{ alq_id: "7", alq_estado: "A" }] },
    });
  });

  it("muestra título y breadcrumbs", () => {
    render(<BodyRent />);
    expect(screen.getByText("Gestión de Alquileres")).toBeInTheDocument();
    expect(screen.getByText("Inicio")).toBeInTheDocument();
  });

  it("realiza fetch de alquileres y muestra DataTable", async () => {
    render(<BodyRent />);
    await waitFor(() => {
      expect(screen.getByTestId("datatable")).toHaveTextContent("DataTable con 1 filas");
    });

    expect(setRentalsMock).toHaveBeenCalledWith([{ alq_id: "7", alq_estado: "A" }]);
    expect(axios.get).toHaveBeenCalled();
  });

  it("clic en la fila lleva a editar si el rol puede editar (J/E)", async () => {
    render(<BodyRent />);
    fireEvent.click(await screen.findByText("fila"));
    expect(pushMock).toHaveBeenCalledWith("/mantRent/edit/7");
  });

  it("clic en la fila lleva a contabilidad si el rol no puede editar", async () => {
    currentRole = "A";
    render(<BodyRent />);
    fireEvent.click(await screen.findByText("fila"));
    expect(pushMock).toHaveBeenCalledWith("/accounting/payments/7");
  });
});

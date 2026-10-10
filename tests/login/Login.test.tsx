import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import Login from "@/components/login/login";

const mockPush = jest.fn();
const mockSetUser = jest.fn();
const mockCookieSet = jest.fn();

jest.mock("next/navigation", () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}));

jest.mock("js-cookie", () => ({
  set: (...args: any[]) => mockCookieSet(...args),
}));

jest.mock("@/lib/UserContext", () => ({
  useUser: () => ({
    user: null,
    loaded: true,
    setUser: mockSetUser,
  }),
}));

describe("Login component", () => {
  beforeEach(() => {
    global.fetch = jest.fn();
    mockPush.mockReset();
    mockSetUser.mockReset();
    mockCookieSet.mockReset();
  });

  it("renderiza los campos de email y password", () => {
    render(<Login />);

    expect(screen.getByLabelText(/Correo electrónico/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Contraseña/i)).toBeInTheDocument();
  });

  it("envía el formulario y muestra error si la respuesta falla", async () => {
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      json: async () => ({ error: "Credenciales incorrectas" }),
    });

    render(<Login />);

    fireEvent.change(screen.getByLabelText(/Correo electrónico/i), {
      target: { value: "test@correo.com" },
    });
    fireEvent.change(screen.getByLabelText(/Contraseña/i), {
      target: { value: "123456" },
    });

    fireEvent.submit(screen.getByRole("button", { name: /iniciar sesión/i }));

    await waitFor(() =>
      expect(screen.getByText(/Credenciales incorrectas/i)).toBeInTheDocument()
    );
  });

  it("realiza el login correctamente y redirige al home", async () => {
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      // El servidor ya no devuelve el token: lo deja en una cookie httpOnly
      json: async () => ({
        user: { id: 1, name: "Juan Tester", email: "test@correo.com" },
      }),
    });

    render(<Login />);

    fireEvent.change(screen.getByLabelText(/Correo electrónico/i), {
      target: { value: "test@correo.com" },
    });
    fireEvent.change(screen.getByLabelText(/Contraseña/i), {
      target: { value: "123456" },
    });

    fireEvent.submit(screen.getByRole("button", { name: /iniciar sesión/i }));

    await waitFor(() => {
      expect(mockSetUser).toHaveBeenCalledWith({
        id: 1,
        name: "Juan Tester",
        email: "test@correo.com",
      });
      // El navegador no debe crear ni manejar la cookie de sesión
      expect(mockCookieSet).not.toHaveBeenCalled();
      expect(mockPush).toHaveBeenCalledWith("/homePage");
    });
  });
});

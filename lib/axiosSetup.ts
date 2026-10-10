import axios from "axios";

let registered = false;

/**
 * Interceptor global de axios (se registra una sola vez, desde UserProvider):
 * - Usa el mensaje del servidor como `error.message`, para que los `catch`
 *   muestren "El monto supera el saldo pendiente…" y no "Request failed with…".
 * - Ante un 401 (sesión vencida o inválida) vuelve al login.
 */
export function setupAxiosInterceptors() {
  if (registered || typeof window === "undefined") return;
  registered = true;

  axios.interceptors.response.use(
    (response) => response,
    (error) => {
      const serverMessage = error?.response?.data?.error;
      if (typeof serverMessage === "string" && serverMessage) {
        error.message = serverMessage;
      }

      if (error?.response?.status === 401 && window.location.pathname !== "/") {
        window.location.href = "/";
      }

      return Promise.reject(error);
    }
  );
}

"use client";
import { useRouter } from "next/navigation";
import { useEffect, ReactNode } from "react";
import { useUser } from "@/lib/UserContext";

interface AuthRouteProps {
  children: ReactNode;
  allowedRoles: string[]; // Roles permitidos para esta ruta
}

// La sesión la valida middleware.ts en el servidor; aquí solo se decide si el
// rol del usuario (leído de /api/me) puede ver la pantalla.
const AuthRoute: React.FC<AuthRouteProps> = ({ children, allowedRoles }) => {
  const router = useRouter();
  const { user, loaded } = useUser();

  useEffect(() => {
    if (!loaded) return;

    if (!user) {
      router.push("/");
      return;
    }

    if (!allowedRoles.includes(user.usu_rol)) {
      router.push("/unauthorized");
    }
  }, [router, allowedRoles, user, loaded]);

  if (!loaded || !user || !allowedRoles.includes(user.usu_rol)) return null;

  return <>{children}</>;
};

export default AuthRoute;

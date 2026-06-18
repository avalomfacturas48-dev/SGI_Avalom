"use client";
import { useRouter } from "next/navigation";
import { useEffect, ReactNode } from "react";
import cookie from "js-cookie";
import jwt from "jsonwebtoken";
import { useUser } from "@/lib/UserContext";

interface AuthRouteProps {
  children: ReactNode;
  allowedRoles: string[]; // Roles permitidos para esta ruta
}

interface DecodedToken {
  id: string;
  role: string;
}

const AuthRoute: React.FC<AuthRouteProps> = ({ children, allowedRoles }) => {
  const router = useRouter();
  const { user, loaded } = useUser();

  useEffect(() => {
    if (!loaded) return;

    const token = cookie.get("token");
    if (!token) {
      router.push("/");
      return;
    }

    try {
      const decoded = jwt.decode(token) as DecodedToken;
      const userRole = user?.usu_rol || decoded?.role;

      if (!userRole) {
        router.push("/");
        return;
      }

      if (!allowedRoles.includes(userRole)) {
        router.push("/unauthorized");
      }
    } catch {
      router.push("/");
    }
  }, [router, allowedRoles, user, loaded]);

  return <>{children}</>;
};

export default AuthRoute;

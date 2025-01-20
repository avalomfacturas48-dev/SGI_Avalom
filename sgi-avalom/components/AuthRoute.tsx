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
  const { user } = useUser();

  useEffect(() => {
    const token = cookie.get("token");
    if (!token) {
      console.warn("No token found. Redirecting to login.");
      router.push("/");
      return;
    }

    try {
      const decoded = jwt.decode(token) as DecodedToken;
      const userRole = user?.usu_rol || decoded?.role;

      if (!userRole) {
        console.error("User role is missing. Redirecting to login.");
        router.push("/");
        return;
      }

      if (!allowedRoles.includes(userRole)) {
        console.warn(
          `Role ${userRole} is not allowed. Redirecting to unauthorized.`
        );
        router.push("/unauthorized");
      }
    } catch (error) {
      console.error("Error decoding the token:", error);
      router.push("/");
    }
  }, [router, allowedRoles, user]);

  return <>{children}</>;
};

export default AuthRoute;

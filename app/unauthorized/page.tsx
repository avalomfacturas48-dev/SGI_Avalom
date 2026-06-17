"use client";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

const Unauthorized: React.FC = () => {
  const router = useRouter();

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background">
      <h1 className="text-3xl font-bold text-red-600 mb-4">Acceso Denegado</h1>
      <p className="text-gray-400 mb-8">
        No tienes permiso para acceder a esta página.
      </p>
      <Button variant="default" onClick={() => router.push("/homePage")}>Volver al Inicio</Button>
    </div>
  );
};

export default Unauthorized;

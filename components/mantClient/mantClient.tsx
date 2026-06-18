"use client";
import AuthRoute from "../AuthRoute";
import { AppShell } from "@/components/AppShell";
import BodyMantClient from "./bodyMantClient";

const MantClient: React.FC = () => {
  return (
    <AuthRoute allowedRoles={["A", "J", "E"]}>
      <AppShell>
        <BodyMantClient />
      </AppShell>
    </AuthRoute>
  );
};

export default MantClient;

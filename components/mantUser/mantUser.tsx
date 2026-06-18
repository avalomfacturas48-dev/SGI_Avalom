"use client";
import AuthRoute from "../AuthRoute";
import { AppShell } from "@/components/AppShell";
import BodyMantUser from "./bodyMantUser";

const MantUser: React.FC = () => {
  return (
    <AuthRoute allowedRoles={["A", "J", "E"]}>
      <AppShell>
        <BodyMantUser />
      </AppShell>
    </AuthRoute>
  );
};

export default MantUser;

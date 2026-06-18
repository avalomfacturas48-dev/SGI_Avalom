"use client";

import AuthRoute from "@/components/AuthRoute";
import { AppShell } from "@/components/AppShell";
import BodyContract from "./bodyContract";

const Contract: React.FC = () => {
  return (
    <AuthRoute allowedRoles={["J", "E"]}>
      <AppShell>
        <BodyContract />
      </AppShell>
    </AuthRoute>
  );
};

export default Contract;

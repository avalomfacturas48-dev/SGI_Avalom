"use client";
import AuthRoute from "../AuthRoute";
import type React from "react";
import { AppShell } from "@/components/AppShell";
import BodyReports from "./bodyReports";

const Reports: React.FC = () => {
  return (
    <AuthRoute allowedRoles={["A", "J", "E", "R"]}>
      <AppShell>
        <BodyReports />
      </AppShell>
    </AuthRoute>
  );
};

export default Reports;


"use Client";
import AuthRoute from "../AuthRoute";
import { AppShell } from "@/components/AppShell";
import BodyExpenses from "./bodyExpenses";

const Expenses: React.FC = () => {
  return (
    <AuthRoute allowedRoles={["A", "J", "E", "R"]}>
      <AppShell>
        <BodyExpenses />
      </AppShell>
    </AuthRoute>
  );
};

export default Expenses;


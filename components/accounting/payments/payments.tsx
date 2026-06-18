"use Client";
import AuthRoute from "../../AuthRoute";
import { AppShell } from "@/components/AppShell";
import BodyPayments from "./bodyPayments";

const Payments: React.FC = () => {
  return (
    <AuthRoute allowedRoles={["A", "J", "E", "R"]}>
      <AppShell>
        <BodyPayments />
      </AppShell>
    </AuthRoute>
  );
};

export default Payments;

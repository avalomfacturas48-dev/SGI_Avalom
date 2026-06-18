"use Client";
import AuthRoute from "../../../../AuthRoute";
import { AppShell } from "@/components/AppShell";
import BodyPayment from "./bodyPayment";

const Payment: React.FC = () => {
  return (
    <AuthRoute allowedRoles={["J", "E"]}>
      <AppShell>
        <BodyPayment />
      </AppShell>
    </AuthRoute>
  );
};

export default Payment;

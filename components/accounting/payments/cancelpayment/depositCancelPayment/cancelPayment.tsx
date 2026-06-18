"use Client";
import AuthRoute from "../../../../AuthRoute";
import { AppShell } from "@/components/AppShell";
import BodyCancelPayment from "./bodyCancelPayment";

const CancelPayment: React.FC = () => {
  return (
    <AuthRoute allowedRoles={["J", "E"]}>
      <AppShell>
        <BodyCancelPayment />
      </AppShell>
    </AuthRoute>
  );
};

export default CancelPayment;

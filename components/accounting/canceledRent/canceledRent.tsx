"use Client";
import AuthRoute from "../../AuthRoute";
import { AppShell } from "@/components/AppShell";
import BodyCanceledRent from "./bodyCanceledRent";

const CanceledRent: React.FC = () => {
  return (
    <AuthRoute allowedRoles={["A", "J", "E"]}>
      <AppShell>
        <BodyCanceledRent />
      </AppShell>
    </AuthRoute>
  );
};

export default CanceledRent;

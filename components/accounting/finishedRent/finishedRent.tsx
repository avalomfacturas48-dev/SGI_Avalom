"use Client";
import AuthRoute from "../../AuthRoute";
import { AppShell } from "@/components/AppShell";
import BodyFinishedRent from "./bodyFinishedRent";

const CanceledRent: React.FC = () => {
  return (
    <AuthRoute allowedRoles={["A", "J", "E"]}>
      <AppShell>
        <BodyFinishedRent />
      </AppShell>
    </AuthRoute>
  );
};

export default CanceledRent;

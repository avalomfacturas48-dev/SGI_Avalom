"use Client";
import AuthRoute from "../AuthRoute";
import { AppShell } from "@/components/AppShell";
import BodyAccounting from "./bodyAccounting";

const Accounting: React.FC = () => {
  return (
    <AuthRoute allowedRoles={["A", "J", "E", "R"]}>
      <AppShell>
        <BodyAccounting />
      </AppShell>
    </AuthRoute>
  );
};

export default Accounting;

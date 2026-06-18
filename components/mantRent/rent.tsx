"use Client";
import AuthRoute from "../AuthRoute";
import { AppShell } from "@/components/AppShell";
import BodyRent from "./bodyRent";

const Rent: React.FC = () => {
  return (
    <AuthRoute allowedRoles={["A", "J", "E"]}>
      <AppShell>
        <BodyRent />
      </AppShell>
    </AuthRoute>
  );
};

export default Rent;

"use Client";
import AuthRoute from "../../AuthRoute";
import { AppShell } from "@/components/AppShell";
import BodyEditRent from "./bodyEditRent";

const Rent: React.FC = () => {
  return (
    <AuthRoute allowedRoles={["J", "E"]}>
      <AppShell>
        <BodyEditRent />
      </AppShell>
    </AuthRoute>
  );
};

export default Rent;

import AuthRoute from "@/components/AuthRoute";
import { AppShell } from "@/components/AppShell";
import { BodyNewRent } from "./bodyNewRent";

const NewRent: React.FC = () => {
  return (
    <AuthRoute allowedRoles={["A", "J", "E"]}>
      <AppShell>
        <BodyNewRent />
      </AppShell>
    </AuthRoute>
  );
};

export default NewRent;

"use Client";
import AuthRoute from "../AuthRoute";
import { AppShell } from "@/components/AppShell";
import BodyMantBuild from "./bodyMantBuild";

const MantBuild: React.FC = () => {
  return (
    <AuthRoute allowedRoles={["A", "J", "E"]}>
      <AppShell>
        <BodyMantBuild />
      </AppShell>
    </AuthRoute>
  );
};

export default MantBuild;

import AuthRoute from "../AuthRoute";
import BodyHomePage from "./bodyHomePage";
import { AppShell } from "@/components/AppShell";

const HomePage: React.FC = () => {
  return (
    <AuthRoute allowedRoles={["A", "J", "E", "R"]}>
      <AppShell>
        <BodyHomePage />
      </AppShell>
    </AuthRoute>
  );
};

export default HomePage;

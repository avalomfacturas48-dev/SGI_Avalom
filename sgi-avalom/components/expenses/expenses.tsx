"use Client";
import AuthRoute from "../AuthRoute";
import SideNavbar from "../SideNavbar";
import BodyExpenses from "./bodyExpenses";

const Expenses: React.FC = () => {
  return (
    <AuthRoute allowedRoles={["A", "J", "E", "R"]}>
      <div className="flex min-h-screen bg-background">
        <SideNavbar />
        <main className="flex-1 pl-14 md:pl-16">
          <BodyExpenses />
        </main>
      </div>
    </AuthRoute>
  );
};

export default Expenses;


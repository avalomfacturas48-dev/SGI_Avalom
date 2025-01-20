"use Client";
import AuthRoute from "../AuthRoute";
import SideNavbar from "../SideNavbar";
import BodyRent from "./bodyRent";

const Rent: React.FC = () => {
  return (
    <AuthRoute allowedRoles={["A", "J", "E"]}>
      <div className="flex min-h-screen bg-background">
        <SideNavbar />
        <main className="flex-1 pl-14 md:pl-16">
          <BodyRent />
        </main>
      </div>
    </AuthRoute>
  );
};

export default Rent;

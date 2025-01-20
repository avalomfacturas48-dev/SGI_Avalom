"use Client";
import AuthRoute from "../../../AuthRoute";
import SideNavbar from "../../../SideNavbar";
import BodyCancelPayment from "./bodyCancelPayment";

const CancelPayment: React.FC = () => {
  return (
    <AuthRoute allowedRoles={["J", "E"]}>
      <div className="flex min-h-screen bg-background">
        <SideNavbar />
        <main className="flex-1 pl-14 md:pl-16">
          <BodyCancelPayment />
        </main>
      </div>
    </AuthRoute>
  );
};

export default CancelPayment;

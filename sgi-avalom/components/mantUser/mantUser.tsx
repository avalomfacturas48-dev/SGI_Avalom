"use client";
import AuthRoute from "../AuthRoute";
import SideNavbar from "../SideNavbar";
import BodyMantUser from "./bodyMantUser";

const MantUser: React.FC = () => {
  return (
    <AuthRoute allowedRoles={["A", "J", "E"]}>
      <div className="flex min-h-screen bg-background">
        <SideNavbar />
        <main className="flex-1 pl-14 md:pl-16">
          <BodyMantUser />
        </main>
      </div>
    </AuthRoute>
  );
};

export default MantUser;

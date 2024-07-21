"use Client";
import AuthRoute from "../AuthRoute";
import SideNavbar from "../SideNavbar";
import BodyMantBuild from "./bodyMantBuild";

const MantBuild: React.FC = () => {
  return (
    <AuthRoute>
      <div className="flex w-full">
        <SideNavbar />
        <BodyMantBuild />
      </div>
    </AuthRoute>
  );
};

export default MantBuild;

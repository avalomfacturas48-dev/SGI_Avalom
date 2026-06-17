"use client";
import AuthRoute from "../AuthRoute";
import type React from "react";

import SideNavbar from "../SideNavbar";
import BodyReports from "./bodyReports";

const Reports: React.FC = () => {
  return (
    <AuthRoute allowedRoles={["A", "J", "E", "R"]}>
      <div className="flex min-h-screen bg-background">
        <SideNavbar />
        <main className="flex-1 pl-14 md:pl-16">
          <BodyReports />
        </main>
      </div>
    </AuthRoute>
  );
};

export default Reports;


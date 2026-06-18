import AuthRoute from "@/components/AuthRoute";
import { AppShell } from "@/components/AppShell";

export default function MantBuildLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthRoute allowedRoles={["A", "J", "E"]}>
      <AppShell>{children}</AppShell>
    </AuthRoute>
  );
}

import { AuthGuard } from "@/src/components/auth/AuthGuard";
import { DashboardLayout as DashboardShell } from "@/src/components/layout/DashboardLayout";

export default function DashboardLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <AuthGuard>
      <DashboardShell>{children}</DashboardShell>
    </AuthGuard>
  );
}

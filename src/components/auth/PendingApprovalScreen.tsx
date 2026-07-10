"use client";

import { Clock, LogOut } from "lucide-react";
import { useAuth } from "@/src/hooks/useAuth";
import { useTenants } from "@/src/hooks/data/useTenants";
import { useThemeCustomization } from "@/src/hooks/useThemeCustomization";
import { Button } from "@/src/components/ui/inputs/Button";

/**
 * Full-screen holding page for a tenant whose status is `pending_approval` —
 * the Owner signed in successfully (a real session exists) but every
 * tenant-scoped endpoint is blocked server-side (TenantContextInterceptor)
 * until a SUPER_ADMIN approves the tenant. Polling happens via useAuth's
 * `/auth/me` query (see AuthGuard), which is set to refetch every 30s while
 * this screen is mounted, so approval takes effect without a manual reload.
 */
export function PendingApprovalScreen() {
  const { logout } = useAuth();
  const { currentTenant } = useTenants();
  const { getSectionStyle } = useThemeCustomization();

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4" style={getSectionStyle("contentBg")}>
      <div className="w-full max-w-md rounded-2xl border border-(--custom-table-border) bg-(--custom-table-bg) p-8 text-center">
        <div className="w-12 h-12 rounded-full bg-info/10 border border-info/20 flex items-center justify-center mx-auto mb-5">
          <Clock size={20} className="text-info-400" />
        </div>
        <h1 className="text-lg font-bold text-foreground">Your tenant is pending approval</h1>
        <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
          Thanks for connecting {currentTenant?.name ?? "your organization"} to NexusOne. A platform administrator needs to
          review and approve your tenant before you can get started we'll let you in automatically the moment that happens.
        </p>
        <Button variant="outline" size="sm" leftIcon={<LogOut size={13} />} onClick={logout} className="mt-6">
          Sign out
        </Button>
      </div>
    </div>
  );
}

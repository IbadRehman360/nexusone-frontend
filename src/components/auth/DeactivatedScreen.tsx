"use client";

import { Ban, LogOut } from "lucide-react";
import { useAuth } from "@/src/hooks/useAuth";
import { useTenants } from "@/src/hooks/data/useTenants";
import { useThemeCustomization } from "@/src/hooks/useThemeCustomization";
import { Button } from "@/src/components/ui/inputs/Button";

/**
 * Full-screen holding page for a tenant whose status is `deactivated` — a
 * platform administrator turned off access (see backoffice's "Deactivate
 * tenant" action). The Owner/member signed in successfully (a real session
 * exists) but every tenant-scoped endpoint is blocked server-side
 * (TenantContextInterceptor) until a SUPER_ADMIN reactivates the tenant.
 * Mirrors PendingApprovalScreen's shape exactly — same holding-page pattern,
 * different reason and no auto-poll (reactivation is a deliberate staff
 * action, not something expected to resolve itself within seconds the way
 * an approval queue might).
 */
export function DeactivatedScreen() {
  const { logout } = useAuth();
  const { currentTenant } = useTenants();
  const { getSectionStyle } = useThemeCustomization();

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4" style={getSectionStyle("contentBg")}>
      <div className="w-full max-w-md rounded-2xl border border-(--custom-table-border) bg-(--custom-table-bg) p-8 text-center">
        <div className="w-12 h-12 rounded-full bg-error/10 border border-error/20 flex items-center justify-center mx-auto mb-5">
          <Ban size={20} className="text-error-400" />
        </div>
        <h1 className="text-lg font-bold text-foreground">Access deactivated</h1>
        <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
          {currentTenant?.name ?? "Your organization"}'s access to NexusOne has been deactivated by a platform
          administrator. If you believe this is a mistake, please contact NexusOne support.
        </p>
        <Button variant="outline" size="sm" leftIcon={<LogOut size={13} />} onClick={logout} className="mt-6">
          Sign out
        </Button>
      </div>
    </div>
  );
}

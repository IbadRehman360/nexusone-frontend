import Link from "next/link";
import { useAuth } from "@/src/hooks/useAuth";
import { useTenants } from "@/src/hooks/data/useTenants";

function getGreeting(): string {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

export function HomeHeader() {
  const { user } = useAuth();
  const { currentTenant } = useTenants();
  const firstName = user?.fullName?.split(" ")[0] ?? user?.email?.split("@")[0];

  return (
    <div className="flex items-center justify-between gap-4">
      <div>
        <h1 className="text-[20px] font-bold text-foreground tracking-tight">
          {getGreeting()}{firstName ? `, ${firstName}` : ""}.
        </h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          {currentTenant?.name ?? "Your tenant"} — jump into detailed overviews for{" "}
          <Link href="/dashboard/power-platform" className="text-info-400 hover:underline">Power Platform</Link>
          {", "}
          <Link href="/dashboard/entra-id" className="text-[rgb(var(--secondary))] hover:underline">Entra ID</Link>
          {", and "}
          <Link href="/dashboard/purview" className="text-success-400 hover:underline">Purview</Link>.
        </p>
      </div>
    </div>
  );
}

import { Badge } from "@/src/components/ui/display/Badge";

const ROLE_VARIANT: Record<string, "info" | "purple" | "success" | "warning" | "neutral"> = {
  Owner: "info",
  Admin: "purple",
  "PP Admin": "purple",
  "Entra Admin": "purple",
  Member: "success",
  Viewer: "neutral",
};

export function RoleBadge({ role }: { role: string }) {
  const variant = ROLE_VARIANT[role] ?? "neutral";
  return (
    <Badge variant={variant}>
      <span className="w-1.5 h-1.5 rounded-full mr-1.5 shrink-0 bg-current opacity-70" />
      {role}
    </Badge>
  );
}

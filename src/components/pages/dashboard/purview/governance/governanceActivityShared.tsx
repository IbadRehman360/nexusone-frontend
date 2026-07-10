import { Badge } from "@/src/components/ui/display/Badge";
import type { GovernanceActivity } from "@/src/types/purview";

export interface ActorGroup {
  actor: string;
  rows: GovernanceActivity[];
  latestTs: string;
}

export function groupByActor(rows: GovernanceActivity[]): ActorGroup[] {
  const groups = new Map<string, GovernanceActivity[]>();
  for (const row of rows) {
    const actor = row.identity || "Unknown";
    if (!groups.has(actor)) groups.set(actor, []);
    groups.get(actor)!.push(row);
  }

  return [...groups.entries()]
    .map(([actor, actorRows]) => ({
      actor,
      rows: actorRows,
      latestTs: actorRows.reduce((latest, r) => (r.timestamp > latest ? r.timestamp : latest), actorRows[0]?.timestamp ?? ""),
    }))
    .sort((a, b) => (b.latestTs > a.latestTs ? 1 : -1));
}

export function ResultBadge({ result }: { result: string }) {
  const lower = result.toLowerCase();
  if (lower.includes("success") || lower.includes("succeeded") || lower.includes("completed") || lower === "0") {
    return <Badge variant="success">{result}</Badge>;
  }
  if (lower.includes("running") || lower.includes("inprogress")) {
    return <Badge variant="info">{result}</Badge>;
  }
  if (lower.includes("queued") || lower.includes("pending")) {
    return <Badge variant="warning">{result}</Badge>;
  }
  if (lower.includes("fail") || lower.includes("error")) {
    return <Badge variant="error">{result}</Badge>;
  }
  return <Badge variant="neutral">{result || "—"}</Badge>;
}

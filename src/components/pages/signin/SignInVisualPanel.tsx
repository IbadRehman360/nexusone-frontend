import { Users, LayoutGrid, ShieldCheck } from "lucide-react";
import type { LucideIcon } from "lucide-react";

interface ValueProp {
  icon: LucideIcon;
  title: string;
  description: string;
}

const VALUE_PROPS: ValueProp[] = [
  {
    icon: Users,
    title: "Entra ID management",
    description: "User, group, role and access lifecycle across your Microsoft tenant.",
  },
  {
    icon: LayoutGrid,
    title: "Power Platform governance",
    description: "Environment, app and governance operations from one console.",
  },
  {
    icon: ShieldCheck,
    title: "Data Protection & Purview",
    description: "Sensitive data discovery, classification and DLP posture across your tenant.",
  },
];

export const SignInVisualPanel = () => (
  <aside className="relative hidden lg:flex lg:w-1/2 shrink-0 flex-col overflow-hidden bg-navy p-12 text-white">
    <div className="pointer-events-none absolute inset-0 visual-panel-grid" />
    <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_30%_15%,rgba(59,130,246,0.20),transparent_55%)]" />
    <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_85%_90%,rgba(124,58,237,0.14),transparent_50%)]" />
    <RingCluster />

    <div className="relative z-10 flex-1 flex flex-col justify-center max-w-md">
      <h2 className="text-[28px] font-bold leading-tight tracking-tight">
        The control plane for Microsoft Entra ID, Power Platform &amp; Purview
      </h2>
      <p className="mt-3 text-[13.5px] leading-relaxed text-white/55">
        Manage users, environments, and data governance across your Microsoft tenant — from one secure console.
      </p>
      <ul className="mt-8 space-y-4">
        {VALUE_PROPS.map((prop) => (
          <li key={prop.title} className="flex items-start gap-3.5">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white/[0.06] ring-1 ring-white/10">
              <prop.icon className="h-4 w-4 text-blue-300" strokeWidth={1.75} />
            </div>
            <div>
              <p className="text-[13.5px] font-semibold text-white/90">{prop.title}</p>
              <p className="text-[12.5px] leading-relaxed text-white/45">{prop.description}</p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  </aside>
);

function RingCluster() {
  return (
    <div className="pointer-events-none absolute -bottom-32 -right-28 h-[34rem] w-[34rem] animate-auth-float">
      <div className="absolute inset-0 animate-ring-slow rounded-full border border-white/[0.07]">
        <span className="absolute left-1/2 top-0 h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-blue-400 shadow-[0_0_12px_2px_rgba(96,165,250,0.7)]" />
      </div>
      <div className="absolute inset-12 animate-ring-med rounded-full border border-white/[0.06]">
        <span className="absolute left-0 top-1/2 h-1.5 w-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-secondary shadow-[0_0_10px_2px_rgba(168,85,247,0.6)]" />
      </div>
      <div className="absolute inset-24 animate-ring-fast rounded-full border border-white/[0.05]">
        <span className="absolute bottom-0 left-1/2 h-1.5 w-1.5 -translate-x-1/2 translate-y-1/2 rounded-full bg-cyan-300 shadow-[0_0_10px_2px_rgba(103,232,249,0.6)]" />
      </div>
    </div>
  );
}

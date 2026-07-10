import { ModuleGuard } from "@/src/components/auth/ModuleGuard";

export default function Layout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <ModuleGuard module="purview">{children}</ModuleGuard>;
}

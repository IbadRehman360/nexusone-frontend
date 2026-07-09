"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/src/components/ui/inputs/Button";

export default function NotFoundPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-4">
      {/* Large 404 */}
      <p className="text-[120px] font-black leading-none tracking-tighter text-foreground/[0.04] select-none">
        404
      </p>

      {/* Content — overlaps the giant number */}
      <div className="-mt-8 flex flex-col items-center text-center">
        <h1 className="text-2xl font-bold text-foreground">Page not found</h1>
        <p className="mt-2 text-sm text-muted-foreground max-w-xs">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>

        <div className="mt-8 flex items-center gap-3">
          <Button asChild>
            <Link href="/dashboard">Go to dashboard</Link>
          </Button>
          <Button variant="outline" onClick={() => router.back()}>
            Go back
          </Button>
        </div>
      </div>
    </div>
  );
}

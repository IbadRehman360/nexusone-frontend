"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/src/hooks/useAuth";
import { FullScreenLoader } from "@/src/components/ui/feedback/FullScreenLoader";

export default function Page() {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading) {
      router.replace(isAuthenticated ? "/dashboard" : "/signin");
    }
  }, [isLoading, isAuthenticated, router]);

  return <FullScreenLoader />;
}

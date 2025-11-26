"use client";

import type { ReactNode } from "react";
import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { AppShell } from "@/components/layout/app-shell";
import { useAuth } from "@/lib/auth/use-auth";

export default function AppLayout({ children }: { children: ReactNode }) {
  const { status } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (status === "unauthenticated") {
      const next = pathname || "/dashboard";
      const search = new URLSearchParams({ next }).toString();
      router.replace(`/auth?${search}`);
    }
  }, [status, router, pathname]);

  if (status === "checking") {
    return (
      <div className="flex min-h-screen items-center justify-center text-sm text-muted-foreground">
        Checking authentication…
      </div>
    );
  }

  if (status === "unauthenticated") {
    // Redirect in progress
    return null;
  }

  return <AppShell>{children}</AppShell>;
}


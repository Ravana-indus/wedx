"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useAuth } from "@/lib/auth/use-auth";

export default function AuthPage() {
  const { status, login } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get("next") || "/dashboard";

  useEffect(() => {
    if (status === "authenticated") {
      router.replace(next);
    }
  }, [status, router, next]);

  const handleSignIn = () => {
    login("owner");
    router.replace(next);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl font-semibold">
            Sign in to wedX
          </CardTitle>
          <CardDescription>
            This is a placeholder authentication screen for the wedX MVP. No
            real accounts or passwords yet.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Continue as a demo owner to explore the authenticated app shell.
            Later stories will replace this with real authentication.
          </p>
          <Button className="w-full" onClick={handleSignIn}>
            Continue as demo owner
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}


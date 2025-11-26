"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/auth/use-auth";

interface TopBarProps {
  onMenuClick?: () => void;
}

export function TopBar({ onMenuClick }: TopBarProps) {
  const router = useRouter();
  const { user, logout } = useAuth();

  const handleSignOut = () => {
    logout();
    router.replace("/auth");
  };

  return (
    <header className="sticky top-0 z-40 border-b bg-background/80 backdrop-blur">
      <div className="flex h-14 items-center justify-between px-4 md:px-6 lg:px-8">
        <div className="flex items-center gap-2">
          {/* Mobile menu button */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            aria-label="Open navigation"
            onClick={onMenuClick}
          >
            <span className="sr-only">Open navigation</span>
            <MenuIcon className="h-5 w-5" />
          </Button>
          {/* Logo */}
          <div className="flex items-center gap-2">
            <div className="h-7 w-7 rounded-full bg-wedx-primary-500 flex items-center justify-center text-xs font-semibold text-white">
              wed
            </div>
            <span className="font-semibold tracking-tight text-wedx-primary-700">
              wedX
            </span>
          </div>
        </div>

        {/* Countdown placeholder */}
        <div className={cn("hidden md:flex text-sm text-muted-foreground")}>
          <span className="font-medium text-wedx-accent-700">
            120 days
          </span>
          <span className="mx-1">to wedding</span>
        </div>

        {/* Profile placeholder */}
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex flex-col items-end">
            <span className="text-sm font-medium">
              {user ? "Demo Owner" : "Guest"}
            </span>
            <span className="text-xs text-muted-foreground">
              {user ? "Authenticated" : "Not signed in"}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-full bg-wedx-support-500 text-white flex items-center justify-center text-sm font-semibold">
              {user ? "DO" : "G"}
            </div>
            {user && (
              <Button
                variant="ghost"
                size="sm"
                className="hidden md:inline-flex px-2 py-1 text-xs"
                onClick={handleSignOut}
              >
                Sign out
              </Button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

function MenuIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      focusable="false"
      {...props}
    >
      <path
        d="M4 7h16M4 12h16M4 17h16"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

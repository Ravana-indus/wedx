"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { TopBar } from "./top-bar";
import { SidebarNav } from "./sidebar-nav";
import { RightRail } from "./right-rail";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface AppShellProps {
  children: React.ReactNode;
  className?: string;
}

export function AppShell({ children, className }: AppShellProps) {
  const [mobileNavOpen, setMobileNavOpen] = React.useState(false);

  return (
    <div className={cn("min-h-screen bg-background text-foreground", className)}>
      <div className="flex flex-col h-screen">
        <TopBar onMenuClick={() => setMobileNavOpen(true)} />

        <div className="flex flex-1 overflow-hidden">
          {/* Desktop / tablet sidebar */}
          <aside className="hidden md:flex w-60 shrink-0 border-r bg-wedx-neutral-50/80">
            <SidebarNav />
          </aside>

          {/* Main content */}
          <main className="flex-1 overflow-y-auto px-4 py-6 md:px-6 lg:px-8">
            {children}
          </main>

          {/* Right rail (desktop only) */}
          <aside className="hidden lg:block w-80 shrink-0 border-l bg-muted/40">
            <RightRail />
          </aside>
        </div>
      </div>

      {/* Mobile navigation drawer using Dialog */}
      <Dialog open={mobileNavOpen} onOpenChange={setMobileNavOpen}>
        <DialogContent className="p-0 gap-0 max-w-xs sm:max-w-sm">
          <DialogHeader className="px-4 pt-4 pb-2 border-b">
            <DialogTitle className="text-base font-semibold">
              Navigation
            </DialogTitle>
          </DialogHeader>
          <div className="py-2">
            <SidebarNav onNavigate={() => setMobileNavOpen(false)} />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}


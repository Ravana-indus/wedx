"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface SidebarNavProps {
  onNavigate?: () => void;
}

const navItems: { label: string; href: string }[] = [
  { label: "Today", href: "/dashboard" },
  { label: "Checklist", href: "/checklist" },
  { label: "Events", href: "/events" },
  { label: "Guests", href: "/guests" },
  { label: "Vendors", href: "/vendors" },
  { label: "Budget", href: "/budget" },
  { label: "AI Planner", href: "/ai" },
  { label: "Inspiration", href: "/inspiration" },
  { label: "Settings", href: "/settings" },
];

export function SidebarNav({ onNavigate }: SidebarNavProps) {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Primary"
      className="flex flex-col gap-2 px-3 py-4 w-full text-sm"
    >
      {navItems.map((item) => {
        const isActive =
          pathname === item.href ||
          (item.href !== "/dashboard" && pathname.startsWith(item.href));

        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            className="w-full"
          >
            <Button
              variant={isActive ? "secondary" : "ghost"}
              className={cn(
                "w-full justify-start gap-2 rounded-md px-3 py-2 text-sm font-medium",
                isActive &&
                  "bg-wedx-primary-50 text-wedx-primary-700 hover:bg-wedx-primary-100"
              )}
            >
              <span>{item.label}</span>
            </Button>
          </Link>
        );
      })}
    </nav>
  );
}


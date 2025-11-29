"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

export default function GuestsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  const tabs = [
    { href: "/guests", label: "Guests" },
    { href: "/guests/invitations", label: "Invitations & RSVP" },
  ];

  return (
    <div className="space-y-4">
      <div className="border-b">
        <nav className="flex space-x-4" aria-label="Guests navigation">
          {tabs.map((tab) => {
            const isActive = pathname === tab.href;
            return (
              <Link
                key={tab.href}
                href={tab.href}
                className={cn(
                  "px-3 py-2 text-sm font-medium border-b-2 transition-colors",
                  isActive
                    ? "border-wedx-primary-700 text-wedx-primary-700"
                    : "border-transparent text-muted-foreground hover:text-foreground hover:border-muted"
                )}
                aria-current={isActive ? "page" : undefined}
              >
                {tab.label}
              </Link>
            );
          })}
        </nav>
      </div>
      {children}
    </div>
  );
}
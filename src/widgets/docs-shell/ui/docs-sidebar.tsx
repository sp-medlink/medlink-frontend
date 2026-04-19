"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { docsNav } from "../model/docs-nav";
import { cn } from "@/shared/lib/utils";

export function DocsSidebar() {
  const pathname = usePathname();

  return (
    <nav aria-label="Documentation" className="w-full text-sm">
      <ul className="flex flex-col gap-6">
        {docsNav.map((group) => (
          <li key={group.title}>
            <p className="text-foreground mb-2 px-2 text-xs font-semibold uppercase tracking-wider">
              {group.title}
            </p>
            <ul className="flex flex-col gap-0.5">
              {group.items.map((item) => {
                const active = pathname === item.href;
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      aria-current={active ? "page" : undefined}
                      className={cn(
                        "block rounded-md px-2 py-1.5 transition-colors",
                        active
                          ? "bg-muted text-foreground font-medium"
                          : "text-muted-foreground hover:bg-muted/50 hover:text-foreground",
                      )}
                    >
                      {item.title}
                      {item.badge && (
                        <span className="bg-muted text-muted-foreground ml-2 rounded-full px-1.5 py-0.5 text-[10px] font-medium">
                          {item.badge}
                        </span>
                      )}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </li>
        ))}
      </ul>
    </nav>
  );
}

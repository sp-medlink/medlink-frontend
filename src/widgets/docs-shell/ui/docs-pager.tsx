import Link from "next/link";
import type { Route } from "next";
import { ArrowLeft, ArrowRight } from "lucide-react";

export type DocsPagerItem = {
  title: string;
  href: Route;
};

export function DocsPager({
  prev,
  next,
}: {
  prev?: DocsPagerItem;
  next?: DocsPagerItem;
}) {
  if (!prev && !next) return null;

  return (
    <nav
      aria-label="Pager"
      className="border-border/60 mt-12 grid grid-cols-2 gap-3 border-t pt-6"
    >
      <div>
        {prev && (
          <Link
            href={prev.href}
            className="border-border/60 hover:border-border group flex w-full flex-col gap-1 rounded-lg border p-3 transition-colors hover:bg-muted/50"
          >
            <span className="text-muted-foreground flex items-center gap-1 text-xs">
              <ArrowLeft className="size-3" aria-hidden />
              Previous
            </span>
            <span className="text-foreground text-sm font-medium">
              {prev.title}
            </span>
          </Link>
        )}
      </div>
      <div>
        {next && (
          <Link
            href={next.href}
            className="border-border/60 hover:border-border group ml-auto flex w-full flex-col items-end gap-1 rounded-lg border p-3 transition-colors hover:bg-muted/50"
          >
            <span className="text-muted-foreground flex items-center gap-1 text-xs">
              Next
              <ArrowRight className="size-3" aria-hidden />
            </span>
            <span className="text-foreground text-sm font-medium">
              {next.title}
            </span>
          </Link>
        )}
      </div>
    </nav>
  );
}

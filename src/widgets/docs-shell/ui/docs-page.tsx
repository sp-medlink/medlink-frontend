import type { ReactNode } from "react";

import { Badge } from "@/shared/ui/badge";
import { DocsPager, type DocsPagerItem } from "./docs-pager";
import { DocsToc, type DocsTocItem } from "./docs-toc";

export function DocsPage({
  eyebrow,
  title,
  description,
  updatedOn,
  toc,
  prev,
  next,
  children,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  updatedOn?: string;
  toc?: DocsTocItem[];
  prev?: DocsPagerItem;
  next?: DocsPagerItem;
  children: ReactNode;
}) {
  return (
    <>
      <main className="min-w-0">
        <header className="border-border/60 mb-8 border-b pb-6">
          {eyebrow && (
            <p className="text-muted-foreground mb-2 text-xs font-medium uppercase tracking-wider">
              {eyebrow}
            </p>
          )}
          <h1 className="text-foreground text-3xl font-bold tracking-tight sm:text-4xl">
            {title}
          </h1>
          {description && (
            <p className="text-muted-foreground mt-3 max-w-2xl text-base leading-relaxed sm:text-lg">
              {description}
            </p>
          )}
          {updatedOn && (
            <div className="mt-4">
              <Badge variant="secondary" className="font-normal">
                Last updated {updatedOn}
              </Badge>
            </div>
          )}
        </header>

        <div className="docs-prose max-w-3xl">{children}</div>

        <DocsPager prev={prev} next={next} />
      </main>

      {toc && toc.length > 0 ? (
        <aside className="hidden lg:block">
          <div className="sticky top-20 max-h-[calc(100vh-5rem)] overflow-y-auto pb-10">
            <DocsToc items={toc} />
          </div>
        </aside>
      ) : (
        <div className="hidden lg:block" />
      )}
    </>
  );
}

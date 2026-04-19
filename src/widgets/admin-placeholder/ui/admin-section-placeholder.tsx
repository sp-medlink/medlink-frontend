import type { ReactNode } from "react";
import { Hourglass } from "lucide-react";

interface AdminSectionPlaceholderProps {
  title: string;
  description: ReactNode;
}

/**
 * Lightweight stand-in for admin sub-sections whose real UI hasn't landed
 * yet. Keeps links from the overview page from 404-ing during the staged
 * rollout of the admin console.
 */
export function AdminSectionPlaceholder({
  title,
  description,
}: AdminSectionPlaceholderProps) {
  return (
    <main className="mx-auto flex w-full max-w-3xl flex-col items-start gap-4 p-6 md:p-8">
      <div className="flex size-10 items-center justify-center rounded-lg bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300">
        <Hourglass className="size-5" aria-hidden />
      </div>
      <div className="flex flex-col gap-1">
        <h1 className="text-xl font-semibold tracking-tight">{title}</h1>
        <p className="text-muted-foreground text-sm">{description}</p>
      </div>
    </main>
  );
}

import Link from "next/link";
import {
  ArrowUpRight,
  Calendar,
  FileText,
  MessageSquare,
  Sparkles,
  Video,
} from "lucide-react";

import { Button } from "@/shared/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/ui/card";
import { cn } from "@/shared/lib/utils";

const demoCards = [
  {
    title: "Next appointment",
    description: "Video visit · Cardiology",
    meta: "Tomorrow · 14:00",
    icon: Calendar,
    accent: "text-emerald-600 dark:text-emerald-400",
  },
  {
    title: "Messages",
    description: "1 unread from your care team",
    meta: "Open inbox",
    icon: MessageSquare,
    accent: "text-sky-600 dark:text-sky-400",
  },
  {
    title: "Records",
    description: "Prescriptions & shared files",
    meta: "3 documents",
    icon: FileText,
    accent: "text-violet-600 dark:text-violet-400",
  },
] as const;

/**
 * Static “patient home” preview for `/test` — mirrors how a real `(private)/patient` home
 * could be composed. This route is public so you can open it without logging in (dev UI preview).
 */
export function TestHomeContent() {
  return (
    <div className="flex w-full flex-col">
      <header className="border-border/60 bg-muted/30 border-b px-4 py-8 sm:px-8 lg:px-10">
        <div className="mx-auto flex max-w-5xl flex-col gap-3">
          <p className="text-muted-foreground flex items-center gap-2 text-sm font-medium">
            <Sparkles className="size-4 text-emerald-600 dark:text-emerald-400" aria-hidden />
            Preview · Patient home
          </p>
          <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
            Welcome back,{" "}
            <span className="bg-gradient-to-r from-emerald-700 to-teal-600 bg-clip-text text-transparent dark:from-emerald-400 dark:to-teal-400">
              Alex
            </span>
          </h1>
          <p className="text-muted-foreground max-w-2xl text-base leading-relaxed">
            Dev preview: sidebar + dashboard mock. Open{" "}
            <code className="bg-muted rounded px-1.5 py-0.5 text-xs">/test</code> anytime — no account
            required.
          </p>
          <div className="flex flex-wrap gap-2 pt-1">
            <Button asChild size="sm" className="gap-1.5">
              <Link href="#preview-actions">
                Book a visit
                <ArrowUpRight className="size-3.5" aria-hidden />
              </Link>
            </Button>
            <Button asChild variant="outline" size="sm">
              <Link href="#preview-actions">Find a doctor</Link>
            </Button>
          </div>
        </div>
      </header>

      <div className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-8 px-4 py-8 sm:px-8 lg:px-10">
        <section aria-labelledby="snapshot-heading">
          <h2 id="snapshot-heading" className="mb-4 text-lg font-semibold tracking-tight">
            Snapshot
          </h2>
          <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {demoCards.map(({ title, description, meta, icon: Icon, accent }) => (
              <li key={title}>
                <Card className="h-full transition-shadow hover:shadow-md">
                  <CardHeader className="gap-3 pb-2">
                    <div className="flex items-start justify-between gap-2">
                      <Icon className={cn("size-9 shrink-0 rounded-lg bg-muted p-2", accent)} />
                      <span className="text-muted-foreground text-xs font-medium">{meta}</span>
                    </div>
                    <CardTitle className="text-base">{title}</CardTitle>
                    <CardDescription>{description}</CardDescription>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <button
                      type="button"
                      className="text-primary inline-flex items-center gap-1 text-sm font-medium underline-offset-4 hover:underline"
                    >
                      View
                      <ArrowUpRight className="size-3" aria-hidden />
                    </button>
                  </CardContent>
                </Card>
              </li>
            ))}
          </ul>
        </section>

        <section
          id="preview-actions"
          className="border-border/80 bg-card rounded-xl border p-6 shadow-sm"
        >
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-lg font-semibold tracking-tight">Quick actions</h2>
              <p className="text-muted-foreground mt-1 text-sm">
                Same patterns as future feature slices — buttons + links only here.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button size="sm" variant="secondary" className="gap-2" type="button">
                <Video className="size-4" aria-hidden />
                Start video visit
              </Button>
              <Button size="sm" variant="outline" type="button">
                Message doctor
              </Button>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

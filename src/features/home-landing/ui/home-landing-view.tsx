import Link from "next/link";
import type { Route } from "next";
import {
  Building2,
  Calendar,
  Home,
  MessageCircle,
  Shield,
  Stethoscope,
  UserRound,
  UsersRound,
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
import { routes } from "@/shared/config";
import { cn } from "@/shared/lib/utils";

const features = [
  {
    icon: Video,
    title: "Video consultations",
    description:
      "Secure telehealth visits with your care team, integrated into your workflow.",
  },
  {
    icon: Calendar,
    title: "Appointments",
    description:
      "Schedule and manage visits in one place — fewer phone tags, clearer timelines.",
  },
  {
    icon: MessageCircle,
    title: "Secure chat",
    description:
      "Message clinicians and staff with context from your care journey.",
  },
  {
    icon: Building2,
    title: "Organizations & directory",
    description:
      "Patients can find hospitals and departments; doctors stay aligned with their orgs.",
  },
] as const;

const audiences = [
  {
    title: "Patients",
    icon: UserRound,
    points: [
      "Book and join telehealth visits",
      "Browse organisations and departments",
      "Keep follow-ups and messages in one app",
    ],
  },
  {
    title: "Clinicians",
    icon: UsersRound,
    points: [
      "Manage schedule and appointments",
      "Run consultations and coordinate with departments",
      "Stay reachable through secure chat",
    ],
  },
] as const;

const APP_QUICK_LINKS = {
  patient: [
    { href: routes.patient.organisations, label: "Browse organisations" },
    { href: routes.patient.appointments, label: "Appointments" },
    { href: routes.patient.consultations, label: "Consultations" },
    { href: routes.patient.chats, label: "Chats" },
  ],
  doctor: [
    { href: routes.doctor.schedule, label: "Schedule" },
    { href: routes.doctor.appointments, label: "Appointments" },
    { href: routes.doctor.consultations, label: "Consultations" },
    { href: routes.doctor.chats, label: "Chats" },
  ],
  admin: [
    { href: routes.admin.root, label: "Dashboard" },
    { href: routes.admin.organizations, label: "Organizations" },
    { href: routes.admin.departments, label: "Departments" },
    { href: routes.admin.verifications, label: "Verifications" },
  ],
} as const;

type AppVariant = keyof typeof APP_QUICK_LINKS;

function isAppVariant(v: HomeLandingVariant): v is AppVariant {
  return v === "patient" || v === "doctor" || v === "admin";
}

export type HomeLandingVariant = "marketing" | AppVariant;

export interface HomeLandingViewProps {
  variant?: HomeLandingVariant;
  firstName?: string | null;
}

export function HomeLandingView({
  variant = "marketing",
  firstName,
}: HomeLandingViewProps) {
  const isMarketing = variant === "marketing";
  const isApp = isAppVariant(variant);

  const appCopy = (() => {
    if (!isApp) return null;
    switch (variant) {
      case "patient":
        return {
          badge: "Your patient portal",
          title: firstName ? `Welcome back, ${firstName}` : "Your care hub",
          subtitle:
            "Everything Medlink offers — video visits, scheduling, messaging, and finding care through organisations — in one place.",
          workspaceBlurb:
            "What you can do in Medlink as a patient — all from the sidebar too.",
        };
      case "doctor":
        return {
          badge: "Your clinician workspace",
          title: firstName ? `Welcome back, ${firstName}` : "Your practice hub",
          subtitle:
            "Schedule, visits, consultations, and chat — the same tools you use in the app, summarized here on home.",
          workspaceBlurb:
            "What you can do in Medlink as a clinician — from schedule through to patient chat.",
        };
      case "admin":
        return {
          badge: "Administration",
          title: firstName ? `Welcome back, ${firstName}` : "Admin hub",
          subtitle:
            "Organizations, departments, verifications, and platform tools — jump in without leaving home.",
          workspaceBlurb:
            "Manage organizations, verifications, and platform settings from one place.",
        };
      default:
        return null;
    }
  })();

  const quickLinks = isApp ? APP_QUICK_LINKS[variant] : [];

  return (
    <div
      className={
        isMarketing
          ? "from-muted/35 bg-linear-to-b via-background to-background text-foreground min-h-screen"
          : "from-muted/35 bg-linear-to-b via-background to-background text-foreground w-full min-w-0 min-h-full"
      }
    >
      {isMarketing && (
        <header className="border-border/80 bg-background/85 supports-backdrop-filter:bg-background/65 sticky top-0 z-50 border-b backdrop-blur">
          <div className="mx-auto flex h-14 max-w-4xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
            <Link
              href="/"
              className="flex items-center gap-2 font-semibold tracking-tight"
            >
              <span className="bg-card text-primary flex size-9 items-center justify-center rounded-xl border shadow-sm ring-1 ring-black/5 dark:ring-white/10">
                <Stethoscope className="size-4" aria-hidden />
              </span>
              Medlink
            </Link>
            <nav className="flex items-center gap-2 sm:gap-3">
              <Button variant="ghost" size="sm" asChild>
                <Link href={routes.login}>Log in</Link>
              </Button>
              <Button size="sm" asChild>
                <Link href={routes.signup}>Sign up</Link>
              </Button>
            </nav>
          </div>
        </header>
      )}

      <main className="mx-auto flex w-full max-w-4xl flex-col gap-10 px-4 py-8 sm:px-6 lg:gap-12 lg:px-8 lg:py-10">
        <section className="bg-card/80 relative overflow-hidden rounded-2xl border shadow-sm ring-1 ring-black/5 dark:ring-white/10">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,hsl(var(--primary)/0.1),transparent)]" />
          <div className="relative space-y-5 p-6 sm:p-8">
            <div
              className="h-px w-full max-w-md bg-linear-to-r from-primary/25 via-primary/10 to-transparent"
              aria-hidden
            />
            <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:gap-6">
              <div className="bg-card flex size-14 shrink-0 items-center justify-center rounded-2xl border shadow-sm ring-1 ring-black/5 dark:ring-white/10">
                {isMarketing ? (
                  <Stethoscope
                    className="text-primary size-7"
                    strokeWidth={1.75}
                    aria-hidden
                  />
                ) : (
                  <Home
                    className="text-primary size-7"
                    strokeWidth={1.75}
                    aria-hidden
                  />
                )}
              </div>
              <div className="min-w-0 flex-1 space-y-4">
                <p className="text-muted-foreground inline-flex items-center gap-2 text-sm">
                  <Shield className="size-4 shrink-0" aria-hidden />
                  {isMarketing
                    ? "Telemedicine platform"
                    : (appCopy?.badge ?? "Medlink")}
                </p>
                <h1 className="text-foreground max-w-3xl text-3xl font-semibold tracking-tight sm:text-4xl sm:leading-tight md:text-[2.5rem] md:leading-tight">
                  {isMarketing
                    ? "Care that meets you where you are"
                    : (appCopy?.title ?? "Medlink")}
                </h1>
                <p className="text-muted-foreground max-w-2xl text-sm leading-relaxed sm:text-[0.9375rem]">
                  {isMarketing
                    ? "Medlink brings video visits, scheduling, and messaging together so patients and clinicians can collaborate without friction."
                    : (appCopy?.subtitle ?? "")}
                </p>
                <div
                  className={cn(
                    "items-center gap-3 pt-1",
                    isMarketing
                      ? "flex flex-wrap"
                      : "grid w-full max-w-3xl grid-cols-2 sm:grid-cols-4",
                  )}
                >
                  {isMarketing ? (
                    <>
                      <Button size="lg" asChild>
                        <Link href={routes.signup}>Get started</Link>
                      </Button>
                      <Button size="lg" variant="outline" asChild>
                        <Link href={routes.login}>Log in</Link>
                      </Button>
                    </>
                  ) : (
                    quickLinks.map(({ href, label }, i) => (
                      <Button
                        key={href}
                        size="lg"
                        variant={i === 0 ? "default" : "outline"}
                        className="w-full"
                        asChild
                      >
                        <Link href={href as Route}>{label}</Link>
                      </Button>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="space-y-8">
          <div className="space-y-2">
            <h2 className="text-2xl font-semibold tracking-tight">
              Everything in one workspace
            </h2>
            <p className="text-muted-foreground max-w-2xl text-sm leading-relaxed sm:text-[0.9375rem]">
              {isMarketing
                ? "The same flows you use in the app — described for newcomers landing on the home page."
                : (appCopy?.workspaceBlurb ?? "")}
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {features.map(({ icon: Icon, title, description }) => (
              <Card
                key={title}
                className="overflow-hidden shadow-sm ring-1 ring-black/5 dark:ring-white/10"
              >
                <CardHeader className="border-b bg-muted/30 pb-5">
                  <div className="flex items-start gap-3">
                    <div className="bg-background flex size-10 shrink-0 items-center justify-center rounded-xl border shadow-sm">
                      <Icon
                        className="text-muted-foreground size-5"
                        aria-hidden
                      />
                    </div>
                    <div className="min-w-0 space-y-1.5">
                      <CardTitle className="text-lg leading-snug">{title}</CardTitle>
                      <CardDescription className="text-sm leading-relaxed">
                        {description}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
              </Card>
            ))}
          </div>
        </section>

        <section>
          <div className="rounded-2xl border bg-muted/25 p-6 ring-1 ring-black/5 dark:ring-white/10 sm:p-8">
            <h2 className="text-2xl font-semibold tracking-tight">
              Built for patients and clinicians
            </h2>
            <p className="text-muted-foreground mt-2 max-w-2xl text-sm leading-relaxed">
              One platform for care journeys — whether you seek treatment or
              provide it.
            </p>
            <div className="mt-8 grid gap-4 md:grid-cols-2 md:gap-6">
              {audiences.map(({ title, points, icon: AudienceIcon }) => (
                <Card
                  key={title}
                  className="bg-card overflow-hidden shadow-sm ring-1 ring-black/5 dark:ring-white/10"
                >
                  <CardHeader className="border-b bg-muted/30">
                    <div className="flex items-start gap-3">
                      <div className="bg-background flex size-10 shrink-0 items-center justify-center rounded-xl border shadow-sm">
                        <AudienceIcon
                          className="text-muted-foreground size-5"
                          aria-hidden
                        />
                      </div>
                      <CardTitle className="text-lg pt-0.5">{title}</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-5">
                    <ul className="text-muted-foreground list-inside list-disc space-y-2.5 text-sm leading-relaxed marker:text-primary/80">
                      {points.map((p) => (
                        <li key={p} className="pl-0.5">
                          {p}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        <Card className="border-dashed shadow-sm ring-1 ring-black/5 dark:ring-white/10">
          <CardContent className="px-6 py-8 sm:px-8 sm:py-10">
            <div
              className={cn(
                "mx-auto text-center",
                isMarketing ? "max-w-lg" : "max-w-3xl",
              )}
            >
              {isMarketing ? (
                <>
                  <h2 className="text-2xl font-semibold tracking-tight">
                    Ready to join?
                  </h2>
                  <p className="text-muted-foreground mt-3 text-sm leading-relaxed sm:text-[0.9375rem]">
                    Create an account or sign in to open your dashboard —
                    routing depends on your role and permissions.
                  </p>
                  <div className="mt-8 flex flex-wrap justify-center gap-3">
                    <Button size="lg" asChild>
                      <Link href={routes.signup}>Create account</Link>
                    </Button>
                    <Button size="lg" variant="outline" asChild>
                      <Link href={routes.login}>Log in</Link>
                    </Button>
                  </div>
                </>
              ) : (
                <>
                  <h2 className="text-2xl font-semibold tracking-tight">
                    Where to next?
                  </h2>
                  <p className="text-muted-foreground mt-3 text-sm leading-relaxed sm:text-[0.9375rem]">
                    Jump into the areas you use most — you stay on this page
                    until you open a section.
                  </p>
                  <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
                    {quickLinks.map(({ href, label }, i) => (
                      <Button
                        key={href}
                        size="lg"
                        variant={i === 0 ? "default" : "outline"}
                        className="w-full"
                        asChild
                      >
                        <Link href={href as Route}>{label}</Link>
                      </Button>
                    ))}
                  </div>
                  <div className="mt-6">
                    <Button variant="link" asChild>
                      <Link href={routes.settings}>Profile & settings</Link>
                    </Button>
                  </div>
                </>
              )}
            </div>
          </CardContent>
        </Card>
      </main>

      <footer className="border-border text-muted-foreground border-t py-8 text-sm">
        <div className="mx-auto flex max-w-4xl flex-col items-center justify-between gap-4 px-4 sm:flex-row sm:px-6 lg:px-8">
          <p>© {new Date().getFullYear()} Medlink</p>
          <div className="flex gap-6">
            {isMarketing ? (
              <>
                <Link
                  href={routes.login}
                  className="hover:text-foreground transition-colors"
                >
                  Log in
                </Link>
                <Link
                  href={routes.signup}
                  className="hover:text-foreground transition-colors"
                >
                  Sign up
                </Link>
              </>
            ) : (
              <Link
                href={routes.settings}
                className="hover:text-foreground transition-colors"
              >
                Settings
              </Link>
            )}
          </div>
        </div>
      </footer>
    </div>
  );
}

import Link from "next/link";
import type { Route } from "next";
import {
  Building2,
  Calendar,
  MessageCircle,
  Shield,
  Stethoscope,
  Video,
} from "lucide-react";
import { Button } from "@/shared/ui/button";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/ui/card";
import { routes } from "@/shared/config";

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
    points: [
      "Book and join telehealth visits",
      "Browse organisations and departments",
      "Keep follow-ups and messages in one app",
    ],
  },
  {
    title: "Clinicians",
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

function isAppVariant(
  v: HomeLandingVariant,
): v is AppVariant {
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
        isApp
          ? "bg-background text-foreground w-full min-w-0"
          : "bg-background text-foreground min-h-screen"
      }
    >
      {isMarketing && (
        <header className="border-border/80 bg-background/80 supports-backdrop-filter:bg-background/60 sticky top-0 z-50 border-b backdrop-blur">
          <div className="mx-auto flex h-14 max-w-5xl items-center justify-between gap-4 px-4 sm:px-6">
            <Link
              href="/"
              className="flex items-center gap-2 font-semibold tracking-tight"
            >
              <span className="bg-primary text-primary-foreground flex size-8 items-center justify-center rounded-lg">
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

      <main>
        <section className="from-muted/40 border-border/60 relative overflow-hidden border-b bg-linear-to-b to-transparent">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,hsl(var(--primary)/0.12),transparent)]" />
          <div className="relative mx-auto max-w-5xl px-4 py-12 sm:px-6 sm:py-16">
            <p className="text-muted-foreground mb-4 inline-flex items-center gap-2 text-sm">
              <Shield className="size-4 shrink-0" aria-hidden />
              {isMarketing
                ? "Telemedicine platform"
                : (appCopy?.badge ?? "Medlink")}
            </p>
            <h1 className="text-foreground max-w-3xl text-3xl font-semibold tracking-tight sm:text-4xl sm:leading-tight md:text-5xl">
              {isMarketing
                ? "Care that meets you where you are"
                : (appCopy?.title ?? "Medlink")}
            </h1>
            <p className="text-muted-foreground mt-5 max-w-2xl text-lg leading-relaxed">
              {isMarketing
                ? "Medlink brings video visits, scheduling, and messaging together so patients and clinicians can collaborate without friction."
                : (appCopy?.subtitle ?? "")}
            </p>
            <div className="mt-10 flex flex-wrap items-center gap-3">
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
                    asChild
                  >
                    <Link href={href as Route}>{label}</Link>
                  </Button>
                ))
              )}
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-5xl px-4 py-12 sm:px-6 sm:py-16">
          <div className="mb-10 max-w-2xl">
            <h2 className="text-2xl font-semibold tracking-tight">
              Everything in one workspace
            </h2>
            <p className="text-muted-foreground mt-2 text-sm leading-relaxed sm:text-base">
              {isMarketing
                ? "The same flows you use in the app — described for newcomers landing on the home page."
                : (appCopy?.workspaceBlurb ?? "")}
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {features.map(({ icon: Icon, title, description }) => (
              <Card key={title} className="shadow-sm">
                <CardHeader className="gap-3">
                  <div className="bg-muted text-foreground flex size-10 items-center justify-center rounded-lg">
                    <Icon className="size-5" aria-hidden />
                  </div>
                  <CardTitle className="text-base">{title}</CardTitle>
                  <CardDescription className="text-sm leading-relaxed">
                    {description}
                  </CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
        </section>

        <section className="border-border bg-muted/30 border-y">
          <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 sm:py-16">
            <h2 className="mb-10 text-2xl font-semibold tracking-tight">
              Built for patients and clinicians
            </h2>
            <div className="grid gap-6 md:grid-cols-2">
              {audiences.map(({ title, points }) => (
                <Card key={title} className="border-border/80 shadow-sm">
                  <CardHeader>
                    <CardTitle className="text-lg">{title}</CardTitle>
                    <ul className="text-muted-foreground mt-4 list-inside list-disc space-y-2 text-sm leading-relaxed">
                      {points.map((p) => (
                        <li key={p}>{p}</li>
                      ))}
                    </ul>
                  </CardHeader>
                </Card>
              ))}
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-5xl px-4 py-12 text-center sm:px-6 sm:py-16">
          {isMarketing ? (
            <>
              <h2 className="text-2xl font-semibold tracking-tight">
                Ready to join?
              </h2>
              <p className="text-muted-foreground mx-auto mt-2 max-w-lg text-sm leading-relaxed">
                Create an account or sign in to open your dashboard — routing
                depends on your role and permissions.
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
              <p className="text-muted-foreground mx-auto mt-2 max-w-lg text-sm leading-relaxed">
                Jump into the areas you use most — you stay on this page until
                you open a section.
              </p>
              <div className="mt-8 flex flex-wrap justify-center gap-3">
                {quickLinks.map(({ href, label }, i) => (
                  <Button
                    key={href}
                    size="lg"
                    variant={i === 0 ? "default" : "outline"}
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
        </section>
      </main>

      <footer className="border-border text-muted-foreground border-t py-8 text-sm">
        <div className="mx-auto flex max-w-5xl flex-col items-center justify-between gap-4 px-4 sm:flex-row sm:px-6">
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

import type { Metadata } from "next";
import Link from "next/link";
import {
  BadgeCheck,
  CalendarClock,
  FileText,
  Lock,
  MessagesSquare,
  Stethoscope,
  Video,
} from "lucide-react";

import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/ui/card";

export const metadata: Metadata = {
  title: "For doctors",
  description:
    "Join Medlink to run a verified, structured telehealth practice with scheduling, chat, and video consultations in one place.",
};

const features = [
  {
    icon: BadgeCheck,
    title: "Verified profile",
    description:
      "Platform admins manually review your license before you start seeing patients. Your profile carries a verified badge that patients can trust.",
  },
  {
    icon: CalendarClock,
    title: "Own your schedule",
    description:
      "Define availability per clinic and per department. Patients book only into the slots you expose.",
  },
  {
    icon: MessagesSquare,
    title: "Secure chat",
    description:
      "Real-time messaging with patients you already have a confirmed appointment with — no cold inbound spam.",
  },
  {
    icon: Video,
    title: "Video consultations",
    description:
      "Low-latency WebRTC video, peer-to-peer where possible, so the heavy lifting stays off central servers.",
  },
  {
    icon: FileText,
    title: "Encounter notes & prescriptions",
    description:
      "Write notes on each appointment, issue digital prescriptions, and upload documents to the patient's record.",
  },
  {
    icon: Lock,
    title: "Privacy-first by design",
    description:
      "Hashed passwords (BCrypt), JWT sessions with role-based access, TLS in transit, and audit logs for every record change.",
  },
];

const steps = [
  {
    number: "01",
    title: "Create your account",
    description:
      "Sign up with your personal details — the same as any patient account.",
  },
  {
    number: "02",
    title: "Submit your license",
    description:
      "Fill in license number, issuing country, issue and expiry dates, plus education and experience.",
  },
  {
    number: "03",
    title: "Wait for verification",
    description:
      "A platform admin reviews and approves your credentials. You'll see status changes on your dashboard.",
  },
  {
    number: "04",
    title: "Join departments & start seeing patients",
    description:
      "Attach yourself to one or more clinic departments, publish your schedule, and accept appointments.",
  },
];

export default function ForDoctorsPage() {
  return (
    <>
      <section className="border-border/60 bg-muted/30 border-b">
        <div className="mx-auto grid max-w-screen-xl gap-12 px-4 py-16 sm:px-6 md:grid-cols-[1.25fr_1fr] md:py-24 lg:px-8">
          <div className="flex flex-col justify-center">
            <Badge variant="secondary" className="w-fit">
              <Stethoscope className="size-3" aria-hidden />
              For physicians
            </Badge>
            <h1 className="mt-4 text-4xl font-bold tracking-tight sm:text-5xl">
              A telehealth practice built around{" "}
              <span className="bg-gradient-to-r from-emerald-700 to-teal-600 bg-clip-text text-transparent dark:from-emerald-400 dark:to-teal-400">
                your workflow
              </span>
            </h1>
            <p className="text-muted-foreground mt-4 max-w-xl text-lg leading-relaxed">
              Medlink gives licensed physicians a verified profile, a
              schedule they control, encrypted chat and video consultations,
              and structured notes — all in one unified system.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button asChild size="lg">
                <Link href="/signup?role=doctor">Apply to join</Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link href="#how-it-works">How verification works</Link>
              </Button>
            </div>
            <p className="text-muted-foreground mt-5 text-sm">
              Already a member?{" "}
              <Link href="/login" className="text-foreground underline underline-offset-4">
                Log in
              </Link>
              .
            </p>
          </div>

          <div className="relative hidden md:block">
            <div className="border-border/60 bg-card rounded-2xl border p-6 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="bg-muted size-10 rounded-full" aria-hidden />
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold">
                    Dr. Aigul Karimova
                  </p>
                  <p className="text-muted-foreground truncate text-xs">
                    Cardiology · Hospital A
                  </p>
                </div>
                <Badge className="ml-auto bg-emerald-600 text-white hover:bg-emerald-600/90">
                  <BadgeCheck className="size-3" aria-hidden />
                  Verified
                </Badge>
              </div>
              <div className="mt-5 space-y-2">
                <div className="border-border/60 bg-muted/30 rounded-md border p-3 text-sm">
                  <p className="text-muted-foreground text-xs">Next appointment</p>
                  <p className="mt-1 font-medium">Today · 14:00 · Video</p>
                </div>
                <div className="border-border/60 bg-muted/30 rounded-md border p-3 text-sm">
                  <p className="text-muted-foreground text-xs">Unread chats</p>
                  <p className="mt-1 font-medium">2 patients</p>
                </div>
                <div className="border-border/60 bg-muted/30 rounded-md border p-3 text-sm">
                  <p className="text-muted-foreground text-xs">License status</p>
                  <p className="mt-1 font-medium text-emerald-700 dark:text-emerald-400">
                    Approved
                  </p>
                </div>
              </div>
            </div>
            <div
              className="absolute inset-0 -z-10 translate-x-4 translate-y-4 rounded-2xl bg-gradient-to-br from-emerald-100 to-teal-100 dark:from-emerald-950/40 dark:to-teal-950/40"
              aria-hidden
            />
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-screen-xl px-4 py-16 sm:px-6 md:py-24 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Everything a remote practice needs
          </h2>
          <p className="text-muted-foreground mt-3 text-base leading-relaxed">
            Six primitives we built before adding anything else, because they
            are the minimum for a platform patients and physicians can rely on.
          </p>
        </div>
        <ul className="mt-12 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {features.map(({ icon: Icon, title, description }) => (
            <li key={title}>
              <Card className="h-full">
                <CardHeader>
                  <div className="bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 flex size-10 items-center justify-center rounded-lg">
                    <Icon className="size-5" aria-hidden />
                  </div>
                  <CardTitle className="mt-2 text-base">{title}</CardTitle>
                  <CardDescription>{description}</CardDescription>
                </CardHeader>
              </Card>
            </li>
          ))}
        </ul>
      </section>

      <section
        id="how-it-works"
        className="border-border/60 bg-muted/20 border-t"
      >
        <div className="mx-auto max-w-screen-xl px-4 py-16 sm:px-6 md:py-24 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              How verification works
            </h2>
            <p className="text-muted-foreground mt-3 text-base leading-relaxed">
              Verification protects patients from impersonation. Every doctor
              is manually reviewed before they can see a single patient.
            </p>
          </div>
          <ol className="mt-12 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {steps.map((step) => (
              <li key={step.number}>
                <Card className="h-full">
                  <CardHeader>
                    <span className="text-muted-foreground text-xs font-semibold tracking-wider">
                      Step {step.number}
                    </span>
                    <CardTitle className="text-base">{step.title}</CardTitle>
                    <CardDescription>{step.description}</CardDescription>
                  </CardHeader>
                </Card>
              </li>
            ))}
          </ol>

          <div className="mt-10 flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-muted-foreground text-sm">
              Background on our verification obligations lives on the{" "}
              <Link
                href="/about"
                className="text-foreground underline underline-offset-4"
              >
                About
              </Link>{" "}
              and{" "}
              <Link
                href="/medical"
                className="text-foreground underline underline-offset-4"
              >
                Medical policies
              </Link>{" "}
              pages.
            </p>
            <Button asChild>
              <Link href="/signup?role=doctor">Start my application</Link>
            </Button>
          </div>
        </div>
      </section>
    </>
  );
}

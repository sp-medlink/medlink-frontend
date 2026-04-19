import type { Metadata } from "next";
import Link from "next/link";
import {
  Building2,
  ClipboardList,
  Layers,
  ShieldCheck,
  UserCog,
  Users,
} from "lucide-react";

import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/ui/card";

export const metadata: Metadata = {
  title: "For clinics & organizations",
  description:
    "Register your clinic on Medlink, model your real-world departments, and govern who can see patients under your brand.",
};

const capabilities = [
  {
    icon: Building2,
    title: "Model your real structure",
    description:
      "Your clinic isn't one flat list of doctors — it has departments. Medlink models organizations and departments as first-class entities so you don't have to bend workflow to fit the tool.",
  },
  {
    icon: Users,
    title: "Department admins",
    description:
      "Designate a department admin per department. They manage the roster, activate or deactivate doctors, and oversee the schedule for that department specifically.",
  },
  {
    icon: UserCog,
    title: "Org admins",
    description:
      "Organization admins create and configure departments, appoint department admins, and grant or revoke dept-admin rights from any doctor in the org.",
  },
  {
    icon: ShieldCheck,
    title: "Verified doctors only",
    description:
      "Doctors appearing on your org's page go through platform-level license verification. Your brand does not share space with unverified providers.",
  },
  {
    icon: ClipboardList,
    title: "Schedule & appointments overview",
    description:
      "Read-only visibility across the coverage of your department: which doctors are booked, who has slots, where capacity is short.",
  },
  {
    icon: Layers,
    title: "Consistent patient experience",
    description:
      "Patients search by specialty, location, or organization and always see the same booking, chat, and video flow — regardless of which clinic they choose.",
  },
];

export default function ForClinicsPage() {
  return (
    <>
      <section className="border-border/60 bg-muted/30 border-b">
        <div className="mx-auto max-w-screen-xl px-4 py-16 sm:px-6 md:py-24 lg:px-8">
          <div className="max-w-3xl">
            <Badge variant="secondary" className="w-fit">
              <Building2 className="size-3" aria-hidden />
              For clinics & hospitals
            </Badge>
            <h1 className="mt-4 text-4xl font-bold tracking-tight sm:text-5xl">
              Bring your clinic online, without losing{" "}
              <span className="bg-gradient-to-r from-emerald-700 to-teal-600 bg-clip-text text-transparent dark:from-emerald-400 dark:to-teal-400">
                the way you actually work
              </span>
            </h1>
            <p className="text-muted-foreground mt-4 text-lg leading-relaxed">
              Medlink models organizations and departments as first-class
              entities. Your staff is organized the way you already organize
              them, verification protects your brand, and patients get one
              consistent experience booking across all your sites.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button asChild size="lg">
                <Link href="/help#contact">Register your clinic</Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link href="#how-it-works">How onboarding works</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-screen-xl px-4 py-16 sm:px-6 md:py-24 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Built for how hospitals run
          </h2>
          <p className="text-muted-foreground mt-3 text-base leading-relaxed">
            Every capability below exists because a real clinic asked for it —
            nothing decorative.
          </p>
        </div>
        <ul className="mt-12 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {capabilities.map(({ icon: Icon, title, description }) => (
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
          <div className="grid gap-12 md:grid-cols-[1fr_1fr]">
            <div>
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
                Onboarding, start to finish
              </h2>
              <p className="text-muted-foreground mt-3 leading-relaxed">
                Today, onboarding a clinic is a coordinated process between our
                platform team and yours — not self-service. We keep it that way
                on purpose so the organizations on Medlink stay trustworthy.
              </p>

              <ol className="mt-6 space-y-5 text-sm">
                <li className="flex gap-3">
                  <span className="bg-emerald-600 text-white flex size-6 shrink-0 items-center justify-center rounded-full text-xs font-semibold">
                    1
                  </span>
                  <div>
                    <p className="font-medium">Reach out</p>
                    <p className="text-muted-foreground">
                      Tell us about your clinic, site count, and which
                      departments want to enroll.
                    </p>
                  </div>
                </li>
                <li className="flex gap-3">
                  <span className="bg-emerald-600 text-white flex size-6 shrink-0 items-center justify-center rounded-full text-xs font-semibold">
                    2
                  </span>
                  <div>
                    <p className="font-medium">We create your organization</p>
                    <p className="text-muted-foreground">
                      Platform admins register your organization and appoint
                      your first org admin account.
                    </p>
                  </div>
                </li>
                <li className="flex gap-3">
                  <span className="bg-emerald-600 text-white flex size-6 shrink-0 items-center justify-center rounded-full text-xs font-semibold">
                    3
                  </span>
                  <div>
                    <p className="font-medium">Model your departments</p>
                    <p className="text-muted-foreground">
                      Your org admin creates departments, names them, and
                      assigns department admins.
                    </p>
                  </div>
                </li>
                <li className="flex gap-3">
                  <span className="bg-emerald-600 text-white flex size-6 shrink-0 items-center justify-center rounded-full text-xs font-semibold">
                    4
                  </span>
                  <div>
                    <p className="font-medium">Your verified doctors join</p>
                    <p className="text-muted-foreground">
                      Approved doctors request to join your departments;
                      you control who stays.
                    </p>
                  </div>
                </li>
              </ol>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Coming soon</CardTitle>
                <CardDescription>
                  Features we&apos;re building next for clinic operations.
                </CardDescription>
              </CardHeader>
              <CardContent className="text-sm">
                <ul className="space-y-3">
                  <li className="flex items-start gap-3">
                    <Badge variant="outline" className="mt-0.5">
                      Planned
                    </Badge>
                    <div>
                      <p className="font-medium">Invite your existing staff</p>
                      <p className="text-muted-foreground">
                        Bulk invite doctors by email so they don&apos;t have to
                        self-register.
                      </p>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <Badge variant="outline" className="mt-0.5">
                      Planned
                    </Badge>
                    <div>
                      <p className="font-medium">Approve join requests</p>
                      <p className="text-muted-foreground">
                        Department admins will approve doctors before they
                        appear publicly under your department.
                      </p>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <Badge variant="outline" className="mt-0.5">
                      Planned
                    </Badge>
                    <div>
                      <p className="font-medium">Usage insights</p>
                      <p className="text-muted-foreground">
                        Aggregated, anonymized stats on appointment volume,
                        no-shows, and department load.
                      </p>
                    </div>
                  </li>
                </ul>

                <div className="mt-6">
                  <Button asChild className="w-full">
                    <Link href="/help#contact">Talk to the team</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </>
  );
}

import type { Metadata } from "next";
import { CalendarClock, Layers3, ShieldCheck } from "lucide-react";

import { DoctorDepartmentsView } from "@/features/doctor-departments/ui/doctor-departments-view";
import { DoctorScheduleView } from "@/features/doctor-schedule/ui/doctor-schedule-view";
import { DoctorVerificationView } from "@/features/doctor-verification/ui/doctor-verification-view";

export const metadata: Metadata = {
  title: "Practice",
};

/**
 * Combined practice-setup page. The three underlying features are all
 * about "where / when / whether you can see patients" — keeping them on
 * one page avoids three near-empty routes and makes the setup flow read
 * top-to-bottom.
 */
export default function DoctorPracticePage() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-300 flex-col gap-6 p-4 md:p-6">
      <header className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">
          Practice
        </h1>
        <p className="text-muted-foreground text-sm">
          Your verification, department memberships, and weekly availability
          in one place.
        </p>
        <nav
          aria-label="Jump to section"
          className="mt-3 flex flex-wrap gap-2"
        >
          <SectionLink
            href="#verification"
            icon={<ShieldCheck className="size-3.5" aria-hidden />}
            label="Verification"
          />
          <SectionLink
            href="#departments"
            icon={<Layers3 className="size-3.5" aria-hidden />}
            label="Departments"
          />
          <SectionLink
            href="#schedule"
            icon={<CalendarClock className="size-3.5" aria-hidden />}
            label="Schedule"
          />
        </nav>
      </header>

      {/*
        Grid: single column on mobile, two columns on lg+. The left column
        stacks the short cards (verification + departments); schedule lives
        on the right as a full-height column since it has the most content.
      */}
      <div className="grid gap-4 lg:grid-cols-2 lg:items-start">
        <div className="flex flex-col gap-4">
          <Section
            id="verification"
            icon={<ShieldCheck className="size-4 text-primary" aria-hidden />}
            title="Verification"
            description="Platform approval controls whether video tools are usable."
          >
            <DoctorVerificationView embedded />
          </Section>

          <Section
            id="departments"
            icon={<Layers3 className="size-4 text-primary" aria-hidden />}
            title="Departments"
            description="Where you practice — each department has its own active flag."
          >
            <DoctorDepartmentsView embedded />
          </Section>
        </div>

        <Section
          id="schedule"
          icon={<CalendarClock className="size-4 text-primary" aria-hidden />}
          title="Schedule"
          description="Weekday time ranges patients can book against."
        >
          <DoctorScheduleView embedded />
        </Section>
      </div>
    </main>
  );
}

function Section({
  id,
  icon,
  title,
  description,
  children,
}: {
  id: string;
  icon: React.ReactNode;
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <section
      id={id}
      className="scroll-mt-6 rounded-2xl border bg-card shadow-sm ring-1 ring-black/5"
    >
      <header className="flex items-start justify-between gap-3 border-b px-5 py-4">
        <div>
          <h2 className="flex items-center gap-2 text-base font-semibold tracking-tight">
            {icon}
            {title}
          </h2>
          {description ? (
            <p className="text-muted-foreground mt-0.5 text-sm">
              {description}
            </p>
          ) : null}
        </div>
      </header>
      <div className="px-1 py-1 sm:px-2 sm:py-2">{children}</div>
    </section>
  );
}

function SectionLink({
  href,
  icon,
  label,
}: {
  href: string;
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <a
      href={href}
      className="hover:bg-muted inline-flex items-center gap-1.5 rounded-full border bg-background px-3 py-1 text-xs font-medium transition"
    >
      {icon}
      {label}
    </a>
  );
}

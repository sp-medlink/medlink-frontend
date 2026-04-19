import type { Metadata } from "next";
import Link from "next/link";
import { AlertTriangle, PhoneCall } from "lucide-react";

import { Alert, AlertDescription, AlertTitle } from "@/shared/ui/alert";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";

export const metadata: Metadata = {
  title: "In an emergency",
  description:
    "Medlink is not an emergency service. If you or someone around you is in crisis, contact local emergency services immediately.",
};

const regions = [
  { label: "Kazakhstan", number: "103", description: "Ambulance" },
  { label: "Kazakhstan", number: "112", description: "Unified emergency" },
  { label: "European Union", number: "112", description: "Unified emergency" },
  { label: "United States / Canada", number: "911", description: "Emergency" },
  { label: "United Kingdom", number: "999", description: "Emergency" },
];

export default function EmergencyPage() {
  return (
    <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-16 sm:px-6 lg:px-8">
      <Alert
        variant="destructive"
        className="border-destructive/40 bg-destructive/5"
      >
        <AlertTriangle aria-hidden />
        <AlertTitle className="text-base font-semibold">
          Medlink is not for emergencies
        </AlertTitle>
        <AlertDescription className="text-foreground/90 mt-1">
          <p>
            Do not use Medlink to report a life-threatening situation. If you
            or someone around you is in crisis, contact local emergency
            services <strong>immediately</strong> by phone.
          </p>
        </AlertDescription>
      </Alert>

      <section className="mt-10">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
          In an emergency
        </h1>
        <p className="text-muted-foreground mt-3 text-base leading-relaxed">
          Telemedicine is great for planned consultations and follow-up care.
          It is a poor fit for situations where every second matters —
          triage, resuscitation, major trauma, severe bleeding, chest pain,
          stroke symptoms, active suicidal thoughts, or intoxication emergencies.
          For any of those, please call the number below for your country.
        </p>
      </section>

      <section className="mt-10">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <PhoneCall className="size-4 text-emerald-600" aria-hidden />
              Emergency numbers
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="divide-border/60 divide-y">
              {regions.map((region) => (
                <li
                  key={`${region.label}-${region.number}`}
                  className="flex items-center justify-between py-3"
                >
                  <div>
                    <p className="font-medium">{region.label}</p>
                    <p className="text-muted-foreground text-xs">
                      {region.description}
                    </p>
                  </div>
                  <a
                    href={`tel:${region.number}`}
                    className="text-lg font-semibold tracking-wider text-emerald-700 underline underline-offset-4 dark:text-emerald-400"
                  >
                    {region.number}
                  </a>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </section>

      <section className="mt-10">
        <h2 className="text-xl font-semibold tracking-tight">
          What Medlink <em>is</em> for
        </h2>
        <p className="text-muted-foreground mt-2 leading-relaxed">
          Use Medlink for scheduled video or chat consultations with a
          verified physician, for prescription follow-ups, for reviewing your
          medical history, and for non-urgent questions your regular
          clinician can answer within their working hours.
        </p>
        <p className="text-muted-foreground mt-3 leading-relaxed">
          For more on the scope and limits of telehealth, see our{" "}
          <Link
            href="/medical"
            className="text-foreground underline underline-offset-4"
          >
            Medical policies
          </Link>
          .
        </p>
      </section>
    </main>
  );
}

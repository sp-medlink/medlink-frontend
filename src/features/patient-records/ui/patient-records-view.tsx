"use client";

import { FileText, History, Share2, Upload } from "lucide-react";
import Link from "next/link";

import { routes } from "@/shared/config";
import { Button } from "@/shared/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/ui/card";

export function PatientRecordsView() {
  return (
    <main className="mx-auto flex min-h-screen max-w-3xl flex-col gap-8 p-6">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight">
          Medical record
        </h1>
        <p className="text-muted-foreground mt-1 max-w-2xl text-sm leading-relaxed">
          Visit history, uploads, and data you share with doctors will appear
          here. This section is under development — below are quick links to
          other parts of Medlink.
        </p>
      </header>

      <div className="grid gap-3 sm:grid-cols-2">
        <Card className="shadow-sm">
          <CardHeader className="pb-2">
            <div className="text-muted-foreground mb-2 flex size-9 items-center justify-center rounded-lg bg-emerald-500/10">
              <History className="size-4 text-emerald-700 dark:text-emerald-400" />
            </div>
            <CardTitle className="text-base">History</CardTitle>
            <CardDescription>
              Visits and care episodes will show here after EMR integration.
            </CardDescription>
          </CardHeader>
        </Card>
        <Card className="shadow-sm">
          <CardHeader className="pb-2">
            <div className="text-muted-foreground mb-2 flex size-9 items-center justify-center rounded-lg bg-emerald-500/10">
              <Upload className="size-4 text-emerald-700 dark:text-emerald-400" />
            </div>
            <CardTitle className="text-base">Files and uploads</CardTitle>
            <CardDescription>
              Lab results and documents will be attachable to your record.
            </CardDescription>
          </CardHeader>
        </Card>
        <Card className="shadow-sm">
          <CardHeader className="pb-2">
            <div className="text-muted-foreground mb-2 flex size-9 items-center justify-center rounded-lg bg-emerald-500/10">
              <Share2 className="size-4 text-emerald-700 dark:text-emerald-400" />
            </div>
            <CardTitle className="text-base">Doctor access</CardTitle>
            <CardDescription>
              You will control what your treating physician can see.
            </CardDescription>
          </CardHeader>
        </Card>
        <Card className="shadow-sm">
          <CardHeader className="pb-2">
            <div className="text-muted-foreground mb-2 flex size-9 items-center justify-center rounded-lg bg-emerald-500/10">
              <FileText className="size-4 text-emerald-700 dark:text-emerald-400" />
            </div>
            <CardTitle className="text-base">Prescriptions and documents</CardTitle>
            <CardDescription>
              Related area for prescriptions and medical documents.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>

      <Card className="border-dashed">
        <CardHeader className="items-center pb-2 text-center sm:items-start sm:text-left">
          <CardTitle className="text-lg">No data yet</CardTitle>
          <CardDescription className="max-w-md">
            Book an appointment, join a video consultation, or open the
            organization directory — activity will appear here as services are
            connected.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:justify-center">
          <Button asChild>
            <Link href={routes.patient.appointments}>My appointments</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href={routes.patient.consultations}>Video consultations</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href={routes.patient.organisations}>Organizations</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href={routes.patient.chats}>Chats</Link>
          </Button>
        </CardContent>
      </Card>
    </main>
  );
}

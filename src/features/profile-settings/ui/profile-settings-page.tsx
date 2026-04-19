import { Settings2 } from "lucide-react";

import { ProfileSettingsForm } from "./profile-settings-form";

export function ProfileSettingsPage() {
  return (
    <div className="from-muted/35 min-h-full bg-linear-to-b via-background to-background">
      <main className="mx-auto flex w-full max-w-4xl flex-col gap-8 px-4 py-8 sm:px-6 lg:gap-10 lg:px-8 lg:py-10">
        <header className="space-y-4">
          <div
            className="h-px w-full max-w-md bg-linear-to-r from-primary/25 via-primary/10 to-transparent"
            aria-hidden
          />
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:gap-6">
            <div className="bg-card flex size-14 shrink-0 items-center justify-center rounded-2xl border shadow-sm ring-1 ring-black/5 dark:ring-white/10">
              <Settings2
                className="text-primary size-7"
                strokeWidth={1.75}
                aria-hidden
              />
            </div>
            <div className="min-w-0 flex-1 space-y-2">
              <h1 className="text-3xl font-semibold tracking-tight">
                Profile &amp; settings
              </h1>
              <p className="text-muted-foreground max-w-2xl text-sm leading-relaxed sm:text-[0.9375rem]">
                Review and update your account. Edits are saved to your Medlink
                profile and used wherever you sign in.
              </p>
            </div>
          </div>
        </header>

        <ProfileSettingsForm />
      </main>
    </div>
  );
}

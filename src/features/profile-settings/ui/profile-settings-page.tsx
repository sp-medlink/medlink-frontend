import { ProfileSettingsForm } from "./profile-settings-form";

export function ProfileSettingsPage() {
  return (
    <main className="mx-auto flex w-full max-w-3xl flex-col gap-6 p-4 sm:p-6 lg:p-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Profile & settings</h1>
        <p className="text-muted-foreground mt-1 text-sm">
          View and update your account details. Changes are saved to your Medlink profile.
        </p>
      </div>
      <ProfileSettingsForm />
    </main>
  );
}

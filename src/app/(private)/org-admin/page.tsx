import { LogoutButton } from "@/features/auth-logout";

export default function OrgAdminHomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 p-6">
      <h1 className="text-2xl font-semibold">Organization admin area</h1>
      <p className="text-muted-foreground text-sm">
        Membership in orgs_admins is resolved by the org-admin feature slice when it&apos;s
        built.
      </p>
      <LogoutButton />
    </main>
  );
}

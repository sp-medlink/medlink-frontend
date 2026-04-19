import { AdminOrganizationsList } from "@/widgets/admin-organizations";

export default function AdminOrganizationsPage() {
  return (
    <main className="mx-auto flex w-full max-w-6xl flex-col gap-6 p-6 md:p-8">
      <AdminOrganizationsList />
    </main>
  );
}

import { AdminAuditLog } from "@/widgets/admin-audit-log";

export default function AdminAuditPage() {
  return (
    <main className="mx-auto flex w-full max-w-6xl flex-col gap-6 p-6 md:p-8">
      <AdminAuditLog />
    </main>
  );
}

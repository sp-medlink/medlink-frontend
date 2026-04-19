import { AdminMyDepartments } from "@/widgets/admin-my-departments";

export default function AdminDepartmentsPage() {
  return (
    <main className="mx-auto flex w-full max-w-6xl flex-col gap-6 p-6 md:p-8">
      <AdminMyDepartments />
    </main>
  );
}

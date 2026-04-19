import { AdminDepartmentDetailDeptScope } from "@/widgets/admin-department-detail";

interface AdminDeptDetailPageProps {
  params: Promise<{ deptId: string }>;
}

export default async function AdminDeptDetailPage({
  params,
}: AdminDeptDetailPageProps) {
  const { deptId } = await params;
  return (
    <main className="mx-auto flex w-full max-w-6xl flex-col gap-6 p-6 md:p-8">
      <AdminDepartmentDetailDeptScope deptId={deptId} />
    </main>
  );
}

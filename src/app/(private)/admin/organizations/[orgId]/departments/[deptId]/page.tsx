import { AdminDepartmentDetailOrgScope } from "@/widgets/admin-department-detail";

interface AdminOrgDepartmentDetailPageProps {
  params: Promise<{ orgId: string; deptId: string }>;
}

export default async function AdminOrgDepartmentDetailPage({
  params,
}: AdminOrgDepartmentDetailPageProps) {
  const { orgId, deptId } = await params;
  return (
    <main className="mx-auto flex w-full max-w-6xl flex-col gap-6 p-6 md:p-8">
      <AdminDepartmentDetailOrgScope orgId={orgId} deptId={deptId} />
    </main>
  );
}

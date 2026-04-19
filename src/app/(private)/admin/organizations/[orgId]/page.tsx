import { AdminOrganizationDetail } from "@/widgets/admin-organization-detail";

interface AdminOrganizationDetailPageProps {
  params: Promise<{ orgId: string }>;
}

export default async function AdminOrganizationDetailPage({
  params,
}: AdminOrganizationDetailPageProps) {
  const { orgId } = await params;
  return (
    <main className="mx-auto flex w-full max-w-6xl flex-col gap-6 p-6 md:p-8">
      <AdminOrganizationDetail orgId={orgId} />
    </main>
  );
}

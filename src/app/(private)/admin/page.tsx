import {
  AdminConsoleHeader,
  AdminOverviewGrid,
} from "@/widgets/admin-overview";

/**
 * The unified admin landing page. One surface for all three admin flavours;
 * which entry cards appear depends on {@link useAdminCapabilities}.
 */
export default function AdminOverviewPage() {
  return (
    <main className="mx-auto flex w-full max-w-6xl flex-col gap-8 p-6 md:p-8">
      <AdminConsoleHeader />
      <section className="flex flex-col gap-3">
        <h2 className="text-sm font-medium uppercase tracking-wider text-neutral-600 dark:text-neutral-400">
          What you can manage
        </h2>
        <AdminOverviewGrid />
      </section>
    </main>
  );
}

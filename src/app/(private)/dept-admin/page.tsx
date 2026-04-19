export default function DeptAdminHomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 p-6">
      <h1 className="text-2xl font-semibold">Department admin area</h1>
      <p className="text-muted-foreground text-sm">
        Only doctors flagged as is_dept_admin have access here. Membership is resolved by the
        dept-admin feature slice when it&apos;s built.
      </p>
    </main>
  );
}

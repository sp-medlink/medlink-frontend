"use client";

/**
 * Catalog of doctors: no backend requests — list will be wired when API is ready.
 */
export function PatientDoctorsView() {
  return (
    <main className="mx-auto flex min-h-screen max-w-3xl flex-col gap-4 p-6">
      <header className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">Врачи</h1>
        <p className="text-muted-foreground text-sm">
          Каталог врачей здесь пока без загрузки с сервера. Чтобы написать врачу,
          используйте чат в панели справа, если у вас уже есть переписка.
        </p>
      </header>
    </main>
  );
}

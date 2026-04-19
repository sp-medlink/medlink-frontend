import type { ReactNode } from "react";

import { DocsSidebar } from "./docs-sidebar";

export function DocsShell({ children }: { children: ReactNode }) {
  return (
    <div className="mx-auto w-full max-w-screen-xl flex-1 px-4 py-8 sm:px-6 lg:px-8 md:grid md:grid-cols-[220px_minmax(0,1fr)] md:gap-10 lg:grid-cols-[240px_minmax(0,1fr)_200px] lg:gap-12">
      <aside className="hidden md:block">
        <div className="sticky top-20 max-h-[calc(100vh-5rem)] overflow-y-auto pb-10 pr-2">
          <DocsSidebar />
        </div>
      </aside>
      {children}
    </div>
  );
}

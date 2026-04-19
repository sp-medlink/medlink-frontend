import type { Metadata } from "next";
import type { ReactNode } from "react";

import { DocsShell } from "@/widgets/docs-shell";
import { SiteFooter } from "@/widgets/site-footer";
import { SiteHeader } from "@/widgets/site-header";

export const metadata: Metadata = {
  title: {
    default: "Medlink docs",
    template: "%s · Medlink",
  },
};

export default function StaticLayout({ children }: { children: ReactNode }) {
  return (
    <div className="bg-background flex min-h-screen flex-col">
      <SiteHeader />
      <DocsShell>{children}</DocsShell>
      <SiteFooter />
    </div>
  );
}

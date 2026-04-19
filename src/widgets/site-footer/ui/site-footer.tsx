import Link from "next/link";
import type { Route } from "next";
import { Stethoscope } from "lucide-react";

type FooterGroup = {
  title: string;
  links: Array<{ href: Route; label: string }>;
};

const groups: FooterGroup[] = [
  {
    title: "Product",
    links: [
      { href: "/for-doctors", label: "For doctors" },
      { href: "/for-clinics", label: "For clinics" },
    ],
  },
  {
    title: "Help",
    links: [
      { href: "/help", label: "Help & contact" },
      { href: "/emergency", label: "Emergencies" },
    ],
  },
  {
    title: "Policies",
    links: [
      { href: "/medical", label: "Medical" },
      { href: "/legal", label: "Legal" },
    ],
  },
  {
    title: "Company",
    links: [{ href: "/about", label: "About Medlink" }],
  },
];

export function SiteFooter() {
  return (
    <footer className="border-border/60 bg-muted/20 mt-auto border-t">
      <div className="mx-auto w-full max-w-screen-xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-10 md:grid-cols-5">
          <div className="md:col-span-1">
            <Link
              href="/"
              className="flex items-center gap-2 font-semibold tracking-tight"
            >
              <Stethoscope
                className="size-5 text-emerald-600 dark:text-emerald-400"
                aria-hidden
              />
              <span>Medlink</span>
            </Link>
            <p className="text-muted-foreground mt-3 max-w-xs text-sm leading-relaxed">
              A unified telemedicine platform built on privacy, trust, and
              low-friction workflow.
            </p>
            <p className="text-muted-foreground/80 mt-4 text-xs">
              A senior project from Nazarbayev University, Astana.
            </p>
          </div>

          {groups.map((group) => (
            <div key={group.title}>
              <h3 className="text-foreground text-sm font-semibold">
                {group.title}
              </h3>
              <ul className="mt-3 space-y-2">
                {group.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-muted-foreground hover:text-foreground text-sm transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="border-border/60 mt-10 flex flex-col items-start justify-between gap-3 border-t pt-6 text-xs sm:flex-row sm:items-center">
          <p className="text-muted-foreground">
            © {new Date().getFullYear()} Medlink. All rights reserved.
          </p>
          <p className="text-muted-foreground">
            Not an emergency service. In case of a medical emergency, call{" "}
            <Link href="/emergency" className="underline underline-offset-4">
              local emergency services
            </Link>
            .
          </p>
        </div>
      </div>
    </footer>
  );
}

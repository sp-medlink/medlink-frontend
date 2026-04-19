import type { Route } from "next";

export type DocsNavLink = {
  title: string;
  href: Route;
  badge?: string;
};

export type DocsNavGroup = {
  title: string;
  items: DocsNavLink[];
};

export const docsNav: DocsNavGroup[] = [
  {
    title: "Overview",
    items: [
      { title: "About Medlink", href: "/about" },
      { title: "Help & contact", href: "/help" },
    ],
  },
  {
    title: "Policies",
    items: [
      { title: "Medical policies", href: "/medical" },
      { title: "Legal", href: "/legal" },
    ],
  },
];

export function flattenDocsNav(nav: DocsNavGroup[]): DocsNavLink[] {
  return nav.flatMap((group) => group.items);
}

export function findDocsNeighbors(pathname: string) {
  const flat = flattenDocsNav(docsNav);
  const idx = flat.findIndex((item) => item.href === pathname);
  if (idx === -1) return { prev: undefined, next: undefined };
  return {
    prev: idx > 0 ? flat[idx - 1] : undefined,
    next: idx < flat.length - 1 ? flat[idx + 1] : undefined,
  };
}

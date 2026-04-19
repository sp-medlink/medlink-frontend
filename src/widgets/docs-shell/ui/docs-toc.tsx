export type DocsTocItem = {
  id: string;
  title: string;
  depth?: 2 | 3;
};

export function DocsToc({ items }: { items: DocsTocItem[] }) {
  return (
    <nav aria-label="On this page" className="text-sm">
      <p className="text-foreground mb-3 text-xs font-semibold uppercase tracking-wider">
        On this page
      </p>
      <ul className="flex flex-col gap-1.5">
        {items.map((item) => (
          <li key={item.id}>
            <a
              href={`#${item.id}`}
              className={
                "text-muted-foreground hover:text-foreground block transition-colors " +
                (item.depth === 3 ? "pl-3" : "")
              }
            >
              {item.title}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}

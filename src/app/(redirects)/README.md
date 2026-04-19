# `(redirects)` route group

Pages whose sole purpose is to issue a server-side `redirect()` from a legacy
or alias URL to the canonical one. Each page is a tiny server component:

```tsx
import { redirect } from "next/navigation";
export default function Page() { redirect("/patient/appointments"); }
```

Prefer this over `next.config` `redirects` only when the redirect target is
computed (e.g. based on role or a DB lookup). Static URL→URL rewrites still
belong in `next.config.mjs`.

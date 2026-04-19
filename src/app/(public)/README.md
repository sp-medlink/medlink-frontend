# `(public)` route group

Publicly accessible pages that are neither authentication-related nor purely
static marketing. Examples of future inhabitants:

- `/doctors/[doctorId]` — public doctor profile (SEO-indexable)
- `/organizations/[organizationId]` — public org/clinic page

These pages must **not** assume an authenticated session. If a feature needs a
token, it belongs under `(private)`.

Structure mirrors `(private)`:

```
(public)/
  layout.tsx         # shell for public pages (header, footer, etc.)
  <segment>/
    page.tsx
```

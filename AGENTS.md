# Medlink frontend — conventions

This document is the source of truth for **how** we write code in this repo. If
code you are writing contradicts something here, either update your code or
open a PR that updates this doc with reasoning — don't silently diverge.

## 1. Architecture: Feature-Sliced Design

Five layers, strict top-down dependency direction:

```
app  →  widgets  →  features  →  entities  →  shared
```

- **Lower layers never import from higher layers.** `shared` never imports
  `entities`, `entities` never imports `features`, etc.
- **Sibling slices within the same layer never import each other.** A feature
  cannot import another feature; one entity cannot import another entity.
  Cross-slice reuse goes through `shared` or through a shared entity.
- **Pages (`src/app/**`) are thin.** They import from `widgets`, `features`,
  and `entities`; they do not contain business logic.

### Slice internal structure

Every slice looks like:

```
<layer>/<slice-name>/
  index.ts          # public API — the ONLY file other slices may import
  model/            # domain types, zod schemas, zustand stores, selectors
  api/              # DTOs, mappers, raw fetchers, query keys, query options
  ui/               # React components specific to the slice
  lib/              # slice-local utilities (optional)
```

### Public API rule

**Cross-slice imports go through `index.ts` only.** Deep imports like
`@/entities/appointment/api/appointment.api` from a feature are forbidden.
Within a slice you import its own internals freely — that's the slice's
private surface.

## 2. API boundary: DTO in, domain out

The server speaks `snake_case`. The frontend speaks `camelCase`. The boundary
between them lives in `<entity>/api/`:

| File | Purpose |
|---|---|
| `api/dto.ts` | `snake_case` shapes exactly as the backend returns/accepts. Named `<Thing>ApiDto`, `<Thing>ApiResponse`. |
| `api/mapper.ts` | Pure functions `to<Thing>(dto)` / `to<Thing>Dto(domain)`. |
| `api/<entity>.api.ts` | Raw fetchers using `apiFetch`. Accept/return **domain** types; call the mapper inside. |
| `model/types.ts` | `camelCase` domain types used by UI and features. |

**No UI code ever touches a DTO.** If you're writing a component and you see
`first_name`, something went wrong upstream.

Reference implementation: `src/entities/session/` and
`src/entities/appointment/`.

## 3. React Query convention

We use **[query key factories](https://tkdodo.eu/blog/effective-react-query-keys)**
per entity + **`queryOptions()` factories** per query. There is **no** central
`query-keys.ts` and there is no `useXxxQuery` custom hook unless a query
needs component-local side effects (e.g. syncing into a Zustand store).

### Keys: per-entity factory object

Every entity that has queries owns a file `api/<entity>.keys.ts`:

```ts
export const appointmentKeys = {
  all: () => ["appointment"] as const,
  lists: () => [...appointmentKeys.all(), "list"] as const,
  list: () => [...appointmentKeys.lists()] as const,
  details: () => [...appointmentKeys.all(), "detail"] as const,
  detail: (id: string) => [...appointmentKeys.details(), id] as const,
} as const;
```

Rules:

- `all()` returns `["<entity>"]` — the entity's root namespace.
- Plural collection nodes (`lists()`, `details()`) have no args and act as
  invalidation prefixes.
- Singular leaves (`list()`, `detail(id)`) identify a specific cache entry.
  Add a parameter (e.g. `list: (filters: AppointmentListFilters) =>
  [...appointmentKeys.lists(), filters] as const`) **the moment** a feature
  needs filtered lists — never pre-emptively, or you end up with `{}` in
  every cache key for no reason.
- Everything ends in `as const` so the tuple type flows through.
- Invalidate precisely:
  ```ts
  queryClient.invalidateQueries({ queryKey: appointmentKeys.lists() });   // every list variant
  queryClient.invalidateQueries({ queryKey: appointmentKeys.detail(id) }); // one specific detail
  queryClient.invalidateQueries({ queryKey: appointmentKeys.all() });      // nuclear
  ```

### Query options: reusable, typed factories

Each entity owns `api/<entity>.queries.ts` with `queryOptions()` factories:

```ts
import { queryOptions } from "@tanstack/react-query";

export const appointmentsListOptions = () =>
  queryOptions({
    queryKey: appointmentKeys.list(),
    queryFn: fetchMyAppointments,
  });

export const appointmentDetailOptions = (id: string) =>
  queryOptions({
    queryKey: appointmentKeys.detail(id),
    queryFn: () => fetchMyAppointment(id),
    enabled: !!id,
  });
```

Why factories, not objects:

- Type inference flows through: callers get full `UseQueryOptions<Appointment[]>`
  without restating generics.
- Reusable across `useQuery`, `useSuspenseQuery`, `prefetchQuery`, and
  `ensureQueryData`.
- Parameters live on the factory, not sprinkled in call sites.

### Consumption

Features consume via `useQuery`:

```ts
import { useQuery } from "@tanstack/react-query";
import { appointmentDetailOptions } from "@/entities/appointment";

const { data, isLoading } = useQuery(appointmentDetailOptions(appointmentId));
```

Seeding cache after a mutation uses the same key factory — no string drift:

```ts
queryClient.setQueryData(appointmentKeys.detail(id), appointment);
```

### Mutations live in features, not entities

Entities expose **reads** (queryOptions + raw fetchers). A **write** is a user
action, which means it's a feature. Place the mutation in the owning feature:

```
features/book-appointment/
  api/book-appointment.mutation.ts    # useBookAppointmentMutation
  model/schema.ts                     # zod form schema
  ui/book-appointment-form.tsx
  index.ts
```

The mutation calls the raw fetcher from the entity and handles cache
invalidation using the entity's key factory:

```ts
export function useBookAppointmentMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: createAppointment, // from entities/appointment
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: appointmentKeys.lists() });
    },
  });
}
```

This keeps entities pure data and features carry user intent.

## 4. Forms

- Form values are validated with **zod**; schemas live in
  `features/<feature>/model/schema.ts`.
- `react-hook-form` + `@hookform/resolvers/zod`.
- Field schemas drive error messages; forms never hardcode validation.
- Use shadcn primitives (`@/shared/ui/*`). For complex forms adopt the
  shadcn `<Form>` / `<FormField>` wrappers (already available).

## 5. Routing (Next.js App Router)

- `src/app/` hosts Next.js routing **and** the FSD `app` layer
  (providers, global styles).
- Route groups carve up the tree without affecting URLs:
  - `(auth)` — unauthenticated-only pages (login, signup). Its layout uses
    `RedirectIfAuthenticated` to bounce authed users to their role home.
  - `(private)` — authenticated pages. Its root layout uses `RequireAuth`;
    each `<role>/layout.tsx` under it uses `RequireRole`.
  - `(public)` — publicly indexable app pages (doctor profiles, org pages).
  - `(static)` — static content (terms, privacy).
  - `(redirects)` — pages whose sole job is `redirect()`.
  - `(mobile)` — reserved for a future mobile UI tree.
- **Layouts are server components by default.** They compose client guards
  (`RequireAuth`, `RequireRole`, `RedirectIfAuthenticated`) around `children`.
  Don't put `"use client"` at the top of a layout unless the layout itself
  needs hooks.
- **Pages don't re-apply guards** that their layout already applies.
- Dynamic segments are **named, never `[id]`**: `[appointmentId]`,
  `[doctorId]`, `[organizationId]`, `[chatId]`, `[departmentId]`.
- Use the `Metadata` API on role layouts with a `title.template` so inner
  pages contribute to the title via `title: "Appointments"`.

## 6. Entity status matrix

Not every entity is wired to the backend. Before importing from one, check
its status — pulling a type-only stub into a feature and shipping it risks
drifting from the real API shape.

| Entity | Types | DTO + mapper | Fetchers | Keys + queryOptions | Status |
|---|---|---|---|---|---|
| `session` | ✓ | ✓ | ✓ | ✓ | **wired** — reference slice |
| `appointment` | ✓ | ✓ | ✓ | ✓ | **wired** — reference slice |
| `user` | ✓ | — | — | — | stub |
| `chat` | ✓ | — | — | — | stub (includes `ChatWsEvent` union for the future chat feature) |
| `doctor` | ✓ | — | — | — | stub |
| `department` | ✓ | — | — | — | stub |
| `organization` | ✓ | — | — | — | stub |
| `schedule` | ✓ | — | — | — | stub |

Before writing a feature against a stub: fill in its `api/` + `queries.ts`
following the checklist below, open a separate PR with just that wiring, then
build on top.

## 7. Checklist: adding a new entity

1. `entities/<name>/model/types.ts` — camelCase domain types.
2. `entities/<name>/api/dto.ts` — snake_case server shapes.
3. `entities/<name>/api/mapper.ts` — `to<Name>(dto)`.
4. `entities/<name>/api/<name>.api.ts` — raw fetchers.
5. `entities/<name>/api/<name>.keys.ts` — `const <name>Keys = { all, lists, list, details, detail }`.
6. `entities/<name>/api/<name>.queries.ts` — `queryOptions()` factories.
7. `entities/<name>/index.ts` — barrel exports everything consumers need.

## 8. Checklist: adding a new feature

1. `features/<name>/model/schema.ts` — zod form schema (if the feature has a form).
2. `features/<name>/api/<name>.mutation.ts` — `useMutation` that calls an
   entity fetcher and invalidates the entity's keys.
3. `features/<name>/ui/<name>-form.tsx` (or other UI) — consumes shadcn
   primitives and the mutation hook.
4. `features/<name>/index.ts` — export the `UI` component + schema type.
5. Mount on a page under `src/app/(private)/<role>/...`.

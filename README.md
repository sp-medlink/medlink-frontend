# medlink-frontend

Frontend for the Medlink telemedicine platform, talking to [`medlink-api`](../medlink-api) (Go).

## Stack

- **Next.js 15** — App Router, `typedRoutes`, TypeScript strict
- **Tailwind CSS v4** + **shadcn/ui** (22 primitives pre-installed under `src/shared/ui/`)
- **TanStack Query v5** — server state, with per-entity key factories + `queryOptions()`
- **Zustand v5** — client-only state; session persisted to `localStorage`
- **react-hook-form** + **zod** + **@hookform/resolvers/zod** — forms
- **sonner** — toasts
- **lucide-react** — icons
- **react-use-websocket** — chat subscription
- **@livekit/components-react** + **livekit-client** — video consultations

## Quickstart

```bash
yarn install
cp .env.example .env.local
yarn dev
```

App runs at <http://localhost:3000>. You need `medlink-api` running on `http://localhost:8888`.

## Scripts

| Command | Purpose |
| --- | --- |
| `yarn dev` | dev server (Turbopack) |
| `yarn build` | production build |
| `yarn start` | serve production build |
| `yarn lint` | ESLint (`next/core-web-vitals` + project guardrails) |
| `yarn typecheck` | `tsc --noEmit` |

## Architecture

Feature-Sliced Design, five layers, strict top-down import direction:

```
app → widgets → features → entities → shared
```

Conventions (boundary rules, React Query patterns, form patterns, routing, checklists for adding entities/features) live in [`AGENTS.md`](./AGENTS.md). **Read it before your first PR.**

Security strategy (CSP, nonce middleware, storage policy, phase plan for cookie migration) lives in [`docs/auth.md`](./docs/auth.md).

### Folder map

```
src/
├── app/                            Next.js App Router + FSD app layer
│   ├── layout.tsx                  root layout, mounts <RootProviders>
│   ├── page.tsx                    / — redirects based on role
│   ├── loading.tsx                 global loading UI
│   ├── error.tsx                   global error boundary
│   ├── not-found.tsx               global 404
│   ├── _providers/                 QueryProvider, ApiClientBootstrap, Toaster, TooltipProvider
│   ├── styles/globals.css          Tailwind v4 + shadcn CSS variables
│   ├── (auth)/                     login, signup — bounce authed users via RedirectIfAuthenticated
│   ├── (private)/                  authed area — layout applies RequireAuth
│   │   ├── patient/                RequireRole="user"
│   │   ├── doctor/                 RequireRole="doctor"
│   │   ├── admin/                  RequireRole="admin"
│   │   ├── dept-admin/             RequireRole (placeholder — see AGENTS.md)
│   │   └── org-admin/              (guard to be added with the feature slice)
│   ├── (public)/                   reserved: SEO-indexable pages
│   ├── (static)/                   reserved: terms, privacy
│   ├── (redirects)/                reserved: pure redirect endpoints
│   └── (mobile)/                   reserved: future mobile UI tree
│
├── widgets/                        (empty — add on demand)
│
├── features/                       user-facing interactions
│   ├── auth-login/                 LoginForm + useLoginMutation
│   ├── auth-signup/                SignupForm + useSignupMutation (auto-logs in after signup)
│   └── auth-logout/                LogoutButton + useLogout
│
├── entities/                       business models
│   ├── session/                    store, /user/me, guards, sessionKeys, meQueryOptions
│   ├── appointment/                full slice: dto + mapper + api + keys + queries
│   ├── user/                       type-only stub
│   ├── organization/               type-only stub
│   ├── department/                 type-only stub
│   ├── doctor/                     type-only stub
│   ├── schedule/                   type-only stub
│   └── chat/                       type-only stub (includes ChatWsEvent union)
│
├── shared/                         framework-agnostic infrastructure
│   ├── api/                        apiFetch client + ApiError (Herodot-shaped)
│   ├── config/                     env, BASE_ROLES/APP_ROLES, routes
│   ├── lib/                        cn(), decodeJwt/isExpired
│   ├── ui/                         shadcn primitives (button, input, form, dialog, table, …)
│   └── ws/                         wsUrl() builder (for chat subscription)
│
└── middleware.ts                   per-request nonce + CSP + security headers
```

## Shadcn components

Already installed in `src/shared/ui/`:

`alert`, `alert-dialog`, `avatar`, `badge`, `button`, `calendar`, `card`, `checkbox`, `dialog`, `dropdown-menu`, `form`, `input`, `label`, `popover`, `scroll-area`, `select`, `separator`, `sheet`, `skeleton`, `switch`, `table`, `tabs`, `textarea`, `tooltip`.

Add more on demand:

```bash
yarn dlx shadcn@latest add <name>
```

`components.json` targets `src/shared/ui/` and wires `cn()` from `@/shared/lib/utils`.

## Backend contract (summary)

- **Base URL**: `http://localhost:8888`
- **Auth**: `Authorization: Bearer <jwt>`, 24h TTL, issued by `POST /user/signup` + `POST /user/login`. See [`docs/auth.md`](./docs/auth.md) for the full model, XSS hardening, and the planned cookie migration.
- **Base roles (DB)**: `user`, `doctor`, `admin`.
- **Derived app roles (frontend)**: `patient` (= `user`), `dept-admin`, `org-admin` — the latter two are relationships (`orgs_admins`, `doctors_departments.is_dept_admin`), not base roles. Their feature slices will resolve membership when built.
- **Error body**: Herodot `{ error: { code, status, reason, message } }` → `ApiError` in `@/shared/api`.
- **Realtime chat**: WebSocket `ws://localhost:8888/user/ws/chats/{chatId}` — token passed as `?token=` via `wsUrl()` helper (needs a backend change to accept it; see [`docs/auth.md`](./docs/auth.md#open-backend-gaps)).
- **Video**: LiveKit token from `GET /user/me/appointments/{apptId}/vc`.

## What's scaffolded vs what isn't

**Wired end-to-end:**
- Session management, JWT handling, route guards, `/user/me` rehydration.
- Login / signup / logout flows.
- Appointment entity (types + fetchers + query options) — ready for a feature slice to consume.
- CSP + security headers via middleware (nonce-based in prod; relaxed in dev for Turbopack HMR).
- ESLint guardrails: `react/no-danger` + `medlink.session` storage-key restriction.

**Not built yet:**
- Widgets (app shell, nav, sidebars).
- Feature slices beyond auth: `book-appointment`, `cancel-appointment`, `join-video-call`, `send-chat-message`, `subscribe-chat-events`, `submit-doctor-verification`, `review-doctor-verification`, admin dashboards.
- Entity API slices for `chat`, `department`, `doctor`, `organization`, `schedule`, `user` — currently type-only stubs.
- Membership resolution for `dept-admin` / `org-admin` (guards are placeholders).

Pick a slice from the "Not built yet" list, follow the checklists in [`AGENTS.md`](./AGENTS.md) §6/§7, and submit a PR.

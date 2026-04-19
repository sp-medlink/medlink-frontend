# Authentication (Option A — Bearer tokens)

> **Decision record.** We authenticate against `medlink-api` using `Authorization: Bearer <jwt>` and persist the token in `localStorage` (via Zustand `persist`). This is the *current* approach. See [Future: migrate to cookie-based auth](#future-migrate-to-cookie-based-auth) for the planned exit path.

## Why Option A

The backend today only reads `r.Header.Get("Authorization")` (see `medlink-api/pkg/middleware/standard/request_auth.go`), so any other model would require coordinated backend changes. We chose to ship on the existing contract and harden it instead of blocking on a refactor.

**Tradeoffs we explicitly accepted:**

- ✅ Zero backend changes — works against `medlink-api` as-is.
- ✅ Trivial to call from Postman / mobile / CLI — just set a header.
- ✅ No CSRF surface (browsers never auto-attach `Authorization`).
- ⚠️ **Primary risk: XSS.** Any script on our origin can read the token from `localStorage`. We mitigate this with strict CSP, zero third-party scripts, and dependency hygiene (see [XSS hardening](#xss-hardening)).
- ⚠️ **WebSockets** cannot set an `Authorization` header from the browser. We pass the token via `?token=…` query string as a temporary workaround. This **requires a backend change** to `WSRequireUserMiddleware` (see [Open backend gaps](#open-backend-gaps)).
- ⚠️ No refresh tokens. The backend issues a 24h JWT with no refresh endpoint — when it expires the user re-logs in.

## Backend contract (recap)

| Concern                | Value                                                                                         |
| ---------------------- | --------------------------------------------------------------------------------------------- |
| Login endpoint         | `POST /user/login` → `{ token, token_type: "Bearer", expires_in: 86400 }`                     |
| Signup endpoint        | `POST /user/signup` → `{ user_id }` (does **not** return a token — must call login after)     |
| Token algorithm        | HS256, shared secret `JWT_SECRET`                                                             |
| Token claims           | `{ p: { uid: "<user-uuid>" }, exp: <unix> }` — **no roles in the JWT**                        |
| Token TTL              | 24 hours (`JWTTokenTTL`)                                                                      |
| Auth header            | `Authorization: Bearer <token>` on every authenticated request                                |
| Roles source           | Fetched per-request from DB by the backend (`users_roles` join). Frontend learns via `/user/me`. |
| Error shape on 401/403 | Herodot: `{ error: { code, status, reason, message } }`                                       |

## End-to-end flow

```
┌───────────┐ 1. POST /user/signup          ┌────────────┐
│  Browser  │ ────────────────────────────▶ │ medlink-api│
│           │ ◀──────────────────────────── │            │
│           │   { user_id }                 └────────────┘
│           │
│           │ 2. POST /user/login           ┌────────────┐
│           │ ────────────────────────────▶ │ medlink-api│
│           │ ◀──────────────────────────── │            │
│           │   { token, expires_in }       └────────────┘
│  Zustand  │ 3. setToken(token, expiresAt) → persisted to localStorage ("medlink.session")
│           │
│           │ 4. GET /user/me                ┌────────────┐
│           │   Authorization: Bearer …     │ medlink-api│
│           │ ────────────────────────────▶ │            │
│           │ ◀──────────────────────────── │            │
│           │   { user { id, roles, … } }   └────────────┘
│           │ 5. setUser(user) → hydrates session.user.roles
│           │
│           │ 6. Any request                ┌────────────┐
│           │   Authorization: Bearer …     │ medlink-api│
│           │ ────────────────────────────▶ │            │
│           │ ◀──────────────────────────── │            │
│           │     2xx / 401 / 403           └────────────┘
│  on 401   │ 7. clear() → redirect /login
└───────────┘
```

## Where each piece lives

| Concern                                  | File                                            |
| ---------------------------------------- | ----------------------------------------------- |
| Token storage (Zustand + `localStorage`) | `src/entities/session/model/session-store.ts`   |
| Session types                            | `src/entities/session/model/types.ts`           |
| Role + auth selectors                    | `src/entities/session/model/selectors.ts`       |
| `GET /user/me`                           | `src/entities/session/api/me.api.ts`            |
| `RequireAuth` / `RequireRole` / `RedirectIfAuthenticated` | `src/entities/session/ui/`         |
| `apiFetch` (header injection + 401 hook) | `src/shared/api/client.ts`                      |
| JWT decode / expiry check                | `src/shared/lib/jwt.ts`                         |
| WebSocket URL builder (`?token=`)        | `src/shared/ws/websocket-url.ts`                |
| `configureApiClient` wiring              | `src/app/_providers/api-client-bootstrap.tsx`   |
| TanStack Query provider                  | `src/app/_providers/query-provider.tsx`         |

### Key contracts to preserve

```ts
// src/shared/api/client.ts
configureApiClient({
  getToken: () => getSessionToken(),      // returns null if missing or expired
  onUnauthorized: () => {
    useSessionStore.getState().clear();
    // router.replace("/login")           // wired from the provider
  },
});
```

```ts
// src/entities/session/model/session-store.ts (contract)
useSessionStore.getState().setToken(token, expiresAt);   // after login
useSessionStore.getState().setUser(user);                // after fetchMe()
useSessionStore.getState().clear();                      // on 401 / logout
```

## Rules for contributors

1. **Never** read or write `localStorage.medlink.session` directly. Always go through `useSessionStore` / `getSessionToken`.
2. **Never** call `fetch` directly for backend requests — always use `apiFetch` from `@/shared/api`. It injects the token and normalizes errors.
3. **Never** put the raw JWT into the URL (logs, history, analytics leak it). The one exception is the WebSocket upgrade (`wsUrl` in `shared/ws`) until the backend accepts another method.
4. **Never** log the token or the entire `Session` object. If you need to debug, log `{ uid, expiresAt }` at most.
5. **Never** inject untrusted HTML. No `dangerouslySetInnerHTML` without an explicit sanitizer. No eval, no `Function(...)`, no `innerHTML = userInput`.
6. **Never** add a `<script src="…">` pointing to a third-party CDN. Self-host or don't ship it.
7. **Protected pages**: wrap with `<RequireAuth>` (and `<RequireRole>` if applicable) at the layout level — don't scatter role checks in components.
8. **Expiry**: treat `getSessionToken()` returning `null` as "not logged in", even if `session` is set. The getter already filters out expired tokens.
9. **Logout**: call `useSessionStore.getState().clear()` and navigate to `/login`. There is no server-side logout endpoint (the JWT remains valid until `exp`; this is acceptable because Option A doesn't use cookies).
10. **TanStack Query**: set the query key for "me" via `sessionKeys.me()` (from `entities/session`) and invalidate it after any profile mutation.

## XSS hardening (the real defense of Option A)

Because the token lives in a place JS can read, the mitigation is **making sure no unexpected JS can run on our origin.**

### Implemented: security headers in `src/middleware.ts`

Every response goes through `src/middleware.ts`, which generates a fresh base64 nonce per request and sets:

- **`Content-Security-Policy`** — strict in prod (`script-src 'self' 'nonce-…' 'strict-dynamic'`), relaxed in dev (adds `'unsafe-inline' 'unsafe-eval'` because Turbopack's HMR runtime doesn't carry nonces). `connect-src` is built from `NEXT_PUBLIC_API_BASE_URL` / `NEXT_PUBLIC_WS_BASE_URL` + LiveKit hosts so the same code works in every environment.
- **`X-Frame-Options: DENY`** + `frame-ancestors 'none'` — no embedding.
- **`X-Content-Type-Options: nosniff`**.
- **`Referrer-Policy: strict-origin-when-cross-origin`**.
- **`Permissions-Policy`** — camera + mic granted to `self` (LiveKit), geolocation and payment denied.

Next.js 15 reads the `Content-Security-Policy` request header we set and auto-applies the nonce to its own injected scripts.

### Phase 2 (not done yet)

- Enable CSP `require-trusted-types-for 'script'` once we audit the codebase for violators.
- Flip CSP to enforce-only; add a reporter endpoint (`report-to` / `report-uri`) so violations surface before users hit them.
- Remove `'unsafe-inline'` from `style-src` — needs a Tailwind/CSS-in-JS audit first.
- `yarn audit --level high` in CI; fail on high/critical.
- HTTPS everywhere in non-local environments (mixed-content opens XSS vectors even with our CSP).

### Operational policies (non-header)

- **No third-party scripts.** No Google Analytics, Hotjar, Intercom, etc. unless we accept the XSS risk and pin a CSP exception with an SRI hash. Self-host what we need.
- **Subresource Integrity** on any external assets we do load (`<script integrity=…>` / `<link integrity=…>`).
- **Supply chain**: pin exact versions for auth-path libs (`jwt-decode`, `zustand`); Renovate with manual approval on those packages.
- **Sanitize user HTML** with `DOMPurify` server-side if we ever render rich-text.

### Enforced by ESLint (`eslint.config.mjs`)

- `react/no-danger: "error"` — bans `dangerouslySetInnerHTML`. React escapes by default; keep it that way.
- `no-restricted-syntax` — any `"medlink.session"` string literal outside `src/entities/session/model/session-store.ts` fails lint. Nothing else may read or write that storage key.

## WebSocket authentication

The browser `WebSocket` API does **not** allow setting `Authorization`. Our workaround:

```ts
// src/shared/ws/websocket-url.ts
wsUrl("/user/ws/chats/<chat_id>", getSessionToken());
// → ws://localhost:8888/user/ws/chats/<chat_id>?token=…
```

This requires the backend's `WSRequireUserMiddleware` to accept the token via query string. **Currently it does not** — it only reads the `Authorization` header. Until the backend adds that support, chat WebSocket subscriptions will fail.

See [Open backend gaps](#open-backend-gaps).

## Session lifecycle

### Sign up

1. `POST /user/signup` with `SignUpInput`. Returns `{ user_id }`.
2. Immediately call `POST /user/login` with the same credentials to get a token.
3. `setToken(token, expiresAt)` where `expiresAt = Math.floor(Date.now()/1000) + expires_in`.
4. `fetchMe()` → `setUser(user)` so guards know the roles.

### Log in

1. `POST /user/login` → `{ token, expires_in }`.
2. `setToken(…)`.
3. `fetchMe()` → `setUser(…)`.

### Authenticated request

- `apiFetch` reads `getSessionToken()`. If it returns `null` (missing or expired), the request goes without the header — the backend will 401, which triggers the unauthorized handler.
- On 401 response, `apiFetch` calls `onUnauthorized()`, which clears the session. Route guards then redirect to `/login`.

### Log out

```ts
useSessionStore.getState().clear();
queryClient.clear(); // drop any cached personal data
router.replace("/login");
```

No backend call is required (and none exists). The JWT remains valid until `exp`; this is acceptable for Option A.

## Role handling

- **Base roles from the backend DB** (`users_roles`): `user`, `doctor`, `admin`. The JWT does **not** include them — we get them from `/user/me`.
- **App roles (frontend personas)**: `patient`, `doctor`, `dept-admin`, `org-admin`, `admin`. `patient` is the `user` base role renamed for clarity in the UI. `dept-admin` / `org-admin` are **not** base roles — they are DB relationships (`orgs_admins`, `doctors_departments.is_dept_admin = true`). Presence of those relationships is discovered by calling the matching endpoints (they'll 200 or 403).
- Use `useAppRole()` / `resolveAppRole()` selectors from `entities/session`. Gate pages with `<RequireRole role="doctor">`.

## Open backend gaps

These should be raised with the backend owner; they do not block everything but they block specific features:

1. **WebSocket token acceptance.** `WSRequireUserMiddleware` must accept the token via `?token=…` (or `Sec-WebSocket-Protocol`). Without this, chat realtime does not work from the browser.
2. **`GET /user/me` endpoint.** We rely on this to learn the user's roles after login. If the backend does not expose it, we will need either a dedicated endpoint or roles added to the login response.
3. **CORS in production.** `AllowOriginFunc: func(origin string) bool { return true }` combined with `AllowCredentials: true` is safe enough in local dev (we send no cookies and no credentials) but should become an allowlist before we ship.
4. **Rate limiting / brute-force protection** on `/user/login`. Nothing in the frontend can stop credential-stuffing — this is a backend concern worth naming here so it is not forgotten.

## Future: migrate to cookie-based auth

When the backend adds `HttpOnly; Secure; SameSite=Lax` session cookies on login + cookie fallback in `RequestAuthenticator`, the frontend change is small by design:

1. `src/shared/api/client.ts` — drop `Authorization` header injection; add `credentials: "include"` to the `fetch` call. Remove the `configureApiClient` token getter.
2. `src/entities/session/model/session-store.ts` — remove `token` / `expiresAt`; keep only `user`. `hydrate` on boot by calling `fetchMe()` (a 401 simply means logged out).
3. `src/shared/ws/websocket-url.ts` — drop the `?token=` parameter; the browser will attach the cookie automatically.
4. `src/shared/lib/jwt.ts` — delete (no client-side token inspection needed).
5. Add a `POST /user/logout` call to `clear()`.

Everything else (guards, role selectors, query keys, CSP) stays. No feature code changes.

Track this work under the label `auth-migration` when we pick it up.

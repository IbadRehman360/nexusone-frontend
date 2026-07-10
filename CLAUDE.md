<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->


# NexusOne Frontend — Rewrite: Project Context & Conventions

> Resumption point for new chats. This is the **rewrite** app (Next.js 15, React 19, Tailwind 4, TanStack Query 5, Redux Toolkit). It is being built page-by-page to reach full functional + visual parity with an older reference app, using only real backend data and this app's own reusable UI primitives — never one-off styling, never fabricated data.
>
> Update this file at the end of each session with what changed — rewrite stale sections rather than appending a changelog.

---

## 1. What we're doing

Porting the Power Platform admin console (and now the shared app-shell: header, tenant switcher, presence, billing, members, support, activity/audit logs) from an older reference app into this rewrite, one page/feature at a time. The approach for every page:

1. Read the real backend controller/service (NestJS, `Nexusone_backend`) for the endpoint(s) involved — confirm the actual route, guard, and response shape before writing a single line of frontend code. Never assume a field name; verify it in the source.
2. If the old reference app already implements the feature, read its component/hook/service to understand the real data flow and UX — then **rebuild it using this app's own components**, not the old app's markup/classes.
3. If a real backend gap is found while wiring something up (e.g. a socket gateway that only accepts a JS-readable token when this app is httpOnly-cookie-only), fix the backend minimally and note it — don't paper over it with fake client-side data.
4. Never fabricate data, counts, or endpoints. If something can't be verified as real, say so and ask rather than guessing.

## 2. Reusable components — non-negotiable priority

**Before writing any new UI, check whether an existing primitive already does the job.** This is the single most important rule in this codebase. The established primitives:

| Primitive | Path | Use for |
|---|---|---|
| `DataTable` + `DataTableMainHeader` | `src/components/ui/display/DataTable/` | Every list/table page. `DataTableMainHeader`'s `tabs` / `filters` / `headerRight` / search props hold the whole toolbar row — don't build a separate filter bar next to it. |
| `Tabs` (pill variant) | `src/components/ui/navigation/Tabs.tsx` | Any in-page tab switcher. Pill style is the current standard (not underline) for table-adjacent tabs. |
| `SlideOver` | `src/components/ui/overlays/SlideOver.tsx` | Row-detail views (click a row → slide-over with full detail), not a modal. This app's convention differs from the old app here on purpose. |
| `Modal` / `CreateModal` (+ `FormField`, `formInputClass`) | `src/components/ui/overlays/` | Create flows and confirmations. Any destructive/billing action (cancel subscription, delete, revoke) needs a real confirm step — never fire on first click. |
| `Dropdown` | `src/components/ui/inputs/Dropdown.tsx` | Custom select. `variant="selected"` = compact pill (env pickers, table filters); `variant="plain"` = full-width form field. |
| `Badge` / `StatBox` | `src/components/ui/display/` | `Badge` for status/role pills. `StatBox` for the "label above, bold value below" card used in detail panels — shared across DLP, Backups, etc. |
| `StatsCarousel` / `StatsCard` | `src/components/ui/display/` | Top-of-page stat cards (Members, Activity Log, Billing overview, etc). |
| `PageHeader` | `src/components/ui/navigation/PageHeader.tsx` | Every page's title/breadcrumb/description/primary-action row. |

Conventions layered on top of these:
- **Status text in table columns** (Enabled/Disabled/Succeeded/Failed): plain colored text or a small dot-badge — never a heavy filled pill for a simple state column.
- **Theme tokens, always**: `bg-(--custom-table-bg)`, `border-(--custom-table-border)`, `bg-(--custom-table-header-bg)`, `border-(--custom-header-input-border)` — never static Tailwind neutrals (`bg-card`, `border-border`) on anything tenant-themeable (tables, tabs, dropdowns, sidebar, slide-overs). Static tokens silently break tenant theme presets.
- **No new one-off cards**: reuse the `bg-(--custom-table-bg) border border-(--custom-table-border) rounded-xl p-4` pattern for simple info cards instead of inventing new container styles per page.

## 3. Code structure & how we wire an API

Per-feature layering, top to bottom:

```
src/services/routes.ts                     — route constants, module-scoped
src/services/<domain>/<name>Api.ts         — typed fetch/mutate functions
src/hooks/data/use<Name>.ts                — React Query wrappers
src/components/pages/dashboard/<section>/<page>/Page.tsx  — the actual page
src/app/dashboard/<section>/<page>/page.tsx — route file, re-exports Page
```

**`routes.ts` pattern** — each module/concern gets its own named export (`POWER_PLATFORM_ROUTES`, `AUTH_ROUTES`, `TENANT_ROUTES`, `BILLING_ROUTES`, `SUPPORT_ROUTES`, `AUDIT_LOG_ROUTES`, `DATAVERSE_LOGS_ROUTES`, …), then spread into the flat `API_ROUTES` object for backward compatibility with existing call sites. New modules (Entra ID, Data Protection) follow the same pattern — add `ENTRA_ID_ROUTES` / `DATA_PROTECTION_ROUTES` the same way, don't grow the flat object directly.

**Service files** (`services/<domain>/<name>Api.ts`) — plain async functions, each calling `apiClient` (axios, cookie-auth, baseURL `/api`) and `unwrap()`-ing the `{success, message, data}` envelope. Types live at the top of the same file (or in a shared `types/` file if reused across many services) and must match the backend's actual response DTO — check the NestJS controller/service, not just the old frontend's types (those can drift, as found in Billing's `BillingState`).

**Hooks** (`hooks/data/use<Name>.ts`) — thin React Query wrappers (`useQuery`/`useMutation`) around the service functions. Keep cache invalidation here (`useInvalidate<Name>()` helpers), not scattered across components.

**Pages** (`components/pages/dashboard/<section>/<page>/Page.tsx`) — the route file at `src/app/dashboard/.../page.tsx` is always a one-line re-export: `export { default } from "@/src/components/pages/dashboard/.../Page"`. Never put real logic in the `app/` route file itself.

**Auth model**: httpOnly cookies only (`access_token`/`refresh_token`), set by the backend. This app never reads/stores a token in JS. Anything that needs to authenticate outside plain REST (e.g. the presence WebSocket gateway) must be adapted backend-side to accept the same cookie — see `presence.gateway.ts`'s cookie fallback and `tenants.controller.ts`'s `switchTenant` cookie-setting for the pattern.

## 4. Current build status

**Every dashboard page is built** — Power Platform, Entra ID, and Purview/Data Protection are all real, wired pages (no stubs remain). Power Platform was built first in this rewrite; Entra ID and Purview came in via a later branch merge (`feat/namra-imtiaz`) alongside module-ownership gating and the Dev Testing panel's role/module-scenario impersonation — verify against the actual backend before assuming an Entra ID/Purview endpoint matches what Power Platform established, since they weren't built in this session and haven't been individually re-verified here yet.

**App shell** — fully built: Header (tenant switcher, trial/subscription chip, global Ctrl-K search), presence/Members panel (live via WebSocket + `/platform/users`), Dev Testing panel (Theme + Trial scenario tabs).

**Module ownership gating** — `ProductRail` now dims/locks rail entries whose module isn't in `user.subscription.modules` (or everything except Settings when `status === "LOCKED"`), rendering a plain non-navigable `div` with a lock badge instead of a `Link`. Any new nav surface (search results, sidebar) that lists pages across modules should respect this same ownership check — see `RailEntry.module` / `SubscriptionModule`.

**Settings** — built: Members & Invites, Billing & Plan (Overview/Invoices/Payment methods, now with a checkout-success page and per-module invoice retry), Support (tickets + reply thread).

**Monitoring** — built: Activity Log, Dataverse Audit Logs (+ full-detail side panel, a genuinely new feature beyond the old app).

**Nothing left unstarted** in the dashboard page tree as of last full survey — if you're picking this up cold, re-run a quick stub-check before trusting this list, since pages can regress or new routes can appear between sessions.

**Module-connect (per-module Entra consent) — backend-flow plumbing only; the frontend UI layer was built and then deliberately reverted.** A prior session iterated through several designs for "show dummy data until a module is connected" (sample fixtures, a connect banner, gating `PageHeader`/`DataTable` action buttons, gating ~30 pages' data hooks) — all of that frontend UI was removed by explicit request; a different UX approach is planned but not yet designed. What's still here and meant to be reused by whatever comes next:
- `services/module-consent/moduleConsentApi.ts` — `initiateModuleConsent`/`completeModuleConsent`/`getModuleConnectionStatus`, calling the real backend `/module-consent/*` endpoints.
- `services/routes.ts`'s `MODULE_CONSENT_ROUTES`.
- `services/auth/index.ts`'s `SubscriptionView.connectedModules` field — real data from the backend (`ServicePrincipal` rows with `status: ACTIVE`), already flowing through `/auth/me`, safe to read from `useAuth()` without any extra plumbing.
- `/dashboard/settings/module-consent-callback` route + page — the real OAuth landing page Microsoft redirects back to after admin consent; still functional, still needed by any future Connect flow.

None of `useModuleConnection`, `useModuleEmptyState`, `ModuleStatusTag`, `ModuleConnectBanner`, or the sample-data fixture files exist anymore — don't assume they're there if picking this up cold. Backend consent/`ServicePrincipal` infrastructure (`Nexusone_backend`) is untouched by this revert and fully intact.

## 5. Reference apps & backend

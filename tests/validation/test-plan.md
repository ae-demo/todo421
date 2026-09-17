# Validation test plan — todo421 v1

Target: `todo-webapp` (primary, drives `todo-api` through its same-origin
`/api` proxy). Authenticated specs sign in as `test-user` (role `User`,
`AEP_E2E_USERNAME`/`AEP_E2E_PASSWORD` from the roles gate ticket, issue #3)
via `tests/e2e/lib/login.ts`, which drives the real Thunder sign-in form.

## Known environment limitation: single test identity

The roles gate ticket (issue #3) provisioned exactly one test account
(`test-user`, role `User`) — the design declares a single role, and the
platform provisions one account per role. The deployed identity provider
(`https://default-idp.94.72.97.95.sslip.io`) offers no self-service sign-up
(confirmed live: the sign-in gate has no registration link, and
`/gate/register` renders an empty shell). So there is no way to obtain a
second, distinct signed-in identity in this environment.

Ten criteria (AC-001-b, AC-008-b, AC-009-a, AC-010-a, AC-011-a, AC-011-b,
AC-012-a, AC-012-b, AC-013-a, AC-013-b) require either a second user's
pre-existing private data (to prove exclusion) or a second user's own
session (to accept an invite, view an assignment, receive a notification,
or leave a list as a collaborator). None of these can be genuinely
constructed with one identity without fabricating a login the platform
did not provision, so **no spec is authored for them** — they land
`not_run` in the report, with this note as the reason. This is a test-
environment limitation, not a judgment about the app's correctness for
those criteria.

## Environment finding (observed before authoring)

Live exploration on 2026-09-16 found the deployed `todo-webapp` cannot
reach `todo-api` at all: every call through its same-origin `/api/*` proxy
(e.g. `GET /api/lists`) returns HTTP 404 `{"error":"Not Found"}` from the
gateway (`server: envoy`), and the same 404 reproduces calling the
`todo-api` gateway URL directly (`todo421-todo-api-http/lists`). This
blocks every criterion below that touches list/task/notification data —
each is authored and run honestly against the live app per the workflow
("author the spec anyway so it fails honestly"), and the failures are
expected to trace to this one root cause. See the report's Failures
section and the PR body for the full finding.

---

## AC-001-a — An unauthenticated visitor is directed to sign in before seeing any todo data

- Target: todo-webapp (primary)
- Steps:
  1. Open a fresh (unauthenticated) browser context
  2. Navigate to `/`
- Assert: the browser ends up on the identity provider's sign-in page
  (URL contains the IdP host) with a "Sign In" heading visible, before any
  todo screen renders
- Source of truth: live (AuthGate redirects to `signIn()` before rendering
  children); confirmed by playwright-cli exploration

## AC-001-b — After signing in, a user only sees lists they own or collaborate on, not other users' private lists

- **Not authored** — needs a second user's private list to prove exclusion.
  See "Known environment limitation" above. Reports `not_run`.

## AC-002-a — A user can create a new list by providing a name

- Target: todo-webapp
- Steps:
  1. Sign in as test-user
  2. Click "New List"
  3. Fill the list name field with a unique name
  4. Click "Create"
- Assert: navigation lands on the new list's detail page, showing that name
  as the page heading
- Source of truth: `todo-webapp/src/pages/MyLists.tsx` (dialog + `handleCreate`
  navigates to `/lists/{id}`), confirmed live

## AC-002-b — A newly created list appears in the user's list of lists

- Target: todo-webapp
- Steps:
  1. Sign in as test-user
  2. Create a list with a unique name (as AC-002-a)
  3. Navigate back via the "My Lists" breadcrumb
- Assert: the My Lists table contains a row with that list's name
- Source of truth: `todo-webapp/src/pages/MyLists.tsx` listing table

## AC-003-a — A user can add a task to a list with a title

- Steps: sign in, create a list, click "Add Task", fill Title, Save
- Assert: the list detail table shows a row with that title
- Source: `todo-webapp/src/pages/TaskForm.tsx`, `ListDetail.tsx`

## AC-003-b — A task can be given a due date

- Steps: as above, additionally fill the Due date field
- Assert: the task row's Due cell shows the date

## AC-003-c — A task can be given a priority

- Steps: as above, select Priority = High
- Assert: the task row's Priority cell shows a "High" chip

## AC-003-d — A task can be given one or more categories/tags

- Steps: as above, fill Categories/tags with "groceries, urgent"
- Assert: the task row shows both "groceries" and "urgent" chips

## AC-004-a — A user can edit an existing task's title, due date, priority, or categories/tags

- Steps: sign in, create list + task, open the task row, change title/due
  date/priority/categories, Save
- Assert: back on the list detail page, the row shows the updated title

## AC-004-b — Edited task details are reflected when the task is viewed again

- Steps: as AC-004-a, then re-open the task edit page
- Assert: the form fields show the updated title/due date/priority

## AC-005-a — A user can mark an incomplete task as complete

- Steps: sign in, create list + task (incomplete by default), click its Done
  checkbox
- Assert: reloading the list detail page shows the checkbox checked

## AC-005-b — A user can mark a complete task as incomplete

- Steps: as AC-005-a, then click the checkbox again
- Assert: reloading shows the checkbox unchecked

## AC-006-a — A user can delete a task from a list

- Steps: sign in, create list + task, click the task's delete (trash) icon
- Assert: the row disappears from the table

## AC-006-b — A deleted task no longer appears in the list's tasks

- Steps: as AC-006-a, then reload the list detail page
- Assert: the task's title is not present after reload (persisted deletion)

## AC-007-a — A user can filter tasks by priority

- Steps: sign in, create a list with a High-priority and a Low-priority task,
  set the Priority filter to High
- Assert: the High task is visible, the Low task is not

## AC-007-b — A user can filter tasks by category/tag

- Steps: create a list with two tasks tagged with distinct categories, filter
  by one category
- Assert: only the matching task is visible

## AC-007-c — A user can sort tasks by due date

- Steps: create a list with two tasks with different due dates, set "Sort by
  due date" = Due date
- Assert: the earlier-due task's row precedes the later-due task's row

## AC-008-a — A list owner can invite another user to a list

- Steps: sign in, create a list, click Invite, fill an email, Send Invite
- Assert: back on the Invite/manage page, a row for that email appears with
  role "Invited"

## AC-008-b through AC-013-b (multi-identity criteria)

**Not authored** — AC-008-b, AC-009-a, AC-010-a, AC-011-a, AC-011-b,
AC-012-a, AC-012-b, AC-013-a, AC-013-b all require a second user's own
signed-in session (to accept an invite, be visible/act as a collaborator,
receive a notification, or leave a list). See "Known environment
limitation" above. All report `not_run`.

## Re-validation — 2026-09-16 (after #25)

Re-ran the full regression set (17 specs) against the deployed system after
`fix(todo-webapp): absolute env-config.js path; surface create-list errors
in-dialog (#25)` landed. Result unchanged from the prior cycle: 1 passing
(AC-001-a), 16 failing at the same single root cause.

**Secondary finding (nested-route crash) is fixed.** Confirmed live: a hard
navigation to `/lists/<id>` now renders the full app shell (with an
in-dialog "Could not load this list's tasks." error, per #25's second fix)
instead of the blank white page from the prior cycle. `env-config.js` now
loads from the app root regardless of route depth.

**Primary finding (todo-api unreachable) persists, and is a gateway
routing defect, not a webapp bug.** Traced live:

- `todo-webapp/nginx/15-aep-api-proxy.sh` prefers `TODO_API_GATEWAY_URL`
  (validated, identity-injecting lane) and falls back to `TODO_API_URL`
  (direct Service, no validation) — see the script's own comment. But
  `todo-webapp`'s `workload.yaml` / `design.json` wire only
  `TODO_API_URL` for the `todo-api` dependency, even though `todo-api`'s
  own `design.json` declares `exposesAPI.auth: end-user-required`. No
  `TODO_API_GATEWAY_URL` binding exists to fall back from.
- Whatever `TODO_API_URL` resolves to in the deployed pod, requests
  proxied through it land on the exact same URL as the platform's
  resolved `todo-api` gateway endpoint
  (`https://default-default.apps.94.72.97.95.sslip.io:443/todo421-todo-api-http`):
  hitting that URL directly, with or without a valid bearer token, with
  or without the `/lists` suffix, returns the identical fast `404
  {"error":"Not Found"}` from `server: envoy` — the same signature seen
  through the webapp's own `/api/*` proxy. This is the gateway itself
  reporting no route for the path, not `todo-api`'s own 404 handling
  (which returns `{"code":404,"message":...}` per `todo-api/errors.bal`,
  not `{"error":"Not Found"}`).
- So this is not a webapp-side proxy misconfiguration to fix in
  `nginx/default.conf` — the same URL 404s identically when hit directly,
  from outside the cluster, bypassing the webapp entirely. The defect is
  in how the `todo-api` component's gateway route was provisioned for
  this deployment.

**Two of the seventeen regression specs (AC-003-c, AC-006-b) failed their
first run at the login step** (`waiting for getByRole('textbox', { name:
'Username' })`, timeout) rather than at the primary defect — a known,
already-budgeted-for flakiness in this IdP's redirect under load (see
`lib/login.ts`'s comment). Triaged live per `references/healing.md`
("Timing" — brittle, not genuine): a manual re-drive logged in in ~13s,
matching the documented normal case. Not a locator or assertion problem,
so no spec change; re-ran both in isolation
(`npm test -- specs/AC-003-c.spec.ts specs/AC-006-b.spec.ts`) and both
logged in cleanly on the retry, then failed at the same primary defect
(`Add Task` never becomes available) as the other 14. That result
supersedes the login-timeout run in the report per the newest-result-wins
merge.

No specs were healed this cycle — no locator drift, no test data
collisions; every failure traces to the one live defect above.

## Re-validation — 2026-09-17

Re-ran the full regression set (17 specs) against the deployed system.
No app or platform code changed since the prior cycle's PR #26; this run
re-checks whether the gateway routing defect it reported had since
resolved.

**Result: 0/17 passing — a regression from the prior cycle's 1/17
(AC-001-a).** The primary (`todo-api` gateway 404) defect is unchanged,
and a second, previously-unobserved defect now blocks even the sign-in
redirect itself:

- **New finding: the identity provider does not send CORS headers on its
  OIDC discovery document.** `todo-webapp`'s `auth.ts` configures
  `oidc-client-ts`'s `UserManager` with `authority:
  https://default-idp.94.72.97.95.sslip.io` (the platform-resolved
  `user-auth` issuer from `env-config.js`) and calls `signinRedirect()`,
  which fetches `{authority}/.well-known/openid-configuration` directly
  from the browser (cross-origin — the IdP is a different origin from
  `todo-webapp`). That fetch is blocked by CORS: the response carries no
  `Access-Control-Allow-Origin` header, confirmed both via a browser
  console trace (`Access to fetch at
  'https://default-idp.94.72.97.95.sslip.io/.well-known/openid-configuration'
  ... has been blocked by CORS policy`) and via a direct `curl` with an
  `Origin` header (200 OK, no ACAO header in the response, reproduced
  across 3 separate calls). `signinRedirect()` then rejects, the app
  never navigates to the IdP, and the page is left on an infinite loading
  spinner — reproduced fresh across 2 separate browser sessions.
  Standard SPA-facing OIDC discovery documents are expected to be
  publicly, cross-origin fetchable; this is a defect in how the
  `user-auth` platform resource is configured for this deployment, not
  in `todo-webapp`'s client code (the `authority` and flow match the
  canonical `oidc-client-ts` public-client pattern).
- This is why AC-001-a — a spec that only asserts the unauthenticated
  redirect to the IdP, previously the sole pass — now fails: `toHaveURL`
  never leaves `todo-webapp`'s own origin.
- Every other regression spec fails identically to the prior two cycles,
  at the same `todo-api` gateway 404 (traced in the 2026-09-16 entry
  above) once login succeeds via this suite's `lib/login.ts`, which
  drives the real IdP sign-in form directly rather than through
  `signinRedirect()`'s discovery fetch and so is not blocked by this new
  finding — the CORS block only affects the app's own in-browser
  sign-in trigger, not a test driving the IdP form URL by hand. (This
  suite's regression specs still fail after login at the `todo-api` 404,
  same as before.)
- No spec was healed this cycle: both failures are genuine defects
  (confirmed live, reproduced repeatedly), not brittleness.
- The single-test-identity limitation from the 2026-09-16 entry is
  unchanged — the roles gate ticket still provisions only `test-user`,
  so the 10 not_run criteria remain not_run for the same reason.

## Re-validation — 2026-09-17 (second pass, same day)

Re-ran the full regression set (17 specs) against the deployed system.
No app or platform commit has landed since the prior cycle's PR #27
(still open, unmerged) — this run re-checks whether either infra defect
it reported had since resolved.

**Result: 0/17 passing — unchanged from the prior cycle.**

- **CORS block on the IdP's OIDC discovery document persists.**
  Re-confirmed live via a fresh playwright-cli console trace on `/`:
  `Access to fetch at 'https://default-idp.94.72.97.95.sslip.io/.well-known/openid-configuration'
  ... has been blocked by CORS policy: No 'Access-Control-Allow-Origin'
  header is present`, and independently via `curl` with an `Origin`
  header on both `GET` and the `OPTIONS` preflight — neither response
  carries `Access-Control-Allow-Origin`. This is why AC-001-a still
  fails (the app never navigates to the IdP) and now also explains why
  every other spec fails at `lib/login.ts`'s `Username` textbox wait:
  that helper reaches the sign-in form only via the app's own
  `signinRedirect()`, which cannot complete while this fetch is
  blocked — there is no path to a signed-in session left in this
  environment, browser-driven or otherwise.
- **`todo-api`'s gateway route still 404s**, re-confirmed with a direct
  `curl` to `.../todo421-todo-api-http/lists` (`404
  {"error":"Not Found"}`, `server: envoy`) — moot for this cycle's
  result since login itself is blocked first, but unchanged from the
  2026-09-16 finding.
- No spec was healed: both are genuine, live-reproduced defects, not
  brittleness. The single-test-identity limitation is unchanged; the 10
  not_run criteria remain not_run for the same reason.
- Neither defect is fixable from this repo's application code (both are
  in how the `user-auth` and `todo-api` platform resources are
  configured/routed for this deployment) — flagging for the platform
  rather than authoring a workaround.

---
name: openapi-conventions
description: Use when creating or editing an openapi.yaml for a service component — designing endpoints, request/response schemas, errors, pagination, or security for a REST API.
metadata:
  aep:
    kind: platform
    audience: [design, coding]
---

# OpenAPI conventions

Every `service` component gets one spec at
`specs/design/components/<name>/openapi.yaml`, authored as **OpenAPI 3.0.3**.

**The spec is validated as it lands.** A write to that path is rejected
(`INVALID_OPENAPI`) unless the document is OpenAPI 3.x with at least one path
and one operation, and a rejected write changes nothing. So a spec that applied
cleanly has already passed that check: do not re-validate it with a separate
tool. Handing your own spec back to a validator as pasted text costs a round
trip and re-emits the entire document — for a check that already ran.

Coverage is checklist-driven, not vibes: walk the PRD (`specs/requirements/prd.md`) against the
component's `design.json` responsibility, and give every capability the
requirements assign to THIS component its resource(s) and every core entity
its schema. A capability with no endpoint is a defect. Commonly dropped when
consolidating services: audit trail/logs, user & role management, notification
preferences, reporting/analytics — check for each explicitly before finishing.

**Keep the spec COMPACT.** Complete coverage, minimal prose: a short `summary`
per operation and a one-line `description` per response — no multi-sentence
descriptions, no `example`/`examples` blocks, no speculative endpoints the
requirements don't imply. Schemas carry the required fields plus the few core
properties that define the entity — not every conceivable attribute.

For resource taxonomy (collection/atomic/controller), URI grammar, HTTP-method
semantics, and a full worked example, read
`references/wso2-rest-api-design-guidelines.md` — the source of truth this
summary condenses.

## Structure

- `servers:` is relative — `- url: /` — never an absolute external host.
- Paths are **kebab-case plural nouns** (`/expense-claims`,
  `/expense-claims/{claimId}/line-items`); verbs only for controller actions
  (`/expense-claims/{claimId}/submit`). Max two nesting levels.
- Every operation has `operationId` in **lowerCamelCase verb+resource**
  (`listExpenseClaims`, `submitExpenseClaim`) and a non-empty `summary`.
- Every response has a non-empty `description`. Bodies are
  `application/json`. Reusable schemas live under `components/schemas`.

## Errors — one shared schema

Define `components/schemas/Error` and reference it from EVERY 4xx/5xx
response:

```yaml
Error:
  type: object
  required: [code, message]
  properties:
    code: { type: integer, description: HTTP or application error code }
    message: { type: string, description: short human-readable label }
    description: { type: string, description: detailed explanation }
    moreInfo: { type: string, description: URI to documentation }
```

Each operation declares at least its failure modes: `'400'`/`'404'` where
applicable, plus `'401'`/`'403'` when the API is authenticated.

## Pagination — every collection GET

Parameters `limit` (integer, default 20, max 100) and `offset` (integer,
default 0). The 200 response is an envelope, not a bare array:

```yaml
type: object
required: [count, data]
properties:
  count: { type: integer, description: total matching items }
  next: { type: string, nullable: true, description: relative URI of the next page }
  previous: { type: string, nullable: true, description: relative URI of the previous page }
  data: { type: array, items: { $ref: '#/components/schemas/ExpenseClaim' } }
```

Filtering and searching are query parameters on the collection GET
(`?status=submitted`, `?employeeId=...`) — never separate endpoints.

## Security

When the requirements mention login, roles, or per-user data, declare it:

```yaml
components:
  securitySchemes:
    bearerAuth: { type: http, scheme: bearer, bearerFormat: JWT }
security:
  - bearerAuth: []
```

On a service the gateway protects, the gateway sets `X-User-Id` from the
validated token and a client never sends it. Define it once under
`components/parameters`, then `$ref` it from every **path item's**
`parameters` — path level, not per operation, so one reference covers every
method on that path. A definition nothing references is not in the spec:

```yaml
components:
  parameters:
    UserId:
      name: X-User-Id
      in: header
      required: true
      description: caller identity injected by the gateway from the validated token
      schema: { type: string }
paths:
  /expense-claims/{claimId}:
    parameters:
      - $ref: '#/components/parameters/ClaimId'
      - $ref: '#/components/parameters/UserId'
```

**Never spec an auth endpoint.** No `/auth/login`, `/auth/register`,
`/auth/logout`, or any other token-issuance path on any service: the IDP issues
tokens and the gateway validates them (see `thunder-authentication`). Specifying
one puts the coding agent's issue in direct conflict with its skills.

## YAML hygiene

2-space indentation throughout; quote status-code keys (`'200'`, `'404'`).
The file is edited with anchored string edits later, so consistent
indentation is load-bearing.

# Validation report

- **Issue:** #7
- **Commit:** d3dcdc563b31f0aef86ab7bb93aaa3f4169d4a2d
- **Generated:** 2026-09-16T08:20:53.458Z
- **Playwright:** 1.61.1

## Summary

| Method | Total | Pass | Fail | Not run |
|---|---|---|---|---|
| e2e | 27 | 1 | 16 | 10 |
| manual (human checklist) | 0 | — | — | — |
| scenario (not validated) | 0 | — | — | — |

## E2E results

| Criterion | Must | Status | Spec | Notes |
|---|---|---|---|---|
| AC-001-a | An unauthenticated visitor is directed to sign in before seeing any todo data | ✅ pass | `tests/e2e/specs/AC-001-a.spec.ts` | — |
| AC-001-b | After signing in, a user only sees lists they own or collaborate on, not other users' private lists | ⏭️ not_run | — | — |
| AC-002-a | A user can create a new list by providing a name | ❌ fail | `tests/e2e/specs/AC-002-a.spec.ts` | — |
| AC-002-b | A newly created list appears in the user's list of lists | ❌ fail | `tests/e2e/specs/AC-002-b.spec.ts` | — |
| AC-003-a | A user can add a task to a list with a title | ❌ fail | `tests/e2e/specs/AC-003-a.spec.ts` | — |
| AC-003-b | A task can be given a due date | ❌ fail | `tests/e2e/specs/AC-003-b.spec.ts` | — |
| AC-003-c | A task can be given a priority | ❌ fail | `tests/e2e/specs/AC-003-c.spec.ts` | — |
| AC-003-d | A task can be given one or more categories/tags | ❌ fail | `tests/e2e/specs/AC-003-d.spec.ts` | — |
| AC-004-a | A user can edit an existing task's title, due date, priority, or categories/tags | ❌ fail | `tests/e2e/specs/AC-004-a.spec.ts` | — |
| AC-004-b | Edited task details are reflected when the task is viewed again | ❌ fail | `tests/e2e/specs/AC-004-b.spec.ts` | — |
| AC-005-a | A user can mark an incomplete task as complete | ❌ fail | `tests/e2e/specs/AC-005-a.spec.ts` | — |
| AC-005-b | A user can mark a complete task as incomplete | ❌ fail | `tests/e2e/specs/AC-005-b.spec.ts` | — |
| AC-006-a | A user can delete a task from a list | ❌ fail | `tests/e2e/specs/AC-006-a.spec.ts` | — |
| AC-006-b | A deleted task no longer appears in the list's tasks | ❌ fail | `tests/e2e/specs/AC-006-b.spec.ts` | — |
| AC-007-a | A user can filter tasks by priority | ❌ fail | `tests/e2e/specs/AC-007-a.spec.ts` | — |
| AC-007-b | A user can filter tasks by category/tag | ❌ fail | `tests/e2e/specs/AC-007-b.spec.ts` | — |
| AC-007-c | A user can sort tasks by due date | ❌ fail | `tests/e2e/specs/AC-007-c.spec.ts` | — |
| AC-008-a | A list owner can invite another user to a list | ❌ fail | `tests/e2e/specs/AC-008-a.spec.ts` | — |
| AC-008-b | The invited user gains access to the shared list once they accept | ⏭️ not_run | — | — |
| AC-009-a | A user can assign a task on a shared list to a specific collaborator | ⏭️ not_run | — | — |
| AC-010-a | The assignee of a shared task is visible to collaborators on the list | ⏭️ not_run | — | — |
| AC-011-a | A list owner can remove a collaborator from a shared list | ⏭️ not_run | — | — |
| AC-011-b | A removed collaborator no longer has access to the list | ⏭️ not_run | — | — |
| AC-012-a | A collaborator can leave a shared list | ⏭️ not_run | — | — |
| AC-012-b | A list the user has left no longer appears in their list of lists | ⏭️ not_run | — | — |
| AC-013-a | A user receives an in-app notification when invited to a shared list | ⏭️ not_run | — | — |
| AC-013-b | A user receives an in-app notification when assigned a task | ⏭️ not_run | — | — |

## Failures

### AC-002-a — A user can create a new list by providing a name

Spec: `tests/e2e/specs/AC-002-a.spec.ts`
Location: `AC-002-a.spec.ts:6`

```
Error: expect(locator).toBeVisible() failed

Locator: getByRole('heading', { name: 'ac002a-1789544951904', level: 1 })
Expected: visible
Timeout: 10000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" with timeout 10000ms
  - waiting for getByRole('heading', { name: 'ac002a-1789544951904', level: 1 })

```

### AC-002-b — A newly created list appears in the user's list of lists

Spec: `tests/e2e/specs/AC-002-b.spec.ts`
Location: `AC-002-b.spec.ts:6`

```
Test timeout of 90000ms exceeded.
```

### AC-003-a — A user can add a task to a list with a title

Spec: `tests/e2e/specs/AC-003-a.spec.ts`
Location: `AC-003-a.spec.ts:6`

```
Test timeout of 90000ms exceeded.
```

### AC-003-b — A task can be given a due date

Spec: `tests/e2e/specs/AC-003-b.spec.ts`
Location: `AC-003-b.spec.ts:6`

```
Test timeout of 90000ms exceeded.
```

### AC-003-c — A task can be given a priority

Spec: `tests/e2e/specs/AC-003-c.spec.ts`
Location: `AC-003-c.spec.ts:6`

```
Test timeout of 90000ms exceeded.
```

### AC-003-d — A task can be given one or more categories/tags

Spec: `tests/e2e/specs/AC-003-d.spec.ts`
Location: `AC-003-d.spec.ts:6`

```
Test timeout of 90000ms exceeded.
```

### AC-004-a — A user can edit an existing task's title, due date, priority, or categories/tags

Spec: `tests/e2e/specs/AC-004-a.spec.ts`
Location: `AC-004-a.spec.ts:6`

```
Test timeout of 90000ms exceeded.
```

### AC-004-b — Edited task details are reflected when the task is viewed again

Spec: `tests/e2e/specs/AC-004-b.spec.ts`
Location: `AC-004-b.spec.ts:6`

```
Test timeout of 90000ms exceeded.
```

### AC-005-a — A user can mark an incomplete task as complete

Spec: `tests/e2e/specs/AC-005-a.spec.ts`
Location: `AC-005-a.spec.ts:6`

```
Test timeout of 90000ms exceeded.
```

### AC-005-b — A user can mark a complete task as incomplete

Spec: `tests/e2e/specs/AC-005-b.spec.ts`
Location: `AC-005-b.spec.ts:6`

```
Test timeout of 90000ms exceeded.
```

### AC-006-a — A user can delete a task from a list

Spec: `tests/e2e/specs/AC-006-a.spec.ts`
Location: `AC-006-a.spec.ts:6`

```
Test timeout of 90000ms exceeded.
```

### AC-006-b — A deleted task no longer appears in the list's tasks

Spec: `tests/e2e/specs/AC-006-b.spec.ts`
Location: `AC-006-b.spec.ts:6`

```
Test timeout of 90000ms exceeded.
```

### AC-007-a — A user can filter tasks by priority

Spec: `tests/e2e/specs/AC-007-a.spec.ts`
Location: `AC-007-a.spec.ts:6`

```
Test timeout of 90000ms exceeded.
```

### AC-007-b — A user can filter tasks by category/tag

Spec: `tests/e2e/specs/AC-007-b.spec.ts`
Location: `AC-007-b.spec.ts:6`

```
Test timeout of 90000ms exceeded.
```

### AC-007-c — A user can sort tasks by due date

Spec: `tests/e2e/specs/AC-007-c.spec.ts`
Location: `AC-007-c.spec.ts:6`

```
Test timeout of 90000ms exceeded.
```

### AC-008-a — A list owner can invite another user to a list

Spec: `tests/e2e/specs/AC-008-a.spec.ts`
Location: `AC-008-a.spec.ts:6`

```
Test timeout of 90000ms exceeded.
```


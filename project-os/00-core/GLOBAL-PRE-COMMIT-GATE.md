# Global Pre-Commit Gate

Status: Active
Owner: Chief Architect
Scope: All AI and human implementation tasks

## Golden Rule

No task may commit or hand off changes until the applicable verification gate has passed with real evidence.

## Required Procedure

1. Read actual package scripts before selecting commands.
2. Run all relevant verification commands that exist.
3. If an expected capability is missing, record `MISSING_CAPABILITY` instead of claiming PASS.
4. Inspect the final diff and changed-file scope.
5. Confirm no unapproved contract, signature, schema, route, or shared-interface change.
6. Confirm no unrelated files were modified.
7. Commit only after all applicable checks pass or an approved exception is recorded.

## Minimum Checks

```text
package scripts reviewed
lint or equivalent
build or equivalent
relevant automated tests
static architecture verification
runtime verification when applicable
smoke verification when applicable
git diff review
API/interface signature review
sensitive-data review
```

## Backend Checks

```text
runtime boot
health endpoint
relevant feature verification
policy/workspace regression
response envelope compatibility
Prisma validation/migration review when schema changes
```

## Frontend Checks

```text
production build
lint/type check
critical route render
API contract compatibility
keyboard workflow verification when affected
focus management verification when affected
shared component regression review
browser-console sensitive-data review
```

## Commit Result Format

```text
Gate: PASS / FAIL / APPROVED_EXCEPTION
Commands executed:
Exact outputs:
Files changed:
Contracts preserved:
Known gaps:
Commit SHA:
```

## Prohibited Claims

Do not write `PASS` for a command that was not executed.
Do not treat missing scripts as successful tests.
Do not commit first and verify later unless an explicit emergency procedure was approved.

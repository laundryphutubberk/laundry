# AI-TASK-CONTRACTS.md

Status: Active  
Owner: Backend Architect  
Scope: Backend AI execution contracts

## Purpose

This document turns Backend prompts into explicit contracts.

A task contract defines:

```text
Input
Scope
Allowed changes
Stop conditions
Verification
Output
Freeze criteria
```

This reduces repeated approval prompts while preserving Project OS governance.

## Gate-Based Execution Contract

When a phase gate is approved, AI may complete all milestones inside that scope without asking for approval again.

AI must stop only when a Stop Condition is triggered.

## Global Stop Conditions

Stop and ask Chief Architect if the task requires:

```text
Business Blueprint change
schema.prisma change
API Contract change
Workspace Boundary change
Permission model change
Technology baseline change
ADR trigger
Frontend change
Runtime behavior change outside approved scope
```

## BE-01 Runtime Foundation Contract

Input:

```text
FAST-BOOT-SUMMARY
BACKEND-MASTER-ROADMAP
BE Execution README
package.json
backend runtime files
```

Output:

```text
runtime entry
app bootstrap
config loader
Prisma bootstrap
middleware order
route mount
health endpoint
runtime verification
freeze report
```

Freeze requires runtime verification.

## BE-02 Repository Foundation Contract

Input:

```text
schema.prisma
active service modules
BACKEND-STRUCTURE-BLUEPRINT
BACKEND-CAPABILITY-MATRIX
```

Scope:

```text
repository boundary
data access ownership
transaction-compatible repositories
technical shared helpers only after review
```

Output:

```text
repository layer
service without direct Prisma imports
repository verification
helper review where needed
freeze report
```

Stop if business behavior or response shape changes.

## BE-03 REST API Layer Contract

Input:

```text
Business Blueprint
schema.prisma
route files
API contracts
BACKEND-CAPABILITY-MATRIX
```

Scope:

```text
route inventory
API contract inventory
coverage matrix
contract documentation
```

Runtime changes require separate approval.

Output:

```text
route inventory
API contract inventory
coverage matrix
freeze recommendation
```

## BE-04 Architecture Normalization Contract

Input:

```text
Engineering Blueprint
Development Standards
BACKEND-STRUCTURE-BLUEPRINT
active backend modules
```

Scope:

```text
route -> controller -> service -> business/policy -> repository -> Prisma
module structure
layer direction
technical debt cleanup without behavior change
```

Output:

```text
normalized module structure
layer dependency report
architecture verification
freeze report
```

Stop if runtime behavior, API contract, or workspace boundary changes.

## BE-05 Business Layer Contract

Input:

```text
Business Blueprint
schema.prisma
BACKEND-STRUCTURE-BLUEPRINT
BACKEND-CAPABILITY-MATRIX
active repositories/services
```

Scope:

```text
business rules
status transitions
workflow restrictions
uniqueness rules beyond DB constraint
business coverage matrix
```

Output:

```text
business layer for required domains
service delegates business rules
business coverage report
runtime verification
freeze report
```

Stop if business rules are unclear or require Business Blueprint change.

## BE-06 Validation Contract

Input:

```text
API contracts
controllers/routes
validators
BACKEND-CAPABILITY-MATRIX
BACKEND-STRUCTURE-BLUEPRINT
```

Scope:

```text
request shape validation
DTO boundary
validation error format
validation coverage
structure migration only if approved by gate
```

Validation must not become business rule enforcement.

Output:

```text
validation inventory
DTO inventory
validation implementation or proposal
verification report
freeze report
```

## BE-07 Policy and Domain Rules Contract

Input:

```text
Business Blueprint
Workspace boundary rules
auth/session model
BACKEND-CAPABILITY-MATRIX
```

Scope:

```text
workspace policy
permission checks
resortId isolation
user/context-based authorization
```

Output:

```text
policy layer
policy coverage report
workspace boundary verification
freeze report
```

Stop if permission model is unclear or requires ADR.

## BE-08 Transaction and Consistency Contract

Input:

```text
business workflows
repositories
Prisma transaction usage
BACKEND-CAPABILITY-MATRIX
```

Scope:

```text
transaction boundaries
multi-write consistency
idempotency risk
rollback behavior
side-effect consistency
```

Output:

```text
transaction map
transaction-safe workflows
consistency verification
freeze report
```

## BE-09 Observability Contract

Input:

```text
runtime logs
critical workflows
error handling
health checks
```

Scope:

```text
logging
metrics readiness
request id propagation
error observability
critical flow visibility
```

Output:

```text
observability map
logging verification
runtime evidence
freeze report
```

## BE-10 Production Readiness Contract

Input:

```text
all frozen BE phases
deployment requirements
runtime verification
observability evidence
```

Scope:

```text
production checklist
deployment checklist
smoke verification
release response plan
final readiness summary
```

Output:

```text
production readiness report
release checklist
final backend freeze
```

## Maintenance Rule

Update this document when BE phase gates, required inputs, stop conditions, or freeze criteria change.

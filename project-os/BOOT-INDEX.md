# Project Boot Index

This file is the quick-start reading map for Human and AI boot.

Use this file together with:

- `project-os/PROJECT-OS-STRUCTURE.md`
- `project-os/11-boot/BOOT.md`
- `project-os/00-project-boot/PROJECT-BOOT.md`

---

## Boot Purpose

Boot is not reading every document in the repository.

Boot is the minimum required reading to understand:

- Project mission
- Business truth
- Engineering truth
- Domain model
- Contracts / standards
- Current execution domain

---

## Required Boot Read Order

| Step | File | Purpose | Required |
|---:|---|---|:---:|
| 00 | `project-os/00-project-boot/PROJECT-BOOT.md` | Project task entry and read order | ✅ |
| 01 | `project-os/01-constitution/PROJECT-CONSTITUTION.md` | Project rules and authority | ✅ |
| 02 | `project-os/02-business/Laundry-Blueprint.md` | Business source of truth | ✅ |
| 03 | `project-os/03-engineering/Engineering Blueprint.md` | Engineering architecture and constraints | ✅ |
| 04 | `project-os/06-domain-model/schema.prisma` | Domain model and database truth | ✅ |
| 05 | `project-os/04-glossary/PROJECT-GLOSSARY.md` | Shared project vocabulary | ✅ |
| 06 | `project-os/05-ui-guide/UI-ADAPTIVE-GUIDE.md` | UI and workspace behavior | ✅ |
| 07 | `project-os/08-standards/DEVELOPMENT-STANDARDS.md` | Development rules and safety standards | ✅ |
| 08 | `project-os/09-pks/PKS-v1.0.md` | Project Knowledge System | Recommended |
| 09 | `project-os/09-pks/PROJECT-STRUCTURE.md` | Repository / project structure rules | Recommended |
| 10 | `project-os/09-pks/CHANGE-POLICY.md` | Change policy | Recommended |
| 11 | `project-os/09-pks/ADR-STANDARD.md` | ADR writing standard | Recommended |
| 12 | `project-os/10-adr/ADR-0001.md` | Architecture decision records | Recommended |
| 13 | `project-os/11-boot/BOOT.md` | Boot principle and readiness rules | ✅ |
| 14 | `project-os/11-boot/BOOT-REPORT.md` | Boot gaps / readiness report | When incomplete |
| 15 | `project-os/ai-task-handbook/AI-TASK-HANDBOOK.md` | AI task execution guide | Recommended |
| 16 | `project-os/ai-task-handbook/PERMANENT-AI-ROLES.md` | Permanent AI roles and boundaries | Recommended |
| 17 | `project-os/backend/execution/` | Backend execution domain | As needed |
| 18 | `project-os/frontend/execution/` | Frontend execution domain | As needed |

---

## Boot Questions

Before starting execution, Human and AI should be able to answer:

1. What problem does this project solve?
2. Who are the primary users?
3. What is the business workflow?
4. What is the source of truth?
5. Which domain are we entering?
6. What is the boundary of this domain?
7. What files must not be changed without explicit approval?
8. What standards/checklists apply before implementation?

---

## Conflict Rule

If documents conflict:

1. Business Blueprint has higher priority than Engineering Blueprint.
2. Constitution has authority over general implementation preferences.
3. Domain model and contracts must be checked before code changes.
4. If still unclear, record the gap in `project-os/11-boot/BOOT-REPORT.md` before execution.

---

## Readiness States

| State | Meaning |
|---|---|
| `READY_FOR_DOMAIN_ENTRY` | Required boot documents are understood and the current domain is clear. |
| `BOOT_DEGRADED` | Some required document, domain, contract, or source of truth is missing or unclear. |
| `BLOCKED_BY_BOOT_GAP` | Execution should not continue until the missing boot information is resolved. |

---

## Maintenance Rule

Update this file whenever:

- A Project OS file is renamed.
- A Project OS file is moved.
- A required boot document is added or removed.
- Boot order changes.
- Domain execution folders change.

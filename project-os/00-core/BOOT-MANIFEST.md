# Boot Manifest

Status: Active  
Owner: Chief Architect  
Project: `laundryphutubberk/laundry`

## Golden Rule

Every new task MUST start from this file:

```text
project-os/00-core/BOOT-MANIFEST.md
```

Do not directly load Blueprint, Engineering, Backend, Frontend, Domain Model, or Execution documents first.

Always resolve the required boot path from this manifest before reading deeper documents.

This file is the single entry point for Project OS boot.

## Purpose

This file is the central index for the layered boot system.

It does not replace source-of-truth documents. It tells Human and AI where to go for the minimum required context.

## Boot Layers

```text
Core Boot
  -> Responsibility Boot
  -> Execution Boot
  -> Module Boot
  -> Implementation
```

## Core Boot

Required for everyone.

| Item | File | Purpose |
|---|---|---|
| Project Boot | `project-os/00-project-boot/PROJECT-BOOT.md` | Project entry and boot rule |
| Fast Boot | `project-os/11-boot/FAST-BOOT-SUMMARY.md` | Project-wide fast context |
| Boot Resolver | `project-os/00-core/BOOT-RESOLVER.md` | Resolve task to minimum boot path |
| Responsibility Registry | `project-os/00-core/RESPONSIBILITY-REGISTRY.md` | Resolve role and ownership |
| Structure Index | `project-os/PROJECT-OS-STRUCTURE.md` | Locate Project OS files |

## Responsibility Boot

| Responsibility | Boot Files | Notes |
|---|---|---|
| Chief Architect | Core Boot, Constitution, Business Blueprint, Roadmaps | Owns direction and stop-condition decisions |
| Data Architect | Core Boot, Domain Model Boot, schema.prisma, Domain Classification | Owns Prisma/domain model readiness |
| Backend Architect | Core Boot, Backend Roadmap, Structure Blueprint, Capability Matrix, AI Task Contracts | Owns BE execution governance |
| Frontend Architect | Core Boot, UI Guide, Frontend Execution README | Owns FE execution governance |
| QA Architect | Core Boot, Standards, phase verification reports | Owns quality gates |
| Release Architect | Core Boot, BE/FE readiness, deployment docs | Owns release readiness |

## Backend Boot Path

For backend tasks:

```text
Core Boot
  -> project-os/backend/BACKEND-MASTER-ROADMAP.md
  -> project-os/backend/BACKEND-STRUCTURE-BLUEPRINT.md
  -> project-os/backend/BACKEND-CAPABILITY-MATRIX.md
  -> project-os/backend/AI-TASK-CONTRACTS.md
  -> relevant BE execution package
```

## Domain Model Boot Path

For schema/domain/prisma tasks:

```text
Core Boot
  -> project-os/06-domain-model/DOMAIN-MODEL-BOOT.md
  -> project-os/06-domain-model/schema.prisma
  -> project-os/06-domain-model/DOMAIN-MODEL-REVIEW.md
  -> project-os/06-domain-model/PRISMA-DESIGN-DECISIONS.md
  -> project-os/06-domain-model/DOMAIN-CLASSIFICATION.md
  -> project-os/06-domain-model/MIGRATION-STRATEGY.md
  -> project-os/06-domain-model/BACKEND-HANDOFF.md
```

## Frontend Boot Path

For frontend tasks:

```text
Core Boot
  -> project-os/05-ui-guide/UI-ADAPTIVE-GUIDE.md
  -> project-os/frontend/execution/README.md
  -> relevant FE execution package
```

## Execution Boot Rule

Do not read every Project OS file by default.

Read only:

```text
1. Core Boot
2. Responsibility Boot for the assigned role
3. Execution Boot for the assigned phase
4. Module Boot for the assigned module, if any
```

## Self-Booting Task Rule

A task may be invoked with a short command such as:

```text
BE-06
FE-03
Domain Model Review
```

The task must then:

```text
1. Open BOOT-MANIFEST.md
2. Resolve the correct boot path
3. Read only required context
4. Start in the correct responsibility mode
5. Stop if a stop condition is triggered
```

## Stop Conditions

Regardless of role, stop and ask Chief Architect if work requires:

```text
Business Blueprint change
schema.prisma change
API Contract change
Workspace Boundary change
Permission model change
Technology baseline change
ADR trigger
Runtime behavior change outside approved gate
```

## Maintenance Rule

Update this manifest when:

- a new responsibility boot is added
- a boot path changes
- a new required boot document is added
- execution package structure changes
- Project OS structure changes

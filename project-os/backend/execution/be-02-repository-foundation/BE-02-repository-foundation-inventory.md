# BE-02 Repository Foundation Inventory

Status: Review
Scope: Backend Repository Foundation
Owner: Backend Architecture

## Purpose

This document records the current repository-boundary inventory before broad BE-02 work continues.

It allows BE-02 and BE-04 tasks to split repository extraction safely without touching the same module files at the same time.

## Detection Basis

Initial scan searched for direct Prisma imports in backend modules.

## Direct Prisma Import Candidates

These files require repository-boundary review:

```text
fieldops-be/src/modules/member/member.service.js
fieldops-be/src/modules/team/team.service.js
fieldops-be/src/modules/location/location.service.js
fieldops-be/src/modules/service-item-category/serviceItemCategory.service.js
fieldops-be/src/modules/consumable/consumable.service.js
fieldops-be/src/modules/equipment/equipment.service.js
fieldops-be/src/modules/equipment-category/equipmentCategory.service.js
fieldops-be/src/modules/field-session/fieldSessionRuntime.service.js
fieldops-be/src/modules/service-item/serviceItem.service.js
fieldops-be/src/modules/organization/organization.service.js
fieldops-be/src/modules/invites/inviteController.js
fieldops-be/src/modules/auth/auth.service.js
fieldops-be/src/modules/vehicle/vehicle.service.js
```

## Already Started

```text
fieldops-be/src/modules/issue/issue.repository.js
```

Issue module repository boundary has already started under BE-04.01.

## Ownership Rule

Each repository extraction should be owned by the task responsible for that module.

Do not extract repositories for multiple unrelated modules in one commit.

## Parallelization Plan

Safe parallel tracks:

```text
Track A: Invite repository boundary
Track B: Member repository boundary
Track C: Organization repository boundary
Track D: Equipment repository boundary
Track E: Auth repository boundary
Track F: Field Session repository boundary
Track G: Master data modules repository boundary
```

Master data modules include:

```text
team
location
service-item
service-item-category
equipment-category
consumable
vehicle
```

## Blocking Rule

A module should not enter BE-03 REST API normalization until its repository boundary has either:

```text
PASS
PASS_WITH_NOTES
APPROVED_EXCEPTION
```

## Review Checklist

```text
□ service no longer imports Prisma directly
□ controller does not import Prisma directly
□ repository owns query shape
□ organization-scoped data requires organization context
□ transaction-compatible client is considered where needed
□ repository mapper is considered when persistence shape differs from domain shape
```

## BE-02 Inventory Result

```text
Status: REVIEW
Result: REPOSITORY_BOUNDARY_WORK_SPLIT_READY
```

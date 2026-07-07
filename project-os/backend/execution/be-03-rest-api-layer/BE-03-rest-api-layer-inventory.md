# BE-03 REST API Layer Inventory

Status: Review
Scope: Backend REST API Layer
Owner: Backend Architecture

## Purpose

This document records the current REST API boundary inventory before broad BE-03 normalization continues.

It helps controller and route work run in parallel with clear ownership.

## Detection Basis

Initial scan searched for controller files that should be reviewed against the BE-OS REST API standards.

## Controller Candidates

These controller files require BE-03 API boundary review:

```text
fieldops-be/src/modules/team/team.controller.js
fieldops-be/src/modules/vehicle/vehicle.controller.js
fieldops-be/src/modules/consumable/consumable.controller.js
fieldops-be/src/modules/issue/issue.controller.js
fieldops-be/src/modules/equipment/equipment.controller.js
fieldops-be/src/modules/equipment-category/equipmentCategory.controller.js
fieldops-be/src/modules/service-item/serviceItem.controller.js
fieldops-be/src/modules/location/location.controller.js
fieldops-be/src/modules/organization/organization.controller.js
fieldops-be/src/modules/field-session/fieldSession.controller.js
fieldops-be/src/modules/service-item-category/serviceItemCategory.controller.js
fieldops-be/src/modules/member/member.controller.js
fieldops-be/src/modules/invites/inviteController.js
```

## Already Started

```text
fieldops-be/src/modules/issue/issue.controller.js
fieldops-be/src/modules/issue/issue.response.mapper.js
```

Issue controller has started using the shared response helper and response mapper under BE-04.01.

## BE-03 Ownership Rule

Each API normalization task should own one module route/controller boundary.

Do not normalize multiple unrelated controllers in one commit.

## Parallelization Plan

Safe parallel tracks:

```text
Track A: Invite API boundary
Track B: Member API boundary
Track C: Organization API boundary
Track D: Equipment API boundary
Track E: Auth API boundary
Track F: Field Session API boundary
Track G: Master data API boundary
```

Master data API boundary includes:

```text
team
location
service-item
service-item-category
equipment-category
consumable
vehicle
```

## API Compliance Checklist

```text
□ route composes middleware and controller
□ controller does not access database directly
□ controller does not call repository directly
□ controller delegates business workflow to service
□ controller uses shared response helper
□ response mapper exists when API DTO differs from domain output
□ errors flow to global error handler
```

## Review Checklist

```text
□ route boundary is clear
□ controller boundary is clear
□ validator boundary is considered
□ response mapper boundary is considered
□ shared response contract is used
□ module-specific response shape is documented when required
```

## BE-03 Inventory Result

```text
Status: REVIEW
Result: REST_API_BOUNDARY_WORK_SPLIT_READY
```

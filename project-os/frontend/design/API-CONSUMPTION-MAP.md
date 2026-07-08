# API-CONSUMPTION-MAP.md

Status: Active
Owner: Frontend Architect / Backend Architect

## Purpose

Map frontend screens to backend API contracts before FE implementation.

Frontend should not discover APIs during coding.

## Current Known API Map

| Screen / Workflow | API Contract | Status |
|---|---|---|
| Health Check | Health endpoint | Existing |
| Work List | Laundry Works list | Existing |
| Work Detail | Laundry Works detail | Existing |
| Create Work | Laundry Works create | Existing |
| Update Work Status | Laundry Works status update | Existing |
| Bag List | Laundry Bags list | Existing |
| Bag Detail | Laundry Bags detail | Existing |
| Create Bag | Laundry Bags create | Existing |
| Count Linen | Count Line API | Planned |
| Issue Report | Issue API | Planned |
| Inventory Summary | Inventory API | Planned |
| Machine Planning | Wash Load API | Planned |

## Rules

- A screen may consume only documented APIs.
- Planned APIs must be marked as Planned and must not be treated as runtime-ready.
- API response shape must follow approved contract.
- Frontend must not infer hidden backend behavior.

## Maintenance Rule

Update this map when API contracts or screen workflows change.

# Project OS Capability Index

Status: ACTIVE
Owner: Project Owner / Chief Architect
Scope: Architectural capability catalog

## Purpose

This index is the durable architectural overview of Operational Capabilities recognized by the project.

It is an architectural catalog only. It is not a roadmap, execution state, project status tracker, or replacement for execution status documents.

New capabilities should be added by appending rows. Detailed truth remains in the referenced Blueprint, implementation, verification, and integration records.

## Status Vocabulary

- `PLANNED`
- `BLUEPRINT`
- `IMPLEMENTING`
- `READY_FOR_TEST`
- `HUMAN_VERIFIED`
- `COMPLETE`

Status in this catalog is a high-level architectural classification. Do not derive active execution state from this document.

## Capability Catalog

| Capability Name | Business Purpose | Blueprint | Backend | Frontend | Human Verification | Integration | Status | References |
|---|---|---|---|---|---|---|---|---|
| Laundry Images Operational Capability V1 | Preserve operational image evidence and controlled image lifecycle within Laundry Work. | Defined | Complete | Complete | Complete | Complete | `COMPLETE` | `project-os/frontend/tasks/laundry-image/`; Laundry Image completion and handoff records |
| Laundry Activity Timeline V1 | Present a unified operational history of Laundry Work activity without changing source-domain truth. | Defined | Complete | Complete | Complete | Complete | `COMPLETE` | Laundry Activity Timeline architecture, implementation, verification, and integration records |
| Laundry Claim Operational Capability V1 | Transform an eligible Laundry Issue into a managed Claim lifecycle while preserving Issue, Work, inventory, counting, movement, image, and financial boundaries. | `project-os/04-contracts/LAUNDRY-CLAIM-OPERATIONAL-BLUEPRINT-V1.md` | Complete | Complete | Complete | Complete | `COMPLETE` | Locked Claim Blueprint; Claim implementation, verification, integration, and retrospective records |
| Laundry Assignment | Assign approved operational responsibility without changing existing capability ownership. | Not yet defined | Not started | Not started | Not executed | Not integrated | `PLANNED` | Future Blueprint required |
| Laundry Notification | Deliver approved operational notifications without embedding communication concerns into source capabilities. | Not yet defined | Not started | Not started | Not executed | Not integrated | `PLANNED` | Future Blueprint required |
| Laundry Dashboard | Provide trusted operational summaries and drill-downs from verified source capabilities. | Not yet defined | Not started | Not started | Not executed | Not integrated | `PLANNED` | Future Blueprint required |
| Laundry Analytics | Analyze trusted operational data without replacing source-of-truth workflows. | Not yet defined | Not started | Not started | Not executed | Not integrated | `PLANNED` | Future Blueprint required |
| Laundry Reports | Produce controlled operational reports, print views, exports, and drill-downs from verified data. | Not yet defined | Not started | Not started | Not executed | Not integrated | `PLANNED` | Future Blueprint required |
| Laundry Finance | Introduce approved financial capabilities without leaking financial behavior into non-financial domains. | Not yet defined | Not started | Not started | Not executed | Not integrated | `PLANNED` | Future Blueprint required |
| Laundry Customer History | Provide customer-scoped historical visibility across verified operational capabilities. | Not yet defined | Not started | Not started | Not executed | Not integrated | `PLANNED` | Future Blueprint required |

## Maintenance Rule

Update this index only when:

- a new Operational Capability is architecturally recognized;
- a capability receives an approved Blueprint;
- a capability reaches one of the catalog status values;
- a reference path changes.

Do not use this file to record task progress, blockers, branches, commit queues, test runs, or release scheduling.

# BACKEND-CAPABILITY-MATRIX.md

Status: Active  
Owner: Backend Architect  
Project: `laundryphutubberk/laundry`

## Purpose

This file is the Backend capability dashboard.

It shows how completely each business domain is supported across backend layers.

This is not a task log. It is a domain coverage map.

## Layer Legend

| Mark | Meaning |
|---|---|
| ✅ | Implemented / verified |
| 🟡 | Partial / planned / needs review |
| ⏳ | Not started |
| ⚪ | Not required / internal only |
| 🚫 | Forbidden by design |

## Current Backend Phase Status

```text
BE-01 Runtime Foundation          ✅ Frozen
BE-02 Repository Foundation       ✅ Frozen
BE-03 REST API Layer              ✅ Frozen
BE-04 Architecture Normalization  ✅ Frozen
BE-05 Business Layer              ✅ Frozen
BE-06 Validation                  Ready / Transition Gate
BE-07 Policy and Domain Rules     Pending
BE-08 Transaction and Consistency Pending
BE-09 Observability               Pending
BE-10 Production Readiness        Pending
```

## Capability Matrix

| Domain | Prisma | Repository | Business | Validation | Policy | Transaction | API Contract | Runtime API | Status |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---|
| Resort | ✅ | 🟡 | ✅ | ⏳ | ⏳ | 🟡 | 🟡 | 🟡 | Needs validation/policy review |
| Laundry Work | ✅ | ✅ | ✅ | 🟡 | ⏳ | 🟡 | ✅ | ✅ | Active capability |
| Laundry Bag | ✅ | ✅ | ✅ | 🟡 | ⏳ | ✅ | ✅ | ✅ | Active capability |
| Laundry Count Line | ✅ | 🟡 | ✅ | ⏳ | ⏳ | 🟡 | 🟡 | 🟡 | Required domain |
| Linen Movement | ✅ | 🟡 | ✅ | ⏳ | ⏳ | ✅ | 🟡 | 🟡 | Internal / workflow-driven |
| Linen Inventory Summary | ✅ | 🟡 | 🟡 | ⏳ | ⏳ | ✅ | 🟡 | 🟡 | Derived read model |
| Issue Report | ✅ | 🟡 | ✅ | ⏳ | ⏳ | 🟡 | 🟡 | 🟡 | Required domain |
| Work Status Log | ✅ | ✅ | ⚪ | ⚪ | ⚪ | ✅ | 🚫 | 🚫 | Internal log |
| Laundry Item Type | ✅ | 🟡 | ⚪ | ⏳ | ⏳ | ⚪ | 🟡 | 🟡 | Lookup / master data |
| Laundry Machine | ✅ | 🟡 | 🟡 | ⏳ | ⏳ | 🟡 | 🟡 | 🟡 | Operational resource |
| Laundry Machine Load Rule | ✅ | 🟡 | ✅ | ⏳ | ⏳ | 🟡 | 🟡 | 🟡 | Planning rule |
| Wash Load Plan | ✅ | 🟡 | ✅ | ⏳ | ⏳ | ✅ | 🟡 | 🟡 | Planning capability |
| User / Auth | ✅ | 🟡 | 🟡 | ⏳ | ⏳ | 🟡 | 🟡 | 🟡 | Required before production |

## Coverage Rules

A domain is Production Ready only when these are true:

```text
Repository   ✅
Business     ✅ or ⚪ with reason
Validation   ✅ for exposed APIs
Policy       ✅ where workspace/user/permission applies
Transaction  ✅ where multi-write flow applies
API Contract ✅ for exposed APIs
Runtime API  ✅ only when business-approved
```

## Domain Status Types

| Type | Meaning |
|---|---|
| Active capability | Runtime exists and is usable |
| Required domain | Must be implemented before production |
| Internal | Used by workflows, not exposed as public CRUD |
| Derived read model | Read/calculated view, not direct write surface |
| Lookup | Master/reference data |
| Planning | Operational planning capability |

## BE-06 Usage

BE-06 should use this matrix as its starting point.

For every Runtime API or planned API, BE-06 must identify:

```text
request params validation
request query validation
request body validation
DTO boundary
validation error format
business-rule vs validation boundary
```

## Maintenance Rule

Update this file whenever:

- a BE phase is frozen
- a domain adds/removes runtime API
- repository/business/validation/policy/transaction coverage changes
- schema.prisma changes
- a domain changes classification

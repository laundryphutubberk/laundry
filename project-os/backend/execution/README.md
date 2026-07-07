# BE-OS Execution System

Status: Standard
Scope: Backend Execution Packages
Owner: Backend Architecture

## Purpose

This folder contains execution packages for Backend Engineering from BE-01 to BE-10.

Execution packages allow multiple tasks, developers, or AI agents to work in parallel while following the same BE-OS standards.

---

## Execution Flow

```text
BE-OS Standards
  -> Execution Package
  -> Milestone
  -> Atomic Commit
  -> Implementation
  -> Verification
  -> Review
  -> Merge
  -> Freeze
```

---

## Package Rules

Every BE phase package must define:

- purpose
- scope
- prerequisites
- dependencies
- allowed files
- forbidden files
- parallel tasks
- milestones
- atomic commits
- definition of done
- review checklist
- merge contract
- freeze criteria

---

## Phase Index

- BE-01 Runtime Foundation
- BE-02 Repository Foundation
- BE-03 REST API Layer
- BE-04 Architecture Normalization
- BE-05 Business Layer
- BE-06 Validation
- BE-07 Policy and Domain Rules
- BE-08 Transaction and Consistency
- BE-09 Observability
- BE-10 Production Readiness

---

## Parallel Execution Rule

Parallel work is allowed only when packages do not share mutable ownership over the same files or contracts.

If two tasks need the same file, one must become the owner and the other must wait, coordinate, or split scope.

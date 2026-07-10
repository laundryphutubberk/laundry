# Structure-Aware Navigation Standard

Status: Active
Owner: Chief Architect
Project: laundryphutubberk/laundry

## Purpose

Guide AI agents to navigate the repository by responsibility, capability, module, and layer before using broad text search.

The objective is to reduce noisy discovery and prevent work outside the assigned boundary.

## Navigation Order

```text
Task
  -> Capability
  -> Responsibility Owner
  -> Module
  -> Layer
  -> Source File
  -> Callers / Dependencies
```

## Required Search Sequence

Before broad search, follow this order:

```text
1. Read BOOT-MANIFEST.md
2. Resolve responsibility and execution package
3. Read capability and dependency maps
4. Locate the target module
5. Trace the canonical layer path
6. Inspect imports and direct callers
7. Use broad text search only for unresolved references
```

## Backend Layer Trace

```text
Route
  -> Controller
  -> Service
  -> Business / Policy
  -> Repository
  -> Prisma
```

## Frontend Layer Trace

```text
Screen
  -> Workflow / ViewModel
  -> Store / Hook
  -> API Client
  -> Backend Contract
```

## Rules

- Do not start with repository-wide keyword search when the module and layer are known.
- Search from owner to dependency, not from random matching text.
- Confirm import direction before editing.
- Do not infer ownership from filename alone; verify through module index, route registry, or imports.
- Record unresolved ownership as a gap instead of guessing.
- Broad search results are discovery evidence, not authority.

## Navigation Report

For non-trivial tasks, report:

```text
Capability
Owner
Module
Entry file
Layer path
Direct dependencies
Affected contracts
Unresolved references
```

## Maintenance Rule

Update this standard when module structure or canonical layer direction changes.

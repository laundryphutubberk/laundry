# Project OS Architecture

Status: Active
Owner: Chief Architect
Project: `laundryphutubberk/laundry`

## Purpose

Defines the architecture of Project OS itself.

Project OS separates preparation, execution, validation, responsibility, and boot resolution.

## Architecture

```text
Project Constitution
  -> Knowledge Base
  -> Responsibility Registry
  -> Boot Manifest
  -> Boot Resolver
  -> Responsibility Boot
  -> Execution Package
  -> Capability Gates
  -> Freeze / Handoff
```

## Core Layers

| Layer | Purpose |
|---|---|
| Constitution | Defines authority and project governance |
| Knowledge Base | Stores source-of-truth documents |
| Responsibility Registry | Defines who owns what context |
| Boot Manifest | Single entry point for all tasks |
| Boot Resolver | Chooses minimum boot path |
| Responsibility Boot | Loads role-specific context |
| Execution Package | Defines phase/task scope |
| Capability Gates | Defines readiness by capability |
| Freeze / Handoff | Records completion and transfer of responsibility |

## Preparation vs Execution

Project OS separates design preparation from implementation execution.

```text
Preparation
  Business Blueprint
  Domain Model Package
  Frontend Design Package

Execution
  Backend Execution
  Frontend Execution

Validation
  QA
  Release
```

## Symmetric Architecture

Backend and Frontend should follow equivalent preparation and execution patterns.

| Backend | Frontend |
|---|---|
| Domain Model Package | Frontend Design Package |
| Backend Structure Blueprint | Frontend Structure Blueprint |
| Backend Capability Matrix | Frontend Capability Matrix |
| Backend Handoff | Frontend Handoff |
| Backend AI Task Contracts | Frontend AI Task Contracts |
| BE Execution Packages | FE Execution Packages |

## Responsibility-Centric Principle

Project OS is responsibility-centric, not document-centric.

A task should load only the knowledge needed for its role and execution scope.

## Maintenance Rule

Update this architecture when Project OS boot, responsibility, preparation, execution, or gate structure changes.

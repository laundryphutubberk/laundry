# Resorts Feature

Status: FE-01 Skeleton
Owner: Frontend Architecture
Reference: Scanner Architecture

## Purpose

Own resort management and resort-scoped frontend views.

## Source of Truth

- Business Blueprint
- Prisma Resort model
- Backend Resort API contract when available

## Runtime

Resort Workspace must always be isolated by actor.resortId.

## Forbidden

Do not let Resort Workspace see other resorts' data.

# Inventory Feature

Status: FE-01 Skeleton
Owner: Frontend Architecture
Reference: Scanner Architecture

## Purpose

Own linen inventory visibility, inventory summary views, and movement history views.

## Source of Truth

- Business Blueprint
- Prisma LinenInventorySummary and LinenMovement models
- Backend Inventory API contract when available

## Runtime

Inventory is calculated from Work and Movement History. It is not a direct manual input surface.

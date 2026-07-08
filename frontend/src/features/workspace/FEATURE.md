# Workspace Feature

Status: FE-01 Skeleton
Owner: Frontend Architecture
Reference: Scanner Architecture

## Purpose

Own workspace boundary, workspace runtime, and workspace-level frontend behavior.

## Source of Truth

- Business Blueprint Workspace Model
- Prisma User.workspaceType and User.resortId
- Backend actor contract

## Runtime

Workspace Isolation is a core frontend boundary. Laundry Workspace and Resort Workspace must not leak data or UI responsibility.

## Forbidden

Do not implement workspace isolation as scattered checks inside visual components.

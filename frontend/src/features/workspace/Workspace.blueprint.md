# Workspace Blueprint

Status: ACTIVE
Phase: FW-06-A

## Purpose
Own workspace boundary, workspace runtime, and workspace-level frontend behavior.

## User Goals
- Enter the correct workspace experience
- Prevent data leakage across resorts
- Keep Laundry Workspace and Resort Workspace behavior clear
- Provide shared workspace context to routes and layouts

## Business Rule
Workspace Isolation is mandatory. Resort Workspace must always be scoped by actor.resortId.

## Primary Screens
- Workspace Entry
- Laundry Workspace Shell
- Resort Workspace Shell
- Workspace Boundary / Guard surface

## Runtime Ownership
- Workspace boundary calculation
- Workspace visibility rules
- Workspace access policies

## State Ownership
- Actor workspace context
- Workspace UI state
- Selected workspace boundary state when applicable

## API Mapping
- Actor/current user contract
- Workspace-aware request context
- Workspace permissions when backend contract is available

## UI Component Plan
- WorkspaceBoundary
- WorkspaceRuntimeHost
- LaundryWorkspaceLayout
- ResortWorkspaceLayout

## Integration Plan
Workspace feature provides the boundary for routes, layouts, dashboard, and feature visibility. It must not depend on domain feature internals.

## Quality Gate
Workspace leakage is a release blocker.

## Regression Lock Criteria
Route visibility, layout selection, and workspace data boundary are verified for Laundry and Resort users.

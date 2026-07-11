# Project OS V2

Status: DRAFT
Version: 0.1.0

Project OS V2 is a portable operating system for collaborative software development between a human product owner and an AI engineering partner.

Start every session at `BOOT.md`.

## Goals

- Turn ideas into approved business blueprints.
- Trace domain and data design back to business decisions.
- Design backend, frontend, and verification as one system.
- Deliver one end-to-end business flow at a time.
- Separate proposals, approved truth, implementation, and verified evidence.
- Preserve a consistent engineering standard across projects.

## Portability

`kernel/`, `templates/`, and `tooling/` are portable.
`project/` and `execution/` belong to the current project and must be initialized for each new project.

## V1 Safety

The existing `project-os/` is a read-only legacy reference during the V2 pilot. V2 does not replace V1 until an explicit cutover decision is approved.

## Integrity Check

Requires Node.js 18 or newer and no third-party packages.

```text
npm run verify
```

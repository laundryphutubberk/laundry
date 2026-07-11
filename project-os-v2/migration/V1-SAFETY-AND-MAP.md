# V1 Safety and Migration Map

Status: DRAFT

## Safety Contract

- `../project-os/` remains unchanged and readable.
- No V1 file is moved, renamed, deleted, or rewritten by the V2 foundation task.
- V2 is non-authoritative during the pilot.
- Conflicts are recorded; they are not silently resolved.
- Cutover requires explicit approval and evidence.

## Classification

Every V1 source will be classified as:

- `CANONICAL_PROJECT_TRUTH`
- `PORTABLE_STANDARD_CANDIDATE`
- `PROJECT_SPECIFIC`
- `EXECUTION_STATE`
- `EVIDENCE`
- `TEMPLATE`
- `HISTORICAL`
- `DUPLICATE`
- `CONFLICTED`
- `SUPERSEDED`

## Initial Mapping

| V1 area | V2 destination | Initial classification |
|---|---|---|
| Core boot/governance | `kernel/` after review | PORTABLE_STANDARD_CANDIDATE |
| Business Blueprint | `project/business/` | CANONICAL_PROJECT_TRUTH |
| Domain model and Prisma design | `project/domain/` | CANONICAL_PROJECT_TRUTH |
| Backend/Frontend standards | `kernel/engineering/` after normalization | MIXED |
| Feature tasks | `project/flows/` | PROJECT_SPECIFIC |
| State locks/checkpoints | `execution/` | EXECUTION_STATE |
| Verification reports | `execution/evidence/` | EVIDENCE |
| Templates and TODO placeholders | `templates/` only if retained | TEMPLATE |
| ZIP/raw conversation notes | remain in V1 | HISTORICAL |

## Cutover Criteria

- portable kernel reviewed;
- project profile separates Laundry truth from reusable standards;
- state and document schemas validated;
- one real flow completed through V2;
- V1-to-V2 traceability reviewed;
- boot test succeeds in a clean project copy;
- explicit Chief Architect approval recorded.

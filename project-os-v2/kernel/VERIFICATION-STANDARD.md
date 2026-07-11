# Verification and Evidence Standard

Status: DRAFT

## Evidence Levels

- `STATIC`: structure, imports, schema, contracts, or compilation.
- `UNIT`: isolated logic or policy behavior.
- `INTEGRATION`: multiple layers, database, or provider boundary.
- `RUNTIME`: application boot and observed runtime behavior.
- `SMOKE`: critical endpoint, screen, or workflow.
- `SECURITY`: authorization, isolation, masking, or protection.
- `REGRESSION`: previously supported behavior remains valid.
- `COMMIT`: reviewed repository state and exact revision.

## Evidence Record

Every PASS record must contain:

- claim identifier and statement;
- evidence level;
- command or observed action;
- result and relevant output;
- artifact path;
- source revision or working-tree state;
- timestamp;
- known limitations.

## Gate Rules

- Never report an unexecuted command as PASS.
- Never convert a missing script into PASS.
- Keep design review, source inspection, and runtime proof distinct.
- Mark unavailable verification as `NOT_EXECUTED` or `MISSING_CAPABILITY` with impact.
- Review the final diff and unrelated local changes before handoff.
- A completed flow requires all mandatory claims or an approved, recorded exception.

## Proportional Verification

Verification depth follows risk. Schema, authorization, financial, destructive, concurrent, migration, and public-contract changes require stronger integration and negative-case evidence than isolated presentation changes.

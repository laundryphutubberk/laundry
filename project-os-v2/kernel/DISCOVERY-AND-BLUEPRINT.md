# Discovery and Blueprint Standard

Status: DRAFT

## Discovery Inputs

- idea or problem;
- actors and operating environment;
- current workflow;
- pain points and risks;
- desired outcome;
- constraints and non-goals.

## Required Separation

Record information as one of:

- `FACT`: confirmed real-world truth;
- `ASSUMPTION`: believed but unconfirmed;
- `QUESTION`: unresolved and design-relevant;
- `PROPOSAL`: candidate solution;
- `DECISION`: explicitly approved direction.

## Business Blueprint Minimum

An approvable blueprint defines:

- purpose and success outcome;
- actors and responsibilities;
- main flow;
- exception flows;
- business rules and invariants;
- permissions and visibility;
- operational source of truth;
- lifecycle and done state;
- audit requirements;
- non-goals and open decisions.

The Business Blueprint must remain technology-neutral unless a technology is itself a business constraint.

## Approval Gate

Do not turn unresolved assumptions into schema or API commitments. Approval means the human confirms that the blueprint represents the intended operation, not that every implementation detail is frozen forever.

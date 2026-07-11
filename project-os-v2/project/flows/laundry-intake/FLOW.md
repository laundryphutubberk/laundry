# Laundry Intake and Work Creation

Document Status: APPROVED
Work Status: COMPLETED

## Outcome

Create a trustworthy Laundry Work for one Resort, receive its initial bags without partial state, and establish the authenticated ownership and audit context used by every downstream operational flow.

## Proposed Boundary

```text
Select an active Resort
  -> create Laundry Work
  -> generate stable Work number
  -> optionally receive initial bags
  -> persist Work/bag status consistently
  -> open Work Detail at the correct next action
```

This flow stops before opening bags and counting linen. Those belong to the next operational flow.

## Business Sources

- V1 Business Blueprint: Laundry Work is the operational center; Bag is the intake unit; Work Detail is the main operation screen.
- V1 Operational Workflow: Laundry Owner, Manager, or authorized Staff creates Work and records received bags.
- Resort Workspace is scoped to its own Resort and is described primarily as visibility/read-only in the Blueprint.

## Confirmed Rules

- Work belongs to exactly one active Resort.
- Backend generates a Work number when none is supplied.
- Real bags are child records, not inventory units.
- Work begins as Draft or a specifically approved received-ready state.
- Resort scope must derive from authenticated context.
- Work and initial bags must not produce false local success or unexplained partial completion.

## Main Flow Candidate

1. Laundry actor chooses an existing active Resort.
2. Actor supplies optional received date, initial bag count, and note.
3. Backend creates the Work and generated Work number.
4. If initial bags are requested, the system creates deterministic bag numbers.
5. Work status and bag count reflect persisted child records.
6. UI navigates to Work Detail only after the accepted operation completes.

## Exception Candidates

- inactive or missing Resort;
- duplicate/custom Work number;
- concurrent generated Work number;
- one of several initial bag creates fails;
- duplicate bag number;
- request is retried after timeout;
- unauthorized Workspace or role;
- Resort actor attempts a status transition;
- client-supplied audit identity differs from authenticated actor.

## Completed State

The frontend submits one intake command. The backend creates the Work, deterministic initial Bags, summary count, and first status log atomically. Resort actors remain read-only for internal operational transitions, audit identity derives from the authenticated actor, and automated plus human browser verification passed.

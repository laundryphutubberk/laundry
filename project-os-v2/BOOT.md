# Project OS V2 Boot Contract

Status: ACTIVE
Owner: Project Owner / Chief Architect

## Single Entry Rule

Every new or resumed session starts here.

## Boot Sequence

1. Read `kernel/COLLABORATION-PROTOCOL.md`.
2. Read `kernel/CODEX-PROJECT-OS-COLLABORATION-MODEL.md`.
3. Read `kernel/SOURCE-OF-TRUTH.md`.
4. Read the engineering, security, and verification standards required by the current stage.
5. Read `project/PROJECT-PROFILE.md`.
6. Read `execution/STATE.json`.
7. If the project is uninitialized, enter Discovery.
8. If business truth is not approved, continue Blueprint work.
9. If domain/data design is not approved, continue Domain Design.
10. If architecture is ready, resolve the active business flow.
11. Read only the project sources and contracts required by that flow.
12. Run `npm run verify` from this directory before claiming Project OS integrity.
13. Verify implementation evidence before claiming flow completion.

## Operating Rule

Design broadly enough to protect the whole system. Implement narrowly enough to finish and verify one business flow at a time.

After blueprint and architecture approval, use Codex as the primary broad implementation engine, Human operational testing as the reality gate, specialist Tasks as evidence-driven completion agents, and Project OS V2 as the audit/elevation authority.

## Stop Conditions

Stop for an explicit human decision when work changes:

- approved business meaning or workflow;
- domain ownership or aggregate boundary;
- schema or destructive migration behavior;
- API or shared contract;
- authentication, authorization, tenancy, or workspace isolation;
- technology baseline with material cost or operational impact;
- irreversible external state;
- an accepted architecture decision.

## Truth Rule

Conversation is context, not durable project truth. Approved repository documents, source state, observed Human operational evidence, and verified implementation evidence are authoritative according to `kernel/SOURCE-OF-TRUTH.md`.

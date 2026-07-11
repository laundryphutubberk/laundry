# Change Control

Status: DRAFT

## Change Classes

- Business change
- Domain/data change
- Contract change
- Architecture change
- Implementation change
- Verification/evidence change

Higher-level changes must flow down to affected lower-level sources. Lower-level implementation must not silently rewrite higher-level intent.

## ADR Triggers

Use an ADR for a durable decision involving major technology, aggregate boundaries, API strategy, permission/tenancy model, consistency strategy, deployment architecture, or a material trade-off that future contributors must understand.

## Safe Change Procedure

1. Inspect current truth and local changes.
2. Name the change class and affected sources.
3. Identify decisions and stop conditions.
4. Implement only the approved scope.
5. Verify relevant behavior and regression.
6. Review the final diff.
7. Update state/evidence without rewriting history.

# Evidence Graph Standard

Status: Active
Owner: Auditor / QA Architect
Project: laundryphutubberk/laundry

## Purpose

Make every verification and freeze claim traceable to observed evidence.

Design intent, planned architecture, and implementation truth must remain separate.

## Evidence Principle

```text
A status claim is valid only when it points to evidence.
```

## Evidence Types

| Evidence | Meaning |
|---|---|
| STATIC | Structure, import, schema, or contract verification |
| UNIT | Isolated behavior verification |
| INTEGRATION | Multi-layer or database verification |
| RUNTIME | Application boot or runtime behavior |
| SMOKE | Critical endpoint, screen, or workflow check |
| REGRESSION | Previously working capability remains intact |
| DATABASE | Migration, relation, constraint, or health verification |
| SECURITY | Authorization, isolation, masking, or protection verification |
| COMMIT | Git state and commit verification |

## Evidence Graph Shape

```text
Capability / Task
  -> Claim
  -> Verification command or observed action
  -> Result
  -> Artifact / log / commit
  -> Gate conclusion
```

## Example

```text
BE-09 Observability
  -> Claim: request completion logs work
  -> Runtime test executes HTTP request
  -> Event observed: http.request.completed
  -> Verification report records output
  -> Observability Gate: PASS
```

## Freeze Evidence Rule

Freeze reports must use only terms supported by evidence:

```text
Verified
Observed
Confirmed
Measured
Implemented
Not Implemented
Not Applicable
```

Freeze reports must not present Target, Planned, Recommended, or Expected capabilities as implemented.

## Required Evidence Record

```yaml
claim_id: BE-09-LOG-001
claim: request completion event is emitted
status: pass
evidence_type: RUNTIME
command_or_action: GET health endpoint during local runtime
observed_result: http.request.completed event emitted
artifact: verification report or exact log excerpt
commit: optional verified commit SHA
verified_at: ISO-8601 timestamp
```

## Gate Rule

A gate may pass only when all required claims have evidence or are explicitly marked Not Applicable with a reason.

Missing commands, missing scripts, or unexecuted tests must be reported as MISSING_CAPABILITY or NOT_EXECUTED, never PASS.

## Maintenance Rule

Update this standard when evidence categories, gate requirements, or freeze reporting rules change.
